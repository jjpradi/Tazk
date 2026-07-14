import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import moment from "moment";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import OptionButton from "components/erpDesign/actionButton";
import AssetDetails from "../Renewals/AssetDetails";
import AlertsForm from "pages/assets/Alerts/Form";
import RenewalRecordsTable from "../Renewals/RenewalRecordsTable";
import { useDispatch, useSelector } from "react-redux";
import { getCustomRenewalsByIdAction, getRenewalRecordAction, updatePauseRenewalsAction, updateResumeRenewalsAction } from "../../../redux/actions/renewals_actions";
import { assetDetailsAction } from "../../../redux/actions/asset_actions";
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import RenewalTimelineCard from 'components/erpDesign/RenewalTimelineCard'
import CustomRenewalsNewForm from './CustomRenewalsNewForm'

const summaryCardSx = {
  p: 1.5,
  width: "100%",
  borderRadius: 2,
  bgcolor: "grey.600",
  color: "common.white",
};

export default function CustomRenewalDetails(props) {
console.log(props,"dsfsdgd");
   
  const dispatch = useDispatch()
  const storage = getsessionStorage()
  const [index, setIndex] = useState(null)
  const [optionIndex, setOptionIndex] = useState(null)  
  const [recordsPagination, setRecordsPagination] = useState({
    numPerPage: 5,
    pageCount: 0,
  })

  const [data ,setData ] = useState(null)  
  const { 
    RenewalsReducers : { allCustomRenewals ,getCustomRenewalsById , renewalRecords },
    AssetReducers : {assetDetails}
   } = useSelector((state) => state)
  
  useEffect(() => {
    if (allCustomRenewals?.data?.length && props?.data?.id) {
      const currentIndex = allCustomRenewals.data.findIndex(
        (item) => item.id === props?.data?.id
      )
      setIndex(currentIndex)
    }
  }, [props?.data?.id, allCustomRenewals?.data])

  useEffect(() => {
    if (index !== null && allCustomRenewals?.data?.length) {
      const res = allCustomRenewals?.data[index]

      if (res?.id) {
        const payload = {
          type : 'details',
        }
        dispatch(getCustomRenewalsByIdAction(res?.id ,payload))
      }
    }
  }, [index])

    useEffect(() => {
    if (getCustomRenewalsById) {
      setData(getCustomRenewalsById)
    }
  }, [getCustomRenewalsById ,index])

  useEffect(() => {
    if (data?.data?.[0]?.asset_id) {
      dispatch(assetDetailsAction({ asset_id: data.data[0].asset_id }))
    }
  }, [data])


  useEffect(() => {
    if (data?.data?.[0]?.id) {
      dispatch(getRenewalRecordAction({
        id: data.data[0].id,
        numPerPage: recordsPagination.numPerPage,
        pageCount: recordsPagination.pageCount,
        type: 'customRenewals'
      }))
    }
  }, [data, recordsPagination])

  const selectedRole = storage?.role_name
  const canEdit = UserRightsAuthorization(
    props.user_rights?.[selectedRole],
    'renewals__custom_renewals',
    'can_edit',
  )

const handleEdit = () => {
    if (data?.data?.[0] && props.handleEdit) {
      props.handleEdit(data.data[0]);
    }
  };

  const handleRenewalsOptionChange = (option) => {
      setOptionIndex(option)
  }

  const handleRenewCancel = () => {
    setOptionIndex(null)
  }

  const handlePauseConfirm = async () => {
    const payload = {
      id: data?.data?.[0]?.id,
      type:"customRenewals",
    };
    await dispatch(updatePauseRenewalsAction(payload))
    props.handleClose()
  }

  const handleResumeConfirm = async () => {
    const payload = {
      id: data?.data?.[0]?.id,
      type:"customRenewals", 
    }
    await dispatch(updateResumeRenewalsAction(payload))
    props.handleClose()
  }
  
  const handleRenewSubmitClose = () => {
    setOptionIndex(null)
    props.handleClose()
  }

  const handlePrev = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
      setIndex((prev) => prev + 1);

  };

  const handlePageChange = (page) => {
    setRecordsPagination((prev) => ({ ...prev, pageCount: page }));
  };

  const handlePageSizeChange = (size) => {
    setRecordsPagination((prev) => ({ ...prev, numPerPage: size }));
  };



  return (
    <>
    {optionIndex === null && (
    <div style={{
      padding: '0 10px',
      height: '90vh',
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
           } `}
      </style>      

      <Grid container spacing={2} justifyContent="flex-end" sx={{ mb: 2 }}>
        <Grid>
          <Button onClick={()=>props.handleClose()} variant="contained" color="inherit">
            Back
          </Button>
        </Grid>

        {canEdit && (
          <Grid zIndex={1}>
            <OptionButton
              user_rights={props.user_rights}
              disablePause = {data?.data?.[0]?.repeat === 1 ? true : false}
              checkType='Renewals'
              handleRenewalsOptionChange={handleRenewalsOptionChange}
            />
          </Grid>
        )}

        <Grid>
          <Tooltip title="Previous">
            <IconButton color="primary" disabled={index === null || index <= 0} onClick={handlePrev}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid>
          <Tooltip title="Next">
            <IconButton
              color="primary"
              disabled={index === null || !allCustomRenewals?.data?.length || index >= allCustomRenewals.data.length - 1}
              onClick={handleNext}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <Card sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 12 }}>
                <Card variant="outlined" sx={summaryCardSx}>
                  <Typography variant="body1" align="center">
                    Renewal Type
                  </Typography>
                  <Typography variant="h6" align="center">
                    {data?.data?.[0]?.renewal_type ? data?.data?.[0]?.renewal_type : '-' }
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 12 }}>
                <Card variant="outlined" sx={summaryCardSx}>
                  <Typography variant="body1" align="center">
                    Amount
                  </Typography>
                  <Typography variant="h6" align="center">
                     {data?.data?.[0]?.amount ? data?.data?.[0]?.amount : '-' }
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 12 }}>
                <Card variant="outlined" sx={summaryCardSx}>
                  <Typography variant="body1" align="center">
                    Created At
                  </Typography>
                  <Typography variant="h6" align="center">
                    {data?.data?.[0]?.created_at ? moment(data?.data?.[0]?.created_at).format('DD/MM/YYYY') : '-' }
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 12 }}>
                <Card variant="outlined" sx={summaryCardSx}>
                  <Typography variant="body1" align="center">
                    Created By                  
                    </Typography>
                  <Typography variant="h6" align="center">
                    {data?.data?.[0]?.fullName ? data?.data?.[0]?.fullName : '-' }
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 12 }}>
                <Card variant="outlined" sx={summaryCardSx}>
                  <Typography variant="body1" align="center">
                    Start Date
                  </Typography>
                  <Typography variant="h6" align="center">
                    {data?.data?.[0]?.startDate ? moment(data?.data?.[0]?.startDate).format('DD/MM/YYYY') : '-' }
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 12 }}>
                <Card variant="outlined" sx={summaryCardSx}>
                  <Typography variant="body1" align="center">
                    End Date
                  </Typography>
                  <Typography variant="h6" align="center">
                    {data?.data?.[0]?.endDate ? moment(data?.data?.[0]?.endDate).format("DD/MM/YYYY"): '-' }
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <AssetDetails data={assetDetails} />
          </Grid>

          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <RenewalRecordsTable
              data={renewalRecords}
              numPerPage={recordsPagination.numPerPage}
              pageCount={recordsPagination.pageCount}
              handlePageChange={handlePageChange}
              handlePageSizeChange={handlePageSizeChange}
            />
          </Grid>
          {data?.data?.[0]?.id &&
    <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
        <RenewalTimelineCard type='customRenewal' id={data?.data?.[0]?.id} />
    </Grid>
}
        </Grid>
      </Card>
    </div>
    )}
      {
        data?.data?.[0]?.repeat === 1 &&
        <Dialog open={optionIndex === 0}>
          <DialogTitle sx={{ width: '400px' }}>
            Confirmation ?
          </DialogTitle>

          <DialogContent>
            <DialogContentText>
              Are you sure to pause the renewal ?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleRenewCancel}>
              Cancel
            </Button>

            <Button onClick={handlePauseConfirm}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      }

      <Dialog open={optionIndex === 2 || (data?.data?.[0]?. repeat === 1 && optionIndex === 1)} maxWidth='md' fullWidth>
        <AlertsForm
          type='renewalAlert'
          data={data?.data?.[0]}
          handleCancel={handleRenewCancel}
          handleSubmitClose={handleRenewSubmitClose}
        />
      </Dialog>
      {
        data?.data?.[0]?.repeat === 0 &&
        <Dialog open={optionIndex === 1}>
          <DialogTitle sx={{ width: '400px' }}>
            Confirmation ?
          </DialogTitle>

          <DialogContent>
            <DialogContentText>
              Are you sure to resume the renewal ?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleRenewCancel} >
              Cancel
            </Button>

            <Button onClick={handleResumeConfirm}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      }

    {optionIndex === 0 && data?.data?.[0]?.repeat === 0 &&(
      <CustomRenewalsNewForm
        type='Renew'
        rowData={data?.data?.[0]}
        handleClose={handleRenewCancel}
        handleSubmitClose={handleRenewSubmitClose}
      />
    )}
    </>
  );
}

CustomRenewalDetails.propTypes = {
  data: PropTypes.object,
  tableData: PropTypes.array,
  handleClose: PropTypes.func,
  handleEdit: PropTypes.func,
};
