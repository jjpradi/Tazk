import { Box, Breadcrumbs, IconButton, Tooltip, Typography, useTheme } from "@mui/material"
import DataGridTemp from "components/dataGridTemp"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import { titleURL } from "http-common"
import { useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getScrapLotAction, getSearchScrapLotsActions, setSearchScrapLotsAction } from "redux/actions/reports_actions"
import apiCalls from "utils/apiCalls"
import HomeIcon from '@mui/icons-material/Home'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import moment from "moment"
import CommonFilter from "components/pos/payment_section/CommonFilter"
import { FilterAlt } from "@mui/icons-material"
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';

const StyledChip = ({ label, amount, bgColor }) => (
    <Box
      sx={{
        backgroundColor: bgColor,
        color: '#FFFFFF',
        borderRadius: '6px',
        px: 1.2, 
        py: 0.3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1px',
        fontWeight: 500,
        boxShadow: 1,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: '1.5px solid transparent',
        transform: 'scale(1)',
        transition: 'all 0.2s ease-in-out',
        minWidth: 80,
        height: 36, 
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.62rem', 
          fontWeight: 600,
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: '0.65rem', 
          opacity: 0.9,
          textAlign: 'center',
        }}
      >
       {`₹${amount?.toLocaleString() || 0}`}
      </Typography>
    </Box>
  );

