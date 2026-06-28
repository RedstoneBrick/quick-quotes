// PDF Generation Utility for Quotes using @react-pdf/renderer
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import { 
  Quote, 
  Customer, 
  Job, 
  QuoteSection, 
  QuoteOpening, 
  QuoteItem, 
  QuoteDaywork, 
  Organisation,
  formatCurrency,
  formatDate,
  minorCurrencyToDecimal
} from '@/lib/types';

// Register fonts for PDF
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.woff2', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logoSection: {
    width: 150,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  businessInfo: {
    textAlign: 'right',
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessDetail: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  titleSection: {
    marginBottom: 20,
  },
  quoteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quoteMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  metaValue: {
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#666',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    fontSize: 9,
    color: '#333',
  },
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  
  totalsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  totalLabel: {
    width: 120,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 14,
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginTop: 10,
  },
  
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 11,
  },
  notesText: {
    fontSize: 9,
    color: '#666',
    lineHeight: 1.5,
  },
  
  signatureSection: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 8,
    height: 40,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666',
  },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
});

// Type for the data needed to generate a PDF
interface QuotePdfData {
  quote: Quote;
  customer?: Customer;
  job?: Job;
  organisation?: Organisation;
  sections?: (QuoteSection & { openings?: QuoteOpening[] })[];
  items?: QuoteItem[];
  dayworks?: QuoteDaywork[];
  terms?: string;
}

function formatSectionTitle(section: QuoteSection): string {
  const typeLabels = {
    brick_only: 'Brick Only',
    block_only: 'Block Only',
    cavity_wall: 'Cavity Wall',
  };
  const area = section.grossArea?.toFixed(2) || '0.00';
  return `${section.name} (${typeLabels[section.constructionType]}) - ${area}m²`;
}

