import { AuthRequest } from "../middleware";

export interface ValidationRule {
  required?:
    | boolean
    | [(req: AuthRequest, val: any) => Promise<boolean> | boolean, string?]
    | Promise<boolean | [boolean, string?]>
    | ((req: AuthRequest, val: any) => Promise<boolean> | boolean);

  authorize?:
    | boolean
    | ((req: AuthRequest, val: any) => Promise<boolean> | boolean)
    | ((req: AuthRequest, val: any) => Promise<boolean> | boolean)[];

  validate?:
    | boolean
    | ((
        req: AuthRequest,
        arg: any,
      ) => boolean | Promise<boolean | [boolean, string]> | [boolean, string?])
    | [(req: AuthRequest, val: any) => boolean | Promise<boolean>, string?]
    | ((
        req: AuthRequest,
        arg: any,
      ) =>
        | boolean
        | Promise<boolean | [Function | boolean, string?]>
        | [Function | boolean, string?])[];

  sanitize?: (val: any) => any;
  fieldName?: string;
}
export class Validator {
  static validateRequestBody(rules: Record<string, ValidationRule>) {
    return async (req: any, res: any, next: any) => {
      if (!isValidRule(rules)) {
        return next();
      } else {
        const errors: { error: string; status: number }[] =
        await bundleValidation(rules, req, "body");
        if (errors.length > 0) {
          return res
            .status(errors[0].status)
            .json({ success: false, response: { message: errors[0].error } });
        }
        return next();
      }
    };
  }
  static validateRequestParams(rules: Record<string, ValidationRule>) {
    return async (req: any, res: any, next: any) => {
      if (!isValidRule(rules)) {
        return next();
      } else {
        const errors: { error: string; status: number }[] =
          await bundleValidation(rules, req, "params");
        if (errors.length > 0) {
          return res
            .status(errors[0].status)
            .json({ success: false, response: { message: errors[0].error } });
        }
        return next();
      }
    };
  }
  static validateRequestQueries(rules: Record<string, ValidationRule>) {
    return async (req: any, res: any, next: any) => {
      if (!isValidRule(rules)) {
        return next();
      } else {
        const errors: { error: string; status: number }[] =
          await bundleValidation(rules, req, "query");
        if (errors.length > 0) {
          return res
            .status(errors[0].status)
            .json({ success: false, response: { message: errors[0].error } });
        }
        return next();
      }
    };
  }
}

export function hasValue(value: any): boolean {
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  if (typeof value === "number") return !!value;
  return value && value !== undefined && value !== null && value.length > 0;
}

export function isValidRule(object: any): boolean {
  return object && Object.keys(object).length > 0;
}

async function bundleValidation(
  rules: Record<string, ValidationRule>,
  req: AuthRequest,
  validationIsFor: "params" | "body" | "query",
): Promise<{ error: string; status: number }[]> {
  const errors: { error: string; status: number }[] = [];
  for (const [field, rule] of Object.entries(rules)) {
    const value = req[validationIsFor][field] || "";
    const ruleKeys = Object.keys(rule);

    // RULE CHECK FOR REQUIRED
    if (ruleKeys.includes("required")) {
      if (
        typeof rule.required === "boolean" &&
        rule.required &&
        !hasValue(value)
      ) {
        errors.push({
          error: `${rule.fieldName || field} is required`,
          status: 400,
        });
      } else if (Array.isArray(rule.required)) {
        if (
          (rule.required[0] instanceof Function &&
            rule.required[0](req, value)) ||
          typeof rule.required[0] === "boolean"
        ) {
          const actualError = rule.required[1] || "";
          errors.push({
            error: actualError || `${rule.fieldName || field} is required`,
            status: 400,
          });
        }
      } else if (
        rule.required instanceof Function &&
        rule.required(req, value) &&
        !hasValue(value)
      ) {
        errors.push({
          error: `${rule.fieldName || field} is required`,
          status: 400,
        });
      }
    }

    // RULE CHECK FOR AUTHORIZE
    if (ruleKeys.includes("authorize")) {
      if (
        (rule.authorize instanceof Function &&
          !(await rule.authorize(req, value))) ||
        (typeof rule.authorize === "boolean" && !rule.authorize)
      ) {
        errors.push({
          error: `Access to this resource is denied`,
          status: 403,
        });
      } else if (Array.isArray(rule.authorize)) {
        for (const authorizeFn of rule.authorize) {
          if (!authorizeFn(req, value)) {
            errors.push({
              error: `Access to this resource is denied`,
              status: 403,
            });
          }
          break; //break for the first try
        }
      }
    }

    // RULES FOR VALIDATION
    if (ruleKeys.includes("validate")) {
      const validators = Array.isArray(rule.validate)
        ? rule.validate
        : [rule.validate];
      const generalValidateError = validators[1]
        ? (validators[1] as string)
        : `${rule.fieldName || field} is invalid.`;
      for (const validator of validators) {
        if (typeof validator === "boolean" && !validator) {
          errors.push({ error: generalValidateError, status: 400 });
        } else if (typeof validator === "function") {
          const result = await validator(req, value);
          if (typeof result === "boolean" && !result) {
            errors.push({ error: generalValidateError, status: 400 });
          } else if (Array.isArray(result)) {
            const [validatorFunc, errorMessage] = result;
            if (
              typeof validatorFunc === "function" &&
              !validatorFunc(req, value)
            ) {
              errors.push({
                error: errorMessage || generalValidateError,
                status: 400,
              });
            }
            if (typeof validatorFunc === "boolean" && !validatorFunc) {
              errors.push({
                error: errorMessage || generalValidateError,
                status: 400,
              });
            }
          }
        }
      }
    }

    if (rule.sanitize) {
      req.body[field] = rule.sanitize(value);
    }
  }
  return errors;
}
