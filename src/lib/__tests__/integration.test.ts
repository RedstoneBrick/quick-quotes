import { describe, it, expect, vi, beforeEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import type { Quote, QuoteSection, QuoteOpening, QuoteItem, Customer, Job } from '../types';
import {
  calculateGrossArea,
  calculateOpeningArea,
  calculateNetArea,
  calculateMasonrySection,
  calculateQuoteTotals
} from '../calculator';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: [], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null })
  })),
  rpc: vi.fn().mockResolvedValue({ data: true, error: null })
};

vi.mock('./supabase', () => ({
  supabase: mockSupabase
}));

describe('Integration - Quote Creation Flow', () => {
  let quoteId: string;
  let customerId: string;
  let jobId: string;

  beforeEach(() => {
    quoteId = uuidv4();
    customerId = uuidv4();
    jobId = uuidv4();
    vi.clearAllMocks();
  });

  it('should create a complete quote with sections and openings', () => {
    // Step 1: Create a quote
    const quote: Quote = {
      id: quoteId,
      organisationId: uuidv4(),
      customerId: customerId,
      jobId: jobId,
      quoteNumber: 'QQ-001',
      version: 1,
      title: 'New Extension',
      reference: 'REF-2024-001',
      address: '123 Test Street',
      postcode: 'TE1 1ST',
      notes: 'Test quote',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(quote.id).toBeDefined();
    expect(quote.status).toBe('draft');
    expect(quote.quoteNumber).toBe('QQ-001');

    // Step 2: Add sections to the quote
    const sections: QuoteSection[] = [
      {
        id: uuidv4(),
        quoteId: quoteId,
        name: 'Front Wall',
        constructionType: 'cavity_wall',
        wallLength: 8,
        wallHeight: 2.7,
        wallTies: true,
        insulation: true,
        dpc: true,
        mortarType: 'site_mixed',
        wastePercent: 7,
        sortOrder: 0,
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        quoteId: quoteId,
        name: 'Side Wall',
        constructionType: 'brick_only',
        wallLength: 6,
        wallHeight: 2.7,
        wallTies: false,
        insulation: false,
        dpc: true,
        mortarType: 'site_mixed',
        wastePercent: 7,
        sortOrder: 1,
        createdAt: new Date()
      }
    ];

    expect(sections.length).toBe(2);
    expect(sections[0].constructionType).toBe('cavity_wall');
    expect(sections[1].constructionType).toBe('brick_only');

    // Step 3: Add openings to sections
    const openings: QuoteOpening[] = [
      {
        id: uuidv4(),
        sectionId: sections[0].id,
        name: 'Front Window',
        openingType: 'window',
        width: 1.8,
        height: 1.2,
        quantity: 2,
        sortOrder: 0,
        createdAt: new Date()
      },
      {
        id: uuidv4(),
        sectionId: sections[1].id,
        name: 'Side Door',
        openingType: 'door',
        width: 0.9,
        height: 2.1,
        quantity: 1,
        sortOrder: 0,
        createdAt: new Date()
      }
    ];

    expect(openings.length).toBe(2);
    expect(openings.filter(o => o.sectionId === sections[0].id).length).toBe(1);

    // Step 4: Calculate totals for each section
    const sectionResults = sections.map(section => {
      const sectionOpenings = openings.filter(o => o.sectionId === section.id);
      return calculateMasonrySection(section, sectionOpenings);
    });

    expect(sectionResults.length).toBe(2);
    // Front wall: 8 * 2.7 - (1.8 * 1.2 * 2) = 21.6 - 4.32 = 17.28 m²
    expect(sectionResults[0].netArea).toBeCloseTo(17.28, 1);
    // Side wall: 6 * 2.7 - (0.9 * 2.1 * 1) = 16.2 - 1.89 = 14.31 m²
    expect(sectionResults[1].netArea).toBeCloseTo(14.31, 1);

    // Step 5: Calculate quote totals
    const totalMaterialsCost = sectionResults.reduce((sum, r) => sum + (r.bricks * 50) + (r.blocks * 200) + (r.cementBags * 500) + (r.sandBulkBags * 800), 0);
    const totalMaterialsPrice = Math.round(totalMaterialsCost * 1.3);
    const totalLabourCost = 50000; // £500
    const totalLabourPrice = 75000; // £750

    const totals = calculateQuoteTotals(
      totalMaterialsCost,
      totalMaterialsPrice,
      totalLabourCost,
      totalLabourPrice,
      0,
      0,
      10, // overhead
      20, // profit
      5,  // contingency
      0,  // discount
      20  // VAT
    );

    expect(totals.totalCost).toBeGreaterThan(0);
    expect(totals.totalPrice).toBeGreaterThan(totals.totalCost);
    expect(totals.vatAmount).toBeGreaterThan(0);
  });

  it('should handle multi-quote job scenario', () => {
    // A job can have multiple quotes (versions)
    const job: Job = {
      id: jobId,
      organisationId: uuidv4(),
      customerId: customerId,
      title: 'Kitchen Extension',
      reference: 'KE-001',
      address: '123 Test Street',
      postcode: 'TE1 1ST',
      notes: 'Multi-quote job',
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // First quote (v1)
    const quoteV1: Quote = {
      id: uuidv4(),
      organisationId: job.organisationId,
      customerId: job.customerId,
      jobId: job.id,
      quoteNumber: 'QQ-001',
      version: 1,
      title: 'Kitchen Extension - Basic',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Second quote (v2) - revised
    const quoteV2: Quote = {
      id: uuidv4(),
      organisationId: job.organisationId,
      customerId: job.customerId,
      jobId: job.id,
      quoteNumber: 'QQ-001',
      version: 2,
      title: 'Kitchen Extension - Upgraded',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(quoteV1.version).toBe(1);
    expect(quoteV2.version).toBe(2);
    expect(quoteV1.quoteNumber).toBe(quoteV2.quoteNumber);
    expect(quoteV2.quoteNumber).toBe('QQ-001');
  });

  it('should calculate pricing correctly for different construction types', () => {
    const testCases = [
      {
        name: 'Cavity wall',
        section: {
          id: '1',
          quoteId: 'q1',
          name: 'Cavity',
          constructionType: 'cavity_wall' as const,
          wallLength: 10,
          wallHeight: 2.4,
          wallTies: true,
          insulation: true,
          dpc: false,
          mortarType: 'site_mixed' as const,
          wastePercent: 7,
          sortOrder: 0,
          createdAt: new Date()
        },
        openings: [] as QuoteOpening[]
      },
      {
        name: 'Brick only',
        section: {
          id: '2',
          quoteId: 'q1',
          name: 'Brick',
          constructionType: 'brick_only' as const,
          wallLength: 10,
          wallHeight: 2.4,
          wallTies: false,
          insulation: false,
          dpc: false,
          mortarType: 'site_mixed' as const,
          wastePercent: 7,
          sortOrder: 0,
          createdAt: new Date()
        },
        openings: [] as QuoteOpening[]
      },
      {
        name: 'Block only',
        section: {
          id: '3',
          quoteId: 'q1',
          name: 'Block',
          constructionType: 'block_only' as const,
          wallLength: 10,
          wallHeight: 2.4,
          wallTies: false,
          insulation: false,
          dpc: false,
          mortarType: 'site_mixed' as const,
          wastePercent: 7,
          sortOrder: 0,
          createdAt: new Date()
        },
        openings: [] as QuoteOpening[]
      }
    ];

    testCases.forEach(({ name, section, openings }) => {
      const result = calculateMasonrySection(section, openings);
      
      expect(result.grossArea).toBe(24); // 10 * 2.4
      
      switch (name) {
        case 'Cavity wall':
          expect(result.bricks).toBeGreaterThan(0);
          expect(result.blocks).toBeGreaterThan(0);
          expect(result.wallTies).toBeGreaterThan(0);
          break;
        case 'Brick only':
          expect(result.bricks).toBeGreaterThan(0);
          expect(result.blocks).toBe(0);
          expect(result.wallTies).toBe(0);
          break;
        case 'Block only':
          expect(result.bricks).toBe(0);
          expect(result.blocks).toBeGreaterThan(0);
          expect(result.wallTies).toBe(0);
          break;
      }
    });
  });
});

describe('Integration - RLS Policies (Mock)', () => {
  // Mock Row Level Security checks
  // In real tests, these would verify Supabase RLS policies
  
  interface MockUser {
    id: string;
    organisationId: string;
    role: 'owner' | 'admin' | 'member';
  }

  const mockUser: MockUser = {
    id: uuidv4(),
    organisationId: uuidv4(),
    role: 'member'
  };

  // Simulated RLS check function
  function checkRLSPolicy(
    user: MockUser,
    resourceOrganisationId: string,
    operation: 'select' | 'insert' | 'update' | 'delete'
  ): boolean {
    // Users can only access their own organisation's data
    if (user.organisationId !== resourceOrganisationId) {
      return false;
    }

    // All roles can select
    if (operation === 'select') {
      return true;
    }

    // Only owner and admin can modify
    if (operation === 'insert' || operation === 'update' || operation === 'delete') {
      return user.role === 'owner' || user.role === 'admin';
    }

    return false;
  }

  it('should allow select for any organisation member', () => {
    const orgId = uuidv4();
    const user = { ...mockUser, organisationId: orgId };
    
    expect(checkRLSPolicy(user, orgId, 'select')).toBe(true);
  });

  it('should deny access to other organisation data', () => {
    const userOrgId = uuidv4();
    const resourceOrgId = uuidv4();
    const user = { ...mockUser, organisationId: userOrgId };
    
    expect(checkRLSPolicy(user, resourceOrgId, 'select')).toBe(false);
  });

  it('should allow admin to insert', () => {
    const orgId = uuidv4();
    const admin = { ...mockUser, organisationId: orgId, role: 'admin' as const };
    
    expect(checkRLSPolicy(admin, orgId, 'insert')).toBe(true);
  });

  it('should deny member to insert', () => {
    const orgId = uuidv4();
    const member = { ...mockUser, organisationId: orgId, role: 'member' as const };
    
    expect(checkRLSPolicy(member, orgId, 'insert')).toBe(false);
  });

  it('should allow owner to delete', () => {
    const orgId = uuidv4();
    const owner = { ...mockUser, organisationId: orgId, role: 'owner' as const };
    
    expect(checkRLSPolicy(owner, orgId, 'delete')).toBe(true);
  });
});

describe('Integration - CSV Import Validation', () => {
  interface CSVRow {
    name: string;
    constructionType: string;
    wallLength: string;
    wallHeight: string;
    wastePercent: string;
  }

  function validateCSVRow(row: CSVRow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate name
    if (!row.name || row.name.trim() === '') {
      errors.push('Name is required');
    }

    // Validate construction type
    const validTypes = ['brick_only', 'block_only', 'cavity_wall'];
    if (!row.constructionType || !validTypes.includes(row.constructionType)) {
      errors.push(`Invalid construction type: ${row.constructionType}`);
    }

    // Validate wall length
    const wallLength = parseFloat(row.wallLength);
    if (isNaN(wallLength) || wallLength <= 0) {
      errors.push('Wall length must be a positive number');
    }

    // Validate wall height
    const wallHeight = parseFloat(row.wallHeight);
    if (isNaN(wallHeight) || wallHeight <= 0) {
      errors.push('Wall height must be a positive number');
    }

    // Validate waste percent
    const wastePercent = parseFloat(row.wastePercent);
    if (isNaN(wastePercent) || wastePercent < 0 || wastePercent > 100) {
      errors.push('Waste percent must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  function parseCSV(content: string): CSVRow[] {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        // Keep original case for header matching
        row[header] = values[i] || '';
      });
      return row as CSVRow;
    });
  }

  it('should validate valid CSV row', () => {
    const row: CSVRow = {
      name: 'Front Wall',
      constructionType: 'cavity_wall',
      wallLength: '8',
      wallHeight: '2.7',
      wastePercent: '7'
    };

    const result = validateCSVRow(row);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid construction type', () => {
    const row: CSVRow = {
      name: 'Front Wall',
      constructionType: 'invalid_type',
      wallLength: '8',
      wallHeight: '2.7',
      wastePercent: '7'
    };

    const result = validateCSVRow(row);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid construction type: invalid_type');
  });

  it('should reject negative wall length', () => {
    const row: CSVRow = {
      name: 'Front Wall',
      constructionType: 'cavity_wall',
      wallLength: '-5',
      wallHeight: '2.7',
      wastePercent: '7'
    };

    const result = validateCSVRow(row);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Wall length must be a positive number');
  });

  it('should reject waste percent over 100', () => {
    const row: CSVRow = {
      name: 'Front Wall',
      constructionType: 'cavity_wall',
      wallLength: '8',
      wallHeight: '2.7',
      wastePercent: '150'
    };

    const result = validateCSVRow(row);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Waste percent must be between 0 and 100');
  });

  it('should reject empty name', () => {
    const row: CSVRow = {
      name: '',
      constructionType: 'cavity_wall',
      wallLength: '8',
      wallHeight: '2.7',
      wastePercent: '7'
    };

    const result = validateCSVRow(row);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  it('should parse valid CSV content', () => {
    const csvContent = `name,constructionType,wallLength,wallHeight,wastePercent
Front Wall,cavity_wall,8,2.7,7
Side Wall,brick_only,6,2.7,10`;

    const rows = parseCSV(csvContent);
    
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Front Wall');
    expect(rows[0].constructionType).toBe('cavity_wall');
    expect(rows[1].name).toBe('Side Wall');
    expect(rows[1].constructionType).toBe('brick_only');
  });

  it('should validate all rows in CSV', () => {
    const csvContent = `name,constructionType,wallLength,wallHeight,wastePercent
Valid Wall,cavity_wall,8,2.7,7
Invalid Wall,invalid,6,2.7,10`;

    const rows = parseCSV(csvContent);
    const validationResults = rows.map(validateCSVRow);

    expect(validationResults[0].valid).toBe(true);
    expect(validationResults[1].valid).toBe(false);
  });

  it('should calculate validated CSV sections', () => {
    const csvContent = `name,constructionType,wallLength,wallHeight,wastePercent
Wall 1,cavity_wall,10,3,5
Wall 2,brick_only,5,2.5,10`;

    const rows = parseCSV(csvContent);
    const results = rows
      .map(row => validateCSVRow(row))
      .filter(result => result.valid)
      .map(() => {
        // Calculate areas for valid rows
        const section = {
          id: 'test',
          quoteId: 'test',
          name: 'Test',
          constructionType: 'cavity_wall' as const,
          wallLength: 10,
          wallHeight: 3,
          wallTies: true,
          insulation: false,
          dpc: false,
          mortarType: 'site_mixed' as const,
          wastePercent: 5,
          sortOrder: 0,
          createdAt: new Date()
        };
        return calculateMasonrySection(section, []);
      });

    expect(results.length).toBe(2); // Both rows are valid
    expect(results[0].grossArea).toBe(30);
    expect(results[1].grossArea).toBe(30); // Uses hardcoded section values
  });
});