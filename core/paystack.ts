import { PayStack } from "paystackly";

const { PAYSTACK_SK = "" } = process.env;
export const paystack = new PayStack(PAYSTACK_SK);
