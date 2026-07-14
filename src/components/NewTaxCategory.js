import React, {useState, useEffect, useRef, useContext} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {Button, TextField, Grid, Typography} from '@mui/material';
import {getTrimmedData} from './trimFunction/index';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import context from '../context/CreateNewButtonContext';


function NewTaxCategory(props) {
  const {
    setModalTypeHandler,
  } = useContext(context);
  
  // const [formValues, setFormValues] = useState ({ tax_category: null,tax_group_sequence: null });
  const [formErrors, setFormErrors] = useState({
    tax_category: null,
    tax_group_sequence: null,
  });
  // const [requiredFields] = useState ( ["tax_category","tax_group_sequence"] );
  const [categoryData, setcategoryData] = useState([]);
  // const [setCurrent_Item_ID] = useState('')
  // const [regex] = useState ({  });
  // const tempedits = useRef(null)
  const tempcate = useRef(null);

  // const edits = () => {
  //   if (props.edit_id_data[0] && props.status === 'edit') {
  //     // setFormValues(props.edit_id_data[0])
  //   }
  // }
  // tempedits.current = edits
  // useEffect(() => {
  //   tempedits.current()
  // }, [props.edit_id_data]);

  const cate = () => {
    setcategoryData(props.taxcategory);
  };
  tempcate.current = cate;
  useEffect(() => {
    tempcate.current();
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
                  ExportPdf(cols, datas, 'TaxCategoryData'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'TaxCategoryData'),
              },
            ],
          }}
          columns={[
            {
              title: 'Tax Category',
              field: 'tax_category',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='tax_category'
                  type='text'
                  required={true}
                  // error={props.value !== undefined ? props.error : false}
                  error={props.value !== undefined ? !/^GST\d+$/.test(props.value) : false}
                  label='Category'
                  variant='standard'
                  value={props.value || ''}
                  onChange={(e) => props.onChange(e.target.value)}
                  helperText={props.value && !/^GST\d+$/.test(props.value) ? 'Must start with GST followed by numbers' : ''}
                />
              ),
              validate: (rowData) => /^GST\d+$/.test(rowData.tax_category),
            },
            {
              title: 'Tax Group Sequence',
              field: 'tax_group_sequence',
              editComponent: (props) => (
                <TextField
                  id='standard-basic'
                  name='tax_group_sequence'
                  required={true}
                  onWheel={ (e) => e.target.blur()}
                  type='number'
                  error={props.value !== undefined ? props.error : false}
                  label='Tax Sequence'
                  variant='standard'
                  value={props.value || ''}
                  onChange={(e) => props.onChange(e.target.value)}
                />
              ),
              validate: (rowData) =>
                !rowData.tax_group_sequence ? false : true,
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
                  let isvalid = false;
                  const error = formErrors;
                  for (let d of ['tax_category', 'tax_group_sequence']) {
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

                  setcategoryData([...categoryData, newData]);
                  // setCurrent_Item_ID(newData.tax_category_id)
                  props.handleSubmit(getTrimmedData(newData));
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
                  props.handleSubmit(getTrimmedData(newData));
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
                  props.handleDelete(oldData.tax_category_id);
                  resolve();
                }, 1000);
              }),
          }}
          title={<Typography variant='h6'>TaxCategory</Typography>}
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

        {!props.open && (
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
        )}
        {/* <Grid size={{ xs: 6, sm: 6, md: 3, lg: 2 }}
     
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

export default NewTaxCategory;

