import React, {useState, useEffect, useRef} from 'react';
import MaterialTable, {MTableAction} from 'utils/SafeMaterialTable';
import UnSavedChangesWarning from '../../../pages/common/unChangeswarning';
import {
  Button,
  Switch,
  TextField,
  Autocomplete,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  Link,
  Icon,
  IconButton,
  Tooltip,
} from '@mui/material';
import ItemPopup from './itemPopup';
import {Close, Add} from '@mui/icons-material';
import {getTrimmedData} from '../../../../components/trimFunction/index';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

function NewStockReceive(props) {
  const [form, setFormValues] = useState({tax_group_sequence: null});
  const [categoryData, setcategoryData] = useState([]);
  const {product, customer, inventory} = props;
  const [setCurrent_Item_ID] = useState('');
  const [Valid, setValid] = useState(false);
  const tempedits = useRef(null);
  const tempcate = useRef(null);
  const [formValues, setformValues] = useState({
    source_location_id: '',
    destination_location_id: '',
  });
  const [requiredFields] = useState([
    'source_location_id',
    'destination_location_id',
  ]);
  const [location_product, setlocation_product] = useState([]);
  const [formErrors, setformErrors] = useState({
    source_location_id: false,
    destination_location_id: false,
  });
  const [unchangeform, setForm] = useState(false);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const tempinit = useRef(null);
  const tempinitform = useRef(null);
  const addActionRef = useRef(null);
  const cancelActionRef = useRef(null);
  const [status, setstatus] = useState([]);
  const [row_id, setRowid] = useState({
    id: '',
    data: '',
    open: false,
    status: '',
  });

  const initform = () => {
    setInitialState(formValues);
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
  }, []);

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };

  tempinit.current = inits;
  useEffect(() => {
    tempinit.current();
  }, [formValues, initialState, props.open]);

  const handlePopup = async (id) => {
    setRowid({open: true, id: id.tableData.id, data: id, status: 'edit'});
  };

  const handleClose = () => {
    setRowid({...row_id, open: false});
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    setformValues({...formValues, [name]: value});
    if (!value) {
      setformErrors({...formErrors, [name]: true});
    } else {
      setformErrors({...formErrors, [name]: false});
    }
    if (name === 'destination_location_id') {
      const locate = inventory.filter((d) => d.trans_location === value);
      setlocation_product(locate);
    }
    //  setStateHandler(name, value);
  };

  // const setStateHandler = async (name, value) => {
  //     let formObj = {};

  //     formObj = {
  //       ...formValues,
  //       [name]: value === '' ? null : value
  //     };

  //     await setFormValues(formObj);
  //     validationHandler(name, value);
  //   };

  //   const validationHandler = (name, value) => {
  //     if (!Object.keys(formErrors).includes(name)) return;

  //     if (requiredFields.includes(name) && (value === null || value === "null" || value === "" || value === false || (Object.keys(value) && value.value === null))) {
  //       setformErrors({
  //         ...formErrors,
  //         [name]: capitalize(name) + ' is Required!'
  //       });
  //     }
  //      else {
  //       setformErrors({
  //         ...formErrors,
  //         [name]: null
  //       });
  //     }
  // };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleBlur = (e) => {
    const {name, value} = e.target;
    if (!value) {
      setformErrors({...formErrors, [name]: true});
    } else {
      setValid(true);
    }
  };

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      setformValues(props.edit_id_data[0]);
      setcategoryData([props.edit_id_data[0]]);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  // const cate = () => {
  //   setcategoryData(props.inventory)
  // }
  // tempcate.current = cate
  // useEffect(() => {
  //   tempcate.current();
  // }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    let isValid = true;
    requiredFields.forEach((field) => {
      if (!formValues[field]) {
        errors[field] = true;
        isValid = false;
      }
    });
    setformErrors({...formErrors, ...errors});
    if (!isValid) return;

    const {source_location_id, destination_location_id} = formValues;
    if (source_location_id === destination_location_id) {
      alert('Source and destination must be different');
      return;
    }
    if (!categoryData.length) {
      alert('Please add at least one item');
      return;
    }

    const data = {source_location_id, destination_location_id};
    data.categoryData = categoryData.map((d) => {
      const {tableData, ...record} = d;
      return record;
    });
    props.handleSubmit(getTrimmedData(data));
  };

  return (
    <>
      {Prompt}
      <h1>{props.status === 'edit' ? 'Receiving' : 'New'}</h1>
      <Grid container spacing={3}>
        <Grid size={4}>
          <FormControl
            fullWidth
            error={formErrors.destination_location_id}
            required={true}
          >
            <InputLabel id='demo-simple-select-label'>
              Destination Location
            </InputLabel>
            <Select
              name='destination_location_id'
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              required={true}
              value={formValues.destination_location_id}
              onChange={handleChange}
              onBlur={handleChange}
            >
              {props.stocklocation.map((d) => (
                <MenuItem value={d.location_id} key={d}>
                  {d.location_name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formErrors.destination_location_id
                ? 'Destination location is required!'
                : ''}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={4}>
          <FormControl
            fullWidth
            error={formErrors.source_location_id}
            required={true}
          >
            <InputLabel id='demo-simple-select-label'>
              Source Location
            </InputLabel>
            <Select
              name='source_location_id'
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              required={true}
              value={formValues.source_location_id}
              onChange={handleChange}
              onBlur={handleChange}
            >
              {props.stocklocation.map((d) => (
                <MenuItem value={d.location_id} key={d}>
                  {d.location_name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formErrors.source_location_id
                ? 'Source location is required!'
                : ''}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12
        }}>
        <MaterialTable
          components={{
            Action: (props) => {
              if (props.action.tooltip === 'Cancel') {
                return (
                  <div ref={cancelActionRef} onClick={props.action.onClick}>
                    <Tooltip title='Cancel'>
                      <IconButton>
                        <Close style={{color: 'black'}} />
                      </IconButton>
                    </Tooltip>
                  </div>
                );
              }
              if (
                typeof props.action === typeof Function ||
                props.action.tooltip !== 'Add'
              ) {
                return <MTableAction {...props} />;
              } else {
                return (
                  <div ref={addActionRef} onClick={props.action.onClick} />
                );
              }
            },
          }}
          actions={[
            (rowData) =>
              props.status === 'edit'
                ? {
                    icon: () => (
                      <Icon
                        style={{
                          fontWeight: 'bold',
                          fontSize: 'larger',
                          color:
                            rowData.is_serialized === 1
                              ? Number(rowData.quantity) /
                                  rowData.qty_per_pack ===
                                rowData.lots.length
                                ? 'green'
                                : 'red'
                              : 'green',
                        }}
                      >
                        toc
                      </Icon>
                    ),
                    tooltip: 'serial number',
                    onClick: (event, rowData) => handlePopup(rowData),
                  }
                : '',
          ]}
          options={{
            headerStyle: {
              fontSize: 15
            },
            exportButton: true,
            filtering: false,
            maxBodyHeight: '60vh',
            // pageSize: 20,
            // pageSizeOptions: [20, 50, 100],
            actionsColumnIndex: -1,
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'ReceivingTable'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'ReceivingTable'),
              },
            ],
          }}
          columns={[
            {
              title: 'Product',
              field: 'name',
              editComponent: (props) => (
                <Autocomplete
                  name='name'
                  value={{product_name: props.value}}
                  onChange={(e, newValue) =>
                    newValue !== null
                      ? props.onRowDataChange({
                          ...props.rowData,
                          trans_items: newValue.trans_id,
                          name: newValue.product_name,
                        })
                      : ''
                  }
                  options={location_product}
                  // filterOptions={filterOptions}
                  getOptionLabel={(option) => option.product_name}
                  freeSolo
                  renderInput={(params) => (
                    <TextField {...params} label='Product' variant='outlined' />
                  )}
                />
              ),
            },

            // {
            //     title: "CustomerName", field: "first_name",
            //     editComponent: props => (
            //         <Autocomplete
            //             name='name'
            //             value={{ first_name: props.value }}
            //             onChange={(e, newValue) => newValue !== null ? props.onRowDataChange({
            //                 ...props.rowData,
            //                 trans_user: newValue.person_id,
            //                 first_name: newValue.first_name
            //             }) : ''}
            //             options={customer.filter(c => c.first_name !== null && typeof c.first_name === 'string')}
            //             // filterOptions={filterOptions}
            //             getOptionLabel={(option) => option.first_name}
            //             freeSolo
            //             renderInput={(params) => (
            //                 <TextField {...params} label="Customer Name" variant="outlined" />
            //             )}
            //         />
            //     )
            // },
            {
              title: 'Quantity',
              field: 'quantity',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='quantity'
                  label='Quantity'
                  type='number'
                  defaultValue='0.00'
                  variant='standard'
                  value={props.value}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
            },
          ]}
          data={categoryData.map((m) => {
            const {tableData, ...rest} = m;
            return rest;
          })}
          editable={{
            onRowAdd: (newData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  delete newData['tableData'];

                  setcategoryData([...categoryData, newData]);
                  // setCurrent_Item_ID(newData.tax_category_id)
                  //   props.handleSubmit(newData);
                  resolve();
                }, 1000);
              }),
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const dataUpdate = [...categoryData];
                  const index = oldData.tableData.id;
                  dataUpdate[index] = newData;
                  setcategoryData([...dataUpdate]);
                  // props.handleSubmit(newData);
                  resolve();
                }, 1000);
              }),
            onRowDelete: (oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const dataDelete = [...categoryData];
                  const index = oldData.tableData.id;
                  dataDelete.splice(index, 1);
                  setcategoryData([...dataDelete]);
                  //  props.handleDelete(oldData.tax_category_id)
                  resolve();
                }, 1000);
              }),
          }}
          title={<Typography variant='h6'>Receiving Table</Typography>}
        />
      </Grid>
      <br />
      <Grid
        spacing={2}
        // lg={6}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'
        //
        form={false}
      >
        <Grid
          form={false}
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <Button
            onClick={() => props.handleClose()}
            style={{}}
            name='CANCEL'
            variant='contained'
            color='secondary'
            size='medium'
            text='button'
            fullWidth={false}
            type='cancel'
          >
            Cancel
          </Button>
        </Grid>
        <Grid
          form={false}
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <Button
            onClick={handleSubmit}
            style={{}}
            name='SUBMIT'
            variant='contained'
            color='primary'
            size='medium'
            text='button'
            fullWidth={false}
            type='submit'
          >
            Submit
          </Button>
        </Grid>
      </Grid>
      <ItemPopup
        cancelref={cancelActionRef.current?.click}
        open={row_id.open}
        status={row_id.status}
        setitemsData={setcategoryData}
        handleClose={handleClose}
        itemsData={categoryData}
        row_id={row_id}
        product={props.product}
      />
    </>
  );
}

export default NewStockReceive;

