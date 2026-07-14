import React, { useState, useEffect, useContext, useRef } from 'react';
import context from '../context/CreateNewButtonContext';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import { OpenalertActions } from '../../src/redux/actions/alert_actions';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import {
  Button,
  Switch,
  TextField,
  Typography,
  Grid,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  FormHelperText,
  FormControlLabel,
  Link,
  Tooltip,
  IconButton,
  Radio,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Input,
  FormLabel,
  Card,
} from '@mui/material';
import { Close, FileUpload } from '@mui/icons-material';
import { base_url } from '../http-common';
import { getTrimmedData } from './trimFunction/index';
import AddIcon from '@mui/icons-material/Add';
import { whitespace } from 'stylis';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import { headerStyle } from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import { ProductUpdate } from '../../src/redux/actions/load';
import { GetAllProductBrand, GetAllProductCategory, getHsnCodeAction, listProductAction, purchaseProductTaxesAction } from 'redux/actions/product_actions';
import { listTaxCategoryAction } from 'redux/actions/tax_Category_actions';
import { ProperCaseFunc } from 'utils/properCase';
import ProductAttachment from './widgetsDashboard/ProductAttachment';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from "dayjs";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { GetUnitsLovAction } from 'redux/actions/termsConditions_actions';
import { getIgst } from './pos/checkout_products/commonTax';
import { requiredFieldsAlertMessage } from 'utils/content';
import { getEinvoiceDetailsAction } from 'redux/actions/app_config_actions';
import toMomentOrNull from 'utils/DateFixer';

