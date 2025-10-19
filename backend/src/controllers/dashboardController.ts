import { Response } from 'express';
import { AuthRequest } from '@/types/auth';
import prisma from '@/config/database';

// Get Dashboard Overview Stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);

    // Get all cheques (not deleted)
    const allCheques = await prisma.cheque.findMany({
      where: { deletedAt: null },
    });

    // Today's deposits due
    const todaysDeposits = allCheques.filter(
      (cheque) =>
        cheque.dueDate >= today &&
        cheque.dueDate < tomorrow &&
        cheque.status === 'RECEIVED'
    );

    // Pending clearances (deposited but not cleared/bounced)
    const pendingClearances = allCheques.filter(
      (cheque) => cheque.status === 'DEPOSITED'
    );

    // Next 7 days pipeline (cheques due in next 7 days)
    const next7DaysPipeline = allCheques.filter(
      (cheque) =>
        cheque.dueDate >= today &&
        cheque.dueDate < next7Days &&
        cheque.status === 'RECEIVED'
    );

    // Status breakdown
    const statusBreakdown = {
      received: allCheques.filter((c) => c.status === 'RECEIVED').length,
      deposited: allCheques.filter((c) => c.status === 'DEPOSITED').length,
      cleared: allCheques.filter((c) => c.status === 'CLEARED').length,
      bounced: allCheques.filter((c) => c.status === 'BOUNCED').length,
    };

    // Total amounts
    const totalReceivable = allCheques
      .filter((c) => c.direction === 'RECEIVABLE' && c.status !== 'CLEARED')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const totalPayable = allCheques
      .filter((c) => c.direction === 'PAYABLE' && c.status !== 'CLEARED')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const totalCleared = allCheques
      .filter((c) => c.status === 'CLEARED')
      .reduce((sum, c) => sum + Number(c.amount), 0);

    // Get total customers
    const totalCustomers = await prisma.customer.count({
      where: { deletedAt: null },
    });

    // Get total transactions
    const allTransactions = await prisma.cashTransaction.findMany({
      where: { deletedAt: null },
    });

    const totalCreditTransactions = allTransactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebitTransactions = allTransactions
      .filter((t) => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    res.status(200).json({
      todaysDeposits: {
        count: todaysDeposits.length,
        amount: todaysDeposits.reduce((sum, c) => sum + Number(c.amount), 0),
        cheques: todaysDeposits.map((c) => ({
          id: c.id,
          chequeNumber: c.chequeNumber,
          amount: c.amount,
          dueDate: c.dueDate,
          customerId: c.customerId,
        })),
      },
      pendingClearances: {
        count: pendingClearances.length,
        amount: pendingClearances.reduce((sum, c) => sum + Number(c.amount), 0),
      },
      next7DaysPipeline: {
        count: next7DaysPipeline.length,
        amount: next7DaysPipeline.reduce((sum, c) => sum + Number(c.amount), 0),
      },
      statusBreakdown,
      totalAmounts: {
        receivable: totalReceivable,
        payable: totalPayable,
        cleared: totalCleared,
      },
      totals: {
        customers: totalCustomers,
        cheques: allCheques.length,
        transactions: allTransactions.length,
      },
      cashFlow: {
        credit: totalCreditTransactions,
        debit: totalDebitTransactions,
        net: totalCreditTransactions - totalDebitTransactions,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Customer-wise Summary
export const getCustomerWiseSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      include: {
        cheques: {
          where: { deletedAt: null },
        },
        transactions: {
          where: { deletedAt: null },
        },
      },
    });

    const customerSummary = customers.map((customer) => {
      const cheques = customer.cheques;
      const transactions = customer.transactions;

      const totalCheques = cheques.length;
      const bouncedCheques = cheques.filter((c) => c.status === 'BOUNCED').length;
      const pendingCheques = cheques.filter(
        (c) => c.status === 'RECEIVED' || c.status === 'DEPOSITED'
      ).length;
      const clearedCheques = cheques.filter((c) => c.status === 'CLEARED').length;

      const totalChequeAmount = cheques.reduce((sum, c) => sum + Number(c.amount), 0);
      const pendingAmount = cheques
        .filter((c) => c.status === 'RECEIVED' || c.status === 'DEPOSITED')
        .reduce((sum, c) => sum + Number(c.amount), 0);

      const totalCredit = transactions
        .filter((t) => t.type === 'CREDIT')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalDebit = transactions
        .filter((t) => t.type === 'DEBIT')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        customerId: customer.id,
        customerName: customer.name,
        businessName: customer.businessName,
        phone: customer.phone,
        email: customer.email,
        riskScore: customer.riskScore,
        cheques: {
          total: totalCheques,
          bounced: bouncedCheques,
          pending: pendingCheques,
          cleared: clearedCheques,
          totalAmount: totalChequeAmount,
          pendingAmount: pendingAmount,
        },
        transactions: {
          credit: totalCredit,
          debit: totalDebit,
          net: totalCredit - totalDebit,
        },
      };
    });

    res.status(200).json({
      customers: customerSummary,
      totalCustomers: customerSummary.length,
    });
  } catch (error) {
    console.error('Error fetching customer-wise summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Recent Activity
export const getRecentActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = '10' } = req.query;
    const limitNum = parseInt(limit as string);

    // Get recent cheques
    const recentCheques = await prisma.cheque.findMany({
      where: { deletedAt: null },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            businessName: true,
          },
        },
      },
    });

    // Get recent transactions
    const recentTransactions = await prisma.cashTransaction.findMany({
      where: { deletedAt: null },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            businessName: true,
          },
        },
      },
    });

    res.status(200).json({
      recentCheques,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
