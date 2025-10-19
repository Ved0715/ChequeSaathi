export enum ChequeStatus {
  RECEIVED = 'RECEIVED',
  DEPOSITED = 'DEPOSITED',
  CLEARED = 'CLEARED',
  BOUNCED = 'BOUNCED',
}

export enum ChequeType {
  AT_SIGHT = 'AT_SIGHT',
  POST_DATED = 'POST_DATED',
}

export enum ChequeDirection {
  RECEIVABLE = 'RECEIVABLE',
  PAYABLE = 'PAYABLE',
}

export interface CreateChequeBody {
  customerId: string;
  chequeNumber: string;
  amount: number;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  chequeType: ChequeType;
  direction: ChequeDirection;
  drawerName: string;
  payeeName: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  notes?: string;
}

export interface UpdateChequeBody {
  chequeNumber?: string;
  amount?: number;
  bankName?: string;
  branchName?: string;
  ifscCode?: string;
  chequeType?: ChequeType;
  direction?: ChequeDirection;
  drawerName?: string;
  payeeName?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface UpdateChequeStatusBody {
  status: ChequeStatus;
  depositDate?: string;
  clearedDate?: string;
  bouncedDate?: string;
  bounceReason?: string;
}

export interface ChequeWithCustomer {
  id: string;
  customerId: string;
  chequeNumber: string;
  amount: number;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
  status: ChequeStatus;
  chequeType: ChequeType;
  direction: ChequeDirection;
  drawerName: string;
  payeeName: string;
  issueDate: Date;
  dueDate: Date;
  depositDate?: Date;
  clearedDate?: Date;
  bouncedDate?: Date;
  bounceReason?: string;
  notes?: string;
  imageUrl?: string;
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
