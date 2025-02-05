// Root
const userRoot = 'users';
const authRoot = 'auth';
const blogRoot = 'blogs';
const blogPostRoot = 'blog-posts';
const chatRoomRoot = 'chat-rooms';
const chatMessageRoot = 'messages';
const userConnectionRoot = 'connections';
const attachmentRoot = 'attachments';

// Api Versions
const v1 = 'v1';

export const routesV1 = {
  version: v1,

  user: {
    root: userRoot,
    create: userRoot,
    findUsers: `${userRoot}`,
    findMe: `${userRoot}/me`,
    verifyEmail: `${userRoot}/:id/is-email-verified`,
    updatePassword: `${userRoot}/:id/password`,
    sendVerificationEmail: `${userRoot}/me/user-verify-tokens/email`,
    sendPasswordChangeVerificationEmail: `${userRoot}/:email/user-verify-tokens/password-change`,
  },

  userConnection: {
    root: `${userRoot}/me/${userConnectionRoot}`,
    create: `${userRoot}/me/${userConnectionRoot}`,
    findConnections: `${userRoot}/me/${userConnectionRoot}`,
    findOneConnection: `${userRoot}/me/${userConnectionRoot}/:id`,
    update: `${userRoot}/me/${userConnectionRoot}/:id`,
  },

  blog: {
    root: blogRoot,
    create: `${blogRoot}`,
  },

  blogPost: {
    root: `${blogRoot}/:id/${blogPostRoot}`,
    create: `${blogRoot}/:id/${blogPostRoot}`,
  },

  chatRoom: {
    root: chatRoomRoot,
    create: `${chatRoomRoot}`,
  },

  chatMessage: {
    root: `${chatRoomRoot}/:id/${chatMessageRoot}`,
  },

  auth: {
    root: authRoot,
    signIn: `${authRoot}/sign-in`,
    signUp: `${authRoot}/sign-up`,
    refresh: `${authRoot}/refresh-token`,
  },

  attachment: {
    root: attachmentRoot,
    create: attachmentRoot,
  },
} as const;
