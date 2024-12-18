const SERVER = {
  PORT: 'PORT',
  NODE_ENV: 'NODE_ENV',
  DOMAIN: 'DOMAIN',
} as const;

const CREDENTIAL = {
  HASH_ROUND: 'HASH_ROUND',
  JWT_SECRET: 'JWT_SECRET',
} as const;

/**
 * 각 주제에 맞게 묶어서 export 하지 않는 변수로 생성하고
 * ENV_KEY 객체에 spread
 */
export const ENV_KEY = {
  ...SERVER,
  ...CREDENTIAL,
} as const;
