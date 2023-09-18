import {
  AccountPasswordRecoveryProps,
  AccountVerificationEmailProps,
  ProgramSponseredProps,
  SponsorshipCancelledProps,
  WalletDeductionProps,
  WalletTopupEmailProps,
} from "../../interfaces/email";
import { emailJob } from "../../jobs/EmailJob";

type RemoveJobIdFromProps<T> = Omit<T, "jobId">;
class EmailSender {
  async accountVerification(
    data: RemoveJobIdFromProps<AccountVerificationEmailProps>,
  ) {
    const jobId = "user-account-verification";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }

  async walletTopup(data: RemoveJobIdFromProps<WalletTopupEmailProps>) {
    const jobId = "wallet-topup";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }
  async accountPasswordRecovery(
    data: RemoveJobIdFromProps<AccountPasswordRecoveryProps>,
  ) {
    const jobId = "account-password-recovery";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }
  async walletDeduction(data: RemoveJobIdFromProps<WalletDeductionProps>) {
    const jobId = "wallet-deduction";
    await emailJob.addJob(
      { ...data, jobId },
      {
        jobId,
      },
    );
  }
  async programSponsored(data: RemoveJobIdFromProps<ProgramSponseredProps>) {
    const jobId = "program-sponsored";
    await emailJob.addJob({ ...data, jobId }, { jobId });
  }
  async sponsorshipCancelled(
    data: RemoveJobIdFromProps<SponsorshipCancelledProps>,
  ) {
    const jobId = "sponsorship-cancelled";
    await emailJob.addJob({ ...data, jobId }, { jobId });
  }
}

export const emailSender = new EmailSender();
