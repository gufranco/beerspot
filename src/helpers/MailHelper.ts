import { Service, Inject } from 'typedi';
import sgMail from '@sendgrid/mail';
import mustache from 'mustache';
import fs from 'fs-extra';
import EnvironmentHelper from './EnvironmentHelper';
import CryptoHelper from './CryptoHelper';
import User from '../entities/User';

@Service()
export default class MailHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  @Inject()
  private bcryptHelper!: CryptoHelper;

  private async sendMail(
    to: string,
    from: string,
    subject: string,
    content: string,
  ) {
    sgMail.setApiKey(this.environmentHelper.getSendgridApiKey());

    return sgMail.send({
      to,
      from,
      subject,
      html: content,
    });
  }

  public async askForConfirmation(user: User): Promise<void> {
    const content: string = mustache.render(
      await fs.readFile(
        `${__dirname}/../../templates/askForConfirmation.mustache`,
        'utf8',
      ),
      {
        name: user.name,
        url: this.environmentHelper.getApiBaseUrl(),
        id: user.id,
        hash: Buffer.from(
          await this.bcryptHelper.hash(user.createdAt.toISOString()),
        ).toString('base64'),
      },
    );

    this.sendMail(
      user.email,
      this.environmentHelper.getEmailContact(),
      'Confirme seu endereço de e-mail',
      content,
    );
  }

  public async sendNewPassword(user: User, newPassword: string): Promise<void> {
    const content: string = mustache.render(
      await fs.readFile(
        `${__dirname}/../../templates/passwordReset.mustache`,
        'utf8',
      ),
      {
        name: user.name,
        password: newPassword,
      },
    );

    this.sendMail(
      user.email,
      this.environmentHelper.getEmailContact(),
      'Nova senha gerada com sucesso!',
      content,
    );
  }
}
