


export interface CreateCustomerBody {
    name: string;
    phone: string;
    email: string;
    businessName?: string;
    address?: string;
    notes?: string;    
}

export interface UpdateCustomerBody {
    name?: string;
    phone?: string;
    email?: string;
    businessName?: string;
    address?: string;
    notes?: string;
}

export interface CustomerWithStats {
    id: string;
    name: string;
    phone: string;
    email: string;
    businessName?: string;
    address?: string;
    notes?: string;
    riskScore: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    // Dynamically calculated stats
    totalCheques: number;
    bouncedCheques: number;
    totalAmount: number;
}

