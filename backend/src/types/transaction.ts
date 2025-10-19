export enum PaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  IMPS = 'IMPS',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export enum TransactionType {
  CREDIT = 'CREDIT', // Money received
  DEBIT = 'DEBIT',   // Money paid
}

export interface CreateTransactionBody {
  customerId: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  date: string; // ISO date string
  reference?: string;
  category?: string;
  notes?: string;
}

export interface UpdateTransactionBody {
  amount?: number;
  type?: TransactionType;
  method?: PaymentMethod;
  date?: string;
  reference?: string;
  category?: string;
  notes?: string;
}

export interface TransactionWithCustomer {
  id: string;
  customerId: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  date: Date;
  reference?: string;
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    businessName?: string;
  };
}
