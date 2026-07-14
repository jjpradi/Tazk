export const getTrimmedData = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).map((key) => {
      if (typeof obj[key] === 'object') {
        getTrimmedData(obj[key]);
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      }
    });
  }
  return obj;
};
