export interface ITransaction {
  _id?: string;
  walletId?: string;
  domain?: string | null;
  status?: string | null;
  reference?: string | null;
  amount?: number | string;
  message?: string | null;
  gateway_response?: string;
  paid_at?: Date;
  created_at?: Date;
  channel?: string | null;
  currency?: "NGN" | "GHS" | "ZAR" | "USD";
  ip_address?: string;
  metadata?: Record<string, any>;
  authorization?: Record<string, any>;
  customer?: Record<string, any>;
  fees?: number | string;
  source?: Record<string, any>;
  transaction_date?: Date;
  plan_object?: any;
  userId?: string;
}
