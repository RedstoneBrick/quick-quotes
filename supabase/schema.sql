-- Quick Quotes for Tradesmen - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organisations (multi-tenant)
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  email TEXT,
  telephone TEXT,
  vat_registered BOOLEAN DEFAULT false,
  vat_number TEXT,
  company_number TEXT,
  default_terms TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organisation members (additional invitations)
CREATE TABLE organisation_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  address TEXT,
  postcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  reference TEXT,
  address TEXT,
  postcode TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote status
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'declined', 'expired');

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  reference TEXT,
  address TEXT,
  postcode TEXT,
  notes TEXT,
  status quote_status DEFAULT 'draft',
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, quote_number, version)
);

-- Quote versions (immutable history)
CREATE TABLE quote_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  data JSONB NOT NULL,
  total_cost MinorCurrency,
  total_selling MinorCurrency,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quote_id, version)
);

-- Quote sections (wall areas, etc.)
CREATE TABLE quote_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  construction_type TEXT CHECK (construction_type IN ('brick_only', 'block_only', 'cavity_wall')),
  wall_length DECIMAL(10,2) NOT NULL,
  wall_height DECIMAL(10,2) NOT NULL,
  brick_length MM,
  brick_height MM,
  mortar_joint_mm INTEGER,
  block_length MM,
  block_height MM,
  block_width MM,
  wall_ties BOOLEAN DEFAULT false,
  tie_spacing_mm INTEGER,
  insulation BOOLEAN DEFAULT false,
  insulation_length MM,
  insulation_width MM,
  dpc BOOLEAN DEFAULT false,
  dpc_length MM,
  mortar_type TEXT CHECK (mortar_type IN ('site_mixed', 'premixed')),
  waste_percent DECIMAL(5,2) DEFAULT 7,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote openings (windows, doors)
CREATE TABLE quote_openings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES quote_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  opening_type TEXT CHECK (opening_type IN ('window', 'door', 'other')),
  width DECIMAL(10,2) NOT NULL,
  height DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote items (materials and labour)
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  section_id UUID REFERENCES quote_sections(id) ON DELETE SET NULL,
  item_type TEXT CHECK (item_type IN ('material', 'labour', 'extra')) NOT NULL,
  material_id UUID,
  description TEXT NOT NULL,
  quantity DECIMAL(10,4) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost MinorCurrency NOT NULL,
  unit_price MinorCurrency NOT NULL,
  total_cost MinorCurrency NOT NULL,
  total_price MinorCurrency NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labour daywork entries
