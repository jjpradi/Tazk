import React, { useEffect, useState } from 'react'
import { Button, Dialog, Grid, IconButton, Tooltip } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import OptionButton from 'components/erpDesign/actionButton'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import CampaignDetailCard from './CampaignDetailCard';
import PropTypes from 'prop-types'
import CampaignStatusCard from './CampaignStatusCard'
import { getAllCampaignAction, updateCampaignStatusAction } from 'redux/actions/campaign_actions'
import CampaignForm from './CampaignForm';
import CampaignTimelineCard from './CampaignTimelineCard'
import CampaignLeadCount from './CampaignLeadCount'
import CampaignLead from './CampaignLead'

const CampaignDetails = (props) => {

    const dispatch = useDispatch()

    const {
        CampaignReducers: { getAllCampaign }
        } = useSelector(state => state)

    const [optionIndex, setOptionIndex] = useState(null)
    const [index, setIndex] = useState(0)
    const [rowData, setRowData] = useState([])
    const [paginate,setPaginate] = useState(false)

    // useEffect(() => {
    //     setIndex(props.index)
    // }, [props.index])

    // useEffect(() => {
    //     if(index !== 0) {
    //         const campaignData = props.data.find(d => d.campaign_id === index)
    //         setRowData(campaignData)
    //     }
    // }, [index])

    useEffect(() => {
            dispatch(getAllCampaignAction())
        }, [])

    useEffect(() => {
        console.log('cpamm999',index,props.index)
		if(getAllCampaign.length > 0) {
			const Index = getAllCampaign.findIndex((e) => e.campaign_id === props.index)
			setIndex(Index)
		}
	}, [getAllCampaign])

    useEffect(() => { (async () => {
        if(index !== null && getAllCampaign.length > 0 && index !== -1) {
            const Data = getAllCampaign[index]
            await setRowData(Data)
        }
    })();
}, [index, getAllCampaign])

    console.log(rowData,"rowData")

    const handleCampaignOptionChange = (option) => {
        setOptionIndex(option)
    }

    const handlePrev = () => {
        if(index >= 1) {
            setIndex(prevIndex => prevIndex - 1)
        }
    }

    const handleNext = () => {
        setIndex(prevIndex => prevIndex + 1)
    }

    const handleClose = () => {
        setOptionIndex(null)
    }

    const updateCampaignStatus = (data) => {
        dispatch(updateCampaignStatusAction(data))
    }
    
    const handleEditClose = () => {
        setOptionIndex(null)
        props.handleClose()
    }

  return (
      <>
          {
              optionIndex === null &&
              <>
                  <Grid 
                      container spacing = {2} 
                      display = 'flex' 
                      justifyContent = 'flex-end'
                  >
                      <Grid>
                          <Button
                              onClick = {() => props.handleClose()}
                              variant = 'contained'
                              color = 'inherit'
                          >
                              Back
                          </Button>
                      </Grid>

                      <Grid zIndex={1}>
                          <OptionButton 
                              checkType = 'Campaign'
                              handleCampaignOptionChange = {handleCampaignOptionChange}
                          />
                      </Grid>

                      <Grid>
                          <Tooltip title = 'Previous'>
                              <IconButton
                                  color = 'primary'
                                  disabled = {index === 0}
                                  onClick = {handlePrev}
                              >
                                  <ArrowBackIosNewIcon />
                              </IconButton>
                          </Tooltip>
                      </Grid>

                      <Grid>
                          <Tooltip title = 'Next'>
                              <IconButton
                                  color = 'primary'
                                  disabled = {getAllCampaign.length === index + 1}
                                  onClick = {handleNext}
                              >
                                  <ArrowForwardIosIcon />
                              </IconButton>
                          </Tooltip>
                      </Grid>
                  </Grid>

                  <CampaignLeadCount data = {rowData} /> <br></br>

                  <CampaignStatusCard data = {rowData} updateCampaignStatus = {updateCampaignStatus} />

                  <CampaignDetailCard data={rowData} /> <br></br>

                  <CampaignLead data = {rowData} />

                  <CampaignTimelineCard data = {rowData} />
              </>
          }
          {optionIndex === 0 && <CampaignForm data={rowData} handleClose={handleEditClose} type='edit' />}
      </>
  );
}

CampaignDetails.propTypes = {
    handleClose : PropTypes.func,
    data : PropTypes.object,
    index : PropTypes.number
}

export default CampaignDetails