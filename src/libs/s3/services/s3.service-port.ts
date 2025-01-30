export interface S3ServicePort {
  uploadFileToS3(
    file: { buffer: Buffer; mimetype: string },
    filename: string,
  ): Promise<string>;

  deleteFilesFromS3(filenames: string[]): Promise<void>;
}
