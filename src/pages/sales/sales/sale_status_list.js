export const Sale_Status = [
  {option: 'Send SO', value: 1},
  {option: 'Create Invoice', value: 2},
  {option: 'On Hold', value: 3},
  {option: 'Ready To Ship', value: 4},
  {option: 'In Transit', value: 5},
  {option: 'Delivered', value: 6},
  {option: 'Canceled', value: 7},
  {option: 'Delivery Challan', value: 8}
];

export const AddSales_Status = [
  {option: 'Send SO', value: 1},
  {option: 'Create Invoice', value: 2},
  {option: 'On Hold', value: 3},
];

export const FilteredMapping = (arr, arr_ele, compare_ele, return_ele) => {
  return arr
    .map((f) => {
      if (f[arr_ele] === compare_ele) return f[return_ele];
      else return null;
    })
    .filter((f) => f !== null)[0];
};

const floatnum = (num) => {
  const str = num.toFixed(2);
  const numarray = str.split('.');
  let convert = numarray[0];
  if (numarray[1]) {
    convert += '.' + numarray[1];
  } else {
    convert += '.00';
  }
  return parseFloat(convert);
};


export const Sales_Item_Taxes = (
  productData,
  filtered,
  sales_items,
  unit_price,
  newTax
) => {
  const res = [];

  if (productData !== undefined && productData.length > 0) {
    productData?.map((p) => {
      if (p.item_id === filtered[0].item_id) {
        return newTax?.map((t) => {
          if (t.tax_group === 'IGST') {
            res.push({
              line: sales_items.length + 1,
              name: t.tax_category,
              percent: t.tax_rate,
              tax_category_id: t.tax_category_id,
              item_tax_amount: floatnum(
                ((1 * (unit_price !== undefined && unit_price !== null ? parseFloat(unit_price) : p.unit_price)) / 100) *
                  t.tax_rate,
              ),
              tax_type: 1,
              rounding_code: 0,
              cascade_sequence: 0,
              sales_tax_code_id: 0,
              jurisdiction_id: 0,
            });
          }
          return null;
        });
      }
      return null;
    });
  }


  return res[0];
};

export const getItemTaxes = (product, item_id) => {
  if (product.length > 0 && item_id !== '' && typeof item_id !== 'undefined') {
    let taxes = product.filter((p) => p.item_id === item_id);
    return taxes?.length > 0 ? taxes[0].taxes : [];
  } else {
    return [];
  }
};

export const checkEachBarcodeWasEntered = (sales_items = []) => {
  const barcodeFilter = sales_items.filter(
    (f) =>
      f.quantity === f.lots?.length ||
      f.stock_type === 0 ||
      f.is_serialized === 0,
  );

  if (sales_items.length > 0 && barcodeFilter.length > 0) {
    if (barcodeFilter.length === sales_items.length) {
      return 'allEntered';
    } else {
      return 'barcode was empty';
    }
  } else {
    return 'sales_items empty';
  }
};

export const checkEachBarcodeWasEnteredForSaleOrder = (sales_items = []) => {
 if (!sales_items.length) return 'sales_items empty';
  const hasOneEntered = sales_items.some((item) => {
    if (item.is_serialized === 1 && item.stock_type !== 0) {
      return (item.lots?.length || 0) > 0;
    }
    return false;
  });

  return hasOneEntered ? 'allEntered' : 'barcode was empty';
};

/**
 * Normalizes quantity to a number. Handles string, number, null, undefined.
 * Returns 0 for any non-numeric or empty value.
 */
export const normalizeQuantity = (qty) => {
  if (qty === null || qty === undefined || qty === '') return 0;
  const parsed = parseFloat(qty);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validates a single sales item's quantity.
 * Returns { valid: boolean, error: string | null }
 */
export const validateItemQuantity = (item) => {
  const qty = normalizeQuantity(item.quantity);

  if (qty <= 0) {
    return { valid: false, error: `Item "${item.name || 'Unnamed'}" must have a quantity greater than 0` };
  }

  if (!Number.isFinite(qty)) {
    return { valid: false, error: `Item "${item.name || 'Unnamed'}" has an invalid quantity` };
  }

  return { valid: true, error: null };
};

/**
 * Validates all sales items for quantity correctness.
 * Returns { valid: boolean, errors: string[] }
 */
export const validateSalesItemsQuantity = (salesItems = []) => {
  const errors = [];

  if (salesItems.length === 0) {
    return { valid: false, errors: ['No items in the sales order'] };
  }

  for (const item of salesItems) {
    if (!item.name || item.name === '') {
      errors.push('All items must have a name selected');
      continue;
    }

    const { valid, error } = validateItemQuantity(item);
    if (!valid) errors.push(error);

    if (normalizeQuantity(item.item_unit_price) === 0) {
      errors.push(`Item "${item.name}" must have a unit price greater than 0`);
    }
  }

  return { valid: errors.length === 0, errors };
};


export const singleTax = (prc = 0, qty = 1, data) => {
  const val = prc * qty + ((prc * qty) / 100) * getIgst(data);
  return val;
};

const getIgst = (data) => {
  let tax = '';

  if (data) {
    data.forEach((t) => {
      if (t.tax_group === 'IGST') {
        tax = t.tax_rate;
      }
    });
  }
  return tax;
};
