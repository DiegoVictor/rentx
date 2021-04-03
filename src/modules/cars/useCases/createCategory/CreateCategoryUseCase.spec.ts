import 'reflect-metadata';
import CreateCategoryUseCase from './CreateCategoryUseCase';
import CategoriesRepositoryInMemory from '@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory';
import AppError from '@shared/errors/AppError';

describe('Create Category', () => {
  let createCategoryUseCase: CreateCategoryUseCase;
  let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;

  beforeEach(() => {
    categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
    createCategoryUseCase = new CreateCategoryUseCase(
      categoriesRepositoryInMemory
    );
  });

  it('should be able to create a new category', async () => {
    const category = {
      name: 'Category A',
      description: 'Description A',
    };

    await createCategoryUseCase.execute(category);

    const createdCategory = await categoriesRepositoryInMemory.findByName(
      category.name
    );

    expect(createdCategory).toHaveProperty('id');
    expect(createdCategory).toMatchObject(category);
  });

  it('should not be able to create a new category with duplicated name', async () => {
    const category = {
      name: 'Category A',
      description: 'Description A',
    };

    await createCategoryUseCase.execute(category);

    expect(async () => {
      await createCategoryUseCase.execute(category);
    }).rejects.toBeInstanceOf(AppError);
  });
});
