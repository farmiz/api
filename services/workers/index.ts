import { cleanupJob } from "../../jobs/CleanerJob";
import { sponsorJob } from "../../jobs/SponsorJob";
import { sponsorshipService } from "../sponsorship";

async function cleanupJobs() {
  await cleanupJob.addJob(null, {
    jobId: "cleanup-job",
    removeOnComplete: true,
    delay: 10000,
  });
}

async function updateSponsorStatus() {
    await sponsorJob.addJob(null, {
        jobId:"update-sponsorship-status",
        repeat: { cron: '*/5 * * * *' }
    });
}
export const WORKERS = [cleanupJobs, updateSponsorStatus];
