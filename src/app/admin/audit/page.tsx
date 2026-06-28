// Audit Log Page - View and filter audit events
'use client';

import { useState, useEffect } from 'react';
import { AuditEvent, formatDateTime } from '@/lib/types';

interface AuditLogPageProps {
  initialEvents?: AuditEvent[];
}

type ActionFilter = 'all' | 'create' | 'update' | 'delete' | 'auth';

export default function AuditLogPage({ initialEvents = [] }: AuditLogPageProps) {
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);
  const [loading, setLoading] = useState(!initialEvents.length);
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch audit events on mount if not provided
  useEffect(() => {
    if (!initialEvents.length) {
      fetchAuditEvents();
    }
  }, [initialEvents]);

  const fetchAuditEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      
      const response = await fetch(`/api/admin/audit?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter events locally for search
  const filteredEvents = events.filter(event => {
    // Action filter
    if (actionFilter !== 'all' && !event.action.toLowerCase().includes(actionFilter)) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        event.action.toLowerCase().includes(query) ||
        event.entityType.toLowerCase().includes(query) ||
        event.entityId?.toLowerCase().includes(query) ||
        event.userId?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Date range filter
    if (dateFrom) {
      const eventDate = new Date(event.createdAt);
      const fromDate = new Date(dateFrom);
      if (eventDate < fromDate) return false;
    }
    
    if (dateTo) {
      const eventDate = new Date(event.createdAt);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (eventDate > toDate) return false;
    }
    
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleFilterChange = () => {
    setPage(1);
    if (!initialEvents.length) {
      fetchAuditEvents();
    }
  };

  const getActionBadgeColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('login')) {
      return 'bg-green-100 text-green-800';
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (actionLower.includes('delete') || actionLower.includes('logout')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatChanges = (event: AuditEvent) => {
    const changes: string[] = [];
    
    if (event.oldData && event.newData) {
      Object.keys(event.newData).forEach(key => {
        if (JSON.stringify(event.oldData?.[key]) !== JSON.stringify(event.newData?.[key])) {
          changes.push(key);
        }
      });
    }
    
    return changes.length > 0 ? changes.join(', ') : '-';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-700 mt-1">
          Track all system activities and changes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Action Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value as ActionFilter);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="auth">Authentication</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                handleFilterChange();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, entities..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(actionFilter !== 'all' || dateFrom || dateTo || searchQuery) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setActionFilter('all');
                setDateFrom('');
                setDateTo('');
                setSearchQuery('');
                setPage(1);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-700 mb-4">
        Showing {paginatedEvents.length} of {filteredEvents.length} events
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-700 mt-2">Loading audit events...</p>
        </div>
      ) : (
        <>
          {/* Audit Events Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-700">
                      No audit events found
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(event.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {event.userId ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {event.userId.slice(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-gray-400">System</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(event.action)}`}>
                          {event.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{event.entityType}</span>
                          {event.entityId && (
                            <span className="font-mono text-xs text-gray-400">
                              {event.entityId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                        <span className="truncate block" title={formatChanges(event)}>
                          {formatChanges(event)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}