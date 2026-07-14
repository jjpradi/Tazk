import MaterialTable, { MTableToolbar } from '../../../utils/SafeMaterialTable';
import { IconButton, Typography } from '@mui/material';
import { useState, useContext, useRef, useEffect } from 'react';
import CommonSearch from 'utils/commonSearch';
import { maxBodyHeight, maxHeight, pageSize } from 'utils/pageSize';
import FilterListIcon from '@mui/icons-material/FilterList';
import TransactionFilter from './transactionFilter';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useDispatch, useSelector } from 'react-redux';
import { getSaleOrderDeliveryChallanByCustomerAction } from 'redux/actions/sales_actions';
import { getQuotationByCustomerAction } from 'redux/actions/quotation_actions';
import { recentCreditDebitNotesAction } from 'redux/actions/manualNotes_actions';
import { getExpensesByVendorAction } from 'redux/actions/expense_actions';
import { getPurchaseOrderByVendorAction } from 'redux/actions/purchase_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { ExportPdf, ExportCsv } from '@material-table/exporters';
import apiCalls from 'utils/apiCalls';
import { debounce } from 'lodash';

function TransactionsTable(props) {
  console.log(props.selectedTab, "propsnnnnn")
  const { searchVal }  = props;
  const dispatch = useDispatch()
  const mtColumns = props.columns.map((col) => ({
    title: col.title,
    field: col.field,
    render: col.render,
  }));
  const [openFilter, setOpenFilter] = useState(false);
  const [reducer, setReducer] = useState('');
  const {
    salesReducer: { salesInvoiceByCustomer },
  } = useSelector((state) => state);
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(CreateNewButtonContext);
  const [searchVal1, setSearchVal1] = useState(props.searchVal || '');
    const searchDebounceRef = useRef(null);

  useEffect(() => {
        setSearchVal1('');
        return () => {
          if (searchDebounceRef.current) {
            searchDebounceRef.current.cancel();
          }
        };
      }, [props.selectedTab]);



  const handleFilterApply = async (appliedFilters) => {
    props.setFilters(appliedFilters);
    const commonData = {
      customerId: props.customer_id,
      pageCount: props.page || 0,
      numPerPage: props.pageSize || 0,
      searchString: searchVal1,
      ...appliedFilters,
    };

    if (['invoice', 'customerReceipts', 'saleOrder', 'deliveryChallan'].includes(props.selectedTab)) {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(getSaleOrderDeliveryChallanByCustomerAction({
          ...commonData,
          type: props.selectedTab,
        }))
      );
    }

    if (props.selectedTab === 'quotation') {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(getQuotationByCustomerAction(props.customer_id, props.page, props.pageSize, searchVal1, appliedFilters))
      );
    }

    if (props.selectedTab === 'expenses') {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(getExpensesByVendorAction(props.customer_id, props.page, props.pageSize,  searchVal1, appliedFilters))
      );
    }

    if (['CreditNotes', 'debitNote'].includes(props.selectedTab)) {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(recentCreditDebitNotesAction({
          customer_id: props.contactType === 'Customer' ? props.customer_id : null,
          supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
          pageCount: props.page,
          numPerPage: props.pageSize,
          searchString: searchVal1,
          ...appliedFilters,
        }))
      );
    }

    if (['vendorPayments', 'purchaseOrder', 'bills'].includes(props.selectedTab)) {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(getPurchaseOrderByVendorAction({
          vendorId: props.customer_id,
          type: props.selectedTab,
          pageCount: props.page,
          numPerPage: props.pageSize,
          searchString: searchVal1,
          ...appliedFilters,
        }))
      );
    }
  };

  const getExportData = async (exportFunc) => {
  const filters = props.filters || {};
  let result = null;

  if (['invoice', 'customerReceipts', 'saleOrder', 'deliveryChallan'].includes(props.selectedTab)) {
    result = await dispatch(getSaleOrderDeliveryChallanByCustomerAction({
      ...filters,
      customerId: props.customer_id,
      type: props.selectedTab,
      pageCount: 0,
      numPerPage: 0,
      export: true
    }));
  } else if (props.selectedTab === 'quotation') {
    result = await dispatch(getQuotationByCustomerAction(props.customer_id, 0, 0, { filters, export: true }));
  } else if (props.selectedTab === 'expenses') {
    result = await dispatch(getExpensesByVendorAction(props.customer_id, 0, 0, '', { ...filters, export: true }));
  } else if (['CreditNotes', 'debitNote'].includes(props.selectedTab)) {
    result = await dispatch(recentCreditDebitNotesAction({
      customer_id: props.contactType === 'Customer' ? props.customer_id : null,
      supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
      pageCount: 0,
      numPerPage: 0,
      ...filters,
      export: true
    }));
  } else if (['vendorPayments', 'purchaseOrder', 'bills'].includes(props.selectedTab)) {
    result = await dispatch(getPurchaseOrderByVendorAction({
      vendorId: props.customer_id,
      type: props.selectedTab,
      pageCount: 0,
      numPerPage: 0,
      ...filters,
      export: true
    }));
  }

  if (result?.status === 'API_FINISHED_SUCCESS') {
    const exportData = result?.data?.salesInvoice || result?.data?.customerPayments || result?.data?.data || result?.data?.saleOrder || result?.data?.deliveryChallan || result?.data?.vendorPayments || result?.data?.purchaseOrder || result?.data?.purchases
    console.log('resultsconsrol', result, exportData, props.tableData)
    exportFunc(mtColumns, exportData , props.tableName || 'Transactions');
  } else {
    exportFunc(mtColumns, props.tableData || [], props.tableName || 'Transactions');
  }
};


    const requestSearch = (e) => {
      const value = e.target.value;
      setSearchVal1(value);

      if (searchDebounceRef.current) {
        searchDebounceRef.current.cancel();
      }

      const tab = props.selectedTab;
      const page = props.page || 0;
      const pageSize = props.pageSize || 0;

      searchDebounceRef.current = debounce(async (val) => {
        let action = null;

        switch (tab) {
          case 'invoice':
          case 'customerReceipts':
          case 'saleOrder':
          case 'deliveryChallan':
            action = getSaleOrderDeliveryChallanByCustomerAction({
              customerId: props.customer_id,
              type: tab,
              searchString: val,
              pageCount: page,
              numPerPage: pageSize,
            });
            break;

          case 'quotation':
            action = getQuotationByCustomerAction(props.customer_id, page, pageSize, val);
            break;

          case 'expenses':
            action = getExpensesByVendorAction(props.customer_id, page, pageSize, val);
            break;

          case 'CreditNotes':
          case 'debitNote':
            action = recentCreditDebitNotesAction({
              customer_id: props.contactType === 'Customer' ? props.customer_id : null,
              supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
              pageCount: page,
              numPerPage: pageSize,
              searchString: val,
            });
            break;

          case 'vendorPayments':
          case 'purchaseOrder':
          case 'bills':
            action = getPurchaseOrderByVendorAction({
              vendorId: props.contactType === 'Supplier' ? props.customer_id : null,
              pageCount: page,
              numPerPage: pageSize,
              searchString: val,
              type: tab,
            });
            break;

          default:
            return;
        }

        await apiCalls(setModalTypeHandler, setLoaderStatusHandler, dispatch(action));
      }, 300);

      searchDebounceRef.current(value);
    };

  
      const cancelSearch = () => {
        setSearchVal1('');
        if (searchDebounceRef.current) {
          searchDebounceRef.current.cancel();
        }

        const tab = props.selectedTab;
        const page = 0;
        const pageSize = props.pageSize || 0;

        searchDebounceRef.current = debounce(async () => {
          let action;

          switch (tab) {
            case 'invoice':
            case 'customerReceipts':
            case 'saleOrder':
            case 'deliveryChallan':
              action = getSaleOrderDeliveryChallanByCustomerAction({
                customerId: props.customer_id,
                type: tab,
                searchString: '',
                pageCount: page,
                numPerPage: pageSize,
              });
              break;
            case 'quotation':
              action = getQuotationByCustomerAction(props.customer_id, page, pageSize, '');
              break;
            case 'expenses':
              action = getExpensesByVendorAction(props.customer_id, page, pageSize, '');
              break;
            case 'CreditNotes':
            case 'debitNote':
              action = recentCreditDebitNotesAction({
                customer_id: props.contactType === 'Customer' ? props.customer_id : null,
                supplier_id: props.contactType === 'Supplier' ? props.customer_id : null,
                pageCount: page,
                numPerPage: pageSize,
                searchString: '',
              });
              break;
            case 'vendorPayments':
            case 'purchaseOrder':
            case 'bills':
              action = getPurchaseOrderByVendorAction({
                vendorId: props.contactType === 'Supplier' ? props.customer_id : null,
                pageCount: page,
                numPerPage: pageSize,
                searchString: '',
                type: tab,
              });
              break;
            default:
              break;
          }

          if (action) {
            await apiCalls(setModalTypeHandler, setLoaderStatusHandler, dispatch(action));
          }
        }, 100);

        searchDebounceRef.current();
      };

  console.log( props.tableData, 'mtcolumns')
  return (
    <>
      <MaterialTable
        title={props.tableName}
        columns={mtColumns}
        data={props.tableData}
        onRowClick={(event, rowData) => props.onRowClick?.(rowData)}
        totalCount={props.totalCount || (props.tableData?.length || 0)}
        page={props.page}
        onPageChange={props.handlePageChange}
        onRowsPerPageChange={props.handlePageSizeChange}
        options={{
          paging: true,
          search: false,
          exportButton: true,
          maxBodyHeight: `calc(${maxHeight} - 190px)`,
          minBodyHeight: `calc(${maxHeight} - 190px)`,
          pageSize: props.pageSize,
          pageSizeOptions: [20, 50, 100],
          emptyRowsWhenPaging: false,
          headerStyle: {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          },
          rowStyle: {
            cursor: props.onRowClick ? 'pointer' : 'default',
          },
          exportMenu: [
    {
      label: 'Export PDF',
      exportFunc: () => {
        getExportData((columns, data, title) => {
          if (title === "Invoices") {
            columns = columns.map((col) => {
              if (col.title === "Delivery Status") {
                return {
                  ...col,
                  field: "status"
                };
              }
              return col;
            });
          }
          if(title === "Sale Orders"){
              data = data.map((rowData) => {
                const status = rowData.sale_status;
                const creditReturn = rowData?.creditReturn || 0;
                const converted = rowData?.updated_status === 15;
                const statusName = rowData?.sale_status_name;
                const approvalStatus = rowData?.status;
        
                let displayText = '';
                if (converted) {
                  displayText = 'Invoiced';
                } else if (creditReturn > 0) {
                  displayText = statusName;
                } else if (statusName === 'Send SO') {
                  displayText = approvalStatus === 'Waiting Approval'
                    ? 'Waiting Approval'
                    : approvalStatus === 'Approved'
                      ? 'Approved'
                      : 'SO Created';
                } else if (statusName === 'Direct Challan') {
                  displayText = 'Delivery Challan';
                } else {
                  displayText = statusName;
                }
        
                return {
                  ...rowData,
                  sale_status: displayText
                };
              });
          }
          console.log('exportfunc1',columns, data, title)
          ExportPdf(columns, data, title);
        });
      },
    },
    {
      label: 'Export CSV',
      exportFunc: () => {
        getExportData((columns, data, title) => {
        console.log('exportfunc2',columns, data, title)
          ExportCsv(columns, data, title);
        });
      },
    },
  ],
        }}
        // localization={{
        //   body: {
        //     emptyDataSourceMessage: (
        //       <Typography align="center" sx={{ fontSize: '11px' }}>
        //         No Transactions Available
        //       </Typography>
        //     ),
        //   },
        // }}
        components={{
          Toolbar: (toolbarProps) => (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                }}
              >
                <div style={{ flexGrow: 1 }}>
                  <MTableToolbar {...toolbarProps} />
                </div>
                 <div >
                <CommonSearch
                  searchVal={searchVal1}
                  cancelSearch={cancelSearch}
                  requestSearch={requestSearch}
                />
              </div>
                <div>
                  <IconButton onClick={() => setOpenFilter(true)} size="large">
                    <FilterAltIcon />
                  </IconButton>
                </div>
              </div>
            </>
          ),
        }}
      />

      <TransactionFilter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={handleFilterApply}
        selectedTab={props.selectedTab}
        setSelectedTab={props.setSelectedTab}
        customer_id={props.customer_id}
        contactType={props.contactType}
        page={props.page}
        pageSize={props.pageSize}
      />
    </>
  );
}

export default TransactionsTable; 
