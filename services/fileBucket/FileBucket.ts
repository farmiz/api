import { Request } from "express";
import * as admin from "firebase-admin";
import * as path from "path";
import * as stream from "stream";
import { v4 as uuid } from "uuid";
import { farmizLogger } from "../../core/logger";

export type Directory = "products" | "profileImage" | "assets";
export interface UploadFileProps {
  req: Request;
  directory: Directory;
  streamOptions?: Record<string, any>;
}
export interface UploadFileReturnProps {
  url: string;
  directory: string;
  fileName: string;
}
const {
  BUCKET_URL = "",
  STORAGE_URL = "",
  STORAGE_KEY_PATH = "",
  NODE_ENV,
} = process.env;
class FileBucket {
  private storage: admin.storage.Storage;

  constructor() {
    this.storage = this.initializeFileBucket();
  }

  private initializeFileBucket(): admin.storage.Storage {
    const configData = this.setConfigData();

    try {
      admin.initializeApp(configData);
    } catch (error: any) {
      farmizLogger.log("error", "initializeFileBucket", error.message);
    }

    return admin.storage();
  }

  private setConfigData() {
    if (NODE_ENV !== "test") {
      const serviceAccountKeyPath = path.join(__dirname, STORAGE_KEY_PATH);

      return {
        storageBucket: BUCKET_URL,
        credential: admin.credential.cert(serviceAccountKeyPath),
      };
    }
  }

  // Upload a file to the specified path in the bucket from a readable stream
  async uploadFile(data: UploadFileProps): Promise<UploadFileReturnProps> {
    try {
      const { directory, req, streamOptions } = data;
      const bucket = this.storage.bucket();
      const fileName = `${directory}/${Date.now()}_${uuid()}_${req.file?.originalname
        .split(".")
        .pop()}`;

      const file = bucket.file(fileName);
      const uploadStream = file.createWriteStream(streamOptions);

      // Wait for the upload to complete
      await new Promise<void>((resolve, reject) => {
        uploadStream.on("error", reject);
        uploadStream.on("finish", resolve);
        uploadStream.end(req.file?.buffer);
      });

      file.makePublic();
      return {
        url: `${STORAGE_URL}/${BUCKET_URL}/${fileName}`,
        directory,
        fileName,
      };
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
  async updateFile(
    data: UploadFileProps,
    oldFileName: string,
  ): Promise<UploadFileReturnProps> {
    try {
      // Step 1: Delete the old file
      await this.deleteFile(oldFileName);

      // Step 2: Upload the new file
      return this.uploadFile(data);
    } catch (error: any) {
      farmizLogger.log("error", "updateFile", error.message);
      throw error;
    }
  }
}

export const fileBucket = new FileBucket();
