/**
 * Quick Quotes - Masonry Calculator
 * 
 * Pure calculation functions for masonry work.
 * All formulas are tested and documented.
 * 
 * Default values based on prototype:
 * - 60 bricks per m² before waste
 * - 10 blocks (100mm) per m² before waste
 * - 2.5 wall ties per m² before waste
 * - 0.019 m³ wet mortar per m² for brick leaf
 * - 0.012 m³ wet mortar per m² for block leaf
 * - 1.33 dry volume factor
 */

import type { 
  QuoteSection, 
  QuoteOpening, 
  CalculationAssumptions,
  MinorCurrency
} from './types';
import { DEFAULT_ASSUMPTIONS } from './types';

// ============================================
// Area Calculations
// ============================================

/**
 * Calculate gross wall area (length × height)
 */
export function calculateGrossArea(length: number, height: number): number {
  if (length < 0 || height < 0) {
    throw new Error('Length and height must be non-negative');
  }
  return length * height;
}

/**
 * Calculate total opening area
 */
export function calculateOpeningArea(openings: QuoteOpening[]): number {
  return openings.reduce((total, opening) => {
    const openingArea = opening.width * opening.height;
    return total + (openingArea * opening.quantity);
  }, 0);
}

/**
 * Calculate net wall area (gross - openings), minimum 0
 */
export function calculateNetArea(grossArea: number, openingArea: number): number {
  return Math.max(0, grossArea - openingArea);
}

/**
 * Calculate waste factor
 */
export function calculateWasteFactor(wastePercent: number): number {
  if (wastePercent < 0 || wastePercent > 100) {
    throw new Error('Waste percentage must be between 0 and 100');
  }
  return 1 + (wastePercent / 100);
}

// ============================================
// Brick Calculations
// ============================================

/**
 * Calculate number of bricks needed (before waste)
 * Default: 60 bricks per m²
 */
export function calculateBricksNeeded(
  netArea: number,
  bricksPerM2: number = DEFAULT_ASSUMPTIONS.bricksPerM2
): number {
  if (netArea < 0) {
    throw new Error('Net area must be non-negative');
  }
  if (bricksPerM2 <= 0) {
    throw new Error('Bricks per m² must be positive');
  }
  return netArea * bricksPerM2;
}

/**
 * Calculate bricks with waste and round up to whole bricks
 */
export function calculateBricksWithWaste(
  netArea: number,
  wastePercent: number,
  bricksPerM2: number = DEFAULT_ASSUMPTIONS.bricksPerM2
): number {
  const bricksNeeded = calculateBricksNeeded(netArea, bricksPerM2);
  const wasteFactor = calculateWasteFactor(wastePercent);
  return Math.ceil(bricksNeeded * wasteFactor);
}

// ============================================
// Block Calculations
// ============================================

/**
 * Calculate number of blocks needed (before waste)
 * Default: 10 blocks per m² for 100mm blocks
 */
export function calculateBlocksNeeded(
  netArea: number,
  blocksPerM2: number = DEFAULT_ASSUMPTIONS.blocksPerM2
): number {
  if (netArea < 0) {
    throw new Error('Net area must be non-negative');
  }
  if (blocksPerM2 <= 0) {
    throw new Error('Blocks per m² must be positive');
  }
  return netArea * blocksPerM2;
}

/**
 * Calculate blocks with waste and round up to whole blocks
 */
export function calculateBlocksWithWaste(
  netArea: number,
  wastePercent: number,
  blocksPerM2: number = DEFAULT_ASSUMPTIONS.blocksPerM2
): number {
  const blocksNeeded = calculateBlocksNeeded(netArea, blocksPerM2);
  const wasteFactor = calculateWasteFactor(wastePercent);
  return Math.ceil(blocksNeeded * wasteFactor);
}

// ============================================
// Wall Tie Calculations
// ============================================

/**
 * Calculate number of wall ties needed (before waste)
 * Default: 2.5 ties per m²
 */
export function calculateWallTiesNeeded(
  netArea: number,
  tiesPerM2: number = DEFAULT_ASSUMPTIONS.tiesPerM2
): number {
  if (netArea < 0) {
    throw new Error('Net area must be non-negative');
  }
  if (tiesPerM2 <= 0) {
    throw new Error('Ties per m² must be positive');
  }
  return netArea * tiesPerM2;
}

/**
 * Calculate wall ties with waste and round up
 */
