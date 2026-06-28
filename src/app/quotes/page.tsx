"use client";

import Link from "next/link";
import { useState } from "react";

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function QuotesPage() {
  const [quotes] = useState<Quote[]>([
    { id: "1", quoteNumber: "QQ-001", title: "Garden Wall Rebuild", customerName: "John Smith", status: "pending", total: 2500, createdAt: "2024-01-15" },
    { id: "2", quoteNumber: "QQ-002", title: "House Extension", customerName: "Jane Doe", status: "accepted", total: 15000, createdAt: "2024-01-10" },
    { id: "3", quoteNumber: "QQ-003", title: "Driveway Retaining Wall", customerName: "Bob Wilson", status: "pending", total: 3800, createdAt: "2024-01-08" }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "declined": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="font-semibold text-xl">Quick Quotes</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link href="/quotes" className="text-gray-900 font-medium">Quotes</Link>
              <Link href="/customers" className="text-gray-700 hover:text-gray-900">Customers</Link>
              <Link href="/materials" className="text-gray-700 hover:text-gray-900">Materials</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 text-gray-900">Quotes</h1>
            <p className="text-gray-800-700">Manage your project quotes</p>
          </div>
          <Link href="/quotes/new" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600">
            + New Quote
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Quote #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.quoteNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quote.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quote.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(quote.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quote.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
