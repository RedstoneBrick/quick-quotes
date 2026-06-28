// Supplier Settings Page
// Manage suppliers and their connection configurations

'use client';

import { useState } from 'react';

interface Supplier {
  id: string;
  name: string;
  code: string;
  website?: string;
  isActive: boolean;
  connectionType: 'manual' | 'csv' | 'api' | 'mock';
  lastSync?: string;
  productsCount: number;
  status: 'connected' | 'error' | 'disabled';
}

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Bricks & Blocks Ltd',
    code: 'BBL',
    website: 'https://bricksblocks.co.uk',
    isActive: true,
    connectionType: 'api',
    lastSync: '2026-06-28T08:15:00Z',
    productsCount: 89,
    status: 'connected',
  },
  {
    id: '2',
    name: 'Building Supplies Co',
    code: 'BSC',
    website: 'https://buildingsupplies.co.uk',
    isActive: true,
    connectionType: 'csv',
    lastSync: '2026-06-28T08:14:00Z',
    productsCount: 67,
    status: 'connected',
  },
  {
    id: '3',
    name: 'Mortar Mix Direct',
    code: 'MMD',
    website: 'https://mortarmixdirect.co.uk',
    isActive: true,
    connectionType: 'api',
    lastSync: '2026-06-27T18:30:00Z',
    productsCount: 42,
    status: 'error',
  },
  {
    id: '4',
    name: 'Civils & Aggregates',
    code: 'CNA',
    website: 'https://civilsaggregates.co.uk',
    isActive: false,
    connectionType: 'manual',
    productsCount: 0,
    status: 'disabled',
  },
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'connected': return 'bg-green-100 text-green-800';
    case 'error': return 'bg-red-100 text-red-800';
    case 'disabled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getConnectionTypeLabel(type: string): string {
  switch (type) {
    case 'manual': return 'Manual Entry';
    case 'csv': return 'CSV Import';
    case 'api': return 'API Connection';
    case 'mock': return 'Demo/Mock';
    default: return type;
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    website: '',
    connectionType: 'manual' as 'manual' | 'csv' | 'api' | 'mock',
  });

  const handleToggleActive = (id: string) => {
    setSuppliers(suppliers.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive, status: !s.isActive ? 'connected' : 'disabled' } : s
    ));
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      code: supplier.code,
      website: supplier.website || '',
      connectionType: supplier.connectionType,
    });
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (editingSupplier) {
      // Update existing
      setSuppliers(suppliers.map(s => 
        s.id === editingSupplier.id 
          ? { 
              ...s, 
              name: formData.name, 
              code: formData.code, 
              website: formData.website,
              connectionType: formData.connectionType,
            } 
          : s
      ));
    } else {
      // Add new
      const newSupplier: Supplier = {
        id: `new-${Date.now()}`,
        name: formData.name,
        code: formData.code,
        website: formData.website,
        isActive: true,
        connectionType: formData.connectionType,
        productsCount: 0,
        status: 'connected',
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    setShowAddModal(false);
    setEditingSupplier(null);
    setFormData({ name: '', code: '', website: '', connectionType: 'manual' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: '', code: '', website: '', connectionType: 'manual' });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage supplier connections and sync settings
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Supplier
        </button>
      </div>

      {/* Suppliers List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className={!supplier.isActive ? 'opacity-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        {supplier.website && (
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {supplier.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {supplier.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {getConnectionTypeLabel(supplier.connectionType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}
                    >
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {supplier.lastSync ? formatDateTime(supplier.lastSync) : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.productsCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(supplier.id)}
                      className={`mr-4 ${supplier.isActive ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {supplier.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Supplier Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Bricks & Blocks Ltd"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Code
                        </label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="BBL"
                          maxLength={10}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Connection Type
                        </label>
                        <select
                          value={formData.connectionType}
                          onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as any })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="manual">Manual Entry</option>
                          <option value="csv">CSV Import</option>
                          <option value="api">API Connection</option>
                          <option value="mock">Demo/Mock</option>
                        </select>
                      </div>
                      
                      {formData.connectionType === 'api' && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-blue-800">
                            For API connections, you'll need to configure the API endpoint and authentication credentials after adding the supplier.
                          </p>
                        </div>
                      )}
                      
                      {formData.connectionType === 'csv' && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-blue-800">
                            For CSV imports, you'll be able to upload a CSV file and map columns after adding the supplier.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.code}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}