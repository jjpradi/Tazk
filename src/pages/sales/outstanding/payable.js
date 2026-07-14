import React, {useEffect, useContext, useRef, useState} from 'react';
// import PropTypes from 'prop-types';from
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {useDispatch, useSelector} from 'react-redux';
import {
  paymentview,
  createPurchasesAction,
  updatePurchasesAction,
  receivingsPayments,
  consolidatedPayables,
  getbyidPurchasesAction,
  set_searchPurchasePayablesAction,
  searchPurchasePayablesAction,
  paymentviewPending
} from '../../../redux/actions/purchase_actions';
import {getSupplierDetailsByIdAction, getSupplierDetailsByIdreceivings_itemsAction, listVendorAction, listVendorIdAndNameAction} from '../../../redux/actions/vendor_actions';
import {payablesPaymentEntry} from '../../../redux/actions/purchase_actions';
import {listStockLocationAction} from '../../../redux/actions/stock_Location_actions';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PaymentDialog from '../paymentSalesPurchase/Dialog';
import context from '../../../context/CreateNewButtonContext';
// import Chip from '@mui/material/Chip';
// import ArticleIcon from '@mui/icons-material/Article';
import Popup from '../purchases/Popup';
import InvoiceDialog from '../sales/InvoiceDialog';
import {sendMail} from '../../../redux/actions/sales_actions';
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
import {getDateTime, getDateTimeFormat} from '../../../utils/getTimeFormat';
import {Grid,  CardContent, Card, Stack, TablePagination, Tooltip, Dialog, Chip, TableSortLabel, Button, Link, Menu, MenuItem} from '@mui/material';
import CardTemplate from '../../../components/customer_erpDesign/cardTemplate';
import {sendNtfy} from '../../../firebase/firebase.service';
import  "../../../index.css";
import {
  getLoginRoleAction,
  getLoginTokenAction,
} from '../../../redux/actions/userRole_actions';
import Cookies from 'universal-cookie';
import notificationType from '../../../firebase/notify_type';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {createTransactionAction} from '../../../redux/actions/transaction_actions';
import { listChartOfAccountsAction } from '../../../redux/actions/chartOfAccounts';
import {getByIdMailConfigurationAction} from '../../../redux/actions/configuration_actions';
import {listUserCreationAction} from '../../../redux/actions/userCreation_actions';
import AddchartIcon from '@mui/icons-material/Addchart';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import DateRangeIcon from '@mui/icons-material/DateRange';
import Cards from '../../../components/dynamicCards/index';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import KpiStrip from './shared/KpiStrip';
import AgingChips from './shared/AgingChips';
import ViewToggleChips from './shared/ViewToggleChips';
import ExportMenu from './shared/ExportMenu';
import OutstandingPagination from './shared/OutstandingPagination';
import OutstandingTable from './shared/OutstandingTable';
import CollapsibleGroupRow from './shared/CollapsibleGroupRow';
import OpeningBalanceTable from './shared/OpeningBalanceTable';
import SortableHeader from './shared/SortableHeader';
import { formatRupeesCompact } from './shared/formatRupees';
import useChipState from './shared/useChipState';
import usePagination from './shared/usePagination';
import useTableSort from './shared/useTableSort';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { headerStyle, maxBodyHeight, maxHeight, pageSize, tabHeight } from 'utils/pageSize';
import { getManualNoteSchemesByIdAction } from 'redux/actions/manualNotes_actions';
import moment from 'moment';
import CommonToolTip from '../../../components/ToolTip';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { roleType } from 'utils/roleType';
import { getOpeningBalActions } from '../../../redux/actions/ledger_actions';
import OpeningBalPayment from './openingBalPayment';
import AddIcon from '@mui/icons-material/Add';
import ReminderForm from 'pages/common/Calender/ReminderForm';
import { Form, Formik } from 'formik';
import App from 'components/customer_erpDesign';
// import { customerAsCompanyAction } from 'redux/actions/customer_actions';
import ReceiptPayments from 'components/ReceiptPayments/ReceiptPayments';
import ContactPage from '../../../../src/@crema/services/db/Contact/index';
import { OpenCustomerLandingPage } from '@crema/utility/helper/RouteHelper';
import jsPDF from "jspdf";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PayablesLandingPage from './PayablesLandingPage'
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

// const poStatus = {
//   New: 'primary',
//   Open: 'secondary',
//   'Pending Payment': 'warning',
//   'Pending Goods': 'warning',
//   Completed: 'success'
// }

