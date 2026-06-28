// Quick Quotes - Core Types
import { z } from 'zod';

// Minor currency type (stored as pence)
export type MinorCurrency = number;

// UK VAT rates
export const VAT_RATES = {
  standard: 20,
  reduced: 5,
  zero: 0
} as const;

export type VatRate = typeof VAT_RATES[keyof typeof VAT_RATES];

// Organisation
export interface Organisation {
  id: string;
  name: string;
  logoUrl?: string;
  address?: string;
  email?: string;
  telephone?: string;
  vatRegistered: boolean;
  vatNumber?: string;
  companyNumber?: string;
  defaultTerms?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile
export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  organisationId?: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

// Customer
export interface Customer {
  id: string;
  organisationId: string;
  name: string;
  email?: string;
  telephone?: string;
  address?: string;
  postcode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Job
export interface Job {
  id: string;
  organisationId: string;
  customerId?: string;
  title: string;
  reference?: string;
  address?: string;
  postcode?: string;
  notes?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Quote Status
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

// Quote
export interface Quote {
  id: string;
  organisationId: string;
  customerId?: string;
  jobId?: string;
  quoteNumber: string;
  version: number;
  title: string;
  reference?: string;
  address?: string;
  postcode?: string;
  notes?: string;
  status: QuoteStatus;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Computed
  totalCost?: MinorCurrency;
  totalSelling?: MinorCurrency;
  grossProfit?: MinorCurrency;
  grossMargin?: number;
}

// Quote Version (immutable)
export interface QuoteVersion {
  id: string;
  quoteId: string;
  version: number;
  data: Record<string, unknown>;
  totalCost?: MinorCurrency;
  totalSelling?: MinorCurrency;
  createdAt: Date;
}

// Construction Type
export type ConstructionType = 'brick_only' | 'block_only' | 'cavity_wall';

// Quote Section (wall area)
export interface QuoteSection {
  id: string;
  quoteId: string;
  name: string;
  constructionType: ConstructionType;
  wallLength: number; // meters
  wallHeight: number; // meters
  brickLength?: number; // mm
  brickHeight?: number; // mm
  mortarJointMm?: number;
  blockLength?: number; // mm
  blockHeight?: number; // mm
  blockWidth?: number; // mm
  wallTies: boolean;
  tieSpacingMm?: number;
  insulation: boolean;
  insulationLength?: number; // mm
  insulationWidth?: number; // mm
  dpc: boolean;
  dpcLength?: number; // mm
  mortarType: 'site_mixed' | 'premixed';
  wastePercent: number;
  sortOrder: number;
  createdAt: Date;
  // Computed
  grossArea?: number;
  openingArea?: number;
  netArea?: number;
}

// Opening Type
export type OpeningType = 'window' | 'door' | 'other';

// Quote Opening
export interface QuoteOpening {
  id: string;
  sectionId: string;
  name: string;
  openingType: OpeningType;
  width: number; // meters
  height: number; // meters
  quantity: number;
  sortOrder: number;
  createdAt: Date;
  // Computed
  area?: number;
}

// Quote Item Type
export type QuoteItemType = 'material' | 'labour' | 'extra';

// Quote Item
export interface QuoteItem {
  id: string;
  quoteId: string;
  sectionId?: string;
  itemType: QuoteItemType;
  materialId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: MinorCurrency;
  unitPrice: MinorCurrency;
  totalCost: MinorCurrency;
  totalPrice: MinorCurrency;
  sortOrder: number;
  createdAt: Date;
}

// Quote Daywork
export interface QuoteDaywork {
  id: string;
  quoteId: string;
  role: string;
  quantity: number;
  unit: 'day' | 'hour';
  costRate: MinorCurrency;
  chargeRate: MinorCurrency;
  isOvertime: boolean;
  extras: MinorCurrency;
  createdAt: Date;
  // Computed
  totalCost?: MinorCurrency;
  totalPrice?: MinorCurrency;
}

// Calculation Assumptions
export interface CalculationAssumptions {
  id: string;
  organisationId?: string;
  name: string;
  version: string;
  bricksPerM2: number;
  blocksPerM2: number;
  tiesPerM2: number;
  mortarM3PerM2Brick: number;
  mortarM3PerM2Block: number;
  dryVolumeFactor: number;
  isDefault: boolean;
  createdAt: Date;
}

// Labour Rate Template
export interface LabourRateTemplate {
  id: string;
  organisationId: string;
  name: string;
  role: string;
  costRate: MinorCurrency;
  chargeRate: MinorCurrency;
  isDefault: boolean;
  createdAt: Date;
}

// Material
export interface Material {
  id: string;
  category: string;
  name: string;
  aliases?: string[];
  specification?: string;
  manufacturer?: string;
  manufacturerCode?: string;
  unitOfMeasure: string;
  packQuantity?: number;
  packCoverage?: number;
  vatRate: number;
  wasteDefault: number;
  isActive: boolean;
  createdAt: Date;
}

// Supplier
export interface Supplier {
  id: string;
  name: string;
  code: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
}

// Supplier Connection Type
export type SupplierConnectionType = 'manual' | 'csv' | 'api' | 'mock';

// Supplier Connection
export interface SupplierConnection {
  id: string;
  supplierId: string;
  organisationId?: string;
  connectionType: SupplierConnectionType;
  config?: Record<string, unknown>;
  isActive: boolean;
  lastSync?: Date;
  createdAt: Date;
}

// Supplier Product
export interface SupplierProduct {
  id: string;
  supplierId: string;
  materialId?: string;
  sku?: string;
  title: string;
  sourceUrl?: string;
  packQuantity?: number;
  packUnit?: string;
  unitPrice?: MinorCurrency;
  packPrice?: MinorCurrency;
  priceExclVat?: MinorCurrency;
  priceInclVat?: MinorCurrency;
  deliveryNotes?: string;
  isAvailable: boolean;
  lastChecked?: Date;
  sourceStatus: 'ok' | 'unavailable' | 'error';
  confidenceScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Price Observation
export interface PriceObservation {
  id: string;
  supplierProductId: string;
  observationTime: Date;
  createdAt?: Date;
  sourceUrl?: string;
  rawResponseHash?: string;
  rawSnapshot?: string;
  parsedTitle?: string;
  parsedSku?: string;
  parsedPackQuantity?: number;
  parsedPackUnit?: string;
  observedPrice?: MinorCurrency;
  observedVatStatus: 'inclusive' | 'exclusive' | 'unknown';
  confidence?: number;
  notes?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

// Approved Price
export interface ApprovedPrice {
  id: string;
  materialId: string;
  organisationId?: string;
  supplierProductId?: string;
  price: MinorCurrency;
  vatStatus: 'inclusive' | 'exclusive';
  packQuantity?: number;
  unitPrice: MinorCurrency;
  sourceObservationId?: string;
  validFrom: Date;
  createdAt: Date;
}

// Price Change Review Status
export type PriceChangeReviewStatus = 'pending' | 'approved' | 'rejected' | 'edited';

// Price Change Review
export interface PriceChangeReview {
  id: string;
  organisationId: string;
  observationId: string;
  previousPrice?: MinorCurrency;
  newPrice?: MinorCurrency;
  changeAmount?: MinorCurrency;
  changePercent?: number;
  status: PriceChangeReviewStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

// Price Agent Run Status
export type PriceAgentRunStatus = 'running' | 'completed' | 'failed';

// Price Agent Run
export interface PriceAgentRun {
  id: string;
  organisationId?: string;
  startedAt: Date;
  completedAt?: Date;
  status: PriceAgentRunStatus;
  productsChecked: number;
  productsChanged: number;
  productsUnchanged: number;
  productsReviewRequired: number;
  productsFailed: number;
  productsSkipped: number;
  retryCount: number;
  errorMessage?: string;
  runSummary?: Record<string, unknown>;
  createdAt: Date;
}

// Notification
export interface Notification {
  id: string;
  organisationId: string;
  userId?: string;
  type: string;
  title: string;
  message?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Audit Event
export interface AuditEvent {
  id: string;
  organisationId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

// Default calculation assumptions (from prototype)
export const DEFAULT_ASSUMPTIONS: CalculationAssumptions = {
  id: 'default',
  name: 'Prototype Default',
  version: '1.0',
  bricksPerM2: 60,
  blocksPerM2: 10,
  tiesPerM2: 2.5,
  mortarM3PerM2Brick: 0.019,
  mortarM3PerM2Block: 0.012,
  dryVolumeFactor: 1.33,
  isDefault: true,
  createdAt: new Date()
};

// Zod Schemas for Validation
export const QuoteSectionSchema = z.object({
  id: z.string().uuid().optional(),
  quoteId: z.string().uuid(),
  name: z.string().min(1),
  constructionType: z.enum(['brick_only', 'block_only', 'cavity_wall']),
  wallLength: z.number().positive(),
  wallHeight: z.number().positive(),
  brickLength: z.number().positive().optional(),
  brickHeight: z.number().positive().optional(),
  mortarJointMm: z.number().positive().optional(),
  blockLength: z.number().positive().optional(),
  blockHeight: z.number().positive().optional(),
  blockWidth: z.number().positive().optional(),
  wallTies: z.boolean().default(false),
  tieSpacingMm: z.number().positive().optional(),
  insulation: z.boolean().default(false),
  insulationLength: z.number().positive().optional(),
  insulationWidth: z.number().positive().optional(),
  dpc: z.boolean().default(false),
  dpcLength: z.number().positive().optional(),
  mortarType: z.enum(['site_mixed', 'premixed']).default('site_mixed'),
  wastePercent: z.number().min(0).max(100).default(7),
  sortOrder: z.number().int().default(0)
});

export const QuoteOpeningSchema = z.object({
  id: z.string().uuid().optional(),
  sectionId: z.string().uuid(),
  name: z.string().min(1),
  openingType: z.enum(['window', 'door', 'other']).default('window'),
  width: z.number().positive(),
  height: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  sortOrder: z.number().int().default(0)
});

export const QuoteDayworkSchema = z.object({
  id: z.string().uuid().optional(),
  quoteId: z.string().uuid(),
  role: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.enum(['day', 'hour']).default('day'),
  costRate: z.number().min(0),
  chargeRate: z.number().min(0),
  isOvertime: z.boolean().default(false),
  extras: z.number().min(0).default(0)
});

// Utility functions
export function minorCurrencyToDecimal(pence: MinorCurrency): number {
  return pence / 100;
}

export function decimalToMinorCurrency(pounds: number): MinorCurrency {
  return Math.round(pounds * 100);
}

export function formatCurrency(pence: MinorCurrency): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(pence / 100);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/London'
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/London'
  }).format(date);
}