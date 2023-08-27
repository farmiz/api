export type RiskLevel = "high" | "moderate" | "low"
export interface IDiscovery {
    id?: string;
    name: string;
    duration: string;
    description: string;
    tags: string[];
    amount: number;
    profitPercentage: number;
    riskLevel: RiskLevel;
    startDate: Date;
    endDate: Date;
    closingDate: Date;
  }
  