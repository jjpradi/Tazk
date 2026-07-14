import React, {useEffect, useState} from 'react';

const CustomPrintQrCode= React.forwardRef((props,ref) => {
  const {potcode} = props;
  const [zplCode, setZplCode] = useState('');
  const sanitizeZplText = (value = '') =>
    String(value).replace(/[\^~]/g, ' ').trim();

  useEffect(() => {
    let zpl = '';
    let fullCode = '';
    if(props?.type === 'asset'){
      const zpl = `
        ^XA
        ^CFA,20
        ^FO50,50^FDAsset Code: ${props?.assetCode}^FS
        ^FO100,100^BQN,2,10^FDQA,${props?.assetCode}^FS
        ^XZ
      `;
      setZplCode(zpl)
    } 
    else{
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
  
        const name = sanitizeZplText(d?.name);
        const lotNumber = sanitizeZplText(d?.lot_number);
        const priceListMrp = Number(d?.price_list_mrp || 0);
        const maxPrice = Number(d?.max_price || 0);
        const mrpValue = sanitizeZplText(priceListMrp !== 0 ? d?.price_list_mrp : d?.max_price);
        const sellingPrice = sanitizeZplText(d?.selling_price);
        const shortName = name.length > 60 ? `${name.slice(0, 57)}...` : name;
        const shortLotNumber = lotNumber.length > 30 ? `${lotNumber.slice(0, 27)}...` : lotNumber;
  
        const isMrpAvailable = (priceListMrp !== 0 || maxPrice !== 0);
  
        const mrp =  `
        ^FO${155 + x},${30 + y}^A0N,20,20^FD MRP^FS
        ^FO${155 + x},${55 + y}^A0N,22,22^FD ${mrpValue}^FS`
        
        const code = `
        ^FX
        ^FO${40 + x},${30 + y}^BQN,1,${lotNumber.length > 12 ? '4' : '5'}^FDQA,${lotNumber}^FS
        ${isMrpAvailable ? mrp : ''}
        ^FO${155 + x},${(isMrpAvailable ? 90 : 30) + y}^A0N,20,20^FD Offer Price^FS
        ^FO${155 + x},${(isMrpAvailable ? 115 : 55) + y}^A0N,22,22^FD ${sellingPrice}^FS
        ^FO${38 + x},${146 + y}^A0N,18,18^FB230,2,2,L,0^FD ${shortName}^FS
        ^FO${38 + x},${188 + y}^A0N,18,18^FD ${shortLotNumber}^FS
              `;
  
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
    }

  }, [potcode]);




  

  return <div style={{color:'black'}} ref={ref}>{zplCode}</div>;
});

export default CustomPrintQrCode;
