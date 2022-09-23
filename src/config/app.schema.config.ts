import * as Joi from 'joi';

export default Joi.object({
  /* APP */
  PORT: Joi.number().required(),
  DEFAULT_LIMIT: Joi.number().required(),
  MAXIMUM_LIMIT: Joi.number().required(),
  ACCESS_TOKEN_SECRET: Joi.required(),
  ACCESS_TOKEN_EXPIRATION: Joi.required(),
  REFRESH_TOKEN_SECRET: Joi.required(),
  REFRESH_TOKEN_EXPIRATION: Joi.required(),

  /* DATABASE */
  DATABASE_HOST: Joi.required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.required(),
  DATABASE_PASSWORD: Joi.required(),
  DATABASE_NAME: Joi.required(),
  DATABASE_LOG: Joi.required(),
});
