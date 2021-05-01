import { container } from 'tsyringe';

import IStorageProvider from './contracts/IStorageProvider';
import LocalStorageProvider from './implementations/LocalStorageProvider';
import S3StorageProvider from './implementations/S3StorageProvider';

const storageProvider = {
  local: LocalStorageProvider,
  s3: S3StorageProvider,
};

container.registerSingleton<IStorageProvider>(
  'StorageProvider',
  storageProvider[process.env.STORAGE_DRIVER]
);
