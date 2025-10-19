import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-600">View cash transaction history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No transactions yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
