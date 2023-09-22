import JobBase from "../core/jobs";
import { emailJob } from "./EmailJob";


class CleanupJob extends JobBase<null> {
  constructor() {
    super("cleanup");
  }

  async process(data: null): Promise<void> {
    try {
      // Clean up non-repeatable jobs
      await this.cleanNonRepeatableJobs();
    } catch (error: any) {
      console.info("JOB CLEANUP ERROR", error.message);
    } finally {
      this.queue.close();
    }
  }

  async cleanCompletedJobs() {
    await this.queue.clean(0, "completed");
  }

  async cleanNonRepeatableJobs() {
    const allJobs = [this, emailJob];

    for (const singleJob of allJobs) {
      const jobs = await singleJob.queue.getJobs(
        ["completed", "failed"],
        0,
        -1,
      );
      for (const job of jobs) {
        const jobOptions = job.opts;

        // Check if the job is non-repeatable (no repeat and only 1 attempt allowed)
        if (!jobOptions.repeat && jobOptions.attempts === 1) {
          await job.remove();
        }
      }
    }
  }
}

export const cleanupJob = new CleanupJob();
