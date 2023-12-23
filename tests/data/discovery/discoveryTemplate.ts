import { faker } from "@faker-js/faker";
import { selectRandomItem } from "../../../utils";
import { v4 as uuid } from "uuid";
import { DiscoveryModel, riskLevels } from "../../../mongoose/models/Discovery";
import { RiskLevel } from "../../../interfaces/discovery";
import { addMonths } from "date-fns";

const selectedRisk = selectRandomItem<RiskLevel>(riskLevels);
export const mockDiscoveryTemplate = (): Partial<DiscoveryModel> => {
  return {
    product: faker.name.jobTitle(),
    description: faker.lorem.paragraph(2),
    amount: Math.ceil(Math.random() * 1000),
    profitPercentage:  Math.ceil(Math.random() * 100),
    riskLevel: selectedRisk,
    duration: {
      type: selectRandomItem(["day", "month", "year"]),
      value: Math.ceil(Math.random() * 365)
    },
    tags: ["something cool", "another cool thing"],
    startDate: new Date(),
    endDate: addMonths(new Date(), 5),
    deleted: false,
    createdBy: uuid(),
    updatedBy: uuid(),
    closingDate: addMonths(new Date(), 5)
  };
};