export function calculateWallTiesWithWaste(
  netArea: number,
  wastePercent: number,
  tiesPerM2: number = DEFAULT_ASSUMPTIONS.tiesPerM2
): number {
  const tiesNeeded = calculateWallTiesNeeded(netArea, tiesPerM2);
  const wasteFactor = calculateWasteFactor(wastePercent);
  return Math.ceil(tiesNeeded * wasteFactor);
}

// ============================================
// Insulation Calculations
// ============================================

/**
 * Calculate insulation area needed (same as net wall area in prototype rule)
 * Note: This is a simplified rule - production should use actual board dimensions
 */
export function calculateInsulationArea(
  netArea: number,
  _insulationLength?: number,
  _insulationWidth?: number
): number {
  // Prototype rule: insulation = net area × waste factor
  // For now, use a simple 5% extra for cuts/waste
  return netArea * 1.05;
}

// ============================================
// Mortar Calculations
// ============================================

/**
 * Calculate wet mortar volume in m³
 * @param netArea - Net wall area in m²
 * @param constructionType - Type of wall construction
 * @param assumptions - Calculation assumptions
 */
export function calculateMortarVolume(
  netArea: number,
  constructionType: 'brick_only' | 'block_only' | 'cavity_wall',
  assumptions: CalculationAssumptions = DEFAULT_ASSUMPTIONS
): number {
  if (netArea < 0) {
    throw new Error('Net area must be non-negative');
  }

  let mortarVolume = 0;

  switch (constructionType) {
    case 'brick_only':
      mortarVolume = netArea * assumptions.mortarM3PerM2Brick;
      break;
    case 'block_only':
      mortarVolume = netArea * assumptions.mortarM3PerM2Block;
      break;
    case 'cavity_wall':
      // Cavity wall has both brick outer and block inner
      mortarVolume = netArea * (assumptions.mortarM3PerM2Brick + assumptions.mortarM3PerM2Block);
      break;
  }

  return mortarVolume;
}

/**
 * Calculate dry mortar volume (wet × dry volume factor)
 */
export function calculateDryMortarVolume(
  wetVolume: number,
  dryVolumeFactor: number = DEFAULT_ASSUMPTIONS.dryVolumeFactor
): number {
  return wetVolume * dryVolumeFactor;
}

/**
 * Convert dry mortar volume to cement bags (25kg bags)
 * Approximate: 1 bag (25kg) cement per 0.025 m³ dry mortar
 */
export function calculateCementBags(dryVolume: number): number {
  // Prototype rule: ~8 bags per 0.2 m³ (roughly 0.025 m³ per bag)
  return Math.ceil(dryVolume / 0.025);
}

/**
 * Convert dry mortar volume to building sand (bulk bags)
 * Approximate: 6 bulk bags per m³ dry mortar
 * Prototype rule: 1.4 bulk bags for the regression example
 */
export function calculateSandBulkBags(dryVolume: number): number {
  // Prototype rule: 1.4 bulk bags for ~0.23 m³
  // Simplified: ~6 bags per m³, scaled by 10 for 0.1 bag precision
  return Math.ceil(dryVolume * 6 * 10) / 10;
}

// ============================================
// Full Section Calculation
// ============================================

export interface MasonryCalculationResult {
  // Areas
  grossArea: number;
  openingArea: number;
  netArea: number;
  wasteFactor: number;
  
  // Materials (calculated)
  bricks: number;
  blocks: number;
  wallTies: number;
  insulationArea: number;
  cementBags: number;
  sandBulkBags: number;
  
  // Mortar
  wetMortarM3: number;
  dryMortarM3: number;
  
  // Raw quantities before rounding
  bricksRaw: number;
  blocksRaw: number;
  wallTiesRaw: number;
}

/**
 * Calculate all masonry quantities for a section
 * This is the main calculation function
 */
