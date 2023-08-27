import { JobId } from ".";

export interface AccountVerificationEmailProps {
  email: string;
  accountVerificationToken: string;
  jobId: "user-account-verification"
}
export interface WalletTopupEmailProps {
  email: string;
  amount: number | string;
  jobId: "wallet-topup"
}
export interface AccountPasswordRecoveryProps {
  recoveryLink: string;
  email: string;
  jobId: "account-password-recovery"
}
export type EmailJobProps =
  | AccountVerificationEmailProps
  | WalletTopupEmailProps | AccountPasswordRecoveryProps;
