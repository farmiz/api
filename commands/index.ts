import { mkdir, writeFile } from "fs/promises";
export async function createFolderAndFile(data: {
  folderPath: string;
  filePath: string;
  code: string;
}) {
  const {folderPath, filePath, code }= data;
  await mkdir(folderPath, { recursive: true });
  await writeFile(filePath, code);
}
