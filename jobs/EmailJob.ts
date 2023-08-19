import { UNALLOWED_ENV } from "../constants";
import JobBase from "../core/jobs";
import { IJobBase } from "../interfaces";
import { EmailService } from "../services/email/Email";
import { emailJobDeterminer } from "./JobDeterminer";

const {NODE_ENV = ""}= process.env
export class EmailJob extends JobBase<IJobBase> {
  private emailService: EmailService;
  constructor() {
    super("email");
    this.emailService = new EmailService();
  }

  // All email processing logic comes here
  async process(data: IJobBase): Promise<void> {
    const content = emailJobDeterminer(data);

    if (UNALLOWED_ENV.includes(NODE_ENV)) {
      console.info(JSON.stringify(content, null, 2));
    } else this.emailService.sendEmail(content);
  }

  static async accountVerification(data: IJobBase): Promise<void> {
    await new EmailJob().addJob(data, {
      jobId: data.jobId,
    });
  }
  static async sendUserCreatedEmail(data: IJobBase) {
    await new EmailJob().addJob(data, {
      jobId: data.jobId,
    });
  }
  static async walletTopup(data: IJobBase) {
    await new EmailJob().addJob(data, {
      jobId: data.jobId,
    });
  }

}