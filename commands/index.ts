import { mkdir, writeFile } from "fs/promises";
export async function createFolderAndFile(
  folderPath: string,
  filePath: string,
  code: string,
) {
  await mkdir(folderPath, { recursive: true });
  await writeFile(filePath, code);
}
