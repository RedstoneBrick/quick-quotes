'use client';

import { useState } from 'react';
import { Material, SupplierProduct, ApprovedPrice, formatCurrency } from '@/lib/types';

// Mock suppliers
const mockSuppliers = [
  { id: '1', name: 'Bricks UK' },
  { id: '2', name: 'Celcon' },
  { id: '3', name: 'Tarmac' },
  { id: '4', name: 'Local Quarry' },
];

// Mock materials
const mockMaterials: Material[] = [
  {
    id: '1',
    category: 'Bricks',
    name: 'Red Multi Brick',
    specification: '215mm x 102.5mm x 65mm',
    manufacturer: 'Bricks UK',
    manufacturerCode: 'RED-MULTI-01',
    unitOfMeasure: 'each',
    packQuantity: 520,
    vatRate: 20,
    wasteDefault: 7,
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    category: 'Blocks',
    name: 'Dense Concrete Block',
    specification: '440mm x 215mm x 100mm',
    manufacturer: 'Celcon',
    manufacturerCode: 'HAD100',
    unitOfMeasure: 'each',
    packQuantity: 60,
    vatRate: 20,
    wasteDefault: 5,
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    category: 'Mortar',
    name: 'Ready Mixed Mortar - Grey',
    specification: 'Bag 20kg',
    manufacturer: 'Tarmac',
    manufacturerCode: 'MORTAR-GREY-20',
    unitOfMeasure: 'bag',
    packQuantity: 1,
    vatRate: 20,
    wasteDefault: 5,
    isActive: true,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    category: 'Insulation',
    name: 'Cavity Wall Insulation Board',
    specification: '450mm x 1200mm x 50mm',
    manufacturer: 'Kingspan',
    manufacturerCode: 'TW50',
    unitOfMeasure: 'sheet',
    packQuantity: 12,
    vatRate: 20,
    wasteDefault: 10,
    isActive: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    category: 'Ties',
    name: 'Cavity Wall Tie - Type 2',
    specification: '200mm length',
    manufacturer: 'Ancon',
    manufacturerCode: 'CWT2-200',
    unitOfMeasure: 'each',
    packQuantity: 250,
    vatRate: 20,
    wasteDefault: 5,
    isActive: true,
    createdAt: new Date('2024-02-10'),
  },
];

// Mock prices
const mockPrices: (ApprovedPrice & { material: Material; supplierName?: string })[] = [
  {
    id: '1',
    materialId: '1',
    supplierProductId: 'sp-1',
    price: 52000, // £520 for pack of 520
    vatStatus: 'exclusive',
    packQuantity: 520,
    unitPrice: 100, // 100p per brick
    sourceObservationId: 'obs-1',
    validFrom: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    material: mockMaterials[0],
    supplierName: 'Bricks UK',
  },
  {
    id: '2',
    materialId: '2',
    supplierProductId: 'sp-2',
    price: 2460, // £24.60 for pack of 60
    vatStatus: 'exclusive',
    packQuantity: 60,
    unitPrice: 41, // 41p per block
    sourceObservationId: 'obs-2',
    validFrom: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    material: mockMaterials[1],
    supplierName: 'Celcon',
  },
  {
    id: '3',
    materialId: '3',
    supplierProductId: 'sp-3',
    price: 480, // £4.80 per bag
    vatStatus: 'exclusive',
    packQuantity: 1,
    unitPrice: 480,
    sourceObservationId: 'obs-3',
    validFrom: new Date('2024-01-20'),
    createdAt: new Date('2024-01-20'),
    material: mockMaterials[2],
    supplierName: 'Tarmac',
  },
];

type PriceFormData = {
  materialId: string;
  supplierName: string;
  packPrice: string;
  packQuantity: string;
  vatStatus: 'inclusive' | 'exclusive';
};

const initialFormData: PriceFormData = {
  materialId: '',
  supplierName: '',
  packPrice: '',
  packQuantity: '',
  vatStatus: 'exclusive',
};

