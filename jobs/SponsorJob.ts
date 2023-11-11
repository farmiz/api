import JobBase from "../core/jobs";
import { farmizLogger } from "../core/logger";

class SponsorJob extends JobBase<null> {
  constructor() {
    super("sponsor");
  }

  async process(): Promise<void> {
    try {
      await this.checkAndChangeSponsorshipStatus();
    } catch (error: any) {
      console.info("UNABLE TO UPDATE SPONSORSHIP STATUS", error.message);
    } finally {
      this.queue.close();
    }
  }


  async checkAndChangeSponsorshipStatus() {
    // const today = new Date();

    try {
      // await sponsorshipService.updateMany(
      //   {
      //     $and: [
      //       { startDate: { $gte: today } }, // startDate is greater than or equal to today
      //       {
      //         endDate: {
      //           $eq: {
      //             $add: [today, { $multiply: ["$delayDays", 24, 60, 60, 1000] }],
      //           },
      //         },
      //       }, // endDate is equal to delayDays from today
      //     ],
      //   },
      //   {
      //     status: "closed",
      //   },
      // );
    } catch (error: any) {
     farmizLogger.log("error", "SponsorJob:checkAndChangeSponsorshipStatus", error.message)
    }
  }
}

export const sponsorJob = new SponsorJob();
