import React, { useContext, useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { useDispatch, useSelector } from 'react-redux'
import { ListInsurance, getSearchInsuranceAction, setSearchInsuranceAction } from 'redux/actions/insurance_actions'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, formatTime12Hour, headerStyle, cellStyle } from 'utils/pageSize'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { Dialog } from '@mui/material'
import { Button, Chip, IconButton, Tooltip,TablePagination } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InsuranceForm from './InsuranceForm'
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types'
import moment from 'moment'
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout'

const InsuranceTable = (props) => {

    const dispatch = useDispatch()

    const [images, setImages] = useState([])

    const [showForm, setShowForm] = useState('list')

    const [data, setData] = useState([])


    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(
        CreateNewButtonContext
    )

    const {
        InsuranceReducers: {insuranceList,insuranceListCount},
    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString : "",
        pageCount : 0,
        pageSize : props?.type === 'asset_id' ? 5 : 20
    })

    const handleCancel = async () => {
        setShowForm('list')
        const payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        const asset_payload = {
            searchString : paginateData.searchString,
            pageCount : paginateData.pageCount,
            numPerPage : 5,
            asset_id : props?.id
        }

        if(props?.type === 'asset_id') {
            await dispatch(ListInsurance(asset_payload))
        }
        
        { props?.type !== 'asset_id' && dispatch(ListInsurance(payload)) }
    }

    const handleDialogOpen = (images) => {
        setImages(images)
        setShowForm('image')
    }

    const handleDialogClose = () => {
        setShowForm('list')
    }

    const handleRenewFormOpen = (data) => {
        setData(data)
        setShowForm('reNewForm')
    }

    const handleNewFormOpen = () => {
        setShowForm('insuranceNewForm')
    }
   
    const columnInsurance = [
        {
            field : 'name',
            title : 'Asset Name'
        },
        {
            field : 'insurance_agent',
            title : 'Insurance Provider'
        },
        {
            field : 'start_date',
            title : 'Start Date',
            render : (rowData) => {
                if(rowData.start_date !== null) {
                    const [date, time] = `${rowData.start_date}`.split(' ')
                    const formattedDate = moment(date).format('DD/MM/YYYY')
                    const formattedTime = formatTime12Hour(time)
                    return `${formattedDate} ${formattedTime}`
                }
                else {
                    return '-'
                }
            }
        },
        {
            field : 'end_date',
            title : 'End Date',
            render : (rowData) => {
                if(rowData.end_date !== null) {
                    const [date, time] = `${rowData.end_date}`.split(' ')
                    const formattedDate = moment(date).format('DD/MM/YYYY')
                    const formattedTime = formatTime12Hour(time)
                    return `${formattedDate} ${formattedTime}`
                }
                else {
                    return '-'
                }
            }
        },
        {
            field : 'image',
            title : 'Image',
            render : (rowData) => {
                if(rowData.image.length > 0) {
                    const firstImage = rowData.image[0].imageUrl
                    return (
                            <img
                                src = {firstImage}
                                alt = 'imagess'
                                style = {{ width: "50%", height: "auto", cursor: "pointer" }}
                                onClick = {() => handleDialogOpen(rowData.image)}
                            />
                    )
                }
                else {
                    return 'No Data'
                }
            }
        },   
        {
            field: 'expires_in',
            title: 'Expires In',
            render: (rowData) => {
                const days = rowData.expires_in;
                
                let color;
                
                if (days >= 0 && days < 30) {
                    color = 'red';
                } else if (days >= 30 && days < 60 ) {
                    color = 'orange';
                } else if (days >= 60) {
                    color = 'green';
                }
                
                const displayText = (days === 0 || days === 1) ? `${days} day` : `${days} days`;
                
                return (
                    <Chip
                        label={displayText}
                        style={{ backgroundColor: color }}
                    />
                );
            }
        },
        ...(props?.type === 'asset_id' ? [] : [{
            field : 'action',
            title : 'Action',
            render : (rowData) => {
                return (
                    <Tooltip title = 'Renew'>
                        <IconButton 
                            onClick={() => handleRenewFormOpen(rowData)}
                        >
                            <AutorenewIcon />
                        </IconButton>
                    </Tooltip>
                )
            }
        }])
    ]


    useEffect(() => {
        let payload = {}
        if(props?.type !== 'asset_id') {
             payload = {
                searchString : paginateData.searchString,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.pageSize
            } 
        }
        else {
            payload = {
                searchString : paginateData.searchString,
                pageCount : paginateData.pageCount,
                numPerPage : paginateData.pageSize,
                asset_id : props?.id
            }
        }
        dispatch(ListInsurance(payload))
        
    }, [paginateData.pageCount, paginateData.pageSize, props?.index])

    

    const handlePageChange = (page) => {
        setPaginateData({...paginateData, pageCount : page})
    }


    const handlePageSizeChange = (size) => {
        setPaginateData({...paginateData, pageSize : size})
    }


    const cancelSearch = () => {
        setPaginateData({...paginateData, searchString : ''})

        dispatch(setSearchInsuranceAction({data : [], numRows : 0}))

        const payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        const asset_payload = {
            searchString : '',
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            asset_id : props?.id
        }

        if(props?.type === 'asset_id'){
            dispatch(ListInsurance
                (asset_payload, setModalTypeHandler, setLoaderStatusHandler)
            )
        }
        else{
            dispatch(ListInsurance
                (payload, setModalTypeHandler, setLoaderStatusHandler)
            )
        }
       
    }


    const requestSearch = (e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchString : val})

        dispatch(setSearchInsuranceAction({data : [], numRows : 0}))

        const payload = {
            searchString : val,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize
        }
        const asset_payload = {
            searchString : val,
            pageCount : paginateData.pageCount,
            numPerPage : paginateData.pageSize,
            asset_id : props?.id
        }
        if(props?.type === 'asset_id'){
            dispatch(getSearchInsuranceAction
                (asset_payload, setModalTypeHandler, setLoaderStatusHandler)
            )
        }
        else{
            dispatch(getSearchInsuranceAction
                (payload, setModalTypeHandler, setLoaderStatusHandler)
            )
        }
    }


  return (
    <>
        {
            showForm === 'list' &&
                <MaterialTable
                    style={props.type === 'asset_id' ? { margin : '12px' } : {}}
                    totalCount = {insuranceListCount}
                    columns = {columnInsurance}
                    data = {insuranceList}
                    options = {getStickyTableOptions({
                        headerStyle,
                        cellStyle,
                        bodyOffset: 200,
                        options:{
                        filtering : false,
                        actionsColumnIndex : -1,
                        paging : true,
                        pageSize : paginateData.pageSize,
                        pageSizeOptions : props?.type === 'asset_id' ? [5,10,20] : [20, 50, 100],
                        search : false,
                        tableLayout: "auto",
                        toolbar: true,
                        // maxBodyHeight: 'calc(100vh - 260px)',
                        // minBodyHeight: 'calc(100vh - 260px)',
                        },
                    })}
                    page = {paginateData.pageCount}
                    onPageChange = {(page) => handlePageChange(page)}
                    onRowsPerPageChange = {(size) => handlePageSizeChange(size)}
                    components = {{
                        ...stickyTableComponents,
                         Pagination: (props) => (
                                    <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      alignItems: "center",
                                       padding: "8px 16px",
                                       }}>
                                        <TablePagination
                                        {...props}
                                        count={insuranceListCount} 
                        page={paginateData.pageCount || 0}
                        rowsPerPage={paginateData.pageSize || 20}
                        rowsPerPageOptions={[20, 50, 100]}
                        onPageChange={(event, newPage) => handlePageChange(newPage)}
                        onRowsPerPageChange={(event) =>
                          handlePageSizeChange(parseInt(event.target.value, 10))
                        }
                        labelRowsPerPage="Rows per page:" />
                                        </div>),
                        Toolbar : (props) => (
                            <div>
                                <div
                                    style={{
                                        display : 'flex',
                                        width : '100%',
                                        alignItems : 'center'
                                    }}
                                >
                                    <div style={{width : '100%'}}>
                                        <MTableToolbar {...props} />
                                    </div>
                                    <div>
                                        <CommonSearch
                                            searchVal = {paginateData.searchString}
                                            cancelSearch = {cancelSearch}
                                            requestSearch = {requestSearch}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    }}
                    actions={[
                        props?.type === 'asset_id' ? '' : {
                            icon : () => <AddIcon />,
                            tooltip : 'Add',
                            isFreeAction : true,
                            onClick : handleNewFormOpen
                        }
                    ]}
                    title = 'Insurance'
                >
                    </MaterialTable>
       }
       {
        showForm === 'insuranceNewForm' && 
            <InsuranceForm 
                type='newForm' 
                handleCancel={handleCancel}
            />
       }

       {
        showForm === 'reNewForm' && 
            <InsuranceForm 
                type='renewForm' 
                data={data} 
                handleCancel={handleCancel}
            />
       }

        <Dialog open = {showForm === 'image'}>
            <img 
                src = {images[0]?.imageUrl}
                alt='images'
            />
            <Button
                sx={{borderRadius:'0'}}
                variant='contained' 
                color='error'
                onClick={handleDialogClose}
            >
                Close
            </Button>
        </Dialog>
    </>
  )
}

InsuranceTable.propTypes = {
    type : PropTypes.string,
    id : PropTypes.number,
    index : PropTypes.number
}

export default InsuranceTable
