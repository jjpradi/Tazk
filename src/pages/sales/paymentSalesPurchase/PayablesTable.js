import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useSelector } from 'react-redux';

export default function DataGridDemo({
  getPay = [],
  setSelectionModel,
  activeINV = 'PO',
  invoiceselect,
  setinvoiceselect,
  poNum,
  setReceivableData
}) {
  // State Added
  const [rows, setRows] = useState(getPay);
  const storage = getsessionStorage()
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const {
    salesReducer: { salesApprovals, getApprovalRights }
  } = useSelector(state => state)

  useEffect(() => {
    if (getApprovalRights?.rights !== true && salesApprovals?.length > 0) {
      const updatedRows = [JSON.parse(salesApprovals[0].receivable_items)]
      const defaultSelectedIds = rows.filter(row =>
        updatedRows[0].some(update => row.po_number?.trim() === update.invoice_number?.trim())
      ).map(row => row.id);

      const selectedRow = rows
        .filter(row => updatedRows.some(update => row.po_number?.trim() === update.invoice_number?.trim()))

      setSelectedRowIds(defaultSelectedIds);
      setSelectionModel(defaultSelectedIds);
      setReceivableData(selectedRow);
      handleSelectionModelChange(defaultSelectedIds)
    }

    if (getPay && Array.isArray(getPay.itemsData)) {
      // setRows(
      //   getPay.itemsData.map((row) => ({
      //     ...row,
      //     id: row.receiving_id,
      //     paid_amount: getPay.paid_amount,
      //     total: getPay.total, 
      //     po_number: getPay.po_number
      //   }))
      // );
      setRows([{ ...getPay, id: getPay.receiving_id, invoice_number: getPay.itemsData[0].invoice_number }])
    }else{
      setRows(getPay)
    }
  }, [getPay]);

  // useEffect(() => {
  //   // Cleanup function to reset the DataGrid's state when navigating away
  //   return () => {
  //     setRows([]);
  //     setSelectionModel([]);
  //   };
  // }, []);

  const handleSelectionModelChange = (newSelectionModel, f, g) => {

    const selectedIDs = new Set(newSelectionModel);
    const selectedRowData = rows.filter((row) => selectedIDs.has(row.id));
    if (selectedRowData.length > 0) {
      setinvoiceselect(true);
    } else {
      setinvoiceselect(false);
    }

    // SetRows
    setRows([...selectedRowData, ...rows.filter((row) => !selectedIDs.has(row.id))]);
    setSelectionModel(selectedRowData);
    if (setReceivableData) {
      setReceivableData(selectedRowData)
    }
    // console.log(selectedRowData,'selectedRowData223')
  };
  console.log(poNum, "poNum");


  return (
    <div style={{ width: '100%' }}>
      <DataGrid
        rows={rows}
        rowHeight={40}
        columns={[
          ...(poNum !== 'disabled'
            ? [
              {
                field: 'po_number',
                headerName: 'PO Number',
                flex: 1,
              },
            ]
            : []),
          {
            field: 'invoice_number',
            headerName: activeINV === 'PO' ? 'Invoice Number' : '',
            flex: 1,
            hide: activeINV !== 'PO',
            valueGetter: (params) => {
              return typeof params.row.invoice_number === 'object'
                ? params.row.invoice_number?.map((d) => d.invoice_number).join('')
                : params.row.invoice_number;
            },
          },
          {
            field: 'total',
            headerName: 'Total',
            flex: 1,
            renderCell: ({ row }) => <div style={{ display: 'flex' }}>{+row.total - +row.paid_amount}</div>,
          },
        ]}
        disableColumnMenu
        checkboxSelection
        // selectionModel={selectedRowIds} // ✅ Bind pre-selected rows]
        rowSelectionModel={salesApprovals.length > 0 ? selectedRowIds : undefined} // ✅ If approvals exist, pre-select rows
        isRowSelectable={(params) =>
          getApprovalRights?.rights !== true ? salesApprovals.length === 0 || selectedRowIds.includes(params.id) : true // ✅ Allow free selection if no approvals
        }
        pageSizeOptions={[]}
        
        autoHeight
        sortModel={[
          {
            field: 'id',
            sort: 'asc',
          },
        ]}
        onRowSelectionModelChange={handleSelectionModelChange} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
      />
    </div>
  );
}
