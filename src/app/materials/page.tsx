'use client';

import { useState } from 'react';
import { Material, VAT_RATES } from '@/lib/types';

// Categories
const CATEGORIES = [
  'Bricks',
  'Blocks',
  'Mortar',
  'Insulation',
  'Ties',
  'DPC',
  'Sand',
  'Cement',
  'Lime',
  'Aggregates',
  'Steel',
  'Timber',
  'Other',
];

// Mock data for demo
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
  {
    id: '6',
    category: 'Sand',
    name: 'Building Sand',
    specification: 'Fine grade',
    unitOfMeasure: 'tonne',
    packQuantity: 1,
    vatRate: 20,
    wasteDefault: 15,
    isActive: true,
    createdAt: new Date('2024-02-15'),
  },
];

type MaterialFormData = Omit<Material, 'id' | 'createdAt' | 'aliases'>;

const initialFormData: MaterialFormData = {
  category: 'Bricks',
  name: '',
  specification: '',
  manufacturer: '',
  manufacturerCode: '',
  unitOfMeasure: 'each',
  packQuantity: undefined,
  packCoverage: undefined,
  vatRate: 20,
  wasteDefault: 7,
  isActive: true,
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specification?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaterial) {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === editingMaterial.id ? { ...m, ...formData } : m
        )
      );
    } else {
      const newMaterial: Material = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      };
      setMaterials((prev) => [...prev, newMaterial]);
    }
    
    setFormData(initialFormData);
    setEditingMaterial(null);
    setShowForm(false);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      category: material.category,
      name: material.name,
      specification: material.specification || '',
      manufacturer: material.manufacturer || '',
      manufacturerCode: material.manufacturerCode || '',
      unitOfMeasure: material.unitOfMeasure,
      packQuantity: material.packQuantity,
      packCoverage: material.packCoverage,
      vatRate: material.vatRate,
      wasteDefault: material.wasteDefault,
      isActive: material.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingMaterial(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Materials</h1>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add Material
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search materials by name, spec or manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Specification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Pack Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  VAT
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-700">
                    {searchQuery || categoryFilter !== 'All'
                      ? 'No materials match your criteria'
                      : 'No materials yet. Add your first material!'}
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr
                    key={material.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEdit(material)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {material.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {material.specification || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {material.manufacturer || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {material.unitOfMeasure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {material.packQuantity || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {material.vatRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(material.id);
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specification
                </label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                  placeholder="e.g. 215mm x 102.5mm x 65mm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer Code
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturerCode}
                    onChange={(e) => setFormData({ ...formData, manufacturerCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit of Measure *
                  </label>
                  <select
                    required
                    value={formData.unitOfMeasure}
                    onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="each">Each</option>
                    <option value="bag">Bag</option>
                    <option value="tonne">Tonne</option>
                    <option value="m3">Cubic Metre</option>
                    <option value="m2">Square Metre</option>
                    <option value="metre">Metre</option>
                    <option value="sheet">Sheet</option>
                    <option value="roll">Roll</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.packQuantity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packQuantity: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Rate (%) *
                  </label>
                  <select
                    required
                    value={formData.vatRate}
                    onChange={(e) =>
                      setFormData({ ...formData, vatRate: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value={20}>Standard (20%)</option>
                    <option value={5}>Reduced (5%)</option>
                    <option value={0}>Zero (0%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Waste (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.wasteDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, wasteDefault: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active (available for quotes)
                  </label>
                </div>
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
                  {editingMaterial ? 'Save Changes' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}