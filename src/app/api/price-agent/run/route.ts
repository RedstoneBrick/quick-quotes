// Price Agent Run API Route
// Protected endpoint to manually trigger price checking

import { NextResponse } from 'next/server';
import type { PriceAgentRun, SupplierProduct, PriceObservation } from '@/lib/types';

// Mock connector for demo data
// In production, this would be replaced with actual supplier API integrations
const mockConnector = {
  async fetchPrices(supplierId: string, products: SupplierProduct[]): Promise<PriceObservation[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const observations: PriceObservation[] = [];
    
    for (const product of products) {
      // Generate mock price variation
      const basePrice = product.packPrice || 10000; // Default 100 GBP in pence
      const variation = (Math.random() - 0.5) * 0.2; // -10% to +10%
      const newPrice = Math.round(basePrice * (1 + variation));
      
      observations.push({
        id: `obs-${product.id}-${Date.now()}`,
        supplierProductId: product.id,
        observationTime: new Date(),
        sourceUrl: product.sourceUrl,
        observedPrice: newPrice,
        observedVatStatus: 'exclusive',
        confidence: 0.7 + Math.random() * 0.25,
        isApproved: false,
        createdAt: new Date(),
      });
    }
    
    return observations;
  }
};

// Get enabled supplier products (mock)
function getEnabledSupplierProducts(): SupplierProduct[] {
  return [
    { id: 'p1', supplierId: 's1', title: 'Red Brick Class A - Pack of 500', packQuantity: 500, packPrice: 42500, sourceUrl: 'https://example.com/bricks', isAvailable: true, sourceStatus: 'ok', createdAt: new Date(), updatedAt: new Date() },
    { id: 'p2', supplierId: 's1', title: 'Red Brick Class B - Pack of 500', packQuantity: 500, packPrice: 38000, sourceUrl: 'https://example.com/bricks', isAvailable: true, sourceStatus: 'ok', createdAt: new Date(), updatedAt: new Date() },
    { id: 'p3', supplierId: 's2', title: 'Concrete Block 7N - Pack of 40', packQuantity: 40, packPrice: 3840, sourceUrl: 'https://example.com/blocks', isAvailable: true, sourceStatus: 'ok', createdAt: new Date(), updatedAt: new Date() },
    { id: 'p4', supplierId: 's2', title: 'Dense Block - Pack of 50', packQuantity: 50, packPrice: 5200, sourceUrl: 'https://example.com/blocks', isAvailable: true, sourceStatus: 'ok', createdAt: new Date(), updatedAt: new Date() },
    { id: 'p5', supplierId: 's3', title: 'Lime Mortar Mix 25kg', packQuantity: 1, packPrice: 895, sourceUrl: 'https://example.com/mortar', isAvailable: true, sourceStatus: 'ok', createdAt: new Date(), updatedAt: new Date() },
    { id: 'p6', supplierId: 's3', title: 'Premixed Render 25kg - Yellow', packQuantity: 1, packPrice: 750, sourceUrl: 'https://example.com/render', isAvailable: true, sourceStatus: 'ok', createdAt: new Date(), updatedAt: new Date() },
    { id: 'p7', supplierId: 's1', title: 'Cavity Wall Tie 200mm - Box of 500', packQuantity: 500, packPrice: 4500, sourceUrl: 'https://example.com/ties', isAvailable: true, sourceStatus: 'ok', createdAt: new Date(), updatedAt: new Date() },
  ];
}

// Calculate price change statistics
function calculateStats(observations: PriceObservation[], oldPrices: Map<string, number>) {
  let productsChecked = 0;
  let productsChanged = 0;
  let productsUnchanged = 0;
  let productsReviewRequired = 0;
  let productsFailed = 0;
  
  for (const obs of observations) {
    productsChecked++;
    const oldPrice = oldPrices.get(obs.supplierProductId);
    
    if (oldPrice !== undefined && obs.observedPrice !== undefined) {
      const changePercent = Math.abs((obs.observedPrice - oldPrice) / oldPrice * 100);
      
      if (changePercent > 5) {
        // More than 5% change requires review
        productsReviewRequired++;
        productsChanged++;
      } else if (changePercent > 0) {
        productsChanged++;
        // Auto-approve small changes in production
      } else {
        productsUnchanged++;
      }
    } else {
      productsUnchanged++;
    }
  }
  
  return {
    productsChecked,
    productsChanged,
    productsUnchanged,
    productsReviewRequired,
    productsFailed
  };
}

export async function POST() {
  try {
    const startTime = new Date();
    
    // Get enabled supplier products
    const products = getEnabledSupplierProducts();
    
    // Group products by supplier
    const productsBySupplier = new Map<string, SupplierProduct[]>();
    for (const product of products) {
      const supplierProducts = productsBySupplier.get(product.supplierId) || [];
      supplierProducts.push(product);
      productsBySupplier.set(product.supplierId, supplierProducts);
    }
    
    // Create mock old prices map (in production, fetch from database)
    const oldPrices = new Map<string, number>();
    for (const product of products) {
      oldPrices.set(product.id, product.packPrice || 10000);
    }
    
    // Fetch prices from each supplier
    const allObservations: PriceObservation[] = [];
    
    for (const [supplierId, supplierProducts] of productsBySupplier) {
      try {
        const observations = await mockConnector.fetchPrices(supplierId, supplierProducts);
        allObservations.push(...observations);
      } catch (error) {
        console.error(`Failed to fetch prices from supplier ${supplierId}:`, error);
        // Continue with other suppliers
      }
    }
    
    // Calculate statistics
    const stats = calculateStats(allObservations, oldPrices);
    
    const endTime = new Date();
    
    // Create run record
    const run: PriceAgentRun = {
      id: `run-${Date.now()}`,
      startedAt: startTime,
      completedAt: endTime,
      status: 'completed',
      ...stats,
      productsSkipped: 0,
      retryCount: 0,
      createdAt: startTime,
    };
    
    // In production, save to database
    // await savePriceAgentRun(run);
    // await saveObservations(allObservations);
    
    return NextResponse.json({
      success: true,
      run,
      observations: allObservations.length,
      message: `Price check completed. Found ${stats.productsChanged} changes, ${stats.productsReviewRequired} require review.`
    });
    
  } catch (error) {
    console.error('Price agent run failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET handler to retrieve last run status
export async function GET() {
  // In production, fetch from database
  const mockLastRun: PriceAgentRun = {
    id: 'run-latest',
    startedAt: new Date('2026-06-28T08:00:00Z'),
    completedAt: new Date('2026-06-28T08:15:32Z'),
    status: 'completed',
    productsChecked: 156,
    productsChanged: 23,
    productsUnchanged: 131,
    productsReviewRequired: 8,
    productsFailed: 2,
    productsSkipped: 0,
    retryCount: 0,
    createdAt: new Date('2026-06-28T08:00:00Z'),
  };
  
  return NextResponse.json({
    success: true,
    run: mockLastRun,
  });
}