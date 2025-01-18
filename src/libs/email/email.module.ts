import { Module } from '@nestjs/common';
import { EMAIL_SERVICE_DI_TOKEN } from '@libs/email/constants/email-service.di-token';
import { EmailService } from '@libs/email/services/email.service';

@Module({
  providers: [{ provide: EMAIL_SERVICE_DI_TOKEN, useClass: EmailService }],
  exports: [EMAIL_SERVICE_DI_TOKEN],
})
export class EmailModule {}
