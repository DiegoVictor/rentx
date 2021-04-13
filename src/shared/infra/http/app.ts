import 'reflect-metadata';
import 'dotenv/config';
import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import '@shared/container';
import createConnection from '@shared/infra/typeorm';
import routes from '@shared/infra/http/routes';
import AppError from '@shared/errors/AppError';
createConnection(process.env.DB_HOST);
const app = express();
app.use(express.json());
app.use('/avatar', express.static(`${upload.tmpFolder}/avatar`));
app.use('/cars', express.static(`${upload.tmpFolder}/cars`));

app.use('/v1', routes);

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
