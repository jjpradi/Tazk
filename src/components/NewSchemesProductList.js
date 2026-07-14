import React, {useContext, useEffect, useState} from 'react';
import {
  Grid,
  Box,
  Card,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import Typography from '@mui/material/Typography';
import {useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../context/CreateNewButtonContext';
import { DataGrid } from '@mui/x-data-grid';
import CommonSearch from '../utils/commonSearch';
import { listProductAction } from 'redux/actions/product_actions';

export default function NewSchemeProductList(props) {
  const dispatch = useDispatch();
  const {
    bankCreationReducer: {
      bank_reconciliation,
      bank_id
    },
  } = useSelector((state) => state);
  const { productReducer: {product} } = useSelector((state) => state);
  const {setModalTypeHandler, setLoaderStatusHandler,commoncookie,
    headerLocationId} = useContext(
    CreateNewButtonContext,
  );
  const [searchVal, setSearchVal] = useState('');
  const [searchData, setSearchData] = useState([]);  
  const [selectedRows, setSelecedRows] = useState({products: []});
  const [editStatus, setEditStatus] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState([]);
  const [additionalFields, setAdditionalFields] = useState({
    qtyValue: '',
    from_target: '',
    to_target: '',
    scheme_award: '',
  });


  
  let filterProductData = product.filter((f) => {
    return f.brand === props.brand
  }).map((row, index) => ({
    ...row,
    id: index + 1,
  }))

  useEffect( () => {
    if(props.status === 'edit'){    
    
      // if (!product.length) {
        dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler, () => {}, (response) => {
          if(response.length){
            // setProductData(response)

            let productListData = response.filter((f) => {
              return f.brand === props.brand
            }).map((row, index) => ({
              ...row,
              id: index + 1,
            }))


            let finalData = props.edit_id_data[0]?.products.map((p, i) => {
              return productListData.filter((f) => {
                if (f.item_id === p.product_id) {
                  return f;
                }
                return null;
              })[0];
            })


            let final = finalData.map((d) => d.id)
        
            setSelecedRows({
              ...selectedRows,
                products: final
            })
            setEditStatus(false)
          }
        }));
      // }
    }
    else{
      setEditStatus(true)
    }
  }, [props.status])

  useEffect(() => {
    if(props.status !== 'edit' || editStatus === false){
      setSelecedRows({
        ...selectedRows,
          products: []
      })
    }
  }, [props.brand]);

  // let selectedId = finalData.map((d) => d.id)


  // useEffect(() => {
  //   let productId = filterProductData.map(i => ({ product_id: i.item_id }))
  //   props.onStateChange(productId);
  // }, [props.brand]);



  const rowData = [
    {
      field: 'id',
      hide: true, 
    },
    {
      headerName: 'Product Name',
      field: 'name',
      flex: 1,
      minWidth: 300,
    },
    {
      headerName: 'Quantity/Value',
      field: 'quantityValue',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
      
        if (editMode && editedRows.find((row) => row.id === params.row.id)) {
          return (
            <RadioGroup
              aria-label="Quantity/Value"
              name="qtyValue"
              value={editedRows.find((row) => row.id === params.row.id)?.quantityValue || ''}
              onChange={(e) =>
                handleAdditionalFieldsChange('qtyValue', e.target.value, params.row.id)
              }
              onClick={(e) => e.stopPropagation()}
              row
            >
              <FormControlLabel value='0' control={<Radio />} label="Quantity" /> 
              <FormControlLabel value="1" control={<Radio />} label="Value" />
            </RadioGroup>
          );
        } else {
          return params.row.quantityValue;
        }
      },
    },
    {
      headerName: 'From Target',
      field: 'fromTarget',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        if (editMode && editedRows.find((row) => row.id === params.row.id)) {
          return (
            <TextField
              name="from_target"
              label="From Target"
              value={editedRows.find((row) => row.id === params.row.id)?.from_target || ''}
              onChange={(e) =>
                handleAdditionalFieldsChange('from_target', e.target.value, params.row.id)
              }
              onClick={(e) => e.stopPropagation()}
            />
          );
        } else {
          return params.row.fromTarget;
        }
      },
    },
    {
      headerName: 'To Target',
      field: 'toTarget',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        if (editMode && editedRows.find((row) => row.id === params.row.id)) {
          return (
            <TextField
              name="to_target"
              label="To Target"
              value={editedRows.find((row) => row.id === params.row.id)?.to_target || ''}
              onChange={(e) =>
                handleAdditionalFieldsChange('to_target', e.target.value, params.row.id)
              }
              onClick={(e) => e.stopPropagation()}
            />
          );
        } else {
          return params.row.toTarget;
        }
      },
    },
    {
      headerName: 'Scheme Award',
      field: 'schemeAward',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        if (editMode && editedRows.find((row) => row.id === params.row.id)) {
          return (
            <TextField
              name="scheme_award"
              label="Scheme Award"
              value={editedRows.find((row) => row.id === params.row.id)?.scheme_award || ''}
              onChange={(e) =>
                handleAdditionalFieldsChange('scheme_award', e.target.value, params.row.id)
              }
              onClick={(e) => e.stopPropagation()}
            />
          );
        } else {
          return params.row.schemeAward;
        }
      },
    },
  ];

  // const handleSelection = (selected) => {
  //   if (selected.length) {
  //     let selectedProducts = filterProductData.filter((product) => selected.includes(product.id));

  //     setSelecedRows({
  //       ...selectedRows,
  //       products: selected.map((i) => i),
  //     });

  //     let productIds = selectedProducts.map((product) => ({ product_id: product.item_id }));
  //     props.onStateChange(productIds);

  //     // Switch to edit mode and set the edited rows data
  //     setEditMode(true);
  //     setEditedRows(selectedProducts);
  //     setAdditionalFields({
  //       qtyValue: '', // Reset the additional fields when new rows are selected
  //       from_target: '',
  //       to_target: '',
  //       scheme_award: '',
  //     });
  //   } else {
  //     // Exit edit mode
  //     setEditMode(false);
  //     setEditedRows([]);
  //   }
  // };

  const handleSelection = (selected) => {
    if (selected.length) {
      let filter = filterProductData.filter((f) => selected.includes(f.id))
      setSelecedRows({
        ...selectedRows,
        products: filter.map(i => (i.id)),
      })
      let productId = filter.map(i => ({ product_id: i.item_id }))
      props.onStateChange(productId);
      setEditMode(true);
      setEditedRows(filter);
      setAdditionalFields({
        qtyValue: '',
        from_target: '',
        to_target: '',
        scheme_award: '',
      });
    } else {
      setEditMode(false);
      setEditedRows([]);
      setSelecedRows({
        ...selectedRows,
        products: [],
      })
      let productId = filterProductData.map(i => ({ product_id: i.item_id }))
      props.onStateChange(productId);
    }
  };
  

  const handleAdditionalFieldsChange = (name, value, rowId) => {
  
    setAdditionalFields((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));


    // Get the updated value for the additional fields directly.
  const updatedAdditionalFields = {
    ...additionalFields,
    [name]: value,
  };
    // Create an object with the required properties
    const updatedData = {
      product_id: editedRows.find((row) => row.id === rowId)?.item_id || null,
      qtyValue: updatedAdditionalFields.qtyValue || null,
      from_target: updatedAdditionalFields.from_target || null,
      to_target: updatedAdditionalFields.to_target || null,
      scheme_award: updatedAdditionalFields.scheme_award || null,
    };
  
    setEditedRows((prevRows) =>
    prevRows.map((row) =>
      row.id === rowId
        ? {
          id: row.id,
          product_id: row.item_id,
          quantityValue: name === 'qtyValue' ? updatedAdditionalFields.qtyValue : row.quantityValue,
          from_target: name === 'from_target' ? updatedAdditionalFields.from_target : row.from_target,
          to_target: name === 'to_target' ? updatedAdditionalFields.to_target : row.to_target,
          scheme_award: name === 'scheme_award' ? updatedAdditionalFields.scheme_award : row.scheme_award,
          item_id: row.item_id
        }
        : row
    )
  );

  
    props.onStateChange(updatedData);
  };
  

  
  const flattenObjectValues = (obj) => {
    const values = [];
  
    function flatten(value) {
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(flatten);
        } else {
          Object.values(value).forEach(flatten);
        }
      } else if (value !== null && value !== undefined) {
        let val = value.toString();
        values.push(val);
      }
    }
  
    flatten(obj);
    return values;
  };


  const requestSearch = (e) => {
    let val = e.target.value;
    setSearchVal(val);
    let searchKeywords = val;
  
    const searchSplit = searchKeywords.trim().split(/\s+/);
  
    const matchedRecords = filterProductData.filter((record) => {
      const recordValues = [
        ...flattenObjectValues(record),
        record.unit_price.toString(), // Convert unit_price to string for comparison
      ].join(" ").toLowerCase();
  
      // Check if all search keywords are present in the record values
      const allKeywordsPresent = searchSplit.every((keyword) => {
        // Handle numeric comparisons
        if (keyword.includes('<')) {
          const [value, operator] = keyword.split('<');
          return parseFloat(record.unit_price) < parseFloat(value);
        } else if (keyword.includes('>')) {
          const [value, operator] = keyword.split('>');
          return parseFloat(record.unit_price) > parseFloat(value);
        }
  
        return recordValues.includes(keyword.toLowerCase());
      });
  
      return allKeywordsPresent;
    });
  
    setSearchData(matchedRecords);
  };

  const cancelSearch = (e) => {
    setSearchVal('')
    setSearchData([])
  };


  return (
    <>
      <Card sx={{p: '20px', width: '100%', height: '100%'}}>
        <Grid
          container
          display='flex'
          flexDirection='row'
          pb='15px'
          alignItems='center'
        >
          <Grid
            size={{
              lg: 8,
              md: 8,
              sm: 8,
              xs: 12
            }}>
            <Typography variant='h6' align='left' p='0px 0px 15px 0px'>
              {'ProductList'}
            </Typography>
          </Grid>
          <Grid
            display='flex'
            justifyContent='flex-end'
            size={{
              lg: 4,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <CommonSearch
              searchVal={searchVal}
              cancelSearch={cancelSearch}
              requestSearch={requestSearch}
            />
          </Grid>
        </Grid>

        <Box sx={{ height: 400, width: '100%' }}>
          {props?.brand && props?.brand?.length > 0 ? (
            <>
              <DataGrid
                rows={searchVal ? searchData : filterProductData}
                columns={rowData}
                density='compact'
                // checkboxSelection
                // selectionModel={props.status === 'edit' ? selectedId : selectedRows.products}
                rowSelectionModel={selectedRows.products}
                onRowSelectionModelChange={handleSelection}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
              />
            </>
          ) : (
            <DataGrid
              rows={[]}
              columns={rowData}
              density="compact"
              rowSelectionModel={selectedRows.products}
              onRowSelectionModelChange={handleSelection}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 20,
                  },
                },
              }}
              pageSizeOptions={[20, 50, 100]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          )}
        </Box>
      </Card>
    </>
  );
}
