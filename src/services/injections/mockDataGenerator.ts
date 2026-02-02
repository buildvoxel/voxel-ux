/**
 * Mock Data Generator Service
 * Generates realistic mock data for prototype elements using faker.js
 */

import { faker } from '@faker-js/faker';

// ============================================================================
// Types
// ============================================================================

export type DataCategory =
  | 'person'
  | 'company'
  | 'product'
  | 'ecommerce'
  | 'finance'
  | 'date'
  | 'location'
  | 'contact'
  | 'content'
  | 'media'
  | 'tech'
  | 'analytics';

export interface DataField {
  name: string;
  type: DataFieldType;
  options?: DataFieldOptions;
}

export type DataFieldType =
  // Person
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'avatar'
  | 'jobTitle'
  | 'bio'
  // Company
  | 'companyName'
  | 'department'
  | 'industry'
  | 'catchPhrase'
  // Product
  | 'productName'
  | 'productDescription'
  | 'category'
  | 'sku'
  // Ecommerce
  | 'price'
  | 'quantity'
  | 'rating'
  | 'reviewCount'
  | 'discount'
  // Finance
  | 'amount'
  | 'currency'
  | 'accountNumber'
  | 'transactionType'
  | 'creditCard'
  // Date
  | 'date'
  | 'time'
  | 'datetime'
  | 'relativeTime'
  | 'dateRange'
  // Location
  | 'address'
  | 'city'
  | 'state'
  | 'country'
  | 'zipCode'
  | 'coordinates'
  // Contact
  | 'website'
  | 'socialHandle'
  // Content
  | 'title'
  | 'paragraph'
  | 'sentence'
  | 'word'
  | 'slug'
  // Media
  | 'imageUrl'
  | 'videoUrl'
  | 'fileName'
  | 'fileSize'
  | 'mimeType'
  // Tech
  | 'uuid'
  | 'ipAddress'
  | 'macAddress'
  | 'userAgent'
  | 'version'
  // Analytics
  | 'percentage'
  | 'count'
  | 'trend'
  | 'status'
  | 'priority';

export interface DataFieldOptions {
  min?: number;
  max?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  format?: string;
  width?: number;
  height?: number;
  length?: number;
  values?: string[];
}

export interface DataSchema {
  name: string;
  category: DataCategory;
  fields: DataField[];
}

export interface GeneratedRow {
  [key: string]: string | number | boolean;
}

// ============================================================================
// Pre-defined Schemas
// ============================================================================

