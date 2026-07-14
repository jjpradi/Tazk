import React, {useState, useEffect, useRef, useContext} from 'react';
import {Cities} from '../utils/cities';
import {State} from './State_List';
import MaterialTable from 'utils/SafeMaterialTable';
import {Button, TextField, Grid, Typography} from '@mui/material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
// import _ from 'lodash';
import {getTrimmedData} from './trimFunction/index';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import context from '../context/CreateNewButtonContext';

function NewTaxCode(props) {
  const {
    setModalTypeHandler,
  } = useContext(context);


  const [formValues, setFormValues] = useState({
    tax_code: null,
    tax_code_name: null,
    city: null,
    state: null,
  });
  const [formErrors, setFormErrors] = useState({
    tax_code: false,
    tax_code_name: false,
    city: false,
    state: false,
  });
  const [codeData, setcodeData] = useState([]);
  // const [add_click , setAdd_Click] = useState(false)
  // const[setCurrent_Item_ID] = useState('')
  const tempedits = useRef(null);
  const tempcat = useRef(null);
  // const [value] = React.useState([]);
  // const filter = createFilterOptions();

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      setFormValues(props.edit_id_data[0]);
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  const cat = () => {
    setcodeData(props.taxcodes);
  };
  tempcat.current = cat;
  useEffect(() => {
    tempcat.current();
  }, []);

  return (
    <>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 12,
          lg: 12
        }}>
        <MaterialTable
          options={{
            headerStyle: {
              fontSize: 15,
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
                  ExportPdf(cols, datas, 'TaxCodeData'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'TaxCodeData'),
              },
            ],
          }}
          columns={[
            {
              title: 'Tax Code',
              field: 'tax_code',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='tax_code'
                  required={true}
                  error={props.value !== undefined ? props.error : false}
                  label='Tax Code'
                  variant='standard'
                  value={props.value}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) => (!rowData.tax_code ? false : true),
            },
            {
              title: 'Tax Code Name',
              field: 'tax_code_name',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='tax_code_name'
                  required={true}
                  error={props.value !== undefined ? props.error : false}
                  label='Tax Code Name'
                  variant='standard'
                  value={props.value}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) => (!rowData.tax_code_name ? false : true),
            },
            {
              title: 'City',
              field: 'city',

              editComponent: (props) => (
                (<Autocomplete
                  fullWidth={true}
                  name='city'
                  value={props.value ? {name: props.value} : {name: ''}}
                  // inputProps={{value:props.value}}
                  onChange={(event, newValue) =>
                    newValue !== null
                      ? props.onRowDataChange({
                          ...props.rowData,
                          city: newValue.name,
                          state: newValue.state,
                        })
                      : ''
                  }
                  id='free-solo-dialog-demo'
                  options={[...Cities]}
                  error={props.value !== null ? props.error : false}
                  getOptionLabel={(option) => option.name}
                  selectOnFocus
                  clearOnBlur
                  handleHomeEndKeys
                  // renderOption={(option) => option.city}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='city'
                      variant='outlined'
                      // required={true}
                    />
                  )}
                />)
                // <Autocomplete
                // fullWidth={true}
                // name='city'
                // defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m =>m.city) : ""}`}
                // options={Cities}
                // value={props.value}
                // inputProps={{value:formValues.city}}
                // error={
                //   props.value !== null ?
                //   props.error : false
                // }
                // // inputValue={formValues.city}
                // // getItemValue={(item) => item.city}
                // // onChange={(e, v) => handleSelect(e, v, "city")}
                // onChange={(e,newvalue) => props.onChange(newvalue)}
                // autoHighlight={true}
                // renderInput={(params) => (
                //                         <TextField {...params} label = "City" variant = "outlined" required={true} />
                //                     )}
                // />
              ),
              // validate: (rowData) => (!rowData.city ? false : true),
            },
            {
              title: 'State',
              field: 'state',
              editComponent: (props) => (
                <Autocomplete
                  name='state'
                  defaultValue={`${
                    props.edit_id_data
                      ? props.edit_id_data.map((m) => m.state)
                      : ''
                  }`}
                  inputProps={{value: formValues.state}}
                  // getItemValue={(item) => item.state}
                  options={State}
                  value={props.value}
                  error={props.value !== null ? props.error : false}
                  // inputValue={formValues.state}
                  // getOptionLabel={(options) => options.label}
                  // onChange={(e, v) => handleSelect(e, v, "state")}
                  onChange={(e, newvalue) => props.onChange(newvalue)}
                  autoHighlight={true}
                  fullWidth={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='State'
                      variant='outlined'
                      // required={true}
                      // error={formErrors.state === false ? false : true}
                      // helperText={
                      //   formErrors.state === false ? '' : formErrors.state
                      // }
                    />
                  )}
                />
              ),
              // validate: (rowData) => (!rowData.state ? false : true),
            },
          ]}
          data={codeData.map((m) => {
            const {tableData, ...rest} = m;
            return rest;
          })}
          editable={{
            onRowAdd: (newData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  let isvalid = false;
                  const error = formErrors;
                  for (let d of [
                    'tax_code',
                    'tax_code_name',
                    // 'city',
                    // 'state',
                  ]) {
                    if (!newData[d]) {
                      error[d] = true;
                      isvalid = true;
                    }
                  }
                  if (isvalid) {
                    setFormErrors({formErrors: error});
                    return reject();
                  }
                  setFormErrors({
                    add_click: false,
                  });

                  delete newData['tableData'];
                  setcodeData([...codeData, newData]);
                  // setCurrent_Item_ID(newData.tax_code_id)
                  props.handleSubmit(getTrimmedData(newData));

                  resolve();
                }, 1000);
              }),
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const dataUpdate = [...codeData];
                  const index = oldData.tableData.id;
                  dataUpdate[index] = newData;
                  setcodeData([...dataUpdate]);
                  props.handleSubmit(getTrimmedData(newData));
                  resolve();
                }, 1000);
              }),
            onRowDelete: (oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const dataDelete = [...codeData];
                  const index = oldData.tableData.id;
                  dataDelete.splice(index, 1);
                  setcodeData([...dataDelete]);
                  props.handleDelete(oldData.tax_code_id);
                  resolve();
                }, 1000);
              }),
          }}
          title={<Typography variant='h6'>TaxCode</Typography>}
        />
      </Grid>
      <br />
      <Grid
        spacing={3}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        //
        container={true}
        direction='row'
      >
        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}></Grid>

        <Grid
          align='right'
          size={{
            lg: 2,
            md: 2,
            sm: 2,
            xs: 2
          }}>
          <Button
            onClick={() => {
              props.handleClose();
              setModalTypeHandler('');
            }}
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

        {/* 
            <Grid size={{ xs: 6, sm: 6, md: 3, lg: 2 }}
             
              container={false}
              
             >
              <Button onClick={handleSubmit}
              style={{}}
              name='SUBMIT'
              variant='contained'
              color='primary'
              size='medium'
              text='button'
              fullWidth={false}
              type='submit'>
              SUBMIT
            </Button>
            </Grid> */}
      </Grid>
    </>
  );
}

export default NewTaxCode;

