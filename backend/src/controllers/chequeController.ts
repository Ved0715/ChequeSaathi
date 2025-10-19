import { Response } from 'express';
import { AuthRequest } from '@/types/auth';
import {
  CreateChequeBody,
  UpdateChequeBody,
  UpdateChequeStatusBody,
  ChequeStatus,
} from '@/types/cheque';
import prisma from '@/config/database';

// Create Cheque
export const createCheque = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    customerId,
    chequeNumber,
    amount,
    bankName,
    branchName,
    ifscCode,
    chequeType,
    direction,
    drawerName,
    payeeName,
    issueDate,
    dueDate,
    notes,
  } = req.body as CreateChequeBody;

  // Validate required fields
  if (!customerId || !chequeNumber || !amount || !bankName || !chequeType || !direction || !drawerName || !payeeName || !issueDate || !dueDate) {
    res.status(400).json({
      message: 'Missing required fields: customerId, chequeNumber, amount, bankName, chequeType, direction, drawerName, payeeName, issueDate, dueDate',
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

    // Check if cheque number already exists for this customer
    const existingCheque = await prisma.cheque.findFirst({
      where: {
        customerId,
        chequeNumber,
        deletedAt: null,
      },
    });

    if (existingCheque) {
      res.status(409).json({
        message: 'Cheque with this number already exists for this customer',
      });
      return;
    }

    // Create cheque
    const cheque = await prisma.cheque.create({
      data: {
        customerId,
        chequeNumber,
        amount,
        bankName,
        branchName: branchName || null,
        ifscCode: ifscCode || null,
        chequeType,
        direction,
        drawerName,
        payeeName,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes: notes || null,
        status: ChequeStatus.RECEIVED,
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
      message: 'Cheque created successfully',
      cheque,
    });
  } catch (error) {
    console.error('Error creating cheque:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Cheques with Filters
export const getAllCheques = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      customerId,
      status,
      chequeType,
      direction,
      page = '1',
      limit = '10',
      sortBy = 'dueDate',
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

    // Filter by status
    if (status) {
      where.status = status as string;
    }

    // Filter by cheque type
    if (chequeType) {
      where.chequeType = chequeType as string;
    }

    // Filter by direction
    if (direction) {
      where.direction = direction as string;
    }

    // Search in cheque number, drawer name, payee name, bank name
    if (search) {
      where.OR = [
        { chequeNumber: { contains: search as string } },
        { drawerName: { contains: search as string, mode: 'insensitive' as const } },
        { payeeName: { contains: search as string, mode: 'insensitive' as const } },
        { bankName: { contains: search as string, mode: 'insensitive' as const } },
      ];
    }

    const [cheques, total] = await Promise.all([
      prisma.cheque.findMany({
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
      prisma.cheque.count({ where }),
    ]);

    res.status(200).json({
      cheques,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching cheques:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Cheque by ID
export const getChequeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cheque = await prisma.cheque.findFirst({
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
            riskScore: true,
          },
        },
      },
    });

    if (!cheque) {
      res.status(404).json({ message: 'Cheque not found' });
      return;
    }

    res.status(200).json({ cheque });
  } catch (error) {
    console.error('Get cheque error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Cheque
export const updateCheque = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateChequeBody;

    const cheque = await prisma.cheque.findFirst({
      where: { id, deletedAt: null },
    });

    if (!cheque) {
      res.status(404).json({ message: 'Cheque not found' });
      return;
    }

    // If updating cheque number, check for duplicates
    if (updateData.chequeNumber && updateData.chequeNumber !== cheque.chequeNumber) {
      const existingCheque = await prisma.cheque.findFirst({
        where: {
          customerId: cheque.customerId,
          chequeNumber: updateData.chequeNumber,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existingCheque) {
        res.status(409).json({
          message: 'Cheque with this number already exists for this customer',
        });
        return;
      }
    }

    // Prepare update data with date conversions
    const dataToUpdate: any = {
      ...updateData,
      updatedById: req.user!.id,
    };

    if (updateData.issueDate) {
      dataToUpdate.issueDate = new Date(updateData.issueDate);
    }

    if (updateData.dueDate) {
      dataToUpdate.dueDate = new Date(updateData.dueDate);
    }

    const updatedCheque = await prisma.cheque.update({
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
      message: 'Cheque updated successfully',
      cheque: updatedCheque,
    });
  } catch (error) {
    console.error('Update cheque error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update Cheque Status
export const updateChequeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, depositDate, clearedDate, bouncedDate, bounceReason } = req.body as UpdateChequeStatusBody;

    if (!status) {
      res.status(400).json({ message: 'Status is required' });
      return;
    }

    const cheque = await prisma.cheque.findFirst({
      where: { id, deletedAt: null },
    });

    if (!cheque) {
      res.status(404).json({ message: 'Cheque not found' });
      return;
    }

    // Prepare status update data
    const dataToUpdate: any = {
      status,
      updatedById: req.user!.id,
    };

    // Add status-specific dates
    if (status === ChequeStatus.DEPOSITED && depositDate) {
      dataToUpdate.depositDate = new Date(depositDate);
    }

    if (status === ChequeStatus.CLEARED && clearedDate) {
      dataToUpdate.clearedDate = new Date(clearedDate);
    }

    if (status === ChequeStatus.BOUNCED) {
      if (bouncedDate) {
        dataToUpdate.bouncedDate = new Date(bouncedDate);
      }
      if (bounceReason) {
        dataToUpdate.bounceReason = bounceReason;
      }
    }

    const updatedCheque = await prisma.cheque.update({
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
      message: 'Cheque status updated successfully',
      cheque: updatedCheque,
    });
  } catch (error) {
    console.error('Update cheque status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Cheque (Soft Delete)
export const deleteCheque = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const cheque = await prisma.cheque.findFirst({
      where: { id, deletedAt: null },
    });

    if (!cheque) {
      res.status(404).json({ message: 'Cheque not found' });
      return;
    }

    await prisma.cheque.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: req.user!.id,
      },
    });

    res.status(200).json({ message: 'Cheque deleted successfully' });
  } catch (error) {
    console.error('Delete cheque error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
