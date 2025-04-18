import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';

import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  type ObjectIdentifier,
  PutObjectCommand,
  type S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import type { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import type { Key } from '@libs/core/app-config/types/app-config.type';
import type { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { S3_CLIENT_TOKEN } from '@libs/s3/tokens/di.token';

@Injectable()
export class S3Service implements S3ServicePort {
  private readonly logger = new Logger(S3Service.name);

  constructor(
    @Inject(S3_CLIENT_TOKEN)
    private readonly s3Client: S3Client,
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  async uploadFileToS3(
    file: { buffer: Buffer; mimeType: string },
    filename: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: this.appConfigService.get<string>(ENV_KEY.AWS_S3_BUCKET),
      Key: filename,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimeType,
    });

    await this.s3Client.send(command);

    const s3Address = this.appConfigService.get<string>(
      ENV_KEY.AWS_S3_BUCKET_URL,
    );

    return `${s3Address}/${filename}`;
  }

  async moveFiles(
    sourcePaths: string[],
    destinationDirectory: string,
    currentDirectory: string,
  ): Promise<{
    [path: string]:
      | {
          isExiting: true;
          movedPath: string;
          movedUrl: string;
        }
      | {
          isExiting: false;
        };
  }> {
    if (!sourcePaths.length) {
      return {};
    }

    const sourcePathInfosObject: {
      [path: string]:
        | {
            isExiting: true;
            movedPath: string;
            movedUrl: string;
          }
        | {
            isExiting: false;
          };
    } = {};

    // const deleteKeys: string[] = [];

    await Promise.all(
      /**
       * 파일에 대한 업로드가 실패했을 시에 게시글도 같이 생성 실패가 되어야 할 지를 고민해봐야 할듯
       */
      sourcePaths.map(async (source) => {
        const key = this.parseKeyFromPath(source, currentDirectory);

        try {
          const newPath = `${destinationDirectory}${key}`;

          const command = new CopyObjectCommand({
            Bucket: this.appConfigService.get<string>(ENV_KEY.AWS_S3_BUCKET),
            CopySource: `${this.appConfigService.get<string>(ENV_KEY.AWS_S3_BUCKET)}/${source}`,
            Key: newPath,
            ACL: 'public-read',
          });

          await this.s3Client.send(command);

          sourcePathInfosObject[source] = {
            isExiting: true,
            movedPath: newPath,
            movedUrl: `${this.appConfigService.get<string>(
              ENV_KEY.AWS_S3_BUCKET_URL,
            )}/${newPath}`,
          };

          // deleteKeys.push(source);
        } catch (err) {
          if (err instanceof S3ServiceException) {
            if (
              err.$fault === 'client' &&
              err.$metadata.httpStatusCode === HttpStatus.NOT_FOUND &&
              (err as any).Code === 'NoSuchKey'
            ) {
              sourcePathInfosObject[source] = {
                isExiting: false,
              };
            }
          }
        }
      }),
    );

    // await this.deleteFilesFromS3(deleteKeys);

    return sourcePathInfosObject;
  }

  async deleteFilesFromS3(filenames: string[]) {
    if (!filenames.length) {
      return;
    }

    const objects: ObjectIdentifier[] = filenames.map((filename) => {
      return {
        Key: filename,
      };
    });

    const command = new DeleteObjectsCommand({
      Bucket: this.appConfigService.get<string>(ENV_KEY.AWS_S3_BUCKET),
      Delete: {
        Objects: objects,
      },
    });

    await this.s3Client.send(command);
  }

  private parseKeyFromPath(path: string, directory: string) {
    const [, key] = path.split(directory);

    return key;
  }
}
