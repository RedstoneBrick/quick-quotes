// Price Reviews Page
// Lists price changes needing review with approve, reject, edit actions

'use client';

import { useState } from 'react';

interface PriceReview {
  id: string;
  supplier: string;
  product: string;
  sourceUrl?: string;
  confidenceScore: number;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  createdAt: string;
}

// Mock data for demo
const mockReviews: PriceReview[] = [
  {
    id: '1',
    supplier: 'Bricks & Blocks Ltd',
    product: 'Red Brick Class A - Pack of 500',
    sourceUrl: 'https://example.com/bricks/red-class-a',
    confidenceScore: 0.95,
    oldPrice: 42500,
    newPrice: 44900,
    changePercent: 5.6,
    status: 'pending',
    createdAt: '2026-06-28T08:15:00Z',
  },
  {
    id: '2',
    supplier: 'Building Supplies Co',
    product: 'Concrete Block 7N - Pack of 40',
    sourceUrl: 'https://example.com/blocks/concrete-7n',
    confidenceScore: 0.92,
    oldPrice: 3840,
    newPrice: 4150,
    changePercent: 8.1,
    status: 'pending',
    createdAt: '2026-06-28T08:14:00Z',
  },
  {
    id: '3',
    supplier: 'Bricks & Blocks Ltd',
    product: 'Lime Mortar Mix 25kg',
    sourceUrl: 'https://example.com/mortar/lime-25kg',
    confidenceScore: 0.88,
    oldPrice: 895,
    newPrice: 925,
    changePercent: 3.4,
    status: 'pending',
    createdAt: '2026-06-28T08:13:00Z',
  },
  {
    id: '4',
    supplier: 'Building Supplies Co',
    product: 'Cavity Wall Tie 200mm - Box of 500',
    sourceUrl: 'https://example.com/ties/cavity-200',
    confidenceScore: 0.78,
    oldPrice: 4500,
    newPrice: 5200,
    changePercent: 15.6,
    status: 'pending',
    createdAt: '2026-06-28T08:12:00Z',
  },
  {
    id: '5',
    supplier: 'Mortar Mix Direct',
    product: 'Premixed Render 25kg - Yellow',
    sourceUrl: 'https://example.com/render/yellow',
    confidenceScore: 0.65,
    oldPrice: 750,
    newPrice: 800,
    changePercent: 6.7,
    status: 'pending',
    createdAt: '2026-06-28T08:11:00Z',
  },
];

function formatCurrency(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100);
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getConfidenceColor(score: number): string {
  if (score >= 0.9) return 'bg-green-100 text-green-800';
  if (score >= 0.7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function getConfidenceLabel(score: number): string {
  if (score >= 0.9) return 'High';
  if (score >= 0.7) return 'Medium';
  return 'Low';
}

function getChangeColor(percent: number): string {
  if (percent > 10) return 'text-red-600';
  if (percent > 0) return 'text-green-600';
  return 'text-gray-600';
}

export default function PriceReviewsPage() {
  const [reviews, setReviews] = useState<PriceReview[]>(mockReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const handleApprove = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: 'approved' as const } : r
    ));
  };

  const handleReject = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: 'rejected' as const } : r
    ));
  };

  const handleEdit = (id: string) => {
    const review = reviews.find(r => r.id === id);
    if (review) {
      setEditingId(id);
      setEditValue((review.newPrice / 100).toFixed(2));
    }
  };

  const handleSaveEdit = (id: string) => {
    const newPricePence = Math.round(parseFloat(editValue) * 100);
    setReviews(reviews.map(r => 
      r.id === id 
        ? { 
            ...r, 
            newPrice: newPricePence,
            changePercent: ((newPricePence - r.oldPrice) / r.oldPrice * 100),
            status: 'edited' as const
          } 
        : r
    ));
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const filteredReviews = reviews.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Price Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve price changes from suppliers
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Review
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Approved
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {approvedCount}
            </span>
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rejected
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {rejectedCount}
            </span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All
          </button>
        </nav>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <li key={review.id} className="px-4 py-5 sm:px-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {review.product}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          review.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : review.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : review.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{review.supplier}</p>
                    
                    {/* Source URL */}
                    {review.sourceUrl && (
                      <a
                        href={review.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-xs text-blue-600 hover:text-blue-800 inline-flex items-center"
                      >
                        View source
                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    
                    {/* Confidence Score */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getConfidenceColor(review.confidenceScore)}`}
                      >
                        {getConfidenceLabel(review.confidenceScore)} ({review.confidenceScore})
                      </span>
                    </div>
                  </div>

                  {/* Price Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-baseline gap-4">
                      <div>
                        <span className="text-xs text-gray-500 block">Old Price</span>
                        <span className="text-lg font-medium text-gray-900">
                          {formatCurrency(review.oldPrice)}
                        </span>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div>
                        <span className="text-xs text-gray-500 block">New Price</span>
                        {editingId === review.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium text-gray-900">£</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-lg font-medium text-gray-900"
                            />
                          </div>
                        ) : (
                          <span className="text-lg font-medium text-gray-900">
                            {formatCurrency(review.newPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Change Percent */}
                    <div className={`text-lg font-semibold ${getChangeColor(review.changePercent)}`}>
                      {review.changePercent > 0 ? '+' : ''}{review.changePercent.toFixed(1)}%
                    </div>

                    {/* Actions */}
                    {review.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        {editingId === review.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(review.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApprove(review.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(review.id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleEdit(review.id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className="mt-3 text-xs text-gray-400">
                  Created: {formatDateTime(review.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Export CSV
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Bulk Approve All Pending
          </button>
        </div>
      </div>
    </div>
  );
}