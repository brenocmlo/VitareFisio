export type AbacatePayEventName =
  | "checkout.paid"
  | "checkout.completed"
  | "billing.paid"
  | "subscription.completed"
  | "subscription.renewed";

export type AbacatePayPlanCycle = "MONTHLY" | "SEMIANNUALLY" | "ANNUALLY";

export interface IAbacatePayCustomer {
  id?: string;
  name?: string;
  email: string;
  taxId?: string | null;
  phone?: string;
  cellphone?: string;
}

export interface IAbacatePayProductLike {
  id: string;
  name?: string;
  cycle?: AbacatePayPlanCycle | null;
  metadata?: Record<string, unknown>;
}

export interface IAbacatePayWebhookBase {
  id: string;
  event: AbacatePayEventName | (string & {});
  apiVersion?: number;
  devMode?: boolean;
  data: Record<string, unknown>;
}

export interface IAbacatePayCheckoutCompletedData {
  checkout?: {
    id?: string;
    externalId?: string | null;
    frequency?: "ONE_TIME" | "SUBSCRIPTION" | (string & {});
    items?: Array<{ id: string; quantity: number }>;
    status?: string;
    methods?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  customer: IAbacatePayCustomer | null;
  products?: IAbacatePayProductLike[];
  metadata?: Record<string, unknown>;
}

export interface IAbacatePaySubscriptionEventData {
  subscription?: {
    id?: string;
    status?: string;
    frequency?: AbacatePayPlanCycle | (string & {});
    createdAt?: string;
    updatedAt?: string;
  };
  customer: IAbacatePayCustomer | null;
  products?: IAbacatePayProductLike[];
  metadata?: Record<string, unknown>;
}

export type IAbacatePayWebhook =
  | (IAbacatePayWebhookBase & {
      event: "checkout.paid" | "checkout.completed";
      data: IAbacatePayCheckoutCompletedData;
    })
  | (IAbacatePayWebhookBase & {
      event: "billing.paid" | "subscription.completed" | "subscription.renewed";
      data: IAbacatePaySubscriptionEventData;
    })
  | IAbacatePayWebhookBase;

