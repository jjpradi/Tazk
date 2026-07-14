import React, {Component, createRef, useState} from 'react';
import {connect} from 'react-redux';
import MaterialTable, {MTableAction} from 'utils/SafeMaterialTable';
import {bulkProductAction, purchaseProductTaxesAction, listProductAction, listProductActionByType} from '../../../redux/actions/product_actions';
import {TextField, Chip, Button, Icon, IconButton, Tooltip, Typography, Grid, CircularProgress} from '@mui/material';
import ItemPopup from './itemPopup';
import {Close, Add,Edit} from '@mui/icons-material';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {read, utils} from 'xlsx-js-style';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import MissingProduct from './MissingProduct';
import ReturnItemPopup from '../sales/lotNumber';
import CommonImport from 'components/pos/payment_section/CommonImport';
import apiCalls from 'utils/apiCalls';
import { consolidatedPayables } from 'redux/actions/purchase_actions';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { filterOptions } from 'utils/searchFunc';
import { useCustomFetch } from 'utils/useCustomFetch';
import { filterPriceListProductAction } from 'redux/actions/vendor_actions';
import CommonToolTip from 'components/ToolTip';
import { ErrormsgAlert } from 'redux/actions/load';
import API_URLS from '../../../utils/customFetchApiUrls';
import CommonAutoCategory from 'utils/commongstpreference';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';




const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


