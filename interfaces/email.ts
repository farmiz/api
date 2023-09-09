export interface AccountVerificationEmailProps {
  email: string;
  accountVerificationToken: string;
  jobId: "user-account-verification";
}
export interface WalletTopupEmailProps {
  email: string;
  amount: number | string;
  jobId: "wallet-topup";
}
export interface AccountPasswordRecoveryProps {
  recoveryLink: string;
  email: string;
  jobId: "account-password-recovery";
}
export interface WalletDeductionProps
  extends Omit<WalletTopupEmailProps, "jobId"> {
  jobId: "wallet-deduction";
}
export interface ProgramSponseredProps {
  email: string;
  discoveryId: string;
  jobId: "program-sponsored";
}
export type EmailJobProps =
  | AccountVerificationEmailProps
  | WalletTopupEmailProps
  | AccountPasswordRecoveryProps
  | WalletDeductionProps
  | ProgramSponseredProps;
