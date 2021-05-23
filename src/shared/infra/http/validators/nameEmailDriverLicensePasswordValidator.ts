import { celebrate, Joi, Segments } from 'celebrate';

export const nameEmailDriverLicensePasswordValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().required(),
    driver_license: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});
