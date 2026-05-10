export interface IKiwifyCustomer {
  email: string;
  full_name: string;
  first_name: string;
  mobile?: string;
  CPF?: string;
}

export interface IKiwifySubscription {
  id: string;
  status: string;
  start_date: string;
  next_payment: string;
  plan?: {
    id: string;
    name: string;
    frequency: string; // "monthly", "yearly", etc
  };
}

export interface IKiwifyWebhook {
  order_id: string;
  order_status: "paid" | "refunded" | "chargeback" | "waiting_payment" | "refused";
  payment_method: string;
  created_at: string;
  updated_at: string;
  Customer: IKiwifyCustomer;
  Subscription?: IKiwifySubscription;
  webhook_event_type?: string;
}
