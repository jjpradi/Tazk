import React, {useState, useEffect, useRef, useContext} from 'react';
import MaterialTable, {MTableAction} from 'utils/SafeMaterialTable';
import UnSavedChangesWarning from '../../../pages/common/unChangeswarning';
import {Card, Icon, IconButton, Tooltip} from '@mui/material';
// import ItemPopup from './itemPopup';
import ActionButton from './ActionButton';
import {Button, TextField, Autocomplete, Grid, Select, InputLabel, MenuItem, FormControl, FormHelperText,Box,Dialog,DialogActions,DialogTitle, Typography } from '@mui/material';
import { Category, Close } from "@mui/icons-material";
import context from '../../../context/CreateNewButtonContext';
import {getTrimmedData} from '../../../components/trimFunction/index';
import Cookies from 'universal-cookie';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {createFilterOptions} from '@mui/material/Autocomplete';
import {listInventoryAction, listInventoryByIdAction} from '../../../redux/actions/inventory_actions';
import {useDispatch, useSelector} from 'react-redux';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import moment from 'moment';
import CancelDialog from 'components/CancelDialog';
import { getsessionStorage } from 'pages/common/login/cookies';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import { listProductAction, listProductByLocationAction } from 'redux/actions/product_actions';
import { allListStockLocation, getdestinationAction, getsourcelocationAction, listStockLocationAction } from 'redux/actions/stock_Location_actions';
import apiCalls from 'utils/apiCalls';
import { filterOptions } from 'utils/searchFunc';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { keysIn } from 'lodash';
import {useCustomFetch} from 'utils/useCustomFetch';
import { FailLoad, ListLoad } from 'redux/actions/load';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import ItemPopup from 'pages/sales/sales/lotNumber';
import API_URLS from '../../../utils/customFetchApiUrls';



