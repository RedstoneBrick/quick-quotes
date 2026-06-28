import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateGrossArea,
  calculateOpeningArea,
  calculateNetArea,
  calculateWasteFactor,
  calculateBricksNeeded,
  calculateBricksWithWaste,
  calculateBlocksNeeded,
  calculateBlocksWithWaste,
  calculateWallTiesNeeded,
  calculateWallTiesWithWaste,
  calculateMortarVolume,
  calculateDryMortarVolume,
  calculateCementBags,
  calculateSandBulkBags,
  calculateMasonrySection,
  calculateDaywork,
  calculatePricework,
  calculateQuoteTotals,
  calculateInsulationArea,
  runRegressionTest,
  REGRESSION_TEST
} from '../lib/calculator';
import type { QuoteSection, QuoteOpening, CalculationAssumptions } from '../lib/types';
import { DEFAULT_ASSUMPTIONS } from '../lib/types';

describe('Calculator - Area Calculations', () => {
  describe('calculateGrossArea', () => {
    it('should calculate gross area correctly', () => {
      expect(calculateGrossArea(8, 2.7)).toBe(21.6);
      expect(calculateGrossArea(10, 3)).toBe(30);
      expect(calculateGrossArea(5, 4)).toBe(20);
    });

    it('should handle zero values', () => {
      expect(calculateGrossArea(0, 5)).toBe(0);
      expect(calculateGrossArea(5, 0)).toBe(0);
    });

    it('should throw on negative values', () => {
      expect(() => calculateGrossArea(-1, 5)).toThrow('Length and height must be non-negative');
      expect(() => calculateGrossArea(5, -1)).toThrow('Length and height must be non-negative');
    });
  });

  describe('calculateOpeningArea', () => {
    it('should calculate single opening area', () => {
      const openings: QuoteOpening[] = [
        { id: '1', sectionId: 's1', name: 'Window', openingType: 'window', width: 1.8, height: 1.2, quantity: 1, sortOrder: 0, createdAt: new Date() }
      ];
      expect(calculateOpeningArea(openings)).toBe(2.16);
    });

    it('should calculate multiple openings with quantities', () => {
      const openings: QuoteOpening[] = [
        { id: '1', sectionId: 's1', name: 'Window', openingType: 'window', width: 1.8, height: 1.2, quantity: 2, sortOrder: 0, createdAt: new Date() },
        { id: '2', sectionId: 's1', name: 'Door', openingType: 'door', width: 0.9, height: 2.1, quantity: 1, sortOrder: 1, createdAt: new Date() }
      ];
      // (1.8 * 1.2 * 2) + (0.9 * 2.1 * 1) = 4.32 + 1.89 = 6.21
      expect(calculateOpeningArea(openings)).toBeCloseTo(6.21, 5);
    });

    it('should return 0 for empty openings array', () => {
      expect(calculateOpeningArea([])).toBe(0);
    });
  });

  describe('calculateNetArea', () => {
    it('should calculate net area correctly', () => {
      expect(calculateNetArea(21.6, 2.16)).toBe(19.44);
      expect(calculateNetArea(30, 5)).toBe(25);
    });

    it('should return 0 when openings exceed gross area', () => {
      expect(calculateNetArea(10, 15)).toBe(0);
    });

    it('should handle zero values', () => {
      expect(calculateNetArea(10, 0)).toBe(10);
      expect(calculateNetArea(0, 5)).toBe(0);
    });
  });

  describe('calculateWasteFactor', () => {
    it('should calculate waste factor correctly', () => {
      expect(calculateWasteFactor(0)).toBe(1);
      expect(calculateWasteFactor(7)).toBe(1.07);
      expect(calculateWasteFactor(10)).toBe(1.1);
      expect(calculateWasteFactor(100)).toBe(2);
    });

    it('should throw on invalid values', () => {
      expect(() => calculateWasteFactor(-1)).toThrow('Waste percentage must be between 0 and 100');
      expect(() => calculateWasteFactor(101)).toThrow('Waste percentage must be between 0 and 100');
    });
  });
});