CREATE TABLE quote_daywork (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT CHECK (unit IN ('day', 'hour')) DEFAULT 'day',
  cost_rate MinorCurrency NOT NULL,
  charge_rate MinorCurrency NOT NULL,
  is_overtime BOOLEAN DEFAULT false,
  extras MinorCurrency DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculation assumptions (versioned)
CREATE TABLE calculation_assumptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  bricks_per_m2 DECIMAL(10,2) DEFAULT 60,
  blocks_per_m2 DECIMAL(10,2) DEFAULT 10,
  ties_per_m2 DECIMAL(10,2) DEFAULT 2.5,
  mortar_m3_per_m2_brick DECIMAL(10,4) DEFAULT 0.019,
  mortar_m3_per_m2_block DECIMAL(10,4) DEFAULT 0.012,
  dry_volume_factor DECIMAL(10,2) DEFAULT 1.33,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labour rate templates
CREATE TABLE labour_rate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  cost_rate MinorCurrency NOT NULL,
  charge_rate MinorCurrency NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canonical materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  aliases TEXT[],
  specification TEXT,
  manufacturer TEXT,
  manufacturer_code TEXT,
  unit_of_measure TEXT NOT NULL,
  pack_quantity DECIMAL(10,4),
  pack_coverage DECIMAL(10,4),
  vat_rate DECIMAL(5,2) DEFAULT 20,
  waste_default DECIMAL(5,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier connections (API configs)
CREATE TABLE supplier_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  connection_type TEXT CHECK (connection_type IN ('manual', 'csv', 'api', 'mock')) NOT NULL,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier products with prices
CREATE TABLE supplier_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  sku TEXT,
  title TEXT NOT NULL,
  source_url TEXT,
  pack_quantity DECIMAL(10,4),
  pack_unit TEXT,
  unit_price MinorCurrency,
  pack_price MinorCurrency,
  price_excl_vat MinorCurrency,
  price_incl_vat MinorCurrency,
  delivery_notes TEXT,
  is_available BOOLEAN DEFAULT true,
  last_checked TIMESTAMPTZ,
  source_status TEXT CHECK (source_status IN ('ok', 'unavailable', 'error')) DEFAULT 'ok',
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material to supplier product mappings
CREATE TABLE material_supplier_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  supplier_product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(material_id, supplier_product_id)
);

-- Price observations (history)
CREATE TABLE price_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  observation_time TIMESTAMPTZ DEFAULT NOW(),
  source_url TEXT,
  raw_response_hash TEXT,
  raw_snapshot TEXT,
  parsed_title TEXT,
  parsed_sku TEXT,
  parsed_pack_quantity DECIMAL(10,4),
  parsed_pack_unit TEXT,
  observed_price MinorCurrency,
  observed_vat_status TEXT CHECK (observed_vat_status IN ('inclusive', 'exclusive', 'unknown')),
  confidence DECIMAL(3,2),
  notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ
);

-- Approved prices (current)
CREATE TABLE approved_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  supplier_product_id UUID REFERENCES supplier_products(id),
  price MinorCurrency NOT NULL,
  vat_status TEXT CHECK (vat_status IN ('inclusive', 'exclusive')) NOT NULL,
  pack_quantity DECIMAL(10,4),
  unit_price MinorCurrency NOT NULL,
  source_observation_id UUID REFERENCES price_observations(id),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price change reviews
CREATE TABLE price_change_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  observation_id UUID NOT NULL REFERENCES price_observations(id) ON DELETE CASCADE,
  previous_price MinorCurrency,
  new_price MinorCurrency,
  change_amount MinorCurrency,
  change_percent DECIMAL(6,2),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'edited')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Price agent runs
CREATE TABLE price_agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
  products_checked INTEGER DEFAULT 0,
  products_changed INTEGER DEFAULT 0,
  products_unchanged INTEGER DEFAULT 0,
  products_review_required INTEGER DEFAULT 0,
  products_failed INTEGER DEFAULT 0,
  products_skipped INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  run_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit events
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom type for minor currency (pence)
CREATE TYPE minor_currency AS TYPEOF integer;

-- Indexes for performance
CREATE INDEX idx_profiles_org ON profiles(organisation_id);
CREATE INDEX idx_customers_org ON customers(organisation_id);
CREATE INDEX idx_jobs_org ON jobs(organisation_id);
CREATE INDEX idx_quotes_org ON quotes(organisation_id);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quote_sections_quote ON quote_sections(quote_id);
CREATE INDEX idx_quote_openings_section ON quote_openings(section_id);
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_price_observations_product ON price_observations(supplier_product_id);
CREATE INDEX idx_approved_prices_material ON approved_prices(material_id);
CREATE INDEX idx_audit_org ON audit_events(organisation_id, created_at DESC);
CREATE INDEX idx_notifications_org ON notifications(organisation_id, is_read, created_at DESC);

-- RLS Policies
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_daywork ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE labour_rate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_supplier_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_change_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (simplified for demo)
CREATE POLICY "org_members_can_read" ON organisations FOR SELECT
  USING (id IN (SELECT organisation_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_members_can_read_profiles" ON profiles FOR SELECT
  USING (organisation_id IN (SELECT organisation_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "org_members_can_read_customers" ON customers FOR SELECT
  USING (organisation_id IN (SELECT organisation_id FROM profiles WHERE id = auth.uid()));

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organisations_updated_at BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();