function NewStockTransfer(props) {
  // const [form, setFormValues] = useState({ tax_group_sequence: null });
  const [available_qty,setavailable_qty] = useState('');
  const [categoryData, setcategoryData] = useState([]);
  const customFetch = useCustomFetch();


  // const {product} = props;
  // const [setCurrent_Item_ID] = useState('')
  const tempedits = useRef(null);
  const dispatch = useDispatch();
  // const tempcate = useRef(null)
  const random6 = () => Math.floor(100000 + Math.random() * 900000);
  const [formValues, setformValues] = useState({
    source_location_id: '',
    location_idd: '',
    destination_location_id: '',
    chalan_number: `${new Date().toLocaleDateString()}/${random6()}`,
    trans_user: '',
  });
  const [checkerror, setcheckerror] = useState({
    source_location_id: null,
    destination_location_id: null,
    name: null,
    quantity: null,
  });
  const [requiredFields] = useState([
    'source_location_id ',
    'destination_location_id',
  ]);
  const [location_product, setlocation_product] = useState([]);
  const [available_product, setavailable_product] = useState([])
  const [form, setForm] = useState(false)
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const tempinit = useRef(null);
  const tempinitform = useRef(null);
  const addActionRef = useRef(null);
  const cancelActionRef = useRef(null);
  // const cookies = new Cookies();
  let storage = getsessionStorage()
  const [showproduct, setshowproduct] = useState(false);
  const [row_id, setRowid] = useState({
    id: '1',
    data: '',
    open: false,
    status: '',
  });
  const [open, setOpen] = React.useState(false);
  const [disabledel, setdisabledel] = useState(false);
  const [transfer] = useState(false);
  const[Dialogopen,SetDialogopen]= useState(false)
  const[alert,Setalert]= useState(false)
  const [dialog, setDialog] = useState(false);
  const [opennotavailable, setOpennotavailable] = React.useState(false);

// console.log("location_product",location_product)
  // const [available, setavailable] = useState([])
  const {
    drawerOpen,
    setLoaderStatusHandler,
    setModalTypeHandler,
    commoncookie,headerLocationId
  } = useContext(context);

  const {
    inventoryReducer: { inventory },   productReducer: { product},
  } = useSelector((state) => state);

  useEffect(() => {
  
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getdestinationAction()),
      // dispatch(listInventoryAction(commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
    );
  
  }, []);

  const handleClickOpen = () => {
    setOpennotavailable(true);
  };

  const handleCloseerrorLocation = () => {
    setOpennotavailable(false);
  };
  const Allclear = () =>{
      setcategoryData([])
      setavailable_product([])
      setOpennotavailable(false)
  }
  const UnmatchedClear = () =>{
  let val = categoryData.filter((d)=> !d?.remove)
  if(val.length > 0){
    setcategoryData(val)
    setavailable_product([])
    setOpennotavailable(false)
  }
     
  }

  // useEffect(() => {
  //   apiCalls(
  //     setModalTypeHandler,
  //     setLoaderStatusHandler,
  //   // !product.length && dispatch(listProductAction()),
    
  //   // !props.stocklocation.length && dispatch(listStockLocationAction(commoncookie, headerLocationId)),

  //   // dispatch(getsourcelocationAction( headerLocationId)),
  //   dispatch(getdestinationAction()),
  //   // dispatch(listProductAction()),
  //   //  dispatch(allListStockLocation(commoncookie)),

  //    dispatch(
  //     listInventoryAction(
  //       commoncookie,
  //       headerLocationId,
  //       setModalTypeHandler,
  //       setLoaderStatusHandler,
  //     ),
  //   )
  //   )
  // }, []);
  

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listStockLocationAction(commoncookie, headerLocationId)),
      headerLocationId !== null && dispatch(getsourcelocationAction( headerLocationId))
    )
        
    setformValues(prevFormValues => ({
      ...prevFormValues,
      source_location_id: headerLocationId,
    }));
  },[headerLocationId])

  const initform = () => {
    setInitialState(formValues);
  };
  tempinitform.current = initform;
  useEffect(() => {
    tempinitform.current();
  }, []);
  useEffect(() => {
    if (formValues.source_location_id !== '') {
      setshowproduct(true);
    } else {
      setshowproduct(false);
    }
  }, [formValues.source_location_id]);
  // const samecheck = () => {
  //   if (formValues.source_location_id  === formValues.destination_location_id) {
  //     setcheckerror(true)
  //   }
  // }

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
       setForm(true);
    } else {
      setPristine();
       setForm(false)
    }
  };

  const validClose = () => {
    setDialog(true);
  };


  const cancel = () => {
    setDialog(false);
  };

  
  tempinit.current = inits;
  useEffect(() => {
    tempinit.current();
  }, [formValues, initialState, props.open]);

  const handleChange = (e) => {
    const {name, value, locationscrab} = e.target;
    
    setformValues({...formValues, [name]: value});
    
    
      setcheckerror((prevErrors)=>({
        ...prevErrors,
        [name]:value ? null : 'Field is required!'
      }));
    
    // if (name === 'source_location_id') {
    //   //  const data={brand:'',category:'',max_price:'',min_price:'',location_id:value,user_id:commoncookie}
    //   //  dispatch(listInventoryByIdAction(data,commoncookie,value,setModalTypeHandler,setLoaderStatusHandler))
    //   const locate = inventory.filter((d) => d.trans_location === value);
    //   console.log('locate', locate)
    //   setlocation_product(locate);
    // }
    Setalert(false)
    setStateHandler(name, value);
  };

  useEffect(()=>{ (async () => {


    if(formValues.source_location_id !== 'null' && formValues.source_location_id !== '' ){
      ListLoad(setModalTypeHandler, setLoaderStatusHandler);
      const {
        data: inventoryData,
        loading,
        error,
      } = await customFetch(
        API_URLS.GET_INVENTORY_BY_LOCATION(storage?.employee_id,formValues.source_location_id),
        'GET'
      );
      FailLoad(setModalTypeHandler, setLoaderStatusHandler);
      const locate = inventoryData.filter((d) => d.trans_location === formValues.source_location_id && d.stock_type === 1);
      setlocation_product(locate);
    }
    // else{
    //   alert('Product List Empty')
    // }
  })();
}, [formValues.source_location_id, inventory])


  useEffect(() => {
    if(categoryData.length > 0){
    let arr = []
    
    let val =  categoryData.map((d)=> {
    let  temp = d;
     let val1 = location_product?.find((f)=> f.item_id === d.item_id && f.stock_type === 1)
     if(val1) {
        if(val1.available_qty < d.available_qty ){
          temp.remove = true
          arr.push({'product_name' : d.name, 'available_qty': val1.available_qty, 'qtymismatch' : 'Less Quantity' })
        }
     }else{
      temp.remove = true
      arr.push({'product_name' : d.name, 'available_qty': 0, 'qtymismatch' : 'Product Not EXIST' })
     }
    
      return {...temp,lots:[]}
    })
    setavailable_product(arr)

    setcategoryData(val)

    }
  }, [formValues.source_location_id])



  useEffect(()=>{
    if(available_product.length > 0) {
      setOpennotavailable(true)
    }
  },[available_product])



  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setformValues(formObj);
    validationHandler(name, value);
  };
  const validationHandler = (name, value) => {
    if (!Object.keys(checkerror).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setcheckerror({
        ...checkerror,
        [name]: capitalize(name) + ' is Required!',
      });
    } else {
      setcheckerror({
        ...checkerror,
        [name]: null,
      });
    }
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // const handleBlur = (e) => {
  //   const { name, value } = e.target;
  //   if (!value) {
  //     setcheckerror({ ...checkerror, [name]: true });
  //   }
  // };

  const edits = () => {
    if (props.edit_id_data[0] && props.status === 'edit') {
      // setFormValues(props.edit_id_data[0])
    }
  };
  tempedits.current = edits;
  useEffect(() => {
    tempedits.current();
  }, [props.edit_id_data]);


  const handleToggle = async () => {
    let isValid = true;
    // const scrab = props.stocklocation.filter(
    //   (d) => d.location_id === formValues.destination_location_id,
    // );
    const scrap =  props.allliststocklocation.filter((d)=> d.location_id === formValues.destination_location_id)
    if (scrap[0].location_name === 'scrap location') {
      return handleSubmit();
    }
    let checkerrorObj = {...checkerror};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        checkerrorObj[key] = capitalize(key) + ' is Required!';
      }

      return null;
    });
    await setcheckerror(checkerrorObj);


    // categoryData.map((d) => d.is_serialized) === 0
    if (
      categoryData.filter((d) => d.lots.length > 0 || d.is_serialized === 0)
        .length !== categoryData.length
    ) {
      isValid = false;
    }
    // if ( !categoryData.map((d) => d.lots).length) {
    //   isValid = false
    // }
    if (isValid) {
      setOpen((prevOpen) => !prevOpen);
    }
  };

  const handlePopup = async (id) => {
    setRowid({open: true, id: id.tableData.id, data: id, status: 'edit', type: 'stockTransfer'});
    setdisabledel(false);
  };
  //  const vb = row_id.id
  const handleClose = () => {
    setRowid({...row_id, open: false});
  };

  const handleSubmit = async (event) => {
    const {source_location_id, destination_location_id, chalan_number} =
      formValues; //, trans_user
    let data = {
      source_location_id,
      destination_location_id,
      chalan_number,
      trans_user: storage?.employee_id,
      received_date : moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
    };
    // data.categoryData = categoryData.map(d => quantity)
    //data.categoryData = categoryData.map(d => { const { tableData, name,oldlots, is_serialized, qty_per_pack, quantity,  ...record  } = d ; record.quantity = -quantity; return record })
  //  let obj = {};
  //   categoryData.map((d)=> {
  //     const key = `${d.item_id}_${d.item_unit_price}`
  //     if(key in obj){
  //      obj[key.push] = d
  //     }else{
  //      obj[key] = [d]
  //     }
  // })
  const result = [...categoryData.reduce((r, o) => {
    const key = o.item_id + '-' + o.trans_items_cost_price;
    
    const item = r.get(key) || Object.assign({}, o, {
      quantity : 0,
      lots : []
    });
    item.quantity += Number(o.quantity);
    item.lots.push(...o.lots);
    return r.set(key, item);
  }, new Map).values()];

// console.log('groupbyyyy', obj)
    data.categoryData = result.map((d) => {
      const {
        tableData,
        name,
        oldlots,
        // is_serialized,
        qty_per_pack,
        available_qty,
        item_unit_price,
        taxes,
        unit_name,
        ...record
      } = d;
      return record;
    });
    props.handleSubmit(getTrimmedData(data));

  };

  const checkQuantity = (avail_quan, value, item_id, indx) => {
    let quan = true;
    if (value > available_qty) {
      quan = false;
      // return false
    }
    if(!value){
      quan = false;
    }
    if(value <=0){
      quan = false 
    }
    else{
      quan = true;
    }
    let count = 0;
    categoryData.forEach((d, inx) => {
      if (indx !== inx) {
        if (d.item_id === item_id) {
          count += +d.quantity;
        }
      }
    });
    if (count + +value > avail_quan) {
      quan = false;
    }
    return quan;
  };
  const setAvailable = (item_id,available_qty, trans_items_cost_price) =>{
    const received_quantity = categoryData.filter((f)=>  f.item_id === item_id && f.trans_items_cost_price === trans_items_cost_price).map((d)=>{ return + Number(d.quantity)})
    const sum = received_quantity.reduce((partialSum, a) => partialSum + a, 0);

    if(received_quantity){
            let val = available_qty - sum
            return val
    }else {
      return available_qty
    }
  
  } 

  const filterOptions = (options, { inputValue }) => {
    // console.log("options", options);


    const normalizedInput = inputValue.toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ');

    return options.filter((option) => {

      const productNameNormalized = option.product_name.toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ');
      const itemCostNormalized = option.trans_items_cost_price.toString();
      const skuNormalized = option.sku ? option.sku.toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ') : '';
      const lotNumbersNormalized = (option.lots || []).map(lot =>
        lot.lot_number?.toLowerCase().replace(/\s+/g, '').replace(/-/g, ' ')
      );
      const lotMatch = lotNumbersNormalized?.some(lotNum => lotNum?.includes(normalizedInput));

      return (
        productNameNormalized.includes(normalizedInput) ||
        itemCostNormalized.includes(normalizedInput) ||
        skuNormalized.includes(normalizedInput) ||
        lotMatch
      );
    });
  };
  
  
  
  
  
  const popup =()=>{

    if(available_product.length > 0){
      setOpennotavailable(true)
      return
    }

    if(formValues.source_location_id === 'null' || formValues.source_location_id === null || formValues.source_location_id === ''){
      setcheckerror({
        ...checkerror,
        source_location_id :'Field is Required!',
      })
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return
    }
    if(!formValues.destination_location_id){
      setcheckerror({
        ...checkerror,
        destination_location_id :'Field is Required!'
      })
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return
    }


  //   let lot = categoryData.filter((x)=>x?.lots?.length>0 ? true:false)
  //   if(categoryData.length === lot.length){
  //        handleToggle()
  //   }
  //   else{
  //   SetDialogopen(true)
  // }
  let startNum = 0;
  let endNum = 0
  let nonSLot = {};
  const tempCat = categoryData.map(i => {
    delete i.line
    delete i.item_cost_price
    if(i.is_serialized === 0){
      const key = `${i.item_id}_${i.trans_items_cost_price}`
      startNum = nonSLot[key] ?? 0;
      endNum = (nonSLot[key] ?? 0) + +i.quantity
      const getLots = i.oldlots
        .filter(f=> f.location_id === formValues.source_location_id && i.trans_items_cost_price === f.trans_items_cost_price)
        .slice(startNum, endNum);
      i.lots = getLots;
      nonSLot = {
        ...nonSLot,
        [key] : (nonSLot[key] ?? 0) + +i.quantity,
      }
    }
    return i
  })

  setcategoryData(tempCat)
  // let check = categoryData.filter((d)=>( d.is_serialized === 1 && d.lots.length == d.quantity) || (d.is_serialized === 0 && d.quantity > 0))
    let check = tempCat.filter((d) => (d.lots.length == d.quantity))
    let sourcelocation = tempCat.filter((d) => {

      return (
        d.oldlots.filter((v) => v.location_id === formValues.source_location_id).length > 0
      )
    })
  // if(formValues.source_location_id !== headerLocationId){
  //  Setalert(true)
  // }
if(check.length === categoryData.length && categoryData.length !== 0 ){
    handleToggle()
  }
  else{
    SetDialogopen(true)
  }
  }
