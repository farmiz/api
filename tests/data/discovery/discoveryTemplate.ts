import { faker } from "@faker-js/faker";
import { getRandomFutureDate, selectRandomItem } from "../../../utils";
import { v4 as uuid } from "uuid";
import { DiscoveryModel, riskLevels } from "../../../mongoose/models/Discovery";
import { RiskLevel } from "../../../interfaces/discovery";

export const mockDiscoveryTemplate = (): Partial<DiscoveryModel> => {
  const selectedRisk = selectRandomItem<RiskLevel>(riskLevels);
  return {
    name: faker.name.jobTitle(),
    description: faker.lorem.paragraph(2),
    amount: Math.ceil(Math.random() * 1000),
    profitPercentage:  Math.ceil(Math.random() * 100),
    riskLevel: selectedRisk,
    tags: ["something cool", "another cool thing"],
    closingDate: getRandomFutureDate(),
    startDate: new Date(),
    endDate: getRandomFutureDate(),
    deleted: false,
    createdBy: uuid(),
    updatedBy: uuid(),
  };
};
