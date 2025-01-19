export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const UserLoginType = {
  EMAIL: 'EMAIL',
} as const;

export const UserMbti = {
  ISTJ: 'ISTJ',
  ISFJ: 'ISFJ',
  INFJ: 'INFJ',
  INTJ: 'INTJ',
  ISTP: 'ISTP',
  ISFP: 'ISFP',
  INFP: 'INFP',
  INTP: 'INTP',
  ESTP: 'ESTP',
  ESFP: 'ESFP',
  ENFP: 'ENFP',
  ENTP: 'ENTP',
  ESTJ: 'ESTJ',
  ESFJ: 'ESFJ',
  ENFJ: 'ENFJ',
  ENTJ: 'ENTJ',
} as const;

export const UserVerifyTokenType = {
  EMAIL: 'EMAIL',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
} as const;

export const USER_PASSWORD_REGEXP =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

export const USER_EMAIL_REGEXP =
  /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;