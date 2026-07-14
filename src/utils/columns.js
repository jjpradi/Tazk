export const customer_col = [
  'first_name',
  'last_name',
  'phone_number',
  'email',
  'address_1',
];

export const vendor_col = [
  'company_name',
  'phone_number',
  'designation',
  'agency_name',
];

export const taxCategory_col = ['tax_category', 'tax_group_sequence'];

export const taxCustomerCategory_col = [];

export const tax_col = [];

export const taxjurisdiction_col = [
  'jurisdiction_name',
  'tax_group',
  'tax_type',
  'reporting_authority',
  'tax_group_sequence',
];

export const product_col = [
  'name',
  'category',
  'description',
  'unit_price',
  'reorder_level',
  'qty_per_pack',
  'hsn_code',
  'tax_category_id',
];

export const productCategory_col = [];

export const purchases_col = [
  'po_number',
  'receiving_time',
  'company_name',
  'payment_type',
  'location_name',
];

export const receivings_col = [];

export const receivingsItems_col = [
  'name',
  'description',
  'serialnumber',
  'quantity_purchased',
  'item_cost_price',
  'item_unit_price',
  'discount',
  'discount_type',
  'receiving_quantity',
];

export const suppliers_col = [
  'company_name',
  'agency_name',
  'account_number',
  'category',
];

export const inventory_col = ['trans_items', 'trans_location', 'trans_comment'];

export const stockLocation_col = [
  'location_name',
  'latitude',
  'longitude',
  'Description',
];

export const salesMainTable = [
  'Customer Name',
  'Reference',
  'SO Number',
  'SO Date',
  'Amount',
  'Status',
  'Invoice Number',
  'Payment Status',
  'Goods Issue',
];

export const taxCodes_col = ['tax_code', 'tax_code_name', 'city', 'state'];

export const taxRate_col = [
  'tax_rate',
  'tax_code',
  'tax_code_name',
  'city',
  'state',
  'tax_category',
  'jurisdiction_name',
  'tax_group',
  'tax_type',
  'reporting_authority',
];

export const transaction_col = [];

export const leads_col = [];
