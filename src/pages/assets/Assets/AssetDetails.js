import {  Box, Button, Card, CardMedia, Grid, IconButton, Tooltip, Typography, Dialog, DialogContent } from '@mui/material'
import OptionButton from 'components/erpDesign/actionButton'
import React, { useEffect, useState } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useDispatch, useSelector } from 'react-redux';
import ScrapAsset from 'components/assetManagement/scrapAsset';
import AssetTransfer from './AssetTransfer';
import AssignedTo from 'components/assetManagement/assignedTo';
import AlertsForm from 'pages/assets/Alerts/Form';
import AssignToTable from './AssignToTable';
import { ListAlerts } from 'redux/actions/asst_alerts_actions';
import AuditTable from './AuditTable';
import QRCodeForAssets from 'components/assetManagement/QRCodeforAssets';
import AuditCheckListCreationForm from 'pages/assets/Audits/AuditCheckListCreation';
import ServiceDueTable from 'pages/assets/ServiceDue/ServiceDueTable';
import NewItemTable from 'pages/assets/NewItem/NewItemTable';
import InsuranceTable from '../Insurance/InsuranceTable';
import WarrantyTable from './AssetWarrantyTable';
import AssetNewForm from './AssetNewForm';
import PropTypes from 'prop-types'
import Renewals from 'pages/assets/Renewals';
import AssetTimelineCard from './AssetTimelineCard';
 
