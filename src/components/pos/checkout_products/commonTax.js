const totalCost = (list, text, discount, taxType) => {
  let total = 0;
  list.forEach((d) => {
    if(text === 'noDiscount' && !discount){
      if(d.isTaxIncluded){
        const selVal = d.unit_price
        total = total + (selVal * (d?.quantity || 1))
      }
      else{
        const selVal = d.unit_price + ((d.unit_price * getIgst(d)) / 100)
        total = total + (selVal * (d?.quantity || 1))
      }
    }
    else if(discount){
      console.log(discount, 'product discount')
      if(d.isTaxIncluded){
        const productPrice = d.unit_price
        const productDiscount = Number((productPrice / totalCost(list, 'noDiscount')) * discount.amount).toFixed(2)
        const discountedPrice = Number(productPrice - productDiscount)
        const productWithoutTax = Number(discountedPrice / (1 + (getIgst(d) / 100)))
        console.log(productWithoutTax, productDiscount, discountedPrice, 'product')
        const productTax = Number((Number(productWithoutTax.toFixed(2)) * (getIgst(d) / 100)).toFixed(2))
        const calculatedTax = taxType ? Number((productTax / 2).toFixed(2)) + Number((productTax / 2).toFixed(2)) : Number((productTax).toFixed(2))
        const calculatedProductWithoutTax = Number(discountedPrice.toFixed(2)) - calculatedTax
        total = total + Number((Number(calculatedProductWithoutTax) * (d?.quantity || 1)).toFixed(2))
      }
      else{
        const productPrice = d.unit_price + ((d.unit_price * getIgst(d)) / 100)
        const productDiscount = Number((productPrice / totalCost(list, 'noDiscount')) * discount.amount)
        const discountedPrice = Number(productPrice - productDiscount)
        const productWithoutTax = Number(discountedPrice / (1 + (getIgst(d) / 100)))
        const productTax = Number((Number(productWithoutTax.toFixed(2)) * (getIgst(d) / 100)).toFixed(2))
        const calculatedTax = taxType ? Number((productTax / 2).toFixed(2)) + Number((productTax / 2).toFixed(2)) : Number((productTax).toFixed(2))
        const calculatedProductWithoutTax = Number(discountedPrice.toFixed(2)) - calculatedTax
        total = total + Number((Number(calculatedProductWithoutTax) * (d?.quantity || 1)).toFixed(2))
      }
    }
    else{
      const discount_type = d.discount_type || 0;
  
      const selQty =
        (d.selling_price / (getIgst(d) + 100)) * 100 * (d.quantity || 1);
  
      const selVal =
        discount_type === 0
          ? selQty - (selQty / 100) * (d.discount || 0)
          : selQty - (disTax(d.discount, getIgst(d)) || 0);
  
      const val =
        discount_type === 0
          ? (d.quantity || 1) * d.unit_price -
            (((d.quantity || 1) * d.unit_price) / 100) * (d.discount || 0)
          : (d.quantity || 1) * d.unit_price -
            (disTax(d.discount, getIgst(d)) || 0);
  
      total += d.selling_price ? selVal : val;
    }
  });
  return total || 0;
};

const totalCostPrice = (list) => {
  console.log('listttttttotal', list)
  let total = 0;
  list.filter((d)=> d.stock_type !== 0).forEach((d) => {
    // const discount_type = d.discount_type || 0;

    // const selQty =
    //   (d.selling_price / (getIgst(d) + 100)) * 100 * (d.quantity || 1);

    // const selVal =
    //   discount_type === 0
    //     ? selQty - (selQty / 100) * (d.discount || 0)
    //     : selQty - (disTax(d.discount, getIgst(d)) || 0);

    // const val =
    //   discount_type === 0
    //     ? (d.quantity || 1) * d.unit_price -
    //       (((d.quantity || 1) * d.unit_price) / 100) * (d.discount || 0)
    //     : (d.quantity || 1) * d.unit_price -
    //       (disTax(d.discount, getIgst(d)) || 0);

    total += d.cost_price ? d.cost_price * (d.quantity || 1) : 0;
  });
  return total || 0;
};


