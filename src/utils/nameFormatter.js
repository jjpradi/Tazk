export const formatName = (name = '') => {
    if (!name || typeof name !== 'string') return '-';
 
    const parts = name.trim().split(/[\s.]+/);
 
    const formatted = parts
      .filter(Boolean)
      .map(part => {
        if (part.length === 1) {
          return part.toUpperCase();
        }
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(' ');
 
    return formatted;
  };
 
 
// export const format_first_Name = (first = '', last = '') => {
//     const formatPart = (part: any) => {
//       if (!part) return '';
//       return part
//         .split(/[\s.]+/)
//         .filter(Boolean)
//         .map((word: string) => {
//           if (word.length === 1) return word.toUpperCase();
//           return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//         })
//         .join(' ');
//     };
 
//     const fullName = `${formatPart(first)} ${formatPart(last)}`.trim();
//     return fullName || '-';
//   };
 
 

 