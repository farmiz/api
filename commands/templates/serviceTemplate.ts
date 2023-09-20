import { model } from "mongoose";

export function generateServiceTemplate({
  serviceClass,
  serviceName,
  modelName,
}: {
  serviceClass: string;
  serviceName: string;
  modelName: string;
}): string {
  const serviceClassName = `${serviceClass}Service`;
  const serviceModelName = `${modelName}Model`;
  return `
import { Model } from "mongoose";
import { BaseService } from "..";
import { ${serviceModelName}, ${modelName} } from "../../mongoose/models/${modelName}";

class ${serviceClassName} extends BaseService<${serviceModelName}> {
  protected readonly model: Model<${serviceModelName}>;

  constructor(model: Model<${serviceModelName}>) {
    super(model);
    this.model = model;
  }
}
export const ${serviceName}Service = new ${serviceClassName}(${modelName});
    `;
}
