import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ChequesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cheques</h1>
          <p className="text-slate-600">Manage your cheque registry</p>
        </div>
        <Link href="/cheques/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Cheque
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cheque List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">No cheques yet. Add your first cheque to get started.</p>
        </CardContent>
      </Card>
    </div>
  );
}
