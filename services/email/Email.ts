import { Resend } from "resend";
import { MailOptions } from "../../interfaces";
import { farmizLogger } from "../../core/logger";
const {
  EMAIL_KEY = "",
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
      farmizLogger.log("info", "EmailService:sendEmail:[test]", "Email sent", {
        ...mailOptions
      })
        return;
      }
      if (NODE_ENV === "production" || isWhiteListedEmail(toEmail)) {
         await this.transporter.emails.send({
          ...mailOptions
        } as any);
      } else {
        farmizLogger.log("info", "EmailService:sendEmail:[development]", "Email sent", {
          ...mailOptions
        })      }
    } catch (error: any) {
      farmizLogger.log("error", "EmailService:sendEmail",  error.message)
    }
  }
}

export function isWhiteListedEmail(emails: string[]) {
  return emails.some((email: string) => {
    return WHITELISTED_EMAIL_DOMAIN === email.split("@")[1];
  });
}
