import React, { useContext, useEffect, useState } from "react";
import { TextField, Button, Grid, Typography, Checkbox, Autocomplete, Card, Divider, FormControlLabel, FormGroup, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { createIncentiveForSalesmanAction, updateSalesmanIncentiveAction } from "redux/actions";
import moment from "moment";
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import context from "context/CreateNewButtonContext";
import { createPlanAction, getAllPlansAction, getPlanBenefitsAction, getPlanTypeAction, getStatusAction, getTrainingTypeAction, updatePlanAction } from "redux/actions/clientSubscription_action";
import { listStockLocationAction } from "redux/actions/stock_Location_actions";
import apiCalls from 'utils/apiCalls';

function NewPlan({ handleClose, edit_id_data , status}) {
  const dispatch = useDispatch();

  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    locationId,
    headerLocationId,
    commoncookie,
  } = useContext(context);


  const {
    ClientSubscriptionReducer: { createPlan, updatePlan, getStatus, getPlanType ,getPlanBenefits,getTrainingType},
    stockLocationReducer: { stocklocation }
  } = useSelector((state) => state);
console.log(getPlanBenefits,"getPlanBenefits")
  const [ formValues, setFormValues ] = useState({
    Subscription_Name: "",
    plan_type: [],
    StartDate: "",
    EndDate: "",
    status: "",
    Plan_Price:"",
    Benefits: [],
    Users_Allowed: "",
    Training_Days: [],
    Time_Slot: "",
    location_id: "",
    Training_Type: [],
    Notes: "",
    TermsAndCondition: "",
  });
console.log(formValues,"formValues")
  const [ formErrors, setFormErrors ] = useState({});
  const [ open, setOpen ] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState([]);

  const requiredFields = [
    "Subscription_Name",
    "plan_type",
    "status",
    "Plan_Price",
    "Users_Allowed",
    "Time_Slot",
    "location_id",
    "Training_Days",
    "Training_Type"
  ];

  const trainingDaysOptions = [ 
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
    { id: 7, name: "Sunday" }
  ];

  const timeSlotOptions = [
    { id: 1, name: "Morning" },
    { id: 2, name: "Afternoon" },
    { id: 3, name: "Evening" }
  ];

  useEffect(() => {
    dispatch(getPlanTypeAction());
    dispatch(getStatusAction());
    dispatch(getPlanBenefitsAction());
    dispatch(getTrainingTypeAction());
        if (!stocklocation.length) {
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(listStockLocationAction(commoncookie, headerLocationId))
          )
        }
  }, [ dispatch ])

  useEffect(() => {
    if (Array.isArray(getPlanBenefits)) {
      setFormValues((prev) => ({
        ...prev,
        Benefits: prev.Benefits.length > 0 ? prev.Benefits : [],
      }));
    }
  }, [getPlanBenefits]);
  useEffect(() => {
    if (status === "edit" && edit_id_data && Array.isArray(getPlanBenefits)) {
      const benefitIds = Array.isArray(edit_id_data.benefits)
        ? edit_id_data.benefits
        : typeof edit_id_data.benefits === "string"
          ? edit_id_data.benefits.split(",").map(Number)
          : typeof edit_id_data.benefits === "number"
            ? [ edit_id_data.benefits ]
            : [];
      const matchedBenefits = getPlanBenefits.filter((b) =>
        benefitIds.includes(b.id)
      );
      console.log(matchedBenefits, "matchedBenefits")
      setFormValues((prevValues) => ({
        ...prevValues,
        Subscription_Name: edit_id_data?.Subscription_Name || "",
        plan_type: edit_id_data.plan_type_id || "",
        StartDate: edit_id_data?.StartDate || "",
        EndDate: edit_id_data?.EndDate || "",
        status: edit_id_data.status_id || "",
        Plan_Price: edit_id_data.Plan_Price || "",
        Benefits:matchedBenefits,
        Users_Allowed: edit_id_data?.Users_Allowed || "",
        Training_Days: edit_id_data?.Training_Days ? JSON.parse(edit_id_data.Training_Days) : [],
        Time_Slot: edit_id_data?.Time_Slot || "",
        location_id:stocklocation.find((loc) => loc.location_id === edit_id_data.Location_id) || null,
        Training_Type: edit_id_data?.training_types || [],
        Notes: edit_id_data?.Notes || "",
        TermsAndCondition: edit_id_data?.TermsAndCondition || "",
      }));
    }
  }, [status, edit_id_data, stocklocation]);


  const validationHandler = (name, value) => {
    let errors = { ...formErrors };

    if (requiredFields.includes(name) && (!value || value.toString().trim() === "")) {
      errors[ name ] = `${name.replace(/_/g, " ")} is required!`;
    } else {
      delete errors[ name ];
    }

    setFormErrors(errors);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log(`Updating ${name}:`, value);
    setFormValues((prevValues) => ({ ...prevValues, [ name ]: value }));

    validationHandler(name, value);
  };


  const handleDateChange = (field, date) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[ 0 ];
      setFormValues((prev) => ({
        ...prev,
        [ field ]: formattedDate,
      }));
      validationHandler(field, date) ;
    }
  };


  const handleSubmit = async () => {
    console.log("Form Values before submission");

    let errors = {};
    const requiredFields = [
      "Subscription_Name",
      "plan_type",
      "status",
      "Plan_Price",
      "Users_Allowed",
      "location_id",
      "Time_Slot",
      "Training_Days",
      "Training_Type"
    ];

    requiredFields.forEach((field) => {
      const value = formValues[ field ];
      if (!value || (typeof value === "string" && value.trim() === "") || (Array.isArray(value) && value.length === 0)) {
        errors[ field ] = `${field.replace(/_/g, " ")} is required!`;
      }
    });
    if (Object.keys(errors).length > 0) {
      console.log("Validation Errors:", errors);
      setFormErrors(errors);
      return;
    }
    try {
      const payload = {
        Subscription_Name: formValues.Subscription_Name,
        plan_type: formValues.plan_type,
        StartDate: formValues.StartDate,
        EndDate: formValues.EndDate,
        status: formValues.status,
        Plan_Price: formValues.Plan_Price,
        Benefits: formValues.Benefits,
        Users_Allowed: formValues.Users_Allowed,
        Training_Days:formValues.Training_Days,
        Time_Slot: formValues.Time_Slot,
        location_id: formValues.location_id,
        Training_Type:formValues.Training_Type,
        Notes:formValues.Notes,
        TermsAndCondition: formValues.TermsAndCondition,
        
    }

      console.log(status,"status")
        if (status === "edit" && edit_id_data?.id) {
          let id = edit_id_data.id;
          console.log("Updating Payload:", payload,id);
          await dispatch(updatePlanAction(edit_id_data?.id, payload));
        } else {
          console.log("Creating Payload:", payload);
          await dispatch(createPlanAction(payload));
        }
      
        await dispatch(getAllPlansAction());
        handleClose?.();
      } catch (error) {
        console.error("error submitting form:", error);
      }
  };

  const setStateHandler = (name, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [ name ]: value === "" ? null : value
    }));
    validationHandler(name, value);
  };

  const handleCloseModal = () => {
    if (handleClose) {
      handleClose();
    }
  };

  return (
    <Card sx={{ padding: 3, height: 'calc(100vh - 80px)' }}>
      <Typography variant="h6" gutterBottom sx={{ paddingBottom: 2 }}>
        Basic Subscription Details
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <TextField
            required
            fullWidth
            label="Plan Name"
            name="Subscription_Name"
            value={formValues.Subscription_Name || ""}
            onChange={handleInputChange}
            variant="filled"
            error={!!formErrors.Subscription_Name}
            helperText={formErrors.Subscription_Name || ""}
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <Autocomplete
            id="plan_type"
            options={getPlanType || []}
            getOptionLabel={(option) => option.plan_type || ""}
            value={getPlanType.find((type) => type.id === formValues.plan_type) || null}
            onChange={(e, val) => handleInputChange({target: {name: 'plan_type', value: val?.id || null}})}
            renderInput={(params) => <TextField required {...params} label="Plan Type" variant="filled" error={!!formErrors.plan_type}
            helperText={formErrors.plan_type || ""} />}
          />

        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              label="Plan Avail Start Date"
              value={formValues.StartDate ? new Date(formValues.StartDate) : null}
              onChange={(date) => handleDateChange("StartDate", date)}
              slotProps={{ textField: { fullWidth: true, variant: "filled", error: !!formErrors.StartDate, helperText: formErrors.StartDate || "" } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              label="Plan Avail End Date"
              value={formValues.EndDate ? new Date(formValues.EndDate) : null}
              onChange={(date) => handleDateChange("EndDate", date)}
              slotProps={{ textField: { fullWidth: true, variant: "filled", error: !!formErrors.EndDate, helperText: formErrors.EndDate || "" } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <Autocomplete
            id="status"
            name='status'
            options={getStatus || []}
            getOptionLabel={(option) => option.status || ""}
            value={getStatus.find((s) => s.id === formValues.status) || null}
            onChange={(e, val) => handleInputChange({target: {name: 'status', value: val?.id || null}})}
            renderInput={(params) => <TextField required {...params} label="Status" variant="filled" error={!!formErrors.status}
            helperText={formErrors.status || ""} />}
          />

        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <TextField
            required
            fullWidth
            type="number"
            label="Price"
            name="Plan_Price"
            value={formValues.Plan_Price || ""}
            onChange={handleInputChange}
            variant="filled"
            error={!!formErrors.Plan_Price}
            helperText={formErrors.Plan_Price || ""}
          />
        </Grid>

        {/* End Date */}
        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              label="Plan Avail End Date"
              value={formValues.EndDate ? new Date(formValues.EndDate) : null}
              onChange={(date) => handleDateChange("EndDate", date)}
              slotProps={{ textField: { fullWidth: true, variant: "filled", error: !!formErrors.EndDate, helperText: formErrors.EndDate || "" } }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom sx={{ paddingBottom: 2 }}>
        Subscription Benefits
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid size={3}>
          <TextField
            required
            fullWidth
            type="number"
            label="Client Allowed"
            name="Users_Allowed"
            value={formValues.Users_Allowed}
            onChange={handleInputChange}
            variant="filled"
            error={!!formErrors.Users_Allowed}
            helperText={formErrors.Users_Allowed || ""}
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 6,
            xs: 12
          }}>
          <Autocomplete
            id="benefits"
            name='Benefits'
            options={Array.isArray(getPlanBenefits) ? getPlanBenefits : []}
            getOptionLabel={(option) => option.benefits || ""}
            value={
              (Array.isArray(getPlanBenefits) ? getPlanBenefits : []).find(
                (type) => type.id === formValues.Benefits
              ) || null
            }
            onChange={(e, val) =>
              handleInputChange({ target: { name: 'Benefits', value: val?.id || null } })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Benefits"
                variant="filled"
                error={!!formErrors.Benefits}
                helperText={formErrors.Benefits || ""}
              />
            )}
          />
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom sx={{ paddingBottom: 2 }}>
        Training & Schedule Preferences
      </Typography>
      <Grid container spacing={2} alignItems="center">

        <Grid size={9}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>Training Days:</Typography>
          <FormGroup row sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {trainingDaysOptions.map((day) => (
              <FormControlLabel
              key={day.id}
              control={
                <Checkbox
                  checked={Array.isArray(formValues.Training_Days) && formValues.Training_Days.includes(parseInt(day.id, 10))}
                  onChange={(e) => {
                    const prevDays = Array.isArray(formValues.Training_Days) ? formValues.Training_Days : [];
            
                    const updatedDays = e.target.checked
                      ? [...prevDays, parseInt(day.id, 10)]
                      : prevDays.filter((id) => id !== parseInt(day.id, 10));
            
                    setFormValues({ ...formValues, Training_Days: updatedDays });
                  }}
                  sx={{ padding: "2px" }}
                />
              }
              label={<Typography variant="body2">{day.name}</Typography>}
              sx={{ margin: 0 }}
            />
            
            ))}
          </FormGroup>
          </Box>
        </Grid>

        <Grid size={3}>
          <Autocomplete
            id="Time_Slot"
            options={timeSlotOptions}
            name='Time_Slot'
            getOptionLabel={(option) => option.name}
            value={timeSlotOptions.find((slot) => slot.id === formValues.Time_Slot) || null}
            onChange={(e, val) => handleInputChange({target: {name: 'Time_Slot', value: val?.id || null}})}
            renderInput={(params) => <TextField required {...params} label="Time Slot" variant="filled"  error={!!formErrors.Time_Slot}
            helperText={formErrors.Time_Slot || ""}/>}
          />
        </Grid>

       <Grid
         size={{
           lg: 3,
           md: 6,
           xs: 12
         }}>
          <Autocomplete
            id="training_type"
            name='Training_Type'
            options={getTrainingType || []}
            getOptionLabel={(option) => option.training_type || ""}
            value={getTrainingType.find((type) => type.id === formValues.Training_Type) || null}
            onChange={(e, val) => handleInputChange({target: {name: 'Training_Type', value: val?.id || null}})}
            renderInput={(params) => 
              <TextField 
              required
                {...params} 
                label="Training Type" 
                variant="filled" 
                error={!!formErrors.Training_Type}
                helperText={formErrors.Training_Type || ""} 
              />
            }
          />
 
        </Grid>

        <Grid size={3}>
          <Autocomplete
            fullWidth
            value={formValues.location_id || null} 
            name="location_id"
            onChange={(event, newValue) => {
              setFormValues((prevValues) => ({
                ...prevValues,
                location_id: newValue ? {
                  location_id: newValue.location_id,
                  location_name: newValue.location_name
                } : null,
              }));

              validationHandler("location_id", newValue);
            }}
            id="location-autocomplete"
            options={_.uniqBy(stocklocation, "location_name").filter(
              (d) => !(formValues.location_id && formValues.location_id.location_id === d.location_id)
            )}
            getOptionLabel={(option) => option.location_name || ""}
            renderInput={(params) => (
              <TextField required
                {...params}
                variant="filled"
                onBlur={handleInputChange}
                label="Location"
                error={!!formErrors.location_id}
              helperText={formErrors.location_id || ""}
              />
            )}
          />
        </Grid>

      </Grid>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Other Options
      </Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Notes"
            name="Notes"
            value={formValues.Notes || ""}
            onChange={handleInputChange}
            error={!!formErrors.Notes}
            helperText={formErrors.Notes || ""}
            multiline
            rows={4}
            variant="outlined"
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Terms and Conditions"
            name="TermsAndCondition"
            value={formValues.TermsAndCondition || ""}
            onChange={handleInputChange}
            error={!!formErrors.TermsAndCondition}
            helperText={formErrors.TermsAndCondition || ""}
            multiline
            rows={4}
            variant="outlined"
          />
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
        <Grid>
          <Button variant="contained" color="secondary" size="small" onClick={handleCloseModal}>
            Cancel
          </Button>
        </Grid>
        <Grid>
          <Button variant="contained" color="primary" size="small" onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Card>
  );

};
export default NewPlan;
