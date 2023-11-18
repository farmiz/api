import { Request } from "express";
import { credential, initializeApp, storage } from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";
import { v4 as uuid } from "uuid";

class FileBucket {
  private storage: storage.Storage;
  private bucket = "farmiz-staging.appspot.com";

  constructor() {
    this.storage = this.initialBucket();
  }

  private initialBucket(): storage.Storage {
    const configData = this.setConfigData();
    initializeApp(configData);
    return storage();
  }

  private setConfigData() {
    const serviceAccountKeyPath = path.join(
      __dirname,
      "../../farmiz-staging-firebase-adminsdk-gj1bl-df7d8fa50b.json"
    );

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountKeyPath, "utf8")
    );

    return {
      storageBucket: this.bucket,
      credential: credential.cert(serviceAccount),
    };
  }

  // Upload a file to the specified path in the bucket from a readable stream
  async uploadFile(
    req: Request,
    streamOptions?: Record<string, any>
  ): Promise<string> {
    try {
      const bucket = this.storage.bucket();
      const fileName = `${Date.now()}_${uuid()}_${
        req.file?.originalname.split(".").pop()
      }`;

      const file = bucket.file(fileName);
      const uploadStream = file.createWriteStream(streamOptions);

      // Wait for the upload to complete
      await new Promise<void>((resolve, reject) => {
        uploadStream.on("error", reject);
        uploadStream.on("finish", resolve);
        uploadStream.end(req.file?.buffer);
      });

      file.makePublic();
      return `https://storage.googleapis.com/${this.bucket}/${fileName}`;
    } catch (error) {
      // Handle the error, e.g., log it or throw a custom error
      console.error("Error during file upload:", error);
      throw error;
    }
  }

  // Download a file from the bucket and return a readable stream
  async downloadFile(remoteFilePath: string): Promise<stream.Readable> {
    const bucket = this.storage.bucket();
    const file = bucket.file(remoteFilePath);

    return file.createReadStream();
  }

  // Delete a file from the bucket
  async deleteFile(remoteFilePath: string): Promise<void> {
    const bucket = this.storage.bucket();
    const file = bucket.file(remoteFilePath);

    await file.delete();
  }
}

export const fileBucket = new FileBucket();
