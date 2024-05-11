import { read } from '@auth/controllers/signin';
import { create } from '@auth/controllers/signup';
import express, { Router } from 'express';

const router: Router = express.Router();

export function authRoutes(): Router {
  router.post('/signup', create);
    router.post('/signin', read);
  //   router.put('/verify-email', update);
  //   router.put('/verify-otp/:otp', updateOTP);

  return router;
}
