import { Inject, Injectable } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import nodemailer from 'nodemailer';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@src/libs/core/app-config/tokens/app-config.di-token';
import { AppConfigServicePort } from '@src/libs/core/app-config/services/app-config.service-port';
import { Key } from '@src/libs/core/app-config/types/app-config.type';
import { ENV_KEY } from '@src/libs/core/app-config/constants/app-config.constant';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { EmailServicePort } from '@src/libs/email/services/email.service-port';
import { routesV1 } from '@src/configs/app.route';

@Injectable()
export class EmailService implements EmailServicePort {
  private readonly transporter: Mail;

  constructor(
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.appConfigService.get<string>(ENV_KEY.EMAIL_HOST),
      port: this.appConfigService.get<number>(ENV_KEY.EMAIL_PORT),
      secure: true,
      auth: {
        user: this.appConfigService.get<string>(ENV_KEY.EMAIL_AUTH_USER),
        pass: this.appConfigService.get<string>(ENV_KEY.EMAIL_AUTH_PASSWORD),
      },
    });
  }

  sendVerificationEmail(
    email: string,
    userId: AggregateID,
    token: string,
  ): Promise<void> {
    const url = `${this.appConfigService.get<string>(ENV_KEY.DOMAIN)}/api/${routesV1.version}/users/${userId}/is-email-verified?token=${token}`;

    return this.transporter.sendMail({
      to: email,
      subject: '꿀모아 가입 인증 메일',
      html: `
            가입확인 버튼을 누르시면 가입 인증이 완료됩니다.<br/>
            <form action="${url}" method="POST" enctype="application/x-www-form-urlencoded">
                <input type="hidden" name="_method" value="PUT"/>
                <button>가입확인</button>
            </form>
        `,
    });
  }
}
