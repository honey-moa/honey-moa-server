import { Inject, Injectable } from '@nestjs/common';

import {
  DeleteObjectsCommand,
  ObjectIdentifier,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { S3_CLIENT_TOKEN } from '@libs/s3/tokens/di.token';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';

@Injectable()
export class S3Service {
  constructor(
    @Inject(S3_CLIENT_TOKEN)
    private readonly s3Client: S3Client,
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}

  async uploadFileToS3(
    file: { buffer: Buffer; mimetype: string },
    filename: string,
  ) {
    const command = new PutObjectCommand({
      Bucket: this.appConfigService.get<string>(ENV_KEY.AWS_S3_BUCKET),
      Key: filename,
      Body: file.buffer,
      ACL: 'public-read',
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const s3Address = this.appConfigService.get<string>(
      ENV_KEY.AWS_S3_BUCKET_URL,
    );

    return `${s3Address}/${filename}`;
  }

  async deleteFilesFromS3(filenames: string[]) {
    const objects: ObjectIdentifier[] = filenames.map((filename) => {
      return {
        Key: filename,
      };
    });

    const command = new DeleteObjectsCommand({
      Bucket: this.appConfigService.get<string>(ENV_KEY.AWS_S3_BUCKET),
      Delete: {
        Objects: [...objects],
      },
    });

    await this.s3Client.send(command);
  }
}
