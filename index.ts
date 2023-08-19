import Database from "./core/database";
import { assert } from "./helpers/asserts";
import { App } from "./core/app";

const { APP_PORT = 3000, DATABASE_URI = "" } = process.env;

class Server {
  private server: App;

  constructor() {
    this.server = new App({ name: "Live Http Server", version: "1.0.0" });
    this.init().catch((error) => {
      console.log({ error: "An error occurred on the server connection", details: error });
      process.exit(1); // Exit the process with a non-zero code to indicate failure
    });
  }

  private async init(): Promise<void> {
    assert(DATABASE_URI, "Database URI required");
    try {
      await Database.start(DATABASE_URI);
      this.server.start(Number(APP_PORT));
      console.log("Server started");
    } catch (error: any) {
      console.log({ error: "An error occurred on the server connection", details: error });
      await this.kill();
      process.exit(1); // Exit the process with a non-zero code to indicate failure
    }
  }

  private async kill(): Promise<void> {
    await Database.disconnect();
  }
}

new Server();
