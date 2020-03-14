import { Service, Inject } from 'typedi';
import sgMail from '@sendgrid/mail';
import EnvironmentHelper from './EnvironmentHelper';
import BcryptHelper from './BcryptHelper';
import User from '../entities/User';
import mustache from 'mustache';
import fs from 'fs-extra';

@Service()
export default class MailHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  @Inject()
  private bcryptHelper!: BcryptHelper;

  constructor() {
    sgMail.setApiKey(this.environmentHelper.getSendgridApiKey());
  }

  private async sendEmail(
    to: string,
    from: string,
    subject: string,
    html: string,
  ) {
    return sgMail.send({
      to,
      from,
      subject,
      html,
    });
  }

  public async sendConfirmation(user: User): Promise<void> {
    const content: string = mustache.render(
      await fs.readFile('../templates/emailConfirmation.mustache', 'utf8'),
      {
        url: this.environmentHelper.getApiBaseUrl(),
        id: user.id,
        hash: await this.bcryptHelper.hash(user.createdAt.toISOString()),
      },
    );

    await this.sendEmail(
      user.email,
      this.environmentHelper.getEmailContact(),
      'Confirme seu endereço de e-mail',
      content,
    );
  }
}
