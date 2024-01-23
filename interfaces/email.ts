import { JobId } from ".";

export interface BaseProps {
  jobId: JobId;
}
export interface AccountVerificationEmailProps extends BaseProps {
  email: string;
  accountVerificationToken: string;
  jobId: "user-account-verification";
  recipientName: string;
}
export interface WalletTopupEmailProps extends BaseProps {
  email: string;
  amount: number | string;
  jobId: "wallet-topup";
  recipientName: string;
  transactionDate: Date;
  transactionStatus: string;
  transactionId: string;
  paymentMethod: string;
  paymentNumber: string;
}
export interface AccountPasswordRecoveryProps extends BaseProps {
  recoveryLink: string;
  email: string;
  jobId: "account-password-recovery";
}
export interface WalletDeductionProps
  extends Omit<WalletTopupEmailProps, "jobId">,
    BaseProps {
  jobId: "wallet-deduction";
}
export interface ProgramSponseredProps extends BaseProps {
  email: string;
  discoveryId: string;
  jobId: "program-sponsored";
}

export interface SponsorshipCancelledProps
  extends Omit<ProgramSponseredProps, "jobId">,
    BaseProps {
  jobId: "sponsorship-cancelled";
}
export type EmailJobProps =
  | AccountVerificationEmailProps
  | WalletTopupEmailProps
  | AccountPasswordRecoveryProps
  | WalletDeductionProps
  | ProgramSponseredProps
  | SponsorshipCancelledProps;
