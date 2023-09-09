import {
  AccountPasswordRecoveryProps,
  AccountVerificationEmailProps,
  WalletDeductionProps,
  WalletTopupEmailProps,
} from "../../interfaces/email";
import { emailJob } from "../../jobs/EmailJob";

class EmailSender {
  async accountVerification(
    data: Omit<AccountVerificationEmailProps, "jobId">,
  ) {
    const jobId = "user-account-verification";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }

  async walletTopup(data: Omit<WalletTopupEmailProps, "jobId">) {
    const jobId = "wallet-topup";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }
  async accountPasswordRecovery(
    data: Omit<AccountPasswordRecoveryProps, "jobId">,
  ) {
    const jobId = "account-password-recovery";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }
  async walletDeduction(
    data: Omit<WalletDeductionProps, "jobId">,
  ) {
    const jobId = "wallet-deduction";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }
}

export const emailSender = new EmailSender();
