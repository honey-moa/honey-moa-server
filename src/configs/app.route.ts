// Root
const userRoot = 'users';
const authRoot = 'auth';
const blogRoot = 'blogs';
const blogPostRoot = 'blog-posts';
const blogPostCommentRoot = 'blog-post-comments';
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
    patchUpdate: `${userRoot}/me`,
  },

  userConnection: {
    root: `${userRoot}/me/${userConnectionRoot}`,
    create: `${userRoot}/me/${userConnectionRoot}`,
    findConnections: `${userRoot}/me/${userConnectionRoot}`,
    update: `${userRoot}/me/${userConnectionRoot}/:id`,
  },

  blog: {
    root: blogRoot,
    create: `${blogRoot}`,
    findOneByUserId: `${userRoot}/:id/blog`,
    patchUpdate: `${blogRoot}/:id`,
  },

  blogPost: {
    /**
     * 블로그의 ID가 필요한 요청
     */
    root: `${blogRoot}/:id/${blogPostRoot}`,
    create: `${blogRoot}/:id/${blogPostRoot}`,
    findBlogPostsFromBlog: `${blogRoot}/:id/${blogPostRoot}`,
    patchUpdate: `${blogRoot}/:id/${blogPostRoot}/:blogPostId`,
    delete: `${blogRoot}/:id/${blogPostRoot}/:blogPostId`,

    /**
     * 블로그의 ID가 필요하지 않은 요청
     * 따로 만든 이유는 대표적으로 게시글 단일 조회의 경우 블로그가 아닌 다른 경로(커뮤니티 등)를 통할 수도 있음
     */
    findOne: `${blogPostRoot}/:id`,
    // 커뮤니티에서 공개된 게시글 조회할 때 사용
    findPublicBlogPosts: `${blogPostRoot}`,
  },

  blogPostComment: {
    root: `${blogPostRoot}/:id/${blogPostCommentRoot}`,
    create: `${blogPostRoot}/:id/${blogPostCommentRoot}`,
    findBlogPostComments: `${blogPostRoot}/:id/${blogPostCommentRoot}`,
  },

  chatRoom: {
    root: chatRoomRoot,
    create: `${chatRoomRoot}`,
    findMyChatRoom: `${userRoot}/me/chat-room`,
  },

  chatMessage: {
    root: `${chatRoomRoot}/:id/${chatMessageRoot}`,
  },

  auth: {
    root: authRoot,
    signIn: `${authRoot}/sign-in`,
    signUp: `${authRoot}/sign-up`,
    refresh: `${authRoot}/reissue/access-token`,
  },

  attachment: {
    root: attachmentRoot,
    create: attachmentRoot,
  },
} as const;
