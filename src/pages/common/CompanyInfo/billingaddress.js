import React, { useState, useContext, useEffect } from "react";
import MaterialTable from "utils/SafeMaterialTable";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Typography
} from "@mui/material";
import { ExportCsv, ExportPdf } from "@material-table/exporters";
import Autocomplete from "@mui/material/Autocomplete";
import _ from "lodash";
import { Cities } from "../../../utils/cities";
import { Country } from "../../../components/Country_list";
import { getLocationDataBasedOnPincode } from "../../../components/common";
import context from "../../../context/CreateNewButtonContext";
import { useDispatch, useSelector } from "react-redux";
import apiCalls from "utils/apiCalls";
import { checkShortCodeExistAction, createSubcompanydetailsAction, deleteSubcompanydetailsAction, getSubcompanydetailsAction, updateSubcompanydetailsAction } from "redux/actions/app_config_actions";
import { emailValidation, gstValidation, phoneValidation } from "components/regexFunction";
import {getsessionStorage, updateSubCompany } from "pages/common/login/cookies";
import { UserRightsAuthorization } from "@crema/utility/helper/UserRightsHelper";

function BillingAddress() {
  const { setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(context);

  // Local data (instead of props)
  const [shippingData, setShippingData] = useState([]);
   const [deleteDilaog, setDeleteDialog] = useState(false);
   const [deleteid, setDeleteid] = useState('')

    const {
    appConfigReducer: { sub_company_details },
    rbacReducer: { menuAccess = {} }
  } = useSelector((state) => state);

  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const Company = storage?.company_type === 3 || storage?.company_type === 2;

  const billingAddressCreate = Company ? UserRightsAuthorization(menuAccess[selectedRole], "info__general", "can_create") : true;
  const billingAddressEdit = Company ? UserRightsAuthorization(menuAccess[selectedRole], "info__general", "can_edit") : true;
  const billingAddressDelete = Company ? UserRightsAuthorization(menuAccess[selectedRole], "info__general", "can_delete") : true;
  const billingAddressExport = Company ? UserRightsAuthorization(menuAccess[selectedRole], "info__general", "can_export") : true;

  const [formValues, setFormValues] = useState({
    company_name: "",
    address: "",
    area: "",
    pin_code: "",
    city: "",
    state: "",
    country: "India",
  });

  const [formErrors, setFormErrors] = useState({
    pin_code: null,
    phone_number: null,
    gst_in: null,
    email: null
  });
  const [shippingOpen, setShippingOpen] = useState(false);

  // Handle form changes
  const setStateHandler = (name, value) => {
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handlePincode = async (value, rowData, onRowDataChange) => {
    setFormErrors({ ...formErrors, pin_code: "" })

    if (value.length === 6) {
      const locationData = await getLocationDataBasedOnPincode(value);

      if (locationData) {
        const { district, state, country } = locationData;

        rowData.zip = value
        rowData.city = district;
        rowData.state = state;
        rowData.country = country;
        rowData.zip_error = null

        setFormValues((prev) => ({
          ...prev,
          pin_code: value,
          city: district,
          state: state,
          country: country,
        }));
        setFormErrors({ ...formErrors, pin_code: null });

        onRowDataChange(rowData);
      } else {
        setFormErrors({ ...formErrors, pin_code: "Pincode Not Found" });
      }
    }
    else {
      setFormValues((prev) => ({
          ...prev,
          pin_code: value,
          city: '',
          state: '',
          country: '',
      }))
      setFormErrors({ ...formErrors, pin_code: "Invalid Pincode!" });
    }
  };

  // Add new row
  const shippingApply = (row) => {
    setShippingData([...shippingData, row]);
    setShippingOpen(false);
  };


  // Edit row
  const handleEditSubmit = async(data) => {
    // const updated = [...shippingData];
    // updated[row.tableData.id] = row;
    // setShippingData(updated);
    delete data.company_name_error
    delete data.address_error
    delete data.tax_id_error
    delete data.zip_error
    delete data.email_error
    delete data.phone_number_error
    delete data.short_code_error
    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateSubcompanydetailsAction(data.sub_company_id, data, (res) =>{
       
        if(res === 200){
           initialCall()
        }
        // console.log('ressssssssssss', res)
      }))
    )
    setShippingOpen(false);
  };

  // Delete row
  const handleConfirmDelete = (id) => {
    // const updated = shippingData.filter((_, index) => index !== rowId);
    // setShippingData(updated);
    setDeleteid(id);
    setDeleteDialog(true)
  };

  const DeleteClose = () =>{
     setDeleteDialog(false)
  }

  const handleDelete = async(id) =>{
    await apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(deleteSubcompanydetailsAction(id, (res) =>{
              initialCall()
          }))
    )
     setDeleteDialog(false)
  }

  const initialCall = async() =>{
     const body = {
      pageCount: 'numPerPage',
      searchString: '',
      headerLocationId: headerLocationId
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getSubcompanydetailsAction(body, (response) => {
        if(response.status === 200) {
          updateSubCompany(response.data.length)
        }
      }))
    )

  }
  useEffect(()=>{
     initialCall()
  },[])

  const handleCreate = (data) =>{
    delete data.company_name_error
    delete data.address_error
    delete data.tax_id_error
    delete data.zip_error
    delete data.email_error
    delete data.phone_number_error
    delete data.short_code_error
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(createSubcompanydetailsAction(data, (res) =>{
        if(res === 200){
         initialCall()
        }
        // console.log('ressssssssssss', res)
      }))
    )
  }

  return (
    <>

      <Dialog open={deleteDilaog}>
            <DialogContent style={{ width : 500 }}>
                <DialogContentText>
                    Are you sure want to delete Billing Company
                </DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button variant='contained' color='success'  onClick = {DeleteClose}>Cancel</Button>
                <Button variant='contained' color='error' onClick = {() =>{handleDelete(deleteid)}} >Delete</Button>
            </DialogActions>
        </Dialog>
      <div style={{ width: "100%", margin: "10px 0" }}>
        <MaterialTable
          title={<Typography variant="h6">Additional bill company</Typography>}
          data={sub_company_details || []}
          options={{
            exportButton: billingAddressExport,
            actionsColumnIndex: -1,
            pageSizeOptions: [5, 10, 50],
            exportMenu:  billingAddressExport ? [
              {
                label: "Export PDF",
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, "BillingAddress"),
              },
              {
                label: "Export CSV",
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, "BillingAddress"),
              },
            ] : [],
          }}
          actions={[
            // {
            //   icon: "add",
            //   tooltip: "Add",
            //   isFreeAction: true,
            //   onClick: () => {
            //     setFormValues({
            //       company_name: "",
            //       address: "",
            //       area: "",
            //       pin_code: "",
            //       city: "",
            //       state: "",
            //       country: "India",
            //     });
            //     setShippingOpen(true);
            //   },
            // },
            // (rowData) => ({
            //   icon: "edit",
            //   tooltip: "Edit",
            //   onClick: () => {
            //     setFormValues(rowData);
            //     setShippingOpen(true);
            //   },
            // }),
            billingAddressDelete ? (rowData) => ({
              icon: "delete",
              tooltip: "Delete",
              onClick: () => handleConfirmDelete(rowData.sub_company_id),
            }) : null,
          ]}
          columns={[
            { 
              field: "company_name", 
              title: "Company Name",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                const [local, setLocal] = useState(value || "")
                return (
                  <TextField
                    variant="standard"
                    type="text"
                    name="company_name"
                    value={local}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocal(value)
                      onRowDataChange({
                        ...rowData,
                        company_name: value
                      })
                      if(value.length > 0) {
                        onRowDataChange({
                          ...rowData,
                          company_name: value,
                          company_name_error: null
                        })
                      }
                      else {
                        onRowDataChange({
                          ...rowData,
                          company_name: value,
                          company_name_error: "Company Name is Required!"
                        })
                      }
                    }}
                    error={Boolean(rowData?.company_name_error)}
                    helperText={rowData?.company_name_error || ""}
                  />
                )
              }
            },
            { 
              field: "short_code", 
              title: "Short Code",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                const [local, setLocal] = React.useState(value || "")
                const timerRef = React.useRef(null)

                React.useEffect(() => {
                  return () => {
                    if (timerRef.current) {
                      clearTimeout(timerRef.current)
                    }
                  }
                }, [])

                const validateShortCode = (val) => {
                  if (timerRef.current) {
                    clearTimeout(timerRef.current)
                    timerRef.current = null
                  }

                  if (!val) {
                    onRowDataChange({
                      ...rowData,
                      short_code: "",
                      short_code_error: "Short Code is Required!"
                    })
                    return
                  }

                  if (val.length < 2 || val.length > 4) {
                    onRowDataChange({
                      ...rowData,
                      short_code: val,
                      short_code_error: "Short Code must be between 2 to 4 characters!"
                    })
                    return
                  }

                  timerRef.current = setTimeout(() => {
                    dispatch(
                      checkShortCodeExistAction(
                        { short_code: val },
                        async (response) => {
                          const res = await response
                          onRowDataChange({
                            ...rowData,
                            short_code: val,
                            short_code_error:
                              res.status === "Exist"
                                ? "Short Code Already Exist"
                                : null
                          })
                        }
                      )
                    )
                  }, 10000)
                }

                return (
                  <TextField
                    variant="standard"
                    value={local}
                    error={Boolean(rowData?.short_code_error)}
                    helperText={rowData?.short_code_error || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setLocal(val)

                      onRowDataChange({
                        ...rowData,
                        short_code: val,
                        short_code_error: null
                      })

                      validateShortCode(val)
                    }}
                  />
                )
              }
            },
            { 
              field: "address", 
              title: "Address",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                const [local, setLocal] = useState(value || "")
                return (
                  <TextField
                    variant="standard"
                    type="text"
                    name="address"
                    required
                    value={local}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocal(value)
                      onRowDataChange({
                        ...rowData,
                        address: value
                      })
                      if(value.length > 0) {
                        onRowDataChange({
                          ...rowData,
                          address: value,
                          address_error: null
                        })
                      }
                      else {
                        onRowDataChange({
                          ...rowData,
                          address: value,
                          address_error: "Address is Required!"
                        })
                      }
                    }}
                    error={Boolean(rowData?.address_error)}
                    helperText={rowData?.address_error || ""}
                  />
                )
              }
            },
            { 
              field: "area", 
              title: "Area",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                const [local, setLocal] = useState(value || "")
                return (
                  <TextField
                    variant="standard"
                    type="text"
                    name="ara"
                    required
                    value={local}
                    onChange={(e) => {
                      const value = e.target.value
                      setLocal(value)
                      onRowDataChange({
                        ...rowData,
                        area: value
                      })
                    }}
                  />
                )
              }
            },
            { 
              field: "phone_number", 
              title: "Phone Number",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                const [local, setLocal] = useState(value || "")
                return (
                  <TextField
                    variant="standard"
                    type="number"
                    name="phone_number"
                    value={local}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "")
                      const phoneValue = numericValue.length > 0 ? phoneValidation(numericValue) : true
                      setLocal(numericValue)
                      onRowDataChange({
                        ...rowData,
                        phone_number: numericValue
                      })
                      if(phoneValue) {
                        onRowDataChange({
                          ...rowData,
                          phone_number: numericValue,
                          phone_number_error: null
                        })
                      }
                      else {
                        onRowDataChange({
                          ...rowData,
                          phone_number: numericValue,
                          phone_number_error: "Invalid Phone Number!"
                        })
                      }
                    }}
                    error={Boolean(rowData?.phone_number_error)}
                    helperText={rowData?.phone_number_error || ""}
                  />
                )
              }
            },
            { 
              field: "email", 
              title: "Email",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                const [local, setLocal] = useState(value || "")
                return (
                  <TextField
                    variant="standard"
                    type="text"
                    name="email"
                    value={local}
                    onChange={(e) => {
                      const numericValue = e.target.value
                      const emailValue = numericValue.length > 0 ? emailValidation(numericValue) : true
                      setLocal(numericValue)
                      onRowDataChange({
                        ...rowData,
                        email: numericValue
                      })
                      if(emailValue) {
                        onRowDataChange({
                          ...rowData,
                          email: numericValue,
                          email_error: null
                        })
                      }
                      else {
                        onRowDataChange({
                          ...rowData,
                          email: numericValue,
                          email_error: "Invalid Email!"
                        })
                      }
                    }}
                    error={Boolean(rowData?.email_error)}
                    helperText={rowData?.email_error || ""}
                  />
                )
              }
            },
            { 
              field: "tax_id", 
              title: "GSTIN",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                const [local, setLocal] = useState(value || "")
                return (
                  <TextField
                    variant="standard"
                    type="text"
                    name="tax_id"
                    value={local}
                    onChange={(e) => {
                      const numericValue = e.target.value
                      const gstValue = numericValue !== "" ? gstValidation(numericValue) : true
                      setLocal(numericValue)
                      onRowDataChange({
                        ...rowData,
                        tax_id: numericValue
                      })
                      if(gstValue) {
                        onRowDataChange({
                          ...rowData,
                          tax_id: numericValue,
                          tax_id_error: null
                        })
                      }
                      else {
                        onRowDataChange({
                          ...rowData,
                          tax_id: numericValue,
                          tax_id_error: 'Invalid GSTIN!'
                        })
                      }
                    }}
                    error={Boolean(rowData?.tax_id_error)}
                    helperText={rowData?.tax_id_error || ""}
                  />
                )
              }
            },
            {
              field: "zip",
              title: "Pin Code",
              editComponent: ({ value, rowData, onRowDataChange }) => {
                
                const debounceRef = React.useRef(null);

                const handleLookup = async (pincode, latestRow) => {
                  const locationData = await getLocationDataBasedOnPincode(pincode);

                  if (locationData.length !== 0) {
                    const { district, state, country } = locationData;

                    onRowDataChange({
                      ...latestRow,
                      zip: pincode,
                      city: district,
                      state: state,
                      country: country,
                      zip_error: null,
                    });
                  } else {
                    onRowDataChange({
                      ...latestRow,
                      zip: pincode,
                      zip_error: "Pincode Not Found",
                    });
                  }
                };

                const handleChange = (e) => {
                  const numericValue = e.target.value.replace(/\D/g, "").slice(0, 6);

                  const updatedRow = {
                    ...rowData,
                    zip: numericValue,
                    zip_error: numericValue.length === 6 ? null : "Pincode must be 6 digits",
                  };

                  onRowDataChange(updatedRow);

                  if (debounceRef.current) clearTimeout(debounceRef.current);

                  if (numericValue.length === 6) {
                    debounceRef.current = setTimeout(() => {
                      handleLookup(numericValue, updatedRow);
                    }, 500);
                  }
                };

                return (
                  <TextField
                    variant="standard"
                    type="text"
                    value={value || ""}
                    onChange={handleChange}
                    error={Boolean(rowData?.zip_error)}
                    helperText={rowData?.zip_error || ""}
                    inputProps={{ inputMode: "numeric" }}
                  />
                );
              },
            },
            { field: "city", title: "City" },
            { field: "state", title: "State" },
            { field: "country", title: "Country" },
          ]}
          editable={{
            ...(billingAddressCreate && {
            onRowAdd: (newData) =>
              new Promise((resolve, reject) => {
                // shippingApply(newData);
                let isValid = true
                if(Object.keys(newData).length === 0) {
                  isValid = false
                  newData.company_name_error = 'Company Name is Required!'
                  newData.short_code_error = 'Short Code is Required!'
                  newData.address_error = 'Address is Required!'
                  // newData.tax_id_error = 'GSTIN is Required!'
                  newData.zip_error = 'Pincode is Required!'
                }
                Object.keys(newData).forEach((key, i) => {
                  if((newData.company_name === null || newData.company_name === '' || newData.company_name === undefined)) {
                    isValid = false
                    newData.company_name_error = 'Company Name is Required!'
                  }
                  if((newData.short_code === null || newData.short_code === '' || newData.short_code === undefined)) {
                    isValid = false
                    newData.short_code_error = 'Short Code is Required!'
                  }
                  if(newData.short_code_error !== null) {
                    isValid = false
                  }
                  if((newData.address === null || newData.address === '' || newData.address === undefined)) {
                    isValid = false
                    newData.address_error = 'Address is Required!'
                  }
                  // if((newData.tax_id === null || newData.tax_id === '' || newData.tax_id === undefined)) {
                  //   isValid = false
                  //   newData.tax_id_error = 'GSTIN is Required!'
                  // }
                  if((newData.zip === null || newData.zip === '' || newData.zip === undefined)) {
                    isValid = false
                    newData.zip_error = 'Pincode is Required!'
                  }
                  if(key === 'phone_number' && newData.phone_number.length > 0 ? !phoneValidation(newData.phone_number) : false) {
                    isValid = false
                    newData.phone_number_error = 'Invalid Phone Number!'
                  }
                  if(key === 'email' && newData.email.length > 0 ? !emailValidation(newData.email) : false) {
                    isValid = false
                    newData.email_error = 'Invalid Email!'
                  }
                  if(key === 'tax_id' && !gstValidation(newData.tax_id) && newData.tax_id !== "" && newData.tax_id !== null) {
                    isValid = false
                    newData.tax_id_error = 'Invalid GSTIN!'
                  }
                  if(key === 'zip' && newData.zip.length !== 6) {
                    isValid = false
                    newData.zip_error = 'Invalid Pincode!'
                  }
                })

                if(isValid) {
                  handleCreate(newData)
                  resolve();
                }
                else {
                  reject()
                }
              }),
               }),
            ...(billingAddressEdit && {
            onRowUpdate: (newData) =>
              new Promise((resolve, reject) => {
                let isValid = true
                if(Object.keys(newData).length === 0) {
                  isValid = false
                  newData.company_name_error = 'Company Name is Required!'
                  newData.short_code_error = 'Short Code is Required!'
                  newData.address_error = 'Address is Required!'
                  // newData.tax_id_error = 'GSTIN is Required!'
                  newData.zip_error = 'Pincode is Required!'
                }
                Object.keys(newData).forEach((key, i) => {
                  if((newData.company_name === null || newData.company_name === '' || newData.company_name === undefined)) {
                    isValid = false
                    newData.company_name_error = 'Company Name is Required!'
                  }
                  if((newData.short_code === null || newData.short_code === '' || newData.short_code === undefined)) {
                    isValid = false
                    newData.short_code_error = 'Short Code is Required!'
                  }
                  if(newData.short_code_error !== null && newData.short_code_error !== undefined) {
                    isValid = false
                  }
                  if((newData.address === null || newData.address === '' || newData.address === undefined)) {
                    isValid = false
                    newData.address_error = 'Address is Required!'
                  }
                  // if((newData.tax_id === null || newData.tax_id === '' || newData.tax_id === undefined)) {
                  //   isValid = false
                  //   newData.tax_id_error = 'GSTIN is Required!'
                  // }
                  if((newData.zip === null || newData.zip === '' || newData.zip === undefined)) {
                    isValid = false
                    newData.zip_error = 'Pincode is Required!'
                  }
                  if(key === 'phone_number' && (newData.phone_number && newData.phone_number.length > 0) ? !phoneValidation(newData.phone_number) : false) {
                    isValid = false
                    newData.phone_number_error = 'Invalid Phone Number!'
                  }
                  if(key === 'email' && (newData.email && newData.email.length > 0) ? !emailValidation(newData.email) : false) {
                    isValid = false
                    newData.email_error = 'Invalid Email!'
                  }
                  if(key === 'tax_id' && !gstValidation(newData.tax_id) && newData.tax_id !== "" && newData.tax_id !== null) {
                    console.log("newData.tax_id",newData.tax_id)
                    isValid = false
                    newData.tax_id_error = 'Invalid GSTIN!'
                  }
                  if(key === 'zip' && newData.zip.length !== 6) {
                    isValid = false
                    newData.zip_error = 'Invalid Pincode!'
                  }
                })

                if(isValid) {
                  handleEditSubmit(newData);
                  resolve();
                }
                else {
                  reject()
                }
              }),
               }),
          }}
        />
      </div>
    </>
  );
}

export default BillingAddress;

