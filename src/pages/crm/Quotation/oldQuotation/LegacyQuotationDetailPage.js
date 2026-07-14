import MaterialTable, { MTablePagination, MTableToolbar } from 'utils/SafeMaterialTable';
import { Box, Button, Card, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import useStyles from 'components/customer_erpDesign/cardStyles';
import OppositeContentTimeline from 'components/erpDesign/SO/timeLine';
import React, { useContext, useEffect, useState } from 'react'
import QuotationTimeline from './QuotationTimeline'
import { quotationTimelineDataAction } from 'redux/actions/quotation_actions';
import { useDispatch, useSelector } from 'react-redux';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import OptionButton from 'components/erpDesign/actionButton';
import AlertDialog from 'pages/common/Dialog';
import NewSales from 'components/NewSales'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { listStockLocationSequenceAction } from 'redux/actions/stock_Location_actions';
import moment from 'moment';

const quotationDetailPage = (props) => {
      const {data}=props
      const dispatch = useDispatch()
      const navigate = useNavigate(); 
      const c = useStyles();
      console.log("customerFullName",data)

          const {
              setModalTypeHandler,
              setLoaderStatusHandler,
              setModalStatusHandler,
              setcreatNewDataHandler,
              creatNewData,
              selectData,
              setselectData,
          } = useContext(CreateNewButtonContext)

    const [optionIndex, setOptionIndex] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [index, setIndex] = useState(null)
    const [rowData, setRowData] = useState({})

      const {
            quotationReducer: { quotationTimelineData, quotations }
          } = useSelector(state => state)

    useEffect(() => {
        const payload={
            id:data.quotation_number
        }
        if (data?.quotation_number) {
            dispatch(quotationTimelineDataAction(payload));
        }
    }, [data, dispatch]);

        useEffect(() => {
            if (props.detailstype === 'quotationdetails') {
                setRowData(data)
            }
        }, [])

// console.log(rowData,"quotationTimelineData",quotations)

        const handleQuotationOptionChange = (option) => {
            setOptionIndex(option)
            if (option === 1) {
                setDeleteDialogOpen(true)
            }
        }

        useEffect(() => {
        if (quotations?.data?.length > 0) {
            const quotationIndex = quotations.data.findIndex(
            (e) => e.quotation_id === data.quotation_id
            )
            setIndex(quotationIndex)
        }
        }, [quotations, data])


        useEffect(() => {
        if (index !== null && quotations?.data?.length > 0 && index !== -1) {
            setRowData(quotations.data[index])
        }
        }, [index, quotations])


        const handlePrev = () => {
            if (index >= 1) {
                setIndex(prevIndex => prevIndex - 1)
            }
        }

        const handleNext = () => {
            console.log("next")
            setIndex(prevIndex => prevIndex + 1)
        }


    const columns = [{
        title: 'Product',
        field: 'product',
        flex: 1
    },
    {
        title: 'Quantity',
        field: 'quantity',
        flex: 1
    },
    {
        title: 'Rate',
        field: 'price',
        flex: 1
    },
    {
        title: 'Discount',
        field: 'discount',
        flex: 1
    },
    {
        title: 'Discount Type',
        field: 'discountType',
        flex: 1
    }
]
    return (
        <>
            { optionIndex === null &&
            <>
             <Grid container spacing={2} sx={{
                height: '90vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {display: 'none',},
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE 10+
                }}>
                 <Grid sx={{ p: '0 10px' }} size={12}>
                   { props.pageType === '/salesOrders' &&
                     <div style={{ display: 'flex', marginBottom: 10 }}>
                         <div
                             style={{
                                 marginLeft: 'auto',
                                 display: 'flex',
                                 justifyContent: 'end',
                             }}
                         >
                             <div
                                 style={{
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'center',
                                 }}
                             >
                                 <Grid container spacing={2}>
                                     <Grid>
                                         <Button
                                             variant='contained'
                                             onClick={props.handleClose} 
                                             color='inherit'
                                             sx={{ mb: '10px' }}
                                         >
                                             Back
                                         </Button>
                                     </Grid>

                                     <Grid zIndex={1}>
                                         <OptionButton
                                             checkType='Quotations'
                                             handleQuotationOptionChange={handleQuotationOptionChange}
                                             disableConvert={rowData.isConverted !== 0}
                                             user_rights={props.user_rights}
                                         />
                                     </Grid>
                                     <Grid>
                                         <Tooltip title='Previous'>
                                             <IconButton
                                                 color='primary'
                                                 onClick={handlePrev}
                                                 disabled={index === 0}
                                             >
                                                 <ArrowBackIosIcon />
                                             </IconButton>
                                         </Tooltip>

                                         <Tooltip title='Next'>
                                             <IconButton
                                                 color='primary'
                                                 onClick={handleNext}
                                                 disabled={quotations?.data?.length === index + 1}
                                             >
                                                 <ArrowForwardIosIcon />
                                             </IconButton>
                                         </Tooltip>
                                     </Grid>
                                 </Grid>
                             </div>
                         </div>
                     </div>
                   }
                     <Card variant="outlined" sx={{ padding: '20px', minHeight: 'calc(100vh - 135px)' }}>
                         <Grid container spacing={2}>
                             <Grid
                                 size={{
                                     xs: 12,
                                     sm: 6,
                                     md: 3,
                                     lg: 3
                                 }}>
                                 <Card
                                     className={c.lav}
                                     variant="outlined"
                                     sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                                 >
                                     <Typography variant="body1" align="center">
                                         Quotation Number
                                     </Typography>
                                     <Typography variant="h6" align="center">
                                         {rowData?.quotation_number || '--'}
                                     </Typography>
                                 </Card>
                             </Grid>

                             <Grid
                                 size={{
                                     xs: 12,
                                     sm: 6,
                                     md: 3,
                                     lg: 3
                                 }}>
                                 <Card
                                     className={c.ash}
                                     variant="outlined"
                                     sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                                 >
                                     <Typography variant="body1" align="center">
                                         Quotation Date
                                     </Typography>
                                     <Typography variant="h6" align="center">
                                         {rowData.quotation_date ? moment(rowData.quotation_date).format('DD/MM/YYYY') : '-'}
                                     </Typography>
                                 </Card>
                             </Grid>

                             <Grid
                                 size={{
                                     xs: 12,
                                     sm: 6,
                                     md: 3,
                                     lg: 3
                                 }}>
                                 <Card
                                     className={c.lightPink}
                                     variant="outlined"
                                     sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                                 >
                                     <Typography variant="body1" align="center">
                                         Customer
                                     </Typography>
                                     <Typography variant="h6" align="center">
                                         {rowData?.customerFullName || data?.customerCompanyName || '-'}
                                     </Typography>
                                 </Card>
                             </Grid>

                             <Grid
                                 size={{
                                     xs: 12,
                                     sm: 6,
                                     md: 3,
                                     lg: 3
                                 }}>
                                 <Card
                                     className={c.yellow}
                                     variant="outlined"
                                     sx={{ padding: '10px', width: '100%', borderRadius: '5px' }}
                                 >
                                     <Typography variant="body1" align="center">
                                         Expiry
                                     </Typography>
                                     <Typography variant="h6" align="center">
                                         {rowData?.expiry || '-'}
                                     </Typography>
                                 </Card>
                             </Grid>
                         </Grid>

                         <Grid
                             size={{
                                 lg: 12,
                                 md: 12
                             }}>
                             <MaterialTable
                                 style={{ height: '100% ', overflow: 'auto' }}
                                 options={{
                                     showTitle: false,
                                     toolbar: true,
                                     search: false,
                                     pageSizeOptions: [20, 50, 100],
                                 }}
                                 columns={columns}
                                 data={rowData?.products || []}
                             />
                         </Grid>

                         <div style={{ minHeight: 200, marginTop: 10 }}>
                             <QuotationTimeline data={quotationTimelineData || []} />
                         </div>
                     </Card>

                 </Grid>
             </Grid>
             </>
             }
            {
            optionIndex === 0 && 
            <NewSales 
              status='convertSO'
              setModalTypeHandler={setModalTypeHandler}
              setModalStatusHandler={setModalStatusHandler}
              setcreatNewDataHandler={setcreatNewDataHandler}
              creatNewData={creatNewData}
              selectData={selectData}
              setselectData={setselectData}
              appConfigData={props.appConfigData}
              setAppConfigData={props.setAppConfigData}
              type='customer'
              handleClose={props.handleClose}
              returnState={false}
              price_list={props.price_list}
              product={props.product}
              stocklocation={props.stocklocation}
              newSalesAfterCreating_Data={props.newSalesAfterCreating_Data}
              app_config_data={props.app_config_data}
              edit_id_data={props.edit_id_data}
              listStockLocationSequenceAction={(data, setLoaderStatusHandler, employee_id, headerLocationId) => dispatch(listStockLocationSequenceAction({sequence_type: ["SO", "DC"]}, setLoaderStatusHandler, employee_id, headerLocationId))}
              customer={props.customer}
              handle_newCreate = {props.handle_newCreate}
              handle_newSalesAfterCreating_Data={props.handle_newSalesAfterCreating_Data}
              handleSubmit={props.handleSubmit}
              quotoationId={props.quotoationId}
              pageType={'/salesOrders'}
            />
            }
            {
                deleteDialogOpen &&
                <AlertDialog
                    delete={deleteDialogOpen}
                    handleClose={() => props.handleClose()}
                    handleDelete={() => { props.handleDelete(rowData); props.handleClose()}}
                    id={rowData.quotation_id}
                />
            }
        </>
    );
}

export default quotationDetailPage

