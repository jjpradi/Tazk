import { useDispatch, useSelector } from "react-redux"
import CollectDefects from './collectDefects'
import { useContext, useEffect, useState } from "react"
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Icon, IconButton, Typography } from "@mui/material"
import MaterialTable, { MTableToolbar } from "utils/SafeMaterialTable"
import { headerStyle, cellStyle, maxBodyHeight } from "utils/pageSize"
import CommonSearch from 'utils/commonSearch'
import { listDefectCollectionAction, setSearchCollectedDefectsAction, getSearchCollectedDefectsAction, deleteDefectCollectionAction, setDefectCollectionByIdAction } from 'redux/actions/defects_actions'
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import AddIcon from '@mui/icons-material/Add'
import moment from "moment"
import FilterDialog from '../filterDialog'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { ExportCsv, ExportPdf } from "@material-table/exporters"
import { set } from "lodash"
import InvoiceDialog from '../../sales/InvoiceDialog';
import { useCustomFetch } from "utils/useCustomFetch"
import { setInvoiceTempAction } from "redux/actions/vendor_actions"
import CloseIcon from '@mui/icons-material/Close'
import { sendMail } from "redux/actions/sales_actions"
import API_URLS from "../../../../utils/customFetchApiUrls"
import ReplacementLandingPage from "../replacements/ReplacementLandingPage"
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import ReplacementForm from '../replacements/ReplacementForm'
import apiCalls from "utils/apiCalls"
import { setSearchByCustomerSupplierDataAction } from "../../../../redux/actions/customer_actions"
import { setDefectCollectedSentProductAction } from "../../../../redux/actions/defects_actions"
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../../utils/stickyTableLayout';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';

