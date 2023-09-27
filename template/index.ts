import { readFile } from "fs/promises";
import path from "path";
import { render } from "ejs";
import { BASE_DIR } from "../constants";
import { farmizLogger } from "../core/logger";

async function readHtmlTemplate(templateRelativePath: string): Promise<string> {
  const absolutePath = path.join(
    path.join(BASE_DIR, "template"),
    templateRelativePath
  );
  return await readFile(absolutePath, { encoding: "utf8" });
}

export async function renderEmailTemplate(bodyHtml: string, data: Record<string, string>) {
  try {
    const header = await readHtmlTemplate("header.ejs");
    const main = await readHtmlTemplate(bodyHtml);
    const footer = await readHtmlTemplate("footer.ejs");
    
    const headerHtml = render(header, {});
    const footerHtml = render(footer, data);
    const mainHtml = render(main, data);
    const html = `${headerHtml}${mainHtml}${footerHtml}`
    return html
  } catch (err: any) {
    farmizLogger.log("error", "renderEmailTemplate", err.message)}
}
