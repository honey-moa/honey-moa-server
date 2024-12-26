const SERVER = {
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  DOMAIN: 'DOMAIN',
} as const;

const AUTH = {
  HASH_ROUND: 'HASH_ROUND',
} as const;

const JWT = {
  JWT_SECRET: 'JWT_SECRET',
} as const;

const EMAIL = {
  EMAIL_HOST: 'EMAIL_HOST',
  EMAIL_PORT: 'EMAIL_PORT',
  EMAIL_AUTH_USER: 'EMAIL_AUTH_USER',
  EMAIL_AUTH_PASSWORD: 'EMAIL_AUTH_PASSWORD',
} as const;

const DATABASE = {
  DATABASE_URL: 'DATABASE_URL',
} as const;

/**
 * 각 주제에 맞게 묶어서 export 하지 않는 변수로 생성하고
 * ENV_KEY 객체에 spread
 */
export const ENV_KEY = {
  ...SERVER,
  ...AUTH,
  ...JWT,
  ...EMAIL,
  ...DATABASE,
} as const;
