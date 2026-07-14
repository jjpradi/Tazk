import React, { useState, useEffect, useContext } from "react";
import _ from "lodash";
import {
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {departmentListAction, designationAction} from 'redux/actions/userCreation_actions';
import {
  getEventNameAction,
  getUserRoleAction,
} from 'redux/actions/userRole_actions';
import {allListStockLocation} from 'redux/actions/stock_Location_actions';
import {listEmployeeCategoryAction} from 'redux/actions/shifts.actions';
import apiCalls from 'utils/apiCalls';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../../../../context/CreateNewButtonContext';

const UploadFields = ({
  open,
  onClose,
  excelData,
  userBulkinsert,
  allClose,
}) => {
  let dispatch = useDispatch();

const designation = useSelector((state) => state.UserRoleReducer.designation);
const employeeCategoryList = useSelector((state) => state.ShiftsReducer.employeeCategoryList);
 
  const stocklocation = useSelector(
    (state) => state.stockLocationReducer.allliststocklocation,
  );
  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(context);


  const [updatedData, setUpdatedData] = useState({});
  const [currentRow, setCurrentRow] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  // Initialize formValues for the first employee
  const currentEmployeeId = excelData[currentRow]?.id || currentRow;
  const initialFormValues = updatedData[currentEmployeeId] || {
    designation: "",
    primary_location: null,
    location_id: [],
    category_id: null,
  };
  const [formValues, setFormValues] = useState(initialFormValues);

useEffect(() => { (async () => {
  const fetchData = async () => {
    const data = {
      type: 'LIST_CATEGORY',
    };

    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(departmentListAction()),
      dispatch(designationAction()),
      dispatch(allListStockLocation()),
      dispatch(listEmployeeCategoryAction(data))
    );
  };

  fetchData();
})();
}, []);


  useEffect(() => {
    // Load existing form values or initialize new
    const employeeId = excelData[currentRow]?.id || currentRow;
    setFormValues(updatedData[employeeId] || initialFormValues);
  }, [currentRow, updatedData]);

  const handleSave = () => {
    const employeeId = excelData[currentRow]?.id || currentRow;
    setUpdatedData((prev) => ({ ...prev, [employeeId]: formValues }));
  };

  const handleSubmit = () => {
    const mergedData = excelData.map((row, index) => ({
      ...row,
      ...updatedData[row.id || index], // Merge with saved form data
    }));
    userBulkinsert(mergedData);
    onClose();
    allClose();
  };

  const handleNext = () => {
    handleSave();
    if (currentRow < excelData.length - 1) {
      setCurrentRow((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    handleSave();
    if (currentRow > 0) {
      setCurrentRow((prev) => prev - 1);
    }
  };

  const validationHandler = (name, value) => {
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? null : `${name.replace("_", " ")} is required!`,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    validationHandler(name, value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle align="center">Please select from below</DialogTitle>
      <DialogContent>
        {excelData.length > 0 && (
          <Typography sx={{ mb: 2, fontWeight: "bold", fontSize: "18px" }}>
            Employee Name: {excelData[currentRow]?.first_name}{" "}
            {excelData[currentRow]?.last_name}
          </Typography>
        )}
        <Grid container spacing={3}>
          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              value={
                designation.find((f) => f.designation === formValues.designation) || {
                  designation: formValues.designation || "",
                }
              }
              freeSolo
              onChange={(event, newValue) => {
                const selectedDesignation = newValue?.designation || event.target.value;
                setFormValues((prevValues) => ({
                  ...prevValues,
                  designation: selectedDesignation,
                }));
              }}
              options={_.uniqBy(designation, "id")}
              getOptionLabel={(option) => option.designation || ""}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Designation" variant="filled" />
              )}
            />
          </Grid>

          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              value={
                formValues.category_id
                  ? employeeCategoryList.find((f) => f.id === formValues.category_id)
                  : { category_name: "" }
              }
              onChange={(event, newValue) => {
                setFormValues((prevValues) => ({
                  ...prevValues,
                  category_id: newValue?.id,
                }));
              }}
              options={_.uniqBy(employeeCategoryList, "id")}
              getOptionLabel={(option) => option.category_name || ""}
              fullWidth
              renderInput={(params) => <TextField {...params} label="Employee Category" variant="filled" />}
            />
          </Grid>

          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              multiple
              fullWidth
              value={formValues.location_id || []}
              onChange={(event, newValue) => {
                setFormValues((prevValues) => ({
                  ...prevValues,
                  location_id: newValue || [],
                  primary_location: newValue?.[0] || null, // Auto-set primary location
                }));
              }}
              options={_.uniqBy(stocklocation, "location_name")}
              getOptionLabel={(option) => option.location_name || ""}
              renderInput={(params) => <TextField {...params} label="Location" variant="filled" />}
            />
          </Grid>

          <Grid
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              fullWidth
              value={formValues.primary_location || null}
              onChange={(event, newValue) => {
                setFormValues((prevValues) => ({
                  ...prevValues,
                  primary_location: newValue || null,
                }));
              }}
              options={_.uniqBy(formValues.location_id, "location_name")}
              getOptionLabel={(option) => option.location_name || ""}
              renderInput={(params) => <TextField {...params} label="Primary Location" variant="filled" />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error" variant="contained">
          Close
        </Button>
        {currentRow !== 0 && <Button onClick={handlePrevious}>Previous</Button>}
        {currentRow < excelData.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UploadFields;
