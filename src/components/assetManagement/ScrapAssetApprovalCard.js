import React, { useEffect, useState } from 'react'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { getsessionStorage } from 'pages/common/login/cookies'
import { useDispatch } from 'react-redux'
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import DoneIcon  from '@mui/icons-material/Done';
import QueryBuilderIcon from '@mui/icons-material/QueryBuilder';
import { roleTypeWithOutEmployee } from 'utils/roleType';
import PropTypes from 'prop-types';
import { scrapAssetApprovedAction, scrapAssetRejectedAction } from 'redux/actions/asset_actions';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteScrapAction } from '../../redux/actions/asset_actions';

const ScrapAssetApprovalCard = (props) => {

    const storage = getsessionStorage()
    const dispatch = useDispatch()

    const [reasonDialogOpen, setReasonDialogOpen] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [approveVerifyType, setApproveVerfiyType] = useState('')
    const [reason, setReason] = useState(null)
    const [reasonError, setReasonError] = useState(null)
    const [ deleteFrom,setDeleteFrom] = useState(false)

    let approverFlag = false
    let verifierFlag = false
    const assignedUserName =
        props?.scrapAsset?.full_name ||
        props?.scrapAsset?.assignedToName ||
        props?.scrapAsset?.assigned_to_name ||
        props?.scrapAsset?.['Assigned To'] ||
        ''
    const userDisplayName = assignedUserName || 'Not Assigned'

    const handleReasonChange = (event) => {
        const val = event.target.value
        setReason(val)
        if(val !== '' && val !== null) {
            setReasonError(null)
        }
        else {
            setReasonError('Reason is Required!')
        }
    }

    const handleReasonDialogClose = () => {
        setReasonDialogOpen(false)
        setReason(null)
        setReasonError(null)
    }

    const handleReasonSubmit = async (event) => {
        event.preventDefault()
        const isValid = reason !== null && reason !== 'null' && reason !== ''

        if(isValid) {
            setReasonError(null)
            const payload = {
                reason : reason,
                scrap_id : props.scrapAsset.scrap_id,
                asset_id : props.scrapAsset.asset_id
            }
            await dispatch(scrapAssetRejectedAction(payload, props.approval.request_id, async (response) => {
                const res = await response
                if(res.length > 0) {
                    const approval = res.filter((r) => r.request_id === props.approval.request_id)
                    props.handleApprovalRequest(approval[0])
                    props.setRequestId(approval[0].request_id)
                }
                else {
                    props.handleApprovalRequest({})
                    props.setRequestId(null)
                }
                setReasonDialogOpen(false)
                setReason(null)
            }))
        }
        else {
            setReasonError('Reason is Required!')
        }
    }

    const handleConfirm = async () => {
        const payload = {
            type : approveVerifyType,
            scrap_id : props.scrapAsset.scrap_id,
            asset_id : props.scrapAsset.asset_id,
            condition : props.scrapAsset.asset_condition
        }
        await dispatch(scrapAssetApprovedAction(payload, props.approval.request_id, async (response) => {
            const res = await response
            if(res.length > 0) {
                const approval = res.filter((r) => r.request_id === props.approval.request_id)
                props.handleApprovalRequest(approval[0])
                props.setRequestId(approval[0].request_id)
            }
            else {
                props.handleApprovalRequest({})
                props.setRequestId(null)
            }
            setConfirmDialogOpen(false)
        }))
    }

   const handleDelete = async () => {
    try {
        await dispatch(deleteScrapAction(props.scrapAsset.scrap_id))
        if (props.handleApprovalRequest) props.handleApprovalRequest({})
        if (props.setRequestId) props.setRequestId(null)
        setDeleteFrom(false)
        if (props.handleCancel) props.handleCancel()
    } catch (e) {
        setDeleteFrom(false)
    }
}

  return (
      <>
          <Grid container spacing={3} direction='row'>
              <Grid
                  display='flex'
                  justifyContent='center'
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Card 
                      sx={{ maxWidth: 600, width : {lg : 600, md : 600, sm : 400, xs : 230 } }} 
                      style={{ border : 'none', boxShadow : 'none', direction : 'row', backgroundColor : '#ECF6FC', marginLeft : '30px', marginTop : '20px' }}
                  >
                      <CardContent>
                          <Grid container>
                              <Grid
                                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                  size={{
                                      lg: 8,
                                      md: 8,
                                      sm: 8,
                                      xs: 8
                                  }}>
                                  <Typography gutterBottom component='div' sx={{ fontSize : '13px', fontWeight : 600 }}>
                                      {`Asset Name : ${props.scrapAsset.asset_name} - Asset Code : ${props.scrapAsset.asset_code}`}
                                  </Typography>
                                  <Tooltip title="delete">
                                      <IconButton
                                      onClick = {(e) => {
                                        e.stopPropagation()
                                        setDeleteFrom(true)
                                      }}
                                      >
                                          <DeleteIcon sx={{ color: 'red' }} />
                                      </IconButton>
                                  </Tooltip>
                              </Grid>

                              <Grid
                                  sx={{ mt : 5, fontSize : '12px' }}
                                  size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12
                                  }}>
                                  <Typography>{`User : ${userDisplayName}`}</Typography>

                                  <Typography>{`Condition : ${props.scrapAsset.asset_condition}`}</Typography>

                                  <Typography>{`Reason : ${props.scrapAsset.reason ? props.scrapAsset.reason : '-'}`}</Typography>
                              </Grid>
      
                              <Grid
                                  style={{ display: 'flex', justifyContent: 'space-between', marginTop : '10px', marginLeft : '20px' }}
                                  size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12
                                  }}>
                                  {
                                      props.scrapAsset.images && props.scrapAsset.images.length > 0 ? (
                                          <>
                                              {
                                                  props.scrapAsset.images[0] && (
                                                      <Grid
                                                          size={{
                                                              lg: 6,
                                                              md: 6,
                                                              sm: 6,
                                                              xs: 6
                                                          }}>
                                                          <img 
                                                              src = {props.scrapAsset.images[0].imageUrl} 
                                                              alt = 'First Image' 
                                                              style = {{ width : '250px', height : '250px'}}
                                                          />
                                                      </Grid>
                                                  )
                                              }
                                              {
                                                  props.scrapAsset.images[1] && (
                                                      <Grid
                                                          size={{
                                                              lg: 6,
                                                              md: 6,
                                                              sm: 6,
                                                              xs: 6
                                                          }}>
                                                          <img 
                                                              src = {props.scrapAsset.images[1].imageUrl} 
                                                              alt = 'Second Image'
                                                              style = {{ width : '250px', height : '250px' }}
                                                          />
                                                      </Grid>
                                                  )
                                              }
                                          </>
                                      ) : (
                                          <div>No data</div>
                                      )
                                  }
                              </Grid>

                              <Grid
                                  sx={{ mt : 7 }}
                                  size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12
                                  }}>
                                  <Divider />
                              </Grid>

                              <Grid
                                  sx={{ mt : 5 }}
                                  size={{
                                      lg: 12,
                                      md: 12,
                                      sm: 12,
                                      xs: 12
                                  }}>
                                  <Grid container spacing={2}>
                                      {
                                          props.approval.status === 'Rejected' && 
                                          <Grid
                                              display='flex'
                                              justifyContent='center'
                                              size={{
                                                  lg: 12,
                                                  md: 12,
                                                  sm: 12,
                                                  xs: 12
                                              }}>
                                              <Stack direction='row' alignItems='center' gap={1}>
                                                  <ThumbDownOffAltIcon fontSize='small' />
                                                  <Typography>Scrap Asset has been Rejected</Typography>
                                              </Stack>
                                          </Grid>
                                      }

                                      {
                                          (props.scrapAssetConfig.length === 0 && storage.role_name === 'Administrator') || (approverFlag === true && verifierFlag === true && storage.role_name === 'Administrator') ||
                                          (approverFlag === false && verifierFlag === false && storage.role_name === 'Administrator') || (approverFlag === true && verifierFlag === true && storage.role_name === 'Manager') ? 
                                          (
                                              <Grid container spacing={2}>
                                                  {
                                                      props.approval.status !== 'Rejected' &&
                                                      <Grid
                                                          display='flex'
                                                          justifyContent='center'
                                                          style={{ color : 'grey' }}
                                                          size={{
                                                              lg: 12,
                                                              md: 12,
                                                              sm: 12,
                                                              xs: 12
                                                          }}>
                                                          <Stack direction='row' alignItems='center' gap={1}>
                                                              {
                                                                  props.approval.approverId !== null && props.approval.verifierId !== null ? 
                                                                  <DoneIcon fontSize='small'  style={{ color : 'green' }} /> :
                                                                  <QueryBuilderIcon fontSize='small' style={{ color : 'grey' }} />
                                                              }

                                                              <Typography>
                                                                  {
                                                                      props.approval.approverId === null && props.approval.verifierId === null ? 'Waiting For the Approval'
                                                                      : props.approval.approverId && props.approval.verifierId === null ? 'Approved and Waiting for the Verifier' : 'Approved and Verified'
                                                                  }
                                                              </Typography>
                                                          </Stack>
                                                      </Grid>
                                                  }

                                                  {
                                                      !props.approval.approverId && !props.approval.verifierId && props.approval.status === 'Pending' &&
                                                      <Grid container spacing={3} display='flex' justifyContent='center' sx={{ mt : 2 }}>
                                                          <Grid>
                                                              <Button 
                                                                  variant = 'contained' 
                                                                  color = 'error' 
                                                                  onClick = {() => setReasonDialogOpen(true)}
                                                              >
                                                                  Deny
                                                              </Button>
                                                          </Grid>

                                                          <Grid>
                                                              <Button 
                                                                  variant = 'contained' 
                                                                  color = 'success' 
                                                                  onClick = {() => {setApproveVerfiyType('approveVerify'); setConfirmDialogOpen(true)}}
                                                              >
                                                                  Approve & Verify
                                                              </Button>
                                                          </Grid>
                                                      </Grid>
                                                  }
                                              </Grid>
                                          ) : (
                                              roleTypeWithOutEmployee.includes(storage.role_name) && props.approval.status === 'Pending' &&
                                              <Grid container spacing={2}>
                                                  <Grid
                                                      display='flex'
                                                      justifyContent='center'
                                                      style={{ color : 'grey' }}
                                                      size={{
                                                          lg: 12,
                                                          md: 12,
                                                          sm: 12,
                                                          xs: 12
                                                      }}>
                                                      <Stack direction='row' alignItems='center' gap={1}>
                                                          {
                                                              props.approval.approverId && props.approval.verifierId ? 
                                                              <DoneIcon fontSize='small' style={{ color : 'green' }} /> :
                                                              <QueryBuilderIcon fontSize='small' style={{ color : 'grey' }} />
                                                          }

                                                          <Typography>
                                                              {
                                                                  props.approval.approverId === null && props.approval.verifierId === null ? 'Waiting For the Approval'
                                                                  : props.approval.approverId && props.approval.verifierId === null ? 'Approved and Waiting for the Verifier' : 'Approved and Verified'
                                                              }
                                                          </Typography>
                                                      </Stack>
                                                  </Grid>

                                                  {
                                                      approverFlag && !props.approval.approverId && props.approval.status === 'Pending' &&
                                                      <Grid container spacing={3} display='flex' justifyContent='center' sx={{ mt : 1 }}>
                                                          <Grid>
                                                              <Button
                                                                  variant = 'contained'
                                                                  color = 'error'
                                                                  onClick = {() => setReasonDialogOpen(true)}
                                                              >
                                                                  Deny
                                                              </Button>
                                                          </Grid>

                                                          <Grid>
                                                              <Button
                                                                  variant = 'contained'
                                                                  color = 'success'
                                                                  onClick = {() => {setApproveVerfiyType('approve'); setConfirmDialogOpen(true)}}
                                                              >
                                                                  Approve
                                                              </Button>
                                                          </Grid>
                                                      </Grid>
                                                  }

                                                  {
                                                      verifierFlag && !props.approval.verifierId && props.approval.status === 'Pending' &&
                                                      <Grid container spacing={3} display='flex' justifyContent='center' sx={{ mt : 2 }}>
                                                          <Grid>
                                                              <Button
                                                                  variant = 'contained'
                                                                  color = 'error'
                                                                  onClick = {() => setReasonDialogOpen(true)}
                                                              >
                                                                  Deny
                                                              </Button>
                                                          </Grid>

                                                          <Grid>
                                                              <Button
                                                                  variant = 'contained'
                                                                  color = 'success'
                                                                  onClick = {() => {setApproveVerfiyType('verify'); setConfirmDialogOpen(true)}}
                                                              >
                                                                  Verify
                                                              </Button>
                                                          </Grid>
                                                      </Grid>
                                                  }
                                              </Grid>
                                          )
                                      }
                                  </Grid>
                              </Grid>

                          </Grid>
                      </CardContent>
                  </Card>

              </Grid>
          </Grid>
          <Dialog
              open = {reasonDialogOpen}
              maxWidth = 'sm'
              fullWidth
          >
              <DialogTitle>Reason</DialogTitle>
              <DialogContent>
                  <TextField 
                      required
                      fullWidth
                      label = 'Reason'
                      variant = 'filled'
                      value = {reason}
                      onChange = {handleReasonChange}
                      error = {reasonError !== null}
                      helperText = {reasonError === null ? '' : reasonError}
                  />
              </DialogContent>

              <DialogActions>
                  <Button
                      variant = 'contained'
                      color = 'error'
                      onClick = {handleReasonDialogClose}
                  >
                      Close
                  </Button>

                  <Button
                      variant = 'contained'
                      onClick = {handleReasonSubmit}
                  >
                      Submit
                  </Button>
              </DialogActions>
          </Dialog>
          <Dialog
              open = {confirmDialogOpen}
              maxWidth = 'sm'
              fullWidth
          >
              <DialogTitle>Confirmation</DialogTitle>
              <DialogContent>
                  <Typography sx={{ fontSize : '13px', color : 'grey' }}>
                      Are you sure to approve?
                  </Typography>
              </DialogContent>

              <DialogActions>
                  <Button
                      variant = 'contained'
                      color = 'error'
                      onClick = {() => setConfirmDialogOpen(false)}
                  >
                      Close
                  </Button>

                  <Button
                      variant = 'contained'
                      onClick = {handleConfirm}
                  >
                      Ok
                  </Button>
              </DialogActions>
          </Dialog>

              <Dialog
                  open={deleteFrom}
                  maxWidth='sm'
                  fullWidth
              >
                  <DialogTitle>Confirmation</DialogTitle>
                  <DialogContent>
                      <Typography sx={{ fontSize: '13px', color: 'grey' }}>
                          Are you sure to delete this approve?
                      </Typography>
                  </DialogContent>

                  <DialogActions>
                      <Button
                          variant='contained'
                          color='error'
                          onClick={() => setDeleteFrom(false)}
                      >
                          Close
                      </Button>

                      <Button
                          variant='contained'
                          onClick={handleDelete}
                      >
                          Ok
                      </Button>
                  </DialogActions>
              </Dialog>
              
      </>
  );
}

ScrapAssetApprovalCard.propTypes = {
    scrapAsset : PropTypes.object,
    approval : PropTypes.object,
    scrapAssetConfig : PropTypes.array,
    setRequestId : PropTypes.func,
    handleApprovalRequest : PropTypes.func
}

export default ScrapAssetApprovalCard
