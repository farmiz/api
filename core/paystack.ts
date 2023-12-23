import { PayStack } from "paystackly";

const { PAYSTACK_SK = "" } = process.env;
export const payStack = new PayStack(PAYSTACK_SK);
