import { Resend } from "resend";
import { MailOptions } from "../../interfaces";
const { EMAIL_KEY = "", EMAIL_SENDER = "", WHITELISTED_EMAIL_DOMAIN, NODE_ENV  = ""} =
  process.env;

export class EmailService {
  private readonly transporter: Resend;

  constructor() {
    this.transporter = new Resend(EMAIL_KEY);
  }

  public async sendEmail(mailOptions: MailOptions) {
    const toEmail = Array.isArray(mailOptions.to)
      ? mailOptions.to
      : [mailOptions.to];
    let validToEmail: string[] = [];

    // only send email to domains that is not from company
    if (WHITELISTED_EMAIL_DOMAIN && toEmail.length) {
      validToEmail = toEmail.filter((email: string) => {
        return !isWhiteListedEmail(email);
      });
      mailOptions.to = validToEmail;
    }

    try {      
      if (!["testing"].includes(NODE_ENV)) {
        await this.transporter.emails.send({
          ...mailOptions,
          from: EMAIL_SENDER,
        } as any) ;
        console.log("I was here")
      } else {
        console.log({ mailOptions });
      }
    } catch (error: any) {
      console.log({error: error.message})
    }
  }
}

export function isWhiteListedEmail(email: string) {
  return WHITELISTED_EMAIL_DOMAIN !== email.split("@")[1];
}
