import multer from 'multer';
import { resolve } from 'path';
import crypto from 'crypto';

const tmpFolder = resolve(__dirname, '..', '..', 'tmp').toString();

export default {
  tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (request, file, callback) => {
      const hash = crypto.randomBytes(16).toString('hex');
      const fileName = `${hash}-${file.originalname}`;

      callback(null, fileName);
    },
  }),
};
