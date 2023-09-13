import { UNALLOWED_ENV } from "../constants";
import JobBase from "../core/jobs";
import { EmailService } from "../services/email/Email";
import { EmailJobOptions } from "../interfaces";
import { EmailJobProps } from "../interfaces/email";
import { accountPasswordRecovery, newUserEmailTemplate } from "../templates/userAccountTemplate";
import { walletUpTemplate } from "../templates/walletTopup";
import { walletDeductionTemplate } from "../templates/walletDeductionTemplate";

const { NODE_ENV = "" } = process.env;

export class EmailJob extends JobBase<EmailJobProps> {
  private emailService: EmailService;
  constructor() {
    super("email");
    this.emailService = new EmailService();
  }

  // All email processing logic comes here
  protected async process(data: EmailJobProps): Promise<void> {
    const content = this.emailJobDeterminer(data);
    if (UNALLOWED_ENV.includes(NODE_ENV)) {
      console.info(JSON.stringify(content, null, 2));
    } else this.emailService.sendEmail(content);
  }
  emailJobDeterminer = (data: EmailJobProps): EmailJobOptions => {
    let content = {};

    switch (data.jobId) {
      case "user-account-verification":
        if ("accountVerificationToken" in data)
          content = newUserEmailTemplate(
            data.email,
            data.accountVerificationToken,
          );
        break;
      case "wallet-topup":
        content = walletUpTemplate(data);
        case "account-password-recovery":
          if("recoveryLink" in data){
            content = accountPasswordRecovery(data.email, data.recoveryLink);
          }
          break;
          case "wallet-deduction":
            content = walletDeductionTemplate(data);
            break;
          case "program-sponsored":
            content = walletDeductionTemplate(data);
            break;
      default:
        break;
    }
    return content as EmailJobOptions;
  };
}
export const emailJob = new EmailJob();
