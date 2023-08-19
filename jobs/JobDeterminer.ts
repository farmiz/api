import { EmailJobOptions, IJobBase } from "../interfaces";
import { newUserEmailTemplate } from "../templates/userAccountTemplate";
import { walletUpTemplate } from "../templates/walletTopup";

export const emailJobDeterminer = (data: IJobBase): EmailJobOptions => {
  const accountVerificationToken = data.accountVerificationToken || ""
  const { jobId } = data;
  let content = {};

  switch (jobId) {
    case "user-registration":
      content = newUserEmailTemplate(data.email, accountVerificationToken);
      break;
      case "wallet-topup":
        content  = walletUpTemplate(data)

    default:
      break;
  }
  return content as EmailJobOptions;
};