describe('Calculator - Brick Calculations', () => {
  describe('calculateBricksNeeded', () => {
    it('should calculate bricks needed correctly', () => {
      // Default 60 bricks per m²
      expect(calculateBricksNeeded(1)).toBe(60);
      expect(calculateBricksNeeded(19.44)).toBeCloseTo(1166.4, 1);
    });

    it('should handle custom bricks per m²', () => {
      expect(calculateBricksNeeded(1, 50)).toBe(50);
      expect(calculateBricksNeeded(10, 72)).toBe(720);
    });

    it('should throw on negative net area', () => {
      expect(() => calculateBricksNeeded(-1)).toThrow('Net area must be non-negative');
    });

    it('should throw on zero or negative bricks per m²', () => {
      expect(() => calculateBricksNeeded(1, 0)).toThrow('Bricks per m² must be positive');
      expect(() => calculateBricksNeeded(1, -5)).toThrow('Bricks per m² must be positive');
    });
  });

  describe('calculateBricksWithWaste', () => {
    it('should calculate bricks with waste correctly', () => {
      expect(calculateBricksWithWaste(19.44, 7)).toBe(1249);
    });

    it('should round up to whole bricks', () => {
      // 60 bricks * 1.07 = 64.2, should round up to 65
      expect(calculateBricksWithWaste(1, 7)).toBe(65);
    });

    it('should handle zero waste', () => {
      expect(calculateBricksWithWaste(1, 0)).toBe(60);
    });
  });
});

describe('Calculator - Block Calculations', () => {
  describe('calculateBlocksNeeded', () => {
    it('should calculate blocks needed correctly', () => {
      // Default 10 blocks per m²
      expect(calculateBlocksNeeded(1)).toBe(10);
      expect(calculateBlocksNeeded(19.44)).toBeCloseTo(194.4, 1);
    });

    it('should handle custom blocks per m²', () => {
      expect(calculateBlocksNeeded(1, 12.5)).toBe(12.5);
    });

    it('should throw on negative values', () => {
      expect(() => calculateBlocksNeeded(-1)).toThrow('Net area must be non-negative');
      expect(() => calculateBlocksNeeded(1, 0)).toThrow('Blocks per m² must be positive');
    });
  });

  describe('calculateBlocksWithWaste', () => {
    it('should calculate blocks with waste correctly', () => {
      expect(calculateBlocksWithWaste(19.44, 7)).toBe(209);
    });

    it('should round up to whole blocks', () => {
      expect(calculateBlocksWithWaste(1, 7)).toBe(11);
    });
  });
});

describe('Calculator - Wall Tie Calculations', () => {
  describe('calculateWallTiesNeeded', () => {
    it('should calculate wall ties needed correctly', () => {
      // Default 2.5 ties per m²
      expect(calculateWallTiesNeeded(1)).toBe(2.5);
      expect(calculateWallTiesNeeded(19.44)).toBeCloseTo(48.6, 1);
    });

    it('should throw on negative values', () => {
      expect(() => calculateWallTiesNeeded(-1)).toThrow('Net area must be non-negative');
      expect(() => calculateWallTiesNeeded(1, 0)).toThrow('Ties per m² must be positive');
    });
  });

  describe('calculateWallTiesWithWaste', () => {
    it('should calculate wall ties with waste correctly', () => {
      expect(calculateWallTiesWithWaste(19.44, 7)).toBe(53);
    });

    it('should round up', () => {
      expect(calculateWallTiesWithWaste(1, 7)).toBe(3);
    });
  });
});