export default function PricesPage() {
  const [prices, setPrices] = useState(mockPrices);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState<typeof prices[0] | null>(null);
  const [formData, setFormData] = useState<PriceFormData>(initialFormData);

  const filteredPrices = prices.filter(
    (p) =>
      p.material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const material = mockMaterials.find((m) => m.id === formData.materialId);
    if (!material) return;

    const packPrice = parseFloat(formData.packPrice) * 100; // Convert to pence
    const packQuantity = parseInt(formData.packQuantity) || 1;
    const unitPrice = Math.round(packPrice / packQuantity);
    const vatMultiplier = formData.vatStatus === 'inclusive' ? 1.2 : 1;
    const priceExclVat = Math.round(packPrice / vatMultiplier);

    if (editingPrice) {
      setPrices((prev) =>
        prev.map((p) =>
          p.id === editingPrice.id
            ? {
                ...p,
                price: priceExclVat,
                vatStatus: formData.vatStatus,
                packQuantity,
                unitPrice,
                material,
                supplierName: formData.supplierName,
              }
            : p
        )
      );
    } else {
      const newPrice: (typeof prices)[0] & { id: string } = {
        id: Date.now().toString(),
        materialId: formData.materialId,
        price: priceExclVat,
        vatStatus: formData.vatStatus,
        packQuantity,
        unitPrice,
        sourceObservationId: undefined,
        validFrom: new Date(),
        createdAt: new Date(),
        material,
        supplierName: formData.supplierName,
      };
      setPrices((prev) => [...prev, newPrice]);
    }
    
    setFormData(initialFormData);
    setEditingPrice(null);
    setShowForm(false);
  };

  const handleEdit = (price: typeof prices[0]) => {
    setEditingPrice(price);
    setFormData({
      materialId: price.materialId,
      supplierName: price.supplierName || '',
      packPrice: (price.price / 100).toFixed(2),
      packQuantity: price.packQuantity?.toString() || '1',
      vatStatus: price.vatStatus,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this price?')) {
      setPrices((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingPrice(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Price Book</h1>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Price
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by material name, category or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pack Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pack Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  VAT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery
                      ? 'No prices match your search'
                      : 'No prices yet. Add your first price!'}
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price) => (
                  <tr
                    key={price.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(price)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{price.material.name}</div>
                      <div className="text-xs text-gray-500">{price.material.specification}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {price.material.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {price.supplierName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(price.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                      {price.packQuantity || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                      {formatCurrency(price.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {price.vatStatus === 'inclusive' ? 'Inc. VAT' : 'Ex. VAT'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(price.id);
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
                {editingPrice ? 'Edit Price' : 'Add New Price'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material *
                </label>
                <select
                  required
                  value={formData.materialId}
                  onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select a material</option>
                  {mockMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} - {m.specification}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="e.g. Bricks UK"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Price (£) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.packPrice}
                    onChange={(e) => setFormData({ ...formData, packPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.packQuantity}
                    onChange={(e) => setFormData({ ...formData, packQuantity: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price is *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="vatStatus"
                      value="exclusive"
                      checked={formData.vatStatus === 'exclusive'}
                      onChange={(e) =>
                        setFormData({ ...formData, vatStatus: e.target.value as 'exclusive' })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Excluding VAT</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="vatStatus"
                      value="inclusive"
                      checked={formData.vatStatus === 'inclusive'}
                      onChange={(e) =>
                        setFormData({ ...formData, vatStatus: e.target.value as 'inclusive' })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Including VAT</span>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {formData.packPrice && formData.packQuantity && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Price Preview</h4>
                  <div className="text-sm text-gray-600">
                    <p>
                      Pack price: <strong>£{formData.packPrice}</strong>
                    </p>
                    <p>
                      Pack quantity: <strong>{formData.packQuantity}</strong> units
                    </p>
                    <p>
                      Unit price:{' '}
                      <strong>
                        £{((parseFloat(formData.packPrice) || 0) / (parseInt(formData.packQuantity) || 1)).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>
              )}

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
                  {editingPrice ? 'Save Changes' : 'Add Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}