export const PREDEFINED_SCHEMAS: Record<string, DataSchema> = {
  users: {
    name: 'Users',
    category: 'person',
    fields: [
      { name: 'name', type: 'fullName' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone' },
      { name: 'role', type: 'jobTitle' },
      { name: 'status', type: 'status', options: { values: ['Active', 'Inactive', 'Pending'] } },
      { name: 'joined', type: 'date' }
    ]
  },

  products: {
    name: 'Products',
    category: 'product',
    fields: [
      { name: 'name', type: 'productName' },
      { name: 'description', type: 'productDescription' },
      { name: 'price', type: 'price', options: { min: 10, max: 500, decimals: 2 } },
      { name: 'category', type: 'category' },
      { name: 'stock', type: 'quantity', options: { min: 0, max: 1000 } },
      { name: 'rating', type: 'rating' }
    ]
  },

  orders: {
    name: 'Orders',
    category: 'ecommerce',
    fields: [
      { name: 'orderId', type: 'uuid' },
      { name: 'customer', type: 'fullName' },
      { name: 'total', type: 'price', options: { min: 50, max: 2000 } },
      { name: 'items', type: 'quantity', options: { min: 1, max: 10 } },
      { name: 'status', type: 'status', options: { values: ['Pending', 'Processing', 'Shipped', 'Delivered'] } },
      { name: 'date', type: 'date' }
    ]
  },

  transactions: {
    name: 'Transactions',
    category: 'finance',
    fields: [
      { name: 'id', type: 'uuid' },
      { name: 'type', type: 'transactionType' },
      { name: 'amount', type: 'amount', options: { min: 10, max: 5000 } },
      { name: 'from', type: 'fullName' },
      { name: 'to', type: 'fullName' },
      { name: 'date', type: 'datetime' },
      { name: 'status', type: 'status', options: { values: ['Completed', 'Pending', 'Failed'] } }
    ]
  },

  contacts: {
    name: 'Contacts',
    category: 'contact',
    fields: [
      { name: 'name', type: 'fullName' },
      { name: 'company', type: 'companyName' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone' },
      { name: 'location', type: 'city' },
      { name: 'lastContact', type: 'relativeTime' }
    ]
  },

  employees: {
    name: 'Employees',
    category: 'person',
    fields: [
      { name: 'name', type: 'fullName' },
      { name: 'department', type: 'department' },
      { name: 'title', type: 'jobTitle' },
      { name: 'email', type: 'email' },
      { name: 'startDate', type: 'date' },
      { name: 'status', type: 'status', options: { values: ['Full-time', 'Part-time', 'Contract'] } }
    ]
  },

  tasks: {
    name: 'Tasks',
    category: 'content',
    fields: [
      { name: 'title', type: 'title', options: { length: 5 } },
      { name: 'assignee', type: 'fullName' },
      { name: 'priority', type: 'priority' },
      { name: 'status', type: 'status', options: { values: ['To Do', 'In Progress', 'Review', 'Done'] } },
      { name: 'dueDate', type: 'date' }
    ]
  },

  analytics: {
    name: 'Analytics',
    category: 'analytics',
    fields: [
      { name: 'metric', type: 'word' },
      { name: 'value', type: 'count', options: { min: 100, max: 10000 } },
      { name: 'change', type: 'percentage', options: { min: -50, max: 50 } },
      { name: 'trend', type: 'trend' }
    ]
  },

  files: {
    name: 'Files',
    category: 'media',
    fields: [
      { name: 'name', type: 'fileName' },
      { name: 'type', type: 'mimeType' },
      { name: 'size', type: 'fileSize' },
      { name: 'modified', type: 'relativeTime' },
      { name: 'owner', type: 'fullName' }
    ]
  },

  comments: {
    name: 'Comments',
    category: 'content',
    fields: [
      { name: 'author', type: 'fullName' },
      { name: 'avatar', type: 'avatar' },
      { name: 'content', type: 'paragraph', options: { length: 2 } },
      { name: 'date', type: 'relativeTime' },
      { name: 'likes', type: 'count', options: { min: 0, max: 100 } }
    ]
  }
};

// ============================================================================
// Generator Functions
// ============================================================================

const generators: Record<DataFieldType, (options?: DataFieldOptions) => string | number> = {
  // Person
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  fullName: () => faker.person.fullName(),
  email: () => faker.internet.email().toLowerCase(),
  phone: () => faker.phone.number(),
  avatar: () => faker.image.avatar(),
  jobTitle: () => faker.person.jobTitle(),
  bio: () => faker.person.bio(),

  // Company
  companyName: () => faker.company.name(),
  department: () => faker.commerce.department(),
  industry: () => faker.company.buzzPhrase(),
  catchPhrase: () => faker.company.catchPhrase(),

  // Product
  productName: () => faker.commerce.productName(),
  productDescription: () => faker.commerce.productDescription(),
  category: () => faker.commerce.department(),
  sku: () => faker.string.alphanumeric(8).toUpperCase(),

  // Ecommerce
  price: (opts) => {
    const min = opts?.min ?? 10;
    const max = opts?.max ?? 1000;
    const decimals = opts?.decimals ?? 2;
    const value = faker.number.float({ min, max, fractionDigits: decimals });
    return opts?.prefix ? `${opts.prefix}${value.toFixed(decimals)}` : `$${value.toFixed(decimals)}`;
  },
  quantity: (opts) => faker.number.int({ min: opts?.min ?? 1, max: opts?.max ?? 100 }),
  rating: () => faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
  reviewCount: (opts) => faker.number.int({ min: opts?.min ?? 0, max: opts?.max ?? 500 }),
  discount: () => `${faker.number.int({ min: 5, max: 50 })}%`,

  // Finance
  amount: (opts) => {
    const value = faker.number.float({
      min: opts?.min ?? 10,
      max: opts?.max ?? 10000,
      fractionDigits: 2
    });
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  },
  currency: () => faker.finance.currencyCode(),
  accountNumber: () => faker.finance.accountNumber(),
  transactionType: () => faker.helpers.arrayElement(['Payment', 'Transfer', 'Deposit', 'Withdrawal', 'Refund']),
  creditCard: () => faker.finance.creditCardNumber().replace(/\d(?=\d{4})/g, '*'),

  // Date
  date: () => faker.date.recent({ days: 90 }).toLocaleDateString(),
  time: () => faker.date.recent().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  datetime: () => faker.date.recent({ days: 30 }).toLocaleString(),
  relativeTime: () => {
    const units = ['just now', '5m ago', '1h ago', '2h ago', 'yesterday', '2 days ago', 'last week'];
    return faker.helpers.arrayElement(units);
  },
  dateRange: () => {
    const start = faker.date.recent({ days: 30 });
    const end = faker.date.soon({ days: 30, refDate: start });
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  },

  // Location
  address: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  state: () => faker.location.state(),
  country: () => faker.location.country(),
  zipCode: () => faker.location.zipCode(),
  coordinates: () => `${faker.location.latitude()}, ${faker.location.longitude()}`,

  // Contact
  website: () => faker.internet.url(),
  socialHandle: () => `@${faker.internet.username().toLowerCase()}`,

  // Content
  title: (opts) => faker.lorem.words(opts?.length ?? 4),
  paragraph: (opts) => faker.lorem.paragraphs(opts?.length ?? 1),
  sentence: () => faker.lorem.sentence(),
  word: () => faker.lorem.word(),
  slug: () => faker.lorem.slug(),

  // Media
  imageUrl: (opts) => faker.image.url({ width: opts?.width ?? 400, height: opts?.height ?? 300 }),
  videoUrl: () => `https://example.com/video/${faker.string.alphanumeric(8)}.mp4`,
  fileName: () => faker.system.fileName(),
  fileSize: () => {
    const size = faker.number.int({ min: 100, max: 50000 });
    if (size > 1000) return `${(size / 1000).toFixed(1)} MB`;
    return `${size} KB`;
  },
  mimeType: () => faker.system.mimeType(),

  // Tech
  uuid: () => faker.string.uuid().slice(0, 8),
  ipAddress: () => faker.internet.ip(),
  macAddress: () => faker.internet.mac(),
  userAgent: () => faker.internet.userAgent().slice(0, 50) + '...',
  version: () => faker.system.semver(),

  // Analytics
  percentage: (opts) => {
    const value = faker.number.float({
      min: opts?.min ?? 0,
      max: opts?.max ?? 100,
      fractionDigits: 1
    });
    const sign = value > 0 && (opts?.min ?? 0) < 0 ? '+' : '';
    return `${sign}${value}%`;
  },
  count: (opts) => faker.number.int({ min: opts?.min ?? 0, max: opts?.max ?? 1000 }),
  trend: () => faker.helpers.arrayElement(['↑', '↓', '→', '↗', '↘']),
  status: (opts) => {
    const values = opts?.values ?? ['Active', 'Inactive', 'Pending'];
    return faker.helpers.arrayElement(values);
  },
  priority: () => faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical'])
};

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Generate a single field value
 */
export function generateFieldValue(fieldType: DataFieldType, options?: DataFieldOptions): string | number {
  const generator = generators[fieldType];
  if (!generator) {
    console.warn(`[MockDataGenerator] Unknown field type: ${fieldType}`);
    return faker.lorem.word();
  }
  return generator(options);
}

/**
 * Generate a single row of data based on schema
 */
export function generateRow(schema: DataSchema): GeneratedRow {
  const row: GeneratedRow = {};
  for (const field of schema.fields) {
    row[field.name] = generateFieldValue(field.type, field.options);
  }
  return row;
}

/**
 * Generate multiple rows of data
 */
export function generateRows(schema: DataSchema, count: number): GeneratedRow[] {
  const rows: GeneratedRow[] = [];
  for (let i = 0; i < count; i++) {
    rows.push(generateRow(schema));
  }
  return rows;
}

/**
 * Generate data using a predefined schema name
 */
export function generateFromPreset(presetName: string, count: number = 5): GeneratedRow[] {
  const schema = PREDEFINED_SCHEMAS[presetName];
  if (!schema) {
    console.warn(`[MockDataGenerator] Unknown preset: ${presetName}`);
    return [];
  }
  return generateRows(schema, count);
}

/**
 * Auto-detect appropriate schema based on table headers
 */
export function detectSchemaFromHeaders(headers: string[]): DataSchema | null {
  const headerLower = headers.map(h => h.toLowerCase().trim());

  // Score each preset
  let bestMatch: { name: string; score: number } = { name: '', score: 0 };

  for (const [presetName, schema] of Object.entries(PREDEFINED_SCHEMAS)) {
    const schemaFields = schema.fields.map(f => f.name.toLowerCase());
    let score = 0;

    for (const header of headerLower) {
      if (schemaFields.some(f => f.includes(header) || header.includes(f))) {
        score++;
      }
    }

    if (score > bestMatch.score) {
      bestMatch = { name: presetName, score };
    }
  }

  if (bestMatch.score >= 2) {
    return PREDEFINED_SCHEMAS[bestMatch.name];
  }

  // Create custom schema based on headers
  const customFields: DataField[] = headers.map(header => {
    const h = header.toLowerCase();

    // Detect field type from header name
    if (h.includes('name') && !h.includes('company')) return { name: header, type: 'fullName' };
    if (h.includes('email')) return { name: header, type: 'email' };
    if (h.includes('phone') || h.includes('tel')) return { name: header, type: 'phone' };
    if (h.includes('company') || h.includes('org')) return { name: header, type: 'companyName' };
    if (h.includes('price') || h.includes('cost') || h.includes('amount')) return { name: header, type: 'price' };
    if (h.includes('date') || h.includes('created') || h.includes('updated')) return { name: header, type: 'date' };
    if (h.includes('status')) return { name: header, type: 'status' };
    if (h.includes('address') || h.includes('street')) return { name: header, type: 'address' };
    if (h.includes('city')) return { name: header, type: 'city' };
    if (h.includes('country')) return { name: header, type: 'country' };
    if (h.includes('description') || h.includes('desc')) return { name: header, type: 'sentence' };
    if (h.includes('title')) return { name: header, type: 'title' };
    if (h.includes('id') || h.includes('uuid')) return { name: header, type: 'uuid' };
    if (h.includes('count') || h.includes('qty') || h.includes('quantity')) return { name: header, type: 'quantity' };
    if (h.includes('rating') || h.includes('score')) return { name: header, type: 'rating' };
    if (h.includes('image') || h.includes('photo') || h.includes('avatar')) return { name: header, type: 'avatar' };

    // Default to word
    return { name: header, type: 'word' };
  });

  return {
    name: 'Custom',
    category: 'content',
    fields: customFields
  };
}

/**
 * Populate a table element with mock data
 */
export function populateTable(
  tableHtml: string,
  rowCount: number = 10,
  schemaOverride?: DataSchema
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(tableHtml, 'text/html');
  const table = doc.querySelector('table');

  if (!table) return tableHtml;

  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody') || table;

  // Get headers
  const headerCells = thead?.querySelectorAll('th') || table.querySelectorAll('th');
  const headers = Array.from(headerCells).map(th => th.textContent?.trim() || '');

  if (headers.length === 0) return tableHtml;

  // Detect or use provided schema
  const schema = schemaOverride || detectSchemaFromHeaders(headers);
  if (!schema) return tableHtml;

  // Generate data
  const rows = generateRows(schema, rowCount);

  // Clear existing tbody rows
  const existingRows = tbody.querySelectorAll('tr');
  existingRows.forEach((row) => {
    // Keep header row if in tbody
    if (row.querySelector('th')) return;
    row.remove();
  });

  // Add new rows
  rows.forEach(rowData => {
    const tr = doc.createElement('tr');

    headers.forEach(header => {
      const td = doc.createElement('td');
      const fieldName = Object.keys(rowData).find(
        k => k.toLowerCase() === header.toLowerCase() ||
             header.toLowerCase().includes(k.toLowerCase())
      );
      td.textContent = String(fieldName ? rowData[fieldName] : generateFieldValue('word'));
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  return table.outerHTML;
}

/**
 * Generate injection code for populating elements with mock data
 */
export function generatePopulateScript(selector: string, dataType: string, count: number = 5): string {
  const rows = generateFromPreset(dataType, count);

  return `
(function() {
  const data = ${JSON.stringify(rows)};
  const containers = document.querySelectorAll('${selector}');

  containers.forEach((container, index) => {
    if (index >= data.length) return;
    const row = data[index];

    // Try to populate child elements
    Object.entries(row).forEach(([key, value]) => {
      const el = container.querySelector(\`[data-field="\${key}"], .\${key}, [class*="\${key}"]\`);
      if (el) {
        el.textContent = String(value);
      }
    });

    // If no specific fields found, populate text content
    if (!container.querySelector('[data-field]')) {
      const firstValue = Object.values(row)[0];
      if (container.childElementCount === 0) {
        container.textContent = String(firstValue);
      }
    }
  });
})();
`;
}

/**
 * Get list of available preset schemas
 */
export function getAvailablePresets(): { name: string; label: string; fields: string[] }[] {
  return Object.entries(PREDEFINED_SCHEMAS).map(([name, schema]) => ({
    name,
    label: schema.name,
    fields: schema.fields.map(f => f.name)
  }));
}
