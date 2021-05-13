import 'reflect-metadata';
import 'dotenv/config';
import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import swagger from 'swagger-ui-express';
import cors from 'cors';
import helmet from 'helmet';
import { errors } from 'celebrate';

import '@shared/container';

import createConnection from '@shared/infra/typeorm';
import swaggerSetup from '../../../swagger.json';
import routes from '@shared/infra/http/routes';
import AppError from '@shared/errors/AppError';
import rateLimiter from '@shared/infra/http/middlewares/rateLimiter';
import upload from '@config/upload';

createConnection();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(rateLimiter);

app.use('/docs', swagger.serve, swagger.setup(swaggerSetup));
app.use('/avatar', express.static(`${upload.tmpFolder}/avatar`));
app.use('/cars', express.static(`${upload.tmpFolder}/cars`));

app.use('/v1', routes);

app.use(errors());
app.use(
  (err: Error, request: Request, response: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      return response.status(err.statusCode).json({
        message: err.message,
      });
    }

    return response.status(500).json({
      status: 'error',
      message: `Internal Server Error - ${err.message}`,
    });
  }
);

export default app;