describe('Calculator - Mortar Calculations', () => {
  describe('calculateMortarVolume', () => {
    it('should calculate mortar for brick_only construction', () => {
      const result = calculateMortarVolume(10, 'brick_only');
      expect(result).toBeCloseTo(0.19, 3); // 10 * 0.019
    });

    it('should calculate mortar for block_only construction', () => {
      const result = calculateMortarVolume(10, 'block_only');
      expect(result).toBeCloseTo(0.12, 3); // 10 * 0.012
    });

    it('should calculate mortar for cavity_wall construction', () => {
      const result = calculateMortarVolume(10, 'cavity_wall');
      expect(result).toBeCloseTo(0.31, 2); // 10 * (0.019 + 0.012) = 0.31
    });

    it('should throw on negative net area', () => {
      expect(() => calculateMortarVolume(-1, 'brick_only')).toThrow('Net area must be non-negative');
    });
  });

  describe('calculateDryMortarVolume', () => {
    it('should apply dry volume factor correctly', () => {
      expect(calculateDryMortarVolume(0.19)).toBeCloseTo(0.2527, 3); // 0.19 * 1.33
    });

    it('should use custom dry volume factor', () => {
      expect(calculateDryMortarVolume(0.19, 1.5)).toBeCloseTo(0.285, 3);
    });
  });

  describe('calculateCementBags', () => {
    it('should calculate cement bags correctly', () => {
      expect(calculateCementBags(0)).toBe(0);
      expect(calculateCementBags(0.025)).toBe(1);
      expect(calculateCementBags(0.2)).toBe(8);
    });

    it('should round up', () => {
      expect(calculateCementBags(0.001)).toBe(1);
    });
  });

  describe('calculateSandBulkBags', () => {
    it('should calculate sand bulk bags correctly', () => {
      // Using simplified formula: ceil(dryVolume * 6) / 10
      expect(calculateSandBulkBags(0.23)).toBe(1.4);
    });
  });
});

describe('Calculator - Insulation', () => {
  describe('calculateInsulationArea', () => {
    it('should calculate insulation area with default waste factor', () => {
      expect(calculateInsulationArea(10)).toBe(10.5); // 10 * 1.05
    });

    it('should return net area with 5% extra', () => {
      expect(calculateInsulationArea(19.44)).toBeCloseTo(20.412, 2);
    });
  });
});

describe('Calculator - Regression Test', () => {
  it('should match regression test values for cavity wall', () => {
    const regression = runRegressionTest();
    
    expect(regression.results.grossArea.actual).toBeCloseTo(21.6, 1);
    expect(regression.results.openingArea.actual).toBeCloseTo(2.16, 2);
    expect(regression.results.netArea.actual).toBeCloseTo(19.44, 2);
    expect(regression.results.bricks.actual).toBe(1249);
    expect(regression.results.blocks.actual).toBe(209);
    expect(regression.results.wallTies.actual).toBe(53);
    expect(regression.results.cementBags.actual).toBe(33);
  });

  it('should pass regression test', () => {
    const regression = runRegressionTest();
    expect(regression.passed).toBe(true);
  });
});

