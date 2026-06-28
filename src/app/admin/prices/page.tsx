// Price Agent Dashboard Page
// Shows last run status, next scheduled run, supplier status, and manual trigger

'use client';

import { useState, useEffect } from 'react';

// Types
interface PriceAgentRun {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed';
  productsChecked: number;
  productsChanged: number;
  productsReviewRequired: number;
  productsFailed: number;
  productsUnchanged: number;
  productsSkipped: number;
}

interface SupplierStatus {
  id: string;
  name: string;
  status: 'connected' | 'error' | 'disabled';
  lastSync?: string;
  productsCount: number;
  pendingReviews: number;
}

// Mock data for demo
const mockLastRun: PriceAgentRun = {
  id: 'run-001',
  startedAt: '2026-06-28T08:00:00Z',
  completedAt: '2026-06-28T08:15:32Z',
  status: 'completed',
  productsChecked: 156,
  productsChanged: 23,
  productsReviewRequired: 8,
  productsFailed: 2,
  productsUnchanged: 131,
  productsSkipped: 0,
};

const mockSuppliers: SupplierStatus[] = [
  { id: '1', name: 'Bricks & Blocks Ltd', status: 'connected', lastSync: '2026-06-28T08:15:00Z', productsCount: 89, pendingReviews: 3 },
  { id: '2', name: 'Building Supplies Co', status: 'connected', lastSync: '2026-06-28T08:14:00Z', productsCount: 67, pendingReviews: 5 },
  { id: '3', name: 'Mortar Mix Direct', status: 'error', lastSync: '2026-06-27T18:30:00Z', productsCount: 42, pendingReviews: 0 },
  { id: '4', name: 'Civils & Aggregates', status: 'disabled', productsCount: 0, pendingReviews: 0 },
];

function formatDateTime(isoString?: string): string {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRelativeTime(isoString?: string): string {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Calculate next scheduled run (daily at 6am UTC)
function getNextScheduledRun(): string {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(6, 0, 0, 0);
  
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  
  return next.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PriceAgentDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<PriceAgentRun | null>(mockLastRun);
  const [suppliers, setSuppliers] = useState<SupplierStatus[]>(mockSuppliers);

  const handleCheckPrices = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/price-agent/run', {
        method: 'POST',
      });
      const data = await response.json();
      setLastRun(data.run || mockLastRun);
    } catch (error) {
      console.error('Failed to run price agent:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Agent</h1>
          <p className="mt-1 text-sm text-gray-700">
            Monitor and manage automated price updates from suppliers
          </p>
        </div>
        <button
          onClick={handleCheckPrices}
          disabled={isRunning}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Checking Prices...
            </>
          ) : (
            'Check Prices Now'
          )}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Last Run Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Last Run</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {lastRun?.status === 'completed' ? (
                <span className="text-green-600">Completed</span>
              ) : lastRun?.status === 'failed' ? (
                <span className="text-red-600">Failed</span>
              ) : (
                <span className="text-yellow-600">Running</span>
              )}
            </dd>
            <dd className="mt-2 text-sm text-gray-700">
              {lastRun ? formatDateTime(lastRun.completedAt || lastRun.startedAt) : 'Never'}
            </dd>
          </div>
        </div>

        {/* Next Scheduled */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Next Scheduled</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">Daily</dd>
            <dd className="mt-2 text-sm text-gray-700">at 06:00 UTC</dd>
          </div>
        </div>

        {/* Products Changed */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Price Changes</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {lastRun?.productsChanged || 0}
            </dd>
            <dd className="mt-2 text-sm text-gray-700">
              of {lastRun?.productsChecked || 0} products checked
            </dd>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-700 truncate">Pending Reviews</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {lastRun?.productsReviewRequired || 0}
            </dd>
            <dd className="mt-2 text-sm text-gray-700">
              awaiting approval
            </dd>
          </div>
        </div>
      </div>

      {/* Supplier Status List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Supplier Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Last Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Pending Reviews
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.status === 'connected'
                          ? 'bg-green-100 text-green-800'
                          : supplier.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {getRelativeTime(supplier.lastSync)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.productsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {supplier.pendingReviews > 0 ? (
                      <a
                        href="/admin/prices/reviews"
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {supplier.pendingReviews} pending
                      </a>
                    ) : (
                      <div className="text-sm text-gray-400">0</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">Sync</button>
                    <button className="text-gray-700 hover:text-gray-900">Configure</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Summary (if available) */}
      {lastRun && lastRun.status === 'completed' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Run Summary</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-700">Products Checked</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{lastRun.productsChecked}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-700">Products Unchanged</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{lastRun.productsUnchanged}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-700">Products Changed</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-600">{lastRun.productsChanged}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-700">Products Failed</dt>
                <dd className="mt-1 text-2xl font-semibold text-red-600">{lastRun.productsFailed}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-700">Review Required</dt>
                <dd className="mt-1 text-2xl font-semibold text-yellow-600">{lastRun.productsReviewRequired}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-700">Products Skipped</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-700">{lastRun.productsSkipped}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}