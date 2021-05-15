import { celebrate, Joi, Segments } from 'celebrate';

export const nameAndDescriptionValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
  }),
});
