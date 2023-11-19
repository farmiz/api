import Database from "./core/database";
import { assert } from "./helpers/asserts";
import { App } from "./core/app";
import { farmizLogger } from "./core/logger";

const {
  PORT = 3000,
  DATABASE_URI = "",
} = process.env;

class Server {
  private server: App;

  constructor() {
    this.server = new App({ name: "Live Http Server", version: "1.0.0" });
    this.init().catch(error => {
      farmizLogger.log("error", "Server:constructor",  error.message)
      process.exit(1);
    });
  }

  private async init(): Promise<void> {
    assert(DATABASE_URI, "Database URI required");
    try {
      await Database.start(DATABASE_URI);
      this.server.start(Number(PORT));
      farmizLogger.log("info", "server:init",  "Database started")

    } catch (error: any) {
      farmizLogger.log("error", "Server:init",  error.message)
      await this.kill();
      process.exit(1); // Exit the process with a non-zero code to indicate failure
    }
  }

  private async kill(): Promise<void> {
    await Database.disconnect();
  }
}

new Server();
