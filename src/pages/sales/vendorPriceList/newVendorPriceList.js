import MaterialTable, {MTableAction} from 'utils/SafeMaterialTable';
import {
  Autocomplete,
  Button,
  Card,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {cellStyle, maxBodyHeight, vendorHeaderStyle} from 'utils/pageSize';
import PropTypes from 'prop-types';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import IOSSwitch from 'utils/cssSwitch';
import * as Yup from 'yup';
import {useFormik, Form, FormikProvider} from 'formik';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import {
  createVendorPriceListAction,
  listVendorIdAndNameAction,
  updateVendorPriceListAction,
} from 'redux/actions/vendor_actions';
import {
  GetAllProductBrand,
  GetAllProductCategory,
  categoryBasedOnBrandAction,
  listProductAction,
  productListAction,
} from 'redux/actions/product_actions';
import CancelIcon from '@mui/icons-material/Cancel';
import CommonToolTip from 'components/ToolTip';
import {filterOptions, calculateMarginPercentage} from 'utils/searchFunc';
import AddIcon from '@mui/icons-material/Add';
import {Add} from '@mui/icons-material';
import toMomentOrNull from '../../../utils/DateFixer';

function NewVendorPriceList(props) {
  const dispatch = useDispatch();
  const addActionRef = useRef(null);
  const cancelActionRef = useRef(null);
  const {handleClose, edit_id_data, status, datas} = props;
  const [monthList, setMonthList] = useState([]);
  const [selectedNames, setSelectedNames] = useState(['']);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(()=>{
    return status === 'edit' ?  JSON.parse(edit_id_data.category) : [] 
  });
  const [productTableData, setProductTableData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [lineCount, setLineCount] = useState(1);
  const [addClick, setAddClick] = useState(false);
  const [gst, setGst] = useState(edit_id_data?.gst === 1); 

  const {
    vendorReducer: {vendorIdAndName: vendor},
    productReducer: {
      product,
      product_all_brand,
      categoryBasedOnBrand,
      // product,
    },
  } = useSelector((state) => state);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    setModalStatusHandler,
    commoncookie,
    headerLocationId,
    selectData,
    setselectData,
  } = useContext(context);

 
  console.log('productTableData', productTableData, tableData)

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      !vendor.length && dispatch(listVendorIdAndNameAction()),
      !product_all_brand.length &&
        dispatch(
          GetAllProductBrand(setModalTypeHandler, setLoaderStatusHandler),
        ),
    );
    generateLastTwelveMonth();
  }, []);


  useEffect(() => {
    // let data = {
    //   brand: brand === '' ? 'null' : brand,
    //   category: category.length ? category.map((c) => c.category) : 'null',
    // };
    // dispatch(productListAction(data));
    dispatch(listProductAction());
  }, [category]);

  useEffect(() => {
    if (!brand) return;
    let data = {
      brand: brand,
    };

    dispatch(categoryBasedOnBrandAction(data));
  }, [brand]);

  useEffect(() => {
    let data = productTableData;

    const updatedArray = data.map((item) => {
      let newItem = {...item}; // Create a new object to avoid mutating the original object

      if (gst) {
        const igstTax = item.taxes.find((t) => t.tax_group === 'IGST');
        const taxRate = igstTax ? igstTax.tax_rate : 0;
        newItem.item_cost_price = singleTax(item.item_cost_price, 1, taxRate);
        newItem.sellingPrice = singleTax(item.sellingPrice, 1, taxRate);
        newItem.mrp = singleTax(item.mrp, 1, taxRate);
        newItem.margin = calculateMarginPercentage(
          item?.item_cost_price,
          item?.sellingPrice,
        );
      }

      return newItem;
    });

    if (gst) {
      setTableData(updatedArray);
    } else {
      setTableData(data);
    }
  }, [gst]);

  useEffect(() => {
    if (selectData.product) {
      const filter = [...product];
      const pop = filter.shift();

      const {
        name,
        item_id,
        description,
        cost_price: item_cost_price,
        unit_price: item_unit_price,
        taxes,
        qty_per_pack,
        is_serialized,
        hsn_code,
        max_price,
        model,
      } = pop;

      let gst;
      let tax_category;
      taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          gst = t.tax_rate;
          tax_category = t.tax_category;
        }
      });

      setProductTableData([
        ...productTableData,
        {
          name,
          item_id,
          description,
          item_cost_price: item_cost_price,
          item_unit_price,
          received_quantity: 0,
          ordered_quantity: 1,
          gst,
          tax_category,
          quantity: 1,
          taxes: pop.taxes,
          sub_total: singleTax(item_cost_price, 1, pop),
          prod_val: true,
          lots: [],
          qty_per_pack,
          is_serialized,
          line: lineCount,
          hsn_code,
          max_price,
          model,
        },
      ]);
      setTableData([
        ...tableData,
        {
          name,
          item_id,
          description,
          item_cost_price: item_cost_price,
          item_unit_price,
          received_quantity: 0,
          ordered_quantity: 1,
          gst,
          tax_category,
          quantity: 1,
          taxes: pop.taxes,
          sub_total: singleTax(item_cost_price, 1, pop),
          prod_val: true,
          lots: [],
          qty_per_pack,
          is_serialized,
          line: lineCount,
          hsn_code,
          max_price,
          model,
        },
      ]);
      setLineCount(lineCount + 1);
      setselectData('product', false);
      setGst(true);
    }
  }, [selectData.product]);


  const singleTax = (price = 0, quantity = 1, taxRate) => {
    const totalBeforeTax = price * quantity;
    const taxAmount = (totalBeforeTax * taxRate) / 100;
    const totalAfterTax = totalBeforeTax + taxAmount;
    return totalAfterTax.toFixed(2);
  };

  const generateLastTwelveMonth = () => {
    let tempArr = [];
    let monthName = new Array(
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    );
    let d = new Date(); // Current date
    for (let i = 0; i < 6; i++) {
      let tempObj = {};
      tempObj.name = monthName[d.getMonth()] + ' ' + d.getFullYear();
      tempObj.month = d.getMonth() + 1; // Month is zero-based, so add 1
      tempObj.year = d.getFullYear();
      tempArr.push(tempObj);
      d.setMonth(d.getMonth() + 1); // Move to the next month
    }
    setMonthList(tempArr);
  };

  const getFirstAndLastDate = async (month, year) => {
    // JavaScript months are 0-based, so subtract 1 from the input month
    let firstDay = new Date(year, month - 1, 1);
    let lastDay = new Date(year, month, 0);

    // Format the dates as dd/mm/yyyy
    let firstDateFormatted = `${firstDay.getFullYear()}/${('0' + (firstDay.getMonth() + 1)).slice(-2)}/${(
      '0' + firstDay.getDate()
    ).slice(-2)}`;
    let lastDateFormatted = `${lastDay.getFullYear()}/${('0' + (lastDay.getMonth() + 1)).slice(-2)}/${(
      '0' + lastDay.getDate()
    ).slice(-2)}`;

    await setFieldValue('FROM_DATE', firstDateFormatted);
    await setFieldValue('TO_DATE', lastDateFormatted);
  };

  const handleChange = async (e, type) => {
    let val = e.target.value;
    setFieldValue(type, val);
    let filter = await monthList?.filter((f) => val === f.month);
    await getFirstAndLastDate(filter[0]?.month, filter[0]?.year);
  };

  const handleVendorChange = (e, type) => {
    const {value} = e.target;
    setSelectedNames(value.includes('') ? [''] : value);
    setFieldValue(type, value.includes('') ? [''] : value);
  };

  const handleNewProduct = async (e, type) => {
    let val = e.target.value;
    let filteredData = await product?.filter((f) => val === f.item_id);
    setFieldValue(type, filteredData);
    await setProductTableData(filteredData);
  };

  const handleGst = (e) => {
    const isChecked = e.target.checked;
    setGst(e.target.checked);
    setFieldValue("GST", isChecked ? 1 : 0);
  };

  const handleDateChange = (e, type) => {
    let newDate = new Date(e);
    let dateFormatted = `${newDate.getFullYear()}/${('0' + (newDate.getMonth() + 1)).slice(-2)}/${(
      '0' + newDate.getDate()
    ).slice(-2)}`;
    setFieldValue(type, dateFormatted);
  };

  const VendorPriceListSchema = Yup.object().shape({
    FROM_DATE: Yup.date('Enter your Date').required('From Date is required'),
    TO_DATE: Yup.date('Enter your Date').required('To Date is required'),
    BRAND: Yup.string('Select Brand')
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Choose a Brand'),
    CATEGORY: Yup.array()
      // .of(Yup.string().required('Category name is required'))
      .min(1, 'At least one category is required'),
    PRICE_LIST_NAME: Yup.string()
      .min(2, 'Too Short!')
      .max(500, 'Too Long!')
      .required('Name is required'),
    VENDOR: Yup.string('Select Vendor')
      .min(1, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Vendor is required'),
  });

  const formik = useFormik({
    initialValues: {
      FROM_DATE: status === 'edit' ? edit_id_data.fromdate_converted : '',
      TO_DATE: status === 'edit' ? edit_id_data.todate_converted : '',
      PRICE_LIST_NAME: status === 'edit' ? edit_id_data.name : '',
      NOTE: status === 'edit' ? edit_id_data.note : '',
      BRAND: status === 'edit' ? edit_id_data.brand : '',
      CATEGORY: status === 'edit' ? JSON.parse(edit_id_data.category) : [],
      VENDOR: status === 'edit' ? edit_id_data.vendor_id: '',
       GST: status === 'edit' ? edit_id_data.gst: '',
    },

    validationSchema: VendorPriceListSchema,

    onSubmit: () => {
      let values = {...formik.values};
      let data = {
        PRICE_LIST_NAME: values.PRICE_LIST_NAME,
        FROM_DATE: values.FROM_DATE.split('T')[0],
        TO_DATE: values.TO_DATE.split('T')[0],
        BRAND: values.BRAND,
        CATEGORY: category,
        PRODUCT_DETAILS: productTableData,
        VENDOR: values.VENDOR,
        NOTE: values.NOTE,
        GST: gst ? 1 : 0,
      };
      status === 'create' ? 
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(createVendorPriceListAction(data)),
      ).finally(() => handleClose()) :
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(updateVendorPriceListAction(edit_id_data.id, data)),
      ).finally(() => handleClose())
    },
  });

  const {errors, touched, handleSubmit, getFieldProps, setFieldValue, values} =
    formik;

    useEffect(() =>{
      setTableData([...datas])
      setProductTableData([...datas])
      setBrand(edit_id_data.brand)
    },[status === 'edit', datas.length])

  return (
    <FormikProvider value={formik}>
      <Form autoComplete='off' noValidate onSubmit={formik.handleSubmit}>
        <Card sx={{p: '20px', height: '90vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {display: 'none',},
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE 10+
              }}>
          <Grid
            container
            display='flex'
            flexDirection='row'
            alignItems='center'
            spacing={3}
          >
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
            <Grid container spacing={3}>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography variant='h6'>{'Vendor Price List'}</Typography>
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Grid
                container
                display='flex'
                flexDirection='row'
                alignItems='center'
                spacing={2}
              > */}
                {/* <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                  <Typography>{'Name'}</Typography>
                </Grid> */}
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <TextField
                    required
                    fullWidth
                    variant='filled'
                    label='Price List Name'
                    name='PRICE_LIST_NAME'
                    type='text'
                    {...getFieldProps('PRICE_LIST_NAME')}
                    error={Boolean(
                      touched.PRICE_LIST_NAME && errors.PRICE_LIST_NAME,
                    )}
                    helperText={
                      touched.PRICE_LIST_NAME && errors.PRICE_LIST_NAME
                    }
                  />
                </Grid>
              {/* </Grid>
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Grid
                container
                display='flex'
                flexDirection='row'
                alignItems='center'
                spacing={2}
              > */}
                {/* <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                  <Typography>{'Date'}</Typography>
                </Grid> */}
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label={'From Date'}
                      value={toMomentOrNull(values.FROM_DATE)}
                      format='DD/MM/YYYY'
                      onChange={(e) => handleDateChange(e, 'FROM_DATE')}
                      views={['year', 'month', 'day']}
                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: Boolean(touched.FROM_DATE && errors.FROM_DATE), helperText: touched.FROM_DATE && errors.FROM_DATE } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label={'To Date'}
                      value={toMomentOrNull(values.TO_DATE)}
                      format='DD/MM/YYYY'
                      onChange={(e) => handleDateChange(e, 'TO_DATE')}
                      views={['year', 'month', 'day']}
                      slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: Boolean(touched.TO_DATE && errors.TO_DATE), helperText: touched.TO_DATE && errors.TO_DATE } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                <Grid container>
                <Grid
                  display='flex'
                  justifyContent='space-between'
                  alignItems='center'
                  size={{
                    lg: 1,
                    md: 1,
                    sm: 1,
                    xs: 1
                  }}>
                  <Typography>{'or'}</Typography>
                </Grid>
                <Grid
                  size={{
                    lg: 11,
                    md: 11,
                    sm: 11,
                    xs: 11
                  }}>
                  <FormControl fullWidth>
                    <InputLabel id='demo-simple-select-label'>
                      {'Select Month'}
                    </InputLabel>
                    <Select
                      labelId='demo-simple-select-label'
                      id='demo-simple-select'
                      value={values.MONTH}
                      label='Select Month'
                      variant='filled'
                      onChange={(e) => handleChange(e, 'MONTH')}
                      disabled={Boolean(values.FROM_DATE || values.TO_DATE)}
                    >
                      {monthList.length > 0 ? (
                        monthList.map((item) => {
                          return (
                            <MenuItem key={item.name} value={item.month}>
                              {item.name}
                            </MenuItem>
                          );
                        })
                      ) : (
                        <MenuItem value={new Date().getMonth() + 1}></MenuItem>
                      )}
                    </Select>
                  </FormControl>
                  </Grid>
                  </Grid>
                </Grid>
              {/* </Grid>
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Grid
                container
                display='flex'
                flexDirection='row'
                alignItems='center'
                spacing={2}
              > */}
                {/* <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                  <Typography>{'Vendor'}</Typography>
                </Grid> */}
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    disablePortal
                    name='VENDOR'
                    value = {values?.VENDOR ? vendor.find((f)=> f.supplier_id === values?.VENDOR) : {company_name : ''}  }
                    fullWidth
                    options={vendor}
                    getOptionLabel={(option) => option.company_name}
                    onChange={(event, value) => {
                      setFieldValue('VENDOR', value.supplier_id);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name='VENDOR'
                        label='Vendor'
                        variant='filled'
                        required
                        error={Boolean(touched.VENDOR && errors.VENDOR)}
                        helperText={touched.VENDOR && errors.VENDOR}
                      />
                    )}
                  />
                  {/* <FormControl fullWidth required>
                    <InputLabel id='demo-multiple-name-label'>
                      {'Select User'}
                    </InputLabel>
                    <Select
                      name='empName'
                      multiple
                      value={selectedNames}
                      onChange={(e) => {
                        handleVendorChange(e, 'VENDOR');
                      }}
                      renderValue={(selected) => {
                        return (
                          <Stack gap={1} direction='row' flexWrap='wrap'>
                            {selected.includes('') ? (
                              <Chip
                                key=''
                                label='All Vendor'
                                onDelete={() => {
                                  setSelectedNames([]);
                                }}
                                deleteIcon={
                                  <CommonToolTip title='Cancel'>
                                    {' '}
                                    <CancelIcon
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      }
                                    />{' '}
                                  </CommonToolTip>
                                }
                              />
                            ) : (
                              selected.map((value) => {
                                const vendorName = vendor.find(
                                  (v) => v.supplier_id === value,
                                );
                                return (
                                  <Chip
                                    key={value}
                                    label={
                                      vendorName ? vendorName.company_name : ''
                                    }
                                    onDelete={() => {
                                      setSelectedNames(
                                        selectedNames.filter(
                                          (v) => v !== value,
                                        ),
                                      );
                                    }}
                                    deleteIcon={
                                      <CommonToolTip title='Cancel'>
                                        {' '}
                                        <CancelIcon
                                          onMouseDown={(event) =>
                                            event.stopPropagation()
                                          }
                                        />{' '}
                                      </CommonToolTip>
                                    }
                                  />
                                );
                              })
                            )}
                          </Stack>
                        );
                      }}
                    >
                      <MenuItem value=''>{'All Vendors'}</MenuItem>
                      {vendor.map((v) => (
                        <MenuItem
                          key={v.supplier_id}
                          value={v.supplier_id}
                          disabled={selectedNames.includes('')}
                        >
                          {v.company_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl> */}
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    disablePortal
                    name='BRAND'
                    fullWidth
                    value={values?.BRAND ? product_all_brand.find((f)=> f.brand === values.BRAND) : {brand : ''}}
                    options={product_all_brand}
                    getOptionLabel={(option) => option.brand || ''}
                    onChange={(event, newValue) => {
                      setBrand(newValue === null ? '' : newValue.brand);
                      setFieldValue('BRAND', newValue === null ? '' : newValue.brand);
                      setCategory([])
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Brand'
                        name='BRAND'
                        variant='filled'
                        required
                        error={Boolean(touched.BRAND && errors.BRAND)}
                        helperText={touched.BRAND && errors.BRAND}
                      />
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <Autocomplete
                    disablePortal
                    multiple
                    name='CATEGORY'
                    fullWidth
                    value={category}
                    options={categoryBasedOnBrand}
                    getOptionLabel={(option) => option.category || ''}
                    onChange={(event, newValue) => {
                      setCategory(newValue.length === 0 ? [] : newValue);
                      setFieldValue(
                        'CATEGORY',
                        newValue.length === 0 ? [] : newValue.category,
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Category'
                        name='CATEGORY'
                        variant='filled'
                        required
                        error={Boolean(touched.CATEGORY && errors.CATEGORY)}
                        helperText={touched.CATEGORY && errors.CATEGORY}
                        sx={{
                          '& .MuiFilledInput-root': {
                            minHeight:'46px !important',
                            height: 'auto !important',
                            paddingTop : '10px'
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid
                  display='flex'
                  justifyContent='center'
                  size={{
                    lg: 3,
                    md: 3,
                    sm: 6,
                    xs: 12
                  }}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          sx={{ m: 2 }}
                          name="INCLUDE_GST"
                          checked={gst}            
                          onChange={handleGst}     
                        />
                      }
                      label='Include GST'
                    />
                  </FormGroup>
                </Grid>
              {/* </Grid>
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
              <Grid container display='flex' flexDirection='row' spacing={2}> */}
                {/* <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
                  <Typography>{'Note'}</Typography>
                </Grid> */}
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 12,
                    xs: 12
                  }}>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    label='Note'
                    name='NOTE'
                    type='text'
                    variant='filled'
                    {...getFieldProps('NOTE')}
                  />
                </Grid>
              {/* </Grid>
            </Grid> */}
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Card
                sx={{
                  borderRadius: '20px',
                  // '&:hover': {boxShadow: `0px 12px 15px #d8f0ce`},
                }}
              >
                <MaterialTable
                  options={{
                    vendorHeaderStyle,
                    cellStyle,
                    exportButton: true,
                    filtering: false,
                    actionsColumnIndex: -1,
                    pageSize: 20,
                    pageSizeOptions: [20, 50, 100],
                    headerStyle: {
                      backgroundColor: '#F4F7FE',
                      maxBodyHeight:maxBodyHeight,
                      minBodyHeight:maxBodyHeight
                    },
                  }}
                  style={{backgroundColor: '#F4F7FE'}}
                  components={{
                    Action: (props) => {
                      if (
                        typeof props.action === typeof Function ||
                        props.action.tooltip !== 'Add'
                      ) {
                        return <MTableAction {...props} />;
                      } else {
                        return (
                          <div
                            ref={addActionRef}
                            onClick={props.action.onClick}
                          />
                        );
                      }
                    },
                  }}
                  actions={[
                    {
                      icon: 'add',
                      tooltip: 'add',
                      isFreeAction: true,
                      onClick: (event, rowData) => {
                        addActionRef.current.click();
                        setAddClick(!addClick);
                      },
                    },
                  ]}
                  editable={{
                    onRowAddCancelled: () => setAddClick(false),
                    isEditable: () => true,
                    isBulkEditable: () => true,
                    onRowAdd: (newData) =>
                      new Promise((resolve, reject) => {
                        setTimeout(() => {
                          setAddClick(false);
                          setLineCount(lineCount + 1);

                          setTableData([...tableData, newData]);
                          setProductTableData([...productTableData, newData]);

                          setTimeout(() => {
                            addActionRef.current.click();
                          }, 0);

                          resolve();
                        }, 1000);
                      }),
                    onRowUpdate: (newData, oldData) =>
                      new Promise((resolve, reject) => {
                        console.log('onrowupdate', newData, oldData)
                        setTimeout(() => {
                          setAddClick(false);
                          // setLineCount(lineCount + 1);
                          const dataUpdate = [...productTableData];
                          const index = oldData.tableData.index;
                          dataUpdate[index] = newData;
                          console.log('dataupdate', dataUpdate)
                          setTableData([...dataUpdate]);
                          setProductTableData([...dataUpdate]);
                          // setLineCount(lineCount + 1);

                          resolve();
                        }, 1000);
                      }),
                    onRowDelete: (oldData) =>
                      new Promise((resolve, reject) => {
                        setTimeout(() => {
                          const dataDelete = [...productTableData];
                          const index = oldData.tableData.index; 
                          dataDelete.splice(index, 1);
                          setTableData([...dataDelete]);
                          setProductTableData([...dataDelete]);
                          resolve();
                        }, 1000);
                      }),

                  }}
                  columns={[
                    {
                      field: 'name',
                      title: 'Product',
                      cellStyle: {
                        whiteSpace: 'wrap',
                      },
                      width: '50px',
                      validate: (rowData) => (!rowData.name ? false : true),
                      editComponent: (props) => (
                        <Autocomplete
                          getOptionLabel={(option) => option.name}
                          value={{name: props.value || ''}}
                          onChange={async (e, newValue) => {
                            if (newValue) {
                              if (Array.isArray(product)) {
                                const data = product.find(
                                  (d) => d.name === newValue.name,
                                );

                                if (data) {
                                  const {
                                    name,
                                    item_id,
                                    description,
                                    cost_price: item_cost_price,
                                    unit_price: item_unit_price,
                                    taxes,
                                    qty_per_pack,
                                    is_serialized,
                                    hsn_code,
                                    max_price,
                                    model,
                                  } = data;

                                  let gst;
                                  let tax_category;
                                  taxes.forEach((t) => {
                                    if (t.tax_group === 'IGST') {
                                      gst = t.tax_rate;
                                      tax_category = t.tax_category;
                                    }
                                  });

                                  await props.onRowDataChange({
                                    ...props.rowData,
                                    name,
                                    item_id,
                                    description,
                                    item_cost_price,
                                    item_unit_price,
                                    received_quantity: 0,
                                    ordered_quantity: 1,
                                    gst,
                                    tax_category,
                                    quantity: 1,
                                    taxes: data.taxes,
                                    qty_per_pack,
                                    is_serialized,
                                    line: lineCount,
                                    hsn_code,
                                    max_price,
                                    model,
                                  });
                                }
                              }
                            } else {
                              props.onChange('');
                            }
                          }}
                          id='controllable-states-demo'
                          options={
                            Array.isArray(product)
                              ? product.filter(
                                  (p1) =>
                                    !tableData.some(
                                      (s1) => p1.item_id === s1.item_id,
                                    ) && p1.stock_type === 1,
                                )
                              : []
                          }
                          filterOptions={filterOptions}
                          sx={{width: 350}}
                          renderInput={(params) => {
                            const get = {...params};

                            get.InputProps = {
                              ...params.InputProps,
                              style: {
                                paddingLeft: '1px',
                              },
                              startAdornment: (
                                <Tooltip title='Create New'>
                                  <IconButton
                                    size='small'
                                    onClick={() => {
                                      setModalStatusHandler(true);
                                      setModalTypeHandler('product');
                                      if (addClick) {
                                        addActionRef.current.click();
                                        setAddClick(false);
                                      }
                                    }}
                                  >
                                    <Add fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              ),
                            };

                            return <TextField variant='filled' {...get}/>;
                          }}
                          // renderInput={(params) => {
                          //   const get = {...params};
                          //   return <TextField {...get} autoFocus />;
                          // }}
                        />
                      ),
                    },
                    {
                      field: 'item_cost_price',
                      title: 'Dealer Price',
                      type: 'numeric',
                      cellStyle: {
                        textAlign: 'right',
                      },
                      validate: (rowData) =>
                        Boolean(rowData.item_cost_price > 1),
                        // editComponent: (prop) => (
                        //   <TextField
                        //   variant='filled'
                        //   id="salesId"
                        //     //label="Length"
                        //     // ref={inputRef}
                         
                        //     placeholder='Dealer Price'
                        //     name='item_cost_price'
                        //     value={prop.value}
                        //     sx={{width:"100px"}}
                        //     type='number'
                         
                        //     onChange={(e) =>
                        //       prop.onRowDataChange({
                        //         ...prop.rowData,
                        //         dealerPrice: e.target.value,
                        //         item_cost_price : e.target.value
                        //       })
                        //     }
                        //     error={
                        //       prop.value !== undefined ? prop.error : false
                        //     }
                        //     // helperText = {props.error  ? "Amount Required" : ''}
                        //   />
                        // ),
                    },
                    {
                      field: 'sellingPrice',
                      title: 'Selling Price',
                      type: 'numeric',
                      cellStyle: {
                        textAlign: 'right',
                      },
                      validate: (rowData) => Boolean(rowData.sellingPrice > 1),
                    },
                    {
                      field: 'mrp',
                      title: 'MRP',
                      type: 'numeric',
                      cellStyle: {
                        textAlign: 'right',
                      },
                      validate: (rowData) => Boolean(rowData.mrp > 1),
                    },
                    {
                      field: 'tax_category',
                      title: 'Tax Category',
                      editable: 'never',
                    },
                    {
                      field: 'margin',
                      title: 'Margin',
                      type: 'numeric',
                      cellStyle: {
                        textAlign: 'right',
                      },
                      render: (rowData) => {
                        rowData.margin = calculateMarginPercentage(
                          rowData?.item_cost_price,
                          rowData?.sellingPrice,
                        );
                        return (
                          <Chip
                            label={calculateMarginPercentage(
                              rowData?.item_cost_price,
                              rowData?.sellingPrice,
                            )}
                            sx={{minWidth: '50px'}}
                          />
                        );
                      },
                      editComponent: (props) => {
                        return (
                          <Chip
                            label={calculateMarginPercentage(
                              props.rowData?.item_cost_price,
                              props.rowData?.sellingPrice,
                            )}
                            sx={{minWidth: '50px'}}
                          />
                        );
                      },
                    },
                  ]}
                  icons={{
                    Add: () => <AddIcon />,
                  }}
                  data={tableData}
                  title={<Typography variant='h6'>{'Product'}</Typography>}
                />
              </Card>
            </Grid>
            </Grid>
          </Grid>

            {/*--------------------------------------------------------------------------------------- button ----------------------------------------------------------------------------------------*/}

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid
                container
                display='flex'
                flexDirection='row'
                justifyContent='flex-end'
                spacing={7}
              >
                <Grid>
                  <Button
                    onClick={() => handleClose()}
                    type='button'
                    variant='outlined'
                    color='secondary'
                    size='medium'
                  >
                    Cancel
                  </Button>
                </Grid>

                <Grid>
                  <Button
                    onClick={handleSubmit}
                    type='submit'
                    variant='outlined'
                    color='primary'
                    size='medium'
                    disabled={productTableData.length ? false : true}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Form>
    </FormikProvider>
  );
}

export default NewVendorPriceList;

NewVendorPriceList.propTypes = {
  handleClose: PropTypes.func,
};

