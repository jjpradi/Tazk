import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

function CommonInvoiceTemplate(props) {
  const [pdf_url, setpdf_url] = useState('');

  const {
    vendorReducer: {po_temp},
  } = useSelector((state) => state);

  // const reviveLayout = (obj) => {
  //   if (Array.isArray(obj)) {
  //     return obj.map(reviveLayout);
  //   }
  //   if (obj !== null && typeof obj === 'object') {
  //     return Object.fromEntries(
  //       Object.entries(obj).map(([key, value]) => {
  //         return [key, reviveLayout(value)];
  //       }),
  //     );
  //   }
  //   if (
  //     typeof obj === 'string' &&
  //     obj.trim().startsWith('(') &&
  //     obj.includes('=>')
  //   ) {
  //     return eval(`(${obj})`);
  //   }
  //   return obj;
  // };

  // useEffect(() => {
  //   try{
  //       pdfMake.fonts = {
  //           Poppins: {
  //             normal:
  //               'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
  //             bold: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
  //             italics:
  //               'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
  //             bolditalics:
  //               'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf',
  //           },
  //         };
  //         let data = reviveLayout(po_temp);
  //     if (props.cancelStatus) {
  //       data.watermark = {
  //         text: 'CANCELLED',
  //         color: '#bfbfbf',
  //         opacity: 0.4,
  //         bold: true,
  //         italics: false,
  //         fontSize: 60,
  //         angle: -30,
  //         margin: [0, 300]
  //       };
  //     }
  //         pdfMake.createPdf(data).getDataUrl((res)=>{
  //           setpdf_url(res)
  //         })
  //   }
  //   catch(err){
  //     console.log(err,'errsddddddff');
  //    setpdf_url("")
  //    return err
  //   }
  // }, [po_temp]);
// console.log(po_temp,'po_temp');

const pdfData = `data:application/pdf;base64,${po_temp.pdfBase64}`

  return (
    <div  style={{
      width: '100%',
      height: '100vh', 
      overflow: 'hidden', 
    }}>
      <iframe
        title='PDF Preview'
        src={`${pdfData}#toolbar=0&navpanes=0`}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          backgroundColor: 'white',
        }}
      />
    </div>
  );
}

export default CommonInvoiceTemplate;
