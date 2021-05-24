import path from 'path';
import fs from 'fs';
import faker from 'faker';

import CategoriesRepositoryInMemory from '@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory';
import ImportCategoryUseCase from './ImportCategoryUseCase';

describe('Import Category', () => {
  let importCategoryUseCase: ImportCategoryUseCase;
  let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;

  const csvFolder = path
    .resolve(__dirname, '..', '..', '..', '..', '..', 'tests', 'files')
    .toString();
  const samplePath = path.resolve(csvFolder, 'sample.csv');

  beforeAll(async () => {
    if (!(await fs.promises.stat(samplePath))) {
      await fs.promises.writeFile(
        samplePath,
        'SUV,Utilitário esportivo\nSedan,Automóvel de três volumes\nHatch,Carro curto'
      );
    }
  });

  beforeEach(() => {
    categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
    importCategoryUseCase = new ImportCategoryUseCase(
      categoriesRepositoryInMemory
    );
  });

  it('should be able to import categories', async () => {
    const fileName = faker.datatype.uuid();
    const csvPath = path.resolve(csvFolder, fileName + '.csv').toString();

    await fs.promises.copyFile(samplePath, csvPath);

    const file = await fs.promises.stat(csvPath);

    const arrayBuffer = [];
    const categories = [];

    await new Promise((resolve) => {
      fs.createReadStream(csvPath)
        .on('data', (chunk) => {
          arrayBuffer.push(chunk);

          const data = chunk.toString('utf8');
          data.split('\n').forEach((line) => {
            if (line.length > 0) {
              const [name, description] = line.replace('\r', '').split(',');
              categories.push({
                name,
                description,
              });
            }
          });
        })
        .on('end', resolve);
    });

    await importCategoryUseCase.execute({
      path: csvPath,
      fieldname: 'file',
      originalname: 'sample.csv',
      encoding: 'utf8',
      mimetype: 'text/csv',
      size: file.size,
      stream: fs.createReadStream(csvPath),
      destination: csvFolder,
      filename: 'sample.csv',
      buffer: Buffer.from(arrayBuffer),
    });

    const responses = await Promise.all(
      categories.map(({ name }) =>
        categoriesRepositoryInMemory.findByName(name)
      )
    );

    categories.forEach(({ name, description }) => {
      expect(responses).toContainEqual({
        id: expect.any(String),
        name,
        description,
      });
    });
  });

  it('should be able to import categories without duplicate', async () => {
    const fileName = faker.datatype.uuid();
    const csvPath = path.resolve(csvFolder, fileName + '.csv').toString();

    await fs.promises.copyFile(samplePath, csvPath);

    const file = await fs.promises.stat(csvPath);

    const arrayBuffer = [];
    const categories = [];

    await new Promise((resolve) => {
      fs.createReadStream(csvPath)
        .on('data', (chunk) => {
          arrayBuffer.push(chunk);

          const data = chunk.toString('utf8');
          data.split('\n').forEach((line) => {
            if (line.length > 0) {
              const [name, description] = line.replace('\r', '').split(',');
              categories.push({
                name,
                description,
              });
            }
          });
        })
        .on('end', resolve);
    });

    await categoriesRepositoryInMemory.create(categories.slice(0, 1).pop());

    await importCategoryUseCase.execute({
      path: csvPath,
      fieldname: 'file',
      originalname: 'sample.csv',
      encoding: 'utf8',
      mimetype: 'text/csv',
      size: file.size,
      stream: fs.createReadStream(csvPath),
      destination: csvFolder,
      filename: 'sample.csv',
      buffer: Buffer.from(arrayBuffer),
    });

    const responses = await Promise.all(
      categories.map(({ name }) =>
        categoriesRepositoryInMemory.findByName(name)
      )
    );

    categories.forEach(({ name, description }) => {
      expect(responses).toContainEqual({
        id: expect.any(String),
        name,
        description,
      });
    });
  });

  it('should not be able to import categories without valid csv', async () => {
    const fileName = faker.datatype.uuid();
    const csvPath = path.resolve(csvFolder, fileName + '.csv').toString();

    await fs.promises.writeFile(csvPath, '{ "name": "description" }');

    const file = await fs.promises.stat(csvPath);
    const arrayBuffer = [];

    await new Promise((resolve) => {
      fs.createReadStream(csvPath)
        .on('data', (chunk) => {
          arrayBuffer.push(chunk);
        })
        .on('end', resolve);
    });

    await expect(
      importCategoryUseCase.execute({
        path: csvPath,
        fieldname: 'file',
        originalname: 'sample.csv',
        encoding: 'utf8',
        mimetype: 'text/csv',
        size: file.size,
        stream: fs.createReadStream(csvPath),
        destination: csvFolder,
        filename: 'sample.csv',
        buffer: Buffer.from(arrayBuffer),
      })
    ).rejects.toThrowError();
  });
});