function Row(props) {
  const dispatch = useDispatch()
  const {row, pendingPayment, setedit_data, handleMailConfiguration} = props;
  const [Dopen, setDopen] = React.useState(false);
  const hasPendingDue = (data) => Number(data?.due_amount || 0) > 0;
  const openingBal = props.openingBalanceLedgers.find(j => j.ledger_id === row.ledger_id);
  const {setLoaderStatusHandler, setModalTypeHandler, commoncookie,headerLocationId } = useContext(CreateNewButtonContext);

  const handleVendorExportPDF = (vendor) => {
    let rowData = [];

    if (vendor.childRow && vendor.childRow.length > 0) {
      rowData = vendor.childRow;
    }

    if (props.openingBalanceLedgers?.length > 0) {
      const opening = props.openingBalanceLedgers.filter(
        (j) => j.ledger_id === vendor.ledger_id
      );
      rowData = [...rowData, ...opening];
    }

    const exportData = prepareExportData(rowData);

    const doc = new jsPDF();
    if (!exportData.length) {
      doc.text("No data to export.", 10, 10);
      doc.save(`${vendor.vendorName || vendor.name}.pdf`);
      return;
    }

    const headers = Object.keys(exportData[0]);
    const rows = exportData.map((row) => headers.map((h) => row[h]));

    doc.autoTable({
      startY: 20,
      head: [headers],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${vendor.vendorName || vendor.name}.pdf`);
  };

  const prepareExportData = (data, pageType) => {
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    if (!rows.length) {
      console.warn("No valid rows to export:", data);
      return [];
    }

    console.log(rows, 'asdfsdfdsf')

    const mapped = rows.map((row, i) => {
      try {
        return {
          "Vendor": row.vendorName || "",
          "PO Number": row.bill_number || "",
          "Reference": Array.isArray(row.invoice_number) && row.invoice_number.length > 0
            ? row.invoice_number
              .map((i) => i.invoice_number)
              .join(', ')
            : row?.invoice,
          "PO Date": row.receiving_time || '',
          "Received Date": row.invoice_date || '',
          "Location": row.location_name || "",
          "Total": row.total ?? 0,
          "Due": row.due_amount || "",
          "Due Date": moment(row.due_date).format("DD/MM/YYYY") || "",
          "Reminder": row.reminder || "",

        };
      } catch (err) {
        console.error(`Error mapping row ${i}:`, err, row);
        return null;
      }
    }).filter(Boolean);


    console.log("Mapped export data:", mapped);
    return mapped;
  };

  const handleVendorExportCsv = (vendor) => {
    let rowData = [];

    if (vendor.childRow && vendor.childRow.length > 0) {
      rowData = vendor.childRow;
    }

    if (props.openingBalanceLedgers?.length > 0) {
      const opening = props.openingBalanceLedgers.filter(
        (j) => j.ledger_id === vendor.ledger_id
      );
      rowData = [...rowData, ...opening];
    }

    const exportData = prepareExportData(rowData);
    if (!exportData.length) return;

    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(","),
      ...exportData.map((row) =>
        headers
          .map((k) => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${vendor.vendorName || vendor.name}.csv`;
    link.click();
  };

  const handleEditChild = async (data) => {
    await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
             dispatch(
      getSupplierDetailsByIdreceivings_itemsAction(data.supplier_id, { receiving_id: data?.receiving_id })
    ))
    setedit_data(data);
    setDopen(true)
  };
   
  return (
    <React.Fragment>
      <CollapsibleGroupRow
        colSpan={6}
        parentRowSx={{ '& > *': { borderBottom: 'unset' } }}
        parent={(() => {
          const dimmed = Number(row.total) === 0;
          const cellSx = dimmed ? { color: 'text.disabled' } : undefined;
          return (
            <>
              <TableCell
                component="th"
                scope="row"
                sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280, ...(cellSx || {}) }}
              >
                {row.vendorName ?? row.name}
              </TableCell>
              <TableCell align="right" sx={cellSx}>{row.count}</TableCell>
              <TableCell align="right" sx={cellSx}>{row.avgDue_days}</TableCell>
              <TableCell align="right" sx={cellSx}>{row.total?.toFixed(2)}</TableCell>
              <TableCell align="right" sx={cellSx}>{openingBal ? (openingBal?.credit ?? 0) - (openingBal?.debit ?? 0) : 0}</TableCell>
            </>
          );
        })()}
        expanded={
          <>
            {props.payableExport && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                <ExportMenu
                  items={[
                    { label: 'Export PDF', onClick: () => handleVendorExportPDF(row) },
                    { label: 'Export CSV', onClick: () => handleVendorExportCsv(row) },
                  ]}
                />
              </Box>
            )}
                <Table size='small' aria-label='purchases'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill#</TableCell>
                      <TableCell>Reference</TableCell>
                      {/* <TableCell>PO Date</TableCell> */}
                      <TableCell>Received Date</TableCell>
                      <TableCell>Location</TableCell>
                      {/* <TableCell>Payment Type</TableCell> */}
                      <TableCell>Amount</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Payment</TableCell>
                      {/* <TableCell>Due Days</TableCell> */}
                      <TableCell>Due Date</TableCell>
                      <TableCell>Reminder</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.childRow?.map((historyRow,index) => (
                      <TableRow 
                      style={{cursor : 'pointer'}}
                        onClick={() => props.landingOpen(historyRow, index)}
                      key={historyRow.receiving_id} >
                        <TableCell>
                          <span style={{
                            textDecoration: 'none',
                            cursor: 'pointer',
                            color: '#03adfc',
                            display: 'inline-block',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChild(historyRow);
                          }}>
                            {historyRow.bill_number}
                          </span>
                        </TableCell>
                        <TableCell>
                          {typeof historyRow.invoice_number !== 'string' && historyRow.invoice_number?.length > 0
                            ? historyRow.invoice_number
                                .map((i) => i.invoice_number)
                                .join(', ')
                            : historyRow.invoice}
                        </TableCell>
                        {/* <TableCell>{historyRow.receiving_time}</TableCell> */}
                        <TableCell>{historyRow.invoice_date}</TableCell>
                        <TableCell>{historyRow.location_name}</TableCell>
                        {/* <TableCell >
                          {historyRow.payment_type}
                        </TableCell> style={{textAlign:'right'}} */}
                        <TableCell>
                          {historyRow.total}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>{historyRow.due_amount}</TableCell>
                        <TableCell>
                          <div style={{display: 'flex', cursor: 'pointer'}}>
                            {!hasPendingDue(historyRow) ? (
                              <AssignmentTurnedInIcon color='success' />
                            ) : props.payablePayment && (
                              <CommonToolTip title = 'Make payment'>
                              <AssignmentLateIcon
                                onClick={(e) => {
                                  e.stopPropagation()
                                  pendingPayment(historyRow)
                                }
                                }
                                color='warning'
                              />
                              </CommonToolTip>
                            )}
                          </div>
                        </TableCell>
                        {/* <TableCell>{historyRow.due_days}</TableCell> */} 
                        {/* <TableCell>{historyRow.due_days_credit}</TableCell> */}
                        <TableCell>{historyRow.due_date ? moment(historyRow.due_date).format('DD/MM/YYYY') : '-'}</TableCell>
                        <TableCell>{historyRow.reminder ? moment(historyRow.reminder).format("DD/MM/YYYY hh:mm A") : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              {/* </>
            ) : null} */}
            <OpeningBalanceTable
              title={row.vendorName}
              ledgers={props.openingBalanceLedgers.filter((j) => j.ledger_id === row.ledger_id)}
              getAmount={(j) => (j.credit ?? 0) - (j.debit ?? 0)}
              showPaymentCell={!!props.payablePayment}
              renderPayment={(j) => (
                <div style={{ display: 'flex', cursor: 'pointer' }}>
                  <CommonToolTip title="Make payment">
                    <AssignmentLateIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        props.handleOpeningBalPayment(j);
                      }}
                      color="warning"
                    />
                  </CommonToolTip>
                </div>
              )}
            />
          </>
        }
      />
    </React.Fragment>
  );
}

