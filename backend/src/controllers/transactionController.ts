import { Response } from 'express';
import { AuthRequest } from '@/types/auth';
import { CreateTransactionBody, UpdateTransactionBody } from '@/types/transaction';
import prisma from '@/config/database';

// Create Transaction
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerId, amount, type, method, date, reference, category, notes } = req.body as CreateTransactionBody;

  // Validate required fields
  if (!customerId || !amount || !type || !method || !date) {
    res.status(400).json({
      message: 'Missing required fields: customerId, amount, type, method, date',
    });
    return;
  }

  try {
    // Check if customer exists and is not deleted
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Create transaction
    const transaction = await prisma.cashTransaction.create({
      data: {
        customerId,
        amount,
        type,
        paymentMethod: method,
        date: new Date(date),
        reference: reference || null,
        category: category || null,
        notes: notes || null,
        createdById: req.user!.id,
        updatedById: req.user!.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            businessName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Transactions with Filters
export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      type,
      method,
      category,
      startDate,
      endDate,
      page = '1',
      limit = '10',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      deletedAt: null,
    };

    // Filter by customer
    if (customerId) {
      where.customerId = customerId as string;
    }

    // Filter by type
    if (type) {
      where.type = type as string;
    }

    // Filter by payment method
    if (method) {
      where.paymentMethod = method as string;
    }

    // Filter by category
    if (category) {
      where.category = category as string;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.cashTransaction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder as string },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              businessName: true,
            },
          },
        },
      }),
      prisma.cashTransaction.count({ where }),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Transaction by ID
export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await prisma.cashTransaction.findFirst({
      where: { id, deletedAt: null },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            businessName: true,
            address: true,
          },
        },
      },
    });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    res.status(200).json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Transaction
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateTransactionBody;

    const transaction = await prisma.cashTransaction.findFirst({
      where: { id, deletedAt: null },
    });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    // Prepare update data with date conversion
    const dataToUpdate: any = {
      ...updateData,
      updatedById: req.user!.id,
    };

    // Map 'method' to 'paymentMethod' for Prisma
    if (updateData.method) {
      dataToUpdate.paymentMethod = updateData.method;
      delete dataToUpdate.method;
    }

    if (updateData.date) {
      dataToUpdate.date = new Date(updateData.date);
    }

    const updatedTransaction = await prisma.cashTransaction.update({
      where: { id },
      data: dataToUpdate,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            businessName: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Transaction (Soft Delete)
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await prisma.cashTransaction.findFirst({
      where: { id, deletedAt: null },
    });

    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }

    await prisma.cashTransaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: req.user!.id,
      },
    });

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
