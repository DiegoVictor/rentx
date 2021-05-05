import { Router } from 'express';

import categories from './categories';
import specifications from './specifications';
import users from './users';
import authenticate from './authenticate';
import cars from './cars';
const app = Router();
app.use('/categories', categories);
app.use('/specifications', specifications);
app.use('/users', users);
app.use('/cars', cars);
app.use(authenticate);
export default app;
