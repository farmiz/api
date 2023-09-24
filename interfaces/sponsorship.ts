export interface SponsorshipProps {
  _id?: string;
  id?: string;
  userId: string;
  discoveryId?: string;
  startDate: Date;
  endDate: Date;
  estimatedProfitPercentage: number;
  sponsoredAmount: number;
  isActive: boolean;
  status?: "cancelled" | "active";
  walletId: string;
}
