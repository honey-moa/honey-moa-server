export type BlogPostContents =
  | string
  | number
  | boolean
  | { [Key in string]?: BlogPostContents }
  | Array<BlogPostContents>
  | null;
