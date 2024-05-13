import crypto from 'crypto';

import {
  BadRequestError,
  IAuthDocument,
  IEmailMessageDetails,
  uploads,
  firstLetterUppercase,
  lowerCase
} from '@yuangao0317/ms-rrts-at-shared-common';
import { signupSchema } from '@auth/schemas/signup';
import { createAuthUser, getUserByUsernameOrEmail, signToken, updateProfilePicture } from '@auth/services/auth.service';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import { config } from '@auth/config';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';

export async function create(req: Request, res: Response): Promise<void> {
  const errorMsgComingFrom = 'Controller Signup create() method error';
  const { error } = await Promise.resolve(signupSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, errorMsgComingFrom);
  }

  const { username, email, password, country, profilePicture } = req.body;
  const checkIfUserExist: IAuthDocument | undefined = await getUserByUsernameOrEmail(username, email);
  if (checkIfUserExist) {
    throw new BadRequestError('Invalid credentials. Email or Username', errorMsgComingFrom);
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  const userData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    password,
    country,
    // profilePublicId,
    // profilePicture: uploadResult?.secure_url,
    emailVerificationToken: randomCharacters
  };
  const result: IAuthDocument = (await createAuthUser(userData)) as IAuthDocument;
  if (result?.id) {
    const profilePublicId = uuidV4();
    const uploadResult: UploadApiResponse = (await uploads(profilePicture, `${profilePublicId}`, true, true)) as UploadApiResponse;
    if (!uploadResult?.public_id) {
      throw new BadRequestError('File upload error. Please try again.', errorMsgComingFrom);
    }
    await updateProfilePicture(result.id, profilePublicId, profilePicture);

    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${userData.emailVerificationToken}`;
    const messageDetails: IEmailMessageDetails = {
      receiverEmail: result.email,
      verifyLink: verificationLink,
      template: 'verifyEmail'
    };
    await publishDirectMessage(
      authChannel,
      'ms-auth-notification-email-exchange',
      'auth-email',
      JSON.stringify(messageDetails),
      'Verify email message has been sent to Notification Service.'
    );
    const userJWT: string = signToken(result.id, result.email!, result.username!);
    res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
  } else {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'User creation failed.' });
  }
}