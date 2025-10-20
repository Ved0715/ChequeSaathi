'use client';

import { useState, useEffect } from 'react';
import { dashboardAPI, DashboardStats } from '@/lib/api/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Users, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching dashboard stats:', error);
      }
      const message = error instanceof Error ? error.message : 'Failed to load dashboard';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your cheque management system</p>
      </div>

      {loading ? (
        <>
          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tables Skeleton */}
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status Breakdown Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Skeleton */}
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totals.customers}</div>
                <p className="text-xs text-muted-foreground">Active customers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cheques</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totals.cheques}</div>
                <p className="text-xs text-muted-foreground">
                  ₹{stats.totalAmounts.receivable.toLocaleString()} receivable
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Deposits</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todaysDeposits.count}</div>
                <p className="text-xs text-muted-foreground">
                  ₹{stats.todaysDeposits.amount.toLocaleString()} due today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Clearances</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingClearances.count}</div>
                <p className="text-xs text-muted-foreground">
                  ₹{stats.pendingClearances.amount.toLocaleString()} pending
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Deposits Due</CardTitle>
                <CardDescription>Cheques due for deposit today</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.todaysDeposits.cheques.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No deposits due today</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cheque #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.todaysDeposits.cheques.map((cheque) => (
                        <TableRow key={cheque.id}>
                          <TableCell className="font-medium">{cheque.chequeNumber}</TableCell>
                          <TableCell>{cheque.customer.name}</TableCell>
                          <TableCell className="text-right">₹{cheque.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next 7 Days Pipeline</CardTitle>
                <CardDescription>Upcoming deposits in the next week</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.next7DaysPipeline.cheques.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming deposits</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cheque #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.next7DaysPipeline.cheques.slice(0, 5).map((cheque) => (
                        <TableRow key={cheque.id}>
                          <TableCell className="font-medium">{cheque.chequeNumber}</TableCell>
                          <TableCell>{cheque.customer.name}</TableCell>
                          <TableCell>{format(new Date(cheque.dueDate), 'dd MMM')}</TableCell>
                          <TableCell className="text-right">₹{cheque.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {stats.next7DaysPipeline.count > 5 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    +{stats.next7DaysPipeline.count - 5} more
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cheques by Status</CardTitle>
              <CardDescription>Breakdown of all cheques by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Badge className="bg-blue-500">RECEIVED</Badge>
                  <div>
                    <p className="text-2xl font-bold">{stats.statusBreakdown.received}</p>
                    <p className="text-xs text-muted-foreground">Not yet deposited</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-yellow-500">DEPOSITED</Badge>
                  <div>
                    <p className="text-2xl font-bold">{stats.statusBreakdown.deposited}</p>
                    <p className="text-xs text-muted-foreground">Awaiting clearance</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-green-500">CLEARED</Badge>
                  <div>
                    <p className="text-2xl font-bold">{stats.statusBreakdown.cleared}</p>
                    <p className="text-xs text-muted-foreground">Successfully cleared</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-red-500">BOUNCED</Badge>
                  <div>
                    <p className="text-2xl font-bold">{stats.statusBreakdown.bounced}</p>
                    <p className="text-xs text-muted-foreground">Failed to clear</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totals.transactions}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +₹{stats.cashFlow.credit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Money received</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -₹{stats.cashFlow.debit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Money paid</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">No data available</div>
      )}
    </div>
  );
}
