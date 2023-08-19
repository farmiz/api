import { faker } from "@faker-js/faker";
import { selectRandomItem } from "../../../utils";
import { UserRole, userRoles } from "../../../interfaces/users";
import { UserModel } from "../../../mongoose/models/Users";
import { v4 as uuid } from "uuid";
interface Country {
  country: string;
  code: string;
  iso?: string;
}

const countries: Country[] = [
  {
    code: "GH",
    country: "Ghana",
  },
];
export const mockUserTemplate = (): Partial<UserModel> => {
  const selectedCountry = selectRandomItem<Country>(countries);
  const { code, country } = selectedCountry;
  return {
    email: faker.internet.email(),
    phone: {
      prefix: code,
      number: faker.phone.number(),
    },
    password: "TestPassword123!",
    role: selectRandomItem<UserRole>(userRoles),
    firstName: faker.internet.userName(),
    lastName: faker.internet.userName(),
    gender: selectRandomItem<"female" | "male">(["male", "female"]),
    physicalAddress: {
      zipCode: faker.address.zipCode(),
      country,
      houseNumber: faker.address.buildingNumber(),
      city: faker.address.city(),
      street: faker.address.street(),
      state: faker.address.state(),
    },
    mailingAddress: {
      zipCode: faker.address.zipCode(),
      country,
      houseNumber: faker.address.buildingNumber(),
      city: faker.address.city(),
      street: faker.address.street(),
      state: faker.address.state(),
    },
    status: "active",
    deleted: false,
    isLoggedIn: true,
    dateOfBirth: new Date(),
    lastLoggedInDate: new Date(),
    createdBy: uuid(),
    updatedBy: uuid(),
  };
};
