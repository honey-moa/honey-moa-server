// Root
const userRoot = 'users';
const postRoot = 'posts';
const authRoot = 'auth';

// Api Versions
const v1 = 'v1';

export const routesV1 = {
  version: v1,

  user: {
    root: userRoot,
    create: userRoot,
    findUsers: `${userRoot}`,
    verifyEmail: `${userRoot}/:id/is-email-verified`,
    updatePassword: `${userRoot}/:id/password`,
    sendVerificationEmail: `${userRoot}/me/user-verify-tokens/email`,
    sendPasswordChangeVerificationEmail: `${userRoot}/:email/user-verify-tokens/password-change`,

    userConnection: {
      root: `${userRoot}/me/connections`,
      create: `${userRoot}/me/connections`,
      findConnections: `${userRoot}/me/connections`,
      findOneConnection: `${userRoot}/me/connections/:id`,
      update: `${userRoot}/me/connections/:id`,

      blog: {
        root: `${userRoot}/me/connections/:id/blogs`,
        create: `${userRoot}/me/connections/:id/blogs`,
      },

      chatRoom: {
        root: `${userRoot}/me/connections/:id/chat-rooms`,
        create: `${userRoot}/me/connections/:id/chat-rooms`,
      },
    } as const,
  } as const,

  auth: {
    root: authRoot,
    signIn: `${authRoot}/sign-in`,
    signUp: `${authRoot}/sign-up`,
  },

  post: {
    root: postRoot,
  } as const,
} as const;