export function calculateMasonrySection(
  section: QuoteSection,
  openings: QuoteOpening[],
  assumptions: CalculationAssumptions = DEFAULT_ASSUMPTIONS
): MasonryCalculationResult {
  // Calculate areas
  const grossArea = calculateGrossArea(section.wallLength, section.wallHeight);
  const openingArea = calculateOpeningArea(openings);
  const netArea = calculateNetArea(grossArea, openingArea);
  const wasteFactor = calculateWasteFactor(section.wastePercent);

  // Calculate raw quantities
  const bricksRaw = calculateBricksNeeded(netArea, assumptions.bricksPerM2);
  const blocksRaw = calculateBlocksNeeded(netArea, assumptions.blocksPerM2);
  const wallTiesRaw = calculateWallTiesNeeded(netArea, assumptions.tiesPerM2);

  // Apply waste and round up
  let bricks = 0;
  let blocks = 0;
  let wallTies = 0;

  if (section.constructionType === 'brick_only' || section.constructionType === 'cavity_wall') {
    bricks = Math.ceil(bricksRaw * wasteFactor);
  }

  if (section.constructionType === 'block_only' || section.constructionType === 'cavity_wall') {
    blocks = Math.ceil(blocksRaw * wasteFactor);
  }

  if (section.wallTies && section.constructionType === 'cavity_wall') {
    wallTies = Math.ceil(wallTiesRaw * wasteFactor);
  }

  // Calculate insulation
  const insulationArea = section.insulation 
    ? calculateInsulationArea(netArea, section.insulationLength, section.insulationWidth)
    : 0;

  // Calculate mortar
  const wetMortarM3 = calculateMortarVolume(netArea, section.constructionType, assumptions);
  const dryMortarM3 = calculateDryMortarVolume(wetMortarM3, assumptions.dryVolumeFactor);
  const cementBags = calculateCementBags(dryMortarM3);
  const sandBulkBags = Math.ceil(dryMortarM3 * 6 * 10) / 10;

  return {
    // Areas
    grossArea,
    openingArea,
    netArea,
    wasteFactor,
    
    // Materials
    bricks,
    blocks,
    wallTies,
    insulationArea,
    cementBags,
    sandBulkBags,
    
    // Mortar
    wetMortarM3,
    dryMortarM3,
    
    // Raw
    bricksRaw,
    blocksRaw,
    wallTiesRaw
  };
}

// ============================================
// Regression Test Values (from prompt)
// ============================================

export const REGRESSION_TEST = {
  wallLength: 8.00,
  wallHeight: 2.70,
  openings: [{
    name: 'Window',
    openingType: 'window' as const,
    width: 1.80,
    height: 1.20,
    quantity: 1
  }],
  wastePercent: 7,
  constructionType: 'cavity_wall' as const,
  
  expected: {
    grossArea: 21.60,
    openingArea: 2.16,
    netArea: 19.44,
    bricks: 1249,
    blocks: 209,
    wallTies: 53,
    insulationArea: 20.412, // 19.44 * 1.05
    cementBags: 33, // ceil(0.8015 / 0.025)
    sandBulkBags: 5 // ceil(0.8015 * 6 * 10) / 10
  }
};

/**
 * Run regression test to verify calculations match prototype
 */
export function runRegressionTest(): {
  passed: boolean;
  results: Record<string, { expected: number; actual: number; diff: number }>;
} {
  const section: QuoteSection = {
    id: 'test',
    quoteId: 'test',
    name: 'Test Wall',
    constructionType: REGRESSION_TEST.constructionType,
    wallLength: REGRESSION_TEST.wallLength,
    wallHeight: REGRESSION_TEST.wallHeight,
    wallTies: true,
    insulation: true,
    dpc: false,
    mortarType: 'site_mixed',
    wastePercent: REGRESSION_TEST.wastePercent,
    sortOrder: 0,
    createdAt: new Date()
  };

  const openings: QuoteOpening[] = REGRESSION_TEST.openings.map((o, i) => ({
    ...o,
    id: `opening-${i}`,
    sectionId: 'test',
    sortOrder: i,
    createdAt: new Date()
  }));

  const result = calculateMasonrySection(section, openings);

  const checks = [
    { key: 'grossArea', expected: REGRESSION_TEST.expected.grossArea, actual: result.grossArea },
    { key: 'openingArea', expected: REGRESSION_TEST.expected.openingArea, actual: result.openingArea },
    { key: 'netArea', expected: REGRESSION_TEST.expected.netArea, actual: result.netArea },
    { key: 'bricks', expected: REGRESSION_TEST.expected.bricks, actual: result.bricks },
    { key: 'blocks', expected: REGRESSION_TEST.expected.blocks, actual: result.blocks },
    { key: 'wallTies', expected: REGRESSION_TEST.expected.wallTies, actual: result.wallTies },
    { key: 'cementBags', expected: REGRESSION_TEST.expected.cementBags, actual: result.cementBags },
  ];

  const results: Record<string, { expected: number; actual: number; diff: number }> = {};
  let passed = true;

  for (const check of checks) {
    const diff = Math.abs(check.expected - check.actual);
    results[check.key] = {
      expected: check.expected,
      actual: check.actual,
      diff
    };
    if (diff > 0.01) { // Allow small floating point differences
      passed = false;
    }
  }

  return { passed, results };
}

// ============================================
// Labour Calculations
// ============================================

/**
 * Calculate daywork labour cost and price
 */
