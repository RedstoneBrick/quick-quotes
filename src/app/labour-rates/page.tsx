'use client';

import { useState } from 'react';
import { LabourRateTemplate, formatCurrency } from '@/lib/types';

// Predefined roles
const ROLES = [
  'Bricklayer',
  'Labourer',
  'Apprentice',
  'Foreman',
  'Supervisor',
  'Plant Operator',
  'Scaffolder',
  'Groundworker',
  'Carpenter',
  'Roofer',
  'Plasterer',
  'Electrician',
  'Plumber',
  'General Builder',
];

// Mock data
const mockLabourRates: LabourRateTemplate[] = [
  {
    id: '1',
    organisationId: 'org-1',
    name: 'Standard Bricklayer',
    role: 'Bricklayer',
    costRate: 18000, // £180/day
    chargeRate: 28000, // £280/day
    isDefault: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    organisationId: 'org-1',
    name: 'Skilled Labourer',
    role: 'Labourer',
    costRate: 14000,
    chargeRate: 20000,
    isDefault: false,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    organisationId: 'org-1',
    name: 'Apprentice',
    role: 'Apprentice',
    costRate: 9000,
    chargeRate: 14000,
    isDefault: false,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    organisationId: 'org-1',
    name: 'Foreman',
    role: 'Foreman',
    costRate: 22000,
    chargeRate: 35000,
    isDefault: false,
    createdAt: new Date('2024-01-01'),
  },
];

type LabourRateFormData = Omit<LabourRateTemplate, 'id' | 'organisationId' | 'createdAt'>;

const initialFormData: LabourRateFormData = {
  name: '',
  role: 'Bricklayer',
  costRate: 0,
  chargeRate: 0,
  isDefault: false,
};

export default function LabourRatesPage() {
  const [labourRates, setLabourRates] = useState<LabourRateTemplate[]>(mockLabourRates);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<LabourRateTemplate | null>(null);
  const [formData, setFormData] = useState<LabourRateFormData>(initialFormData);

  const filteredRates = labourRates.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate margin
  const calculateMargin = (cost: number, charge: number) => {
    if (charge === 0) return 0;
    return Math.round(((charge - cost) / charge) * 100);
  };

  // Calculate markup
  const calculateMarkup = (cost: number, charge: number) => {
    if (cost === 0) return 0;
    return Math.round(((charge - cost) / cost) * 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const costRatePence = Math.round(formData.costRate * 100);
    const chargeRatePence = Math.round(formData.chargeRate * 100);

    if (editingRate) {
      // If this rate is being set as default, unset others
      let updatedRates = labourRates;
      if (formData.isDefault) {
        updatedRates = updatedRates.map((r) => ({ ...r, isDefault: false }));
      }
      
      setLabourRates(
        updatedRates.map((r) =>
          r.id === editingRate.id
            ? {
                ...r,
                name: formData.name,
                role: formData.role,
                costRate: costRatePence,
                chargeRate: chargeRatePence,
                isDefault: formData.isDefault,
              }
            : r
        )
      );
    } else {
      // If this rate is being set as default, unset others first
      let newRates = [...labourRates];
      if (formData.isDefault) {
        newRates = newRates.map((r) => ({ ...r, isDefault: false }));
      }
      
      const newRate: LabourRateTemplate = {
        id: Date.now().toString(),
        organisationId: 'org-1',
        name: formData.name,
        role: formData.role,
        costRate: costRatePence,
        chargeRate: chargeRatePence,
        isDefault: formData.isDefault,
        createdAt: new Date(),
      };
      setLabourRates([...newRates, newRate]);
    }
    
    setFormData(initialFormData);
    setEditingRate(null);
    setShowForm(false);
  };

  const handleEdit = (rate: LabourRateTemplate) => {
    setEditingRate(rate);
    setFormData({
      name: rate.name,
      role: rate.role,
      costRate: rate.costRate / 100,
      chargeRate: rate.chargeRate / 100,
      isDefault: rate.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this labour rate?')) {
      setLabourRates((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setLabourRates((prev) =>
      prev.map((r) => ({
        ...r,
        isDefault: r.id === id,
      }))
    );
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingRate(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Labour Rates</h1>
              <p className="text-sm text-gray-700 mt-1">Manage your workforce cost and charge rates</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Labour Rate
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-700">Total Rates</div>
            <div className="text-2xl font-semibold text-gray-900">{labourRates.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-700">Default Bricklayer Rate</div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(
                labourRates.find((r) => r.isDefault && r.role === 'Bricklayer')?.chargeRate || 0
              )}
              /day
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-700">Default Labourer Rate</div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(
                labourRates.find((r) => r.isDefault && r.role === 'Labourer')?.chargeRate || 0
              )}
              /day
            </div>
          </div>
        </div>

        {/* Labour Rates Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Cost/Day
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Charge/Day
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Markup
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-700">
                    {searchQuery
                      ? 'No labour rates match your search'
                      : 'No labour rates yet. Add your first rate!'}
                  </td>
                </tr>
              ) : (
                filteredRates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(rate)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rate.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {rate.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      {formatCurrency(rate.costRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(rate.chargeRate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      {calculateMargin(rate.costRate, rate.chargeRate)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                      {calculateMarkup(rate.costRate, rate.chargeRate)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {rate.isDefault ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Default
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(rate.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Set Default
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(rate.id);
                        }}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRate ? 'Edit Labour Rate' : 'Add Labour Rate'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard Bricklayer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Day (£) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.costRate}
                    onChange={(e) =>
                      setFormData({ ...formData, costRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="180.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-700 mt-1">Your cost for this worker</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Charge per Day (£) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.chargeRate}
                    onChange={(e) =>
                      setFormData({ ...formData, chargeRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="280.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-700 mt-1">What you charge the customer</p>
                </div>
              </div>

              {/* Preview */}
              {formData.costRate > 0 && formData.chargeRate > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Profit Preview</h4>
                  <div className="text-sm text-gray-700">
                    <p>
                      Profit per day:{' '}
                      <strong className="text-green-600">
                        {formatCurrency((formData.chargeRate - formData.costRate) * 100)}
                      </strong>
                    </p>
                    <p>
                      Margin:{' '}
                      <strong>
                        {calculateMargin(formData.costRate * 100, formData.chargeRate * 100)}%
                      </strong>
                    </p>
                    <p>
                      Markup:{' '}
                      <strong>
                        {calculateMarkup(formData.costRate * 100, formData.chargeRate * 100)}%
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                  Set as default rate for this role
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRate ? 'Save Changes' : 'Add Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}