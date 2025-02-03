export interface S3ServicePort {
  uploadFileToS3(
    file: { buffer: Buffer; mimetype: string },
    filename: string,
  ): Promise<string>;

  moveFiles(
    sourcePaths: string[],
    destinationDirectory: string,
    currentDirectory: string,
  ): Promise<{
    [x: string]:
      | {
          isExiting: true;
          movedPath: string;
          movedUrl: string;
        }
      | {
          isExiting: false;
        };
  }>;

  deleteFilesFromS3(filenames: string[]): Promise<void>;
}
