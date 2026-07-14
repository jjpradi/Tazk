import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material'
import React from 'react'
import { FormikProvider, useFormik, Form } from "formik";
import * as Yup from "yup"; // CUSTOM COMPONENTS
import { updateDefaultLocation } from 'redux/actions/stock_Location_actions';
import { useDispatch } from 'react-redux';

export default function DefaultLocationAlert(props) {
    const dispatch = useDispatch();
    const { open, handleClose, location_data, locations } = props

    const initialValues = {
        defaultLocation: "",
    };


    const validationSchema = Yup.object({
        defaultLocation: Yup.string()
            .required("Location is Required!"),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: () => {
            let values = { ...formik.values };
            let data = {
                defaultLocation_id: location_data.location_id,
                newLocation_id: values.defaultLocation,
                default_location_type_id: location_data.location_type
            };
            dispatch(updateDefaultLocation(data));
            handleClose()
        },
    });

    const {
        values,
        errors,
        handleChange,
        handleBlur,
        touched,
        setFieldValue,
        handleSubmit,
        getFieldProps,
        resetForm,
    } = formik;

    return (
        <div>
            <Dialog
                open={open}
                // onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="xl"
            >
                <DialogTitle id="defaultlocationalert-dialog-title">
                    {"Manage Default Location Type :"}
                </DialogTitle>
                <FormikProvider value={formik}>
                    <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                        <DialogContent>
                            <DialogContentText id="defaultlocationalert-dialog-description">
                            <strong>SELECT</strong>(or) <strong>CREATE</strong> another Location to set LOCATION TYPE as DEFAULT LOCATION 
                                <br></br>
                                <br></br>
                                <br></br>
                            </DialogContentText>
                            <DialogContentText id="defaultlocationalert-dialog-description-2">
                                <Autocomplete
                                    id="defaultlocationalert-combo-71"
                                    value={
                                        values?.defaultLocation ? locations.find((f) => f.location_id === values.defaultLocation) : null
                                    }
                                    name="defaultLocation"
                                    fullWidth
                                    required
                                    options={locations.filter(d => d.locationTypeName !== 'Default Location')}
                                    getOptionLabel={(option) => option.location_name}
                                    autoHighlight
                                    onBlur={handleBlur}
                                    onChange={(event, value) => {
                                        if (value === null) {
                                            setFieldValue("defaultLocation", "");
                                        } else {
                                            setFieldValue("defaultLocation", value.location_id);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            name="defaultLocation"
                                            label="Select Location"
                                            placeholder="Default Location"
                                            error={Boolean(touched.defaultLocation && errors.defaultLocation)}
                                            helperText={touched.defaultLocation && errors.defaultLocation}
                                        />
                                    )}
                                />
                            </DialogContentText>

                        </DialogContent>

                        <DialogActions>

                            <Button onClick={() => handleClose()}>Close</Button>
                            {locations.length > 1 && (
                                <Button onClick={handleSubmit} autoFocus>Delete</Button>
                            )}
                        </DialogActions>
                    </Form >
                </FormikProvider>
            </Dialog>
        </div>
    )
}
