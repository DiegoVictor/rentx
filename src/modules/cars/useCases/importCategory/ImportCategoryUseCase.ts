import fs from 'fs';
import csv from 'csv-parse';
import { inject, injectable } from 'tsyringe';

import { ICategoriesRepository } from '@modules/cars/repositories/contracts/ICategoriesRepository';

interface IImportCategory {
  name: string;
  description: string;
}
@injectable()
class ImportCategoryUseCase {
  constructor(
    @inject('CategoriesRepository')
    private categoryRepository: ICategoriesRepository
  ) {}

  loadCategories(file: Express.Multer.File): Promise<IImportCategory[]> {
    return new Promise((resolve, reject) => {
      const categories: IImportCategory[] = [];

      const stream = fs.createReadStream(file.path);
      const csvParser = csv();

      stream.pipe(csvParser);

      csvParser
        .on('data', async ([name, description]) => {
          categories.push({ name, description });
        })
        .on('end', async () => {
          await fs.promises.unlink(file.path);
          resolve(categories);
        })
        .on('error', async (err) => {
          await fs.promises.unlink(file.path);
          reject(err);
        });
    });
  }

  async execute(file: Express.Multer.File): Promise<void> {
    const categories = await this.loadCategories(file);

    await Promise.all(
      categories.map(({ name, description }) =>
        this.categoryRepository.findByName(name).then((category) => {
          if (!category) {
            return this.categoryRepository.create({ name, description });
          }
        })
      )
    );
  }
}

export default ImportCategoryUseCase;
