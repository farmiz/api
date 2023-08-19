//@ts-ignore
import * as owasp from "owasp-password-strength-test";
import { IPhone } from "../../interfaces";

export class Validator {
  static validatePhone({ }, phone: IPhone): boolean {
    const phoneRegex =
      /^(\+?\d{1,3}[- ]?)?\d{3,14}[- ]?\d{2,14}([- ]?\d{2,14})?([- ]?\d{2,14})?$/;
    return !!(phoneRegex.test(phone.number) && phone.country && phone.prefix);
  }
  static isEmail({ }, email: string): boolean {
    var tester =
      /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

    if (!email) return false;

    var emailParts = email.split("@");

    if (emailParts.length !== 2) return false;

    var account = emailParts[0];
    var address = emailParts[1];

    if (account.length > 64) return false;
    else if (address.length > 255) return false;

    var domainParts = address.split(".");

    if (
      domainParts.some(function (part) {
        return part.length > 63;
      })
    )
      return false;

    return tester.test(email);
  }
  static isPasswordStrong({ }, password: string): [boolean, string] | boolean {
    owasp.config({
      allowPassphrases: true,
      maxLength: 20,
      minLength: 8,
      minPhraseLength: 20,
      minOptionalTestsToPass: 4
    });
    const result = owasp.test(password);
    if (result.errors.length > 0) {
      return [false, result.errors[0]];
    }
    return true;
  }
  static normalizeEmail(email: string) {

    // Convert the email to lowercase
   let newEmail = email.toLowerCase();
    // Remove any leading or trailing whitespace
    newEmail = newEmail.trim();

    // Split the newEmail address into local part and domain
    const atIndex = newEmail.indexOf('@');
    const localPart = newEmail.slice(0, atIndex);
    const domain = newEmail.slice(atIndex);

    // Remove periods (.) from the local part
    const normalizedLocalPart = localPart.replace(/\./g, '');

    // Construct the normalized email by combining the normalized local part and domain
    const normalizedEmail = normalizedLocalPart + domain;

    return normalizedEmail;

  }
}
