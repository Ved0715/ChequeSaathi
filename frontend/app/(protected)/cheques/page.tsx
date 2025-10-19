'use client';

import { useState, useEffect } from 'react';
import { chequeAPI, Cheque, ChequeStatus, ChequeType, ChequeDirection } from '@/lib/api/cheques';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ChequesPage() {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChequeStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCheques = async () => {
    try {
      setLoading(true);
      const response = await chequeAPI.getAll({
        search,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setCheques(response.cheques);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching cheques:', error);
      }
      toast.error(error.message || 'Failed to load cheques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
  }, [search, statusFilter, page]);

  const getStatusBadge = (status: ChequeStatus) => {
    const variants = {
      RECEIVED: 'bg-blue-500',
      DEPOSITED: 'bg-yellow-500',
      CLEARED: 'bg-green-500',
      BOUNCED: 'bg-red-500',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cheques</h1>
          <p className="text-muted-foreground">Manage your cheque registry</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Cheque
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cheques..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ChequeStatus | '')}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="RECEIVED">Received</option>
          <option value="DEPOSITED">Deposited</option>
          <option value="CLEARED">Cleared</option>
          <option value="BOUNCED">Bounced</option>
        </select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cheque #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : cheques.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No cheques found
                </TableCell>
              </TableRow>
            ) : (
              cheques.map((cheque) => (
                <TableRow key={cheque.id}>
                  <TableCell className="font-medium">{cheque.chequeNumber}</TableCell>
                  <TableCell>{cheque.customer.name}</TableCell>
                  <TableCell>₹{cheque.amount.toLocaleString()}</TableCell>
                  <TableCell>{cheque.bankName}</TableCell>
                  <TableCell>{format(new Date(cheque.dueDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {cheque.chequeType === 'POST_DATED' ? 'PDC' : 'At Sight'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(cheque.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