describe('Calculator - Full Section Calculation', () => {
  it('should calculate masonry section for cavity wall', () => {
    const section: QuoteSection = {
      id: 'test-section',
      quoteId: 'test-quote',
      name: 'Test Wall',
      constructionType: 'cavity_wall',
      wallLength: 8,
      wallHeight: 2.7,
      wallTies: true,
      insulation: true,
      dpc: false,
      mortarType: 'site_mixed',
      wastePercent: 7,
      sortOrder: 0,
      createdAt: new Date()
    };

    const openings: QuoteOpening[] = [
      {
        id: 'opening-1',
        sectionId: 'test-section',
        name: 'Window',
        openingType: 'window',
        width: 1.8,
        height: 1.2,
        quantity: 1,
        sortOrder: 0,
        createdAt: new Date()
      }
    ];

    const result = calculateMasonrySection(section, openings);

    expect(result.grossArea).toBe(21.6);
    expect(result.openingArea).toBe(2.16);
    expect(result.netArea).toBe(19.44);
    expect(result.wasteFactor).toBe(1.07);
    expect(result.bricks).toBe(1249);
    expect(result.blocks).toBe(209);
    expect(result.wallTies).toBe(53);
    expect(result.cementBags).toBe(33);
  });

  it('should handle brick_only construction', () => {
    const section: QuoteSection = {
      id: 'test-section',
      quoteId: 'test-quote',
      name: 'Brick Wall',
      constructionType: 'brick_only',
      wallLength: 5,
      wallHeight: 2,
      wallTies: false,
      insulation: false,
      dpc: false,
      mortarType: 'site_mixed',
      wastePercent: 10,
      sortOrder: 0,
      createdAt: new Date()
    };

    const result = calculateMasonrySection(section, []);

    expect(result.grossArea).toBe(10);
    expect(result.bricks).toBe(660); // 10 * 60 * 1.1
    expect(result.blocks).toBe(0);
    expect(result.wallTies).toBe(0);
  });

  it('should handle block_only construction', () => {
    const section: QuoteSection = {
      id: 'test-section',
      quoteId: 'test-quote',
      name: 'Block Wall',
      constructionType: 'block_only',
      wallLength: 5,
      wallHeight: 2,
      wallTies: false,
      insulation: false,
      dpc: false,
      mortarType: 'site_mixed',
      wastePercent: 5,
      sortOrder: 0,
      createdAt: new Date()
    };

    const result = calculateMasonrySection(section, []);

    expect(result.grossArea).toBe(10);
    expect(result.bricks).toBe(0);
    expect(result.blocks).toBe(105); // 10 * 10 * 1.05
  });
});

describe('Calculator - Labour Calculations', () => {
  describe('calculateDaywork', () => {
    it('should calculate daywork correctly', () => {
      const result = calculateDaywork(1, 'day', 15000, 25000);
      expect(result.totalCost).toBe(15000);
      expect(result.totalPrice).toBe(25000);
    });

    it('should apply overtime multiplier', () => {
      const result = calculateDaywork(1, 'day', 15000, 25000, true);
      expect(result.totalPrice).toBe(37500); // 25000 * 1.5
    });

    it('should calculate hourly rates (converted to days)', () => {
      const result = calculateDaywork(1, 'hour', 1875, 3125);
      // 1 hour * rate * 8 = full day rate
      expect(result.totalCost).toBe(15000); // 1875 * 8
      expect(result.totalPrice).toBe(25000); // 3125 * 8
    });

    it('should add extras', () => {
      const result = calculateDaywork(1, 'day', 15000, 25000, false, 5000);
      expect(result.totalPrice).toBe(30000);
    });
  });

  describe('calculatePricework', () => {
    it('should calculate pricework correctly', () => {
      const result = calculatePricework(100, 500); // 100 m² at £5/m²
      expect(result.totalCost).toBe(50000);
      expect(result.totalPrice).toBe(50000);
    });

    it('should apply minimum charge when total is below minimum', () => {
      const result = calculatePricework(5, 500, 10000); // 5 m² at £5, min £100
      expect(result.totalCost).toBe(10000);
      expect(result.totalPrice).toBe(10000);
    });

    it('should not apply minimum when total exceeds it', () => {
      const result = calculatePricework(50, 500, 10000);
      expect(result.totalCost).toBe(25000);
      expect(result.totalPrice).toBe(25000);
    });

    it('should handle zero quantity', () => {
      const result = calculatePricework(0, 500, 10000);
      // Minimum charge applies even at zero quantity
      expect(result.totalCost).toBe(10000);
    });
  });
});

