import React, { useEffect, useState } from "react";
import { Card, Grid, Typography, TextField, Autocomplete, Button, Box } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { 
  deleteMappedClientsAction, 
  getAllPlansAction, 
  getAllSchedulePlanAction, 
  getClientsAction, 
  schedulePlanAction, 
  updateMappedClientsAction, 
  updateScheduledPlanAction 
} from "redux/actions/clientSubscription_action";
import { getsessionStorage } from "pages/common/login/cookies";
import { cellStyle, maxHeight } from "utils/pageSize";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';

const SchedulePlans = ({ handleClose, status, edit_id_data }) => {
  const storage = getsessionStorage();
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState({
    Time_Slot: "",
    plan: null,
    clients: [],
    prevClients:[],
    prevPlan:null,
    start_date:"",
    end_date:""
  });
  const [errors, setErrors] = useState({});
  const [selectedPlanDetails, setSelectedPlanDetails] = useState([]);
  const {
    ClientSubscriptionReducer: { getAllPlans, getClients },
  } = useSelector((state) => state);

  const timeSlotOptions = [
    { id: 1, name: "Morning" },
    { id: 2, name: "Afternoon" },
    { id: 3, name: "Evening" }
  ];

  useEffect(() => {
    dispatch(getAllPlansAction());
    dispatch(getClientsAction());

    if (status === "edit" && edit_id_data) {
      console.log("edit_id_data",edit_id_data)
      setFormValues({
        plan: edit_id_data.plan_id,
        clients: edit_id_data.employee_ids,
        prevClients: edit_id_data.employee_ids ? edit_id_data.employee_ids.split(",").map(id => Number(id)) : [],
        start_date:edit_id_data.start_date,
        end_date:edit_id_data.end_date
      });
    }
  }, [status]);

  const validateForm = () => {
    let newErrors = {};
    if (!formValues.Time_Slot) newErrors.plan = "Slot is required";
    if (!formValues.plan) newErrors.plan = "Plan is required";
    if (formValues.clients.length === 0) newErrors.clients = "At least one client must be selected"; 
    if (!formValues.start_date) newErrors.start_date = "Start Date is required";
    if (!formValues.end_date) newErrors.end_date = "End Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: field === "plan" 
      ? value?.id || "" 
      : value.map(client => client.employee_id) || [],
  }));
  setErrors((prev) => ({
    ...prev,
    [field]: value && value.length > 0 ? "" : `This field is required`,
  }));
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      mappedPlans: formValues.clients.map(clientId => ({
        company_id: storage.company_id,
        employee_id: clientId, 
        plan_id: formValues.plan,
        start_date:formValues.start_date,
        end_date:formValues.end_date
      })),
    };

    const data = {
      plan: formValues.plan,
      prevClients:formValues.prevClients,
      clients:formValues.clients,
      start_date:formValues.start_date,
      end_date:formValues.end_date
    }

    const refreshSchedulePlans = () => {
      dispatch(getAllSchedulePlanAction());
  };

    if (status === "edit") {
      dispatch(updateMappedClientsAction(data))
        .then(() => {
          refreshSchedulePlans()
          handleClose();
        })
        .catch((error) => {
          console.error("Error updating plan:", error);
          alert("Failed to update plan.");
        });
    } else {
      dispatch(schedulePlanAction(payload))
        .then(() => {
          alert("Plan scheduled successfully!");
          refreshSchedulePlans()
          setFormValues({ plan: null, clients: null , start_date: "", end_date: "" });
          handleClose();
        })
        .catch((error) => {
          alert("Failed to save plan.");
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log(`Updating ${name}:`, value);
    setFormValues((prevValues) => ({ ...prevValues, [ name ]: value }));
  };

  const handleDateChange = (field, date) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      setFormValues((prev) => ({
        ...prev,
        [field]: formattedDate,
      }));

      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
  
      if (field === "start_date" && formValues.plan) {
        const selectedPlan = getAllPlans.find(plan => plan.id === formValues.plan);
  
        if (selectedPlan) {
          let endDate = new Date(date);
          switch (selectedPlan.plan_type) {
            case "Monthly":
              endDate.setMonth(endDate.getMonth() + 1);
              break;
            case "Quarterly":
              endDate.setMonth(endDate.getMonth() + 3);
              break;
            case "Yearly":
              endDate.setFullYear(endDate.getFullYear() + 1);
              break;
            default:
              break;
          }
  
          setFormValues((prev) => ({
            ...prev,
            end_date: endDate.toISOString().split("T")[0],
          }));
        }
      }
    }
  };
  

  const handlePlanChange = (event, newValue) => {
    if (newValue) {
      setFormValues((prev) => ({ ...prev, plan: newValue.id }));
  
      const planDetails = [
        { name: "Plan Name", value: newValue.Subscription_Name },
        { name: "Plan Type", value: newValue.plan_type },
        { name: "Users Allowed", value: newValue.Users_Allowed },
        { name: "Price", value: newValue.Plan_Price || "N/A" },
      ];
  
      setSelectedPlanDetails(planDetails);
      console.log("Updated Plan Details:", planDetails);
    } else {
      setSelectedPlanDetails([]);
    }
  };

  return (
    <Card sx={{ p: 5, overflow: "auto", height: 'calc(100vh - 80px)' }}>
      <Typography variant="h6" gutterBottom style={{ paddingBottom: "20px" }}>Schedule Plan</Typography>
      <Grid container spacing={2}>
  {/* Left Column: Form Fields */}
  <Grid
    size={{
      lg: 6,
      md: 12,
      xs: 12
    }}>
    {/* Plan Name */}
    <Grid container spacing={2} alignItems="center"  sx={{ mb: 3 }}>
      <Grid
        size={{
          lg: 4,
          md: 4,
          xs: 12
        }}>
        <Typography variant="body1">Select Slot:</Typography>
      </Grid>
            <Grid
              size={{
                lg: 8,
                md: 8,
                xs: 12
              }}>
                      <Autocomplete
                        id="Time_Slot"
                        options={timeSlotOptions}
                        name='Time_Slot'
                        getOptionLabel={(option) => option.name}
                        value={timeSlotOptions.find((slot) => slot.id === formValues.Time_Slot) || null}
                        onChange={(e, val) => handleInputChange({target: {name: 'Time_Slot', value: val?.id || null}})}
                        renderInput={(params) => <TextField required {...params} label="Time Slot" variant="filled"  error={!!errors.Time_Slot}
                        helperText={errors.Time_Slot}/>}
                      />
                    </Grid>
    </Grid>
    <Grid container spacing={2} alignItems="center"  sx={{ mb: 3 }}>
      <Grid
        size={{
          lg: 4,
          md: 4,
          xs: 12
        }}>
        <Typography variant="body1">Select Plan:</Typography>
      </Grid>
            <Grid
              size={{
                lg: 8,
                md: 8,
                xs: 12
              }}>
              <Autocomplete
                options={getAllPlans.filter(plan => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const startDate = new Date(plan.StartDate);
                  const endDate = new Date(plan.EndDate);
                  startDate.setHours(0, 0, 0, 0);
                  endDate.setHours(23, 59, 59, 999);

                  return today >= startDate && today <= endDate;
                })}
                getOptionLabel={(option) => option.Subscription_Name}
                value={getAllPlans.find(plan => plan.id === formValues.plan) || null}
                onChange={handlePlanChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    size="small"
                    fullWidth
                    error={!!errors.plan}
                    helperText={errors.plan}
                    onBlur={() => {
                      if (!formValues.plan) {
                        setErrors(prev => ({ ...prev, plan: "Plan is required" }));
                      }
                    }}
                  />
                )}
              />
            </Grid>
    </Grid>

    {/* Select Clients */}
    <Grid container spacing={2} alignItems="center"  sx={{ mb: 3 }}>
      <Grid
        size={{
          lg: 4,
          md: 4,
          xs: 12
        }}>
        <Typography variant="body1">Select Clients:</Typography>
      </Grid>
      <Grid
        size={{
          lg: 8,
          md: 8,
          xs: 12
        }}>
        <Autocomplete
          multiple
          options={getClients.filter(client => client.is_mapped === 0)}
          getOptionLabel={(option) => option.first_name}
          value={getClients.filter(client => (formValues.clients || []).includes(client.employee_id))}
          onChange={(event, newValue) => handleChange("clients", newValue)}
          renderInput={(params) => (
            <TextField {...params} variant="filled" size="small" fullWidth
              error={!!errors.clients} helperText={errors.clients}
              onBlur={() => {
                if (formValues.clients.length === 0) setErrors(prev => ({ ...prev, clients: "At least one client must be selected" }));
              }}
            />
          )}
        />
      </Grid>
    </Grid>

    {/* Start Date */}
    <Grid container spacing={2} alignItems="center"  sx={{ mb: 3 }}>
      <Grid
        size={{
          lg: 4,
          md: 4,
          xs: 12
        }}>
        <Typography variant="body1">Start Date:</Typography>
      </Grid>
      <Grid
        size={{
          lg: 8,
          md: 8,
          xs: 12
        }}>
        <LocalizationProvider dateAdapter={DateAdapter}>
          <DatePicker
            value={formValues.start_date ? new Date(formValues.start_date) : null}
            onChange={(date) => handleDateChange("start_date", date)}
            slotProps={{ textField: { fullWidth: true, variant: "filled", size: "small", error: !!errors.start_date, helperText: errors.start_date || "", onBlur: () => {
                  if (!formValues.start_date) setErrors(prev => ({ ...prev, start_date: "Start Date is required" }));
                } } }}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>

    {/* End Date */}
    <Grid container spacing={2} alignItems="center"  sx={{ mb: 3 }}>
      <Grid
        size={{
          lg: 4,
          md: 4,
          xs: 12
        }}>
        <Typography variant="body1">End Date:</Typography>
      </Grid>
      <Grid
        size={{
          lg: 8,
          md: 8,
          xs: 12
        }}>
        <LocalizationProvider dateAdapter={DateAdapter}>
          <DatePicker
            value={formValues.end_date ? new Date(formValues.end_date) : null}
            onChange={(date) => handleDateChange("end_date", date)}
            slotProps={{ textField: { fullWidth: true, variant: "filled", size: "small", error: !!errors.end_date, helperText: errors.end_date || "", onBlur: () => {
                  if (!formValues.end_date) setErrors(prev => ({ ...prev, end_date: "End Date is required" }));
                } } }}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  </Grid>

  {/* Right Column: Plan Details Table */}
  {selectedPlanDetails.length > 0 && (
    <Grid
      sx={{justifyContent: "center" }}
      size={{
        lg: 6,
        md: 12,
        xs: 12
      }}>
      <Table data={selectedPlanDetails} tableName="plan" />
    </Grid>
  )}
