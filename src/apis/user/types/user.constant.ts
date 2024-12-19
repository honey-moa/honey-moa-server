export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const UserLoginType = {
  EMAIL: 'email',
} as const;

export const USER_PASSWORD_REGEXP =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

export const USER_EMAIL_REGEXP =
  /^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/;
