export interface SponsorshipProps {
  _id?: string;
  id?: string;
  userId: string;
  discoveryId?: string;
  startDate: Date;
  endDate: Date;
  sponsoredAmount: number;
  status?: "cancelled" | "active" | "closed";
  walletId: string;
  delayDays: number;
  cancelledBy?: string,
  cancelledAt?: Date,
  cancellationReason?: string;
  growthStagesIds?: string[]
}
