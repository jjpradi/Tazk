import React, {useEffect, useState, useContext} from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Box,
  Badge,
  Grid,
  Slider,
  Typography,
} from '@mui/material';
import {
  getPriceListAction,
  getProductPriceListAction,
  getProductListAction,
  createPriceListAction,
  updatePriceListAction,
} from 'redux/actions/priceList_actions';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import {connect, useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
  font14_500,
  tabHeight,
} from 'utils/pageSize';
import InputAdornment from '@mui/material/InputAdornment';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import moment from 'moment';
import toMomentOrNull from '../../../utils/DateFixer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '89%',
  left: '37%',
};

export default function ProductListSubmitPage(props) {
  const [productPriceList, setProductPriceList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [unitPrice, setUnitPrice] = useState([]);
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );
  useEffect(() => {
    if (props.filterProduct.length) {
      setProductPriceList(FilteredProductData());
    }
  }, [props.filterProduct, props.statusId]);

  const FilteredProductData = () => {
    let filterData = props.filterProduct;
    let filterDate = props.price_list.filter(
      (q) => q.id === filterData[0]?.price_list_id,
    );

    let testData = filterData.map((f) => {
      return {
        name: f.name,
        ...(f.price_list_id && {price_list_id: f.price_list_id}),
        ...(f.id && {id: f.id}),
        unit_price: f.unit_price,
        product_id: f.product_id,
        discount_type: f?.discount_type || 'percent',
        fromDate: props.fromDate,
        toDate: props.toDate,
        discount_price: f?.discount_price || f.unit_price,
        discount_value: f?.discount_value || '',
      };
    });

    return testData;
  };

  const copyData = (discount_value, rowData) => {
    let changedData = productPriceList.map((p) => {
      return {
        ...p,
        discount_value: discount_value,
        discount_type: rowData.discount_type,
        discount_price: calculateDiscount(
          rowData.discount_type,
          discount_value,
          p.unit_price,
        ),
      };
    });

    setProductPriceList(changedData);
  };

  console.log(productPriceList,'productPriceList', props.editPriceList);

  const handleSubmit = () => {
    if (props.editPriceList.length) {
      console.log('update');
      let priceList = {
        price_list_name: props.priceListName,
        id: props.editPriceList[0]?.id,
        createdAt: props.editPriceList[0]?.createdAt,
        modifiedAt: props.editPriceList[0]?.modifiedAt,
        fromDate : props.fromDate,
        toDate : props.toDate
      };
      props.handleSubmit(productPriceList, priceList);
    } else {
      console.log('create');
      props.handleSubmit(productPriceList, {
        price_list_name: props.priceListName,
       
      },props.fromDate,
        props.toDate);
    }
  };

  function calculateDiscount(discount_type, discount_value, unit_price) {
    if (discount_value === '' || discount_value === undefined)
      return unit_price;

    if (discount_type === 'flat') {
      return (unit_price - parseFloat(discount_value)).toFixed(2);
    } else {
      return (
        unit_price -
        (unit_price * parseFloat(discount_value)) / 100
      ).toFixed(2);
    }
  }

  console.log(productPriceList,'productPriceList')

  return (
    <>
      <Grid
        mb={3}
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
                <Card>
                  <Grid
                    container
                    display='flex'
                    alignItems='center'
                    spacing={5}
                    p='20px'
                  >
                    <Grid
                      size={{
                        lg: 2,
                        md: 2,
                        sm: 6,
                        xs: 8
                      }}>

                      <TextField
                        fullWidth
                        disabled={true}
                        label='Price List Name'
                        placeholder='Enter price list name'
                        variant='filled'
                        value={props.priceListName}
                        required={true}
                      />
                    </Grid>
                     <Grid
                       size={{
                         lg: 2,
                         md: 2,
                         sm: 6,
                         xs: 8
                       }}>
                     <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='From Date'
                disabled ={true}
                value={toMomentOrNull(props.fromDate)}
                minDate={moment()}
                format='DD/MM/YYYY'
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'filled',
                    onKeyDown: (e) => {
                      e.preventDefault();
                    },
                  },
                }}
              />
              </LocalizationProvider>
                    </Grid>
                     <Grid
                       size={{
                         lg: 2,
                         md: 2,
                         sm: 6,
                         xs: 8
                       }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='To Date'
                disabled ={true}
                value={toMomentOrNull(props.toDate)}
                format='DD/MM/YYYY'
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'filled',
                    onKeyDown: (e) => {
                      e.preventDefault();
                    },
                  },
                }}
              />
              </LocalizationProvider>
                    </Grid>
                  <Grid size="grow" />

              <Grid
                size={{
                  xs: 2,
                  sm: 1.5,
                  md: 1,
                  lg: 1
                }}>
                <Button
                  fullWidth
                  onClick={() => props.handleBack()}
                  variant='contained'
                  color='secondary'
                  sx={{ height: '42px' }}
                >
                  Back
                </Button>
              </Grid>


              <Grid
                size={{
                  xs: 6,
                  sm: 1.5,
                  md: 1,
                  lg: 1
                }}>
                <Button
                fullWidth
                sx={{ height: '42px', ml: 1 }}
                  onClick={() => {
                    handleSubmit();
                  }}
                  variant='contained'
                  disabled={productPriceList.length === 0 || productPriceList.some((i) => i.discount_price < 0 || i.discount_value === '' || i.discount_value <= 0 )}
		 
                >
                  Submit
                </Button>
              </Grid>
              </Grid>
                </Card>
              </Grid>
      {/* <Card>
      <Grid
        container
        spacing={3}
        display='flex'
        justifyContent='right'
        alignItems='right'
        p='20px 0px 5px 0px'
        mb={'5px'}
      >
        <Grid>
          <Button
            onClick={() => props.handleBack()}
            variant='contained'
            color='secondary'
          >
            Back
          </Button>
        </Grid>

        <Grid>
          <Button
            onClick={() => {
              handleSubmit();
            }}
            variant='contained'
            disabled={productPriceList.some((i) => i.discount_price < 0 || i.discount_value === '' || i.discount_value <= 0 )}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </Card> */}
      <MaterialTable
        // onRowClick={(event, rowData) => {}}
        editable={{
          // onRowAdd: (newRow) =>
          //   new Promise((resolve, reject) => {
          //     setProductPriceList([...productPriceList]);
          // setProductPriceList([...productPriceList, newRow]);
          // setProductList(
          //   productList?.filter(
          //     (item) => item.product_id !== newRow.product_id,
          //   ),
          // );
          //   setTimeout(() => resolve(), 500);
          // }),

          // onRowUpdate: (newRow, oldRow) =>
          //   new Promise((resolve, reject) => {
          //     const updatedData = [...productPriceList];
          //     updatedData[oldRow.tableData.id] = newRow;
          //     setProductPriceList(updatedData);
          //     setTimeout(() => resolve(), 500);
          //   }),
          onBulkUpdate: (changes) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                const temp = [...productPriceList];

                for (const [key, value] of Object.entries(changes)) {
                  if (value.newData.id) {
                    const index = temp.findIndex(
                      (i) => i.id === value.newData.id,
                    );
                    temp[index] = value.newData;
                  } else {
                    temp[key] = changes[key].newData;
                  }
                }

                let sortArr = [];

                temp.forEach((e, i) => {
                  if (e.discount_price < 0) {
                    sortArr.unshift(e);
                  } else {
                    sortArr.push(e);
                  }
                });

                setProductPriceList(sortArr);
                resolve();
              }, 1000);
            }),

          //   onRowDelete: (oldData) =>
          //     new Promise((resolve, reject) => {
          //       setTimeout(() => {
          //         let addItemToList = product_list?.filter(
          //           (item) => item.product_id === oldData.product_id,
          //         );
          //         setProductList([...productList, ...addItemToList]);

          //         if (oldData.id) {
          //           const dataDelete = [...productPriceList];
          //           let index = productPriceList.findIndex(
          //             (item) => item.id === oldData.id,
          //           );
          //           dataDelete.splice(index, 1);
          //           setProductPriceList([...dataDelete]);
          //           resolve();
          //         } else {
          //           const dataDelete = [...productPriceList];
          //           const index = oldData.tableData.id;

          //           dataDelete.splice(index, 1);
          //           setProductPriceList([...dataDelete]);
          //           resolve();
          //         }
          //       }, 1000);
          //     }),
        }}
        options={{
          headerStyle,
          cellStyle,
          search: false,
          exportButton: false,
          filtering: false,
          actionsColumnIndex: -1,
          maxBodyHeight,
          pageSizeOptions: [20, 50, 100],
          pageSize: 20,
          rowStyle: (rowData) => ({
            backgroundColor: rowData.discount_price >= 0 ? '' : '#e385a863',
          }),
        }}
        columns={[
          {
            title: 'From Date',
            field: 'fromDate',
            editable: 'never',
            render: rowData => rowData.fromDate ? moment(rowData.fromDate).format('DD/MM/YYYY') : '',
            cellStyle: {
              fontSize: cellStyle.fontSize,
              fontWeight: cellStyle.fontWeight,
            },
          },
          {
            title: 'To Date',
            field: 'toDate',
            render: rowData => rowData.toDate ? moment(rowData.toDate).format('DD/MM/YYYY') : '',
            editable: 'never',
            cellStyle: {
              fontSize: cellStyle.fontSize,
              fontWeight: cellStyle.fontWeight,
            },
          },
          {
            title: 'Product Name',
            field: 'name',
            editable: 'never',
            cellStyle: {
              fontSize: cellStyle.fontSize,
              fontWeight: cellStyle.fontWeight,
            },
          },
          {
            title: 'Unit Price',
            field: 'unit_price',
            // editable: 'never',
            // cellStyle: {
            //   fontSize: cellStyle.fontSize,
            //   fontWeight: cellStyle.fontWeight,
            // },
            render: (rowData) => (
              <div
                style={{
                  textAlign: 'right',
                  minWidth: '60px',
                  maxWidth: '80px',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {rowData.unit_price}
              </div>
            ),
            editComponent : ({value, onChange, rowData, onRowDataChange}) => (
              <TextField 
                type='number'
                value={value}
                onChange={(e) => {
                  const val = e.target.value
                  onRowDataChange({
                    ...rowData,
                    unit_price: val,
                    discount_price: val
                  })
                }}
              />
            )
          },
          {
            title: 'Discount Type',
            field: 'discount_type',
            cellStyle: {
              fontSize: cellStyle.fontSize,
              fontWeight: cellStyle.fontWeight,
            },
            render: (rowData) => (
              <>
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby='demo-row-radio-buttons-group-label'
                    name='discount_type'
                    value={rowData.discount_type}
                    onChange={(e) => {
                      // const val = e.target.value;
                      // const temp = [...productPriceList];
                      // const index = temp[rowData.tableData.index];
                      // index.discount_type = val;
                      // index.discount_price = calculateDiscount(val, rowData.discount_value, rowData.unit_price)
                      // setProductPriceList([...temp]);
                    }}
                  >
                    
                    <FormControlLabel
                      value='percent'
                      control={<Radio />}
                      label='Perc %'
                    />
                    <FormControlLabel
                      value='flat'
                      control={<Radio />}
                      label='Flat'
                    />
                  </RadioGroup>
                </FormControl>
              </>
            ),
            editComponent: ({value, onChange, rowData, onRowDataChange}) => (
              <>
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby='demo-row-radio-buttons-group-label'
                    name='discount_type'
                    value={value}
                    onChange={(e) => {
                      const val = e.target.value;

                      // const val = e.target.value;
                      // const temp = [...productPriceList];
                      // const index = temp[rowData.tableData.index];
                      // index.discount_type = val;
                      // index.discount = calculateDiscount(val, rowData.discount_value, rowData.unit_price)

                      // setProductPriceList([...temp]);

                      onRowDataChange({
                        ...rowData,
                        discount_type: val,
                        discount_price: calculateDiscount(
                          val,
                          rowData.discount_value,
                          rowData.unit_price,
                        ),
                      });
                    }}
                  >
                    
                    <FormControlLabel
                      value='percent'
                      control={<Radio />}
                      label='Perc %'
                    />
                    <FormControlLabel
                      value='flat'
                      control={<Radio />}
                      label='Flat'
                    />
                  </RadioGroup>
                </FormControl>
              </>
            ),
          },
          {
            title: 'Discount Value',
            field: 'discount_value',
            hidden: false,
            render: (rowData) => (
              <div
                style={{
                  textAlign: 'right',
                  minWidth: '60px',
                  maxWidth: '80px',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {rowData.discount_value}
              </div>
            ),
            editComponent: ({value, onChange, rowData, onRowDataChange}) => (
              <TextField
                type='number'
                style={{maxWidth: '200px', padding: '5px 0px'}}
                InputProps={{
                  endAdornment: (
                    <InputAdornment>
                      <IconButton
                        onClick={() => {
                          copyData(value, rowData);
                        }}
                      >
                        <CopyAllIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder='Discount value'
                value={value}
                onChange={(e) => {
                  const val = e.target.value;
                  onRowDataChange({
                    ...rowData,
                    discount_value: val,
                    discount_price: calculateDiscount(
                      rowData.discount_type,
                      val,
                      rowData.unit_price,
                    ),
                  });
                }}
                disabled={Number(rowData.unit_price) <= 0}
                helperText={
                  Number(rowData.unit_price) <= 0
                    ? 'Please update Unit Price first'
                    : ''
                }
              />
            ),
            validate: (rowData) => {
              if (rowData.unit_price < 1) {
                return 'Enter correct price';
              } else {
                return true;
              }
            },
          },
          
          {
            title: 'Discount Price',
            field: 'discount_price',
            editable: 'never',
            cellStyle: {
              fontSize: cellStyle.fontSize,
              fontWeight: cellStyle.fontWeight,
            },
            render: (rowData) => (
              <div
                style={{
                  textAlign: 'right',
                  minWidth: '60px',
                  maxWidth: '80px',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {rowData.discount_price}
              </div>
            )
          },
        ]}
        title={
          <Typography
            variant='h6'
            align='left'
            style={{paddingTop: '10px', paddingBottom: '10px'}}
          >
            {`Price List - ${props.priceListName}`}
          </Typography>
        }
        data={productPriceList}
        
      />
    </>
  );
}

