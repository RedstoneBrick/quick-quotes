"use client";

import { useState } from "react";
import Link from "next/link";

interface QuoteSection {
  id: string;
  name: string;
  constructionType: string;
  wallLength: number;
  wallHeight: number;
  wastePercent: number;
}

interface QuoteOpening {
  id: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
}

export default function NewQuotePage() {
  const [sections, setSections] = useState<QuoteSection[]>([]);
  const [openings, setOpenings] = useState<QuoteOpening[]>([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddOpening, setShowAddOpening] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", constructionType: "cavity_wall", wallLength: 0, wallHeight: 0, wastePercent: 10 });
  const [newOpening, setNewOpening] = useState({ name: "", width: 0, height: 0, quantity: 1 });

  const calculateResults = () => {
    let totalBricks = 0;
    let totalBlocks = 0;
    let totalTies = 0;
    let totalArea = 0;

    sections.forEach(section => {
      const grossArea = section.wallLength * section.wallHeight;
      const openingArea = openings.reduce((sum, o) => sum + (o.width * o.height * o.quantity), 0);
      const netArea = Math.max(0, grossArea - openingArea);
      const wasteFactor = 1 + (section.wastePercent / 100);

      if (section.constructionType === "cavity_wall" || section.constructionType === "brick_only") {
        totalBricks += Math.ceil(netArea * 60 * wasteFactor);
      }
      if (section.constructionType === "cavity_wall" || section.constructionType === "block_only") {
        totalBlocks += Math.ceil(netArea * 10 * wasteFactor);
      }
      if (section.constructionType === "cavity_wall") {
        totalTies += Math.ceil(netArea * 2.5 * wasteFactor);
      }
      totalArea += netArea;
    });

    return { totalBricks, totalBlocks, totalTies, totalArea };
  };

  const results = calculateResults();

  const addSection = () => {
    setSections([...sections, { ...newSection, id: Date.now().toString() }]);
    setShowAddSection(false);
    setNewSection({ name: `Wall ${sections.length + 1}`, constructionType: "cavity_wall", wallLength: 0, wallHeight: 0, wastePercent: 10 });
  };

  const addOpening = () => {
    setOpenings([...openings, { ...newOpening, id: Date.now().toString() }]);
    setShowAddOpening(false);
    setNewOpening({ name: "", width: 0, height: 0, quantity: 1 });
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
              <span className="font-semibold text-gray-800">Quick Quotes</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/quotes" className="text-gray-900 font-medium">Quotes</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/quotes" className="text-orange-500 hover:text-orange-600 text-sm">← Back to Quotes</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">New Quote</h1>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600">
            Save Quote
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sections */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Wall Sections</h2>
              <button onClick={() => setShowAddSection(true)} className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                + Add Section
              </button>
            </div>

            {showAddSection && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                    <input type="text" value={newSection.name} onChange={e => setNewSection({...newSection, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Construction Type</label>
                    <select value={newSection.constructionType} onChange={e => setNewSection({...newSection, constructionType: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-900">
                      <option value="cavity_wall">Cavity Wall</option>
                      <option value="brick_only">Brick Only</option>
                      <option value="block_only">Block Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length (m)</label>
                    <input type="number" value={newSection.wallLength} onChange={e => setNewSection({...newSection, wallLength: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (m)</label>
                    <input type="number" value={newSection.wallHeight} onChange={e => setNewSection({...newSection, wallHeight: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waste %</label>
                    <input type="number" value={newSection.wastePercent} onChange={e => setNewSection({...newSection, wastePercent: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addSection} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Add</button>
                  <button onClick={() => setShowAddSection(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
                </div>
              </div>
            )}

            {sections.length === 0 ? (
              <p className="text-gray-700 text-center py-4">No sections added yet. Click "Add Section" to start.</p>
            ) : (
              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <div key={section.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{section.name}</h3>
                      <span className="text-sm text-gray-700">{section.wallLength}m × {section.wallHeight}m</span>
                    </div>
                    <p className="text-sm text-gray-700 capitalize">{section.constructionType.replace('_', ' ')} • {section.wastePercent}% waste</p>
                  </div>
                ))}
              </div>
            )}

            {/* Openings */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Openings (Windows/Doors)</h2>
                <button onClick={() => setShowAddOpening(true)} className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                  + Add Opening
                </button>
              </div>

              {showAddOpening && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" value={newOpening.name} onChange={e => setNewOpening({...newOpening, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-900" placeholder="e.g. Window" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input type="number" value={newOpening.quantity} onChange={e => setNewOpening({...newOpening, quantity: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Width (m)</label>
                      <input type="number" value={newOpening.width} onChange={e => setNewOpening({...newOpening, width: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height (m)</label>
                      <input type="number" value={newOpening.height} onChange={e => setNewOpening({...newOpening, height: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-gray-900" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={addOpening} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Add</button>
                    <button onClick={() => setShowAddOpening(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
                  </div>
                </div>
              )}

              {openings.length === 0 ? (
                <p className="text-gray-700 text-center py-4">No openings added. Click "Add Opening" for windows/doors.</p>
              ) : (
                <div className="space-y-3">
                  {openings.map((opening) => (
                    <div key={opening.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{opening.name}</h3>
                        <span className="text-sm text-gray-700">× {opening.quantity}</span>
                      </div>
                      <p className="text-sm text-gray-700">{opening.width}m × {opening.height}m</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Materials Required</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Bricks</p>
                <p className="text-2xl font-bold text-orange-600">{results.totalBricks.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Blocks</p>
                <p className="text-2xl font-bold text-blue-600">{results.totalBlocks.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Wall Ties</p>
                <p className="text-2xl font-bold text-gray-600">{results.totalTies.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Net Area</p>
                <p className="text-2xl font-bold text-green-600">{results.totalArea.toFixed(2)} m²</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-800 mb-4">How it works:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 60 bricks per m² (before waste)</li>
                <li>• 10 blocks per m² (before waste)</li>
                <li>• 2.5 wall ties per m² (cavity walls)</li>
                <li>• Net area = Gross area − Openings</li>
                <li>• Materials rounded up to whole units</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
