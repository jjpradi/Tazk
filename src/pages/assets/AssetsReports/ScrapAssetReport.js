import React, { useContext, useEffect, useState } from 'react'
import { titleURL } from 'http-common'
import { Helmet } from 'react-helmet-async'
import DataGridTemp from 'components/dataGridTemp'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import HomeIcon from '@mui/icons-material/Home'
import { useDispatch, useSelector } from 'react-redux'
import { getScrapAssetReportAction, getSearchScrapAssetReportAction, setSearchScrapAssetReportAction } from 'redux/actions/asset_actions'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import moment from 'moment'
import CommonFilter from 'components/pos/payment_section/CommonFilter'
import { listDepartment } from 'redux/actions/shifts.actions'
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions'
import { listStockLocationAction } from 'redux/actions/stock_Location_actions'
import { getsessionStorage } from 'pages/common/login/cookies'
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper'
import { useNavigate } from 'react-router-dom'

const ScrapAssetReport = () => {

    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const selectedRole = storage?.role_name

    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
        CreateNewButtonContext
    )


    const navigate = useNavigate()
    const date = new Date()
    const currentMonthFirstDate = new Date(date.getFullYear(), date.getMonth(), 1)
    const currentMonthLastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const [paginateData, setPaginateData] = useState({
        searchString : '',
        pageCount : 0,
        pageSize : 20
    })

    const [filterDetails, setFilterDetails] = useState({
        from : currentMonthFirstDate,
        to : currentMonthLastDate,
        selectedEmployee : []
    })

    const [errorMsg, setErrorMsg] = useState({
        from : '',
        to: ''
    })

    const [prevDate, setPrevDate] = useState({
        from : '',
        to : ''
    })

    const [monthYear, setMonthYear] = useState({
        empName : [''],
        location : [''],
        department : [''],
        from : moment(currentMonthFirstDate),
        to : moment(currentMonthLastDate)
    })

    const [button, setButton] = useState('4')
    const [filterOpen, setFilterOpen] = useState(false)
    const [count, setCount] = useState(0)
    const [departmentList, setDepartmentList] = useState(false)
    const [departmentListArray, setDepartmentListArray] = useState([])

    const {
        AssetReducers : { scrapAssetReport },
        stockLocationReducer : { stocklocation },
        ShiftsReducer : { list_department },
        rbacReducer : { menuAccess = {} }
    } = useSelector((state) => state)

    const originalData = scrapAssetReport?.data
    const dataWithId = originalData?.length ? originalData?.map((row, index) => ({ ...row, id: index })) : []

    useEffect(() => {
        let data = {
            searchString : ''
        }
        dispatch(listDepartment(data, (response) => {
            if(response.length) {
                setDepartmentList(true)
                setDepartmentListArray(response)
            }
        }))
    }, [])

    useEffect(() => {
        if(departmentList) {
            dispatch(getEmpbasecompanyAction())
            dispatch(setSearchScrapAssetReportAction({ data : [], numRows : 0 }))
            const payload = {
                searchString : paginateData.searchString,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.pageSize,
                fromDate : moment(filterDetails.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
                toDate : moment(filterDetails.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
                selectedEmployee : filterDetails.selectedEmployee,
                location : [],
                department : monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department
            }
            dispatch(getSearchScrapAssetReportAction(payload))
            dispatch(listStockLocationAction(commoncookie, headerLocationId))
        }
    }, [paginateData.pageCount, paginateData.pageSize, departmentList])

    const handlePageChange = (page) => {
        setPaginateData({...paginateData, pageCount : page})
    }

    const handlePageSizeChange = (size) => {
        setPaginateData({...paginateData, pageSize : size})
    }

    const requestSearch = (e) => {
        const val = e

        setPaginateData({...paginateData, searchString : val})
        dispatch(setSearchScrapAssetReportAction({data : [], numRows : 0}))
        const payload = {
            searchString : val,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            fromDate : moment(filterDetails.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate : moment(filterDetails.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            selectedEmployee : filterDetails.selectedEmployee,
            department : monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department,
            location : []
        }
        dispatch(getSearchScrapAssetReportAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const cancelSearch = (e) => {
        setPaginateData({...paginateData, searchString : ''})

        dispatch(setSearchScrapAssetReportAction({data : [], numRows : 0}))
        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            fromDate : moment(filterDetails.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate : moment(filterDetails.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            selectedEmployee : filterDetails.selectedEmployee,
            department : monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department,
            location : []
        }
        dispatch(getScrapAssetReportAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const getStartAndEndDate = (monthName, year) => {
        const monthMap = {
            jan : 0, feb : 1, mar : 2, apr : 3, may : 4, jun : 5,
            jul : 6, aug : 7, sep : 8, oct : 9, nov : 10, dec : 11
        }
        const monthNumber = monthMap[monthName.toLowerCase()]
        const startDate = new Date(year, monthNumber, 1)
        const endDate = new Date(year, monthNumber + 1, 0)
        return { startDate, endDate }
    }

    const handlePreviousMonthClick = (data, btn) => {
        setButton(btn)
        const month = data.split(' ')[0]
        const year = data.split(' ')[1]
        const { startDate, endDate } = getStartAndEndDate(month, year)

        setMonthYear((prev) => ({ ...prev, from : startDate, to : endDate }))
        setPrevDate((prev) => ({ ...prev, from : startDate, to : endDate }))
        setFilterDetails((prev) => ({ ...prev, from : startDate, to : endDate }))
        setPaginateData((prev) => ({ ...prev, searchString : '', pageCount : 0 }))

        dispatch(setSearchScrapAssetReportAction({ data : [], numRows : 0 }))

        const payload = {
            searchString : '',
            pageCount : 0,
            numPerPage : paginateData.pageSize,
            fromDate : moment(startDate).format('YYYY-MM-DD'),
            toDate : moment(endDate).format('YYYY-MM-DD'),
            selectedEmployee : filterDetails.selectedEmployee,
            department : monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department,
            location : []
        }
        dispatch(getSearchScrapAssetReportAction(payload))
    }
    const scrapAssetExport = menuAccess[selectedRole] ? UserRightsAuthorization(menuAccess[selectedRole], 'reports__assets__scrap_asset_report', 'can_export') : true
    const handleExport = async () => {
        if (!scrapAssetExport) return
        const columnHeaders = columnsAssets.map(column => column.headerName)
        const rows = scrapAssetReport?.data?.map(row => columnsAssets.map(column => row[column.field]))

        let csvContent = 'data:text/csv;charset=utf-8,'
        csvContent += columnHeaders.join(',') + '\n'
        csvContent += rows.map(row => row.join(',')).join('\n')
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', 'Scrap Asset Report' + '.csv')
        document.body.appendChild(link)
        link.click()
    }

    const onLocationChange = (e) => {
        const { value } = e.target
        setMonthYear((prevMonthYear) => ({
            ...prevMonthYear,
            location : value.includes('') ? [''] : value
        }))
    }

    const handleChange = (data) => {
        if(data?.target?.name == 'location') {
            setMonthYear({...monthYear, location : data.target.value})
        }
        if(data?.target?.name == 'department') {
            setMonthYear({...monthYear, department : data.target.value})
        }
        var dateVal = data?.target?.value?._d
        console.log('sdsadfasef', data.target.name)
        setFilterDetails({...filterDetails, [data.target.name] : dateVal})
        console.log('sdfsdgdfgre', filterDetails.fromDate)
        if(moment(filterDetails.from, 'year') <= moment(filterDetails.to, 'year')) {
            if(moment(filterDetails.from, 'month') <= moment(filterDetails.to, 'nonth')) {
                if(moment(filterDetails.from, 'day') <= moment(filterDetails.to, 'day')) {
                    setErrorMsg({...errorMsg, from : '', to : ''})
                }
                else {
                    setErrorMsg({...errorMsg, [data.target.name] : 'Invalid Date 1'})
                }
            }
            else {
                setErrorMsg({...errorMsg, [data.target.name] : 'Invalid Date 2'})
            }
        }
        else {
            setErrorMsg({...errorMsg, [data.target.name] : 'Invalid Date 3'})
        }
    }

    const handleClear = () => {
        setButton('4')
        setPaginateData({...paginateData, searchString : ''})
        setFilterOpen(false)
        setFilterDetails({
            ...filterDetails, 
            from : currentMonthFirstDate, 
            to : currentMonthLastDate, 
            selectedEmployee : []
        })
        setMonthYear({
            ...monthYear,
            empName : [''],
            location : [''],
            department : [''],
            from : moment(currentMonthFirstDate),
            to : moment(currentMonthLastDate)
        })
        let data = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            fromDate : moment(currentMonthFirstDate, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate : moment(currentMonthLastDate, 'year', 'month', 'day').format('YYYY-MM-DD'),
            selectedEmployee : filterDetails.selectedEmployee,
            department : monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department,
            location : []
        }
        dispatch(getSearchScrapAssetReportAction(data))
        dispatch(listStockLocationAction(commoncookie, headerLocationId))
    }

    const handleApply = async (val) => {
        setMonthYear({...monthYear, empName : val?.map(v => v?.employee_id)})
        let data = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            fromDate : moment(filterDetails.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
            toDate : moment(filterDetails.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
            selectedEmployee : val?.map(v => v?.employee_id),
            department : monthYear.department[0] === '' ? list_department.map((d) => d.department) : monthYear.department,
            location : monthYear.location
        }
        setPaginateData({...paginateData, pageCount : 0})
        dispatch(getSearchScrapAssetReportAction(data))
        setFilterOpen(false)
        setPaginateData({...paginateData, searchString : ''})
        setButton('')
    }
    

    const columnsAssets = [
        { field : 'Code', headerName : 'Code', width : 110 },
        { field : 'Asset Group', headerName : 'Group', width : 120, renderCell : (params) => params?.value?.toUpperCase() },
        { field : 'Asset Type', headerName : 'Type', width : 130, renderCell : (params) => params?.value?.toUpperCase() },
        { field : 'Name', headerName : 'Asset Name', width : 150 },
        { field : 'Asset Owner', headerName : 'Asset Owner', width : 150 },
        { field : 'Location', headerName : 'Location', width : 130 },
        { field : 'Assigned To', headerName : 'Assigned To', width : 150 },
        { field : 'Status', headerName : 'Status', width : 110 },
        { field : 'Condition', headerName : 'Condition', width : 110 },
        { field : 'Cost', headerName : 'Cost', width : 150 }
    ]
    console.log(selectedRole, 'selectedRole')
    console.log(menuAccess, 'menuAccess')

  return (
    <>
        <Helmet>
            <meta charSet='utf-8' />
            <title>{titleURL} | Scrap Asset Report</title>
        </Helmet>

        <DataGridTemp 
            columns = {columnsAssets}
            rowData = {dataWithId}
            columnData = {columnsAssets}
            exportData = {scrapAssetExport}
            data = {dataWithId}
            rowCount = {scrapAssetReport.numRows}
            page = {paginateData.pageCount}
            pageSize = {paginateData.pageSize}
            rowsPerPageOptions = {[20,50,100]}
            onPageChange = {(page) => handlePageChange(page)}
            onPageSizeChange = {(size) => handlePageSizeChange(size)}
            attendanceReports = 'ScrapAssetReport'
            pageType = 'scrapAssetReport'
            type = 'latestPayrollReport'
            requestSearch = {(e) => requestSearch(e.target.value)}
            cancelSearch = {cancelSearch}
            searchVal = {paginateData.searchString}
            handlePreviousMonthClick = {handlePreviousMonthClick}
            handleExport = {handleExport}
            button = {button}
            setButton = {setButton}
            showCurrentMonthChip = {true}
            title = {
                <Breadcrumbs
                    aria-label = 'breadcrumb'
                    separator = {
                        <NavigateNextIcon fontSize = 'small' />
                    }
                >
                      <Link onClick={() => navigate('/report')}>
                        <HomeIcon fontSize = 'inherit' sx={{ mr : 0.5 }} />
                        Home
                    </Link>
                    <Typography className='page-title'>
                        Scrap Asset Report
                    </Typography>
                </Breadcrumbs>
            }
            filter = {
                <div style = {{ display : 'flex', alignItems : 'center' }}>
                    <CommonFilter
                        open = {filterOpen} 
                        handleClose = {setFilterOpen}
                        fromTo = {true}
                        companySearch = {false}
                        locationFilter = {true}
                        shouldFetchData = {true}
                        from = {filterDetails.from}
                        to = {filterDetails.to}
                        count = {count}
                        monthYear = {monthYear}
                        onLocationchange = {onLocationChange}
                        stocklocation = {stocklocation}
                        departmentList = {list_department}
                        handleChange = {handleChange}
                        clearButton = {handleClear}
                        ApplyButton = {handleApply}
                    />
                </div>
            }
        />
    </>
  )
}

export default ScrapAssetReport


