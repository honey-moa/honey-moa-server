export interface S3ServicePort {
  uploadFileToS3(
    file: { buffer: Buffer; mimetype: string },
    filename: string,
  ): Promise<void>;

  deleteFileFromS3(filename: string): Promise<void>;
}