</Grid>
      <Grid display="flex" justifyContent="flex-end" gap={2} mt={2} size={12}>
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {status === "edit" ? "Update" : "Save"}
        </Button>
      </Grid>
    </Card>
  );
};

export default SchedulePlans;

function Table({data, tableName}) {

  console.log("sdfsf",data)
  const tableAccess = {
    'plan': {
      colName: 'Plan Details',
      rowName:'name',
      rowAmount:'value'
    }
  }

  if (!tableAccess[tableName]) {
    console.error(`Error: tableName "${tableName}" not found in tableAccess.`);
    return null; 
  }

  return (
    <Grid
      container
      style={{
        margin: '5px 8px',
        width: "100%",
        maxWidth: "400",
      }}
    >

      {
        data.length > 0 && 

        <table
        style={{
          border: '1px solid',
          fontSize:cellStyle.fontSize ,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '70%',
          paddingBottom: '10px'
          
        }}
      > 
        <thead>
          <tr>
            <th style={{ border: '1px solid', padding: '0px 5px'}}>Plan Detail</th>
            <th style={{ border: '1px solid', padding: '0px 5px' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td style={{ border: '1px solid', padding: '0px 5px' }}>{d.name}</td>
              <td style={{ border: '1px solid', padding: '0px 5px' }}>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      }
    
    </Grid>
  );
}