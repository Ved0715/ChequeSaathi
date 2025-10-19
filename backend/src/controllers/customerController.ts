import { Response } from "express";
import { AuthRequest } from "@/types/auth";
import { CreateCustomerBody, UpdateCustomerBody } from "@/types/customer";
import prisma from '@/config/database';


export const createCustomer = async (req: AuthRequest, res: Response ): Promise<void> => {
    const { name, phone, email, businessName, address, notes } = req.body as CreateCustomerBody;

    if (!name || !phone || !email) {
        res.status(400).json({ message: 'Name, phone, and email are required' });
        return;
    }

    try {
        // Check if email OR phone already exists (both should be unique)
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                OR: [
                    { email, deletedAt: null },
                    { phone, deletedAt: null },
                ],
            },
        });

        if (existingCustomer) {
            if (existingCustomer.email === email) {
                res.status(409).json({ message: 'Customer with this email already exists.' });
                return;
            }
            if (existingCustomer.phone === phone) {
                res.status(409).json({ message: 'Customer with this phone number already exists.' });
                return;
            }
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                email,
                businessName: businessName || null,
                address: address || null,
                notes: notes || null,
                riskScore: 0,
                createdById: req.user!.id,
                updatedById: req.user!.id,
            },
        });

        res.status(201).json({ 
            message: 'Customer created successfully', 
            customer 
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ message: 'Internal server error'});
    }    
};

export const getAllCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { search, page= '1', limit= '10' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where = {
            deletedAt: null,
            ...(search && {
                OR: [
                    { name: { contains: search as string, mode: 'insensitive' as const } },
                    { email: { contains: search as string, mode: 'insensitive' as const } },
                    { phone: { contains: search as string } },
                ],
            }),
        };

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            cheques: {where: { deletedAt: null }},
                        },
                    },
                },
            }),
            prisma.customer.count({ where }),
        ]);
        res.status(200).json({
            customers,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findFirst({
        where: { id, deletedAt: null },
      });

      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
        return;
      }

      // Calculate stats dynamically
      const cheques = await prisma.cheque.findMany({
        where: { customerId: id, deletedAt: null },
      });

      const totalCheques = cheques.length;
      const bouncedCheques = cheques.filter(c => c.status === 'BOUNCED').length;
      const totalAmount = cheques.reduce((sum, c) => sum + Number(c.amount), 0);

      // Calculate risk score
      const riskScore = totalCheques > 0
        ? Math.round((bouncedCheques / totalCheques) * 100)
        : 0;

      // Update risk score in database
      if (riskScore !== customer.riskScore) {
        await prisma.customer.update({
          where: { id },
          data: { riskScore },
        });
      }

      res.status(200).json({
        customer: {
          ...customer,
          riskScore,
          totalCheques,
          bouncedCheques,
          totalAmount,
        },
      });
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Customer
export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateCustomerBody;

    const customer = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    // Check for duplicate email or phone
    if (updateData.email && updateData.email !== customer.email) {
      const existingEmail = await prisma.customer.findFirst({
        where: { email: updateData.email, deletedAt: null, NOT: { id } },
      });
      if (existingEmail) {
        res.status(409).json({ message: 'Email already in use' });
        return;
      }
    }

    if (updateData.phone && updateData.phone !== customer.phone) {
      const existingPhone = await prisma.customer.findFirst({
        where: { phone: updateData.phone, deletedAt: null, NOT: { id } },
      });
      if (existingPhone) {
        res.status(409).json({ message: 'Phone number already in use' });
        return;
      }
    }
    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        ...updateData,
        updatedById: req.user!.id,
      },
    });

    res.status(200).json({
      message: 'Customer updated successfully',
      customer: updatedCustomer,
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete Customer (Soft Delete)
export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    await prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedById: req.user!.id,
      },
    });

    res.status(200).json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};