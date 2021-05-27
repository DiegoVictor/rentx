import Category from '@modules/cars/infra/typeorm/entities/Category';
import CategoriesRepositoryInMemory from '@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import factory from '../../../../../tests/utils/factory';
import CreateCategoryUseCase from './CreateCategoryUseCase';

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
    const category = await factory.attrs<Category>('Category');

    await createCategoryUseCase.execute(category);

    const createdCategory = await categoriesRepositoryInMemory.findByName(
      category.name
    );

    expect(createdCategory).toHaveProperty('id');
    expect(createdCategory).toMatchObject(category);
  });

  it('should not be able to create a new category with duplicated name', async () => {
    const category = await factory.attrs<Category>('Category');

    await createCategoryUseCase.execute(category);

    await expect(createCategoryUseCase.execute(category)).rejects.toEqual(
      new AppError('Category already exists', 440)
    );
  });
});
