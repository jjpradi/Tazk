import React, {useState, useEffect, useRef} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {Button, TextField, Grid, Typography} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

function NewTaxJurisdiction(props) {
  // const [formValues, setFormValues] = useState ({ jurisdiction_name: null,tax_group: null,tax_type: null,reporting_authority: null,tax_group_sequence: null });
  const [formErrors, setFormErrors] = useState({
    jurisdiction_name: null,
    tax_group: null,
    tax_type: null,
    reporting_authority: null,
    tax_group_sequence: null,
  });
  // const [requiredFields] = useState ( ["jurisdiction_name","tax_group","tax_type","reporting_authority","tax_group_sequence"] );
  const [jurisdictionData, setjurisdictionData] = useState([]);
  // const [setCurrent_Item_ID] = useState('')
  // const [regex] = useState ({  });
  const tempedits = useRef(null);
  const tempcat = useRef(null);

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      // setFormValues(props.edit_id_data[0])
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);

  const cat = () => {
    setjurisdictionData(props.taxjurisdiction);
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
                  ExportPdf(cols, datas, 'TaxJurisdictionData'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'TaxJurisdictionData'),
              },
            ],
          }}
          columns={[
            {
              title: 'Jurisdiction Name',
              field: 'jurisdiction_name',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='jurisdiction_name'
                  required={true}
                  error={props.value !== undefined ? props.error : false}
                  label='Jurisdiction Name'
                  variant='standard'
                  type='text'
                  value={props.value || ''}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) =>
                !rowData.jurisdiction_name ? false : true,
            },
            {
              title: 'Tax Group',
              field: 'tax_group',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='tax_group'
                  required={true}
                  error={props.value !== undefined ? props.error : false}
                  label='Tax Group'
                  variant='standard'
                  type='text'
                  value={props.value || ''}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) => (!rowData.tax_group ? false : true),
            },
            {
              title: 'Tax Type',
              field: 'tax_type',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='tax_type'
                  required={true}
                  error={props.value !== undefined ? props.error : false}
                  label='Tax Type'
                  variant='standard'
                  type='number'
                  value={props.value || ''}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) => (!rowData.tax_type ? false : true),
            },
            {
              title: 'Reporting Authority',
              field: 'reporting_authority',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='reporting_authority'
                  required={true}
                  error={props.value !== undefined ? props.error : false}
                  label='Reporting Authority'
                  variant='standard'
                  type='text'
                  value={props.value || ''}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) =>
                !rowData.reporting_authority ? false : true,
            },
            {
              title: 'Tax Group Sequence',
              field: 'tax_group_sequence',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='tax_group_sequence'
                  required={true}
                  error={props.value !== undefined ? props.error : false}
                  label='Group Sequence'
                  variant='standard'
                  type='number'
                  value={props.value || ''}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) =>
                !rowData.tax_group_sequence ? false : true,
            },
          ]}
          data={jurisdictionData.map((m) => {
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
                    'jurisdiction_name',
                    'tax_group',
                    'tax_type',
                    'reporting_authority',
                    'tax_group_sequence',
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

                  setjurisdictionData([...jurisdictionData, newData]);
                  // setCurrent_Item_ID(newData.jurisdiction_id)
                  props.handleSubmit(getTrimmedData(newData));
                  resolve();
                }, 1000);
              }),
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const dataUpdate = [...jurisdictionData];
                  const index = oldData.tableData.id;
                  dataUpdate[index] = newData;
                  setjurisdictionData([...dataUpdate]);
                  props.handleSubmit(getTrimmedData(newData));
                  resolve();
                }, 1000);
              }),
            onRowDelete: (oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const dataDelete = [...jurisdictionData];
                  const index = oldData.tableData.id;
                  dataDelete.splice(index, 1);
                  setjurisdictionData([...dataDelete]);
                  props.handleDelete(oldData.jurisdiction_id);
                  resolve();
                }, 1000);
              }),
          }}
          title={<Typography variant='h6'>TaxJurisdiction</Typography>}
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
            CANCEL
          </Button>
        </Grid>

        {/* <Grid size={{ xs: 6, sm: 6, md: 3, lg: 2 }}
      form={false}
     
      
      
     
      form={false}>
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

export default NewTaxJurisdiction;

