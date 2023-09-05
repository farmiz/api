import { S3 } from "aws-sdk";

export interface BucketConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  s3ForcePathStyle: boolean;
  signatureVersion: "v3" | "v4";
  region: string;
}

class BucketService {
  private bucket!: S3;
  
  setConfig(config: BucketConfig) {
    this.bucket = new S3(config);
  }

  async createFolder(bucketName: string, fileName: string): Promise<void> {
    const params = {
        Bucket: bucketName,
        Key: fileName
      };
    await this.bucket.putObject(params).promise();
  }

  //   Check if bucket exists
  async doesBucketExist(bucketName: string): Promise<boolean> {
    const params = {
      Bucket: bucketName,
    };
    try {
      await this.bucket.headBucket(params).promise();
      return true;
    } catch (error: any) {
      if (error.code === "NotFound") {
        return false;
      }
      throw error;
    }
  }
  async listObjects(bucketName: string): Promise<AWS.S3.ListObjectsOutput> {
    const params = {
      Bucket: bucketName,
    };
    return this.bucket.listObjects(params).promise();
  }
  async uploadFile(data: {
    bucketName: string;
    key: string;
    file: Buffer;
  }): Promise<any> {
    const params = {
      Bucket: data.bucketName,
      Key: data.key,
      Body: data.file,
    };

    try {
      const result = await this.bucket.upload(params).promise();
      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async deleteBucket(bucketName: string): Promise<void> {
    const params = {
      Bucket: bucketName,
    };

    await this.bucket.deleteBucket(params).promise();
  }

  async getObject(
    key: string,
    bucketName: string,
  ): Promise<AWS.S3.GetObjectOutput> {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    return this.bucket.getObject(params).promise();
  }

  async deleteObject(key: string, bucketName: string): Promise<void> {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    await this.bucket.deleteObject(params).promise();
  }
}

export const bucketService = new BucketService();