function ScrapLots(){

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const storage = getsessionStorage();
    const theme = useTheme()
    const {
        reportsReducer: { scrapLot },
        rbacReducer: {menuAccess = []}
    } = useSelector(state => state)
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)
    const date = new Date()
    const defaultFrom = new Date(date.getFullYear(), date.getMonth(), 1)
    const defaultTo = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const [searchApi, setSearchApi] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterDate, setFilterDate] = useState({
        from: defaultFrom,
        to: defaultTo
    })
    const [filterErrorMsg, setFilterErrorMsg] = useState({
        from: '',
        to: ''
    })
    const [pagination, setPagination] = useState({
        page: 0,
        numPerPage: 20,
        searchString: ""
    })
    
    useEffect(() => {
        if(!searchApi){
            const payload = {
                page: pagination.page,
                numPerPage: pagination.numPerPage,
                searchString: pagination.searchString,
                fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
                toDate: moment(filterDate.to).format('YYYY-MM-DD')
            }
            apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(getScrapLotAction(payload))
            )
        }
    }, [pagination.page, pagination.numPerPage])

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page: page }))
    }

    const handlePageSizeChange = (size) => {
        setPagination((prev) => ({ ...prev, page: 0, numPerPage: size }))
    }

    const cancelSearch = () => {
        setSearchApi(true)
        setPagination((prev) => ({ ...prev, page: 0, searchString: '' }))
        dispatch(setSearchScrapLotsAction({data: [], numCount: 0}))

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: '',
            fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
            toDate: moment(filterDate.to).format('YYYY-MM-DD')
        }
        dispatch(getSearchScrapLotsActions(payload, setModalTypeHandler, setLoaderStatusHandler))
        setSearchApi(false)
    }

    const requestSearch = (event) => {
        const value = event.target.value
        setSearchApi(true)
        setPagination((prev) => ({ ...prev, page: 0, searchString: value }))
        dispatch(setSearchScrapLotsAction({data: [], numCount: 0}))

        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: value,
            fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
            toDate: moment(filterDate.to).format('YYYY-MM-DD')
        }
        dispatch(getSearchScrapLotsActions(payload, setModalTypeHandler, setLoaderStatusHandler))
        setSearchApi(false)
    }

    const handleDateChange = (event) => {
        const { name, value } = event.target
        setFilterDate((prev) => ({ ...prev, [name]: value }))
    }

    const handleClearFilter = () => {
        setSearchApi(true)
        setPagination((prev) => ({ ...prev, page: 0 }))
        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
            toDate: moment(filterDate.to).format('YYYY-MM-DD')
        }
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getScrapLotAction(payload))
        )
        setSearchApi(false)
        setFilterOpen(false)
    }

    const handleApplyFilter = () => {
        setSearchApi(true)
        setPagination((prev) => ({ ...prev, page: 0 }))
        const payload = {
            page: 0,
            numPerPage: pagination.numPerPage,
            searchString: pagination.searchString,
            fromDate: moment(filterDate.from).format('YYYY-MM-DD'),
            toDate: moment(filterDate.to).format('YYYY-MM-DD')
        }
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getScrapLotAction(payload))
        )
        setSearchApi(false)
        setFilterOpen(false)
    }

    const columns = [
        {
            field: 'reconcileDate',
            headerName: 'Reconcile Date',
            width: 200
        },
        {
            field: 'scrapDate',
            headerName: 'Scrap Date',
            width: 200
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 200
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 200
        },
        {
            field: 'brand',
            headerName: 'Brand',
            width: 200
        },
        {
            field: 'lotNumber',
            headerName: 'Lot Number',
            width: 200
        },
        {
            field: 'approvedBy',
            headerName: 'Approved By',
            width: 200
        },
        {
            field: 'approvedDate',
            headerName: 'Approved Date',
            width: 200
        }
    ]
    const dataWithId = scrapLot.data.length > 0 ? scrapLot.data.map((d, i) => ({ ...d, id: i })) : []
    console.log(dataWithId, 'dataWithId', scrapLot)
    const selectedRole = storage?.role_name;
    const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__scrap_lot', 'can_export')
    return(
        <>
            <Helmet>
                <meta charSet='utf-8' />
                <title> {titleURL} | Scrap Lot Report </title>
            </Helmet>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 1.5, pb: 0.5 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', flex: 1 }}>Scrap Lot Report</Typography>
                {[
                    { label: 'Total Items', value: scrapLot?.numRows || 0, color: '#2E3A59' },
                    { label: 'Current Year', value: scrapLot?.consolidated?.currentYear ?? 0, color: '#d32f2f' },
                    { label: 'Last Month', value: scrapLot?.consolidated?.lastMonth ?? 0, color: '#E65100' },
                    { label: 'Last Scrapped', value: scrapLot?.consolidated?.lastScrapped ?? 0, color: '#7C4DFF' },
                ].map(k => (
                    <Box key={k.label} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
                        <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{k.label}</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: k.color, lineHeight: 1.3 }}>{k.value}</Typography>
                    </Box>
                ))}
                <IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton>
            </Box>
            <DataGridTemp
                title={''}

                filter={
                    <CommonFilter
                        fromTo={true}
                        noEmpFilter={true}
                        open={filterOpen}
                        from={filterDate.from}
                        to={filterDate.to}
                        type='scrapLotReport'
                        handleChange={handleDateChange}
                        clearButton={handleClearFilter}
                        ApplyButton={handleApplyFilter}
                        handleClose={(data) => setFilterOpen(data)}
                    />
                }
                consolidatedChips={
                    <Box display='flex' columnGap={3}>
                        <StyledChip label='Current Year' amount={scrapLot?.consolidated?.currentYear ?? 0} bgColor={theme.palette.primary.main} />
                        <StyledChip label='Last Month' amount={scrapLot?.consolidated?.lastMonth ?? 0} bgColor={theme.palette.primary.main} />
                        <StyledChip label='Last Scrapped' amount={scrapLot?.consolidated?.lastScrapped ?? 0} bgColor={theme.palette.primary.main} />
                    </Box>
                }
                columns={columns}
                columnData={columns}
                rowData={dataWithId}
                data={dataWithId}
                rowCount={scrapLot.numRows}
                exportData={reportExport}
                pageSize={pagination.numPerPage}
                page={pagination.page}
                pageType='scrapLot'
                type='latestPayrollReport'
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                requestSearch={requestSearch}
                cancelSearch={cancelSearch}
                isApiFinished={true}
            />
        </>
    )
}

export default ScrapLots