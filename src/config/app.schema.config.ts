import * as Joi from 'joi';

export default Joi.object({
  /* APP */
  PORT: Joi.number().required(),
  DEFAULT_LIMIT: Joi.number().required(),
  MAXIMUM_LIMIT: Joi.number().required(),

  /* DATABASE */
  DATABASE_HOST: Joi.required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.required(),
  DATABASE_PASSWORD: Joi.required(),
  DATABASE_NAME: Joi.required(),
  DATABASE_LOG: Joi.required(),
});
