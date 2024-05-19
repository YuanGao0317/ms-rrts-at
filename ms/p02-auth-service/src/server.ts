import http from 'http';

import { Logger } from 'winston';
import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@yuangao0317/ms-rrts-at-shared-common';
import { config } from '@auth/config';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection } from '@auth/elasticsearch';
import { appRoutes } from '@auth/routes';
import { createConnection } from '@auth/queues/message-broker';
import { Channel } from 'amqplib';

const SERVER_PORT = 4002;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServer', 'debug');

// for publish messages
export let authChannel: Channel;

export function start(app: Application): void {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startMessageQueues();
  startElasticSearch();

  authErrorHandler(app);
  startServer(app);
}

function securityMiddleware(app: Application): void {
  app.set('trust proxy', 1); // for API Gateway and Load Balancing
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      const jwtToken = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(jwtToken, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routesMiddleware(app: Application): void {
  appRoutes(app);
}

async function startMessageQueues(): Promise<void> {
  authChannel = (await createConnection()) as Channel;
}

function startElasticSearch(): void {
  checkConnection();
}

function authErrorHandler(app: Application): void {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof CustomError) {
      log.log('error', `AuthService CustomError: ${error.comingFrom}:`, error);
      res.status(error.statusCode).json(error.serializeErrors());
    } else {
      log.log('error', `AuthService Error: ${error.message}:`, error);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong in Authorization Service!'
      });
    }
    next();
  });
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Authentication Server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Authentication Server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'AuthService startServer() method error:', error);
  }
}
