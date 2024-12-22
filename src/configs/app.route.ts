// Root
const authRoot = 'auth';
const userRoot = 'users';
const postRoot = 'posts';
const tokenRoot = 'tokens';

// Api Versions
const v1 = 'v1';

export const routesV1 = {
  version: v1,

  auth: {
    root: authRoot,
    signUp: `${authRoot}/sign-up`,
    signIn: `${authRoot}/sign-in`,
  },

  user: {
    root: userRoot,
    create: userRoot,
    findOne: `${userRoot}/:id`,
    verifyEmail: `${userRoot}/:id/is-email-verified`,
  } as const,

  token: {
    root: tokenRoot,
    generate: tokenRoot,
  },

  post: {
    root: postRoot,
  } as const,
} as const;