describe('Calculator - Quote Totals', () => {
  it('should calculate quote totals with all options', () => {
    const result = calculateQuoteTotals(
      100000, // materialsCost
      150000, // materialsPrice
      50000,  // labourCost
      80000,  // labourPrice
      10000,  // extrasCost
      15000,  // extrasPrice
      10,     // overheadPercent
      20,     // profitPercent
      5,      // contingencyPercent
      5,      // discountPercent
      20      // vatRate
    );

    // Subtotals
    expect(result.subtotalCost).toBe(160000);
    expect(result.subtotalPrice).toBe(245000);

    // Overhead (10% of cost)
    expect(result.overheadAmount).toBe(16000);

    // Profit (20% of cost + overhead = 20% of 176000)
    expect(result.profitAmount).toBe(35200);

    // Contingency (5% of cost + overhead + profit = 5% of 211200)
    expect(result.contingencyAmount).toBe(10560);

    // Discount (5% of subtotalPrice + overhead + profit + contingency)
    // 245000 + 16000 + 35200 + 10560 = 306760 * 5% = 15338
    expect(result.discountAmount).toBe(15338);

    // VAT (on net total: 306760 - 15338 = 291422 * 20%)
    expect(result.vatAmount).toBe(58284);

    // Final totals
    // totalCost = costWithOverhead + profitAmount + contingencyAmount
    // = (160000 + 16000) + 35200 + 10560 = 221760
    expect(result.totalCost).toBe(221760);
    expect(result.totalPrice).toBe(349706); // 291422 + 58284

    // Gross profit
    // totalPrice - totalCost = 349706 - 221760 = 127946
    expect(result.grossProfit).toBe(127946);
    expect(result.grossMargin).toBeCloseTo(57.70, 1);
  });

  it('should handle zero values', () => {
    const result = calculateQuoteTotals(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20);

    expect(result.totalCost).toBe(0);
    expect(result.totalPrice).toBe(0);
    expect(result.grossMargin).toBe(0);
  });

  it('should handle default values', () => {
    const result = calculateQuoteTotals(100000, 150000, 50000, 80000);

    expect(result.overheadPercent).toBe(0);
    expect(result.overheadAmount).toBe(0);
    expect(result.profitPercent).toBe(0);
    expect(result.vatRate).toBe(20);
    expect(result.vatAmount).toBe(46000); // 230000 * 20%
  });
});

describe('Calculator - Edge Cases', () => {
  it('should handle zero and negative net area', () => {
    expect(calculateNetArea(0, 0)).toBe(0);
    expect(calculateNetArea(10, 10)).toBe(0);
    expect(calculateNetArea(5, 10)).toBe(0);
  });

  it('should handle empty sections', () => {
    const section: QuoteSection = {
      id: 'test-section',
      quoteId: 'test-quote',
      name: 'Test Wall',
      constructionType: 'brick_only',
      wallLength: 0,
      wallHeight: 0,
      wallTies: false,
      insulation: false,
      dpc: false,
      mortarType: 'site_mixed',
      wastePercent: 0,
      sortOrder: 0,
      createdAt: new Date()
    };

    const result = calculateMasonrySection(section, []);
    expect(result.grossArea).toBe(0);
    expect(result.netArea).toBe(0);
    expect(result.bricks).toBe(0);
  });

  it('should use custom assumptions', () => {
    const customAssumptions: CalculationAssumptions = {
      ...DEFAULT_ASSUMPTIONS,
      bricksPerM2: 72,
      blocksPerM2: 12.5,
      tiesPerM2: 3
    };

    const section: QuoteSection = {
      id: 'test-section',
      quoteId: 'test-quote',
      name: 'Test Wall',
      constructionType: 'cavity_wall',
      wallLength: 10,
      wallHeight: 2.5,
      wallTies: true,
      insulation: false,
      dpc: false,
      mortarType: 'site_mixed',
      wastePercent: 10,
      sortOrder: 0,
      createdAt: new Date()
    };

    const result = calculateMasonrySection(section, [], customAssumptions);

    // Note: Due to floating point, 25 * 72 * 1.1 = 1980.0000000000002, ceil gives 1981
    expect(result.bricks).toBe(1981);
    expect(result.blocks).toBe(344); // 25 * 12.5 * 1.1
    expect(result.wallTies).toBe(83); // 25 * 3 * 1.1
  });
});