const disTax = (dis, tax) => {
  const out = (dis / (tax + 100)) * 100;
  // const inn = (out / 100) * tax

  return out;
};

const getIgst = (data) => {
  let tax = '';

  if (data.taxes) {
    data.taxes.forEach((t) => {
      if (t.tax_group === 'IGST') {
        tax = t.tax_rate;
      }
    });
  }
  return tax;
};

const taxes = (list, discount) => {
  let total = 0;
  for (let data of list) {
    if(discount){
      if(data.isTaxIncluded){
        const productPrice = data.is_serialized === 1 ? data.unit_price : data.max_price
        const productDiscount = (productPrice / totalCost(list, 'noDiscount')) * (discount?.amount || 0)
        const discountedPrice = Number(productPrice - productDiscount).toFixed(2)
        const productWithoutTax = Number(discountedPrice / (1 + (getIgst(data) / 100))).toFixed(2)
        const productTax = Number((discountedPrice - productWithoutTax) * (data?.quantity || 1)).toFixed(2)
        total = total + Number(productTax)
      }
      else{
        const productPrice = data.is_serialized === 1 ? data.unit_price + (data.unit_price * getIgst(data) / 100) : data.max_price + (data.max_price * getIgst(data) / 100)
        const productDiscount = (productPrice / totalCost(list, 'noDiscount')) * (discount?.amount || 0)
        const discountedPrice = Number(productPrice - productDiscount).toFixed(2)
        const productWithoutTax = Number(discountedPrice / (1 + (getIgst(data) / 100))).toFixed(2)
        const productTax = Number((discountedPrice - productWithoutTax) * (data?.quantity || 1)).toFixed(2)
        total = total + Number(productTax)
      }
    }
    else{
        const prc = data.unit_price;
        const qty = data.quantity || 1;
        const tax = getIgst(data);
        const discount_type = data.discount_type || 0;
    
        const val =
          discount_type === 0
            ? prc * qty - ((prc * qty) / 100) * (data.discount || 0)
            : prc * qty - (disTax(data.discount, tax) || 0);
    
        const selQty = (data.selling_price / (tax + 100)) * 100 * qty;
    
        const selVal =
          discount_type === 0
            ? selQty - (selQty / 100) * (data.discount || 0)
            : selQty - (disTax(data.discount, tax) || 0);
    
        total += data.selling_price ? (selVal / 100) * tax : (val / 100) * tax;
      }
    }
  return total ? total : 0;
};

const singleTax = (qty, cost, tax, dis, sell, type) => {
  const discount_type = type || 0;
  const val =
    discount_type === 0
      ? (qty || 1) * cost - (((qty || 1) * cost) / 100) * (dis || 0)
      : (qty || 1) * cost - (disTax(dis, tax) || 0);

  const selQty = (sell / (tax + 100)) * 100 * (qty || 1);

  const selVal =
    discount_type === 0
      ? selQty - (selQty / 100) * (dis || 0)
      : selQty - (disTax(dis, tax) || 0);

  const total = sell ? (selVal / 100) * tax + selVal : (val / 100) * tax + val;
  return total ? total.toFixed(2) : 0;
};

const getIgstCommon = (taxes, key) => {
  let tax = '';
  if (taxes) {
    taxes.forEach((t) => {
      if (t.tax_group === 'IGST') {
        tax = t[key];
      }
    });
  }
  return tax;
};

const withoutTax = (qty, cost) => {
  const val = (qty || 1) * cost;
  return val.toFixed(2);
};

