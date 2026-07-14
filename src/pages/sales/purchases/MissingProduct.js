import React, {useState, useEffect, useRef} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import {IconButton, TextField, Typography} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import RenameDialog from './RenameDialog';
import _ from 'lodash';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import { useSelector,useDispatch } from 'react-redux';
import {Select,MenuItem,FormControl,InputLabel} from '@mui/material'
import { GetUnitsLovAction } from 'redux/actions/termsConditions_actions';

export default function AlertDialog({
  open,
  handleClose,
  wOutItemId = [],
  setDataApi,
  bulkApiCreate,from
}) {
  const [tabData, setTabData] = useState([]);
  const [categoryIcon, setCategoryIcon] = useState(false);
  const [checkIsEmpty,setIsEmpty] = useState(false);
  const tempinitform = useRef(null);

  const dispatch = useDispatch();
  const {taxCategoryReducer:{taxcategory},  TermsConditionsReducers : { getUnitsLov }} = useSelector((state) => state)

  const mandatoryFields = ['name','brand','unit_price','category','hsn_code','tax_category_id','is_serialized','gst_preference'];


  // useEffect(() => {
  //   dispatch(GetUnitsLovAction());
  // }, [])
 
  // if(tabData[0]?.is_serialized){
  //   const serialized = tabData.find((e)=> e.is_serialized = '1')
  //   console.log(serialized,'asas66666')
  //   mandatoryFields.push('lot_number')
  // }
  const optionalFields = ['max_price',];

  // console.log(tabData,'tabData')
  //  console.log('wOutItemId11', wOutItemId)

  const initform = async () => {
  if(open){
    const unique = _.uniqBy(wOutItemId, 'name');
    

    const nosUnit = getUnitsLov?.find((u) => u.unit === 'nos');
    const defaultValue = nosUnit?.id ?? ''; 
  

    const initialTabData = unique.map(item => ({
      ...item,
      gst_preference: item.gst_preference || 'Taxable', 
      pack_name: defaultValue ,
    }));
    
    
    setTabData(initialTabData);

    !taxcategory.length && (await dispatch(listTaxCategoryAction()));
    await dispatch(GetUnitsLovAction());
  }
    
  };
  
  tempinitform.current = initform;
  
  useEffect(() => {
    tempinitform.current();
  }, [wOutItemId]);

  useEffect(() => {
    if (taxcategory.length && tabData.length) {
      setTabData(prevData =>
        prevData.map(item => {
          if (item.tax_category_id) return item;
          const matchedTax = taxcategory.find(tax => tax.tax_group_sequence === item.tax_percentage);
          return matchedTax
            ? { ...item, tax_category_id: matchedTax.tax_category_id, tax_percentage: matchedTax.tax_group_sequence }
            : item;
        })
      );
    }
  }, [taxcategory, tabData.length]);

  useEffect(() => {
    isEmpty()
  }, [tabData]);


  const copyData = (data, type) => {
    setTabData(prev => 
      prev.map(p => ({ ...p, [type]: data }))
    );
  };
  

  // const handleOnFocus = () => {
  //     setCategoryIcon(true);
  // };

  // const handleOnBlur = () => {
  //     setCategoryIcon(false);
  // };

  const checkDuplicates = () => {
    const getData = tabData.map((d) => d.name);

    const duplicates = getData.filter(
      (item, index) => index !== getData.indexOf(item)
    );

  
    return duplicates ;
  };

  const isEmpty = () => {
    let nullCheck = []
    
    for (let t of tabData) {
      for (let i in t) {
        if (mandatoryFields.includes(i) && (t[i] === null || t[i] === '' || typeof t[i] === 'undefined')) {
          nullCheck.push(t)
        }
      }
    }
    setIsEmpty( nullCheck.length ? true : false )
  }
  

 console.log(checkIsEmpty,wOutItemId,'istabData',checkDuplicates().length)
const copyDataTax = (data, type)=> {
  if (type === 'tax_category_by_hsn') {
    // Find the row with matching HSN and update only that
    const rowIndex = tabData.findIndex(row => row.hsn_code === data.hsn_code);
    if (rowIndex !== -1) {
      tabData[rowIndex].tax_category_id = data.tax_category_id;
    }
  }
}

console.log(wOutItemId,'wOutItemIdfghsdgsa',tabData)

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth='lg'
        fullWidth
      >
        <DialogContent>
          <MaterialTable
            key={tabData.length}
            options={{
              headerStyle: {
                fontSize: 15
              },
              // showTitle: false,
              // toolbar: false,
              // paging: Tdata.length > 4 ? true : false,
              // pageSize: 20,
              // pageSizeOptions: [20, 50, 100]
            }}

            columns={[
              {
                field: 'name',
                title: 'Name',
                editComponent: (rowData) => (
                  <>
                    <TextField
                      placeholder='Name'
                      variant="standard"
                      value={rowData.value}
                      // onFocus={handleOnFocus}
                      // onBlur={handleOnBlur}
                      error={!rowData.value}
                      onChange={(e) => {
                        rowData.onChange(e.target.value);
                      }}
                    />
                  </>
                ),
              },
              {
                field: 'description',
                title: 'Description',
              },
              {
                field: 'sku',
                title: 'SKU',
                // validate: (rD) =>  rD.sku !== '' && rD.sku !== null && typeof rD.sku !== 'undefined' ? true : false,
              },
              {
                field: 'brand',
                title: 'Brand',
                // validate: (rD) =>  rD.brand !== '' && rD.brand !== null && typeof rD.brand !== 'undefined' ? true : false,
                editComponent: (rowData) => (
                  (
                  <>
                    <TextField
                      InputProps={{
                        endAdornment: (
                          <InputAdornment>
                            {
                              // categoryIcon === true ?
                              rowData.rowData.tableData.index === 0 && (
                                <IconButton
                                  onClick={() =>
                                    copyData(rowData.value, 'brand')
                                  }
                                >
                                  <CopyAllIcon />
                                </IconButton>
                              )
                              // :" "
                            }
                          </InputAdornment>
                        ),
                      }}
                      placeholder='Brand'
                      value={rowData.value}
                        variant="standard"
                      error={!rowData.value}
                      // onFocus={handleOnFocus}
                      // onBlur={handleOnBlur}
                      onChange={(e) => {
                        rowData.onChange(e.target.value);
                      }}
                    />
                  </>
                  )
                ),
              },
              {
                field: 'category',
                title: 'Category',
                validate: (rD) =>  rD.category !== '' && rD.category !== null && typeof rD.category !== 'undefined' ? true : false,
                editComponent: (rowData) => (
                  (
                  <>
                    <TextField
                      InputProps={{
                        endAdornment: (
                          <InputAdornment>
                            {
                              // categoryIcon === true ?
                              rowData.rowData.tableData.index === 0 && (
                                <IconButton
                                  onClick={() =>
                                    copyData(rowData.value, 'category')
                                  }
                                >
                                  <CopyAllIcon />
                                </IconButton>
                              )
                              // :" "
                            }
                          </InputAdornment>
                        ),
                      }}
                      placeholder='Category'
                      value={rowData.value}
                      // onFocus={handleOnFocus}
                      // onBlur={handleOnBlur}
                      error={!rowData.value}
                        variant="standard"
                      onChange={(e) => {
                        rowData.onChange(e.target.value);
                      }}
                    />
                  </>
                  )
                ),
              },
              {
                field: 'model',
                title: 'Model',
                // validate: (rD) =>  rD.model !== '' && rD.model !== null && typeof rD.model !== 'undefined' ? true : false,
                editComponent: (rowData) => (
                  <>
                    <TextField
                      placeholder='Model'
                      variant="standard"
                      value={rowData.value}
                      // onFocus={handleOnFocus}
                      // onBlur={handleOnBlur}
                      // error={!rowData.value}
                      onChange={(e) => {
                        rowData.onChange(e.target.value);
                      }}
                    />
                  </>
                ),
              },

              {
                field: 'cost_price',
                title: 'Cost Price',
                // validate: (rowData) => Boolean(rowData.cost_price > 0),
                // validate: (rD) =>  rD.cost_price !== '' && rD.cost_price !== null && typeof rD.cost_price !== 'undefined' ? true : false,
              },
              {
                field: 'unit_price',
                title: 'Unit Price',
                editComponent: (rowData) => (
                  <>
                    <TextField
                      placeholder='Unit Price'
                      variant="standard"
                      value={rowData.value}
                      // onFocus={handleOnFocus}
                      // onBlur={handleOnBlur}
                      error={!rowData.value}
                      onChange={(e) => {
                        rowData.onChange(e.target.value);
                      }}
                    />
                  </>
                ),
                // validate: (rowData) => Boolean(rowData.unit_price > 0),
                // validate: (rD) =>  rD.unit_price !== '' && rD.unit_price !== null && typeof rD.unit_price !== 'undefined' ? true : false,
              },
              {
                field: 'max_price',
                title: 'Max Price',
                // validate: (rD) =>  rD.max_price !== '' && rD.max_price !== null && typeof rD.max_price !== 'undefined' ? true : false,
              },
              // {
              //   field: "is_serialized",
              //   title: "Is Serialized",
              //   editComponent: (Props) => (
              //     <FormControl required component="fieldset" fullWidth>
              //       <InputLabel>Serialized</InputLabel>
              //       <Select
              //         variant="standard"
              //         name="is_serialized"
              //         value={Props.value || ""}
              //         onChange={(e) =>
              //           Props.onRowDataChange({
              //             ...Props.rowData,
              //             is_serialized: e.target.value, // Removed parseInt since values are "Yes" or "No"
              //           })
              //         }
              //       >
              //         <MenuItem value="Yes">Yes</MenuItem>
              //         <MenuItem value="No">No</MenuItem>
              //       </Select>
              //     </FormControl>
              //   ),
              // },
              {
                field: "is_serialized",
                title: "Is Serialized",
                editComponent: (Props) => (
                  <FormControl required component="fieldset" fullWidth>
                    {/* <InputLabel>Serialized</InputLabel> */}
                    <Select
                      variant="standard"
                      name="is_serialized"
                      value={Props.value === 1 ? "Yes" : Props.value === 0 ? "No" : ""}
                      onChange={(e) =>
                        Props.onRowDataChange({
                          ...Props.rowData,
                          is_serialized: e.target.value === "Yes" ? 1 : 0, // Convert Yes/No to 1/0
                        })
                      }
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                ),
              },
             {
                field: 'gst_preference',
                title: 'GST Preference',
                validate: (rD) => rD.gst_preference !== '' && rD.gst_preference !== null && typeof rD.gst_preference !== 'undefined',
                editComponent: (rowData) => {
                  const value = rowData.rowData.gst_preference || 'Taxable';
                  return (
                    <FormControl fullWidth>
                      {/* <InputLabel>GST Preference</InputLabel> */}
                      <Select
                        variant="standard"
                        value={value}
                        onChange={(e) => {
                          const updatedRow = {
                            ...rowData.rowData,
                            gst_preference: e.target.value,
                          };
                          rowData.onRowDataChange(updatedRow);
                          copyData(e.target.value, 'gst_preference');
                        }}
                      >
                        <MenuItem value="Taxable">Taxable</MenuItem>
                        <MenuItem value="Non-Taxable">Non-Taxable</MenuItem>
                      </Select>
                    </FormControl>
                  );
                }
                
              },

              // {
              //   field: 'tax_category_id',
              //   title: 'Tax percentage',
              //   render: (rowData) => {
              //     // FIX: Find tax by tax_category_id (not by tax_percentage)
              //     const selectedTax = taxcategory.find(
              //       (tax) => tax.tax_group_sequence == rowData?.tax_percentage,
              //     );
              //     console.log(selectedTax, taxcategory, rowData, 'selectedTax');

              //     return selectedTax
              //       ? `${selectedTax.tax_group_sequence}%`
              //       : '';
              //   },
              //   validate: (rowData) => {
              //     if (rowData.gst_preference === 'Non-Taxable') return true;
              //     return Boolean(rowData.tax_category_id);
              //   },
              //   editComponent: (Props) => (
              //     <FormControl required component='fieldset' fullWidth>
              //       {/* <InputLabel>Tax Percentage</InputLabel> */}
              //       <Select
              //         variant='standard'
              //         name='tax_category_id'
              //         label='Tax Category'
              //         value={Props.rowData.tax_category_id || ''}
              //         error={
              //           Props.rowData.gst_preference === 'Taxable' &&
              //           !Props.rowData.tax_category_id
              //         }
              //         onChange={(e) => {
              //           const selectedTax = taxcategory.find(
              //             (tax) =>
              //               tax.tax_category_id === parseInt(e.target.value),
              //           );

              //           if (selectedTax) {
              //             const updatedRow = {
              //               ...Props.rowData,
              //               tax_category_id: selectedTax.tax_category_id,
              //               tax_percentage: selectedTax.tax_group_sequence,
              //             };

              //             Props.onRowDataChange(updatedRow);
              //           if (Props.rowData.hsn_code) {
              //             copyDataTax(
              //               {
              //                 hsn_code: Props.rowData.hsn_code,
              //                 tax_category_id: selectedTax.tax_category_id,
              //               },
              //               'tax_category_by_hsn',
              //             );
              //           }
              //           }
              //         }}
              //       >
              //         {taxcategory?.map((d) => (
              //           <MenuItem
              //             value={d.tax_category_id}
              //             key={d.tax_category_id}
              //           >
              //             {d.tax_category }
              //           </MenuItem>
              //         ))}
              //       </Select>
              //     </FormControl>
              //   ),
              // },
     
{
  field: 'tax_category_id',
  title: 'Tax Percentage',
  render: (rowData) => {
    const selectedTax = taxcategory.find(
      (tax) => tax.tax_group_sequence === rowData?.tax_percentage
    );
    console.log(selectedTax, taxcategory, rowData, 'selectedTax');
    return selectedTax ? `${selectedTax.tax_group_sequence}%` : '';

  },
  validate: (rowData) => {
    if (rowData.gst_preference === 'Non-Taxable') return true;
    return rowData.tax_percentage !== undefined && rowData.tax_percentage !== null;
  },
  editComponent: (Props) => {
    const effectiveTaxValue =
      taxcategory.find(
        (t) => t.tax_group_sequence === Props.rowData.tax_percentage
      )?.tax_group_sequence ?? '';

    return (
      <FormControl required component='fieldset' fullWidth>
        <Select
          variant='standard'
          name='tax_percentage'
          label='Tax Percentage'
          value={String(effectiveTaxValue)} // convert to string
          error={
            Props.rowData.gst_preference === 'Taxable' &&
            (effectiveTaxValue === '' || effectiveTaxValue === undefined)
          }
          onChange={(e) => {
            const selectedTax = taxcategory.find(
              (tax) => String(tax.tax_group_sequence) === e.target.value
            );


            if (selectedTax) {
              const updatedRow = {
                ...Props.rowData,
                tax_category_id: selectedTax.tax_category_id,
                tax_percentage: parseInt(selectedTax.tax_group_sequence),
              };


              Props.onRowDataChange(updatedRow);

              if (Props.rowData.hsn_code) {
                copyDataTax(
                  {
                    hsn_code: Props.rowData.hsn_code,
                    tax_category_id: selectedTax.tax_category_id,
                  },
                  'tax_category_by_hsn'
                );
              }
            }
          }}
        >
          {taxcategory?.map((d) => (
            <MenuItem
              value={String(d.tax_group_sequence)} // also string here
              key={d.tax_category_id}
            >
              {d.tax_category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  },
},


              {
                field: 'pack_name',
                title: 'Unit',
                validate: (rD) =>
                  rD.pack_name !== '' &&
                  rD.pack_name !== null &&
                  typeof rD.pack_name !== 'undefined',

                render: (rowData) => {
                  const unit = getUnitsLov?.find(
                    (u) => u.id === rowData.pack_name,
                  );
                  // console.log("unit",unit,rowData)
                  return unit?.unit || 'nos';
                },
                editComponent: (props) => {
                  const nosUnit = getUnitsLov?.find((u) => u.unit === 'nos');
                  const defaultValue = nosUnit?.id ?? '';

                  const value =
                    props.value !== undefined && props.value !== null
                      ? props.value
                      : defaultValue;
                  // console.log("value",value)
                  return (
                    <FormControl required fullWidth>
                      {/* //<InputLabel>Unit</InputLabel> */}
                      <Select
                        variant='standard'
                        name='pack_name'
                        value={value}
                        onChange={(e) => {
                          const updatedRow = {
                            ...props.rowData,
                            pack_name: e.target.value,
                          };
                          props.onRowDataChange(updatedRow);
                          copyData(e.target.value, 'pack_name');
                        }}
                      >
                        {getUnitsLov?.map((d) => (
                          <MenuItem value={d.id} key={d.id}>
                            {d.unit}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                },
              },

              {
                field: 'qty_per_pack',
                title: 'Quantity per Pack',
                editComponent: (rowData) => (
                  <>
                    <TextField
                      placeholder='Quantity Per Pack'
                      variant='standard'
                      value={rowData.value}
                      // onFocus={handleOnFocus}
                      // onBlur={handleOnBlur}
                      error={!rowData.value}
                      onChange={(e) => {
                        rowData.onChange(e.target.value);
                      }}
                    />
                  </>
                ),
              },
              {
                field : 'hsn_code',
                title : 'Hsn Code',
                validate: (rowData) => Boolean(rowData.hsn_code),
                // validate: (rD) =>  rD.hsn_code !== '' && rD.hsn_code !== null && typeof rD.hsn_code !== 'undefined' ? true : false,
                editComponent: (rowData) => (
                  (
                  <>
                    <TextField
                      InputProps={{
                        endAdornment: (
                          <InputAdornment>
                            {
                              // categoryIcon === true ?
                              rowData.rowData.tableData.index === 0 && (
                                <IconButton
                                  onClick={() =>
                                    copyData(rowData.value, 'hsn_code')
                                  }
                                >
                                  <CopyAllIcon />
                                </IconButton>
                              )
                              // :" "
                            }
                          </InputAdornment>
                        ),
                      }}
                      placeholder='Hsn Code'
                      value={rowData.value}
                      error={!rowData.value}
                      // onFocus={handleOnFocus}
                      // onBlur={handleOnBlur}
                        variant="standard"
                      onChange={(e) => {
                        rowData.onChange(e.target.value);
                      }}
                    />
                  </>
                  )
                ),
                
              },
              // {
              //   field: 'lot_number',
              //   title: 'Lot Number',
              //   // validate: (rD) =>  rD.max_price !== '' && rD.max_price !== null && typeof rD.max_price !== 'undefined' ? true : false,
              // },
              // {
              //   field: 'receiving_quantity',
              //   title: 'Receiving Quantity',
              //   editComponent: (rowData) => (
              //     <>
              //       <TextField
              //         placeholder='Receiving Quantity'
              //         variant="standard"
              //         value={rowData.value}
              //         // onFocus={handleOnFocus}
              //         // onBlur={handleOnBlur}
              //         error={!rowData.value}
              //         onChange={(e) => {
              //           rowData.onChange(e.target.value);
              //         }}
              //       />
              //     </>
              //   ),
              //   // validate: (rD) =>  rD.max_price !== '' && rD.max_price !== null && typeof rD.max_price !== 'undefined' ? true : false,
              // },
            ]}
            data={wOutItemId}
            title={<Typography variant='h6'>Missing Products</Typography>}
            // editable={{
            //   onBulkUpdate: (changes) =>
            //     new Promise((resolve, reject) => {
            //       setTimeout(() => {
            //         const makeData = [...tabData];
            //         Object.keys(changes).map((d) => {
            //           makeData[d] = changes[d].newData;
            //           const validate = mandatoryFields.every((e) => Object.keys(changes[d].newData).includes(e))
            //           console.log('validateeee', validate)
            //           if (validate) {
            //             for (let i in changes[d].newData) {
            //               if (mandatoryFields.includes(i) && (changes[d].newData[i] === null || changes[d].newData[i] === '' || typeof changes[d].newData[i] === 'undefined')) {
            //                 reject()
            //               } else if (optionalFields.includes(i) && (changes[d].newData[i] === null || changes[d].newData[i] === '' || typeof changes[d].newData[i] === 'undefined')) {
            //                 changes[d].newData[i] = 0
            //               }
            //             }
            //           }else{
            //             reject()
            //           }
            //         });
            //         setDataApi(makeData);
            //         setTabData(makeData);
            //         resolve(makeData);
            //       }, 1000);
            //     }),
            // }}
            // editable={{
            //   onBulkUpdate: (changes) =>
            //     new Promise((resolve, reject) => {
            //       setTimeout(() => {
            //         const makeData = [...tabData];

            //         Object.keys(changes).forEach((key) => {
            //           let newData = { ...changes[key].newData };

            //           // Convert 'is_serialized' value: "Yes" â†’ 1, "No" â†’ 0
            //           // if (newData.is_serialized === "Yes") {
            //           //   newData.is_serialized = 1;
            //           // } else if (newData.is_serialized === "No") {
            //           //   newData.is_serialized = 0;
            //           // }

            //           // Validate mandatory fields
            //           // const isValid = mandatoryFields.every(
            //           //   (field) => newData[field] !== null && newData[field] !== "" && typeof newData[field] !== "undefined"
            //           // );
            //           const isValid = mandatoryFields.every((field) => {
            //             const value = newData[field];
            //             const isEmpty = value === null || value === "" || typeof value === "undefined";

            //             if (isEmpty) {
            //               console.error(`Missing mandatory field: ${field}`, newData);
            //             }

            //             return !isEmpty;
            //           });
            //            console.log('validateee', isValid)
            //           if (!isValid) {
            //             reject(); // Reject if any mandatory field is missing
            //             return;
            //           }

            //           // Handle optional fields (set to 0 if empty/null)
            //           for (let field in newData) {
            //             if (optionalFields.includes(field) && (newData[field] === null || newData[field] === "" || typeof newData[field] === "undefined")) {
            //               newData[field] = 0;
            //             }
            //           }

            //           // Update data array
            //           makeData[key] = newData;

            //           const rowIndex = changes[key].newData.tableData.id;
            //         makeData[rowIndex] = newData;

            //         });

            //         // Update state
            //         setDataApi(makeData);
            //         setTabData(makeData);
            //         resolve(makeData);
            //       }, 1000);
            //     }),
            // }}

          editable={{
                onBulkUpdate: (changes) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    let updatedData = [...wOutItemId]; // use your table source data

                    Object.keys(changes).forEach((key) => {
                      let newData = { ...changes[key].newData }; // clone the row

                      // validation...
                      const rowIndex = changes[key].newData.tableData.id;

                      // âœ… replace with a fresh object
                      updatedData[rowIndex] = { ...newData };
                    });
                    setDataApi(updatedData);
                                setTabData(updatedData);
                    resolve(); // don't pass array here, let MaterialTable refresh itself
                  }, 500);
                }),
              }}


            
            components={{
              Toolbar: (props) => (
                <div>
                  <MTableToolbar {...props} />
                  <div style={{padding: '0 10px 0 25px'}}>
                    {checkDuplicates().length ? (
                      <div style={{display: 'flex', alignItems: 'center'}}>
                        <h4 style={{margin: 0}}>Duplicate product names</h4>

                        <RenameDialog
                          setDataApi={setDataApi}
                          dupNames={checkDuplicates()}
                          tabData={tabData}
                        />
                      </div>
                    ) : (
                      ''
                    )}

                    {checkDuplicates().map((d,i) => (
                      <div key={i}>{d}</div>
                    ))}
                  </div>
                </div>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>cancel</Button>
          <Button
            disabled={checkDuplicates().length || checkIsEmpty }
            onClick={() => from ==='purchaseupload' ? bulkApiCreate(wOutItemId) : from === 'salesUpload' ?  bulkApiCreate(wOutItemId) :  bulkApiCreate(tabData) }
            autoFocus
          >
            create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

