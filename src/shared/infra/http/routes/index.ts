import { Router } from 'express';

import categories from './categories';
import users from './users';
const app = Router();
app.use('/categories', categories);
app.use('/users', users);
export default app;