export const QuotePdfDocument: React.FC<{ data: QuotePdfData }> = ({ data }) => {
  const { quote, customer, job, organisation, sections = [], items = [], dayworks = [], terms } = data;
  
  // Calculate totals
  const materialCost = items
    .filter(i => i.itemType === 'material')
    .reduce((sum, i) => sum + (i.totalCost || 0), 0);
  const materialPrice = items
    .filter(i => i.itemType === 'material')
    .reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  
  const labourCost = items
    .filter(i => i.itemType === 'labour')
    .reduce((sum, i) => sum + (i.totalCost || 0), 0);
  const labourPrice = items
    .filter(i => i.itemType === 'labour')
    .reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  
  const dayworkCost = dayworks.reduce((sum, d) => sum + (d.totalCost || 0), 0);
  const dayworkPrice = dayworks.reduce((sum, d) => sum + (d.totalPrice || 0), 0);
  
  const subtotalCost = materialCost + labourCost + dayworkCost;
  const subtotalPrice = materialPrice + labourPrice + dayworkPrice;
  
  const vatRate = organisation?.vatRegistered ? 20 : 0;
  const vatAmount = Math.round(subtotalPrice * (vatRate / 100));
  const totalPrice = subtotalPrice + vatAmount;
  
  const defaultTerms = terms || organisation?.defaultTerms || 'Payment due within 30 days of invoice. Quote valid for 30 days.';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo and business details */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {organisation?.logoUrl ? (
              <Image src={organisation.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.businessName}>{organisation?.name || 'Your Business'}</Text>
            )}
          </View>
          <View style={styles.businessInfo}>
            {organisation?.name && (
              <Text style={styles.businessName}>{organisation.name}</Text>
            )}
            {organisation?.address && (
              <Text style={styles.businessDetail}>{organisation.address}</Text>
            )}
            {organisation?.email && (
              <Text style={styles.businessDetail}>{organisation.email}</Text>
            )}
            {organisation?.telephone && (
              <Text style={styles.businessDetail}>{organisation.telephone}</Text>
            )}
            {organisation?.vatRegistered && organisation?.vatNumber && (
              <Text style={styles.businessDetail}>VAT: {organisation.vatNumber}</Text>
            )}
          </View>
        </View>

        {/* Quote Title and Meta */}
        <View style={styles.titleSection}>
          <Text style={styles.quoteTitle}>QUOTE</Text>
          <View style={styles.quoteMeta}>
            <Text>
              <Text style={styles.metaLabel}>Quote #:</Text>{' '}
              <Text style={styles.metaValue}>{quote.quoteNumber}</Text>
            </Text>
            <Text>
              <Text style={styles.metaLabel}>Date:</Text>{' '}
              <Text style={styles.metaValue}>{formatDate(quote.createdAt)}</Text>
            </Text>
            {quote.validUntil && (
              <Text>
                <Text style={styles.metaLabel}>Valid Until:</Text>{' '}
                <Text style={styles.metaValue}>{formatDate(quote.validUntil)}</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Customer Details */}
        {customer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{customer.name}</Text>
            </View>
            {customer.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{customer.address}</Text>
              </View>
            )}
            {customer.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{customer.email}</Text>
              </View>
            )}
            {customer.telephone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{customer.telephone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Job Details */}
        {(job || quote.address) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Details</Text>
            {job && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Job:</Text>
                <Text style={styles.detailValue}>{job.title}</Text>
              </View>
            )}
            {quote.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{quote.address}</Text>
              </View>
            )}
            {quote.postcode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Postcode:</Text>
                <Text style={styles.detailValue}>{quote.postcode}</Text>
              </View>
            )}
            {quote.reference && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reference:</Text>
                <Text style={styles.detailValue}>{quote.reference}</Text>
              </View>
            )}
          </View>
        )}

        {/* Sections Table */}
        {sections.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Construction Sections</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Length</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Height</Text>
              <Text style={[styles.tableHeaderCell, styles.col4]}>Area m²</Text>
              <Text style={[styles.tableHeaderCell, styles.col5]}>Type</Text>
            </View>
            {sections.map((section) => (
              <View key={section.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{section.name}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{section.wallLength.toFixed(2)}m</Text>
                <Text style={[styles.tableCell, styles.col3]}>{section.wallHeight.toFixed(2)}m</Text>
                <Text style={[styles.tableCell, styles.col4]}>{section.grossArea?.toFixed(2) || '0.00'}</Text>
                <Text style={[styles.tableCell, styles.col5]}>
                  {section.constructionType.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Materials List */}
        {items.filter(i => i.itemType === 'material').length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Materials</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Unit</Text>
              <Text style={[styles.tableHeaderCell, styles.col4]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.col5]}>Total</Text>
            </View>
            {items.filter(i => i.itemType === 'material').map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{item.unit}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.totalPrice)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Labour Costs */}
        {(items.filter(i => i.itemType === 'labour').length > 0 || dayworks.length > 0) && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Labour</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.col1]}>Description</Text>
              <Text style={[styles.tableHeaderCell, styles.col2]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.col3]}>Unit</Text>
              <Text style={[styles.tableHeaderCell, styles.col4]}>Rate</Text>
              <Text style={[styles.tableHeaderCell, styles.col5]}>Total</Text>
            </View>
            {items.filter(i => i.itemType === 'labour').map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{item.unit}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(item.unitPrice)}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.totalPrice)}</Text>
              </View>
            ))}
            {dayworks.map((daywork) => (
              <View key={daywork.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>
                  {daywork.role} {daywork.isOvertime ? '(Overtime)' : ''}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>{daywork.quantity}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{daywork.unit}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(daywork.chargeRate)}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(daywork.totalPrice || 0)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Materials:</Text>
            <Text style={styles.totalValue}>{formatCurrency(materialPrice)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Labour:</Text>
            <Text style={styles.totalValue}>{formatCurrency(labourPrice + dayworkPrice)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotalPrice)}</Text>
          </View>
          {vatRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT ({vatRate}%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(vatAmount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
          </View>
        </View>

        {/* Notes and Terms */}
        {(quote.notes || defaultTerms) && (
          <View style={styles.notesSection}>
            {quote.notes && (
              <>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{quote.notes}</Text>
              </>
            )}
            <Text style={[styles.notesTitle, { marginTop: quote.notes ? 10 : 0 }]}>
              Terms and Conditions
            </Text>
            <Text style={styles.notesText}>{defaultTerms}</Text>
          </View>
        )}

        {/* Acceptance Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Acceptance</Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
          <View style={{ marginTop: 15 }}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Print Name</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business • Generated by Quick Quotes
        </Text>
      </Page>
    </Document>
  );
};

// Function to generate PDF for a quote
export async function generateQuotePdf(quoteId: string): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer');
  
  // Fetch quote data from database
  // In a real implementation, this would fetch from Supabase
  const mockData: QuotePdfData = {
    quote: {
      id: quoteId,
      organisationId: '',
      quoteNumber: 'QT-0001',
      version: 1,
      title: 'Sample Quote',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    organisation: {
      id: '',
      name: 'Sample Business Ltd',
      address: '123 Business St\nLondon\nSW1A 1AA',
      email: 'info@samplebusiness.co.uk',
      telephone: '01234 567890',
      vatRegistered: true,
      vatNumber: 'GB123456789',
      companyNumber: '01234567',
      defaultTerms: 'Payment due within 30 days of invoice.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    customer: {
      id: '',
      organisationId: '',
      name: 'John Smith',
      email: 'john@example.com',
      telephone: '09876 543210',
      address: '456 Customer Ave',
      postcode: 'AB12 3CD',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sections: [
      {
        id: '',
        quoteId: '',
        name: 'Front Wall',
        constructionType: 'cavity_wall',
        wallLength: 10,
        wallHeight: 2.5,
        wallTies: true,
        insulation: true,
        dpc: true,
        mortarType: 'site_mixed',
        wastePercent: 7,
        sortOrder: 0,
        createdAt: new Date(),
        grossArea: 25,
        openingArea: 4,
        netArea: 21,
      },
    ],
    items: [
      {
        id: '1',
        quoteId: '',
        itemType: 'material',
        description: 'Facing Bricks',
        quantity: 1260,
        unit: 'pcs',
        unitCost: 45,
        unitPrice: 60,
        totalCost: 56700,
        totalPrice: 75600,
        sortOrder: 0,
        createdAt: new Date(),
      },
      {
        id: '2',
        quoteId: '',
        itemType: 'labour',
        description: 'Bricklayer',
        quantity: 2,
        unit: 'days',
        unitCost: 20000,
        unitPrice: 25000,
        totalCost: 40000,
        totalPrice: 50000,
        sortOrder: 1,
        createdAt: new Date(),
      },
    ],
    dayworks: [],
    terms: 'Payment due within 30 days. Quote valid for 30 days.',
  };

  const buffer = await renderToBuffer(<QuotePdfDocument data={mockData} />);
  return buffer;
}

export default QuotePdfDocument;