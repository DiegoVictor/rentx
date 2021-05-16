import fs from 'fs';
import { resolve } from 'path';

import IStorageProvider from '../contracts/IStorageProvider';
import upload from '@config/upload';

class LocalStorageProvider implements IStorageProvider {
  async save(file: string, folder: string): Promise<string> {
    await fs.promises.rename(
      resolve(upload.tmpFolder, file).toString(),
      resolve(`${upload.tmpFolder}/${folder}`, file).toString()
    );

    return file;
  }

  async delete(file: string, folder: string): Promise<void> {
    const filename = resolve(`${upload.tmpFolder}/${folder}`, file).toString();

    try {
      await fs.promises.stat(filename);
    } catch {
      return;
    }
    await fs.promises.unlink(filename);
  }
}

export default LocalStorageProvider;
