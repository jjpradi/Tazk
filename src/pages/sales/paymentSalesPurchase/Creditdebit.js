import React from 'react';
import {DataGrid} from '@mui/x-data-grid';
import { FaLessThanEqual } from 'react-icons/fa';
import { formatDate12Hr1, formatdateandtime} from 'utils/pageSize';


export default function Creditdebit({
  getPay = [],
  creditdebit = [],
  activeINV = 'PO',
  creditnote,
  setCreditNote,
  manualNoteSchemes,
  setManualNoteSchemes,
}) {
  return (
    <div style={{width: '100%', marginTop: '20px'}}>
      <DataGrid rowHeight={40}
        rows={manualNoteSchemes}
        columns={[
          {
            field: 'createdAt',
            headerName: 'Date',
            flex: 1,
            minWidth: 110,
            valueGetter: (params) => { return formatdateandtime(params.row.createdAt);}
          },
          {
            field: 'sequence_number',
            headerName: 'Ref Number',
            flex: 1,
          },
          {
            field: 'balance_amount',
            headerName: 'Total',
            flex: 1,
          },
          {
            field: 'po_number',
            valueGetter: (params) => {
              return `${params.row.po_number || params.row.invoice_number || params.row.scheme_name}` ;
            },
            headerName: 'Scheme',
            flex: 1,
          },
        ]}
        disableColumnMenu
        checkboxSelection
        pageSizeOptions={[]}
        
        autoHeight
        onRowSelectionModelChange={(newSelectionModel, f, g) => {
          const selectedIDs = new Set(newSelectionModel);
          const selectedRowData = manualNoteSchemes
            .filter((row) => selectedIDs.has(row.id))
            .map((i) => ({ ...i, selected: true }));
          
          let temp = manualNoteSchemes.map(m => ({...m, selected: selectedIDs.has(m.id) ? true : false,}))
          setManualNoteSchemes(temp);

          if (selectedRowData.length > 0) {
            setCreditNote(true);
          } else {
            setCreditNote(false);
          }
        }}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 2 } } }}
      />
    </div>
  );
}

// ---- old ----- //

// export default function Creditdebit({
//   getPay = [],
//   creditdebit = [],
//   activeINV = 'PO',
//   creditnote,
//   setCreditNote
 
  
// })
   
//  {

//   const valuecndn = [creditdebit]
//   return (
//     <div style={{width: '100%', marginTop:'20px'}}>
//       <DataGrid
//         rows={valuecndn}
//         columns={[
//           {
//             field: 'notecreate',
//             headerName:   'Date',
//             flex: 1,
//           },
//           {
//             field: 'note_number',
//             headerName: 'Ref Number',
//             flex: 1,
//           },
//           {
//             field: 'note_balance',
//             headerName:  'Total',
//             flex: 1,
//           },
//           {
//             field: 'notedescription',
//             headerName:  'Description',
//             flex: 1,
//           },
//         ]}
//         disableColumnMenu
//         checkboxSelection
//         rowsPerPageOptions={[]}
//         pageSize={4}
//         autoHeight
//         onSelectionModelChange={(newSelectionModel, f, g) => {
         
//           const selectedIDs = new Set(newSelectionModel);
//           const selectedRowData = valuecndn.filter((row) =>
//             selectedIDs.has(row.id),
//           );
        
//           if (selectedRowData.length > 0) {
//             setCreditNote(true);
//           } else {
//             setCreditNote(false);
//           }
//         }}
//       />
//     </div>
//   );
// }
