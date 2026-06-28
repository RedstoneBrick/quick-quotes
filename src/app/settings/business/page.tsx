// Business Settings Page - Organisation profile management
'use client';

import { useState, useEffect } from 'react';
import { Organisation } from '@/lib/types';

interface BusinessSettingsProps {
  organisation?: Organisation;
  onSave?: (data: Partial<Organisation>) => Promise<void>;
}

export default function BusinessSettings({ organisation, onSave }: BusinessSettingsProps) {
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    address: '',
    email: '',
    telephone: '',
    vatRegistered: false,
    vatNumber: '',
    companyNumber: '',
    defaultTerms: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (organisation) {
      setFormData({
        name: organisation.name || '',
        logoUrl: organisation.logoUrl || '',
        address: organisation.address || '',
        email: organisation.email || '',
        telephone: organisation.telephone || '',
        vatRegistered: organisation.vatRegistered || false,
        vatNumber: organisation.vatNumber || '',
        companyNumber: organisation.companyNumber || '',
        defaultTerms: organisation.defaultTerms || '',
      });
    }
  }, [organisation]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      if (onSave) {
        await onSave(formData);
      } else {
        // Default: call API to save
        const response = await fetch('/api/settings/business', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save settings');
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-700 mt-1">Manage your organisation profile and default settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Organisation Profile */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organisation Profile</h2>
          
          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                {formData.logoUrl ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No logo</span>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    Upload Logo
                  </label>
                  <p className="text-xs text-gray-700 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Company Ltd"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Business Street&#10;City&#10;County&#10;Postcode"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="info@company.co.uk"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="01234 567890"
              />
            </div>
          </div>
        </section>

        {/* VAT Settings */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">VAT Settings</h2>
          
          <div className="space-y-4">
            {/* VAT Registered */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="vatRegistered"
                name="vatRegistered"
                checked={formData.vatRegistered}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="vatRegistered" className="text-sm font-medium text-gray-700">
                Registered for VAT
              </label>
            </div>

            {/* VAT Number */}
            {formData.vatRegistered && (
              <div>
                <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  VAT Number
                </label>
                <input
                  type="text"
                  id="vatNumber"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="GB123456789"
                />
              </div>
            )}
          </div>
        </section>

        {/* Company Details */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
          
          <div>
            <label htmlFor="companyNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Company Number
            </label>
            <input
              type="text"
              id="companyNumber"
              name="companyNumber"
              value={formData.companyNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="01234567"
            />
          </div>
        </section>

        {/* Default Terms */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Quote Terms</h2>
          
          <div>
            <label htmlFor="defaultTerms" className="block text-sm font-medium text-gray-700 mb-1">
              Terms and Conditions
            </label>
            <textarea
              id="defaultTerms"
              name="defaultTerms"
              rows={5}
              value={formData.defaultTerms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Payment terms: Payment due within 30 days of invoice...&#10;Validity: Quote valid for 30 days..."
            />
            <p className="text-xs text-gray-700 mt-1">
              These terms will be applied to all new quotes by default
            </p>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          {saved && (
            <span className="text-green-600 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}