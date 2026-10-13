'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load customers');
        setCustomers(data.customers);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Could not load customers');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold font-poppins text-gray-900">Customers</h1>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No customers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Orders</th>
                  <th className="p-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{customer.phone || '—'}</td>
                    <td className="p-4 text-sm text-gray-600">{customer._count.orders}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(customer.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