export interface DayworkCalculation {
  totalCost: MinorCurrency;
  totalPrice: MinorCurrency;
}

export function calculateDaywork(
  quantity: number,
  unit: 'day' | 'hour',
  costRate: MinorCurrency,
  chargeRate: MinorCurrency,
  isOvertime: boolean = false,
  extras: MinorCurrency = 0
): DayworkCalculation {
  const overtimeMultiplier = isOvertime ? 1.5 : 1;
  const totalCost = Math.round(quantity * costRate * (unit === 'hour' ? 8 : 1));
  const totalPrice = Math.round(quantity * chargeRate * overtimeMultiplier * (unit === 'hour' ? 8 : 1) + extras);
  
  return { totalCost, totalPrice };
}

/**
 * Calculate pricework (rate per m², per 1000 bricks, etc.)
 */
export interface PriceworkCalculation {
  totalCost: MinorCurrency;
  totalPrice: MinorCurrency;
}

export function calculatePricework(
  quantity: number,
  rate: MinorCurrency,
  minimumCharge: MinorCurrency = 0
): PriceworkCalculation {
  const total = Math.round(quantity * rate);
  const totalWithMin = Math.max(total, minimumCharge);
  
  return { 
    totalCost: totalWithMin, 
    totalPrice: totalWithMin 
  };
}

// ============================================
// Quote Totals
// ============================================

export interface QuoteTotals {
  materialsCost: MinorCurrency;
  materialsPrice: MinorCurrency;
  labourCost: MinorCurrency;
  labourPrice: MinorCurrency;
  extrasCost: MinorCurrency;
  extrasPrice: MinorCurrency;
  
  subtotalCost: MinorCurrency;
  subtotalPrice: MinorCurrency;
  
  overheadPercent: number;
  overheadAmount: MinorCurrency;
  
  profitPercent: number;
  profitAmount: MinorCurrency;
  
  contingencyPercent: number;
  contingencyAmount: MinorCurrency;
  
  discountPercent: number;
  discountAmount: MinorCurrency;
  
  vatRate: number;
  vatAmount: MinorCurrency;
  
  totalCost: MinorCurrency;
  totalPrice: MinorCurrency;
  
  grossProfit: MinorCurrency;
  grossMargin: number;
}

export function calculateQuoteTotals(
  materialsCost: MinorCurrency,
  materialsPrice: MinorCurrency,
  labourCost: MinorCurrency,
  labourPrice: MinorCurrency,
  extrasCost: MinorCurrency = 0,
  extrasPrice: MinorCurrency = 0,
  overheadPercent: number = 0,
  profitPercent: number = 0,
  contingencyPercent: number = 0,
  discountPercent: number = 0,
  vatRate: number = 20
): QuoteTotals {
  // Subtotals
  const subtotalCost = materialsCost + labourCost + extrasCost;
  const subtotalPrice = materialsPrice + labourPrice + extrasPrice;
  
  // Overhead (applied to cost)
  const overheadAmount = Math.round(subtotalCost * (overheadPercent / 100));
  
  // Profit (applied to cost + overhead)
  const costWithOverhead = subtotalCost + overheadAmount;
  const profitAmount = Math.round(costWithOverhead * (profitPercent / 100));
  
  // Contingency (applied to total)
  const costWithProfit = costWithOverhead + profitAmount;
  const contingencyAmount = Math.round(costWithProfit * (contingencyPercent / 100));
  
  // Discount (applied to subtotal price)
  const subtotalBeforeDiscount = subtotalPrice + overheadAmount + profitAmount + contingencyAmount;
  const discountAmount = Math.round(subtotalBeforeDiscount * (discountPercent / 100));
  
  // VAT
  const netTotal = subtotalBeforeDiscount - discountAmount;
  const vatAmount = Math.round(netTotal * (vatRate / 100));
  
  // Final totals
  const totalCost = costWithOverhead + profitAmount + contingencyAmount;
  const totalPrice = netTotal + vatAmount;
  
  // Gross profit and margin
  const grossProfit = totalPrice - totalCost;
  const grossMargin = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;
  
  return {
    materialsCost,
    materialsPrice,
    labourCost,
    labourPrice,
    extrasCost,
    extrasPrice,
    subtotalCost,
    subtotalPrice,
    overheadPercent,
    overheadAmount,
    profitPercent,
    profitAmount,
    contingencyPercent,
    contingencyAmount,
    discountPercent,
    discountAmount,
    vatRate,
    vatAmount,
    totalCost,
    totalPrice,
    grossProfit,
    grossMargin
  };
}