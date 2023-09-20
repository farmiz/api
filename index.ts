import Database from "./core/database";
import { assert } from "./helpers/asserts";
import { App } from "./core/app";
import { bucketService } from "./services/s3/Bucket";

const {
  PORT = 3000,
  DATABASE_URI = "",
  BUCKET_ENDPOINT = "",
  BUCKET_CLUSTER = "",
  BUCKET_ACCESS_TOKEN = "",
  BUCKET_SECRET_TOKEN = "",
} = process.env;

class Server {
  private server: App;

  constructor() {
    this.server = new App({ name: "Live Http Server", version: "1.0.0" });
    this.init().catch(error => {
      console.log({
        error: "An error occurred on the server connection",
        details: error,
      });
      process.exit(1); // Exit the process with a non-zero code to indicate failure
    });
  }

  private async init(): Promise<void> {
    assert(DATABASE_URI, "Database URI required");
    try {
      await Database.start(DATABASE_URI);
      this.server.start(Number(PORT));
      bucketService.setConfig({
        accessKeyId: BUCKET_ACCESS_TOKEN,
        endpoint: BUCKET_ENDPOINT,
        s3ForcePathStyle: true,
        secretAccessKey: BUCKET_SECRET_TOKEN,
        signatureVersion: "v4",
        region: BUCKET_CLUSTER
      });
      console.log("Server started");
    } catch (error: any) {
      console.log({
        error: "An error occurred on the server connection",
        details: error,
      });
      await this.kill();
      process.exit(1); // Exit the process with a non-zero code to indicate failure
    }
  }

  private async kill(): Promise<void> {
    await Database.disconnect();
  }
}

new Server();
