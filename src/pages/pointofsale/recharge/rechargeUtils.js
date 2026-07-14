export const formatINR = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
};

export const operatorColor = (code) => {
  const map = {
    Airtel: '#E53935',
    Jio: '#1565C0',
    Vi: '#6A1B9A',
    BSNL: '#2E7D32',
    MTNL: '#EF6C00',
  };
  return map[code] || '#455A64';
};
