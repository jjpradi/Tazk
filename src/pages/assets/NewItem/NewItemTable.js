import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    ListNewItem,
    getSearchNewItemAction,
    setSearchNewItemAction,
} from 'redux/actions/newItem_actions'
import CommonSearch from 'utils/commonSearch'
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize'
import AddIcon from '@mui/icons-material/Add'
import NewItemForm from './NewItemForm'
import PropTypes from 'prop-types'
import {
    Box,
    Card,
    IconButton,
    Modal,
    TablePagination,
    Tooltip,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import EditIcon from '@mui/icons-material/Edit'
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper'
import apiCalls from 'utils/apiCalls'
import { getsessionStorage } from 'pages/common/login/cookies'
import { getMenuAccessAction } from 'redux/actions/rbac_actions'

const NewItemTable = (props) => {
    const storage = getsessionStorage()
    const dispatch = useDispatch()
    const assetId = props?.id
    const [showForm, setShowForm] = useState(false)
    const [rowData, setRowData] = useState()
    const [images, setImages] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [editData, setEditData] = useState()
    const [formType, setFormType] = useState(null)

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
    } = useContext(CreateNewButtonContext)

    const {
        NewItemReducers: { newItemList, newItemListCount },
        rbacReducer: { menuAccess },
    } = useSelector((state) => state)

    const [paginateData, setPaginateData] = useState({
        searchString: '',
        pageCount: 0,
        pageSize: 5,
    })

    const handleOpen = () => {
        setShowForm(true)
        setFormType('newNewItemForm')
    }

    const editOpen = () => {
        setShowForm(true)
        setFormType('edit')
    }

    const handleCancel = () => {
        setShowForm(false)
        const payload = {
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            asset_id: props?.id,
        }
        dispatch(ListNewItem(payload))
    }

    const selectedRole = storage?.role_name
    useEffect(() => {
        if (!selectedRole) return
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getMenuAccessAction(selectedRole)),
        )
    }, [selectedRole, dispatch])

    const newItemCreate = UserRightsAuthorization(menuAccess[selectedRole], 'renewals__service_due', 'can_create')
    const newItemEdit = UserRightsAuthorization(menuAccess[selectedRole], 'renewals__service_due', 'can_edit')

    const columnNewItem = [
        { field: 'name', title: 'Asset Name' },
        { field: 'asset_code', title: 'Code' },
        { field: 'title', title: 'Title' },
        { field: 'warranty_period', title: 'Warranty Period' },
        { field: 'old_asset_name', title: 'Old Asset Name' },
        { field: 'new_asset_name', title: 'New Asset Name' },
        { field: 'issue_date', title: 'Issued Date' },
        {
            field: 'image',
            title: 'Attachment',
            render: (row) => {
                const imageUrl = row?.image?.[0]?.imageUrl
                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt='Attachment'
                        style={{ width: 60, height: 60, objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => handleDialogImageOpen(row.image)}
                    />
                ) : '-'
            },
        },
        // {
        //     field: 'action',
        //     title: 'Action',
        //     render: (row) => (
        //         <div style={{ display: 'flex' }}>
        //             {newItemEdit && (
        //                 <Tooltip title='Edit'>
        //                     <IconButton
        //                         onClick={(e) => {
        //                             e.stopPropagation()
        //                             editOpen()
        //                             setEditData(row)
        //                         }}
        //                     >
        //                         <EditIcon />
        //                     </IconButton>
        //                 </Tooltip>
        //             )}
        //         </div>
        //     ),
        // },
    ]

    useEffect(() => {
        const payload = {
            searchString: paginateData.searchString,
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            asset_id: props?.id,
        }
        dispatch(ListNewItem(payload))
    }, [paginateData.pageCount, paginateData.pageSize, props?.index])

    const handlePageChange = (newPage) => {
        setPaginateData((prev) => ({ ...prev, pageCount: newPage }))
    }

    const handlePageSizeChange = (newSize) => {
        setPaginateData((prev) => ({ ...prev, pageSize: newSize, pageCount: 0 }))
    }

    const cancelSearch = () => {
        setPaginateData({ ...paginateData, searchString: '' })
        dispatch(setSearchNewItemAction({ data: [], numRows: 0 }))
        const payload = {
            searchString: '',
            pageCount: paginateData.pageCount,
            numPerPage: paginateData.pageSize,
            asset_id: props?.id,
        }
        dispatch(getSearchNewItemAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const requestSearch = (e) => {
        const val = e.target.value
        setPaginateData({ ...paginateData, searchString: val })
        dispatch(setSearchNewItemAction({ data: [], numRows: 0 }))
        const payload = {
            searchString: val,
            pageCount: 0,
            numPerPage: paginateData.pageSize,
            asset_id: props?.id,
        }
        dispatch(getSearchNewItemAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    }

    const handleDialogImageOpen = (imgs) => {
        setImages(imgs)
        setImageOpen(true)
    }

    const handleDialogImageClose = () => {
        setImageOpen(false)
    }

    return (
        <>
            {!showForm && (
                <Card sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    <MaterialTable
                        style={{ margin: '12px' }}
                        totalCount={newItemListCount}
                        columns={columnNewItem}
                        data={newItemList}
                        options={{
                            headerStyle: {
                                ...headerStyle,
                                position: 'sticky',
                                top: 0,
                                zIndex: 10,
                                backgroundColor: '#f5f5f5',
                            },
                            cellStyle,
                            filtering: false,
                            actionsColumnIndex: -1,
                            paging: true,
                            pageSize: paginateData.pageSize,
                            pageSizeOptions: [5, 10, 20],
                            search: false,
                            maxBodyHeight,
                            fixedHeader: true,
                        }}
                        components={{
                            Toolbar: (tProps) => (
                                <div>
                                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                                        <div style={{ width: '100%' }}>
                                            <MTableToolbar {...tProps} />
                                        </div>
                                        <div>
                                            <CommonSearch
                                                searchVal={paginateData.searchString}
                                                cancelSearch={cancelSearch}
                                                requestSearch={requestSearch}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ),
                            Pagination: (pProps) => (
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                    }}
                                >
                                    <TablePagination
                                        {...pProps}
                                        component='div'
                                        count={newItemListCount || 0}
                                        page={paginateData.pageCount || 0}
                                        rowsPerPage={paginateData.pageSize || 5}
                                        onPageChange={(event, newPage) => handlePageChange(newPage)}
                                        rowsPerPageOptions={[5, 10, 20]}
                                        onRowsPerPageChange={(event) =>
                                            handlePageSizeChange(parseInt(event.target.value, 10))
                                        }
                                        labelRowsPerPage='Rows per page:'
                                    />
                                </div>
                            ),
                        }}
                        actions={[
                            newItemCreate ? {
                                icon: () => <AddIcon />,
                                tooltip: 'Add',
                                isFreeAction: true,
                                onClick: handleOpen,
                            } : null,
                        ]}
                        title='New Item Replacement'
                    />
                </Card>
            )}

            {showForm && (
                <NewItemForm
                    type={formType === 'edit' ? 'edit' : undefined}
                    handleCancel={handleCancel}
                    rowData={formType === 'edit' ? editData : undefined}
                    editData={formType === 'edit' ? editData : undefined}
                    assetId={props?.id}
                />
            )}

            <Modal
                open={imageOpen === true}
                aria-labelledby='image-modal-title'
                aria-describedby='image-modal-description'
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        alignContent: 'center',
                        p: 4,
                        maxWidth: '700px',
                        width: '90vw',
                        maxHeight: '700px',
                        height: '95vh',
                    }}
                >
                    <Tooltip title='Close'>
                        <IconButton
                            onClick={handleDialogImageClose}
                            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                        >
                            <Close />
                        </IconButton>
                    </Tooltip>
                    <img
                        src={images[0]?.imageUrl}
                        alt='Image'
                        style={{ width: '600px', height: '600px', objectFit: 'fit', marginLeft: '33px', marginTop: '5px' }}
                    />
                </Box>
            </Modal>
        </>
    )
}

NewItemTable.propTypes = {
    type: PropTypes.string,
    id: PropTypes.number,
    index: PropTypes.number,
}

export default NewItemTable
