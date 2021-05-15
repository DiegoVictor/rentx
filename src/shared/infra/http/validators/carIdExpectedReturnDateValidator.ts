import { celebrate, Joi, Segments } from 'celebrate';

export const carIdExpectedReturnDateValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    car_id: Joi.string().uuid().required(),
    expected_return_date: Joi.date().required(),
  }),
});
