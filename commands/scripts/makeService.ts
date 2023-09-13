import * as readline from "readline";
import * as path from "path";
import { createFolderAndFile } from "..";
import { BASE_SERVICE_DIR, BASE_DIR } from "../../constants";
import { generateServiceTemplate } from "../templates/serviceTemplate";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function generateController() {
  try {
    const [serviceName, fileName, modelName, serviceClass] = await askQuestions();

    const code = generateServiceTemplate({
      serviceClass,
      serviceName,
      modelName,
    });

    const folderPath = path.join(BASE_DIR, BASE_SERVICE_DIR, serviceName);
    const filePath = path.join(folderPath, `${fileName}.ts`);

    await createFolderAndFile(folderPath, filePath, code);
    console.log("Code generated and saved successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
  }
}

function askQuestions(): Promise<string[]> {
  return new Promise(resolve => {
    rl.question("1. Service name: eg, user: ", serviceName => {
      rl.question("1. Service class name: eg, User: ", serviceClass => {
        rl.question("2. File name: eg, index: ", fileName => {
          rl.question("3. Service ModelName: eg, User: ", modelName => {
            resolve([serviceName, fileName, modelName, serviceClass]);
          });
        });
      });
    });
  });
}

generateController();