//   let obj = {}
//    console.log('vattttttttt', categoryData.map((d)=> {
//        const key = `${d.item_id}_${d.item_unit_price}`
//        if(key in obj){
//         obj[key.push] = d
//        }else{
//         obj[key] = [d]
//        }
//    }));
//    console.log('hjhjhjhj', obj)
  return (
    <>
      <Snackbar
        open={Dialogopen}
        onClose={() => SetDialogopen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        key={"top" + "right1"}
        autoHideDuration={5000}>
        <Alert variant="filled" severity="error" onClose={() => { SetDialogopen(false) }}> Enter lot number</Alert>
      </Snackbar>
      <Snackbar
        open={alert}
        onClose={() => Setalert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        key={"top" + "right2"}
        autoHideDuration={3000}>
        <Alert variant="filled" severity="error" onClose={() => { Setalert(false) }}> Source location mismatch!!</Alert>
      </Snackbar>
      <Card
        sx={{
          p: '20px',
          width: '100%',
          height: 'calc(100vh - 80px)',
        }}
      >
      <div
        // style={{
        //   width: drawerOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 143px)',
        // }}
      >
        {Prompt}
        <ActionButton
          open={open}
          handleClose={() => {
            setcategoryData(categoryData.map((d, i) => ({ ...d, line: i + 1 })))
            setOpen(false)
          }}
          handlesubmit={handleSubmit}
          sourcelocation={
            props.stocklocation.filter(
              (d) => formValues.source_location_id === d.location_id,
            )[0]
          }
          destinationlocation={
            props.allliststocklocation.filter(
              (d) => formValues.destination_location_id === d.location_id,
            )[0]
          }
          ponumber={formValues.chalan_number}
          categoryData={categoryData}
          transfer={transfer}
        />
       <Typography variant='h6'>
       {props.status === 'edit' ? 'Edit' : 'StockTransfer - '}{' '}
          <span variant='h6'>{formValues.chalan_number}</span>
       </Typography>
         
        
        <br />
        <Grid container>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
        <Grid
          container
          spacing={3}
          // lg={12}
          // md={12}
          // sm={12}
          // xs={12}
        >
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <Box sx={{minWidth: 120}}>
              <FormControl
                fullWidth
                error={checkerror.source_location_id}
                required={true}
                variant='filled'
              >
                <InputLabel id='demo-simple-select-label'>
                  Source Location
                </InputLabel>
                <Select
                  name='source_location_id'
                  labelId='demo-simple-select-label'
                  label='SourceLocation'
                  id='demo-simple-select'
                  required={true}
                  value={formValues.source_location_id}
                  onChange={handleChange}
                  // onBlur={handleChange}
                >
                  {props.stocklocation.map((d) => (
                    <MenuItem value={d.location_id} key={d.location_id}>
                      {d.location_name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
              {checkerror.source_location_id
                ? "Source location is required!"
                : ""}
            </FormHelperText>
              </FormControl>
            </Box>
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <FormControl
              fullWidth
              error={checkerror.destination_location_id}
              required={true}
              variant='filled'
            >
              <InputLabel id='demo-simple-select-label'>
                Destination Location
              </InputLabel>
              <Select
                name='destination_location_id'
                labelId='demo-simple-select-label'
                label='Destination Location'
                id='DestinationLocation'
                required={true}
                value={formValues.destination_location_id}
                onChange={handleChange}
                // onBlur={handleChange}
              >
                {/* {props.stocklocation
                  .filter(
                    (f) => f.location_id !== formValues.source_location_id,
                  )
                  .map((d) => (
                    <MenuItem
                      locationscrab={d.location_name}
                      value={d.location_id}
                      key={d.location_id}
                    >
                      {d.location_name}
                    </MenuItem>
                  ))} */}
                  {  props.allliststocklocation.filter(f => f.location_id !== formValues.source_location_id ).map(d => <MenuItem locationscrab={d.location_name} value={d.location_id} key={d.location_id}>{d.location_name}</MenuItem>)}
              </Select>
              <FormHelperText>
                {checkerror.destination_location_id
                  ? 'Destination location is required!'
                  : ''}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <br />
        <br />

        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12
          }}>
                <MaterialTable
                  style={{
                    boxShadow: 'none',
                    border: 'none',
                  }}
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
              (rowData) => ({
                icon: () => (
                  <Icon
                    style={{
                      fontWeight: 'bold',
                      fontSize: 'larger',
                      color:
                        rowData.is_serialized === 1
                          ? Number(rowData.quantity) ===
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
                disabled: rowData.is_serialized === 1 ? false : true,
                onClick: (event, rowData) => handlePopup(rowData),
              }),
              {
                icon: 'add',
                tooltip: 'add',
                isFreeAction: true,
                onClick: (event, rowData) => {
                  !product.length && dispatch(listProductAction(setModalTypeHandler,  setLoaderStatusHandler))
                  // !inventory.length && dispatch(
                  //   listInventoryAction(
                  //     commoncookie,
                  //     headerLocationId,
                  //     setModalTypeHandler,
                  //     setLoaderStatusHandler,
                  //   ),
                  // )
                  if (formValues?.source_location_id && formValues.destination_location_id) {
                         addActionRef?.current?.click();
                  }
                  setavailable_qty('')
                  //  this.setState({add_click:!this.state.add_click})
                },
                // disabled: this.isAdd()
              },
            ]}
            options={{
              maxBodyHeight: '270px',   
              maxHeight: '270px', 
              headerStyle,
              cellStyle,
              exportButton: true,
              paging : true,
              filtering: false,
              pageSize: 10,
              pageSizeOptions: [10, 20, 50],
              actionsColumnIndex: -1,
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'ProductDetails'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'ProductDetails'),
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
               onInputChange={(e,v,reson)=>{
                if(
                  reson =='clear'
                )
                {
                  props.onChange('')
                  setavailable_qty('')
                }
               }}
                    value={{
                      product_name:
                        props.value === undefined ? '' : props.value,
                    }}
                    onChange={(e, newValue) => {
                      var setlots =
                    product.filter(
                          (d) => d.item_id === newValue?.trans_items && d.stock_type === 1,
                        )[0] || {};

                        var setlotsInventory =location_product
                        .filter(
                            (d) => d.item_id === newValue?.trans_items && d.stock_type === 1,
                          )[0] || {};
                       

                      if (newValue !== null) {
                        props.onRowDataChange({
                          ...props.rowData,
                          item_id: newValue.trans_items,
                          name: newValue.product_name,
                          oldlots: setlotsInventory?.lots || [],
                          is_serialized: setlotsInventory.is_serialized,
                          lots: [],
                          qty_per_pack: setlots.qty_per_pack,
                          available_qty: newValue.available_qty,
                          item_unit_price: setlotsInventory.unit_price,
                          taxes: setlots.taxes,
                          trans_items_cost_price : newValue.trans_items_cost_price,
                          unit_name: newValue.unit_name
                        });
                        
                       
                        setavailable_qty(categoryData.length === 0 ? newValue.available_qty : setAvailable(newValue.item_id, newValue.available_qty, newValue.trans_items_cost_price) )
                      }
                    }}
                    options={location_product}
                    autoHighlight={true}
                    filterOptions={filterOptions}
                    getOptionLabel={(option) => option.product_name}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.item_id + '' + option.trans_items_cost_price + '' + option.trans_location + ''}>
                        {option.product_name + '-' + option.trans_items_cost_price}
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Product'
                        required='true'
                        variant='filled'
                        error={
                          props.value !== undefined || showproduct === false
                            ? props.error
                            : false
                        }
                      />
                    )}
                  />
                ),
                validate: (rowData) => (!rowData.name ? false : true),
              },
              // {
              //   title: "CustomerName", field: "first_name",
              //   editComponent: props => (
              //     <Autocomplete
              //       name='name'
              //       value={{ first_name: props.value }}
              //       onChange={(e, newValue) => newValue !== null ? props.onRowDataChange({
              //         ...props.rowData,
              //         trans_user: newValue.person_id,
              //         first_name: newValue.first_name
              //       }) : ''}
              //       options={customer.filter(c => c.first_name !== null && typeof c.first_name === 'string')}
              //       // filterOptions={filterOptions}
              //       getOptionLabel={(option) => option.first_name}
              //       freeSolo
              //       renderInput={(params) => (
              //         <TextField {...params} label="Customer Name" variant="outlined" />
              //       )}
              //     />
              //   )
              // },
              {
                title: 'Cost Price',
                field: 'trans_items_cost_price', 
                editable : false,
              },
              {
                title: 'Quantity',
                field: 'quantity',
                editComponent: (props) => (
                  <>
                
                  <TextField
                    id='standard-basic'
                    name='quantity'
                    label='Quantity'
                    onWheel={ (e) => e.target.blur()}
                    type='number'
                    placeholder='0.00'
                    variant='standard'
                    value={props.value}
                    error={props.value !== undefined ? props.error : false}
                    helperText={
                      props.error ? props.rowData.quantity<=0 ? `0 Qty Not Allowed` : props.rowData.available_quantity !== undefined
                        ? `available quantity is ${props.rowData.available_quantity}`
                        : '' : ''
                    }
                    onChange={(e) => props.onChange(e.target.value)}
                  />{(available_qty && !props.error)&&
                  <div style={{color: "green"}}>
                    {`available quantity is ${available_qty}`}
                  </div>
              }{(available_qty === 0)&&
                <div style={{color: "red"}}>
                  {`available quantity is ${available_qty}`}
                </div>
            }
                    </>
                ),
                validate: (rowData) =>{
                  return checkQuantity(
                    rowData.available_qty,
                    rowData.quantity,
                    rowData.item_id,
                    rowData.tableData?.id,
                  )}
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
                    let isvalid = false;
                    const error = checkerror;
                    for (let d of ['name', 'quantity']) {
                      // ,'bar_val'
                      if (!newData[d]) {
                        error[d] = true;
                        isvalid = true;
                      }
                    }
                    if(available_qty === 0){
                      isvalid = false;
                      return reject();
                    }
                    if (isvalid) {
                      setcheckerror(error);
                      return reject();
                    }
                    // if(newData.is_serialized === 0){
                    //   const getLots = newData.oldlots.filter(f=> f.location_id === formValues.source_location_id).slice(0,newData.quantity)
                    //   newData.lots = getLots
                    // }
                    setcheckerror(false);

                    setcategoryData([...categoryData, {...newData, line: categoryData.length + 1}]);
                    setTimeout(() => {
                      addActionRef.current.click();
                    }, 0);
                    resolve();
                    setavailable_qty('')
                  }, 1000);
                }),
              onRowUpdate: (newData, oldData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    const dataUpdate = [...categoryData];
                    const index = dataUpdate.findIndex(d => d.line === oldData.line);
                    dataUpdate[index] = newData;
                    setcategoryData([...dataUpdate]);
                    // props.handleSubmit(newData);
                    resolve();
                  }, 1000);
                }),
              onRowDelete: (oldData) =>
                new Promise((resolve, reject) => {
                  // setTimeout(() => {
                    const dataDelete = [...categoryData];
                    const index = dataDelete.findIndex(d => d.line === oldData.line);
                    dataDelete.splice(index, 1);
                    setcategoryData([...dataDelete]);
                    //  props.handleDelete(oldData.tax_category_id)
                    resolve();
                  // }, 1000);
                }),
            }}
            title={<Typography variant='h6'>Product Details</Typography>}
          />
        </Grid>
        </Grid>
        {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}
        </Grid>

        <br />
        <Grid
          spacing={7}
          // lg={12}
          // md={12}
          // sm={12}
          // xs={12}
          mb={'5px'}
          container
          direction='row'
          display='flex'
          justifyContent='flex-end'
          alignItems='center'
        //
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
                Cancel
              </Button>
            )}
          </Grid>
          <Grid>
            <Button
              onClick={popup}
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
          <br />
          <br />
          <ActionButton />
        </Grid>
        <CancelDialog
          handle={cancel}
          delete={dialog}
          close={props.handleClose}
        ></CancelDialog>

        <ItemPopup
          cancelref={cancelActionRef.current?.click}
          open={row_id.open}
          status={row_id.status}
          setitemsData={setcategoryData}
          handleClose={handleClose}
          itemsData={categoryData}
          row_id={row_id}
          product={product}
          disabledel={disabledel}
          location_id={formValues.source_location_id}
        />

        {/* Not Available source location product */}
        {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </Button> */}
      <Dialog
        open={opennotavailable}
        onClose={handleCloseerrorLocation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="newstocktransfer-dialog-title">
          {"Unmatched Stocks"}
        </DialogTitle>
        {/* <DialogContent>
          {available_product.map((d)=> 
          <DialogContentText id="newstocktransfer-dialog-description">
            {d.product_name + '-' + d.available_qty + '-' + d.qtymismatch }
          </DialogContentText>
          )}
        </DialogContent> */}
        <Grid style={{display:'flex', justifyContent:'space-between'}}>
          {/* serialized product list */}
          <Grid>
            {/* lot input field */}
          
          
            <Table_1 data={available_product} tableName={'Stocks'} />
          </Grid>
          </Grid>

        
        <DialogActions>
          <Button onClick={Allclear}>All clear</Button>
          <Button onClick={UnmatchedClear} autoFocus>
            Unmatched Clear
          </Button>
        </DialogActions>
      </Dialog>
      </div>
      </Card>
    </>
  );
}

function Table_1({data}) {
  // const [productData, setProductData] = useState(data)
  return (
    <Grid
      style={{
        margin: '10px 25px',
        width: '500px',
        height: 'calc(min(50vh, 400px))',
      }}
    >
      <Typography variant='h6' pb={1}>
        {'Product List'}
      </Typography>
      <table
        style={{
          border: '1px solid',
          fontSize: cellStyle.fontSize,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px',
        }}
      >
        <tr>
          <th style={{border: '1px solid', width: '60%'}}>Product Name</th>
          <th style={{border: '1px solid', width: '20%'}}>
            Available Quantity
          </th>
          <th style={{border: '1px solid', width: '20%'}}>Reason</th>
        </tr>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{border: '1px solid', padding: '0px 5px'}}>{d.product_name}</td>
            <td
              style={{
                border: '1px solid',
                padding: '0px 5px',
                textAlign: 'center',
              }}
            >
              {d.available_qty}
            </td>
            <td
              style={{
                border: '1px solid',
                padding: '0px 5px',
                textAlign: 'center',
              }}
            >
              {d.qtymismatch}
            </td>
          
          </tr>
        ))}
      </table>
    </Grid>
  );
}

export default NewStockTransfer;

