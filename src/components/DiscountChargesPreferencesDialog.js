import { Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, IconButton, Radio, RadioGroup, Switch, TextField, Typography } from "@mui/material"
import CreateNewButtonContext from "context/CreateNewButtonContext"
import { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAppConfigDataAction, updateAppConfigWithCompanyInfoAction } from "redux/actions/app_config_actions"

function DiscountChargesPreferencesDialog(){

    const dispatch = useDispatch()
    const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext)
    const {
        appConfigReducer: { app_config_data }
    } = useSelector(state => state)

    const [formValues, setFormValues] = useState({
        discount: 'No Discount',
        shippingCharges: "false",
        otherCharges: "false",
    })
    const [tempFormValues, setTempFormValues] = useState({
        discount: 'No Discount',
        shippingCharges: "false",
        otherCharges: "false",
    })

    useEffect(() => {
        const discount = app_config_data.find(d => d.key_name === 'company.saleDiscount')?.value ?? 'No Discount'
        const shippingCharges = app_config_data.find(d => d.key_name === 'company.applyShippingCharges')?.value ?? 'false'
        const otherCharges = app_config_data.find(d => d.key_name === 'company.applyOtherCharges')?.value ?? 'false'

        setFormValues((prev) => ({ ...prev, discount, shippingCharges, otherCharges }))
        setTempFormValues((prev) => ({ ...prev, discount, shippingCharges, otherCharges }))
    }, [app_config_data])

    const handleSubmit = () => {
        const payload = {
            'company.saleDiscount': formValues.discount,
            'company.applyShippingCharges': formValues.shippingCharges,
            'company.applyOtherCharges': formValues.otherCharges,
            type: 'salePreferences'
        }
        dispatch(updateAppConfigWithCompanyInfoAction(payload, async(response) => {
            if(response){
                dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler, async(response) => {
                    const res = await response
                    const discount = res.find(d => d.key_name === 'company.saleDiscount')?.value ?? 'No Discount'
                    const shippingCharges = res.find(d => d.key_name === 'company.applyShippingCharges')?.value ?? 'false'
                    const otherCharges = res.find(d => d.key_name === 'company.applyOtherCharges')?.value ?? 'false'

                    setFormValues((prev) => ({ ...prev, discount, shippingCharges, otherCharges }))
                    setTempFormValues((prev) => ({ ...prev, discount, shippingCharges, otherCharges }))
                }))
            }
        }))
    }

    return (
        <Grid sx={{ padding: '20px' }} container spacing={3}>
            <Grid size={12}>
                <Grid container spacing={3} display='flex' justifyContent='space-between'>
                    <Grid>
                        <Typography variant='h6'>Sales Transaction Preferences</Typography>
                    </Grid>

                    <Grid>
                        <Grid container spacing={3} display='flex' justifyContent='flex-end'>
                            <Grid>
                                <Button variant='contained' color='error' disabled={JSON.stringify(formValues) === JSON.stringify(tempFormValues)} onClick={() => setFormValues((prev) => ({ ...prev, ...tempFormValues }))}>
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid>
                                <Button variant='contained' disabled={JSON.stringify(formValues) === JSON.stringify(tempFormValues)} onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {/* <Grid size={12}>
                <Typography variant='h6'>Discount Preferences</Typography>
            </Grid> */}
            <Grid size={12}>
                <FormControl>
                    <FormLabel>Would you like to add a discount?</FormLabel>
                    <RadioGroup value={formValues.discount} row onChange={(event) => setFormValues((prev) => ({ ...prev, discount: event.target.value }))}>
                        <FormControlLabel value='No Discount' control={<Radio />} label='No Discount' />
                        <FormControlLabel value='At Item Level' control={<Radio />} label='At Item Level' />
                        <FormControlLabel value='At Transaction Level' control={<Radio />} label='At Transaction Level' />
                    </RadioGroup>
                </FormControl>
            </Grid>
            {/* <Grid size={12}>
                <Typography variant='h6'>Additional Charges</Typography>
            </Grid> */}
            <Grid size={12}>
                <FormControl>
                    <FormLabel>Select Additional Charges</FormLabel>
                    <FormGroup>
                        <FormControlLabel
                            label='Shipping Charges'        
                            control={<Checkbox checked={formValues.shippingCharges === "true"} onChange={(event) => setFormValues((prev) => ({ ...prev, shippingCharges: `${event.target.checked}` }))} />}
                        />
                        <FormControlLabel
                            label='Other Charges'
                            control={<Checkbox checked={formValues.otherCharges === "true"} onChange={(event) => setFormValues((prev) => ({ ...prev, otherCharges: `${event.target.checked}` }))} />}
                        />
                    </FormGroup>
                </FormControl>
            </Grid>
        </Grid>
    );
}

DiscountChargesPreferencesDialog.propTypes = {

}

export default DiscountChargesPreferencesDialog