function AlertDialogSlide({
  setValidationToDefault,
  unknownVendor,
  duplicateLotNumber,
  lotAlreadyExistInDb,
  differentVendor,
  setOpenAlert
}) {

  const[open , setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false);
    setOpenAlert(false)
    setValidationToDefault()
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby='alert-dialog-slide-description'
      >
        {differentVendor.length > 0 && (
          <>
            <DialogTitle>{differentVendor[0]}</DialogTitle>
            <DialogContent>{differentVendor[1]}</DialogContent>
          </>
          
        )}

        {unknownVendor.length > 0 && (
          <>
            <DialogTitle>{unknownVendor[0]}</DialogTitle>
            <DialogContent>{unknownVendor[1]}</DialogContent>
          </>
          
        )}  

        {duplicateLotNumber.length > 0 && (
          <>
            <Table data={duplicateLotNumber[1]} tableName={'duplicateLotInDb'} />
          </>
          
        )}

        {lotAlreadyExistInDb.length > 0 && (
          <>
            <Table data={lotAlreadyExistInDb[1]} tableName={'lotAlreadyExistInDb'} />
          </>
          
        )}
        
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

class Product extends Component {
  constructor(props) {
    super(props);
    this.addActionRef = createRef();
    this.cancelActionRef = createRef();
    this.bulkEditRef = createRef();
    this.customFetch = useCustomFetch();
    this.state = {
      open: false,
      status: '',
      row_id: {id: '', data: {lots: []}},
      line_count: 1,
      add_click: false,
      withItemId: [],
      dataApi: [],
      filterOpen:false,
      DownloadOpen: false,
      openAlert: false,
      differentVendor : [],
      unknownVendor : [],
      duplicateLotNumber: [],
      lotAlreadyExistInDb: [],
      headers :[
        {
          label : 'Product' , key: 'product',
        },
        {
          label : 'Ordered Qty' ,key : 'qty',
        },
        {
          label : 'Buying Cost' ,key : 'cost',
        },
        {
          label : 'Tax %' ,key : 'tax',
        },
        {
          label : 'Sub Total' ,key : 'sub',
        }
      ],
      data: [
        {
         name : ''
        }
      ],
      isChanged: false,
      dialogOpen: false,
      lotDialogOpenedThrough: 'ROW_EDIT',
      isLoading:false
    };
  }

  async componentDidMount() {
    // if(!this.props.product.length)
    // await this.props.listProductAction()
    if(this.props.returnState){
      this.bulkEditRef?.current?.click()
    }
  }
 


  handleEdit = async (data, onRowDataChange) => {
    // console.log('handleeditffffffffffffffffff', data)
    const id = data.tableData?.id
    
    this.props.updateItem(data)

   
    this.setState({
      open: true,
      row_id: {id , data, onRowDataChange},
      status: 'edit',
    });
   
  };

  handleCreate = async ({rowData, onRowDataChange}) => {
    this.setState({
      open: true,
      row_id: {data: rowData, onRowDataChange, id: rowData.tableData?.id},
      status: 'create',
    });
  };

  handleClose = () => {
    this.setState({open: false, row_id: {id: '', data: {lots: []}}});
  };

  taxes = (rowData) => {
    let total = 0;
    for (let data of rowData) {
      let arr = [];
      for (let d in data) {
        if (['item_cost_price', 'quantity'].includes(d)) {
          arr.push(data[d]);
        }
      }
      total += arr[0] * arr[1];
    }
    return total.toFixed(2);
  };

  singleTax = (prc = 0, qty = 1, data) => {
    const val = prc * qty + ((prc * qty) / 100) * this.getIgst(data);
    return val;
  };

  getIgst = (data) => {
    let tax = '';

    if (data.taxes) {
      data.taxes.forEach((t) => {
        if (t.tax_group === 'IGST') {
          tax = t.tax_rate;
        }
      });
    }
    return tax;
  };

  validateTable = (name, search, input) => {
    let isvalid = true;
    for (let data of this.props.itemsData) {
      if (data.name !== name) {
        for (let d in data) {
          if (d === search) {
            if (data[d] === input) {
              isvalid = false;
            }
          }
        }
      }
    }
    return isvalid;
  };

  async componentDidUpdate(preProps,preState) {
    if (
      Object.keys(this.props.edit_data || []).length &&
      this.props.status === 'edit'
    ) {
      const {receivings_items} = this.props.edit_data;
      const getLast = [...receivings_items].pop().line + 1;

      if (getLast !== this.state.line_count) {
        this.setState({line_count: getLast});
      }
    }
    // if (this.state.isMounted && !preState.isMounted) {
    //   if (this.productInputRef.current) {
    //     this.productInputRef.current.focus();
    //   }
    // }

    if (this.props.selectData.product && this.props.product?.status !== "exists") {
      
      const filter = [...this.props.product];
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
        limit,tax_category_id
      } = pop;

      let gst;
      let tax_category;
      taxes?.forEach((t) => {
        if (t.tax_group === 'IGST') {
          gst = t.tax_rate;
          tax_category = t.tax_category;
        }
      });

      let arr = null

      if (this.props.vendorId.toString().length) {
        let newArray = [item_id];
        let payload = {
          item_id: newArray,
          vendor_id: this.props.vendorId
        }
        this.props.filterPriceListProductAction(payload, async (result) => {
          let priceList_dealerPrice = (await result.length) ? result[0]?.dealerPrice : null;
          let price_list_id = (await result.length) ? result[0]?.price_id : 0;
          let price_list_mrp = (await result.length) ? result[0]?.mrp : 0;

          const dealerPrice = (await (priceList_dealerPrice === null || priceList_dealerPrice === 0))? item_cost_price : priceList_dealerPrice
          // console.log('priceList_dealerPrice')

          this.props.setitemsData([
            ...this.props.itemsData,
            {
              name,
              item_id,
              description,
              item_cost_price: dealerPrice || item_cost_price,
              item_unit_price,
              received_quantity: this.props.poOption === '2' ? 1 : 0,
              ordered_quantity: 1,
              gst,
              tax_category_id,
              tax_category,
              quantity: 1,
              taxes: pop.taxes,
              sub_total: this.singleTax(dealerPrice, 1, pop),
              prod_val: true,
              lots: [],
              qty_per_pack,
              is_serialized,
              line: this.state.line_count,
              hsn_code,
              max_price,
              model,
              price_list_id,
              receiving_quantity:1,
              price_list_mrp
            },
          ]);
        })
      } else {
        this.props.setitemsData([
          ...this.props.itemsData,
          {
            name,
            item_id,
            description,
            item_cost_price: item_cost_price,
            item_unit_price,
            received_quantity: this.props.poOption === '2' ? 1 : 0,
            ordered_quantity: 1,
            gst,
            tax_category_id,
            tax_category,
            quantity: 1,
            taxes: pop.taxes,
            sub_total: this.singleTax(item_cost_price, 1, pop),
            prod_val: true,
            lots: [],
            qty_per_pack,
            is_serialized,
            line: this.state.line_count,
            hsn_code,
            max_price,
            model,
            price_list_id: 0,
            receiving_quantity:1
          },
        ]);
      }
      this.setState({line_count: this.state.line_count + 1});
      this.props.setselectData('product', false);
    }
   if (
    this.props.itemsData.some(
      (row) => row.ordered_quantity === row.return_quantity
    )
  ) {
    const recordsWithNoReturn = this.props.itemsData.filter(
      (row) => row.ordered_quantity !== row.return_quantity
    );
    if (recordsWithNoReturn.length !== this.props.itemsData.length) {
      this.props.setitemsData(recordsWithNoReturn);
    }
  }
  }

  // filterOptions = createFilterOptions({
  //   stringify: (option) => JSON.stringify(option.name + option.sku),
  // });

  // filterOptions = (options, { inputValue }) => {
  //   const inputKeywords = inputValue.toLowerCase().split(' ');
  //   return options.filter((option) => {
  //     const optionName = option.name ? option.name.toLowerCase() : '';
  //     const optionSku = option.sku ? option.sku.toLowerCase() : '';
  //     const optionLots = option.lots ? option.lots.map((d) => d.lot_number.toLowerCase()).join(' ') : '';
  //     const optionString = optionName + optionSku + optionLots;

  //     return inputKeywords.every((keyword) => optionString.includes(keyword));
  //   });
  // }

  isAdd = () => {
    if (this.props.status && this.props.status === 'edit') {
      // console.log("asdasd",this.props.edit_data)
      const status = this.props.edit_data.status;
      return status === 'Completed' || status?.startsWith('Pending')
        ? true
        : false;
    }
    return false;
  };

  shouldShowAdd =()=>{
   const {edit_data } = this.props;
   if (edit_data?.type === 'po') {
    return false;
    }
    return true;
  }

  preventNegative = (e) => {
    let val = parseInt(e.target.value, 10);
    let number = 0;
    if (isNaN(val)) {
      number = '';
    } else {
      // is A Number
      val = val >= 0 ? val : 0;
      number = val;
    }
    return number;
  };


  //old purchase upload 
  // encodeImageFileAsURL111 = (e) => {
  //   const reader = new FileReader();
  //   const rABS = !!reader.readAsBinaryString;
  //   const file = e.target.files[0];


  //   reader.onload = async (e) => {
  //     this.setState({ filterOpen: false })
  //     const bstr = e.target.result;
  //     const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
  //     const wsname = wb.SheetNames[0];
  //     const ws = wb.Sheets[wsname];
  //     const temp1 = utils.sheet_to_json(ws);

  //     const temp_1_xl_data = temp1.filter(i => i.ProductName && i.SupplierName && i.PurchaseQuantity && i.PurchaseCost)

  //     const data = temp_1_xl_data.map((i) => (removeUnnecessaryChar(i)));

  //     console.log("data11", data)
  //     function removeUnnecessaryChar(data) {

  //       const conversion = {
  //         LotNumber(val) {
  //           console.log("val", val)
  //           return val.trim()
  //         },
  //         PurchaseQuantity(val) {
  //           return parseInt(val)
  //         },
  //         PurchaseCost(val) {
  //           return parseFloat(val)
  //         },
  //       }

  //       let tempObj = {};

  //       for (let key in data) {
  //         let val = data[key]
  //         let modifiedVal;
  //         if (val !== undefined && typeof val === 'string') {
  //           modifiedVal = val.replace(/(\r\n|\n|\r)/gm, "").trim()
  //         }
  //         if (['LotNumber', 'PurchaseQuantity', 'PurchaseCost'].includes(key)) {
  //           tempObj[key] = conversion[key](modifiedVal || val)
  //         } else {
  //           tempObj[key] = modifiedVal || val
  //         }
  //       }

  //       return tempObj;
  //     }


  //     const withItemId = [];
  //     const wOutItemId = [];
  //     let supplier_id = ''
  //     let flag = false;

  //     if ((this.props.status !== 'edit' || this.props.poOption === '2') && data.length) {
  //       let vendorFromUpload = data[0]?.SupplierName
  //       // console.log("vendorFromUpload", vendorFromUpload)
  //       const isAllVendorSame = data.every(v => v.SupplierName === vendorFromUpload);
  //       if (isAllVendorSame) {
  //         flag = true
  //         const res = this.props.vendor.filter(d => d.company_name && d.supplier_id && d.supplier_id !== null && d.company_name === vendorFromUpload)

  //         if (res.length) {

  //           this.props.supplierUpdate({ target: { name: 'supplier_id', value: res[0]?.supplier_id !== null ? res[0]?.supplier_id : null } })
  //           supplier_id = res[0]?.supplier_id

  //           // let filteredData = data.filter((e) => e.is_serialized === 1);


  //         } else {
  //           // alert(`${data[0]?.SupplierName} Unkown Vendor!...`)
  //           flag = false;
  //           this.setState({ unknownVendor: ['Unknown Vendor', `"${vendorFromUpload}" is not in the Records`] })
  //         }

  //       } else {
  //         flag = false
  //         vendorFromUpload = null
  //         this.setState({ differentVendor: ['Multiple Vendor Name', 'Multiple vendor name found. Use one vendor per upload'] })
  //       }

  //       if ((this.props.status === 'edit' || this.props.poOption === '2')) {
  //         let invoice_value = Array.from(new Set(data.map((a) => a.InvoiceNo))).join(', ')
  //         this.props.invoiceUpdateState({ ...this.props.formValues, invoice_number: invoice_value })
  //         if (invoice_value) {
  //           this.props.setcheckerror({ ...this.props.checkerror, invoice_number: false })
  //         }
  //       }



  //     }
  //     if (supplier_id !== '' || (this.props.status === 'edit' || this.props.poOption === '2')) {
  //       // const matchingProduct = data.filter(f=> this.props.product.some(d=> f.name === d.ProductName ))
  //       const matchingProduct = data.filter(i => this.props.product.some(j => j.name === i.ProductName)).map(i => {
  //         let p = this.props.product.find(j => j.name === i.ProductName)
  //         return { ...i, ...p }
  //       })

  //       let lotAlreadyExistInDb = [];

  //       // console.log("lotAlreadyExistInDb", lotAlreadyExistInDb)


  //       const checkLotExits = async () => {
  //         const _lots = data
  //           .flatMap(i =>
  //             i.LotNumber
  //               .replace(/[{}]/g, "")
  //               .split(",")
  //               .map(l => l.trim())
  //               .filter(Boolean)
  //           );

  //         const { data: existLots, loading, error } = await this.customFetch(`/purchase/checkLotExists`, 'POST', { lotNumbers: _lots });
  //         const temp = data.filter(i => {
  //           const lotsInRow = i.LotNumber
  //             .split(",")
  //             .map(lot => lot.trim())
  //             .filter(Boolean);

  //           return lotsInRow.some(lot => existLots.includes(lot));
  //         });

  //         // console.log("Matched rows:", temp);
  //         lotAlreadyExistInDb = temp
  //       }

  //       // data.forEach(x => LotsFilter(x))
  //       await checkLotExits()

  //       if (lotAlreadyExistInDb.length > 0) {
  //         // console.log("lotAlreadyExistInDb",lotAlreadyExistInDb)
  //         let temp = lotAlreadyExistInDb.map(item => { return { ['name']: item.ProductName, ['lot']: item.LotNumber } })
  //         // console.log("temp", temp)
  //         flag = false;
  //         this.setState({ lotAlreadyExistInDb: ['Lot Already Exits in Database', temp] })
  //       } else {
  //         let lotCount = {};
  //         data.forEach(item => {
  //           const lots = item.LotNumber.split(",").map(lot => lot.trim());
  //           lots.forEach(lot => {
  //             if (!lot) return;
  //             if (!lotCount[lot]) lotCount[lot] = [];
  //             lotCount[lot].push(item);
  //           });
  //         });
          
          
  //         let tempDuplicateLot = [];
  //         for (const [lot, items] of Object.entries(lotCount)) {
  //           if (items.length > 1) {
  //             items.forEach(item => {
  //               tempDuplicateLot.push({
  //                 name: item.ProductName,
  //                 lot: lot
  //               });
  //             });
  //           }
  //         }

  //         if (tempDuplicateLot.length > 0) {
  //           flag = false;
  //           this.setState({ duplicateLotNumber: ['Duplicate Lot Number', tempDuplicateLot] })
  //         } else {
  //           flag = true;
  //         }
  //       }


  //       const helper = [];

  //       const result = matchingProduct.reduce((a, c) => {
  //         const key = c.ProductName + c.PurchaseCost;
  //         if (!helper[key]) {
  //           helper[key] = { ...c };
  //           a.push(helper[key])
  //         } else {
  //           helper[key].PurchaseQuantity += c.PurchaseQuantity;
  //         }
  //         return a
  //       }, [])
  //       console.log("result", result)
  //       result.forEach((t, index) => {
  //         const {
  //           cost_price: PurchaseCost,
  //           unit_price: item_unit_price,
  //           taxes,
  //         } = t;
  //         let gst;
  //         let tax_category;
  //         taxes.forEach((s) => {
  //           if (s.tax_group === 'IGST') {
  //             gst = s.tax_rate;
  //             tax_category = s.tax_category;
  //           }
  //         });

  //         let lots = data
  //           .filter(f => f.ProductName === t.name && f.PurchaseCost === t.PurchaseCost)
  //           .flatMap(m => {
  //             return m.LotNumber
  //               .replace(/[{}]/g, "")
  //               .split(",")
  //               .map(l => ({ lot_number: l.trim() }));
  //           });

  //         // let lots =  data.filter(f => f.ProductName === t.name  && f.PurchaseCost === t.PurchaseCost).map(m => {
  //         //   return {lot_number : m.LotNumber}
  //         // })
  //         // let quantity = data.filter(f => f.ProductName === t.name).reduce((acc,current) => acc + + current.PurchaseQuantity,0)
  //         let quantity = t.PurchaseQuantity
  //         // let cost_priceProduct = data.filter(f => f.ProductName === t.name)[0]?.PurchaseCost || 0
  //         let cost_priceProduct = t.PurchaseCost
  //         withItemId.push({
  //           ...t,
  //           gst,
  //           tax_category,
  //           item_cost_price: cost_priceProduct && cost_priceProduct !== '' ? cost_priceProduct : t.cost_price,
  //           item_unit_price: t.unit_price ? t.unit_price : 0,
  //           quantity: quantity,
  //           prod_val: true,
  //           line: withItemId.length + 1,
  //           sub_total: this.singleTax(cost_priceProduct, quantity, {
  //             taxes,
  //           }).toFixed(2),
  //           received_quantity: (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0,
  //           ordered_quantity: quantity,
  //           receiving_quantity: (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0,
  //           lots: t.is_serialized === 1 && (this.props.status === 'edit' || this.props.poOption === '2') ? lots : [],
  //         });

  //         if ((this.props.status === 'edit' || this.props.poOption === '2') && matchingProduct.length - 1 === index) {
  //           this.props.invoiceUpdateState({ ...this.props.formValues, invoice_number: Array.from(new Set(data.map((a) => a.InvoiceNo))).join(', ') })
  //         }
  //       });


  //       // if (!isItem) {
  //       //   if (d.ProductName) wOutItemId.push(d);
  //       // }
  //       let MisMatchProduct = data.filter(d => !this.props.product.some(f => f.name === d.ProductName))

  //       MisMatchProduct.forEach((misMatch, index) => {

  //         wOutItemId.push(misMatch);
  //       })
  //     }

  //     // console.log("wOutItemId", wOutItemId)

  //     if (wOutItemId.length) {
  //       const dataApi = wOutItemId.map((d) => {
  //         const newD = {
  //           name: d.ProductName,
  //           cost_price: d.PurchaseCost || 0,
  //           receiving_quantity: 0,
  //           qty_per_pack: 1,
  //           is_serialized:
  //             typeof d.LotNumber !== 'undefined' &&
  //               d.LotNumber !== '' &&
  //               d.LotNumber !== null
  //               ? 1
  //               : 0,
  //           hsn_code: null,
  //           brand: null,
  //           category: null,
  //           model: null,
  //           unit_price: null,
  //           sku: null,
  //           tax_category_id: null,
  //           max_price: 0,
  //         };
  //         delete newD.LotNumber;

  //         return {
  //           ...newD,
  //           stock_type: 1,
  //           unit_price: +d.unit_price || d.cost_price,
  //         };
  //       });
  //       if (flag) {
  //         this.setState({ mp_open: true, dataApi, withItemId, xl_data: data });
  //       } else {
  //         this.setState({ openAlert: true })
  //       }
  //     } else {
  //       // console.log("withItemId", withItemId)
  //       let RowData = withItemId.map((row, i) => {
  //         let check = this.props.itemsData.filter(item => item.item_id === row.item_id)
  //         if (check.length) {
  //           return { ...row, receiving_id: check[0]?.receiving_id, receiving_item_id: check[0]?.receiving_item_id, line: i + 1 }
  //         } else {
  //           return row
  //         }

  //       })
  //       // console.log("flag", flag)
  //       if (flag) {
  //         this.props.setitemsData(this.props.status !== 'edit' ? withItemId : RowData);
  //       } else {
  //         this.setState({ openAlert: true })
  //       }
  //     }
  //   };

  //   if (rABS) {
  //     reader.readAsBinaryString(file);
  //   } else {
  //     reader.readAsArrayBuffer(file);
  //   }

  //   this.setState({ filterOpen: false })
    
  // };

  //old

  // encodeImageFileAsURL = (e) => {
  //   const reader = new FileReader();
  //   const rABS = !!reader.readAsBinaryString;
  //   const file = e.target.files[0];


  //   reader.onload = async (e) => {
  //     this.setState({ filterOpen: false })
  //     const bstr = e.target.result;
  //     const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
  //     const wsname = wb.SheetNames[0];
  //     const ws = wb.Sheets[wsname];
  //     const temp1 = utils.sheet_to_json(ws);

  //     const temp_1_xl_data = temp1.filter(i => i.ProductName && i.PurchaseQuantity && i.PurchaseCost)

  //     const data = temp_1_xl_data.map((i) => (removeUnnecessaryChar(i)));

  //     // console.log("data11", data)
  //     function removeUnnecessaryChar(data) {

  //       const conversion = {
  //         LotNumber(val) {
  //           // console.log("val", val)
  //           return val.trim()
  //         },
  //         PurchaseQuantity(val) {
  //           return parseInt(val)
  //         },
  //         PurchaseCost(val) {
  //           return parseFloat(val)
  //         },
  //       }

  //       let tempObj = {};

  //       for (let key in data) {
  //         let val = data[key]
  //         let modifiedVal;
  //         if (val !== undefined && typeof val === 'string') {
  //           modifiedVal = val.replace(/(\r\n|\n|\r)/gm, "").trim()
  //         }
  //         if (['LotNumber', 'PurchaseQuantity', 'PurchaseCost'].includes(key)) {
  //           tempObj[key] = conversion[key](modifiedVal || val)
  //         } else {
  //           tempObj[key] = modifiedVal || val
  //         }
  //       }

  //       return tempObj;
  //     }


  //     const withItemId = [];
  //     const wOutItemId = [];
  //     let supplier_id = ''
  //     let flag = false;

  //     if (data.length) {
  //       // console.log("this.props.formValues",this.props.formValues)
  //       if (this.props.vendorId) {
  //         const res = this.props.vendor.filter(d => d.company_name && d.supplier_id && d.supplier_id !== null && d.supplier_id === this.props.vendorId)

  //         if (res.length) {
  //           this.props.supplierUpdate({ target: { name: 'supplier_id', value: res[0]?.supplier_id !== null ? res[0]?.supplier_id : null } })
  //           supplier_id = res[0]?.supplier_id
  //         }
  //         if (this.props.formValues.invoice_number === '') {
  //           alert('Enter Invoice Number')
  //           return;
  //         }
  //         else {


  //           // const matchingProduct = data.filter(f=> this.props.product.some(d=> f.name === d.ProductName ))
  //           const matchingProduct = data.filter(i => this.props.product.some(j => j.name === i.ProductName)).map(i => {
  //             let p = this.props.product.find(j => j.name === i.ProductName)
  //             return { ...i, ...p }
  //           })

  //           let lotAlreadyExistInDb = [];

  //           // console.log("lotAlreadyExistInDb", lotAlreadyExistInDb)


  //           const checkLotExits = async () => {
  //             const _lots = data
  //               .flatMap(i =>
  //                 i.LotNumber
  //                   .replace(/[{}]/g, "")
  //                   .split(",")
  //                   .map(l => l.trim())
  //                   .filter(Boolean)
  //               );

  //             const { data: existLots, loading, error } = await this.customFetch(`/purchase/checkLotExists`, 'POST', { lotNumbers: _lots });
  //             const temp = data.filter(i => {
  //               const lotsInRow = i.LotNumber
  //                 .split(",")
  //                 .map(lot => lot.trim())
  //                 .filter(Boolean);

  //               return lotsInRow.some(lot => existLots.includes(lot));
  //             });

  //             // console.log("Matched rows:", temp);
  //             lotAlreadyExistInDb = temp
  //           }

  //           // data.forEach(x => LotsFilter(x))
  //           await checkLotExits()

  //           if (lotAlreadyExistInDb.length > 0) {
  //             // console.log("lotAlreadyExistInDb",lotAlreadyExistInDb)
  //             let temp = lotAlreadyExistInDb.map(item => { return { ['name']: item.ProductName, ['lot']: item.LotNumber } })
  //             // console.log("temp", temp)
  //             flag = false;
  //             this.setState({ lotAlreadyExistInDb: ['Lot Already Exits in Database', temp] })
  //           } else {
  //             let lotCount = {};
  //             data.forEach(item => {
  //               const lots = item.LotNumber.split(",").map(lot => lot.trim());
  //               lots.forEach(lot => {
  //                 if (!lot) return;
  //                 if (!lotCount[lot]) lotCount[lot] = [];
  //                 lotCount[lot].push(item);
  //               });
  //             });


  //             let tempDuplicateLot = [];
  //             for (const [lot, items] of Object.entries(lotCount)) {
  //               if (items.length > 1) {
  //                 items.forEach(item => {
  //                   tempDuplicateLot.push({
  //                     name: item.ProductName,
  //                     lot: lot
  //                   });
  //                 });
  //               }
  //             }

  //             if (tempDuplicateLot.length > 0) {
  //               flag = false;
  //               this.setState({ duplicateLotNumber: ['Duplicate Lot Number', tempDuplicateLot] })
  //             } else {
  //               flag = true;
  //             }
  //           }


  //           const helper = [];

  //           const result = matchingProduct.reduce((a, c) => {
  //             const key = c.ProductName + c.PurchaseCost;
  //             if (!helper[key]) {
  //               helper[key] = { ...c };
  //               a.push(helper[key])
  //             } else {
  //               helper[key].PurchaseQuantity += c.PurchaseQuantity;
  //             }
  //             return a
  //           }, [])
  //           // console.log("result", result)
  //           result.forEach((t, index) => {
  //             const {
  //               cost_price: PurchaseCost,
  //               unit_price: item_unit_price,
  //               taxes,
  //             } = t;
  //             let gst;
  //             let tax_category;
  //             taxes.forEach((s) => {
  //               if (s.tax_group === 'IGST') {
  //                 gst = s.tax_rate;
  //                 tax_category = s.tax_category;
  //               }
  //             });

  //             let lots = data
  //               .filter(f => f.ProductName === t.name && f.PurchaseCost === t.PurchaseCost)
  //               .flatMap(m => {
  //                 return m.LotNumber
  //                   .replace(/[{}]/g, "")
  //                   .split(",")
  //                   .map(l => ({ lot_number: l.trim() }));
  //               });

  //             // let lots =  data.filter(f => f.ProductName === t.name  && f.PurchaseCost === t.PurchaseCost).map(m => {
  //             //   return {lot_number : m.LotNumber}
  //             // })
  //             // let quantity = data.filter(f => f.ProductName === t.name).reduce((acc,current) => acc + + current.PurchaseQuantity,0)
  //             let quantity = t.PurchaseQuantity
  //             // let cost_priceProduct = data.filter(f => f.ProductName === t.name)[0]?.PurchaseCost || 0
  //             let cost_priceProduct = t.PurchaseCost
  //             withItemId.push({
  //               ...t,
  //               gst,
  //               tax_category,
  //               item_cost_price: cost_priceProduct && cost_priceProduct !== '' ? cost_priceProduct : t.cost_price,
  //               item_unit_price: t.unit_price ? t.unit_price : 0,
  //               quantity: quantity,
  //               prod_val: true,
  //               line: withItemId.length + 1,
  //               sub_total: this.singleTax(cost_priceProduct, quantity, {
  //                 taxes,
  //               }).toFixed(2),
  //               received_quantity: (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0,
  //               ordered_quantity: quantity,
  //               receiving_quantity: (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0,
  //               lots: t.is_serialized === 1 && (this.props.status === 'edit' || this.props.poOption === '2') ? lots : [],
  //             });

  //             if ((this.props.status === 'edit' || this.props.poOption === '2') && matchingProduct.length - 1 === index) {
  //               this.props.invoiceUpdateState({ ...this.props.formValues, invoice_number: this.props.formValues.invoice_number })
  //             }
  //           });


  //           // if (!isItem) {
  //           //   if (d.ProductName) wOutItemId.push(d);
  //           // }
  //           let MisMatchProduct = data.filter(d => !this.props.product.some(f => f.name === d.ProductName))

  //           MisMatchProduct.forEach((misMatch, index) => {

  //             wOutItemId.push(misMatch);
  //           })

  //         }




  //       }

  //       else {
  //         alert('Select Vendor');
  //         return;
  //       }





  //     }


  //     // console.log("wOutItemId", wOutItemId)

  //     if (wOutItemId.length) {
  //       const dataApi = wOutItemId.map((d) => {
  //         const newD = {
  //           name: d.ProductName,
  //           cost_price: d.PurchaseCost || 0,
  //           receiving_quantity: 0,
  //           qty_per_pack: 1,
  //           is_serialized:
  //             typeof d.LotNumber !== 'undefined' &&
  //               d.LotNumber !== '' &&
  //               d.LotNumber !== null
  //               ? 1
  //               : 0,
  //           hsn_code: null,
  //           brand: null,
  //           category: null,
  //           model: null,
  //           unit_price: null,
  //           sku: null,
  //           tax_category_id: null,
  //           max_price: 0,
  //         };
  //         delete newD.LotNumber;

  //         return {
  //           ...newD,
  //           stock_type: 1,
  //           unit_price: +d.unit_price || d.cost_price,
  //         };
  //       });
  //       if (flag) {
  //         this.setState({ mp_open: true, dataApi, withItemId, xl_data: data });
  //       } else {
  //         this.setState({ openAlert: true })
  //       }
  //     } else {
  //       // console.log("withItemId", withItemId)
  //       let RowData = withItemId.map((row, i) => {
  //         let check = this.props.itemsData.filter(item => item.item_id === row.item_id)
  //         if (check.length) {
  //           return { ...row, receiving_id: check[0]?.receiving_id, receiving_item_id: check[0]?.receiving_item_id, line: i + 1 }
  //         } else {
  //           return row
  //         }

  //       })
  //       // console.log("flag", flag)
  //       if (flag) {
  //         this.props.setitemsData(this.props.status !== 'edit' ? withItemId : RowData);
  //       } else {
  //         this.setState({ openAlert: true })
  //       }
  //     }
  //   };

  //   if (rABS) {
  //     reader.readAsBinaryString(file);
  //   } else {
  //     reader.readAsArrayBuffer(file);
  //   }

  //   this.setState({ filterOpen: false })

  // };




  encodeImageFileAsURL = (e) => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    const file = e.target.files[0];


    reader.onload = async (e) => {
      this.setState({ filterOpen: false })
      const bstr = e.target.result;
      const wb = read(bstr, { type: rABS ? 'binary' : 'array', bookVBA: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const temp1 = utils.sheet_to_json(ws);

      const temp_1_xl_data = temp1.filter(i => i.ProductName && i.PurchaseQuantity && i.PurchaseCost)

      const data = temp_1_xl_data.map((i) => (removeUnnecessaryChar(i)));

      // console.log("data11", data)
      function removeUnnecessaryChar(data) {

        const conversion = {
          LotNumber(val) {
            // console.log("val", val)
            return typeof val === 'string' ? val.trim() : String(val).trim();
          },
          PurchaseQuantity(val) {
            return parseInt(val)
          },
          PurchaseCost(val) {
            return parseFloat(val)
          },
        }

        let tempObj = {};

        for (let key in data) {
          let val = data[key]
          let modifiedVal;
          if (val !== undefined && typeof val === 'string') {
            modifiedVal = val.replace(/(\r\n|\n|\r)/gm, "").trim()
          }
          if (['LotNumber', 'PurchaseQuantity', 'PurchaseCost'].includes(key)) {
            tempObj[key] = conversion[key](modifiedVal || val)
          } else {
            tempObj[key] = modifiedVal || val
          }
        }

        return tempObj;
      }


      const invalidLotQuantities = data.filter(
        (row) => row.LotNumber && row.PurchaseQuantity !== 1
      );

      if (invalidLotQuantities.length > 0) {
        const errorRows = invalidLotQuantities.map(row => `Product: ${row.ProductName}, Lot: ${row.LotNumber}, Quantity: ${row.PurchaseQuantity}`);
        this.props.dispatchErrorAlert(`Serialized Product each row one purchase quantity is only allowed.\nInvalid entries:\n${errorRows.join('\n')}`);

        return;
      }
      const withItemId = [];
      const wOutItemId = [];
      let supplier_id = ''
      let flag = false;

      if (data.length) {
        // console.log("this.props.formValues",this.props.formValues)
        if (this.props.vendorId) {
          const res = this.props.vendor.filter(d => d.company_name && d.supplier_id && d.supplier_id !== null && d.supplier_id === this.props.vendorId)

          if (res.length) {
            this.props.supplierUpdate({ target: { name: 'supplier_id', value: res[0]?.supplier_id !== null ? res[0]?.supplier_id : null } })
            supplier_id = res[0]?.supplier_id
          }
          if (this.props.formValues.invoice_number === '') {
            alert('Enter Invoice Number')
            return;
          }
          else {


            // const matchingProduct = data.filter(f=> this.props.product.some(d=> f.name === d.ProductName ))
            const matchingProduct = data.filter(i => this.props.productByType.some(j => j.name === i.ProductName)).map(i => {
              let p = this.props.productByType.find(j => j.name === i.ProductName)
              return { ...i, ...p }
            })

            let lotAlreadyExistInDb = [];

            // console.log("lotAlreadyExistInDb", lotAlreadyExistInDb)


            const checkLotExits = async () => {
              // const _lots = data
              //   .flatMap(i =>
              //     i.LotNumber
              //       .replace(/[{}]/g, "")
              //       .split(",")
              //       .map(l => l.trim())
              //       .filter(Boolean)
              //   );
              const _lots = data
                .map(i => i.LotNumber?.toString().trim())
                .filter(lot => lot && lot !== "");
              if (_lots.length === 0) {
                lotAlreadyExistInDb = [];
                return;
              }
      
              const { data: existLots, loading, error } = await this.customFetch(
                API_URLS.PURCHASE_CHECK_LOT_EXISTS,
                'POST',
                { lotNumbers: _lots }
              );
              // const temp = data.filter(i => {
              //   const lotsInRow = i.LotNumber
              //     .split(",")
              //     .map(lot => lot.trim())
              //     .filter(Boolean);

              //   return lotsInRow.some(lot => existLots.includes(lot));
              // });
               const temp = data.filter(i => existLots.includes(i.LotNumber))
              // console.log("Matched rows:", temp);
              lotAlreadyExistInDb = temp
            }

            // data.forEach(x => LotsFilter(x))
            await checkLotExits()

            if (lotAlreadyExistInDb.length > 0) {
              // console.log("lotAlreadyExistInDb",lotAlreadyExistInDb)
              let temp = lotAlreadyExistInDb.map(item => { return { ['name']: item.ProductName, ['lot']: item.LotNumber } })
              // console.log("temp", temp)
              flag = false;
              this.setState({ lotAlreadyExistInDb: ['Lot Already Exits in Database', temp] })
            } else {
              let lotCount = {};


              data.forEach(item => {
                const lot = item.LotNumber?.toString().trim();
                if (!lot) return;
                if (!lotCount[lot]) lotCount[lot] = [];
                lotCount[lot].push(item);
              });

              let tempDuplicateLot = [];

              for (const [lot, items] of Object.entries(lotCount)) {
                if (items.length > 1) {
                  items.forEach(item => {
                    tempDuplicateLot.push({
                      name: item.ProductName,
                      lot: lot
                    });
                  });
                }
              }


              if (tempDuplicateLot.length > 0) {
                flag = false;
                this.setState({ duplicateLotNumber: ['Duplicate Lot Number', tempDuplicateLot] })
              } else {
                flag = true;
              }
            }


            const helper = [];

            const result = matchingProduct.reduce((a, c) => {
              const key = c.ProductName + c.PurchaseCost;
              if (!helper[key]) {
                helper[key] = { ...c };
                a.push(helper[key])
              } else {
                helper[key].PurchaseQuantity += c.PurchaseQuantity;
              }
              return a
            }, [])
            // console.log("result", result)
            result.forEach((t, index) => {
              const {
                cost_price: PurchaseCost,
                unit_price: item_unit_price,
                taxes,
              } = t;
              let gst;
              let tax_category;
              let tax_category_id = t?.tax_category_id ?? null;
              (taxes || []).forEach((s) => {
                if (s.tax_group === 'IGST') {
                  gst = s.tax_rate;
                  tax_category = s.tax_category;
                  tax_category_id = tax_category_id ?? s.tax_category_id ?? null;
                }
              });

              // let lots = data
              //   .filter(f => f.ProductName === t.name && f.PurchaseCost === t.PurchaseCost)
              //   .flatMap(m => {
              //     return m.LotNumber
              //       .replace(/[{}]/g, "")
              //       .split(",")
              //       .map(l => ({ lot_number: l.trim() }));
              //   });

              let lots =  data.filter(f => f.ProductName === t.name  && f.PurchaseCost === t.PurchaseCost).map(m => {
                return {lot_number : m.LotNumber}
              })
              // let quantity = data.filter(f => f.ProductName === t.name).reduce((acc,current) => acc + + current.PurchaseQuantity,0)
              let quantity = t.PurchaseQuantity
              // let cost_priceProduct = data.filter(f => f.ProductName === t.name)[0]?.PurchaseCost || 0
              let cost_priceProduct = t.PurchaseCost
              withItemId.push({
                ...t,
                gst,
                tax_category,
                tax_category_id,
                item_cost_price: cost_priceProduct && cost_priceProduct !== '' ? cost_priceProduct : t.cost_price,
                item_unit_price: t.unit_price ? t.unit_price : 0,
                quantity: quantity,
                prod_val: true,
                line: withItemId.length + 1,
                sub_total: this.singleTax(cost_priceProduct, quantity, {
                  taxes,
                }).toFixed(2),
                received_quantity: (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0,
                ordered_quantity: quantity,
                receiving_quantity: (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0,
                lots: t.is_serialized === 1 && (this.props.status === 'edit' || this.props.poOption === '2') ? lots : [],
              });

              if ((this.props.status === 'edit' || this.props.poOption === '2') && matchingProduct.length - 1 === index) {
                this.props.invoiceUpdateState({ ...this.props.formValues, invoice_number: this.props.formValues.invoice_number })
              }
            });


            // if (!isItem) {
            //   if (d.ProductName) wOutItemId.push(d);
            // }
            let MisMatchProduct = data.filter(d => !this.props.productByType.some(f => f.name === d.ProductName))

            MisMatchProduct.forEach((misMatch, index) => {

              wOutItemId.push(misMatch);
            })

          }




        }

        else {
          alert('Select Vendor');
          return;
        }





      }


      // console.log("wOutItemId", wOutItemId)

      if (wOutItemId.length) {
        const dataApi = wOutItemId.map((d) => {
          const newD = {
            name: d.ProductName,
            cost_price: d.PurchaseCost || 0,
            receiving_quantity: 0,
            qty_per_pack: 1,
            is_serialized:
              typeof d.LotNumber !== 'undefined' &&
                d.LotNumber !== '' &&
                d.LotNumber !== null
                ? 1
                : 0,
            hsn_code: null,
            brand: null,
            category: null,
            model: null,
            unit_price: null,
            sku: null,
            tax_category_id: null,
            max_price: 0,
          };
          delete newD.LotNumber;

          return {
            ...newD,
            stock_type: 1,
            unit_price: +d.unit_price || d.cost_price,
          };
        });
        if (flag) {
          this.setState({ mp_open: true, dataApi, withItemId, xl_data: data });
        } else {
          this.setState({ openAlert: true })
        }
      } else {
        // console.log("withItemId", withItemId)
        let RowData = withItemId.map((row, i) => {
          let check = this.props.itemsData.filter(item => item.item_id === row.item_id)
          if (check.length) {
            return { ...row, receiving_id: check[0]?.receiving_id, receiving_item_id: check[0]?.receiving_item_id, line: i + 1 }
          } else {
            return row
          }

        })
        // console.log("flag", flag)
        if (flag) {
          this.props.setitemsData(this.props.status !== 'edit' ? withItemId : RowData);
        } else {
          this.setState({ openAlert: true })
        }
      }
    };

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    this.setState({ filterOpen: false })

  };
  productClose = () => {
    this.setState({mp_open: false});
  };


  setDataApi = (data) => {
    this.setState({dataApi: data});
  };

  bulkApiCreate = (productData) => {
    // console.log("productData",productData)
    const dataApi = productData.map(({ tableData, tax_percentage, ...record }) => record);
    apiCalls(
      this.context.setModalTypeHandler,
      this.context.setLoaderStatusHandler,
      this.props.bulkProductAction(
        dataApi,
        this.props.setLoaderStatusHandler,
        (isRes, data) => {
          if (isRes) {
            const getResData = data.map((d,index) => {
              const newData = {...d};
  
              d.taxes.forEach((t) => {
                if (t.tax_group === 'IGST') {
                  newData.gst = t.tax_rate;
                  newData.tax_category = t.tax_category;
                }
              });
  
              const taxed =
                d.cost_price + (d.cost_price / 100) * (newData.gst || 1);
  
              newData.item_cost_price = d.cost_price;
              newData.item_unit_price = d.unit_price;
              newData.prod_val = true;
  
              let lots = [];
              let quantity = 0;
              this.state.xl_data.forEach((t) => {
                if (t.ProductName.toString() === d.name) {
                  if (t.LotNumber && t.LotNumber !== '') {
                    lots.push({lot_number: t.LotNumber});
                  }
                  quantity += t.PurchaseQuantity;
                }
              });
              // this.state.xl_data.forEach((t) => {
              //   if (t.ProductName.toString() === d.name) {
              //     if (t.LotNumber && t.LotNumber !== '') {
              //       const lotNumbers = t.LotNumber.split(',').map(lot => lot.trim());
              //       lotNumbers.forEach(lot => {
              //         if (lot) {
              //           lots.push({ lot_number: lot });
              //         }
              //       });
              //     }
              //     quantity += t.PurchaseQuantity;
              //   }
              // });
              newData.received_quantity = (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0;
              newData.ordered_quantity = quantity;
              newData.receiving_quantity = (this.props.status === 'edit' || this.props.poOption === '2') ? quantity : 0,
              newData.sub_total = (taxed * quantity).toFixed(2);
              newData.quantity = quantity;
              newData.lots = d.is_serialized === 1 && (this.props.status === 'edit' || this.props.poOption === '2') ? lots : [];
              return newData;
            });
            // console.log("getResData",getResData)
  
            const mergeData = [...this.state.withItemId, ...getResData];
            this.props.setitemsData(mergeData);
            this.setState({mp_open: false});
          }
        },
      )
      
	  );

  };

  handleFilter = (data) => this.setState({filterOpen: data});

  DownloadOpen =() => {
    this.setState({DownloadOpen:true})
  }

  LotResReturn = (rowData, qty) => {
    let res = [];
    if (rowData.is_serialized === 0 && rowData.lots.length >= parseInt(qty)) {
      rowData.lots.map((l, i) => {
        if (i <= parseInt(qty) - 1) {
          res.push(l);
        } else if (i === rowData.lots.length - 1) {
          return res;
        }
      });
    } else {
      return (res = rowData.lots);
    }
    return res;
  };

  exportSample =() => {
          ExportCsv('ReceivingItemsData')
  }

  handleFilterOpen = () => {
    if(this.props.formValues.location_id === ''){
      alert("Select any location")
    }else{
      this.setState({ filterOpen: true})
    }
  }

  handleFilterClose = () => {
    this.setState({ filterOpen: false})
  }

  setLotDialogOpenedThrough = (val) => {
    console.log('ggg');
    
    this.setState({lotDialogOpenedThrough : val})
  }

  floatnum = (num) => {
    if (!num) return 0
    const str = num.toFixed(2)
    const numarray = str.split('.')
    let convert = numarray[0]
    if (numarray[1]) {
        convert += '.' + numarray[1]
    } 
    else {
        convert += '.00'
    }
    return parseFloat(convert)
  }

  sanitizeTableRow = (row = {}) => {
    const {tableData, _isDeleting, ...cleanRow} = row;
    return cleanRow;
  }

  render() {
     console.log(this.props.purchasereturn,'poasdsfdf')
     console.log('this.props.itemsData', this.props.itemsData)
     console.log('exceedlimitddded', this.props.status, this.props.returnState, this.props.purchase_outstanding, this.props.itemsData)
    return (
      <>
        <MissingProduct
          open={this.state.mp_open}
          handleClose={this.productClose}
          wOutItemId={this.state.dataApi}
          setDataApi={this.setDataApi}
          bulkApiCreate={this.bulkApiCreate}
          from='purchaseupload'
        />
        <MaterialTable
          components={{
            ...stickyTableComponents,
            Action: (props) => {
              if (props.action.tooltip === 'Cancel') {
                return (
                  <div
                    ref={this.cancelActionRef}
                    onClick={props.action.onClick}
                  >
                    <Tooltip title='Cancel'>
                      <IconButton>
                        <Close style={{color: 'black'}} />
                      </IconButton>
                    </Tooltip>
                  </div>
                );
              }

              if (props.action.tooltip === 'Edit All') {
             return (
              <div
               ref={this.bulkEditRef}
               onClick={(e) => {
                props.action.onClick(e);
                      this.setLotDialogOpenedThrough('BULK_EDIT')
               }}
            >
                <Tooltip title='Edit All'>
                <IconButton>
                        <Edit style={{color: 'black'}} />
              </IconButton>
             </Tooltip>
              </div>
            );
             }

              if (props.action.tooltip === 'Discard all changes' && !props.action.hidden) {
                return (
                  <div
                    onClick={(e) => {
                      props.action.onClick(e);
                      this.setLotDialogOpenedThrough('ROW_EDIT')
                    }}
                  >
                    <Tooltip title='Discard all changes'>
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
                  <div ref={this.addActionRef} onClick={props.action.onClick} />
                );
              }
            },
          }}
          actions={[
            // (rowData) =>
            //   this.props.isPrint
            //     ? ''
            //     : (this.props.status === 'edit' || this.props.poOption === '2')
            //     ? {
            //         disabled:
            //           rowData.is_serialized === 1 &&
            //           (this.props.returnState ? rowData.received_quantity : rowData.receiving_quantity) > 0
            //             ? false
            //             : true,
            //         icon: () => (
            //           <Icon
            //             style={{
            //               fontWeight: 'bold',
            //               fontSize: 'larger',
            //               color:
            //                 rowData.is_serialized === 1 &&
            //                 (this.props.returnState ? rowData.quantity : rowData.receiving_quantity) > 0
            //                   ? Number(this.props.returnState ? rowData.received_quantity :  rowData.receiving_quantity) /
            //                       rowData.qty_per_pack ===
            //                     rowData.lots.length
            //                     ? 'green'
            //                     : 'red'
            //                   : 'grey',
            //             }}
            //           >
            //             toc
            //           </Icon>
            //         ),
            //         tooltip: rowData.is_serialized === 1 ? 'serial number' : '',
            //         onClick: (event, rowData) => this.handleEdit(rowData),
            //       }
            //     : '',

            this.props.type === 'returnFromPurchase'  && this.props.pathname !== '/sales/purchasesOrders' && {
              icon: () => (
                <UploadFileIcon >
                <div style={{display: 'flex'}}>
                </div>
                </UploadFileIcon>
              ),
              tooltip: 'upload',
              isFreeAction: true,
              onClick:() => this.handleFilterOpen(),
              disabled: this.props.poOption === '1',
            },
            ...(this.shouldShowAdd()
              ? [{
                icon: 'add',
                tooltip: 'add',
                isFreeAction: true,
                onClick: (event, rowData) => {
                  this.addActionRef.current.click();
                  this.setState({ add_click: !this.state.add_click });
                },
                disabled: this.isAdd(),
              }]
              : []),
          ]}
          editable={{
            onRowAddCancelled: () => this.setState({add_click: false}),
            isDeletable: () => (this.props.status === 'edit' ? this.props.returnState ? true : false : true),
            isEditable: () => (this.props.isPrint ? false : true),
            isBulkEditable: () => (this.props.isPrint ? false : true),

            onRowAdd: (newData) =>
              new Promise((resolve, reject) => {
                console.log(newData,'newDatanewData')
                setTimeout(() => {
                  //   setData([...data, newData]);
                  // this.handleSubmit(newData)

                  this.setState({
                    add_click: false,
                    line_count: this.state.line_count + 1,
                  });
                  if (this.state.isChanged) {
                    alert(`The cost has been changed to ${newData.item_cost_price}!`)
                    this.setState({ dialogOpen: true, isChanged: false })
                    if (newData.is_serialized === 0) {
                      // newData.received_quantity=newData.quantity
                    }

                    if (this.props.poOption === '2' && newData.ordered_quantity > newData.receiving_quantity && !this.props.returnState) {
                      newData.received_quantity = +newData.receiving_quantity + newData.received_quantity;
                    } else if (this.props.poOption === '2' && newData.ordered_quantity === newData.receiving_quantity && !this.props.returnState) {
                      newData.received_quantity = newData.receiving_quantity
                    }
                      newData.isEntered = 1;
                    this.props.setitemsData([...this.props.itemsData, this.sanitizeTableRow(newData)]);

                    setTimeout(() => {
                      this.addActionRef.current.click();
                    }, 0);
                  } else {
                    // if (newData.is_serialized === 0) {
                    // }

                    if (this.props.poOption === '2' && newData.ordered_quantity > newData.receiving_quantity && !this.props.returnState) {
                      newData.received_quantity = +newData.receiving_quantity + newData.received_quantity;
                    } else if (this.props.poOption === '2' && newData.ordered_quantity === newData.receiving_quantity && !this.props.returnState) {
                      newData.received_quantity = newData.receiving_quantity
                    }
                    newData.isEntered = 1;
                    this.props.setitemsData([...this.props.itemsData, this.sanitizeTableRow(newData)]);

                    setTimeout(() => {
                      this.addActionRef.current.click();
                    }, 0);
                  }


                  resolve();
                }, 1000);
              }),
            onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
            setTimeout(() => {
            const dataUpdate = [...this.props.itemsData];
                const rowIndex = oldData?.tableData?.id;
                const index =
                  Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < dataUpdate.length
                    ? rowIndex
                    : dataUpdate.findIndex((item) =>
                        this.props.returnState
                          ? item.receiving_item_id === oldData?.receiving_item_id
                          : item.item_id === oldData?.item_id && item.line === oldData?.line
                      );

            if (index === -1) {
            console.warn("Row not found for update:", oldData);
            resolve();
            return;
            }
            let instance = this.sanitizeTableRow(newData);
         if (
           (this.props.status === 'edit' || this.props.poOption === '2') &&
           instance.ordered_quantity > instance.receiving_quantity &&
           !this.props.returnState
          ) {
          instance.received_quantity =
          +instance.receiving_quantity + instance.received_quantity;
        } else if (
          (this.props.status === 'edit' || this.props.poOption === '2') &&
          !this.props.returnState
        ) {
         instance.received_quantity = +instance.receiving_quantity;
        }

         dataUpdate[index] = instance;
         this.props.setitemsData([...dataUpdate]);
         this.setState({ line_count: this.state.line_count + 1 });

        resolve();
        }, 500);
       }),

            onRowDelete: (oldData) =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const dataDelete = [...this.props.itemsData];
                  const rowIndex = oldData?.tableData?.id;
                  const index =
                    Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < dataDelete.length
                      ? rowIndex
                      : dataDelete.findIndex((item) =>
                          this.props.returnState
                            ? item.receiving_item_id === oldData?.receiving_item_id
                            : item.item_id === oldData?.item_id && item.line === oldData?.line
                        );

                  if (index !== -1) {
                    dataDelete.splice(index, 1)
                    this.props.setitemsData([...dataDelete])
                  } 
                  else {
                    console.warn('Item not found for deletion:', oldData)
                  }
                  resolve();
                }, 1000);
              }),
            onBulkUpdate: (changes) =>
              new Promise((resolve, reject) => {

                let makeData = [...this.props.itemsData];

                Object.keys(changes).forEach((d) => {
                  const instance = this.sanitizeTableRow(changes[d].newData);
                  
                  const Validate = this.props.returnState
                    ? instance.received_quantity <= instance.returnQuantity
                    : instance.receiving_quantity > 0 &&
                    instance.receiving_quantity + instance.received_quantity <= instance.ordered_quantity &&
                    !this.props.returnState;

                  if (!Validate) {
                    reject();
                    return; // exit this iteration
                  }

                  if (!this.props.returnState) {
                    // For non-return state updates
                    if (
                      (this.props.status === 'edit' || this.props.poOption === '2') &&
                      instance.ordered_quantity > instance.receiving_quantity
                    ) {
                      instance.received_quantity =
                        +instance.receiving_quantity + instance.received_quantity;
                    } else if (this.props.status === 'edit' || this.props.poOption === '2') {
                      instance.received_quantity = +instance.receiving_quantity;
                    }

                    // âœ… Merge old object with new instance, keeping lots intact
                    // makeData[d] = {
                    //   ...makeData[d],
                    //   ...instance,
                    //   lots: makeData[d].lots && makeData[d].lots.length > 0 ? makeData[d].lots : instance.lots
                    // };
                    const updatedMakeData = makeData.map((row => {
                      if(row.item_id === instance.item_id){
                        return {
                          ...row,
                          ...instance,
                          lots: row.lots && row.lots.length > 0 ? row.lots : instance.lots
                        }
                      }
                      else{
                        return row
                      }
                    }))
                    makeData = updatedMakeData

                  } else {
                    // For return state updates
                    const existingIndex = makeData.findIndex(
                      (item) => item && item.receiving_item_id === instance.receiving_item_id
                    );

                    if (existingIndex !== -1) {
                      makeData[existingIndex] = {
                        ...makeData[existingIndex],
                        ...instance,
                        lots:
                          makeData[existingIndex].lots && makeData[existingIndex].lots.length > 0
                            ? makeData[existingIndex].lots
                            : instance.lots
                      };
                    } else {
                      makeData.push(instance);
                    }
                  }
                });

                setTimeout(() => {
                  console.log('rrtest');
                  
                  const finalData = makeData.filter((item) => item != null);
                  this.props.setitemsData(finalData);
                  resolve();
                  this.setLotDialogOpenedThrough('ROW_EDIT');
                }, 1000);
              }),

            // onBulkUpdate: (changes) =>
            //   new Promise((resolve, reject) => {
            //     console.log('updatebefore', this.props.itemsData)
            //     const makeData = [...this.props.itemsData];
            //     Object.keys(changes).map((d) => {
            //       let instance = changes[d].newData;
            //       let Validate = this.props.returnState
            //         ? instance.received_quantity > instance.returnQuantity
            //           ? false
            //           : true
            //         : instance.receiving_quantity > 0 &&
            //           instance.receiving_quantity +
            //           instance.received_quantity <=
            //           instance.ordered_quantity &&
            //           !this.props.returnState
            //           ? true
            //           : false;
            //       if (Validate && !this.props.returnState) {
            //         if (
            //           (this.props.status === 'edit' || this.props.poOption === '2') &&
            //           instance.ordered_quantity > instance.receiving_quantity
            //         ) {
            //           instance.received_quantity =
            //             +instance.receiving_quantity +
            //             instance.received_quantity;
            //         } else if ((this.props.status === 'edit' || this.props.poOption === '2')) {
            //           instance.received_quantity =
            //             +instance.receiving_quantity;
            //         }
            //         makeData[d] = instance;
            //       } else if (!Validate) {
            //         reject();
            //       } else if (Validate && this.props.returnState) {
            //         const existingIndex = makeData.findIndex(
            //           (item) =>
            //             item &&
            //             item.receiving_item_id === instance.receiving_item_id
            //         );

            //         if (existingIndex !== -1) {
            //           makeData[existingIndex] = instance;
            //         } else {
            //           makeData.push(instance);
            //         }
            //       }

            //     });
            //     setTimeout(() => {
            //       const finalData = makeData.filter((item) => item != null);
            //       console.log('updatebefore2', finalData)
            //       this.props.setitemsData(finalData);
            //       resolve();
            //       this.setLotDialogOpenedThrough('ROW_EDIT')
            //     }, 1000);
            //   }),
          }}
          options={getStickyTableOptions({
            bodyOffset: 100,
            headerStyle,
            options: {
              cellStyle,
              exportButton: true,
              search: false,
              pageSize: 10,
              actionsColumnIndex: -1,
              toolbar: true,
              tableLayout: 'auto',
              rowStyle: (rowData) => ({
                backgroundColor:
                  rowData.ordered_quantity === rowData.return_quantity
                    ? '#f5f5f5'
                    : '#fff',
                color:
                  rowData.ordered_quantity === rowData.return_quantity ? '#999' : 'inherit',
                pointerEvents:
                  rowData.ordered_quantity === rowData.return_quantity ? 'none' : 'auto',
                opacity:
                  rowData.ordered_quantity === rowData.return_quantity ? 0.6 : 1,
                cursor:
                  rowData.ordered_quantity === rowData.return_quantity
                    ? 'not-allowed'
                    : 'pointer',
              }),
              exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'ReceivingItemsData'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols,datas,'ReceivingItemsData'),
              },
            ],
            },
          })}
          columns={[
            ...(this.props.type === 'returnFromInventory' ? [
              {
                title: 'Invoice Date',
                field: 'invoice_date',
                cellStyle: {
                  whiteSpace: 'wrap'
                },
       
                editComponent: ({ rowData, columnDef: { tableData }, onRowDataChange, value }) => {
                  
                  return (
                    <TextField
                      variant="filled"
                      type="text"
                      placeholder="Invoice Date"
                      sx={{ width: "200px" }}
                      disabled={this.props.status === 'edit'}
                      id="receivingsitems-field-1995"
                      name="invoice_date"
                      value={value}
                      onChange={(e) => {
                        onRowDataChange({
                          ...rowData,
                          invoice_date: e.target.value,
                        });
                      }}
                    />
                  );
                },
              },
              {
                title: 'Invoice Number',
                field: 'invoice_number',
                cellStyle: {
                  whiteSpace: 'wrap'
                },
          
                editComponent: ({ rowData, columnDef: { tableData }, onRowDataChange, value }) => (
                  <TextField
                    variant='filled'
                    type='text'
                    placeholder='Invoice Number'
                    sx={{ width: "200px" }}
                    disabled={this.props.status === 'edit'}
                    id='standard-basic'
                    name='invoice_number'
                    value={value}
                    onChange={(e) => {
                      onRowDataChange({
                        ...rowData,
                        invoice_number: e.target.value,
                      });
                    }}
                  />
                ),
              }
            ] : []),
            {
              title: 'Product',
              field: 'name',
              cellStyle: {
                whiteSpace: 'wrap'
              },
              width:'30%',
              validate: (rowData) => (!rowData.name ? false : true),
              editComponent: (props) => (
                <CommonToolTip title = {props.value}>
                <Autocomplete
                   key={this.props.productByType?.length}
                  getOptionLabel={(option) => option.name}
                  disabled={this.props.status === 'edit' ? true : false}
                  value={{ name: props.value || '' }}
                  onChange={async (e, newValue) => {
                    if (newValue) {
                      if (Array.isArray(this.props.productByType)) {
                        const data = this.props.productByType.find(
                          (d) => d.name === newValue.name
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
                            tax_category_id,
                            limit
                          } = data;
            
                          let gst;
                          let tax_category;
                          // await this.props.purchaseProductTaxesAction(tax_category_id, (taxData) => {})
            
                          taxes.forEach((t) => {
                            if (t.tax_group === 'IGST') {
                              gst = t.tax_rate;
                              tax_category = t.tax_category;
                            }
                          });

                          // let priceList_dealerPrice = await this.props.vendorPriceListProduct.find(item => item.item_id === item_id)?.dealerPrice || null;

                          // let dealerPrice = await !productData?.length ? item_cost_price : productData[0]?.dealerPrice

                          
                          
                          
                          if (this.props.vendorId?.toString()?.length) {
                            let arr = null
                            let newArray = [item_id];
                            let payload = {
                              item_id: newArray,
                              vendor_id: this.props.vendorId
                            }
                            this.props.filterPriceListProductAction(payload, async (result) => {
                              let priceList_dealerPrice = (await result.length) ? result[0]?.dealerPrice : null;
                              let price_list_id = (await result.length) ? result[0]?.price_id : 0;
                              let price_list_mrp = (await result.length) ? result[0]?.mrp : 0;
                    
                              const dealerPrice = (await priceList_dealerPrice) === null ? item_cost_price : priceList_dealerPrice

                              await props.onRowDataChange({
                                ...props.rowData,
                                name,
                                item_id,
                                description,
                                item_cost_price: dealerPrice,
                                item_unit_price,
                                received_quantity: 0,
                                ordered_quantity: 1,
                                gst,
                                tax_category,
                                tax_category_id,
                                quantity: 1,
                                taxes: data.taxes,
                                sub_total: this.singleTax(dealerPrice, 1, data).toFixed(2),
                                prod_val: true,
                                lots: [],
                                qty_per_pack,
                                is_serialized,
                                line: this.state.line_count,
                                hsn_code,
                                max_price,
                                model,
                                price_list_id,
                                receiving_quantity:1,
                                price_list_mrp,
                                stock_limit:data.limit

                              });
                              setTimeout(() => {
                                document.querySelector(`[name ="quantity"]`)?.focus();
                              }, 100);
                            })
                          } else {                    
                                await props.onRowDataChange({
                                ...props.rowData,
                                name,
                                item_id,
                                description,
                                item_cost_price: item_cost_price,
                                item_unit_price,
                                received_quantity: 0,
                                ordered_quantity: 1,
                                gst,
                                tax_category,
                                tax_category_id,
                                quantity: 1,
                                taxes: data.taxes,
                                sub_total: this.singleTax(item_cost_price, 1, data).toFixed(2),
                                prod_val: true,
                                lots: [],
                                qty_per_pack,
                                is_serialized,
                                line: this.state.line_count,
                                hsn_code,
                                max_price,
                                model,
                                price_list_id: 0,
                              receiving_quantity:1,
                              stock_limit:data.limit

                              });
                            }
                        }
                      }
                    } else {
                      props.onChange('');
                    }
                  }}
                  id='controllable-states-demo'
                  options={
                    Array.isArray(this.props.productByType) ? (
                      this.props.productByType.filter(
                        (p1) =>
                          !this.props.itemsData.some((s1) => p1.item_id === s1.item_id) &&
                          p1.stock_type === 1
                      )
                    ) : (
                      []
                    )
                  }
                  filterOptions={filterOptions}
                  // style={{ width: 350 }}
                  renderInput={(params) => {
                    const get = { ...params };
                     const shouldShowCreateIcon = this.props.type !== 'returnFromInventory';
                    get.InputProps = {
                      ...params.InputProps,
                      style: {
                        paddingLeft: '1px',
                      },
                      ...(shouldShowCreateIcon && {
                      startAdornment: (
                        <Tooltip title='Create New'>
                          <IconButton
                            size='small'
                            onClick={() => {
                              this.props.setModalStatusHandler(true);
                              this.props.setModalTypeHandler('product');
                              if (this.state.add_click) {
                                this.addActionRef.current.click();
                                this.setState({ add_click: false });
                              }
                            }}
                          >
                            <Add fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      ),
                      })
                    };
            
                    return (
                      <TextField
                        {...get}
                        // inputRef={(input) => {
                        //   if (input && this.state.isMounted) {
                        //     input.focus();
                        //   }
                        // }}
                        inputProps={{
                          ...params.inputProps,
                          style: {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }
                        }}
                        sx={{
                          '& .MuiFilledInput-root': {
                            height: 'auto !important'
                          },
                        }}
                        error={props.value !== undefined ? props.error : false}
                        // label='Product'
                        variant='filled'
                        // sx={{paddingTop:'5px',paddingBottom:'5px'}}
                      />
                    );
                  }}
                />
                </CommonToolTip>
              ),
            },
            {
              title: 'Ordered Qty',
              field: 'ordered_quantity',
              cellStyle: {
                whiteSpace: 'wrap'
               },
               width:'10%',
              // hidden: this.props.returnState ? true : false,
              hidden: (this.props.returnState || this.props.poOption === '2') ? true : false,
              validate: (rD) =>
                      rD.quantity <=0 ? false  : true,
                       
              editComponent: (props) => (
                <TextField
                  type='number'
                  placeholder='0.00'
                  id='standard-basic'
                  name='quantity'
                  variant='filled'
                  disabled ={this.props.status === 'edit' ? true : false}
                  value={props.value}
                  min='0'
                  onChange={(e) => {
                    props.onRowDataChange({
                      ...props.rowData,
                      quantity: this.preventNegative(e),
                      ordered_quantity: this.preventNegative(e),
                      // sub_total: this.taxes([
                      //   {
                      //     item_cost_price: props.rowData.item_cost_price
                      //       ? props.rowData.item_cost_price
                      //       : 0,
                      //     quantity: this.preventNegative(e),
                      //   },
                      // ]),
                      sub_total: this.singleTax(
                        props.rowData.item_cost_price,
                        this.preventNegative(e),
                        props.rowData,
                      ).toFixed(2),
                    });
                  }}
                  error={props.value !== undefined ? props.error : false}
                  helperText={
                            
                    props.error
                      ?  props.value<=0 ? `0 Qty Not Allowed` : '' : ''
                  }
                  // onBlur={e=>{
                  //   if(props.rowData.is_serialized===1){
                  //   this.handleCreate(props);
                  //   if(!this.state.add_click){
                  //   this.cancelActionRef.current.click()
                  //   }
                  // }
                  // }}
                />
              ),
            },
            {
              title: 'Ordered Qty',
              field: 'received_ordered_quantity',
              cellStyle: {
                whiteSpace: 'wrap'
               },
              width:'50px',
              hidden:this.props.returnState ? false : true,
              editable: 'never'
            },
            {
              title: this.props.returnState ? 'Return Qty' : 'Receiving Qty',
              field: this.props.returnState ? 'quantity' : 'receiving_quantity',
              width:'10%',
              hidden: (this.props.status === 'edit' || this.props.poOption === '2') ? false : true,
              validate: (rowData) => {
                if (this.props.returnState) {
                  return (
                    rowData.quantity > 0 &&
                    rowData.quantity <= Number(rowData.returnQuantity)
                  );
                }
                else if(this.props.status === 'edit'){
                  const totalReceiving =
                  Number(rowData.receiving_quantity) +
                  Number(rowData.received_quantity);
                  console.log(rowData.receiving_quantity > 0 &&
                    totalReceiving <= Number(rowData.ordered_quantity),rowData.receiving_quantity,rowData.ordered_quantity,totalReceiving,"vy654343");
                  
                return (
                  // rowData.receiving_quantity > 0 &&
                  // totalReceiving <= Number(rowData.ordered_quantity)
                  (true)
                );
                }
                else {
                  return rowData.receiving_quantity > 0
                }
              },
              editComponent: ({
                rowData,
                columnDef: { tableData },
                onRowDataChange,
                value,
                error,
              }) => {
                
                const isLimitExceeded = this.props.returnState
                ? Number(rowData.quantity) > Number(rowData.returnQuantity)
                : Number(rowData.receiving_quantity) + Number(rowData.previousRecievedQty) >
                  Number(rowData.ordered_quantity);
            
              const isError =
                (this.props.status === 'edit' && isLimitExceeded) ||
                (this.props.returnState && isLimitExceeded) || value <= 0;
                return (
                  <TextField
                    type="number"
                    placeholder="0.00"
                    id="receivingsitems-field-2367"
                    name="quantity"
                    variant="filled"
                    fullWidth
                    value={value}
                    onChange={(e) => {
                      const cleanVal = this.preventNegative(e);
            
                      const updatedRow = {
                        ...rowData,
                        receiving_quantity: cleanVal,
                        ordered_quantity: this.props.status === 'edit' 
                        ? rowData.ordered_quantity  
                        : cleanVal, 
                        received_quantity: this.props.returnState
                          ? cleanVal
                          : rowData.received_quantity,
                        quantity: cleanVal,
                        sub_total: this.singleTax(
                          rowData.item_cost_price,
                          cleanVal,
                          rowData
                        ).toFixed(2),
                        lots: [],
                      };
            
                      // console.log('Updated Row:', updatedRow);
            
                      onRowDataChange(updatedRow);
                    }}
                    onBlur={(e) => {
                      if (
                        this.props.poOption === '2' &&
                        e.target.value &&
                        rowData.item_cost_price &&
                        rowData.is_serialized === 1
                      ) {
                        this.handleEdit(
                          {
                            ...rowData,
                            tableData: { ...tableData, id: rowData.isEntered === 1 ? tableData.id : null },
                            received_quantity: rowData.receiving_quantity,
                          },
                          onRowDataChange
                        );
                      }
                    }}
                    error={isError}
                    helperText={
                     isError
                        ? this.props.returnState
                          ? `Available ${rowData.returnQuantity} Qty`
                            : value <= 0 ? `Qty should not allow ${value}`
                          : `Limit: ${
                              rowData.ordered_quantity
                            } Qty only`
                        : ''
                    }
                  />
                );
              },
            },
            {
              title: 'Received Qty',
              field: 'received_quantity',
               cellStyle: {
                            whiteSpace: 'wrap',
                            fontSize:cellStyle.fontSize
                          },
              width:'10%',
              hidden:
                this.props.status === 'edit' && !this.props.returnState
                  ? false
                  : true,
              editable: 'never',
            },
            {
              title: 'Buying Cost',
              field: 'item_cost_price',
              cellStyle: {
                whiteSpace: 'wrap'
               },
               width:'15%',
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
                  {rowData.item_cost_price}
                </div>
               ),
              validate: (rD) =>
                rD?.tableData?.editing === 'delete' ? true : rD.item_cost_price <=0 ? false  : true,
              editComponent: ({ rowData, columnDef: {tableData}, onRowDataChange, value }) => (
                <TextField
                  variant='filled'
                  type='number'
                  placeholder='0.00'
                  disabled ={this.props.status === 'create' ? false : true}
                  id='standard-basic'
                  name='item_cost_price'
                  value={value}
                  onChange={(e) => {
                    // !this.state.isChanged && this.setState({isChanged: true})
                    onRowDataChange({
                      ...rowData,
                      item_cost_price: e.target.value,
                      sub_total: this.singleTax(
                        e.target.value,
                        rowData.quantity,
                        rowData,
                      ).toFixed(2),
                    });
                  }}
                  error={rowData._isDeleting ? false : rowData.item_cost_price <= 0}
                  helperText={
                    rowData._isDeleting ? '' : rowData.item_cost_price <= 0 ? `0 Not Allowed` : ''
                  }
                  onBlur={(e) => {
                    if (
                      this.props.poOption === '2' &&
                      e.target.value &&
                      rowData.quantity &&
                      rowData.is_serialized === 1
                    ) {
                      this.handleEdit(
                        {...rowData, tableData: { ...tableData, id: rowData.isEntered === 1 ? tableData.id : null }, received_quantity: rowData.receiving_quantity},
                        onRowDataChange,
                      );
                    }
                  }}
                />
              ),
            },
            {
              title: 'MRP',
              field: 'item_unit_price',
              hidden: this.props.status === 'edit' ? false : true,
              editComponent: (props) => (
                <TextField
                  type='number'
                  placeholder='0.00'
                  id='standard-basic'
                  name='item_unit_price'
                  value={props.value}
                  disabled ={this.props.status === 'edit' ? true : false}
                  // onChange={e => props.onChange(e.target.value)}
                  onChange={(e) => {
                    props.onRowDataChange({
                      ...props.rowData,
                      item_unit_price: e.target.value,
                      // sub_total: this.taxes([
                      //   {
                      //     item_unit_price: e.target.value,
                      //     quantity: props.rowData
                      //       .quantity
                      //       ? props.rowData.quantity
                      //       : 0,
                      //   },
                      // ]),
                    });
                  }}
                  variant='filled'
                />
              ),
            },
            // {
            //     title: "Discount", field: "discount",
            //     editComponent: props => (<TextField id="receivingsitems-field-2542" name='discount' value={props.value} onChange={e => props.onChange(e.target.value)} />)
            // },
            // {
            //     title: "Discount Type", field: "discount_type",
            //     editComponent: props => (<TextField id="receivingsitems-field-2546" name='discount_type' value={props.value} onChange={e => props.onChange(e.target.value)} />)
            // },
            {
              title: 'Tax Category',
              field: 'tax_category_id',
              cellStyle: {
              whiteSpace: 'wrap'
              },
              width:'10%',
              hidden: (!this.props.returnState && this.props.poOption !== '2') ? true : false,
              render: (rowData) => {
                return this.props.taxCategory?.find(d => d.tax_category_id === rowData.tax_category_id)?.tax_category ?? ''
              },
              editComponent: (props) => (
                <CommonAutoCategory
                    labelName="Tax Category"
                    value={
                        props.value
                            ? { label: props.rowData.tax_category, value: props.value }
                            : null
                    }
                    setValue={async(selectedCategory) => {
                      if (!selectedCategory) return;

                      // Find the full tax category object
                      const categoryObj = this.props.taxCategory.find(
                          (t) =>
                              t.tax_category_id === selectedCategory.value ||
                              t.tax_category === selectedCategory.label
                      );
                      if (!categoryObj) return;

                      const newTaxes = categoryObj.taxes || [];
                      const itemTaxes = []
                      for await(const t of newTaxes){
                        if (t.tax_group === 'IGST') {
                          itemTaxes.push({
                            name: t.tax_category,
                            percent: t.tax_rate,
                            tax_category_id: t.tax_category_id,
                            item_tax_amount: this.floatnum(
                              ((1 * (props.rowData.item_cost_price !== undefined && props.rowData.item_cost_price !== null ? parseFloat(props.rowData.item_cost_price) : props.rowData.item_cost_price)) / 100) *
                                t.tax_rate,
                            ),
                            tax_type: 1,
                            rounding_code: 0,
                            cascade_sequence: 0,
                            sales_tax_code_id: 0,
                            jurisdiction_id: 0,
                          });
                        }
                      }
                      const newSubtotal = (parseFloat(props.rowData.item_cost_price) + itemTaxes[0].item_tax_amount) * props.rowData.receiving_quantity ;
                      console.log(newSubtotal, 'newSubtotal')
                      let gst
                      newTaxes.forEach((t) => {
                        if (t.tax_group === 'IGST') {
                          gst = t.tax_rate;
                        }
                      });

                      // return {
                      //     ...item,
                      //     tax_category_id: categoryObj.tax_category_id,
                      //     tax_category: categoryObj.tax_category,
                      //     taxes: newTaxes,
                      //     taxes_name: categoryObj.tax_category,
                      //     sales_item_taxes: salesItemTaxes,
                      //     sub_total: newSubtotal.toFixed(2),
                      // };

                      await props.onRowDataChange({
                        ...props.rowData,
                        tax_category_id: categoryObj.tax_category_id,
                        tax_category: categoryObj.tax_category,
                        taxes: newTaxes,
                        sub_total: newSubtotal.toFixed(2),
                        gst
                      });
                    }}
                    searchVal={this.props.taxCategory.map((cat) => ({
                        label: cat.tax_category,
                        value: cat.tax_category_id,
                    }))}
                    // requestSearch={handleCategorySearch}
                    required={true}
                    type='bills'
                    disabled={false}
                />
              )
            },
            {
              title: 'Tax %',
              field: 'tax_category',
              cellStyle: {
                whiteSpace: 'wrap',
                fontSize: cellStyle.fontSize,
               },
               width: "10%",
              editComponent: (props) => {
                const isEditable =
                  props?.rowData?.gst_preference === 'Tax at Invoice Time';

                return (
                  <TextField
                    variant="filled"
                    value={props.value || ''}
                    onChange={(e) => {
                      if (isEditable) {
                        props.onChange(e.target.value);
                      }
                    }}
                    sx={{ width: '100%' }}
                    disabled={!isEditable}
                  />
                );
              }
            },

            {
              title: 'Sub Total',
              field: 'sub_total',
              cellStyle: {
                whiteSpace: 'wrap'
               },
               width: "15%",
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
                  {rowData.sub_total}
                </div>
               ),
              editComponent: (props) => (
                // <Chip
                //   label={props.value ? props.value : '0.00'}
                //   style={{minWidth: '50px'}}
                // />
                (<TextField
                variant="filled"
                value={props.value || ""}
                onChange={(e) => e.preventDefault()}
                // sx={{ width: "100%" }}
              />)
              ),
            },
            {
              title: 'Serial Numbers',
              field: 'serial_number',
              cellStyle: {
                                      whiteSpace: 'wrap',
                                      fontSize:cellStyle.fontSize,
              
                                     },
                                    width:'10%',
              // hidden: this.props.status === 'edit' || this.props.poOption === '2' ? false : true,
              render: (rowData) => this.props.isPrint
              ? ''
              : (this.props.status === 'edit' || this.props.poOption === '2')
              ? 
                  <Tooltip title={rowData.is_serialized === 1 ? 'serial numberss' : ''} >
                    { rowData.is_serialized === 1 &&
                    <Icon
                      style={{
                        color:
                          rowData.is_serialized === 1 &&
                            (this.props.returnState ? rowData.quantity : rowData.receiving_quantity) > 0
                            ? Number(this.props.returnState ? rowData.received_quantity : rowData.receiving_quantity)  ===
                              rowData.lots.length
                              ? 'green'
                              : 'red'
                            : 'grey',
                        cursor: rowData.is_serialized === 1 && rowData.tableData?.editing == "update" ? 'pointer' : 'default'
                      }}
                      disabled=
                      {rowData.is_serialized === 1 && 
                        (this.props.returnState ? rowData.received_quantity : rowData.receiving_quantity) > 0
                        ? false
                        : true}
                      onClick={()=> {
                        if(rowData.is_serialized === 1){
                        if(rowData.tableData?.editing == "update"){
                          this.handleEdit(rowData)
                          }
                        }
                        }
                      }

                    >
                      toc
                    </Icon>
                    }
                  </Tooltip>
              : ''
              
                ,
              editComponent: ({ rowData, columnDef: {tableData}, onRowDataChange }
                ) => this.props.isPrint
            
                ? ''
                : (this.props.status === 'edit' || this.props.poOption === '2')
                  ? <Tooltip title={rowData.is_serialized === 1 ? 'serial number' : ''} >
                    { rowData.is_serialized === 1 &&
                  <Icon
                  style={{
                    color:
                        rowData.is_serialized === 1 &&
                          (this.props.returnState ? rowData.quantity : rowData.receiving_quantity) > 0
                          ? Number(this.props.returnState ? rowData.received_quantity : rowData.receiving_quantity)===
                          rowData.lots.length
                          ? 'green'
                          :  (Number(rowData.receiving_quantity) + Number(rowData.previousRecievedQty) > Number(rowData.ordered_quantity))
                              ? 'grey' : 'red'
                          : 'grey',
                          cursor: 'pointer'
                        }}
                          disabled={
                           rowData.is_serialized === 1 && (Number(rowData.receiving_quantity) + Number(rowData.previousRecievedQty) > Number(rowData.ordered_quantity))
                              ? true : rowData.is_serialized === 1 && (this.props.returnState ? rowData.received_quantity : rowData.receiving_quantity) > 0 ?  false : true
                          }
                          onClick={()=> {
                            
                            let td = { ...tableData, id: rowData.isEntered === 1 ? tableData.id : null }
                            if(this.props.returnState || this.state.lotDialogOpenedThrough === 'BULK_EDIT'){
                              td =  {...tableData, id: rowData.item_id}
                            }

                            if(this.props.status === 'edit' && !this.props.returnState && (rowData.receiving_quantity + rowData.previousRecievedQty) > rowData.ordered_quantity) {
                              return
                            }
                            else if(!this.props.returnState && rowData.receiving_quantity === 0 ){
                              return
                            }
                            else {
                              this.handleEdit({...rowData, tableData : td, received_quantity: rowData.receiving_quantity}, onRowDataChange)
                            }
                          }}
                          
                          >
                    toc
                  </Icon>
                  }
                </Tooltip>
                  : ''

            },
          ]}
          data={this.props.itemsData}
          title={<Typography variant='h6'>Receiving Items</Typography>}
        />
        {this.state.filterOpen === true && (<CommonImport
                                   handleClose={this.handleFilter}
                                   open={this.state.filterOpen}
                                   encodeImageFileAsURL ={this.encodeImageFileAsURL}
                                   exportSample={this.exportSample}
                                   headers = {this.state.headers}
                                   data = {this.state.data} 
                                   sampleDownloadButtonName = {'Here'}       
                                   type = 'purchase'               
         />)}
        {this.state.openAlert === true && (<AlertDialogSlide 
                                              setOpenAlert={(data) => this.setState({openAlert : data})} 
                                              unknownVendor = {this.state.unknownVendor}
                                              differentVendor = {this.state.differentVendor}
                                              duplicateLotNumber = {this.state.duplicateLotNumber}
                                              lotAlreadyExistInDb = {this.state.lotAlreadyExistInDb}
                                              setValidationToDefault = {() => {
                                                this.setState({
                                                  differentVendor : [], 
                                                  unknownVendor : [], 
                                                  duplicateLotNumber : [],
                                                  lotAlreadyExistInDb : []
                                                })
                                              }}
                                            />)}
        {this.props.returnState ? (
          <ReturnItemPopup
            cancelref={() => {}}
            open={this.state.open}
            returnState={this.props.returnState}
            status={this.state.status}
            setitemsData={this.props.setitemsData}
            handleClose={this.handleClose}
            itemsData={this.props.itemsData}
            row_id={this.state.row_id}
            product={this.props.productByType}
            calledfrom = {'purchase_return'}
            receiving_id = {this.props.itemsData.length > 0 ? this.props.itemsData[0].receiving_id : 0 }
            location_id={this.props.type === 'returnFromInventory' ? this.props.itemsData[0]?.location_id : this.props.formValues.location_id}
          />
        ) : (
          <ItemPopup
            cancelref={this.cancelActionRef.current?.click}
            open={this.state.open}
            status={this.state.status}
            setitemsData={this.props.setitemsData}
            handleClose={this.handleClose}
            itemsData={this.props.itemsData}
            row_id={this.state.row_id}
            product={this.props.productByType}
            pot_code_seq={this.props.pot_code_seq}
            potCodeAction={this.props.potCodeAction}
            returnState={this.props.returnState}
            setLotDialogOpenedThrough = {this.setLotDialogOpenedThrough}
            lotDialogOpenedThrough = {this.state.lotDialogOpenedThrough}
            location_id={this.props.formValues.location_id}
            // handleLastPotCodeSeq={this.props.handleLastPotCodeSeq}

          />
        )}
        {this.state.dialogOpen && (
          <Dialog open={this.state.dialogOpen} onclose={this.setState({dialogOpen: false})}>
            <DialogTitle>{'Title'}</DialogTitle>
            <DialogContent>{'Title'}</DialogContent>
            <DialogActions>
              <Button onClick={this.setState({dialogOpen: false})}>
                {'Cancel'}
              </Button>
              <Button>
                {'Ok'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    product: state.productReducer.product,
    productByType: state.productReducer.productByType,
    vendor: state.vendorReducer.vendorIdAndName,
    vendorPriceListProduct: state.vendorReducer.vendorPriceListProduct,
    purchase_outstanding: state.purchasesReducer.purchase_outstanding,
    taxCategory: state.taxCategoryReducer.taxcategory,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    bulkProductAction: (data, setLoaderStatusHandler, result) => {
      return dispatch(bulkProductAction(data, setLoaderStatusHandler, result));
    },
    filterPriceListProductAction: (data, result) => {
      dispatch(filterPriceListProductAction(data, result));
    },
     dispatchErrorAlert: (msg) => ErrormsgAlert(dispatch, msg),
     listProductActionByType: () => dispatch(listProductActionByType()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Product);


function Table({data, tableName}) {

  const tableNameList = {
    productMisMatch : 'Some products Mis Matched',
    duplicateLot : 'Duplicate Lot number',
    productOutOfStock : 'Some products Out of Stock',
    duplicateLotInDb : 'Product has duplicate Lot Number in Uploaded file',
    lotAlreadyExistInDb : 'Lot number already exist in Database'
  }

  

  return (
    <Grid
      style={{
        margin: '10px',
        width:'65vh'
      }}
    >
      <Typography variant='h6' pb={1}>
        {tableNameList[tableName]}
      </Typography>
      <table
        style={{
          border: '1px solid',
          fontSize:cellStyle.fontSize ,
          borderCollapse: 'collapse',
          padding: '0px 5px',
          width: '100%',
          paddingBottom: '10px'
          
        }}
      > 
        <tr>
          <th style={{border: '1px solid', width:'60%'}}>Product Name</th>
          <th style={{border: '1px solid', width:'40%'}}>Lot Number / Qty</th>
        </tr>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{border: '1px solid', padding: '0px 5px'}}>
              {d.name}
            </td>

            {d.uploadQty ? (
              <td style={{border: '1px solid', padding: '0px 5px'}}>
                Uploaded Qty
                <span style={{fontWeight: 'bold'}}>({d.uploadQty})</span> is
                more than actual qty
                <span style={{fontWeight: 'bold'}}>({d.actualQty})</span>
              </td>
            ) : (
              <td style={{border: '1px solid', padding: '0px 5px'}}>
                {d.lot}
              </td>
            )}
          </tr>
        ))}
      </table>
    </Grid>
  );
}

