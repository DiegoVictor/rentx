import 'reflect-metadata';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import createConnection from '@shared/infra/typeorm';
createConnection(process.env.DB_HOST);
const app = express();
export default app;