function ListDefects() {
    
    const { headerLocationId, setLoaderStatusHandler, setModalTypeHandler, commoncookie } = useContext(CreateNewButtonContext)
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const selectedRole = storage.role_name
    const {
        defectReducers: { listDefectCollection },
        rbacReducer: { menuAccess }
    } = useSelector(state => state)
    const [custData, setCustData] = useState();
    const [invoice, setInvoice] = useState();
    const [Date, setDate] = useState();
    const [collectionItem, setcollectionItem] = useState();
    const [sale_id, setSaleid] = useState();
    const [view, setView] = useState('list')
    const [formStatus, setFormStatus] = useState('new')
    const [pagination, setPagination] = useState({
        page: 0,
        numPerPage: 20,
        searchString: ''
    })
    const [filter, setFilter] = useState({
        fromDate: null,
        toDate: null,
        min_price: '',
        max_price: '',
        brand: '',
        category: ''
    })
    const [filterOpen, setFilterOpen] = useState(false)
    const [rowData, setRowData] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [Open, setOpen] = useState(false);
    const [custType, setCustType] = useState('COLLECTDEFECT')
    const exportPayload = {
        page: 0,
        numPerPage: listDefectCollection.numRows,
        searchString: '',
        from: null,
        to: null,
        min_price: '',
        max_price: '',
        brand: '',
        category: '',
        location_id: 'null',
    }

    useEffect(() => {
        const payload = {
            page: pagination.page,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId
        }
        dispatch(listDefectCollectionAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }, [pagination.page, pagination.numPerPage, headerLocationId])

    useEffect(() => {
      dispatch(setSearchByCustomerSupplierDataAction([]))
      dispatch(setDefectCollectedSentProductAction([]))
      dispatch(getMenuAccessAction(selectedRole))
    }, [])

    const handleClose = (fromSubmit) => {
        setView('list')
        dispatch(setDefectCollectionByIdAction([]))
        if (fromSubmit) {
          setFilter((prev) => ({ ...prev, fromDate: null, toDate: null, min_price: '', max_price: '', brand: '', category: '' }))
          setPagination((prev) => ({ ...prev, page: 0, searchString: '' }))
          const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: '',
            from: null,
            to: null,
            min_price: '',
            max_price: '',
            brand: '',
            category: '',
            location_id: headerLocationId
          }
          dispatch(listDefectCollectionAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
        }
        setRowData(null)
    }

    const requestSearch = (event) => {
        const value = event.target.value
        setPagination((prev) => ({ ...prev, searchString: value }))

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: value,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId,
        }
        if(value.length >= 3 || value.length === 0) {
          dispatch(setSearchCollectedDefectsAction({ data: [], numRows: 0 }))
        }
        dispatch(getSearchCollectedDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }

    const cancelSearch = () => {
        const value = ''
        setPagination((prev) => ({ ...prev, searchString: value }))

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: value,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId
        }
        dispatch(setSearchCollectedDefectsAction({ data: [], numRows: 0 }))
        dispatch(getSearchCollectedDefectsAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleFormOpen = () => {
        setFormStatus('new')
        setView('form')
    }

    const handleFilterOpen = () => {
        setFilterOpen(true)
    }

    const handleClearFilter = () => {
        setFilter((prev) => ({ ...prev, fromDate: null, toDate: null, min_price: '', max_price: '', brand: '', category: '' }))
        setFilterOpen(false)

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            from: null,
            to: null,
            location_id: headerLocationId,
            min_price: '',
            max_price: '',
            brand: '',
            category: ''
        }
        dispatch(listDefectCollectionAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleApplyFilter = () => {
        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            from: filter.fromDate,
            to: filter.toDate,
            min_price: filter.min_price,
            max_price: filter.max_price,
            brand: filter.brand,
            category: filter.category,
            location_id: headerLocationId
        }
        dispatch(listDefectCollectionAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
        setFilterOpen(false)
    }

    const handleDelete = (rowData) => {
        setRowData(rowData)
        setDeleteConfirmation(true)
    }

    const handleCloseDialog =()=>{
        setOpen(false)
        setView('list')
        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: '',
            from: null,
            to: null,
            location_id: headerLocationId,
            min_price: '',
            max_price: '',
            brand: '',
            category: ''
        }
        dispatch(listDefectCollectionAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    }
    const invoiceDialogSendMail =()=>{
      const data = {
      appConfigData: custData,
      custData,
      invoice_number: invoice,
      sales_items: collectionItem,
      email: custData?.email,
      no_sms: true,
      posSale: true,
      //sales_payments: this.state.sales_payments,
      soDate: Date,
      sale_id: sale_id,
    };
    dispatch(sendMail(data, setLoaderStatusHandler));
    handleCloseDialog()
  }

    const customFetch = useCustomFetch();

    const handleCollectionClick= async(event, rowData)=>{
      event.stopPropagation()
      const response = await customFetch(
        API_URLS.GET_DEFECT_TEMPLATE(rowData?.collection_id),
        'POST'
      );
     console.log(response,'dhfufjh');
      const getData = response.data || [];
      const finalData = getData.length > 0 ? getData[0] : {};
      dispatch(setInvoiceTempAction(getData)),
      setCustType('COLLECTDEFECT')
      setOpen(true),
      setCustData({
        company_name: rowData?.company_name,
        first_name: rowData?.full_name,
        city: rowData?.city,
        email: rowData?.email,
        state: rowData?.state,
        area: rowData?.area,
        phone_number: rowData?.phone_number,
        zip: rowData?.zip
      })
      setInvoice(rowData?.collection_number)
      setDate(moment(rowData?.collection_date).format('DD/MM/YYYY'))
      setcollectionItem(rowData?.collection_items)
      setSaleid(rowData?.sale_id)
    }

  const handleReplacementOpen = async (rowData) => {
    const id = rowData.replacement_id
    const type = rowData.record_kind
    const { data } = await customFetch(API_URLS.CUSTOMER_REPLACEMENT_TEMPLATE(id), 'GET')
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(setInvoiceTempAction(data))
    )
    setCustType('CUSTOMERREPLACEMENT')
    setOpen(true)
    setCustData({
      company_name: rowData?.company_name,
      first_name: rowData?.full_name,
      city: rowData?.city,
      email: rowData?.email,
      state: rowData?.state,
      area: rowData?.area,
      phone_number: rowData?.phone_number,
      zip: rowData?.zip
    })
    setInvoice(rowData?.invoice_number)
    setDate(moment(rowData?.replacement_date).format('DD/MM/YYYY'))
    setcollectionItem(rowData?.replacement_items)
    setSaleid(rowData?.sale_id)
  }

    const handleDeleteConfirmation = () => {
        dispatch(deleteDefectCollectionAction(rowData.collection_id, async (response) => {
            setDeleteConfirmation(false)
            setView('list')
            if (response.status === 200) {
                const payload = {
                    page: 0,
                    numPerPage: pagination.numPerPage,
                    searchString: '',
                    from: null,
                    to: null,
                    location_id: headerLocationId,
                    min_price: '',
                    max_price: '',
                    brand: '',
                    category: ''
                }
                dispatch(listDefectCollectionAction(payload, commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
            }
        }))
    }

    const handleEdit = async (rowData) => {
        await setRowData(rowData)
        setFormStatus('edit')
        setView('form')
    }

    const handleReplacementClick = async(rowData) => {
      await setRowData(rowData)
      setView('replacementForm')
    }

    const collectDefectsCreate = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_defects', 'can_create')
    const collectDefectsEdit = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_defects', 'can_edit')
    const collectDefectsDelete = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_defects', 'can_delete')
    const collectDefectsExport = UserRightsAuthorization(menuAccess[selectedRole], 'defects__collect_defects', 'can_export')
    const issueReplacementCreate = UserRightsAuthorization(menuAccess[selectedRole], 'defects__issue_replacement', 'can_create')

    const columns = [
        {
            field: 'collection_date',
            title: 'Collection Date',
            render: (rowData) => moment(rowData.collection_date).format('DD/MM/YYYY')
        },
        {
          field: 'collection_number',
          title: 'Collection #',
          render: (rowData) => (
            <div
              style={{
                            textDecoration: 'none',
                              cursor: 'pointer',
                              color: '#03adfc',
                              display: 'inline-block',
                          }}
              onClick={(event) => handleCollectionClick(event, rowData)}
              >
              {rowData.collection_number}
            </div>
          ),
        },
        {
            field: 'company_name',
            title: 'Customer'
        },
        {
            field: 'collection_items',
            title: 'Quantity',
            render: (rowData) => rowData.collection_items.reduce((sum, item) => sum + item.actual_quantity, 0)
        },
        {
            field: 'total',
            title: 'Total',
            
        },
        {
            field: 'status',
            title: 'Status',
            render: (rowData) => {
              const textColor = rowData.status === 'Collected' ? '#3B81B3' : '#285C1C'
              return(
                  <div
                      style={{
                          color: textColor,
                          fontWeight: cellStyle.fontWeight,
                          fontSize: cellStyle.fontSize,
                      }}
                      >
                      {rowData.status}
                  </div>
              )
          }
        },
        (collectDefectsEdit || collectDefectsDelete || issueReplacementCreate) && {
            field: 'actions',
            title: 'Actions',
            render: (rowData) => (
                <>
                    {
                      collectDefectsEdit &&
                      <IconButton disabled={rowData.collection_items.some(d => d.replacement_id !== null)} onClick={() => handleEdit(rowData)}>
                          <EditIcon />
                      </IconButton>
                    }

                    {
                      collectDefectsDelete &&
                      <IconButton 
                          disabled={rowData.collection_items.some(d => d.replacement_id !== null)} 
                          onClick={(event) => {
                              event.stopPropagation()
                              handleDelete(rowData)
                          }}
                      >
                          <DeleteIcon />
                      </IconButton>
                    }

                    {
                      issueReplacementCreate &&
                      <IconButton disabled={rowData.status === 'Fully Replaced'} onClick={() => handleReplacementClick(rowData)}>
                        <PublishedWithChangesIcon />
                      </IconButton>
                    }
                </>
            )
        }
    ]

    return (
      <>
        {view === 'list' && (
          <>
            <MaterialTable
              title='Collected Defect'
              columns={columns}
              data={listDefectCollection.data}
              totalCount={listDefectCollection.numRows}
              options={getStickyTableOptions({
                 headerStyle,
                 bodyOffset: 200,
                cellStyle,
                options:{
                  search: false,
                paging: true,
                exportButton: collectDefectsExport ?  true : false,
                filtering: false,
                tableLayout: "auto",
                toolbar: true,
                actionsColumnIndex: -1,
                pageSizeOptions: [20, 50, 100],
                pageSize: pagination.numPerPage,
                // minBodyHeight: maxBodyHeight,
                // maxBodyHeight: maxBodyHeight,
                exportMenu: collectDefectsExport ? [
                  {
                    label: 'Export PDF',
                    exportFunc: (cols, data) => {
                      dispatch(
                        listDefectCollectionAction(
                          exportPayload,
                          null,
                          null,
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          (exportData) => {
                            const columns = cols.filter(d => d.field !== 'actions')
                            const data = exportData.map((d) => ({ ...d, collection_items: d.collection_items.reduce((sum, item) => sum + item.actual_quantity, 0), collection_date: moment(d.collection_date).format('DD/MM/YYYY') }))
                            ExportPdf(columns, data, 'Defect Collection');
                          },
                        ),
                      );
                    },
                  },
                  {
                    label: 'Export CSV',
                    exportFunc: (cols, data) => {
                      dispatch(
                        listDefectCollectionAction(
                          exportPayload,
                          null,
                          null,
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          (exportData) => {
                            const columns = cols.filter(d => d.field !== 'actions')
                            const data = exportData.map((d) => ({ ...d, collection_items: d.collection_items.reduce((sum, item) => sum + item.actual_quantity, 0), collection_date: moment(d.collection_date).format('DD/MM/YYYY') }))
                            ExportCsv(columns, data, 'Defect Collection');
                          },
                        ),
                      );
                    },
                  },
                ] : [],
                }
              })}
              page={pagination.page}
              onPageChange={(page) =>
                setPagination((prev) => ({...prev, page: page}))
              }
              onRowsPerPageChange={(size) =>
                setPagination((prev) => ({...prev, numPerPage: size}))
              }
              components={{
                ...stickyTableComponents,
                Toolbar: (props) => (
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{width: '100%'}}>
                      <MTableToolbar {...props} />
                    </div>

                    <div>
                      <CommonSearch
                        searchVal={pagination.searchString}
                        requestSearch={requestSearch}
                        cancelSearch={cancelSearch}
                      />
                    </div>
                  </div>
                ),
              }}
              actions={[
                collectDefectsCreate ? {
                  icon: () => <AddIcon />,
                  tooltip: 'Add',
                  isFreeAction: true,
                  onClick: () => handleFormOpen(),
                } : null,
                {
                  icon: () => <FilterAltIcon />,
                  tooltip: 'Filter',
                  isFreeAction: true,
                  onClick: () => handleFilterOpen(),
                },
              ]}
              onRowClick={(event, rowData) => {
                setRowData(rowData)
                setView('landingPage')
              }}
            />

            <FilterDialog
              open={filterOpen}
              data={filter}
              setFilter={setFilter}
              handleClearFilter={handleClearFilter}
              handleApplyFilter={handleApplyFilter}
            />
          </>
        )}
        {view === 'landingPage' && 
          <ReplacementLandingPage
            type='collectDefect'
            data={rowData}
            handleClose={handleClose}
            setView={setView}
            setFormStatus={setFormStatus}
            handleDelete={handleDelete}
          />
        }
        {view === 'form' && (
          <CollectDefects
              status={formStatus}
              handleClose={handleClose}
              editData={rowData}
              handleCollectionClick={handleCollectionClick}
              pagination={pagination}
              filter={filter}
          />
        )}
        {view === 'replacementForm' &&
          <ReplacementForm
            type='issueReplacement'
            data={rowData}
            handleClose={handleClose}
            handleReplacementOpen={handleReplacementOpen}
          />
        }
        <InvoiceDialog
          open={Open}
          handleClose={() =>handleCloseDialog()}
          tableHandleClose={() => {}}
          custData={custData}
          invoice={invoice}
          soDate={Date}
          createMail={()=>invoiceDialogSendMail()}
          custType={custType}
        />
        <Dialog open={deleteConfirmation}>
            <DialogTitle>
                <Grid container spacing={3} display='flex' justifyContent='space-between' alignItems='center' textAlign='center'>
                    <Grid>
                        <Typography variant='h6'>Delete Confirmation</Typography>
                    </Grid>

                    <Grid>
                        <IconButton onClick={() => setDeleteConfirmation(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </DialogTitle>

            <DialogContent>
                <Typography variant='h6'>
                    Are you sure want to delete this defect collection ?
                </Typography>
            </DialogContent>

            <DialogActions>
                <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                    <Grid>
                        <Button variant='contained' color='error' onClick={() => setDeleteConfirmation(false)}>Cancel</Button>
                    </Grid>

                    <Grid>
                        <Button variant='contained' onClick={handleDeleteConfirmation}>Delete</Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
      </>
    );

}

export default ListDefects
