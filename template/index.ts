import { readFile } from "fs/promises";
import path from "path";
import { render } from "ejs";
import { BASE_DIR } from "../constants";

async function readHtmlTemplate(templateRelativePath: string): Promise<string> {
  const absolutePath = path.join(
    path.join(BASE_DIR, "template"),
    templateRelativePath
  );
  return await readFile(absolutePath, { encoding: "utf8" });
}

async function main() {
  try {
    const d = await readHtmlTemplate("welcome.ejs");
    const data = {
      year: new Date().getFullYear(),
      recipientName: "Rex"
    }
    const html = render(d, data);
    console.log({ html });
  } catch (err) {
    console.log({ err });
  }
}

main();