export default function CollapsibleTable() {
  const dispatch = useDispatch();
  let storage = getsessionStorage()

  const {
    purchasesReducer: {purchase_outstanding, purchase_outstanding_count, purchases, consolidated_data ,setPurchase},
    vendorReducer: {vendorIdAndName: vendor},
    stockLocationReducer: {stocklocation},
    appConfigReducer: {app_config_data},
    ChartOfAccountsReducer: {chartOfAccounts},
    UserCreationReducer: {createUser},
    ConfigurationReducer: {mail_configuration},
    ledgerReducer: {openingBalanceLedgers},
      rbacReducer: { menuAccess } 
    // customerReducer : {customerAsCompany}
    
  } = useSelector((state) => state);
  const [PayData, setPayData] = React.useState({
    paymentOpen: false,
    itemsData: [],
    Tdata: [],
    getVendor: {},
    paid_amount: 0,
  });
  const [openPaymentDialog, setopenPaymentDialog] =React.useState(false);
  const [openAlert, setOpenAlert] =React.useState(false);
  const [manualNoteSchemes, setManualNoteSchemes] = useState([]);
  const [isEdit, setisEdit] = React.useState(false);
  const [edit_data, setedit_data] = React.useState({});
  const [status, setstatus] = React.useState('');
  const [selectionModel, setSelectionModel] = React.useState([]);
  const [entryvalue, setHandleEntry] = useState(false)
  const [getPay, setgetPay] = React.useState([]);
  const [isApiFinished, setIsApiFinished] = useState(false);
  const { page, size, setPage, setSize, handleChangePage, handleChangeRowsPerPage } = usePagination({ initialSize: 20 });
  const [searchVal, setSearchVal] = useState("")
  const [searchData, setSearchData] = useState([]);  
  const tempinitsform = useRef(null);
  const [openingBalPaymentOpen, setOpeningBalPaymentOpen] = useState(false)
  const [openingBalData, setOpeningBalData] = useState({})
  const [reminder, setReminder] = useState(false)
  const { sortConfig, setSortConfig, handleSort } = useTableSort({ key: "received_date", order: "desc" });
  const { sortConfig: sortConfigParent, setSortConfig: setSortConfigParent, handleSort: handleSortParent } = useTableSort({ key: "vendarName", order: "asc" });
  const [onrowclick,setOnrowclick] = useState(false)
  const [data,setData] = useState() 
  const initialState = {
      "Overdue": false,
      "Due Today": false,
      Vendors: false,
      Value: true,
      "1-15 Days": false,
      "16-30 Days": false,
      "31-45 Days": false,
      "46-60 Days": false,
      "61-90 Days": false,
      "> 90 Days": false
    };
    const { selectedChip, activeChip, selectChip, setSelectedChip, setActiveChip } = useChipState(initialState);
    const [totalDue, setTotalDue] = useState(null);
    const [chipDataTotals, setChipDataTotals] = useState({});
    const [open,setOpen] = useState(false)
    const [index,setRowIndex] = useState(false)
    const [rowData,setRowData] = useState(false)

    console.log(purchase_outstanding,'purchase_outstandingffff')

  

  const refreshVendor = useRef(null);

  const {paymentOpen, itemsData, Tdata, getVendor, paid_amount, receiving_id} =
    PayData;
  const [appConfigData, setAppConfigData] = useState({});
  const [Dopen, setDopen] = React.useState(false);
  const [clickedInvoice, setclickedInvoice] = useState(null);
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
    employee_id,
  } = useContext(context);
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const hasPendingDue = (data) => Number(data?.due_amount || 0) > 0;
  const getPaymentViewBody = (overrides = {}) => ({
    pageCount: page,
    numPerPage: size,
    searchString: searchVal,
    key: activeChip,
    order:
      activeChip === "Vendors"
        ? sortConfigParent.order || "desc"
        : sortConfig.order || "desc",
    val:
      activeChip === "Vendors"
        ? sortConfigParent.key || ""
        : sortConfig.key || "",
    ...overrides,
  });

  const selectedRole = storage.role_name
      useEffect(() => {
        if (!selectedRole) return;
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
      }, [selectedRole, dispatch]);
    
    const payableExport =UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payables', 'can_export') ;
    const payablePayment = UserRightsAuthorization(menuAccess[selectedRole], 'purchases__payments', 'can_create') ;

  const handleEdit = (data) => {
    setedit_data(data);
    setstatus('edit');
    setisEdit(true);

    // const getVendor = vendor.filter(
    //   (d) => data.supplier_id === d.supplier_id,
    // )[0];
    // setPayData({...PayData, getVendor});
    // setDopen(true);

    dispatch(getSupplierDetailsByIdAction(data.supplier_id, (supplierDetails) => {
      const getVendor = supplierDetails || {};
      setPayData({...PayData, getVendor});
      setDopen(true);
    }))

    
  };
  const handleMailConfiguration = async () => {
    const roleIdData = createUser.filter(f => f.employee_id === commoncookie)
    if(roleIdData.length > 0){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getByIdMailConfigurationAction('Purchase Order', roleIdData[0]?.role_id))
      );
    }
  }

  // useEffect(() => {
  //   dispatch(consolidatedPayables(setModalTypeHandler, setLoaderStatusHandler))

  // }, [purchase_outstanding])
  
  

  const sample = (value) => {
    setisEdit(value);
  };

  const createPurchases = (
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
  ) => {
    dispatch(
      createPurchasesAction(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
        sample,
        null,
        null,
        null,
        commoncookie,
        headerLocationId,
      ),
    );
  };

  const updatePurchases = (
    id,
    data,
    setModalTypeHandler,
    setLoaderStatusHandler,
    sample,
    employee_id,
    headerLocationId,
  ) => {
    dispatch(
      updatePurchasesAction(
        id,
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
        sample,
        null,
        employee_id,
        headerLocationId,
      ),
    );
  };

  useEffect(() => {
    // dispatch(listVendorAction(true, setLoaderStatusHandler))
    dispatch(listVendorIdAndNameAction())
  }, [])

  // useEffect(() => {
  //   const body = {
  //     pageCount : page,
  //     numPerPage : size,
  //     searchString: searchVal,
  //     key: activeChip,
  //     order: activeChip === "Vendors" ? sortConfigParent.order || "desc" :  sortConfig.order || "desc" , 
  //     val:activeChip === "Vendors" ? sortConfigParent.key || "" : sortConfig.key || ""
  //   }
  //   console.log('callingggg1')

  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,

  //     dispatch(paymentview(body,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler)),
  //     dispatch(getOpeningBalActions('sundryCreditors')),
  //     dispatch(customerAsCompanyAction())
  //   )
  // }, [headerLocationId, page, size, activeChip, sortConfig, sortConfigParent])

  // useEffect(() => {
  //   const body = {
  //     key: activeChip,
  //   }
    
  //   console.log('callingggg2')
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,

  //     dispatch(paymentviewPending(body,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler)).then(response => {
  //       if (response && response.data) {
  //         const chipTotals = {};
  //         response.data.forEach(item => {
  //           chipTotals[item.filter] = item.data;
  //         });
  //         console.log(chipTotals, "chipTotalsnnn")
  //         setChipDataTotals(chipTotals);
  
  //         // Optional: setTotalDue based on activeChip
  //         if (chipTotals[activeChip]) {
  //           setTotalDue(chipTotals[activeChip]);
  //         } else {
  //           setTotalDue(0);
  //         }
  //       }
  //     })
  //   )
  // }, [headerLocationId, activeChip])


  useEffect(() => {
  // --- Body 1 ---
  const body = {
    pageCount: page,
    numPerPage: size,
    searchString: searchVal,
    key: activeChip,
    order:
      activeChip === "Vendors"
        ? sortConfigParent.order || "desc"
        : sortConfig.order || "desc",
    val:
      activeChip === "Vendors"
        ? sortConfigParent.key || ""
        : sortConfig.key || "",
  };

  console.log("calling... ONE EFFECT");

  // --- API 1 ---
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
      paymentview(
        body,
        commoncookie,
        headerLocationId,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    ),
    dispatch(getOpeningBalActions("sundryCreditors")),
    //  !customerAsCompany.length && dispatch(customerAsCompanyAction())
  ).finally(() => setIsApiFinished(true));

  // --- API 2 ---
  const body2 = {
    key: activeChip,
  };

  dispatch(
    paymentviewPending(
      body2,
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
  ).then((response) => {
    if (response && response.data) {
      const chipTotals = {};
      response.data.forEach((item) => {
        chipTotals[item.filter] = item.data;
      });
      setChipDataTotals(chipTotals);

      if (chipTotals[activeChip]) {
        setTotalDue(chipTotals[activeChip]);
      } else {
        setTotalDue(0);
      }
    }
  });
}, [
  headerLocationId,
  activeChip,
  page,
  size,
  sortConfig,
  sortConfigParent
]);

  const initsform = () => {
    // const body = {
    //   pageCount : page,
    //   numPerPage : size
    // }
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,

      // dispatch(paymentview(body,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler)),

      !createUser.length && dispatch(listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler)),
      //!app_config_data.length && dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(consolidatedPayables(headerLocationId,setModalTypeHandler, setLoaderStatusHandler))
      // !vendor.length && dispatch(listVendorAction(true, setModalTypeHandler, setLoaderStatusHandler)),
      // !stocklocation.length && dispatch(listStockLocationAction(commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler)),
      // !chartOfAccounts.length && dispatch(listChartOfAccountsAction())
    );
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();

  }, [headerLocationId]);

  // useEffect(() => {
  //   if (headerLocationId !== '') {
      
  //     apiCalls(
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //       dispatch(paymentview(commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler)),
  //       dispatch(consolidatedPayables(headerLocationId,setModalTypeHandler, setLoaderStatusHandler))
  //     );
  //   }
  // }, [headerLocationId]);

  console.log("dddsdsd", openingBalanceLedgers);


  const setpaymentOpen = (data) => {
    setPayData({...PayData, paymentOpen: false, Tdata: []});
  };

  const setTdata = (data) => {
    setPayData({...PayData, Tdata: data});
  };
  // const ledgerPaymentApi = (amount,ledgerData) => {
  //   const data = {
  //     // "code": "234",
  //     // "entity": "324",
  //     location_id:headerLocationId,
  //     specialNumber: '00',
  //     note: 'Purchase Payment',
  //     referenceNumber: ledgerData,
  //     voucherTypeId: 1,
  //   };
  
  //   const accountTransaction = [];
  //    chartOfAccounts.forEach((d) => {
  //     const {id, creditSign, debitSign} = d;
  //     const dd = {accountId: id, description: ""};
  //     if (ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
  //       let payables = ledgerData.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

  //       dd.amount = creditSign * payables?.payment_amount || 0
        
  //       accountTransaction.push(dd);
  //     }else if(ledgerData.filter(f => f.ledger_id === id).length){
  //       dd.amount = debitSign * amount || 0
  //       accountTransaction.push(dd);
  //     }
  //   });
  //   data.accountTransaction = accountTransaction;
  //   dispatch(createTransactionAction(data,true,setLoaderStatusHandler))
  // };

  const paymentValidate = (type, receiptDate, addAdvanceAmount) => {
    let paid_amount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.payment_amount;
    }, 0);
    paid_amount = manualNoteSchemes.filter(i => i.selected).reduce((a,c) => a + +c.new_adjusted_amount, paid_amount)

    let due_paid_amount = Tdata.reduce(function (acc, obj) {
      return acc + +obj.due;
    }, 0);
    due_paid_amount = manualNoteSchemes.filter(i => i.selected).reduce((a,c) => a + +c.new_adjusted_amount, due_paid_amount)


    const payment_type = Tdata.filter((d) => d.payment_type)
      .map((d) => d.payment_type.split(' ')[0])
      .join(', ');

    let indiviTotal = paid_amount;
    const payables = selectionModel.filter(d => d.type === 'Invoice').map((d) => {
      const newObj = {};
      const sub = indiviTotal - (+d.originalRow.total - +d.originalRow.paid_amount);
      // const totalPaymentAmount = Tdata.reduce((sum, item) => sum + item.payment_amount, 0);

      if (Math.sign(sub) === 1 || Math.sign(sub) === 0) {
        newObj.paid_amount = indiviTotal;
        newObj.payment_type = payment_type;

        let inventory = false;
        let status = d.originalRow.status ? d.originalRow.status : 'New';

        if (d.originalRow.receive_goods === 'received') {
          // inventory = true
          status = 'Completed';
        }
        newObj.inventory = inventory;
        newObj.status = status;
        indiviTotal = sub;
      } else {
        newObj.paid_amount = indiviTotal;
        newObj.payment_type = payment_type;
        indiviTotal = 0;
      }
      newObj.receiving_id = d.originalRow.receiving_id;
      newObj.receivings_items = d.originalRow.receivings_items;
      return newObj;
    });



    let ledgeramount = paid_amount > due_paid_amount ? due_paid_amount : paid_amount
    // const accountTransaction = [];
    //  chartOfAccounts.forEach((d) => {
    //   const {id, creditSign, debitSign} = d;
    //   const dd = {accountId: id, description: ""};
    //   if (Tdata.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id ).length) {
    //     let payables = Tdata.filter(f => f.paymentLedgerId === id || f.cashboxLedgerId === id )?.[0] || {}

    //     dd.amount = creditSign * payables?.payment_amount || 0
    //     dd.description = "Payment Mode"
        
    //     accountTransaction.push(dd);
    //   }else if(Tdata.filter(f => f.ledger_id === id).length){
    //     dd.amount = debitSign * ledgeramount || 0
    //     dd.description = PayData?.getVendor?.company_name
    //     accountTransaction.push(dd);
    //   }
    // });
    let ledger= {
            location_id:headerLocationId,
            // specialNumber: '00',
            note: 'Purchase Payment',
            referenceNumber: Tdata.filter(i => 'paymentLedgerId' in i && 'ledger_id' in i),
            // voucherTypeId: 1,
            // accountTransaction: accountTransaction
    }
  
     ledger.receiving_id=payables.map((d)=> d.receiving_id).join(',')
    const data = {
      payables,
      updateDebitNote: {
        manualNoteSchemes : manualNoteSchemes.filter(i => i.selected && i.advance_id === undefined),
        advanceledger : manualNoteSchemes.filter(i => i.selected && i.advance_id !== undefined),
        supplier_id: getVendor.supplier_id,
        supplier_ledger_id: getVendor.ledger_id,
        company_name : getVendor.company_name,
        amount: getVendor.debitNote_balance,
      },
      receiptDataEntry: {
        purchase_id: ledger?.receiving_id,
        vendor_id: getVendor.supplier_id,
        payment_amount: Number(ledger?.referenceNumber[0]?.payment_amount),
        receiptDate: receiptDate
      },
      ledger,
       addAdvanceAmount: addAdvanceAmount.amount > 0 ? { ...addAdvanceAmount, location_id: headerLocationId } : null
    };

    const body = getPaymentViewBody();

    dispatch(
      payablesPaymentEntry(data, (response) => {
        // const cookies = new Cookies();
        let storage = getsessionStorage()
        let emp_id = storage?.employee_id || '';
        if (response) {
          // dispatch(listVendorAction(true, setModalTypeHandler, setLoaderStatusHandler));
          dispatch(consolidatedPayables(headerLocationId,setModalTypeHandler, setLoaderStatusHandler))
           
          dispatch(
            getLoginRoleAction(emp_id, (role_name, token, content) => {
              if (!roleType.includes(role_name)) {
                let notify_type = notificationType('purchase payment');
                let notify_content = content?.filter(
                  (m) => m.notification_type === notify_type,
                );
                if (notify_content.length) {
                  dispatch(getbyidPurchasesAction(data.payables[0].receiving_id, (res) => {
                    // const paymentData =
                    //   purchases.find(
                    //     (m) => m.receiving_id === data.payables[0].receiving_id,
                    //   ) || {};
                    const paymentData = res;

                    let paymentRefid = paymentData.user_id || '';
                    let vendorName = paymentData.company_name || '';
                    let amount_value = paid_amount > due_paid_amount ? due_paid_amount : paid_amount  || '';
                    let locationName = paymentData.location_name || '';
                    let content_body = `${paymentRefid} \n${vendorName} \n₹${amount_value} \n${locationName} `;
                    sendNtfy(token, notify_content[0]?.title, content_body);
                    dispatch(CreateNotificationAction({ content_body: content_body, title: notify_content[0]?.title, time: getDateTimeFormat(new Date()), "active": "1" }))
                    
                  }))
                }
              }
            }),
          );
        }
      }),
    );
    dispatch(
      paymentview(
        body,
        commoncookie,
        headerLocationId,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    setPayData({...PayData, paymentOpen: false, Tdata: []});
    setopenPaymentDialog(false)
    setSelectionModel([])
    setgetPay([])
    
    // dispatch(
    
    //   receivingsPayments(receiving_id, ledger, (response) => {
    //     if (response === 200) {
    //       dispatch(
    //         paymentview(
    //           commoncookie,
    //           headerLocationId,
    //           setModalTypeHandler,
    //           setLoaderStatusHandler,
    //         ),
    //       );
    //     }
    //   }),
    // );
    // ledgerPaymentApi(paid_amount > due_paid_amount ? due_paid_amount : paid_amount,Tdata)
    // setPayData({...PayData, paymentOpen: false, Tdata: []});
  };
  // console.log(selectedChip.Vendors, "selectedChip")

  const pendingPayment = (data) => {
    console.log(data, "1ww")


    if(headerLocationId === 'null'){
      setOpenAlert(true)
      return
    }

    const {
      supplier_id,
      receivings_items: itemsData = [],
      paid_amount,
      receiving_id,
      status: oldStatus,
      receive_goods,
      total,
      po_number
    } = data;
  
    dispatch(getSupplierDetailsByIdAction(supplier_id, (supplierDetails) => {
      const getVendor = supplierDetails || {};
      // console.log(purchase_outstanding,"purchase_outstanding");
      
      let getPay;
      if (selectedChip.Vendors) {
        getPay = purchase_outstanding.find(d => d.receiving_id === receiving_id)?.childRow;
      } else {
        getPay = purchase_outstanding.find(d => d.receiving_id === receiving_id);
      }
      // getPay = purchase_outstanding.find(d => d.supplier_id === supplier_id);

  
      dispatch(getManualNoteSchemesByIdAction('supplier', supplier_id, (response) => {
        const manualNoteSchemesData = response.map(i => ({ ...i, selected: false }));
  
        const updatedPayData = {
          ...PayData,
          itemsData,
          po_number,
          getVendor,
          paymentOpen: true,
          paid_amount: +paid_amount,
          receiving_id,
          oldStatus,
          receive_goods,
          total: +total,
        };
        setclickedInvoice(data.receiving_id)
        setgetPay([getPay]); // Now using the updated state
        setManualNoteSchemes(manualNoteSchemesData);
        setPayData(updatedPayData);
        setopenPaymentDialog(true)
        setstatus('edit');
      }));
    }));
  };
  

  const getAppConfigData = () => {
    const companyName = app_config_data.filter((f) => f.key_name == 'company.name');
    const fullAddress = app_config_data.filter(
      (f) => f.key_name == 'address.fulladdress',
    );
    const emailData = app_config_data.filter((f) => f.key_name == 'company.email');
    const gstinData = app_config_data.filter(
      (f) => f.key_name == 'company.gstin/uin',
    );
    const companyMobile = app_config_data.filter(
      (f) => f.key_name == 'company.mobile',
    );
    const state = app_config_data.filter((f) => f.key_name == 'address.state');

    setAppConfigData({
      companyName: companyName.length > 0 ? companyName[0].value : '',
      companyAddress: fullAddress.length > 0 ? fullAddress[0].value : '',
      companyEmail: emailData.length > 0 ? emailData[0].value : '',
      gstin: gstinData.length > 0 ? gstinData[0].value : '',
      companyMobile: companyMobile.length > 0 ? companyMobile[0].value : '',
      state: state.length > 0 ? state[0].value : '',
    });
  };

  useEffect(() => {
    getAppConfigData();
  }, [app_config_data]);

  const createMail = () => {
    const custData = getVendor;

    let data = {
      custData,
      appConfigData: appConfigData,
      invoice_number: edit_data.po_number,
      sales_items: edit_data.receivings_items,
      email: custData.email,
      custType: 'VENDOR',
    };

    dispatch(sendMail(data, setModalTypeHandler, setLoaderStatusHandler));
    setDopen(false);
  };



  const cancelSearch = (e) => {
    setSearchVal('')
    setSearchData([])
    setPage(0); // Reset page to the first page

  // Fetch original data (e.g., paymentview)
  const body = getPaymentViewBody({ pageCount: 0, searchString: '' });

  dispatch(
    paymentview(
      body,
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler
    )
  );
    }

  const requestSearch = (e) => {
     let val = e.target.value;
     setSearchVal(val)
     
     if(val.length >= 3 || val.length === 0) {
      setPage(0)
      dispatch (set_searchPurchasePayablesAction({data:[], numRows:0}))
    }
     const body = {
       searchString: val,
       numPerPage: size,
       pageCount: page,
       key: activeChip,
       order: activeChip === "Vendors" ? sortConfigParent.order || "desc" :  sortConfig.order || "desc" , 
       val:activeChip === "Vendors" ? sortConfigParent.key || "" : sortConfig.key || ""
      }

     dispatch (searchPurchasePayablesAction(
       body,
       commoncookie,
       headerLocationId,
       setModalTypeHandler,
       setLoaderStatusHandler,
     ))
     
 }

 const handleOpeningBalPayment = (data) => {
  if(headerLocationId === 'null'){
    setOpenAlert(true)
    return
  }
  setOpeningBalData(data)
  setOpeningBalPaymentOpen(true)
 }

  const handleClose = () => {
    setReminder(false)
 }

 const handleReminder = ()=>{
  setReminder(true)
  }
  
  const handleChipClick = (chip) => {
    setTotalDue(null);
    setPage(0);
    selectChip(chip);
  };

  const handleEditChild = (data) => {
    // console.log("ewewewewe")
    setedit_data(data);
    setstatus('edit');
    // setisEdit(true);

    // dispatch(getSupplierDetailsByIdAction(data.supplier_id, (supplierDetails) => {
    //   const getVendor = supplierDetails || {};
    //   setPayData({...PayData, getVendor});
    //   setDopen(true);
    // }))
    dispatch(
      getSupplierDetailsByIdreceivings_itemsAction(data.supplier_id,{receiving_id:data?.receiving_id}, (supplierDetails) => {
        setDopen(true)
        // setPayData({
        //   ...PayData,
        //   getVendor : supplierDetails || {}
        // })
      })
    )

    
  };
  const handleMailConfigurationChild = async () => {
    const roleIdData = createUser.filter(f => f.employee_id === commoncookie)
    if(roleIdData.length > 0){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getByIdMailConfigurationAction('Purchase Order', roleIdData[0]?.role_id))
      );
    }
  }

  const handleCustomerDetail = (rowData)=>{
    console.log('notworkinggggg')
    // this.setState({
    //   setData : rowData,
    //   onrowclick :true
    // });
    setData(rowData)
    setOnrowclick(true)

  }

  const rowPopupClose1 = ()=>{
    setOnrowclick(false)
    }

  const handleReceiptPaymentDialog = (value) => {
    // const body = {
    //   pageCount : page,
    //   numPerPage : size
    // }
    const body = getPaymentViewBody();
    setopenPaymentDialog(value)
    dispatch(
      paymentview(
        body,
        commoncookie,
        headerLocationId,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    )
    dispatch(consolidatedPayables(headerLocationId,setModalTypeHandler, setLoaderStatusHandler))
    
  }

      const supplierData = vendor.filter(d => d.supplier_id !== 'undefined'); 
    const supplierIndex = supplierData.findIndex(c => c.supplier_id === data?.supplier_id);

// console.log(getPay,"ytytrhgfh");

  let openData = {
    rowIndex: supplierIndex,
    sales_customer_id: data?.supplier_id,
    routeFrom: "PAYABLES",
    payable: "payables",
    mail_configuration: mail_configuration,
    setOnbackClick: false,
    backToSales: rowPopupClose1,
    purchaseOrder: "purchaseOrder"
  };

   const prepareExportData = (data, pageType) => {
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
    
      if (!rows.length) {
        console.warn("No valid rows to export:", data);
        return [];
      }
  
     console.log(rows,'asdfsdfdsf')
    
      const mapped = rows.map((row, i) => {
    try {
      return {
      "Vendor": row.vendorName || "",
      "PO Number": row.bill_number || "",
      "Reference" : Array.isArray(row.invoice_number) && row.invoice_number.length > 0
                                          ? row.invoice_number
                                              .map((i) => i.invoice_number)
                                              .join(', ')
                                          : row?.invoice,
      "PO Date": row.receiving_time || '',
      "Received Date": row.invoice_date || '',
      "Location": row.location_name || "",
      "Total": row.total ?? 0,
      "Due": row.due_amount || "",
      "Due Date": moment(row.due_date).format("DD/MM/YYYY") || "",
      "Reminder": row.reminder || "",
     
    };
    } catch (err) {
      console.error(`Error mapping row ${i}:`, err, row);
      return null;
    }
  }).filter(Boolean);
  
    
      console.log("Mapped export data:", mapped);
      return mapped;
    };

   const handleExportPDF = async() => {
  
    let rowData = []
  
  const body = {
      pageCount : null,
      numPerPage : null,
      searchString: searchVal,
      key: activeChip,
      order: activeChip === "Vendors" ? sortConfigParent.order || "desc" :  sortConfig.order || "desc" , 
      val:activeChip === "Vendors" ? sortConfigParent.key || "" : sortConfig.key || "",
      type : 'Export'
    }

  
     await dispatch(paymentview(body,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler,(response)=>{
        const combined = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response
          : [];
        rowData = combined
     }))

    //  await dispatch(getOpeningBalActions('sundryCreditors',(response)=>{
    //     const combined = Array.isArray(response)
    //       ? response
    //       : Array.isArray(response?.data)
    //       ? response
    //       : [];
    //     rowData.push(combined)
    //  }))

     console.log(rowData,'rowData')
  
     const exportData =prepareExportData(rowData);
     const doc = new jsPDF();
   
     if (!exportData.length) {
       console.log("No export data available after processing:", exportData);
       doc.text("No data to export.", 10, 10);
       doc.save("Payable.pdf");
       return;
     }
   
     const headers = Object.keys(exportData[0]);
     const rows = exportData.map(row => headers.map(h => row[h]));
   
      doc.autoTable({
      startY: 20,
      head: [headers],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] } // blue header
    })
   
     doc.save("Payable.pdf");
   };

    const ExportCsv = async() => {
   
       let rowData = []
  
  const body = {
      pageCount : null,
      numPerPage : null,
      searchString: searchVal,
      key: activeChip,
      order: activeChip === "Vendors" ? sortConfigParent.order || "desc" :  sortConfig.order || "desc" , 
      val:activeChip === "Vendors" ? sortConfigParent.key || "" : sortConfig.key || "",
      type : 'Export'
    }

  
     await dispatch(paymentview(body,commoncookie,headerLocationId,setModalTypeHandler,setLoaderStatusHandler,(response)=>{
        const combined = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response
          : [];
        rowData = combined
     }))
   
     const exportData = prepareExportData(rowData);
   
     if (!exportData.length) {
       return;
     }
   
     const headers = Object.keys(exportData[0]);
     const csvRows = [
       headers.join(","), // headers
       ...exportData.map(row =>
         headers.map(k => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`).join(",")
       )
     ];
   
     const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
   
     link.href = url;
     link.download = "Payable.csv";
     link.click();
   };

  const landingOpen =(row,index)=>{
    setRowIndex(index)
    setRowData(row)
    setOpen(true)
  }
// console.log(mail_configuration, data?.supplier_id, supplierIndex, openData,"paymentOpen");

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Payable </title>
      </Helmet>
      <CreateNewButtonContext.Consumer>
        {({loaderStatus}) => (
          <>

            { onrowclick === true ? 
            //  <App
            //                        // statementOfAccount={Get_customer_statement}
            //                        rowIndex={data.supplier_id}
            //                        handleEdit={false}
            //                        backToSales={rowPopupClose1}
            //                        handleDelete={false}
            //                        type={'supplier'}
            //                        mail_configuration={mail_configuration}
            //                        customertype = {2}
            //                        setEditfind={false}
            //                        setOnbackClick={false}
            //                        employeeSetState={false}
            //                        purchaseOrder = {'purchaseOrder'}
            //                      />
                                  // <ContactPage
                                  //   rowIndex={supplierIndex}
                                  //   sales_customer_id = {data?.supplier_id}
                                  //   routeFrom = {"PAYABLES"}
                                  //   payable = {'payables'}
                                  //   mail_configuration={mail_configuration}
                                  //   setOnbackClick={false}
                                  //   backToSales={rowPopupClose1}
                                  //   purchaseOrder = {'purchaseOrder'}
                                  //   />
                                   OpenCustomerLandingPage(openData)
                                 :
                                 !open ?
                                 <Grid
                                 container
                                 display='flex'
                                 flexDirection='row'
                                 alignItems='center'
                                 spacing={3}
                               >
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Typography variant='h6'>Payables</Typography>
            </Grid> */}

            <Grid size={12}>
              <KpiStrip
                items={[
                  {
                    icon: AccountBalanceWalletOutlinedIcon,
                    label: 'Total',
                    prefix: '₹',
                    value: parseInt(consolidated_data[0]?.total_amount) || 0,
                  },
                  {
                    icon: EventBusyOutlinedIcon,
                    iconColor: (parseInt(consolidated_data[0]?.due_amount) || 0) > 0 ? 'error.main' : undefined,
                    label: 'Due Date Exceeded',
                    prefix: '₹',
                    value: parseInt(consolidated_data[0]?.due_amount) || 0,
                  },
                  {
                    icon: ScheduleOutlinedIcon,
                    label: 'Avg Due Date',
                    value: consolidated_data[0]?.avgCredit_days || 0,
                    suffix: ' Days',
                  },
                  {
                    icon: CalendarMonthOutlinedIcon,
                    label: 'Days Payable',
                    value: consolidated_data[0]?.days_payable || 0,
                    suffix: ' Days',
                  },
                ]}
              />
            </Grid>

            <>
              <Grid size={12}>
                <AgingChips
                  buckets={Object.keys(initialState)
                    .filter((label) => label !== 'Vendors' && label !== 'Value')
                    .map((label) => ({
                      key: label,
                      label,
                      color: {
                        // WCAG AA against white background (chip text/border is colored on white card)
                        '1-15 Days': '#5e7f32',
                        '16-30 Days': '#b45309',
                        '31-45 Days': '#c2410c',
                        '46-60 Days': '#c94d41',
                        '61-90 Days': '#e21400',
                        '> 90 Days': '#7b0000',
                        'Due Today': '#0c7eac',
                        Overdue: '#6B6B6B',
                      }[label],
                      displayValue: formatRupeesCompact(chipDataTotals[label] ?? 0),
                    }))}
                  selectedKey={activeChip}
                  onSelect={handleChipClick}
                />
              </Grid>
            </>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Card
                sx={{
                  borderRadius: 1,
                  height: 'calc(100vh - 205px)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Grid
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  sx={{ mt: 1, width: '100%', p: 1, flexShrink: 0 }}
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Grid>
                    <Typography variant='h6'>Payables</Typography>
                  </Grid>

                  <Grid display={'flex'}>
                    {payableExport && selectedChip['Value'] && (
                      <ExportMenu
                        items={[
                          { label: 'Export PDF', onClick: handleExportPDF },
                          { label: 'Export CSV', onClick: ExportCsv },
                        ]}
                      />
                    )}
                    <ViewToggleChips
                      options={[{ key: 'Value', label: 'Value' }, { key: 'Vendors', label: 'Vendors' }]}
                      selectedKey={activeChip}
                      onSelect={handleChipClick}
                    />
                    <Grid>
                      <Tooltip title='Reminder'>
                        <IconButton
                          size='medium'
                          onClick={() => handleReminder()}
                        >
                         <NotificationsActiveIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Box sx={{ minWidth: 220, flexShrink: 0 }}>
                      <CommonSearch
                        searchVal={searchVal}
                        cancelSearch={cancelSearch}
                        requestSearch={requestSearch}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <TableContainer
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: 'none',
                  }}
                >
                  {selectedChip.Vendors && (
                    <Table size="small" aria-label='collapsible table' sx={{
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    border: 'none',
    boxShadow: 'none',

    '& thead, & tbody, & tr': {
      display: 'table', 
      width: '100%',
      tableLayout: 'fixed', 
    },

    '& tbody': {
      display: 'block', 
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 350px)',
    }
  }}>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell>
                            <b>
                              <SortableHeader
                                active={sortConfigParent.key === 'vendarName'}
                                direction={sortConfigParent.order}
                                onClick={() => handleSortParent('vendarName')}
                              >
                                Vendor
                              </SortableHeader>
                            </b>
                          </TableCell>
                          <TableCell align="right">No. of Bills</TableCell>
                          <TableCell align="right">Average Due Days</TableCell>
                          <TableCell align="right">Total Due</TableCell>
                          <TableCell align="right">Opening Balance</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...purchase_outstanding, ...openingBalanceLedgers]
                          .filter(
                            (value, index, self) =>
                              index ===
                              self.findIndex(
                                (t) => t.ledger_id === value.ledger_id,
                              ),
                          )
                          .map((row, i) => (
                            <Row
                              key={i}
                              pendingPayment={pendingPayment}
                              setedit_data={handleEdit}
                              row={row}
                              handleMailConfiguration={handleMailConfiguration}
                              openingBalanceLedgers={openingBalanceLedgers}
                              handleOpeningBalPayment={handleOpeningBalPayment}
                              landingOpen={landingOpen}
                              payablePayment ={payablePayment}
                              payableExport ={payableExport}
                            />
                          ))}
                      </TableBody>
                    </Table>
                  )}

                  {!selectedChip.Vendors && (
                    <Formik initialValues={{}}>
                      {() => (
                        <Form style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                          <OutstandingTable
                            maxHeight="100%"
                            columns={[
                              {
                                key: 'vendarName',
                                label: 'Vendor',
                                sortable: true,
                                cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 },
                                render: (row) => (
                                  <Link
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleCustomerDetail(row);
                                    }}
                                    style={{
                                      textDecoration: 'none',
                                      cursor: 'pointer',
                                      color: '#03adfc',
                                    }}
                                  >
                                    {row.vendorName}
                                  </Link>
                                ),
                              },
                              {
                                key: 'bill_number',
                                label: 'Bill#',
                                render: (row) => (
                                  <div
                                    style={{ cursor: 'pointer', color: '#03adfc' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditChild(row);
                                      handleMailConfigurationChild();
                                    }}
                                  >
                                    {row.bill_number}
                                  </div>
                                ),
                              },
                              {
                                key: 'reference',
                                label: 'Reference',
                                render: (row) =>
                                  Array.isArray(row.invoice_number) && row.invoice_number.length > 0
                                    ? row.invoice_number.map((i) => i.invoice_number).join(', ')
                                    : row?.invoice,
                              },
                              {
                                key: 'received_date',
                                label: 'Received Date',
                                sortable: true,
                                render: (row) => row.invoice_date,
                              },
                              {
                                key: 'location_name',
                                label: 'Location',
                                render: (row) => row.location_name,
                              },
                              {
                                key: 'opening_amount',
                                label: 'Amount',
                                sortable: true,
                                align: 'right',
                                render: (row) => row.total,
                              },
                              {
                                key: 'due_amount',
                                label: 'Due',
                                sortable: true,
                                align: 'right',
                                render: (row) => row.due_amount,
                              },
                              {
                                key: 'payment',
                                label: 'Payment',
                                render: (row) => (
                                  <div style={{ display: 'flex', cursor: 'pointer' }}>
                                    {!hasPendingDue(row) ? (
                                      <AssignmentTurnedInIcon color="success" />
                                    ) : (
                                      payablePayment && (
                                        <CommonToolTip title="Make payment">
                                          <AssignmentLateIcon
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              pendingPayment(row);
                                            }}
                                            color="warning"
                                          />
                                        </CommonToolTip>
                                      )
                                    )}
                                  </div>
                                ),
                              },
                              {
                                key: 'due_date',
                                label: 'Due Date',
                                sortable: true,
                                render: (row) =>
                                  row.due_date ? moment(row.due_date).format('DD/MM/YYYY') : '-',
                              },
                              {
                                key: 'reminder',
                                label: 'Reminder',
                                render: (row) =>
                                  row.reminder ? moment(row.reminder).format('DD/MM/YYYY hh:mm A') : '-',
                              },
                            ]}
                            rows={
                              purchase_outstanding?.length > 0
                                ? [...purchase_outstanding, ...openingBalanceLedgers]
                                : []
                            }
                            sortKey={sortConfig.key}
                            sortOrder={sortConfig.order}
                            onSort={handleSort}
                            onRowClick={(row, index) => {
                              setRowIndex(index);
                              setRowData(row);
                              setOpen(true);
                            }}
                            getRowKey={(row, i) => row.receiving_id ?? i}
                            loading={!isApiFinished && !purchase_outstanding?.length}
                          />
                        </Form>
                      )}
                    </Formik>
                  )}
               
                        {isApiFinished && !purchase_outstanding?.length && (
                          <Grid container display='flex' justifyContent='center' alignItems='center' height={400}>
                            <Grid paddingTop='93px'>
                              <NoRecordFound />
                            </Grid>
                          </Grid>
                        )}
                
                          </TableContainer>

              {/* <Card sx={{borderRadius: 1}}> */}
              
                    
              {/* </Card> */}
              <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }} sx={{ flexShrink: 0 }}>
                <OutstandingPagination
                  count={purchase_outstanding_count}
                  page={page}
                  rowsPerPage={size}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
                  </Card>
            </Grid>

            <InvoiceDialog
              appConfigData={appConfigData}
              createMail={createMail}
              custData={getVendor}
              custType={'VENDOR'}
              invoice={edit_data.po_number}
              soDate={edit_data.receiving_time}
              sales_items={edit_data.receivings_items}
              open={Dopen}
              handleClose={() => setDopen(false)}
              mail_configuration={mail_configuration}
              tableHandleClose={() => {}}
            />

            {/* <PaymentDialog
              getPay={getPay[0]}
              setgetPay={setgetPay}
              status={status}
              setSelectionModel={setSelectionModel}
              entryvalue={entryvalue}
              handleEntry={setHandleEntry}
              selectionModel={selectionModel}
              received_amount={paid_amount}
              handleSubmit={paymentValidate}
              custType={'VENDOR'}
              Tdata={Tdata}
              setTdata={setTdata}
              custData={getVendor}
              sales_items={itemsData}
              paymentOpen={openPaymentDialog}
              setpaymentOpen={setopenPaymentDialog}
              responseType={'cashOut'}
              manualNoteSchemes={manualNoteSchemes}
              setManualNoteSchemes={setManualNoteSchemes}
              pageType={"PURCHASE"}
              type={1}
              clickedInvoice={clickedInvoice}
            /> */}
            <ReceiptPayments
              paymentOpen={openPaymentDialog}
              custType = 'VENDOR'
              handleClose={handleReceiptPaymentDialog}
              editData={{}}
              responseType={'cashOut'}
              sales_items={itemsData}
              selectedInvoice={clickedInvoice}
              selectedCustomer={getVendor}
            />
            <LocationAlert
              open={openAlert}
              onClose={() => setOpenAlert(false)}
            />

            <OpeningBalPayment
              open={openingBalPaymentOpen}
              handleClose={() => setOpeningBalPaymentOpen(false)}
              openingBalData={openingBalData}
            />

            <Dialog open={reminder}>
              {console.log(purchase_outstanding, 'purchase_outstanding')}
              <ReminderForm
                handleClose={handleClose}
                datas={purchase_outstanding}
                type={'payable'}
              />
            </Dialog>
            </Grid>
              :

              <PayablesLandingPage
                rowData = {rowData}
                rowPopupClose = {()=> setOpen(false)}
                index = {index}
                data = {purchase_outstanding}
              />

                                 
            }


          </>
        )}
      </CreateNewButtonContext.Consumer>
    </>
  );
}
