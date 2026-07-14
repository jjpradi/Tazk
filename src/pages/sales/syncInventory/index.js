import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Card, Checkbox, Grid, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { maxBodyHeight, pageSize } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { get_searchsyncProductAction, set_searchsyncProductAction } from 'redux/actions/product_actions';
import apiCalls from 'utils/apiCalls';
import { titleURL } from 'http-common';
import { Helmet } from 'react-helmet-async';

const SyncInventory = () => {
    const dispatch = useDispatch();
    const { productReducer: { syncproduct } } = useSelector((state) => state);
    const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(CreateNewButtonContext);

    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [searchVal, setSearchVal] = useState('');
    const [selectedRowIds, setSelectedRowIds] = useState(new Set());
    const [isAllSelected, setIsAllSelected] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const requestData = {
                employeeId: commoncookie,
                locationId: headerLocationId,
                searchString: searchVal,  
                pageCount: page,
                numPerPage: pageSize
            };

            setLoaderStatusHandler(true);
            dispatch(get_searchsyncProductAction(requestData, setModalTypeHandler, setLoaderStatusHandler));
        };

        fetchData();
    }, [page, searchVal]);

    useEffect(() => {
        if (syncproduct?.data?.length) {
            setData(syncproduct.data.map((item, index) => ({
                id: `${page}-${index}`, 
                ...item,
            })));
        } else {
            setData([]);
        }
    }, [syncproduct, page]);

    const requestSearch = (e) => {
        const val = e.target.value;
        setSearchVal(val);

        const requestData = {
            employeeId: commoncookie,
            locationId: headerLocationId,
            searchString: val,
            pageCount: 0,
            numPerPage: pageSize,
        };

        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
            dispatch(get_searchsyncProductAction(requestData, setModalTypeHandler, setLoaderStatusHandler))
        );
    };

    const cancelSearch = () => {
        setSearchVal('');
        dispatch(set_searchsyncProductAction({ data: [] }));

        const requestData = {
            employeeId: commoncookie,
            locationId: headerLocationId,
            searchString: '',
            pageCount: 0,
            numPerPage: pageSize,
        };

        apiCalls(setModalTypeHandler, setLoaderStatusHandler,
            dispatch(get_searchsyncProductAction(requestData, setModalTypeHandler, setLoaderStatusHandler))
        );
    };

    const handleSelectionChange = (newSelection) => {
        setSelectedRowIds((prev) => {
            const updatedSelection = new Set(prev);
            newSelection.forEach((id) => updatedSelection.add(id)); 
            return updatedSelection;
        });
    };

    const handleCheckAllChange = (event) => {
        const checked = event.target.checked;
        setIsAllSelected(checked);

        if (checked) {
            const allRowIds = data.map((row) => row.id);
            setSelectedRowIds((prev) => new Set([...prev, ...allRowIds]));
        } else {
            setSelectedRowIds(new Set());
        }
    };

    const columns = [
        {
            field: 'check_all',
            headerName: (
                <Checkbox
                    checked={isAllSelected}
                    onChange={handleCheckAllChange}
                    color="primary"
                    sx={{ padding: 0, marginLeft: '2px' }} 
                />
            ),
            sortable: false,
            width: 100,
            renderCell: (params) => (
                <Checkbox
                    checked={selectedRowIds.has(params.id)}
                    onChange={() => {
                        setSelectedRowIds((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(params.id)) {
                                newSet.delete(params.id);
                            } else {
                                newSet.add(params.id);
                            }
                            return newSet;
                        });
                    }}
                    color="primary"
                />
            ),
        },
        { field: 'name', headerName: 'Product Name', flex: 1 },
        { field: 'category', headerName: 'Category', flex: 1 },
        { field: 'brand', headerName: 'Brand', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        { field: 'unit_price', headerName: 'Unit Price', align: 'right',headerAlign: 'right',  flex: 1 },
        { field: 'tax_category', headerName: 'Tax Category', flex: 1 },
    ];

    return (
        <>
            <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%',pb:'0px', overflow: 'auto' }}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title> {titleURL} | Sync Inventory </title>
                </Helmet>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ padding: 2 }}>
                    <Grid style={{ paddingLeft: '5px' }}>
                        <Typography variant="h6">Sync Inventory</Typography>
                    </Grid>
                    <Grid>
                        <CommonSearch
                            searchVal={searchVal}
                            cancelSearch={cancelSearch}
                            requestSearch={requestSearch}
                        />
                    </Grid>
                </Grid>

                <DataGrid
                    style={{ minHeight : maxBodyHeight, maxHeight : maxBodyHeight }}
                    rows={data}
                    columns={columns}
                    onRowSelectionModelChange={handleSelectionChange}
                    rowSelectionModel={Array.from(selectedRowIds)}
                    keepNonExistentRowsSelected
                    
                    paginationMode="server"
                    rowCount={syncproduct?.numRows}
                    
                    disableRowSelectionOnClick={true} 
                    checkboxSelection={false}
                    hideFooterSelectedRowCount={true} initialState={{ pagination: { paginationModel: { page: 0, pageSize: pageSize } } }} onPaginationModelChange={(model) => { ((newPage) => setPage(newPage))(model.page); }} 
                />
                </Card>
        </>
    );
};

export default SyncInventory;