const taxForCommonDiscount = (list, discount,taxType) => {
  let tax = 0
  list.forEach(product => {
    if(product.isTaxIncluded){
      const productPrice = product.is_serialized === 1 ? product.unit_price : product.max_price
      const productDiscount = (productPrice / totalCost(list, 'noDiscount')) * (discount?.amount || 0)
      const discountedPrice = Number(productPrice - productDiscount)
      const productWithoutTax = Number(discountedPrice / (1 + (getIgst(product) / 100)))
      const productTax = Number((Number(productWithoutTax.toFixed(2)) * (getIgst(product) / 100)).toFixed(2))
      const calculatedTax = taxType ? Number((productTax / 2).toFixed(2)) + Number((productTax / 2).toFixed(2)) : Number((productTax).toFixed(2))
      tax = tax + Number((calculatedTax).toFixed(2))
    }
    else{
      const productPrice = product.unit_price + (product.unit_price * getIgst(product) / 100)
      const productDiscount = (productPrice / totalCost(list, 'noDiscount')) * (discount?.amount || 0)
      const discountedPrice = Number(productPrice - productDiscount)
      const productWithoutTax = Number(discountedPrice / (1 + (getIgst(product) / 100)))
      const productTax = Number((Number(productWithoutTax.toFixed(2)) * (getIgst(product) / 100)).toFixed(2))
      const calculatedTax = taxType ? Number((productTax / 2).toFixed(2)) + Number((productTax / 2).toFixed(2)) : Number((productTax).toFixed(2))
      tax = tax + Number((calculatedTax).toFixed(2))
    }
  })
  return tax
}

const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const calculateRoundOffforPOS = (roundedOffEnabled, subTotal, taxAmount) => {
  if (roundedOffEnabled === 'false') {
    return 0
  }
  else {
    const taxAmount2 = round2(taxAmount)
    const subTotal2 = round2(subTotal)

    const total = round2(subTotal2 + taxAmount2)

    const nearest = Math.round(total)

    const roundOff = round2(nearest - total)

    return roundOff
  }
}

const splitTax = (totalTax) => {
  const roundedTotal = Number(totalTax.toFixed(2));
  const half = Number((totalTax / 2).toFixed(2));
  const otherHalf = Number((roundedTotal - half).toFixed(2));
  return { cgst: half, sgst: otherHalf, total: roundedTotal };
};

const individualUnitPrice = (list, product, discount, taxType) => {
  if (product.isTaxIncluded) {
    const productPrice = product.unit_price
    const productDiscount = Number((productPrice / totalCost(list, 'noDiscount')) * discount.amount).toFixed(2)
    const discountedPrice = Number(productPrice - productDiscount)
    const productWithoutTax = Number(discountedPrice / (1 + (getIgst(product) / 100)))
    const productTax = Number((Number(productWithoutTax.toFixed(2)) * (getIgst(product) / 100)).toFixed(2))
    const calculatedTax = taxType ? Number((productTax / 2).toFixed(2)) + Number((productTax / 2).toFixed(2)) : Number((productTax).toFixed(2))
    const calculatedProductWithoutTax = Number(discountedPrice.toFixed(2)) - calculatedTax
    return Number((Number(calculatedProductWithoutTax) * (product?.quantity || 1)).toFixed(2))
  }
  else {
    const productPrice = product.unit_price + ((product.unit_price * getIgst(product)) / 100)
    const productDiscount = Number((productPrice / totalCost(list, 'noDiscount')) * discount.amount)
    const discountedPrice = Number(productPrice - productDiscount)
    const productWithoutTax = Number(discountedPrice / (1 + (getIgst(product) / 100)))
    const productTax = Number((Number(productWithoutTax.toFixed(2)) * (getIgst(product) / 100)).toFixed(2))
    const calculatedTax = taxType ? Number((productTax / 2).toFixed(2)) + Number((productTax / 2).toFixed(2)) : Number((productTax).toFixed(2))
    const calculatedProductWithoutTax = Number(discountedPrice.toFixed(2)) - calculatedTax
    return Number((Number(calculatedProductWithoutTax) * (product?.quantity || 1)).toFixed(2))
  }
}

export {totalCost, getIgst, taxes, singleTax, getIgstCommon, withoutTax,totalCostPrice, disTax, taxForCommonDiscount, calculateRoundOffforPOS, splitTax, individualUnitPrice};
