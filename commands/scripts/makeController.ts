import * as readline from 'readline';
import * as path from 'path';
import { generateControllerTemplate } from '../templates/controllerTemplate';
import { createFolderAndFile } from '..';
import { BASE_CONTROLLER_DIR, BASE_DIR } from '../../constants';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function generateController() {
  try {
    const answers = await askQuestions();

    const controllerName = answers[0];
    const fileName = answers[1];
    const endpoint = answers[2];
    const permissions = answers[3].split(',');
    const httpMethod = answers[4];
    const controllerHandler = answers[5];

    const code = generateControllerTemplate({
      endpoint,
      permissions,
      httpMethod,
      controllerHandler,
    });

    const folderPath = path.join(BASE_DIR, BASE_CONTROLLER_DIR, controllerName);
    const filePath = path.join(folderPath, `${fileName}.ts`);

    await createFolderAndFile(folderPath, filePath, code);

    console.log('Code generated and saved successfully!');
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

function askQuestions(): Promise<string[]> {
  return new Promise((resolve) => {
    rl.question('1. Controller name: ', (controllerName) => {
      rl.question('2. File name: ', (fileName) => {
        rl.question('3. Endpoint: ', (endpoint) => {
          rl.question('4. Permissions (comma-separated): ', (permissions) => {
            rl.question('5. HTTP method: ', (httpMethod) => {
              rl.question('6. Controller handler: ', (controllerHandler) => {
                resolve([
                  controllerName,
                  fileName,
                  endpoint,
                  permissions,
                  httpMethod,
                  controllerHandler,
                ]);
              });
            });
          });
        });
      });
    });
  });
}

generateController();
