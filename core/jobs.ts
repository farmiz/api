import dotenv from "dotenv";
import Bull from "bull";
import { JobValidator } from "../jobs/validator";
import { v4 as uuid } from "uuid";
import { IJobOptions, JobData, JobId } from "../interfaces";
import { modifyJobOptions } from "../utils/jobs";
dotenv.config();
const {
  REDIS_PORT = 6379,
  REDIS_USER = "",
  REDIS_PASSWORD = "",
  REDIS_HOST = "localhost",
} = process.env;
export default class JobBase<T> {
  protected queue: Bull.Queue<JobData<T>>;
  protected maxRetries: number = 5;
  private isConnected: boolean = false;
  constructor(queueName: string) {
    this.queue = new Bull(queueName, {
      redis: {
        host: REDIS_HOST,
        port: Number(REDIS_PORT),
        password: REDIS_PASSWORD,
        username: REDIS_USER,
      },
    });
  this.setupQueue();
  }
  private setupQueue() {
    this.queue.isReady().then(() => {
      this.isConnected = true;
      console.log("Queue connection successful");
    });

    this.queue.on("error", this.handleQueueError.bind(this));

    this.queue.process(this.processJob.bind(this));
    this.queue.on("failed", this.failedJob.bind(this));
  }
  protected handleQueueError(error: Error) {
    this.isConnected = false;
    console.error("Queue connection error:", error);
    // You can handle the connection failure here or emit an event, throw an error, etc.
  }

  protected async processJob(job: Bull.Job<JobData<T>>): Promise<void> {
    try {
      await this.process(job.data.data);
      if (await job.isCompleted()) {
        console.log(`Job with Id ${job.id} has completed successfully`);
      }
    } catch (error: any) {
      if (job.attemptsMade < this.maxRetries) {
        console.log(`Job ${job.id} failed, retrying...`);
        await job.retry();
      } else {
        console.log(`Job ${job.id} failed, max retries reached`);
      }
      await job.remove();
    }
  }
  protected async failedJob(job: Bull.Job<JobData<T>>, error: Error): Promise<void> {
    console.log(`Job ${job.id} failed with error: ${error.message}`);
  }

 protected async process(data: T): Promise<void> {
    throw new Error("Method not implemented");
  }

   async addJob(data: T, options: IJobOptions): Promise<Bull.Job<JobData<T>> | null>{
    if (JobValidator.hasValidJobId(options.jobId)) {
      const modifiedOptions = modifyJobOptions(options);
      modifiedOptions.jobId = `${options.jobId}:${uuid()}` as JobId;
      return await this.queue.add({ data }, modifiedOptions);
    }
    return null;
  }
}