const Asset_Details = (props) => {
  const [index,setIndex]=useState(0);

  const[optionIndex, setOptionIndex] = useState(null)

  const[dialogOpen, setDialogOpen] = useState(false)

  const[paginateData, setPaginateData] = useState({
      searchString: "",
      pageCount: 0,
      pageSize: 5
  })
  const r = props.rowData

  const [showForm, setShowForm] = useState(true);
  const d = props.rowDat 
  const dispatch = useDispatch()

  const{
    AssetReducers:{
      timelineList,
      assignList,
      assignListCount,
      assetsAssignedTo,
      assetsAssignedToCount,
      
    },
    Audits:{
      auditCheckList,
    }
  } = useSelector((state) => state)
 
  const handleCancel = () =>{
    setShowForm(false)
    dispatch(
      ListAlerts()
    )
  }

  useEffect(() => {
  if (!props?.tableData?.length) {
    setIndex(0);
    return;
  }

  const currentIndex = props.tableData.findIndex(
    (item) => item.id === props?.rowData?.id
  );

  setIndex(currentIndex >= 0 ? currentIndex : 0);
}, [props.rowData, props.tableData]);

 
 
const rows = props.tableData?.[index] ?? props?.rowData ?? null;

  const handleNext = () => {
     if (index < props.tableData.length - 1) {
    setIndex(prev => prev + 1);
  }
  };

  const handlePrev = () => {
    if (index >= 1) {
      setIndex(prevIndex => prevIndex - 1);
    }
  };

 
  const handleAssetChange = (options) => {
    setOptionIndex(options)
    setDialogOpen(true)
  }
  
 const handleFormClose =()=>{
  setOptionIndex(null)
  // props.handleDetailClose()
  // dispatch(
  //   ListAssetTimeline( (async (res) => {
  //     const finalRows = await res
  //     setNewTimelineList(finalRows)
  //   }))
  // )

  const payload ={
    searchString: paginateData.searchString,
    pageCount: paginateData.pageCount,
    numPerPage: paginateData.pageSize
  }
 }


  return (
    <div style={{
      padding: '0 10px',
      height: '92vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
      {optionIndex === null && <>
      <div style={{ display: 'flex' }}>
        <div style={{ marginLeft: 'auto' }}>
          <Grid container spacing={2} >
            <Grid>
                <Button
                onClick={()=>props.handleDetailClose(null)}
                  variant='contained'
                  sx={{}}
                  color='inherit'
                >
                  Back
                </Button>
            </Grid>

            <Grid zIndex={1}>
              <OptionButton
                checkType='Assets'
                handleAssetChange={handleAssetChange}
                user_rights={props.user_rights}
              />

            </Grid>

            <Grid>
              <Tooltip title='Previous'>
                <IconButton
                 disabled={
                   index === 0
                 }
                onClick={handlePrev}
                  color='primary'
                >
                  <ArrowBackIosNewIcon  />
                </IconButton>
              </Tooltip>
 
              <Tooltip title='Next'>
                <IconButton
                disabled={
                  props.tableData.length -1 === index
                }
                onClick={handleNext}
                  color='primary'
                >
                  < ArrowForwardIosIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </div> 
      </div>
     
 
      <Card variant='outlined' style={{ width: '100%', marginBottom: "20px" }}>
        <Grid container direction='row'>
          <Grid
            style={{
              borderRight: '1px #d9dadc solid',
              padding: '6px',
            }}
            size={{
              md: 12,
              lg: 3,
              sm: 12,
              xs: 12
            }}>
            <div style={{ minHeight: 40, paddingBottom: '10px' }}>
              <Box sx={{ minHeight: 19, display: 'flex', justifyContent: 'center',padding:"10px 0px"}}>
 
              <Card sx={{ maxWidth: 300 }}>
      <CardMedia
        component="img"
        alt='Image 1'
        height="240"
        width="240"
        image={rows?.Image?.length ? rows?.Image[0].imageUrl : 'no images'}
      />
      </Card>
             
              </Box>
              <div style={{ minHeight: 40 ,width:'100%'}}>
                < Box sx={{ minHeight: 19 }} >
                  <Card variant='outlined' sx={{ padding: '10px' }}>
 
                    <Grid container spacing={2} >
                     
                      {rows && <Grid
                        style={{ minHeight: '100px' }}
                        size={{
                          xs: 12,
                          md: 4,
                          lg: 3,
                          sm: 4
                        }}>
                        <Typography variant='body1' sx={{padding:'10px',width:'270px'}}> Code : {rows?.Code}</Typography>
                        <Typography variant='body1' sx={{padding:'10px',width:'270px'}}>Name: {rows.Name}</Typography>
                        <Typography variant='body1' sx={{padding:'10px',width:'270px'}}>Type : {rows[`Asset Type`]}</Typography>
                        <Typography variant='body1' sx={{padding:'10px',width:'270px'}}>Value : {rows[`Asset Group`]}</Typography>
                        <Typography variant='body1' sx={{padding:'10px',width:'270px'}}>Created on : {rows.Location}</Typography>
                        <Typography variant='body1' sx={{padding:'10px',width:'270px'}}>Documents : {rows?.Image ? `${rows.Image.length} Photos` : 'No Documents'}</Typography>
                      </Grid>}
 
                    </Grid>
                  </Card>
                </Box>
 
              </div>

              <div style={{ minHeight: 20, marginTop: "10px" }}>
              <Grid
                style={{ minHeight: '100px' }}
                size={{
                  xs: 12,
                  md: 4,
                  lg: 12,
                  sm: 4
                }}>
                <Box>
                  <Card variant='outlined'>
                    {rows && <QRCodeForAssets type='detail' assetData={rows}/>}
                    {/* <AlertDialog 
                    labelType='qrCode' 
                    list='asset'
                    row_id={{data: {
                        assetCode: rows?.code,
                    }}} 
                    serialPopClose={handleQrClose}
                    /> */}
                  </Card>
                </Box>
                </Grid>
              </div>


            </div>
 
          </Grid>
 
          <Grid
            size={{
              md: 12,
              lg: 9,
              sm: 12,
              xs: 12
            }}>
            <div style={{ minHeight: 50, width: '100%' }}>
                         

                          {rows && (
                            <>
                              <AssignToTable code={rows?.Code} index={index} filteredData={rows}/>

                              <AuditTable code={rows?.Code} filteredData={rows} index={index} type="asset_id" id={rows?.asset_id}/>

                              {/* <Renewals type = 'assetsRenewals' index = {index} id={rows.asset_id} /> */}
                              <InsuranceTable type = 'asset_id' index = {index} id={rows?.asset_id} />
                              <WarrantyTable type = 'asset_id' index = {index} id={rows?.asset_id} />

                              <ServiceDueTable type='asset_id' index={index} id={rows?.asset_id}/>

                              <NewItemTable type='asset_id' index={index} id={rows?.asset_id}/>

                              <AssetTimelineCard index={index} data = {rows?.asset_id} />
                            </>
                          )}

            </div>
          </Grid>
 
        </Grid>
        </Card>
 
    </>
    }
      {optionIndex === 0 && 
         <Dialog open={dialogOpen}>
           <AssignedTo assetData={rows}  closeDialog={(close) => {setDialogOpen(close); handleFormClose() ;  }} handleDetailClose={() => props.handleDetailClose()} />
         </Dialog>
      }
      {optionIndex === 1 && 
         <Dialog open={dialogOpen}>
           <AssetTransfer assetData={rows}  closeDialog={(close) => {setDialogOpen(close); handleFormClose() ;  }} handleDetailClose={() => props.handleDetailClose()}/>
         </Dialog>
      }
      {optionIndex === 2 && 
         <Dialog open={dialogOpen}>
           <DialogContent style={{ maxHeight : '90vh', overflowY : 'auto' }}>
             <ScrapAsset assetData={rows} closeDialog={(close) => {setDialogOpen(close); handleFormClose() }} handleDetailClose={() => props.handleDetailClose()} />
           </DialogContent>
         </Dialog>
      }
      {optionIndex === 3 && 
           // <AssetManagement status='edit' r={r} assetData={rows} timelineList={timelineList} handleFormClose={()=>{handleFormClose();}} handleDetailClose={() => props.handleDetailClose()}/>
           <AssetNewForm status='edit' r={r} assetData={rows} timelineList={timelineList} handleFormClose={handleFormClose} handleDetailClose={() => props.handleDetailClose()}/>

      }
      {optionIndex === 4 && 
        <Dialog open={dialogOpen} maxWidth='md' fullWidth>
          <AlertsForm type='alertsDetail'  d={d} assetData={rows} handleSubmitClose = {handleCancel} handleCancel={()=>{handleFormClose();} } />
        </Dialog>
        }
      {optionIndex === 5 && 
         <Dialog open={dialogOpen} maxWidth='md' fullWidth>
           <AuditCheckListCreationForm type='detail' assetData={rows} handleClose={(close) => {setDialogOpen(close); handleFormClose()}}/>
           {/* <AssetAuditCheckList handleFormClose={()=>{handleFormClose()}}/> */}
         </Dialog>
      }
    </div>
  );
}

Asset_Details.propTypes = {
  rowData: PropTypes.object,
  handleDetailClose: PropTypes.func,
  user_rights: PropTypes.object
}
 
 
export default Asset_Details
