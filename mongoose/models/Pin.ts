import mongoose, { Schema } from "mongoose";
import { IDefaultPlugin } from "../../interfaces";
import { defaultPlugin } from "../utils";
import { passwordManager } from "../../helpers/auth/password";

export interface Pin extends IDefaultPlugin {
  code: string;
  id?: string;
  userId?: string;
}

const pinCodeSchema = new Schema<Pin>({
  code: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: false,
    ref: "User",
  },
});

pinCodeSchema.plugin(defaultPlugin);
pinCodeSchema.pre("save", async function(){
    this.code = await passwordManager.hashPassword(this.code);
})
const PinCodeModel = mongoose.model<Pin>("PinCode", pinCodeSchema);

export default PinCodeModel;
