import { Autocomplete, Button, Card, Grid, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { additionalContactsAction, getAllLeadAccountsAction } from "redux/actions/leadManagement_actions";
import PropTypes from "prop-types"

function SelectAccount(props){

  const {handleAccountSelect, closeDialog,accErr,setAccErr} = props

  const dispatch = useDispatch()
  const {
    leadManagementReducers: {getAllAccounts}
} = useSelector((state) => state)
console.log(getAllAccounts,"getAllAccounts")
  
  const[selectedAccount, setSelectedAccount] = useState(null)
  const[err, setErr] = useState(false)

  const HandleAccount = (value)=>{

    if(value === null){
      console.log(accErr,err,'eruuuhh',value)
      setErr(true)
      setSelectedAccount(value)
      return;
    }
    setAccErr(false)
    setErr(false)
    setSelectedAccount(value)

    dispatch(additionalContactsAction(value.lead_id));
  }

  useEffect(() => {
    dispatch(getAllLeadAccountsAction())
  }, [])


  return (
    <Card sx={{p: 3}}>
      <Grid container spacing={3}>
        <Grid
          size={{
            lg: 12,
            sm: 12,
            md: 12,
            xs: 12
          }}>
          <Typography>Select Account</Typography>
        </Grid>

        <Grid
          size={{
            lg: 12,
            sm: 12,
            md: 12,
            xs: 12
          }}>
          <Autocomplete 
              options = {getAllAccounts}
              getOptionLabel = {(option) => option.contactPersonLastName !== null && option.contactPersonLastName !== '' ? `${option.contactPersonFirstName} ${option.contactPersonLastName} - ${option.company_name}` : `${option.contactPersonFirstName} - ${option.company_name}`}
              value = {selectedAccount}
              onChange = {(event, value) => HandleAccount(value)}
              renderInput = {(params) => (
                  <TextField 
                      {...params}
                      required
                      fullWidth
                      label = 'Select Account'
                      variant = 'filled'
                      error={err || accErr}
                      helperText={(err || accErr) ? 'Account is required' : ''}
                  />
              )}
          />
        </Grid>

        <Grid
          size={{
            lg: 12,
            sm: 12,
            md: 12,
            xs: 12
          }}>
          <Grid container spacing={3} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button variant="contained" color='error' onClick={closeDialog}>Cancel</Button>
            </Grid>
            <Grid>
              <Button variant="contained" onClick={() => handleAccountSelect(selectedAccount)}>Select</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );

}

SelectAccount.propTypes = {
  handleAccountSelect: PropTypes.func,
  closeDialog: PropTypes.func
}

export default SelectAccount