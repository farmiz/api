import { generateRandomNumber } from "../../../utils";
import { Pin } from "../../../mongoose/models/Pin";

export const mockPinTemplate = (): Partial<Pin> => {
  return { code: generateRandomNumber(4) };
};
