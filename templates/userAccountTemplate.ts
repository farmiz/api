import { renderEmailTemplate } from "../template";
import { defaultFrom } from "../utils";

export const newUserEmailTemplate = async (data: {
  email: string;
  accountVerificationToken: string;
  from?: string;
  recipientName: string;
}) => ({
  from: defaultFrom("WELCOME"),
  to: data.email,
  subject: `${data.recipientName}, Welcome to the our platform`,
  text: "Welcome to the our platform",
  html: await renderEmailTemplate("confirmEmail.ejs", data),
});

export const accountPasswordRecovery = async (
  email: string,
  recoveryLink: string,
  from?: string,
) => ({
  from: defaultFrom("SUPPORT") || from,
  to: email,
  subject: `${email}, Password reset`,
  text: "You are trying to reset your password",
  html: `
      <h1>Passowrd Reset!</h1>
      <p>${recoveryLink} is your new password reset code</p>
    `,
});