function NewProduct(props) {

  const {
    productReducer: { check_product, hsnCode },
    TermsConditionsReducers: { getUnitsLov }
  } = useSelector((state) => state);

  const { productReducer: { product_all_brand, product_all_category, get_tax_rate }, taxCategoryReducer: { taxcategory }, appConfigReducer: { getEinvoiceDetails }, salesReducer: {getAllProductSalesHistory}, purchasesReducer: {getProductPurchaseHistory} } = useSelector(state => state)

  const [selectedDate, setSelectedDate] = useState(null);
  const [formValues, setFormValues] = useState({
    name: null,
    sku: null,
    pic_filename: [],
    brand: null,
    category: null,
    description: null,
    cost_price: null,
    unit_price: null,
    max_price: null,
    reorder_level: 0,
    automatic_reorder_level: false,
    is_serialized: true,
    is_expiry: false,
    expiry_date: selectedDate,
    stock_type: true,
    qty_per_pack: '1',
    pack_name: getUnitsLov.find((unit) => unit.unit === 'nos') || null,
    hsn_code: null,
    gst_preference: 'Taxable',
    tax_category_id: null,
    model: null,
    variant: null,
    warranty_months: null,
    lifecycle_months: null,
    stockLimit: false,
    limit: null,
    cost_price_includes_gst: false,
    unit_price_includes_gst: false
  }); //supplier_id: null,item_number: null,receiving_quantity: null,allow_alt_description: null,stock_type: null,item_type: null,,low_sell_item_id: null});
  const [formErrors, setFormErrors] = useState({
    name: null,
    sku: null,
    pic_filename: null,
    brand: null,
    category: null,
    description: null,
    unit_price: null,
    max_price: null,
    reorder_level: null,
    automatic_reorder_level: null,
    is_serialized: null,
    stock_type: null,
    qty_per_pack: null,
    pack_name: null,
    hsn_code: null,
    gst_preference: null,
    tax_category_id: null,
    limit: null
    // warranty_months: null,
    // lifecycle_months: null
  });
  console.log(formValues, 'formValuessss')
  const [requiredFields, setRequiredFields] = useState([
    'name',
    'brand',
    'category',
    'unit_price',
    'max_price',
    // 'hsn_code',
    'gst_preference'
  ]);

  if (formValues.gst_preference === 'Taxable') {
    requiredFields.push('tax_category_id');
    requiredFields.push('hsn_code');
  }

  const [regex] = useState({});
  const [value, setValue] = React.useState([]);
  const [brandValue, setBrandValue] = React.useState([]);
  const { selectData, setselectData } = useContext(context);
  const [imgName, setImgName] = useState('');
  const [imgType, setImgType] = useState(null);
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [imageStatus, setimageStatus] = useState(false);
  const [disable, setDisable] = useState(false);
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(false)
  const [unitSet, setUnitSet] = useState(null)
  const [imageKeys, setImageKeys] = useState([])
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const temptaxedits = useRef(null);
  const costPriceRef = useRef(null);
  const unitPriceRef = useRef(null);

  if (limit) {
    requiredFields.push('limit')
  }

  const handleDateChange = (newValue) => {
    setFormValues((prev) => ({
      ...prev,
      expiry_date: newValue ? newValue.format("YYYY-MM-DD") : null,
    }));
  };

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []); 

  useEffect(() => {
    if (formValues.brand && formValues.category) {
      let data = {
        brand: formValues.brand,
        category: formValues.category,
      }
      dispatch(getHsnCodeAction(data));
    }
  }, [formValues.brand, formValues.category]);

  const hsncode = async()=>{
        if (
      formValues.stock_type === true &&
      formValues.brand &&
      formValues.category &&
      hsnCode?.length > 0 &&
      hsnCode[0]?.hsn_code && props.status !== 'edit'
    ) {
      setFormValues((prev) => ({
        ...prev,
        hsn_code: hsnCode[0]?.hsn_code,
      }));
  
      setFormErrors((prev) => ({
        ...prev,
        hsn_code: null,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        hsn_code: '',
      }));
  
      setFormErrors((prev) => ({
        ...prev,
        hsn_code: null,
      }));
    }
  }

  useEffect(()=>{
    if(props.status !== 'edit'){
      hsncode()
    }
  },[props.status])

  // useEffect(() => {
  //   console.log("initial",hsnCode)
  //   if (
  //     formValues.stock_type === true &&
  //     formValues.brand &&
  //     formValues.category &&
  //     hsnCode?.length > 0 &&
  //     hsnCode[0]?.hsn_code && props.status !== 'edit'
  //   ) {
  //     setFormValues((prev) => ({
  //       ...prev,
  //       hsn_code: hsnCode[0]?.hsn_code,
  //     }));
  
  //     setFormErrors((prev) => ({
  //       ...prev,
  //       hsn_code: null,
  //     }));
  //   } else {
  //     setFormValues((prev) => ({
  //       ...prev,
  //       hsn_code: '',
  //     }));
  
  //     setFormErrors((prev) => ({
  //       ...prev,
  //       hsn_code: null,
  //     }));
  //   }
  // }, [
  //   formValues.stock_type,
  //   formValues.brand,
  //   formValues.category,
  //   hsnCode,
  // ]);

  

  useEffect(() => {
    if (formValues.stock_type === true) {
      setRequiredFields(prev => prev.filter(field => field !== 'max_price').concat('unit_price'));
    } else if (formValues.stock_type === false) {
      setRequiredFields(prev => prev.filter(field => field !== 'unit_price').concat('max_price'));
    }
  }, [formValues.stock_type])

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };
  tempinits.current = inits;
  useEffect(() => {
    tempinits.current();
  }, [formValues, initialState]);

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const warrantyLifecycle = {
    setVal(val, field, type) {
      const temp = formValues[field];
      let y = parseInt(temp / 12);
      let m = temp % 12;

      let total = 0;
      if (type === 'M') {
        total = +val + y * 12;
      } else {
        total = m + +val * 12;
      }

      handleChange({ target: { name: field, value: total } })

    },
    getVal(field, type) {
      const temp = formValues[field];
      let y = parseInt(temp / 12);
      let m = temp % 12;
      return type === 'M' ? m : y
    }
  }

  const handleChange = async (e) => {
    let { name, value } = e.target;

    setStateHandler(name, value);
  };

  const filter = createFilterOptions();

  const handleCheck = (e) => {
    let { name, checked , value, type} = e.target;

    const formData = { ...formValues };

      let finalValue;

    if (type === "checkbox") {
      finalValue = checked;
    } else {
      if (value === true || value === "true") finalValue = true;
      else if (value === false || value === "false") finalValue = false;
      else finalValue = value;

    }

    if (name === "stockLimit") {
      if (finalValue === true) {
        formData.stockLimit = true;
      }

      // Disable
      if (finalValue === false) {
        formData.stockLimit = false;
        formData.limit = null;
        setFormErrors(prev => ({ ...prev, limit: null }));
      }
    }

    if (name === 'automatic_reorder_level' && !checked) {
    formData.reorder_level = null;
  }
  
    if (name === "is_expiry") {
      if (!finalValue) {
        setFormValues(prev => ({ ...prev, is_expiry: false, expiry_date: null }));
      } else {
        setFormValues(prev => ({ ...prev, is_expiry: true }));
      }
    }

    if (name === 'limit_switch') {
    setLimit(checked); 

    if (!checked) {
      formData.limit = null;

      setFormErrors((prevErrors) => ({
        ...prevErrors,
        limit: null,
      }));
    }
  }
    if (name === 'service' && checked === true) {
      formData.reorder_level = '';
      formData.is_serialized = false;
      formData.automatic_reorder_level = false;
      formData.pack_name = '';
      formData.qty_per_pack = '';
      formData.stock_type = false;
      formData.unit_price = null;
      formData.cost_price = null;
      setRequiredFields(prev => prev.filter(field => field !== 'unit_price').concat('max_price'));
    } else if (name === 'goods' && checked === true) {
      formData.stock_type = true;
      formData.is_serialized = true;
      formData.qty_per_pack = 1;
      formData.pack_name = unitSet;
      formData.reorder_level = 0;
      setRequiredFields(prev => prev.filter(field => field !== 'max_price').concat('unit_price'));
    }

    if (name !== 'goods' && name !== 'service') {
      setFormValues({ ...formData, [name]: finalValue  });
    } else {
      setFormValues({ ...formData });
    }
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};

    if (name === 'brand' || name === 'category') {
      formObj = {
        ...formValues,
        [name]: value === '' ? null : brandcapitalize(value),
      };
    } else {
      formObj = {
        ...formValues,
        [name]: value === '' ? null : value,
      };
    }

    if (name === 'pack_name') {
      setUnitSet(value)
    }

    if (name === 'gst_preference' && value === 'Non-Taxable') {
    formObj.tax_category_id = null;
    formObj.hsn_code = null;
    setFormErrors((prev) => ({
      ...prev,
      tax_category_id: null,
      hsn_code: null
    }));
  }

    await setFormValues(formObj);
    validationHandler(name, value);
  };

  const handleAutoCompleteChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value })
    validationHandler(name, value)
  }

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;
  
    // Check required
    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value || {}) && value?.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    }
  
  else if (name === 'name' && value.trim().length < 3) {
      setFormErrors({
        ...formErrors,
        [name]: 'Product name must be at least 3 characters long!',
      });
    }
  else if (
      name === 'unit_price' &&
      formValues.stock_type === true &&
      value !== null &&
      value !== '' &&
      Number(value) === 0
    ) {
      setFormErrors({
        ...formErrors,
        [name]: 'Selling Price must be greater than 0!',
      });
    }
  
    // Regex validation if applicable
    else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
      }
    }
  
    // Default: valid
    else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };
  
  useEffect(() => {
    if (formValues.unit_price_includes_gst !== null && unitPriceRef.current) {
      unitPriceRef.current.focus();
    }
  }, [formValues.unit_price_includes_gst]);

  useEffect(() => {
    if (formValues.cost_price_includes_gst !== null && costPriceRef.current) {
      costPriceRef.current.focus();
    }
  }, [formValues.cost_price_includes_gst]);


  const handleGSTChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
      unit_price: name === "unit_price_includes_gst" ? (value !== prev.unit_price_includes_gst ? null : prev.unit_price) : prev.unit_price,
      cost_price: name === "cost_price_includes_gst" ? (value !== prev.cost_price_includes_gst ? null : prev.cost_price) : prev.cost_price,
    }));

    if (name === "unit_price_includes_gst" && unitPriceRef.current) {
      setTimeout(() => unitPriceRef.current.focus(), 0);
    }

    if (name === "cost_price_includes_gst" && costPriceRef.current) {
      setTimeout(() => costPriceRef.current.focus(), 0);
    }
  };


  const capitalize = (s) => {

    if (typeof s !== 'string') return '';
    return s
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const brandcapitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.toUpperCase();
  };

  useEffect(() => {
    if (formValues.tax_category_id != null) {

      dispatch(purchaseProductTaxesAction(formValues.tax_category_id))
    }
  }, [formValues.tax_category_id])

  
  const einvoiceEnabled = getEinvoiceDetails?.some(
      (item) => item.key_name === 'company.einvoice' && item.value === '1'
    );

  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    const requiredFields = [
      'name', 'brand', 'category', 'unit_price', 'gst_preference', 'tax_category_id', 'hsn_code'
    ];

    const requiredFields1 = [
      'name', 'brand', 'category', 'unit_price', 'gst_preference'
    ];

    const requireds = formValues.gst_preference === 'Taxable' ? requiredFields : requiredFields1

    if (einvoiceEnabled) {
      requireds.push('hsn_code');

      const hsnValue = formValues['hsn_code']?.toString().trim();
      const hsnPattern = /^(?!0+$)(\d{4}|\d{6}|\d{8})$/;

      if (!hsnPattern.test(hsnValue)) {
        isValid = false;
        formErrorsObj['hsn_code'] = 'Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)';
      }
    }

    for (let key of requireds) {
      const value = formValues[key];
      if (value === null || value === '' || value === undefined) {
        isValid = false;
         formErrorsObj[key] = `${key === 'hsn_code' ? 'HSN Code' : capitalize(key)} is Required!`;
      }
    }

    if (
      formValues.stock_type === true &&
      formValues.unit_price !== null &&
      formValues.unit_price !== '' &&
      Number(formValues.unit_price) === 0
    ) {
      isValid = false;
      formErrorsObj.unit_price = 'Selling Price must be greater than 0!';
    }

    const hsnValue = formValues['hsn_code']?.toString().trim();
    const hsnPattern = /^(?!0+$)(\d{4}|\d{6}|\d{8})$/;

    if (limit && (formValues.limit === '' || formValues.limit === null || formValues.limit === undefined)) {
      isValid = false;
      formErrorsObj.limit = 'Minimal Stock Limit is required';
    }

    if (hsnValue && !hsnPattern.test(hsnValue)) {
      isValid = false;
      formErrorsObj['hsn_code'] = 'Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)';
    }

    if (formValues.pic_filename?.length > 6) {
      isValid = false;
      formErrorsObj.pic_filename = 'Only 6 Images are allowed!';
    }

    for (let key in regex) {
      const value = formValues[key];
      if (value && !regex[key].test(value)) {
        isValid = false;
        formErrorsObj[key] = `${capitalize(key)} is Invalid!`;
      }
    }


    await setFormErrors(formErrorsObj);
    if (isValid) {
      setDisable(true);

      const {
        name,
        sku,
        pic_filename,
        brand,
        category,
        description,
        cost_price,
        unit_price,
        max_price,
        reorder_level,
        automatic_reorder_level,
        is_serialized,
        stock_type,
        qty_per_pack,
        pack_name,
        hsn_code,
        is_expiry,
        expiry_date,
        gst_preference,
        tax_category_id,
        item_id,
        model,
        variant,
        lifecycle_months,
        warranty_months,
        limit,
        cost_price_includes_gst,
        unit_price_includes_gst
      } = formValues;
      const formValData = {
        name,
        sku,
        pic_filename: pic_filename?.length > 0 ? pic_filename : null,
        brand,
        category,
        description,
        cost_price: cost_price === null
          ? 0
          : (gst_preference === "Taxable" && cost_price_includes_gst)
            ? Number(cost_price / (1 + (getIgst({ taxes: get_tax_rate }) / 100))).toFixed(2)
            : cost_price,
        unit_price: unit_price === null
          ? 0
          : (gst_preference === "Taxable" && unit_price_includes_gst)
            ? Number(unit_price / (1 + (getIgst({ taxes: get_tax_rate }) / 100))).toFixed(2)
            : unit_price,
        max_price: max_price === null ? 0 : max_price,
        reorder_level,
        automatic_reorder_level,
        is_serialized,
        stock_type: stock_type === true ? 1 : 0,
        qty_per_pack,
        pack_name: pack_name ? pack_name.id : null,
        hsn_code,
        is_expiry,
        expiry_date,
        gst_preference,
        tax_category_id,
        item_id,
        model,
        variant,
        lifecycle_months,
        warranty_months,
        limit,
        imageKeys,
        cost_price_includes_gst: cost_price_includes_gst === true ? 1 : 0,
        unit_price_includes_gst: unit_price_includes_gst === true ? 1 : 0
      };


    props.handleSubmit(getTrimmedData(formValData), setDisable);
     props.setParentEditIdData([]);
      props.handleClose()
    }
    else {
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetUnitsLovAction());
    dispatch(getEinvoiceDetailsAction())
  }, [])


  useEffect(() => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      if (check_product[0]?.total > 0) {
        dispatch(OpenalertActions({ msg: 'Already this product used cannot be update some field or delete', severity: 'warning' }));
      }
    }
  }, [])

    // useEffect(() => {
    // if (props.status === 'edit' && props.edit_id_data) {
    //   console.log("edit hsn")
    //   setFormValues((prev) => ({
    //     ...prev,
    //     hsn_code: props.edit_id_data.hsn_code || '',
    //     }));
    //   }
    // }, [props.status, props.edit_id_data]);


  useEffect(() => {
    if (formValues.pic_filename?.length > 6) {
      setFormErrors({
        ...formErrors,
        pic_filename: 'Only 6 Images are allowed!'
      })
    }
    else {
      setFormErrors({
        ...formErrors,
        pic_filename: null
      })
    }
  }, [formValues.pic_filename])

  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId, } = useContext(context);
  console.log(getEinvoiceDetails, "getEinvoiceDetails")
  useEffect(() => {
    dispatch(GetAllProductBrand('', setLoaderStatusHandler));
    dispatch(GetAllProductCategory('', setLoaderStatusHandler));
    dispatch(listTaxCategoryAction('', setLoaderStatusHandler));

  }, [])

  const edits = async () => {
    console.log(props.edit_id_data, 'editData')
    if (props.edit_id_data[0] && props.status === 'edit' && getUnitsLov.length > 0) {
      const getUnit = getUnitsLov.find(e => e.id == props.edit_id_data[0].pack_name)
      await setFormValues({
        ...props.edit_id_data[0],
        pic_filename: props.edit_id_data[0].imageUrl,
        stock_type: props.edit_id_data[0].stock_type === 1 ? true : false,
        pack_name: getUnit,
        cost_price_includes_gst: props.edit_id_data[0]?.cost_price_includes_gst === 0 ? false : true,
        unit_price_includes_gst: props.edit_id_data[0]?.unit_price_includes_gst === 0 ? false : true,
        hsn_code:props.edit_id_data[0]?.hsn_code || '',
      });
      setImageKeys(props.edit_id_data[0].pic_filename)

      await setUnitSet({
        ...props.edit_id_data[0],
        pack_name: getUnit,
        cost_price_includes_gst: props.edit_id_data[0]?.cost_price_includes_gst === 0 ? false : true,
        unit_price_includes_gst: props.edit_id_data[0]?.unit_price_includes_gst === 0 ? false : true,
      })

      await setInitialState({
        ...props.edit_id_data[0],
        stock_type: props.edit_id_data[0].stock_type === 1 ? true : false,
        cost_price_includes_gst: props.edit_id_data[0]?.cost_price_includes_gst === 0 ? false : true,
        unit_price_includes_gst: props.edit_id_data[0]?.unit_price_includes_gst === 0 ? false : true,
      });

      if (props.edit_id_data[0].pic_filename) {
        if (Array.isArray(props.edit_id_data[0]?.imageUrl)) {
          // const imgName = props.edit_id_data[0].pic_filename.map((e) => e.split('/')[2].slice(0, 10) + '...')
          const imgName = props.edit_id_data[0].imageUrl
          setImgName(imgName)
          setimageStatus(true)
        }
        else {
          // const imgName = props.edit_id_data[0].pic_filename.split('/')[2].slice(0, 10) + '...';
          const imgName = props.edit_id_data[0].imageUrl
          setImgName(imgName);
          setimageStatus(true);
        }
      } else {
        setImgName('');
        setimageStatus(false);
      }
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data, getUnitsLov]);

  useEffect(() => {
    if (props.status !== 'edit' && getUnitsLov.length > 0) {
      const defaultUnit = getUnitsLov.find((unit) => unit.unit === 'nos')
      if (defaultUnit) {
        setFormValues((prev) => ({ ...prev, pack_name: defaultUnit }))
      }
    }
  }, [getUnitsLov])

  const texedits = () => {
    if (selectData?.taxcategory) {
      const filter = [...taxcategory];
      const pops = filter.pop();
      setFormValues({ ...formValues, tax_category_id: pops.tax_category_id });
      setFormErrors({ ...formErrors, tax_category_id: false });
      setselectData('taxcategory', false);
    }
  };
  temptaxedits.current = texedits;
  useEffect(() => {
    temptaxedits.current();
  }, [selectData?.taxcategory]);

  function encodeImageFileAsURL(element) {
    var file = element.target.files[0];
    if (file) {
      if (imgName !== file.name) {
        setImgName(file.name);
        setImgType(file.type);
      }
    }
    setFormValues({ ...formValues, pic_filename: element.target.files[0] });
    var reader = new FileReader();
    reader.onloadend = function () {
      setFormValues({ ...formValues, pic_filename: reader.result });
      setimageStatus(false);
    };
    reader.readAsDataURL(file);
  }

  function deleteFile(e) {
    setFormValues({ ...formValues, pic_filename: null });
    setImgName('');
    setImgType(null);
    setOpen(false);
  }

  useEffect(() => {
    if (formValues.limit !== null && formValues.limit !== 'null') {
      setLimit(true);
    } else {
      setLimit(false);
    }
  }, [formValues.limit]);

  
  console.log( 'get_tax_rate',formValues)

  return (
    <Card sx={{ p: 3 }}>
      {Prompt}
      <Typography variant='h6' align='left'>
        {props.edit_id_data.length > 0 ? `Edit Product` : 'New Product'}
      </Typography>
        <Grid container spacing={3} style={{ height: 'calc(100vh - 100px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box'}}>
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
              <Typography align='left' variant='h6'>
                Product Details
              </Typography>
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                required={true}
                style={{}}
                fullWidth={true}
                placeholder='Enter Product Name'
                label=' Product Name'
                name='name'
                value={formValues.name === null ? '' : formValues.name}
                color='primary'
                multiline={false}
                type='text'
                regex=''
                variant='filled'
                error={formErrors.name === null ? false : true}
                helperText={formErrors.name === null ? '' : formErrors.name}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <FormControl
                required={true}
                error={formErrors.stock_type === null ? false : true}
                component='fieldset'
                fullWidth={true}
                disabled={props.status === 'edit' && props.check_product[0]?.total > 0 ? true : false}
                variant='filled'
              >
                <RadioGroup row name='radio-buttons-group'>
                  <FormControlLabel
                    name='goods'
                    checked={
                      formValues.stock_type === null ? false : formValues.stock_type
                    }
                    onChange={handleCheck}
                    control={<Radio />}
                    label='Goods'
                  />
                  <FormControlLabel
                    name='service'
                    checked={
                      formValues.stock_type === null
                        ? false
                        : formValues.stock_type === false
                          ? true
                          : false
                    }
                    onChange={handleCheck}
                    control={<Radio />}
                    label='Service'
                  />
                </RadioGroup>
                <FormHelperText>{formErrors.stock_type}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                value={formValues.category === null ? '' : formValues.category}
                name='category'
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {

                    setFormValues({
                      ...formValues,
                      category: ProperCaseFunc(newValue),
                    });
                  } else if (newValue && newValue.inputValue) {

                    setFormValues({
                      ...formValues,
                      category: ProperCaseFunc(newValue.inputValue),
                    });
                    setValue([...value, ProperCaseFunc(newValue.inputValue)]);
                  } else if (newValue === null) {

                    setFormValues({
                      ...formValues,
                      category: newValue,
                    });
                  } else {

                    setFormValues({
                      ...formValues,
                      category: newValue.category,
                    });
                  }
                  validationHandler('category', newValue?.category);
                }
                }
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);

                  const { inputValue } = params;
                  let input = ProperCaseFunc(inputValue)
                  const isExisting = options.some(
                    (option) => input === option.category,
                  );
                  if (input !== '' && !isExisting) {
                    filtered.push({
                      inputValue,
                      category: input,
                    });
                  }
                  if (value.length) {
                    value.forEach((data) => {
                      filtered.push({
                        inputValue: data,
                        category: data,
                      });
                    });
                  }
                  return filtered;
                }}
                id='free-solo-dialog-demo'
                options={product_all_category}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  if (option.inputValue) {
                    return option.category;
                  }
                  return option.category;
                }}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Category'
                    variant='filled'
                    error={formErrors.category === null ? false : true}
                    helperText={
                      formErrors.category === null ? '' : formErrors.category
                    }
                    required={true}
                    onBlur={handleChange}
                    onChange={handleChange}
                    name='category'
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                value={formValues.brand === null ? '' : formValues.brand}
                name='brand'
                onChange={(event, newValue) => {
                  if (typeof newValue === 'string') {

                    setFormValues({
                      ...formValues,
                      brand: capitalize(newValue),
                    });
                  } else if (newValue && newValue.inputValue) {

                    setFormValues({
                      ...formValues,
                      brand: capitalize(newValue.inputValue),
                    });
                    setBrandValue([...brandValue, newValue.inputValue]);
                  } else if (newValue === null) {

                    setFormValues({
                      ...formValues,
                      brand: capitalize(newValue),
                    });
                  } else {

                    setFormValues({
                      ...formValues,
                      brand: capitalize(newValue.brand),
                    });
                  }
                  validationHandler('brand', newValue?.brand);
                }
                }
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);
                  const { inputValue } = params;
                  const isExisting = options.some(
                    (option) => inputValue === option.brand,
                  );
                  if (inputValue !== '' && !isExisting) {
                    filtered.push({
                      inputValue,
                      brand: `Add "${inputValue}"`,
                    });
                  }
                  if (brandValue.length) {
                    brandValue.forEach((data) => {
                      filtered.push({
                        inputValue: data,
                        brand: data,
                      });
                    });
                  }
                  return filtered;
                }}
                id='free-solo-dialog-demo'
                options={product_all_brand}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  if (option.inputValue) {
                    return option.inputValue;
                  }
                  return option.brand;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={handleChange}
                    onBlur={handleChange}
                    label='Brand'
                    variant='filled'
                    error={formErrors.brand === null ? false : true}
                    helperText={formErrors.brand === null ? '' : formErrors.brand}
                    required={true}
                    name='brand'
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                disabled={formValues.stock_type === false ? true : false}
                onBlur={handleChange}
                // required={true}
                style={{}}
                fullWidth={true}
                placeholder='Enter Model'
                label='Model'
                name='model'
                value={formValues.model === null ? '' : formValues.model}
                color='primary'
                multiline={false}
                type='text'
                regex={null}
                variant='filled'
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                disabled={formValues.stock_type === false ? true : false}
                style={{}}
                fullWidth={true}
                placeholder='Enter Variant'
                label='Variant'
                name='variant'
                value={formValues.variant === null ? '' : formValues.variant}
                color='primary'
                multiline={false}
                type='text'
                regex={null}
                variant='filled'
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                style={{}}
                fullWidth={true}
                placeholder='Enter SKU'
                label='SKU'
                name='sku'
                value={formValues.sku === null ? '' : formValues.sku}
                color='primary'
                multiline={false}
                regex=''
                variant='filled'
                error={formErrors.sku === null ? false : true}
                helperText={formErrors.sku === null ? '' : formErrors.sku}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                style={{}}
                fullWidth={true}
                placeholder='Enter Product Description'
                label='Description'
                name='description'
                value={
                  formValues.description === null ? '' : formValues.description
                }
                color='primary'
                multiline={false}
                type='text'
                regex=''
                variant='filled'
                error={formErrors.description === null ? false : true}
                helperText={
                  formErrors.description === null ? '' : formErrors.description
                }
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <FormControl
                required={true}
                error={formErrors.is_serialized === null ? false : true}
                component='fieldset'
                disabled={(formValues.stock_type === false || (props.status === 'edit' && props.check_product[0]?.total > 0) || (props.status === 'edit' && !(getProductPurchaseHistory?.length === 0 && getAllProductSalesHistory?.length === 0))) ? true : false}
                fullWidth={true}
              >
                <FormControlLabel
                  control={
                    <Switch
                      style={{}}
                      name='is_serialized'
                      checked={Boolean(formValues.is_serialized)}
                      size='medium'
                      color='primary'
                      label='is_serialized'
                      required={true}
                      onChange={handleCheck}
                    />
                  }
                  label='Serialized'
                  name='is_serialized'
                />
                <FormHelperText>{formErrors.is_serialized}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                options={getUnitsLov}
                getOptionLabel={(option) => option.unit || ''}
                value={formValues.pack_name}
                onChange={(name, value) => handleAutoCompleteChange('pack_name', value)}
                disabled={formValues.stock_type === false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label='Unit'
                    variant='filled'
                  />
                )}
              />
            </Grid>

            <Grid
              marginTop='20px'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography align='left' variant='h6'>
                Tax Details
              </Typography>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <FormControl
                required={true}
                error={formErrors.gst_preference}
                variant='filled'
                component='fieldset'
                fullWidth={true}
              >
                <InputLabel>GST Preference</InputLabel>
                <Select
                  name='gst_preference'
                  label='GST Preference'
                  value={formValues.gst_preference || ''}
                  required={true}
                  onChange={handleChange}
                >
                  <MenuItem value='Taxable'>Taxable</MenuItem>
                  <MenuItem value='Non-Taxable'>Non-Taxable</MenuItem>
                  {!einvoiceEnabled && <MenuItem value='Tax at Invoice Time'>Tax at Invoice Time</MenuItem>}
                </Select>
                <FormHelperText>
                  {formErrors.gst_preference ? 'GST Preference is Required!' : ''}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <FormControl
                required={formValues.gst_preference === 'Taxable'}
                error={formValues.gst_preference === 'Taxable' && formErrors.tax_category_id}
                variant='filled'
                component='fieldset'
                fullWidth={true}
              >
                <InputLabel>Tax Category</InputLabel>
                <Select
                  style={{}}
                  name='tax_category_id'
                  label='Tax Category '
                  items={[
                    { label: 'Select one', value: '' },
                    { label: 'option 1', value: 'one' },
                    { label: 'option 2', value: 'two' },
                  ]}
                  value={formValues.tax_category_id || ''} //=== null ? "" : formValues.tax_category_id
                  required={formValues.gst_preference === 'Taxable'}
                  disabled={formValues.gst_preference !== 'Taxable'}
                  addnew='true'
                  onChange={handleChange}
                >
                  {taxcategory?.map((d) => (
                    <MenuItem value={d.tax_category_id} key={d.tax_category_id}>
                      {d.tax_category}
                    </MenuItem>
                  ))}
                  <MenuItem>
                    <Link
                      style={{ paddingLeft: '15px' }}
                      onClick={() => {
                        props.setModalStatusHandler(true);
                        props.setModalTypeHandler('NewTaxCategory');
                      }}
                    >
                      CreateNew
                    </Link>
                  </MenuItem>
                </Select>
                <FormHelperText> {formValues.gst_preference === 'Taxable' && formErrors.tax_category_id
                  ? 'Tax Category is Required!'
                  : ''}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={(e) => {
                  const value = e.target.value;
                  if (!/^\d*$/.test(value)) return;
                  if (value.length > 8) return;
                  handleChange(e);
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  const validPattern = /^(?!0+$)(\d{4}|\d{6}|\d{8})$/;
                  const einvoiceEnabled = getEinvoiceDetails?.some(
                    (item) => item.key_name === 'company.einvoice' && item.value === '1'
                  );

                  if (einvoiceEnabled) {
                    if (!validPattern.test(value)) {
                      setFormErrors((prev) => ({
                        ...prev,
                        hsn_code: 'Enter a valid 4, 6, or 8 digit HSN Code (not all zeroes)',
                      }));
                    } else {
                      setFormErrors((prev) => ({ ...prev, hsn_code: null }));
                      // handleChange(e);
                    }
                  } else {
                    setFormErrors((prev) => ({ ...prev, hsn_code: null }));
                    // handleChange(e);
                  }
                }}
                style={{}}
                fullWidth
                placeholder='Enter HSN Code'
                label='HSN Code'
                required={formValues.gst_preference === 'Taxable' || einvoiceEnabled}
                name='hsn_code'
                value={formValues.hsn_code || ''}
                color='primary'
                multiline={false}
                type='text'
                regex={null}
                variant='filled'
                error={formValues.gst_preference === 'Taxable' && !!formErrors.hsn_code}
                helperText={formValues.gst_preference === 'Taxable' && formErrors.hsn_code ? 'HSN Code is Required!' : ''}
                inputProps={{
                  maxLength: 8,
                  inputMode: 'numeric',
                }}
              />
            </Grid>

            <Grid
              marginTop='20px'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography align='left' variant='h6'>
                Pricing Details
              </Typography>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Grid container >
                <Grid size={6}>
                  <FormControl
                    error={formErrors.cost_price_includes_gst}
                    variant="filled"
                    fullWidth
                    disabled={formValues.gst_preference === 'Non-Taxable'}
                  >
                    <InputLabel>GST</InputLabel>
                    <Select
                      name="cost_price_includes_gst"
                      value={
                        formValues.cost_price_includes_gst === null
                          ? ''
                          : formValues.cost_price_includes_gst
                      }
                      onChange={handleGSTChange}
                    // style={{ borderRadius: 0 }}
                    >
                      <MenuItem value={false}>Without</MenuItem>
                      <MenuItem value={true}>With</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formErrors.cost_price_includes_gst
                        ? 'GST Type is required!'
                        : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid size={6}>
                  <TextField
                    // inputRef={costPriceRef}  
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={false}
                    style={{}}
                    fullWidth={true}
                    onWheel={(e) => e.target.blur()}
                    placeholder='Enter Product Cost Price'
                    label='Buying Price'
                    name='cost_price'
                    value={
                      formValues.cost_price === null ? '' : formValues.cost_price
                    }
                    color='primary'
                    multiline={false}
                    type='number'
                    regex={null}
                    variant='filled'
                    InputProps={{
                      // style: {
                      //   borderRadius: 0,
                      // },
                      onWheel: (e) => e.target.blur(),
                      inputProps: {
                        onWheel: (e) => e.target.blur(),
                      },
                    }}
                  // sx={{
                  //   '& .MuiFilledInput-root': {
                  //     borderRadius: 0,
                  //   },
                  // }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Grid container >
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <FormControl
                    error={formErrors.unit_price_includes_gst}
                    variant="filled"
                    disabled={formValues.gst_preference === 'Non-Taxable'}
                    fullWidth
                    sx={{
                      '& .MuiFilledInput-root': {
                        borderRadius: 0,
                      },
                    }}
                  >
                    <InputLabel>GST</InputLabel>
                    <Select
                      name="unit_price_includes_gst"
                      value={
                        formValues.unit_price_includes_gst === null
                          ? ''
                          : formValues.unit_price_includes_gst
                      }
                      onChange={handleGSTChange}
                      style={{ borderRadius: 0 }}
                    >
                      <MenuItem value={false}>Without</MenuItem>
                      <MenuItem value={true}>With</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formErrors.unit_price_includes_gst
                        ? 'GST Type is required!'
                        : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <TextField
                    // inputRef={unitPriceRef}
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={true}
                    style={{}}
                    fullWidth={true}
                    onWheel={(e) => e.target.blur()}
                    placeholder='Enter Product Unit Price'
                    label='Selling Price'
                    name='unit_price'
                    value={
                      formValues.unit_price === null || formValues.unit_price === 0 ? '' : formValues.unit_price
                    }
                    color='primary'
                    multiline={false}
                    type='number'
                    regex={null}
                    variant='filled'
                    InputProps={{
                      style: {
                        borderRadius: 0,
                      },
                    }}
                    sx={{
                      '& .MuiFilledInput-root': {
                        borderRadius: 0,
                      },
                    }}
                    error={formErrors.unit_price === null ? false : true}
                    helperText={formErrors.unit_price === null ? '' : formErrors.unit_price}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                onChange={handleChange}
                onBlur={handleChange}
                // required={formValues.stock_type === false ? true : false}
                style={{}}
                fullWidth={true}
                onWheel={(e) => e.target.blur()}
                placeholder='Enter Max Price'
                label='MRP/MOP'
                name='max_price'
                value={formValues.max_price === null ? '' : formValues.max_price}
                color='primary'
                multiline={false}
                type='number'
                regex={null}
                variant='filled'
                error={
                  formValues.stock_type === false
                    ? formErrors.max_price === null
                      ? false
                      : true
                    : false
                }
                helperText={
                  formValues.stock_type === false
                    ? formErrors.max_price === null
                      ? ''
                      : formErrors.max_price
                    : ''
                }
              />
            </Grid>

            <Grid
              marginTop='20px'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography align='left' variant='h6'>
                Other Info
              </Typography>
            </Grid>

            {formValues.stock_type === true && (
              <>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Typography
                    sx={{ marginLeft: "4px", marginBottom: "4px", fontWeight: 300 }}
                  >
                    Lifecycle
                  </Typography>
                  <Grid container sx={{ marginLeft: '4px' }}>
                    <Grid size={6}>
                      <TextField
                        onChange={(e) => warrantyLifecycle.setVal(e.target.value, 'lifecycle_months', 'Y')}
                        style={{}}
                        fullWidth={true}
                        onWheel={(e) => e.target.blur()}
                        label='Year'
                        name='lifecycle_months'
                        value={warrantyLifecycle.getVal('lifecycle_months', 'Y')}
                        color='primary'
                        multiline={false}
                        type='number'
                        InputProps={{ inputProps: { min: 0, max: 20 } }}
                        regex={null}
                        variant='filled'
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        onChange={(e) => warrantyLifecycle.setVal(e.target.value, 'lifecycle_months', 'M')}
                        style={{}}
                        fullWidth={true}
                        onWheel={(e) => e.target.blur()}
                        label='Month'
                        name='lifecycle_months'
                        value={warrantyLifecycle.getVal('lifecycle_months', 'M')}
                        color='primary'
                        multiline={false}
                        type='number'
                        InputProps={{ inputProps: { min: 0, max: 12 } }}
                        regex={null}
                        variant='filled'
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Typography
                    sx={{ marginLeft: "4px", marginBottom: "4px", fontWeight: 300 }}
                  >
                    Warranty
                  </Typography>
                  <Grid container>
                    <Grid size={6}>
                      <TextField
                        onChange={(e) => warrantyLifecycle.setVal(e.target.value, 'warranty_months', 'Y')}
                        fullWidth={true}
                        onWheel={(e) => e.target.blur()}
                        label='Year'
                        name='warranty_months'
                        value={warrantyLifecycle.getVal('warranty_months', 'Y')}
                        color='primary'
                        multiline={false}
                        type='number'
                        InputProps={{ inputProps: { min: 0, max: 20 } }}
                        regex={null}
                        variant='filled'
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        onChange={(e) => warrantyLifecycle.setVal(e.target.value, 'warranty_months', 'M')}
                        style={{}}
                        fullWidth
                        label='Month'
                        name='warranty_months'
                        value={warrantyLifecycle.getVal('warranty_months', 'M')}
                        color='primary'
                        multiline={false}
                        type='number'
                        InputProps={{ inputProps: { min: 0, max: 12 } }}
                        regex={null}
                        variant='filled'
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Typography
                    sx={{ marginLeft: "4px", marginBottom: "4px", fontWeight: 300 }}
                  >
                    Stock Limit
                  </Typography>
                  <Grid container >
                    <Grid
                      size={{
                        lg: 6,
                        md: 6,
                        sm: 6,
                        xs: 6
                      }}>
                      <FormControl
                        error={formErrors.stockLimit}
                        variant="filled"
                        fullWidth
                      >
                        <InputLabel>Stock Limit</InputLabel>
                        <Select
                          name="stockLimit"
                          value={formValues.stockLimit ?? ''}
                          onChange={handleCheck}
                          style={{ borderRadius: 0 }}
                        >
                          <MenuItem value={false}>Disable</MenuItem>
                          <MenuItem value={true}>Enable</MenuItem>
                        </Select>
                        <FormHelperText>
                          {formErrors.stockLimit
                            ? 'Stock Limit is required!'
                            : ''}
                        </FormHelperText>
                      </FormControl>
                    </Grid>

                    <Grid
                      size={{
                        lg: 6,
                        md: 6,
                        sm: 6,
                        xs: 6
                      }}>
                      <TextField
                        fullWidth
                        name='limit'
                        variant='filled'
                        label='Minimal Stock Reminder'
                        type='number'
                        value={formValues.limit || ''}
                        disabled={!formValues.stockLimit}
                        onChange={handleChange}
                        // required
                        error={formErrors.limit !== null}
                        helperText={formErrors.limit !== null && 'Minimal Stock Limit is required'}
                      />
                    </Grid>
                  </Grid>
                </Grid>

              </>
            )}

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Typography
                sx={{ marginLeft: "4px", marginBottom: "4px", fontWeight: 300 }}
              >
                Expiry
              </Typography>
              <Grid container >
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <FormControl
                    error={formErrors.is_expiry}
                    variant="filled"
                    fullWidth
                  >
                    <InputLabel>Expiry</InputLabel>
                    <Select
                      name="is_expiry"
                      value={formValues.is_expiry ?? false}
                      onChange={handleCheck}
                      style={{ borderRadius: 0 }}
                    >
                      <MenuItem value={false}>Disable</MenuItem>
                      <MenuItem value={true}>Enable</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formErrors.is_expiry
                        ? 'Expiry is required!'
                        : ''}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Select Date"
                      variant='filled'
                      value={toMomentOrNull(formValues.expiry_date)}
                      onChange={handleDateChange}
                      format="DD/MM/YYYY"
                      minDate={dayjs()}
                      disabled={!formValues.is_expiry === true}
                      slotProps={{
                        textField: {
                          variant: "filled",
                          fullWidth: true,
                          placeholder: "DD/MM/YYYY",
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Typography
                sx={{ marginLeft: "4px", marginBottom: "4px", fontWeight: 300 }}
              >
                Automatic Reorder Level
              </Typography>
              <Grid container >
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <FormControl
                    required={true}
                    error={formErrors.automatic_reorder_level === null ? false : true}
                    component='fieldset'
                    variant="filled"
                    disabled={formValues.stock_type === false ? true : false}
                    fullWidth={true}
                  >
                    <InputLabel>Automatic Reorder Level</InputLabel>
                    <Select
                      name="automatic_reorder_level"
                      value={
                        formValues.automatic_reorder_level === null
                          ? ''
                          : formValues.automatic_reorder_level
                      }
                      onChange={handleCheck}
                      style={{ borderRadius: 0 }}
                    >
                      <MenuItem value={false}>Disable</MenuItem>
                      <MenuItem value={true}>Enable</MenuItem>
                    </Select>
                    <FormHelperText>
                      {formErrors.automatic_reorder_level}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 6
                  }}>
                  <TextField
                    onChange={handleChange}
                    onBlur={handleChange}
                    required={false}
                    style={{}}
                    fullWidth={true}
                    onWheel={(e) => e.target.blur()}
                    placeholder='Enter Reorder Level'
                    label='Reorder Level'
                    name='reorder_level'
                    value={
                      formValues.reorder_level === null ? '' : formValues.reorder_level
                    }
                    color='primary'
                    disabled={
                      formValues.stock_type === false || !formValues.automatic_reorder_level
                    }
                    multiline={false}
                    type='number'
                    regex={null}
                    variant='filled'
                    error={formErrors.reorder_level === null ? false : true}
                    helperText={
                      formErrors.reorder_level === null ? '' : formErrors.reorder_level
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid
              marginTop='20px'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography align='left' variant='h6'>
                Images
              </Typography>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <ProductAttachment
                type='Product'
                previews={formValues.pic_filename}
                imageKeys={imageKeys}
                setPreviews={setFormValues}
                setImageKeys={setImageKeys}
                status={props.status === 'edit' ? 'Edit Product' : 'New Product'}
              />
              <Typography color='error' variant='h6'>NOTE : Upto 6 Images</Typography>
              <Typography color='error'>{formErrors.pic_filename === null ? '' : formErrors.pic_filename}</Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}

        <Grid
          style={{ marginBottom: '10px' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            spacing={7}
            container={true}
            direction='row'
            display='flex'
            justifyContent='flex-end'
            paddingTop='20px'
          >
            <Grid>
              {form === false ? (
                <Button
                  onClick={() => props.handleClose()}
                  style={{}}
                  name='Cancel'
                  variant='contained'
                  color='secondary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  onClick={() => validClose()}
                  style={{}}
                  name='Cancel'
                  variant='contained'
                  color='secondary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                  type='cancel'
                >
                  cancel
                </Button>
              )}
            </Grid>

            <Grid>
              <Button
                onClick={handleSubmit}
                disabled={disable}
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
        </Grid>
      </Grid>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
    </Card>
  );
}

export default NewProduct;
