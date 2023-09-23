import JobBase from "../core/jobs";
import { EmailService } from "../services/email/Email";
import { EmailJobOptions } from "../interfaces";
import { EmailJobProps } from "../interfaces/email";
import {
  accountPasswordRecovery,
  newUserEmailTemplate,
} from "../templates/userAccountTemplate";
import { walletTopUpTemplate } from "../templates/walletTopup";
import { walletDeductionTemplate } from "../templates/walletDeductionTemplate";

export class EmailJob extends JobBase<EmailJobProps> {
  private emailService: EmailService;
  constructor() {
    super("email");
    this.emailService = new EmailService();
  }

  // All email processing logic comes here
  protected async process(data: EmailJobProps): Promise<void> {
    const content = await this.emailJobDeterminer(data);
      try {
        await this.emailService.sendEmail(content);
      } catch (error) {
        console.log({ error });
    }
  }
  emailJobDeterminer = async (
    data: EmailJobProps,
  ): Promise<EmailJobOptions> => {
    let content = {};

    switch (data.jobId) {
      case "user-account-verification":
        if ("accountVerificationToken" in data)
          content = await newUserEmailTemplate({
            accountVerificationToken: data.accountVerificationToken,
            email: data.email,
            recipientName: data.recipientName,
          });
        break;
      case "wallet-topup":
        content = await walletTopUpTemplate(data);
      case "account-password-recovery":
        if ("recoveryLink" in data) {
          content = await accountPasswordRecovery(
            data.email,
            data.recoveryLink,
          );
        }
        break;
      case "wallet-deduction":
        content = await walletDeductionTemplate(data);
        break;
      case "program-sponsored":
        content = await walletDeductionTemplate(data);
        break;
      default:
        break;
    }
    return content as EmailJobOptions;
  };
}
export const emailJob = new EmailJob();
