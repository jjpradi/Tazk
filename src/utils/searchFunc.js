
export const filterOptions = (options, { inputValue }) => {
  // console.log("options", options);


  const normalizedInput = inputValue.toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ');

  return options.filter((option) => {

    const productNameNormalized = (option?.name ?? '').toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ');
    const skuNormalized = (option?.sku ?? '').toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ');
    const lotNumbersNormalized = (option?.lots || []).map(lot =>
      (lot?.lot_number ?? '').toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ')
    );
    const lotMatch = lotNumbersNormalized.some(lotNum => lotNum.includes(normalizedInput));

    return (
      productNameNormalized.includes(normalizedInput) ||
      skuNormalized.includes(normalizedInput) ||
      lotMatch
    );
  });
};

export const calculateMarginPercentage = (dp, sp) => {
  let dealerPrice = dp === undefined ? 0 : dp;
  let sellingPrice = sp === undefined ? 0 : sp;
  if (sellingPrice !== 0) {
    const margin = ((sellingPrice - dealerPrice) / dealerPrice) * 100 || 0;
    return margin.toFixed(2) + '%';
  } else {
    return 0.0 + '%';
  }
};
