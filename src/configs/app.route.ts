// Root
const authRoot = `auth`;
const userRoot = `users`;
const postRoot = `posts`;

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
    findOne: `${userRoot}/:id`,
  } as const,

  post: {
    root: postRoot,
  } as const,
} as const;
