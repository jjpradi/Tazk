import { Autocomplete, Button, Container, Grid, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { OpenalertActions } from "redux/actions/alert_actions"
import { createAssetGroup, createAssetType, getAssetGroupIdAction, getAssetTypeIdAction } from "redux/actions/asset_actions"
import { requiredFieldsAlertMessage } from "utils/content"

function AssetTypeForm(props) {

    const dispatch = useDispatch()

    const[values, setValues] = useState({
        asset_group_id : null,
        AssetType: null
    })

    const[errors, setErrors] = useState({
        asset_group_id : null,
        AssetType: null
    })

    const [pagination] = useState({
      searchString:'',
      pageCount : 0,
      numPerPage : 5
  })

    const {
       
        AssetReducers:{getAssetGroup}, 
      } = useSelector((state)=> state)

    const handleChange = (val, name) => {
        if(val !== null && val !== ''){
            setValues({...values, [name]: val})
            setErrors({...errors, [name]: null})
        }
        else{
            setValues({...values, [name]: null})
            setErrors({...errors, [name]: name === 'assetType' ? 'Asset Type is Required' : 'Asset Group is Required'})
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let isValid = true
        let errorObj = {...errors}
        let required = ['AssetType','asset_group_id']

        await Object.keys(values).map((key, i) => {
            if(required.includes(key) && values[key] === null || values[key] === 'null' || values[key] === ''){
                isValid = false
                errorObj[key] = `${key} is Required!`
            }
            return null
        })

        setErrors(errorObj)

        if(isValid){
          const data = {
            id : values.asset_group_id.asset_group_id,
            assetType : values.AssetType
          }
            await dispatch(createAssetType(data,()=>{
             dispatch(getAssetTypeIdAction(pagination))
             props.setPagination(
              {
                searchString:'',
                pageCount : 0,
                numPerPage : 5
            }
             )

            }))
            props.handleClose()
        }
        else {
          dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

  

    useEffect(()=>{
      dispatch(getAssetGroupIdAction())
    },[])


    return (
      <>
        <Container sx={{p: 5}}>
          <Grid container spacing={5}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography variant='h6' align='left'>
                Add Asset Type
              </Typography>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
            <Autocomplete
                    // disablePortal
                    options={getAssetGroup?.data}
                    getOptionLabel={(option) => option.asset_group || ''}
                    onChange={(event, val) => handleChange(val, 'asset_group_id')}
                    // value={values.asset_group_id || null}
                    value={values.asset_group_id}
                    renderInput={(params) => (
                        <TextField
                          {...params}
                          label='Asset Group'
                          variant='filled'
                          // fullwidth
                          error={errors.asset_group_id === null ? false : true}
                          helperText={
                            errors.asset_group_id === null ? '' : 'Asset Group is Required'
                          }
                         
                          required={true}
                        />
                      )}
                
              />
         
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <TextField
                required
                fullWidth
                label='Asset Type'
                variant='filled'
                value={values.AssetType}
                onChange={(e) => handleChange(e.target.value, 'AssetType')}
                error={errors.AssetType === null ? false : true}
                helperText={
                  errors.AssetType === null ? '' : 'Asset Type is Required'
                }
              />
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container gap={2} display='flex' justifyContent='end'>
                <Grid>
                  <Button
                    variant='contained'
                    onClick={() => props.handleClose()}
                  >
                    Cancel
                  </Button>
                </Grid>

                <Grid>
                  <Button variant='contained' onClick={handleSubmit}>
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </>
    );

}

export default AssetTypeForm;