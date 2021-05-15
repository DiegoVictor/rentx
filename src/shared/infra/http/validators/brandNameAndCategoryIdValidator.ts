import { celebrate, Joi, Segments } from 'celebrate';

export const brandNameAndCategoryIdValidator = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    name: Joi.string().optional(),
    brand: Joi.string().optional(),
    category_id: Joi.string().uuid().optional(),
  }),
});
