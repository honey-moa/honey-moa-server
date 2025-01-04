// Root
const userRoot = 'users';
const postRoot = 'posts';
const tokenRoot = 'tokens';

// Api Versions
const v1 = 'v1';

export const routesV1 = {
  version: v1,

  user: {
    root: userRoot,
    create: userRoot,
    findOne: `${userRoot}/:id`,
    verifyEmail: `${userRoot}/:id/is-email-verified`,
    updatePassword: `${userRoot}/:id/password`,
    sendVerificationEmail: `${userRoot}/me/user-verify-tokens/email`,
    sendPasswordChangeVerificationEmail: `${userRoot}/:email/user-verify-tokens/password-change`,
  } as const,

  token: {
    root: tokenRoot,
    generate: tokenRoot,
  },

  post: {
    root: postRoot,
  } as const,
} as const;
