import { Resend } from "resend";
import { MailOptions } from "../../interfaces";
import { UNALLOWED_ENV } from "../../constants";
const {
  EMAIL_KEY = "",
  EMAIL_SENDER = "",
  WHITELISTED_EMAIL_DOMAIN,
  NODE_ENV = "",
} = process.env;

export class EmailService {
  private readonly transporter: Resend;

  constructor() {
    this.transporter = new Resend(EMAIL_KEY);
  }

  public async sendEmail(mailOptions: MailOptions) {
    const toEmail = Array.isArray(mailOptions.to)
      ? mailOptions.to
      : [mailOptions.to];

    mailOptions.to = toEmail;
    try {
      if (NODE_ENV === "test") {
        console.info(JSON.stringify(mailOptions, null, 2));
        return;
      }
      if (NODE_ENV === "production" || isWhiteListedEmail(toEmail)) {
         await this.transporter.emails.send({
          ...mailOptions
        } as any);
      } else {
        console.info(JSON.stringify(mailOptions, null, 2));
      }
    } catch (error: any) {
      console.log({ error: error.message });
    }
  }
}

export function isWhiteListedEmail(emails: string[]) {
  return emails.some((email: string) => {
    return WHITELISTED_EMAIL_DOMAIN === email.split("@")[1];
  });
}
