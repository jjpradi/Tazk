import React, {useEffect, useState} from 'react';

const CustomPrintBarCode= React.forwardRef((props,ref) => {
  const {potcode} = props;
  const [zplCode, setZplCode] = useState('');

  useEffect(() => {
    let zpl = '';
    let fullCode = '';
    potcode.forEach((d, i) => {
      let x = 277;
      let y = 0;

      if (i % 3 === 0) {
        x = 0;
      }
      if (i % 3 === 1) {
        x = x;
      }
      if (i % 3 === 2) {
        x = x * 2 + 5;
      }
      // if (i) {
      //     y = 150 * Math.trunc(i / 3)
      // }

      const dot = d.name.slice(21, 42).length === 21 ? '...' : '';

      const name =
        d.name.length > 21
          ? `${d.name.slice(0, 21)}\\& ${d.name.slice(21, 39)}${dot}`
          : d.name;
          const code = `
          ^FX
          ^BY2,2,50
          ^FO${15 + x},${20 + y}^BC^FD${d.lot_number}^FS
          ^A0N,20,20^FO${35 + x},${100 + y}^FB630,2,0,L,0^FD${name}^FS
          ^A0N,30,30^FO${10 + x},${145 + y}^FB287,1,0,C^FDSP: ${
      d.selling_price
    } /-^FS`;

      zpl += code;

      if (i % 3 === 0 && potcode.length - 1 === i) {
        fullCode += `
                ^XA
                ^CFA,20
                ${zpl}
                ^XZ`;
        zpl = '';
      }
      if (i % 3 === 1 && potcode.length - 1 === i) {
        fullCode += `
                ^XA
                ^CFA,20
                ${zpl}
                ^XZ`;
        zpl = '';
      }

      if (i % 3 === 2) {
        fullCode += `
                ^XA
                ^CFA,20
                ${zpl}
                ^XZ`;
        zpl = '';
      }
    });

    setZplCode(fullCode);
  }, [potcode]);




  

  return <div style={{color:'black'}} ref={ref}>{zplCode}</div>;
});

export default CustomPrintBarCode;
