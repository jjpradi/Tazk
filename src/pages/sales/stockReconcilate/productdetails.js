import React, {useContext, useEffect, useRef, useState} from 'react';
import {Box, Button, Grid, IconButton, Typography} from '@mui/material/';
import MaterialTable from 'utils/SafeMaterialTable';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import PropTypes from 'prop-types';
import {InventoryDialog, ScrapLocationDialog} from './dialog';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import {useDispatch, useSelector} from 'react-redux';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCustomFetch } from 'utils/useCustomFetch';
import { reconciliateDetailsAction, stockReconcilatePaginationAction, updateReconciliateDetailsAction } from 'redux/actions/stockReconcilate_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import API_URLS from '../../../utils/customFetchApiUrls';
import { getStickyTableOptions } from '../../../utils/stickyTableLayout';
export default function ProductDetails(props) {
  const {productChange, productContent, reconciliate_status_btn, detailsApi} =
    props;

  const {
    stockReconcilateReducer: {reconciliateDetails},
  } = useSelector((s) => s);

  const [dialogOpen, setDialogOpen] = useState({
    open: false,
    data: {},
    title: '',
  });
  const [inventoryOpen, setInventoryOpen] = useState({
    open: false,
    data: {},
    title: '',
  });
  // const [refresh,setRefresh]= useState();
  const handleOpen = (isTrue, data, title) => {
    setDialogOpen({open: isTrue, data: data, title: title});
  };
  const handleClose = () => {
    setDialogOpen({open: false, data: {}, title: ''});
  };

  const handleInventoryOpen = (isTrue, data, title) => {
    setInventoryOpen({open: isTrue, data: data, title: title});
  };
  const handleInventoryClose = () => {
    setInventoryOpen({open: false, data: {}, title: ''});
  };
    const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const customFetch = useCustomFetch();
  const dispatch = useDispatch();
  
  const handleCustomDelete = async (rowData) => {
    await customFetch(
      API_URLS.DELETE_EXCESS_LOT,
      'POST',
      rowData
    );
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(reconciliateDetailsAction({'reconciliate_id':rowData?.physicalStockId}))
        )
  };
  useEffect(()=>{
      const body = {
          pageCount: 0,
          numPerPage: 20,
          searchString: '',
          employee_id: commoncookie,
          location_id: headerLocationId,
          category:''
      }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(stockReconcilatePaginationAction(body))
        )
  },[reconciliateDetails.mergedArray])

  return (
    <Grid container spacing={2} display='flex' flexDirection='row' sx={{ overflowY: 'auto' }}>
      <Grid size={{ xs: 12 }}>
        <Grid
        spacing={7}
        container
        direction='row'
        display='flex'
        justifyContent='flex-end'
        // paddingTop='25px'
      >
        <Grid>
          <Button
            onClick={() => productChange(false)}
            style={{}}
            name='Back'
            variant='contained'
            color='secondary'
            size='medium'
            text='button'
            fullWidth={false}
            type='back'
          >
            {'Back'}
          </Button>
        </Grid>
      </Grid>
      </Grid>
      {
      // !reconciliateDetails.mergedArray?.length &&
      // !reconciliateDetails.reconciliatedProductList?.length &&
      // !reconciliateDetails.scannedLots?.length ? (
      //   <Grid
      //     item
      //     lg={12}
      //     md={12}
      //     sm={12}
      //     xs={12}
      //     display='flex'
      //     justifyContent='center'
      //     alignItems='center'
      //   >
      //     <Typography
      //       sx={{
      //         width: '100%',
      //         textAlign: 'center',
      //         fontSize: '16px',
      //         padding: '20px',
      //         color: 'gray',
      //       }}
      //     >
      //       {detailsApi ? 'No Record Found' : ''}
      //     </Typography>
      //   </Grid>
      // ) : 
      reconciliateDetails.mergedArray?.length ? (
        <>
          {/*...................................................... Missing Lots.......................................................................   */}

          {/* <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
              <MaterialTable
                options={{
                  headerStyle,
                  cellStyle,
                  exportButton: true,
                  filtering: false,
                  pageSize: 10,
                  pageSizeOptions: [20, 50, 100],
                  search: true,
                }}
                columns={[
                  {
                    field: 'name',
                    title: 'Product Name',
                  },
                  {
                    field: 'category', //location_id
                    title: 'Category',
                  },
                  {
                    field: 'brand',
                    title: 'Brand',
                  },
                  {
                    field: 'lotNumber',
                    title: 'Lot Number',
                  },
                  {
                    field: 'location_name',
                    title: 'Location Name',
                  },
                  {
                    field: 'reason',
                    title: 'Description',
                  },
                  {
                    title: 'Actions',
                    render: (rowData) => {
                      return (
                        <Box
                          display='flex'
                          justifyContent='center'
                          alignItems='center'
                        >
                          <IconButton
                            title='Move to Scrap Location'
                            disabled={reconciliate_status_btn}
                            color={
                              reconciliate_status_btn ? 'inherit' : 'warning'
                            }
                            onClick={() => {
                              handleOpen(
                                true,
                                rowData,
                                'Are you sure, you want to move this product to scrap location?',
                              );
                            }}
                          >
                            <MoveDownIcon />
                          </IconButton>
                        </Box>
                      );
                    },
                  },
                ]}
                data={reconciliateDetails.missing?.filter((r, id) => {
                  const {tableData, ...record} = r;
                  record.lotNumber = r.lotNumber;
                  return {id, ...record};
                })}
                title={
                  <Typography
                    variant='h6'
                    align='left'
                    style={{paddingTop: '10px', paddingBottom: '10px'}}
                  >
                    {'Missing Lots'}
                  </Typography>
                }
              />
            </Grid> */}

          {/*...................................................... Excess Lots.......................................................................   */}

          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <MaterialTable
              //tableRef={tableRef}
              editable={{
                isEditable: (rowData) => rowData.type !== 'missing',
                isDeletable: (delRow) => delRow.type !== 'missing',
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve) => {
                    dispatch(updateReconciliateDetailsAction(newData, newData.id))
                    resolve();
                  }),
               onRowDelete: (oldData) =>
                      new Promise(async(resolve, reject) => {
                          handleCustomDelete(oldData);
                          resolve();
                      }),
              }}
              options={getStickyTableOptions({
                 bodyOffset: 200,
                headerStyle,
                cellStyle,
                options:{
                  exportButton: true,
                filtering: false,
                tableLayout: "auto",
                toolbar: true,
                pageSize: 20,
                pageSizeOptions: [20, 50, 100],
                search: true,
                actionsColumnIndex: -1,
              // maxBodyHeight,
              minBodyHeight: 'calc(100vh - 230px)',
              maxBodyHeight: 'calc(100vh - 300px)'
                }
              })}
              columns={[
                {
                  field: 'name',
                  title: 'Product Name',
                  editable: false
                },
                {
                  field: 'category',
                  title: 'Category',
                  editable: false
                },
                {
                  field: 'brand',
                  title: 'Brand',
                  editable: false
                },
                {
                  field: 'lotNumber',
                  title: 'Lot Number',
                },
                {
                  field: 'location_name',
                  title: 'Location Name',
                  editable: false
                },
                {
                  field: 'reason',
                  title: 'Description',
                },
                {
                  field: 'type',
                  title: 'Stock Type',
                  editable: false
                },
                {
                  title: 'Move',
                  render: (rowData) => {
                    const isEditing = rowData.tableData?.editing === 'update'
                    return rowData.type === 'missing' ? (
                      <Box
                        display='flex'
                        justifyContent='start'
                        alignItems='center'
                      >
                        <IconButton
                          title='Move to Scrap Location'
                          disabled={reconciliate_status_btn || isEditing}
                          color={
                            reconciliate_status_btn ? 'inherit' : 'warning'
                          }
                          onClick={() => {
                            handleOpen(
                              true,
                              rowData,
                              'Are you sure, you want to move this product to scrap location?',
                            );
                          }}
                        >
                          <MoveDownIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        display='flex'
                        justifyContent='start'
                        alignItems='center'
                      >
                        <IconButton
                          title='Move to Inventory'
                          disabled={reconciliate_status_btn || isEditing}
                          color={
                            reconciliate_status_btn ? 'inherit' : 'success'
                          }
                          onClick={() => {
                            handleInventoryOpen(
                              true,
                              rowData,
                              'Are you sure, you want to move this product to Inventory?',
                            );
                          }}
                        >
                          <MoveDownIcon />
                        </IconButton>
                      </Box>
                    );
                  },
                },
              ]}
              data={reconciliateDetails.mergedArray?.map((r, id) => {
                const {tableData, ...record} = r;
                record.lotNumber = r.lotNumber;
                return {id, oldLotNumber: r.lotNumber, ...record};
              })}
              title={
                <Typography
                  variant='h6'
                  align='left'
                  style={{paddingTop: '10px', paddingBottom: '10px'}}
                >
                  {'Lots to be Process'}
                </Typography>
              }
            />
          </Grid>
        </>
      ) : !reconciliateDetails.mergedArray?.length &&
        !reconciliateDetails.reconciliatedProductList?.length ? (
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              exportButton: true,
              filtering: false,
              pageSize: 20,
              pageSizeOptions: [20, 50, 100],
              search: true,
              // maxBodyHeight,
              minBodyHeight: 'calc(100vh - 230px)',
              maxBodyHeight: 'calc(100vh - 300px)'
            }}
            columns={[
              {
                field: 'name',
                title: 'Product Name',
              },
              {
                field: 'category',
                title: 'Category',
              },
              {
                field: 'brand',
                title: 'Brand',
              },
              {
                field: 'lotNumber',
                title: 'Lot Number',
              },
              {
                field: 'location_name',
                title: 'Location Name',
              },
              {
                field: 'reason',
                title: 'Description',
              },
              {
                field: 'status',
                title: 'Status',
              },
              {
                field: 'creationDate',
                title: 'Date of Creation',
              },
              {
                field: 'personCreated',
                title: 'Created By',
              }
            ]}
            // data={reconciliateDetails.scannedLots?.filter((r, id) => {
            //   const {tableData, ...record} = r;
            //   record.lotNumber = r.lotNumber;
            //   return {id, ...record};
            // })}
            data={reconciliateDetails.reconciledData}
            title={
              <Typography
                variant='h6'
                align='left'
                style={{paddingTop: '10px', paddingBottom: '10px'}}
              >
                {'Scanned Lots'}
              </Typography>
            }
          />
        </Grid>
      ) 
      : (
        ''
      )
      }

      {/*...................................................... Reconciliated Product Lots.......................................................................   */}

      {reconciliateDetails.reconciliatedProductList?.length ? (
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              exportButton: true,
              filtering: false,
              pageSize: 20,
              pageSizeOptions: [20, 50, 100],
              search: true,
              // maxBodyHeight,
              minBodyHeight: 'calc(100vh - 230px)',
              maxBodyHeight: 'calc(100vh - 300px)'
            }}
            columns={[
              {
                field: 'name',
                title: 'Product Name',
              },
              {
                field: 'category',
                title: 'Category',
              },
              {
                field: 'brand',
                title: 'Brand',
              },
              {
                field: 'lotNumber',
                title: 'Lot Number',
              },
              {
                field: 'location_name',
                title: 'Location Name',
              },
              {
                field: 'reason',
                title: 'Description',
              },
              {
                title: 'Action',
                field: 'action',
              },
            ]}
            data={reconciliateDetails.reconciliatedProductList?.filter(
              (r, id) => {
                const {tableData, ...record} = r;
                record.lotNumber = r.lotNumber;
                return {id, ...record};
              },
            )}
            title={
              <Typography
                variant='h6'
                align='left'
                style={{paddingTop: '10px', paddingBottom: '10px'}}
              >
                {'Processed Lots'}
              </Typography>
            }
          />
        </Grid>
      ) : (
        ''
      )}
      {dialogOpen.open && (
        <ScrapLocationDialog
          setDialogOpen={setDialogOpen}
          data={dialogOpen.data}
          title={dialogOpen.title}
          open={dialogOpen.open}
          handleClose={handleClose}
        />
      )}
      {inventoryOpen.open && (
        <InventoryDialog
          setInventoryOpen={setInventoryOpen}
          data={inventoryOpen.data}
          title={inventoryOpen.title}
          open={inventoryOpen.open}
          handleClose={handleInventoryClose}
        />
      )}
    </Grid>
  );
}

ProductDetails.propTypes = {
  productChange: PropTypes.func,
  productContent: PropTypes.object,
  moveToInventory: PropTypes.func,
  moveScrapLocation: PropTypes.func,
};

