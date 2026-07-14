import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  FormControlLabel,
  Checkbox,
  Card,
  Grid,
  IconButton,
  FormGroup,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Autocomplete,
  TableContainer,
  Tooltip,
  TablePagination,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useDispatch } from 'react-redux';
import { useCustomFetch } from 'utils/useCustomFetch';
import API_URLS from 'utils/customFetchApiUrls';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
// import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import { saveReconcilateAction, checkLotAvailableAction } from 'redux/actions/stockReconcilate_actions';
import apiCalls from 'utils/apiCalls';

const stepLabels = ['Select Filters', 'Scan Barcodes', 'Review & Submit'];


function NewStockReconcilateForm(props) {
  const customFetch = useCustomFetch();
  const dispatch = useDispatch();

  const { commoncookie, headerLocationId, setModalTypeHandler,
    setLoaderStatusHandler, } = useContext(CreateNewButtonContext);

  const [allData, setAllData] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [modelList, setModelList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [step1Tab, setStep1Tab] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [reconcileData, setReconcileData] = useState([]);
  const [barcodeList, setBarcodeList] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [summary, setSummary] = useState({
    totalLots: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalModels: 0,
  });

  const [tabValue, setTabValue] = useState(0);
  const [scannedStock, setScannedStock] = useState([]);
  const [excessStock, setExcessStock] = useState([]);
  const [missingStock, setMissingStock] = useState([]);
  const [editingLot, setEditingLot] = useState(null);
  const [reasonInput, setReasonInput] = useState('');
  const [editExcessValues, setEditExcessValues] = useState({});
  const [initialLocationId, setInitialLocationId] = useState(null);
  const [barcodeInputError, setBarcodeInputError] = useState(null)
  const [isBulkEdit, setIsBulkEdit] = useState(false)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
  if (initialLocationId && headerLocationId !== initialLocationId) {
    setCurrentStep(1);
    setInitialLocationId(null);
    setReconcileData([]);
    setMissingStock([]);
    setExcessStock([]);
    setScannedStock([]);
    setBarcodeList([]);
    dispatch(OpenalertActions({
      msg: 'Location changed. Reconciliation reset for consistency.',
      severity: 'warning',
    }));
  }
}, [headerLocationId]);


  console.log("scannedStock", scannedStock)
  console.log("excessStock", excessStock)
  console.log("missingStock", missingStock)
  useEffect(() => { (async () => {
    const fetchList = async () => {
      try {
        const res = await customFetch(API_URLS.GET_LIST_BASED_ON_TYPE('categoryAndBrand'), 'GET');
        const data = res?.data || [];
        setAllData(data);
        setCategoryList([...new Set(data.map((d) => d.category).filter(Boolean))]);
        setBrandList([...new Set(data.map((d) => d.brand).filter(Boolean))]);
        setModelList([...new Set(data.map((d) => d.model).filter(Boolean))]);
      } catch {
        setAllData([]);
      }
    };
    fetchList();
  })();
}, []);

  const handleSubmit = async () => {
    const missingWithoutReason = missingStock.filter(item => !item.reason || item.reason.trim() === '');
    if (missingWithoutReason.length > 0) {
      dispatch(OpenalertActions({ msg: 'Please fill reason for all missing stock items before submitting.', severity: 'warning' }));
      return;
    }

    const invalidExcess = excessStock.filter(item =>
      !item.product_name || !item.category || !item.brand
    );
    if (invalidExcess.length > 0) {
      dispatch(OpenalertActions({ msg: 'Please fill Product, Category, Brand for all excess stock items before submitting.', severity: 'warning' }));
      return;
    }

    const payload = {
      user_id: commoncookie,
      location_id: headerLocationId,
      category: selectedCategories,
      brand: selectedBrands,
      model: selectedModels,
      scanned_lots: scannedStock.map(item => ({
        lotNumber: item.lotNumber,
        reason: item.reason || '',
        type: 'sc',
        action: 'success',
        item_id: item.item_id,
      })),
      excess: excessStock.map(item => ({
        lotNumber: item.lotNumber,
        name: item.product_name || '',
        product_name: item.product_name || '',
        category: item.category || '',
        brand: item.brand || '',
        cost_price: item.trans_items_cost_price || 0,
        item_id: item.item_id,
        location_status: item.location_status || 0,
        reason: item.reason || '',
        type: 'excess',
      })),
      missing: missingStock.map(item => ({
        lotNumber: item.lotNumber,
        reason: item.reason || '',
        item_id: item.item_id,
        cost_price: item.trans_items_cost_price || 0,
        location_status: item.location_status || 1,
        type: 'missing',
        lot_id: item.lot_id,
      })),
    };

    console.log('payload', payload);

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      await dispatch(
        saveReconcilateAction(
          payload
        ),
      ),
      props.handleClose()

    )


  };

  const getFilteredData = (overrideCategories, overrideBrands) => {
    const cats = overrideCategories !== undefined ? overrideCategories : selectedCategories;
    const brands = overrideBrands !== undefined ? overrideBrands : selectedBrands;
    let filtered = allData;
    if (cats.length > 0) filtered = filtered.filter((d) => cats.includes(d.category));
    if (brands.length > 0) filtered = filtered.filter((d) => brands.includes(d.brand));
    return filtered;
  };

  const handleCategorySelection = (value) => {
    const updated = selectedCategories.includes(value)
      ? selectedCategories.filter((v) => v !== value)
      : [...selectedCategories, value];
    setSelectedCategories(updated);

    const filtered = getFilteredData(updated, undefined);
    setBrandList([...new Set(filtered.map((d) => d.brand).filter(Boolean))]);
    setSelectedBrands((prev) => prev.filter((b) => filtered.some((d) => d.brand === b)));
    setModelList([...new Set(filtered.map((d) => d.model).filter(Boolean))]);
    setSelectedModels((prev) => prev.filter((m) => filtered.some((d) => d.model === m)));
  };

  const handleBrandSelection = (value) => {
    const updated = selectedBrands.includes(value)
      ? selectedBrands.filter((v) => v !== value)
      : [...selectedBrands, value];
    setSelectedBrands(updated);

    const filtered = getFilteredData(undefined, updated);
    setCategoryList([...new Set(filtered.map((d) => d.category).filter(Boolean))]);
    setSelectedCategories((prev) => prev.filter((c) => filtered.some((d) => d.category === c)));
    setModelList([...new Set(filtered.map((d) => d.model).filter(Boolean))]);
    setSelectedModels((prev) => prev.filter((m) => filtered.some((d) => d.model === m)));
  };

  const handleModelSelection = (value) => {
    const updated = selectedModels.includes(value)
      ? selectedModels.filter((v) => v !== value)
      : [...selectedModels, value];
    setSelectedModels(updated);
  };

  const handleSelectAllCategories = (filteredList, allSelected) => {
    if (allSelected) {
      const updated = selectedCategories.filter((c) => !filteredList.includes(c));
      setSelectedCategories(updated);
      const filtered = getFilteredData(updated, undefined);
      setBrandList([...new Set(filtered.map((d) => d.brand).filter(Boolean))]);
      setSelectedBrands((prev) => prev.filter((b) => filtered.some((d) => d.brand === b)));
      setModelList([...new Set(filtered.map((d) => d.model).filter(Boolean))]);
      setSelectedModels((prev) => prev.filter((m) => filtered.some((d) => d.model === m)));
    } else {
      const updated = [...new Set([...selectedCategories, ...filteredList])];
      setSelectedCategories(updated);
      const filtered = getFilteredData(updated, undefined);
      setBrandList([...new Set(filtered.map((d) => d.brand).filter(Boolean))]);
      setSelectedBrands((prev) => prev.filter((b) => filtered.some((d) => d.brand === b)));
      setModelList([...new Set(filtered.map((d) => d.model).filter(Boolean))]);
      setSelectedModels((prev) => prev.filter((m) => filtered.some((d) => d.model === m)));
    }
  };

  const handleSelectAllBrands = (filteredList, allSelected) => {
    if (allSelected) {
      const updated = selectedBrands.filter((b) => !filteredList.includes(b));
      setSelectedBrands(updated);
      const filtered = getFilteredData(undefined, updated);
      setCategoryList([...new Set(filtered.map((d) => d.category).filter(Boolean))]);
      setSelectedCategories((prev) => prev.filter((c) => filtered.some((d) => d.category === c)));
      setModelList([...new Set(filtered.map((d) => d.model).filter(Boolean))]);
      setSelectedModels((prev) => prev.filter((m) => filtered.some((d) => d.model === m)));
    } else {
      const updated = [...new Set([...selectedBrands, ...filteredList])];
      setSelectedBrands(updated);
      const filtered = getFilteredData(undefined, updated);
      setCategoryList([...new Set(filtered.map((d) => d.category).filter(Boolean))]);
      setSelectedCategories((prev) => prev.filter((c) => filtered.some((d) => d.category === c)));
      setModelList([...new Set(filtered.map((d) => d.model).filter(Boolean))]);
      setSelectedModels((prev) => prev.filter((m) => filtered.some((d) => d.model === m)));
    }
  };

  const handleSelectAllModels = (filteredList, allSelected) => {
    if (allSelected) {
      setSelectedModels((prev) => prev.filter((m) => !filteredList.includes(m)));
    } else {
      setSelectedModels((prev) => [...new Set([...prev, ...filteredList])]);
    }
  };

  const calculateSummary = (data) => {
    if (!Array.isArray(data) || data.length === 0)
      return { totalLots: 0, totalCategories: 0, totalBrands: 0 };

    let totalLots = 0;
    const categories = new Set();
    const brands = new Set();

    data.forEach((item) => {
      totalLots += Array.isArray(item.lots) ? item.lots.length : 0;
      if (item.category) categories.add(item.category);
      if (item.brand) brands.add(item.brand);
    });

    return {
      totalLots,
      totalCategories: categories.size,
      totalBrands: brands.size,
    };
  };

  const handleNextFromStep1 = async () => {
    if (!initialLocationId) {
      setInitialLocationId(headerLocationId);
    }
    if (selectedCategories.length === 0 && selectedBrands.length === 0 && selectedModels.length === 0) {
      dispatch(OpenalertActions({ msg: 'Please select at least one Category, Brand or Model.', severity: 'warning' }));
      return;
    }

    const payload = {
      type: 'categoryAndBrand',
      location_id: headerLocationId,
      category: selectedCategories,
      brand: selectedBrands,
      model: selectedModels,
    };

    try {
      const response = await customFetch(API_URLS.GET_DATA_BASED_ON_TYPE(), 'POST', payload);
      const data = response?.data?.data || [];
      const serializedData = data.filter(item => item.is_serialized === 1);
      if (serializedData.length === 0) {
        dispatch(OpenalertActions({
          msg: 'No serialized products found for the selected filters.',
          severity: 'error'
        }));
        return;
      }
      const flattened = serializedData.flatMap(item =>
        (item.lots || []).map(lot => ({
          product_name: item.product_name,
          item_id: item.item_id,
          category: item.category,
          brand: item.brand,
          lot_id: lot.lot_id,
          lotNumber: lot.lot_number,
          quantity: lot.quantity,
          location_name: item.location_name,
        }))
      );
      setReconcileData(flattened);
      const computed = calculateSummary(data);
      setSummary({
        totalLots: computed.totalLots,
        totalCategories: selectedCategories.length || categoryList.length,
        totalBrands: selectedBrands.length || brandList.length,
        totalModels: selectedModels.length,
      });
      if (flattened.length === 0) {
        dispatch(OpenalertActions({
          msg: 'No lots available',
          severity: 'error'
        }));
        return;
      }
      setCurrentStep(2);
    } catch {
      dispatch(OpenalertActions({ msg: 'Failed to fetch reconcile data.', severity: 'error' }));
    }
  };

  const handleBarcodeKeyPress = (e) => {
    if (e.key === 'Enter' && barcodeInput.trim() !== '') {
      e.preventDefault();
      const trimmed = barcodeInput.trim();
      const payload = {
        lotNumber: trimmed,
        location_id: headerLocationId,
        category: selectedCategories,
        brand: selectedBrands
      }
      dispatch(checkLotAvailableAction(payload, (res) => {
        if(res.length === 0){
          if (barcodeList.includes(trimmed)) {
            dispatch(OpenalertActions({ msg: 'Duplicate barcode/lot number!', severity: 'warning' }));
            setBarcodeInput('');
            setBarcodeInputError(null)
            return;
          }
          setBarcodeList((prev) => [...prev, trimmed]);
          setBarcodeInput('');
          setBarcodeInputError(null)
        }
        else{
          setBarcodeInputError('Barcode / Lot Number is not available for the selected brand and category')
        }
      }))
    }
  };

  const handleNextFromStep2 = () => {
    // if (!barcodeList || barcodeList.length === 0) {
    //   dispatch(OpenalertActions({
    //     msg: 'Please enter at least one barcode or lot number.',
    //     severity: 'warning',
    //   }));
    //   return;
    // }

    const allLots = reconcileData.map((item) => item.lotNumber);

    const scanned = reconcileData.filter((item) =>
      barcodeList.includes(item.lotNumber)
    );


      const missing = reconcileData
    .filter((item) => !barcodeList.includes(item.lotNumber))
    .map((item) => {
      const existing = missingStock.find((m) => m.lotNumber === item.lotNumber);
      return existing ? { ...item, reason: existing.reason } : { ...item };
    });


     const excess = barcodeList
    .filter((lot) => !allLots.includes(lot))
    .map((lot) => {
      const existing = excessStock.find((e) => e.lotNumber === lot);
      if (existing) return existing;

      return {
        lotNumber: lot,
        product_name: '',
        category: '',
        brand: '',
      };
    });

    setScannedStock(scanned);
    setMissingStock(missing);
    setExcessStock(excess);
    setCurrentStep(3);
  };




  const handleSaveReason = (lotNumber) => {
    setMissingStock((prev) =>
      prev.map((item) =>
        item.lotNumber === lotNumber ? { ...item, reason: reasonInput } : item
      )
    );
    setEditingLot(null);
    setReasonInput('');
  };

  const handleSaveExcess = (lotNumber) => {
    setExcessStock((prev) =>
      prev.map((item) =>
        item.lotNumber === lotNumber ? { ...item, ...editExcessValues } : item
      )
    );
    setEditingLot(null);
    setEditExcessValues({});
  };

  const handleBulkEditClick = () => {
    setIsBulkEdit(true)
  }

  const renderTable = (rows, type) => {
    const uniqueProducts = [...new Set(reconcileData.map((r) => r.product_name).filter(Boolean))];
    const uniqueCategories = [...new Set(reconcileData.map((r) => r.category).filter(Boolean))];
    const uniqueBrands = [...new Set(reconcileData.map((r) => r.brand).filter(Boolean))];

    return (
      <TableContainer sx={{ minHeight: '100%' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>S.No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>{type === 'excess' ? 'Product*' : 'Product'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>{type === 'excess' ? 'Category*' : 'Category'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>{type === 'excess' ? 'Brand*' : 'Brand'}</TableCell>
              {type === 'missing' && (
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>Reason*</TableCell>
              )}
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>Lot Number</TableCell>
              {(type === 'missing' || type === 'excess') && (
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F9FAFB' }}>Action</TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => {
              const lotNumber = row.lotNumber || '-';
              const isEditing = editingLot === lotNumber;

              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    {type === 'excess' && isEditing ? (
                      <Autocomplete
                        size="small"
                        options={uniqueProducts}
                        value={editExcessValues.product_name || ''}
                        onChange={(e, val) => {
                          setEditExcessValues(prev => {
                            const selectedProduct = reconcileData.find(d => d.product_name === val);
                            return {
                              ...prev,
                              product_name: val || '',
                              item_id: selectedProduct ? selectedProduct.item_id : '',
                            };
                          });
                        }}
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                      />
                    ) : type === 'excess' && isBulkEdit ? (
                      <Autocomplete
                        size="small"
                        options={uniqueProducts}
                        value={row.product_name || ''}
                        onChange={(e, val) => {
                          const updatedData = excessStock.map((d, i) => {
                            if(index === i){
                              const selectedProduct = reconcileData.find(d => d.product_name === val)
                              return {...d, product_name: val || '', item_id: selectedProduct ? selectedProduct.item_id : ''}
                            }
                            else{
                              return d
                            }
                          })
                          setExcessStock(updatedData)
                        }}
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                      />
                    ) : (
                      row.product_name || '-'
                    )}
                  </TableCell>

                  <TableCell>
                    {type === 'excess' && isEditing ? (
                      <Autocomplete
                        size="small"
                        options={uniqueCategories}
                        value={editExcessValues.category || ''}
                        onChange={(e, val) =>
                          setEditExcessValues((prev) => ({ ...prev, category: val || '' }))
                        }
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                      />
                    ) : type === 'excess' && isBulkEdit ? (
                      <Autocomplete
                        size="small"
                        options={uniqueCategories}
                        value={row.category || ''}
                        onChange={(e, val) => {
                          const updatedData = excessStock.map((d, i) => {
                            if(index === i){
                              return {...d, category: val || ''}
                            }
                            else{
                              return d
                            }
                          })
                          setExcessStock(updatedData)
                        }}
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                      />
                    ) : (
                      row.category || '-'
                    )}
                  </TableCell>

                  <TableCell>
                    {type === 'excess' && isEditing ? (
                      <Autocomplete
                        size="small"
                        options={uniqueBrands}
                        value={editExcessValues.brand || ''}
                        onChange={(e, val) =>
                          setEditExcessValues((prev) => ({ ...prev, brand: val || '' }))
                        }
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                      />
                    ) : type === 'excess' && isBulkEdit ? (
                      <Autocomplete
                        size="small"
                        options={uniqueBrands}
                        value={row.brand || ''}
                        onChange={(e, val) => {
                          const updatedData = excessStock.map((d, i) => {
                            if(index === i){
                              return {...d, brand: val || ''}
                            }
                            else{
                              return d
                            }
                          })
                          setExcessStock(updatedData)
                        }}
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                      />
                    ) : (
                      row.brand || '-'
                    )}
                  </TableCell>

                  {type === 'missing' && (
                    <>
                      <TableCell>
                        {isEditing ? (
                          <TextField
                            size="small"
                            variant="standard"
                            value={reasonInput}
                            onChange={(e) => setReasonInput(e.target.value)}
                            fullWidth
                            autoFocus
                          />
                        ) : isBulkEdit ? (
                          <TextField
                            size="small"
                            variant="standard"
                            value={row.reason}
                            onChange={(e) => {
                              const updatedData = missingStock.map((d, i) => {
                                if(i === index){
                                  return {...d, reason: event.target.value}
                                }
                                else{
                                  return d
                                }
                              })
                              setMissingStock(updatedData)
                            }}
                            fullWidth
                          />
                        ) : (
                          row.reason || '-'
                        )}
                      </TableCell>
                      <TableCell>{lotNumber}</TableCell>
                      <TableCell>
                        {isEditing && !isBulkEdit ? (
                          <>
                            <IconButton onClick={() => handleSaveReason(lotNumber)}>
                              <CheckIcon />
                            </IconButton>
                            <IconButton onClick={() => setEditingLot(null)}>
                              <CancelIcon />
                            </IconButton>
                          </>
                        ) : isBulkEdit ? (<></>) : (
                          <IconButton
                            onClick={() => {
                              setEditingLot(lotNumber);
                              setReasonInput(row.reason || '');
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </>
                  )}

                  {type === 'excess' && (
                    <>
                      <TableCell>{lotNumber}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <>
                            <IconButton onClick={() => handleSaveExcess(lotNumber)}>
                              <CheckIcon />
                            </IconButton>
                            <IconButton onClick={() => setEditingLot(null)}>
                              <CancelIcon />
                            </IconButton>
                          </>
                        ) : isBulkEdit ? (<></>) : (
                          <IconButton
                            onClick={() => {
                              setEditingLot(lotNumber);
                              setEditExcessValues({
                                product_name: row.product_name || '',
                                category: row.category || '',
                                brand: row.brand || '',
                              });
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </>
                  )}

                  {type === 'scanned' && <TableCell>{lotNumber}</TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };




  const renderStep3 = () => (
    <Box display="flex" flexDirection="column" sx={{ flexGrow: 1, minHeight: 0 }}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Tabs value={tabValue} onChange={(e, v) => {setTabValue(v); setIsBulkEdit(false)}}>
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Scanned Stock
              <Chip label={scannedStock.length} size="small" color="success" />
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Excess Stock
              <Chip label={excessStock.length} size="small" color="warning" />
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Missing Stock
              <Chip label={missingStock.length} size="small" color="error" />
            </Box>
          } />
        </Tabs>

        {
          ((tabValue === 1 && excessStock.length > 0) || (tabValue === 2 && missingStock.length > 0)) &&
          (isBulkEdit ?
            <Box display='flex' gap={0.5}>
              <IconButton onClick={() => setIsBulkEdit(false)} color="success">
                <CheckIcon />
              </IconButton>
              <IconButton onClick={() => setIsBulkEdit(false)} color="error">
                <CancelIcon />
              </IconButton>
            </Box>
          :
            <Tooltip title='Bulk Edit'>
              <IconButton onClick={() => handleBulkEditClick()}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )
        }
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 2, mt: 1 }}>
        {tabValue === 0 && renderTable(scannedStock, 'scanned')}
        {tabValue === 1 && renderTable(excessStock, 'excess')}
        {tabValue === 2 && renderTable(missingStock, 'missing')}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setCurrentStep(2)}>
          Previous
        </Button>
        <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );

  const renderCheckboxList = (title, list, selected, onChange, searchValue, setSearchValue, onSelectAll) => {
    const filteredList = list.filter((item) =>
      item?.toLowerCase().includes(searchValue.toLowerCase())
    );
    const allSelected = filteredList.length > 0 && filteredList.every((item) => selected.includes(item));
    const someSelected = filteredList.some((item) => selected.includes(item)) && !allSelected;

    return (
      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: 0,
          bgcolor: '#fff',
        }}
      >
        <Box sx={{
          px: 2, py: 1.5,
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#F9FAFB',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
            {selected.length > 0 && (
              <Chip label={`${selected.length} selected`} size="small" color="primary" />
            )}
          </Box>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            sx={{ width: 200, bgcolor: '#fff', borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchValue && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchValue('')} edge="end">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ overflowY: 'auto', flexGrow: 1, px: 2, py: 1 }}>
          <FormGroup>
            {filteredList.length > 0 ? (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={() => onSelectAll(filteredList, allSelected)}
                    />
                  }
                  label={<Typography fontWeight={600}>Select All ({filteredList.length})</Typography>}
                  sx={{ borderBottom: '1px solid #f0f0f0', mb: 0.5, pb: 0.5 }}
                />
                {filteredList.map((item, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={selected.includes(item)}
                        onChange={() => onChange(item)}
                      />
                    }
                    label={item}
                    sx={{
                      py: 0.25,
                      '&:hover': { bgcolor: '#F9FAFB', borderRadius: 1 },
                    }}
                  />
                ))}
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No items available
                </Typography>
              </Box>
            )}
          </FormGroup>
        </Box>
      </Box>
    );
  };



  const SummaryCard = ({ label, value, color = 'primary' }) => (
    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: '#e0e0e0' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
      <Typography variant="h5" fontWeight={700} color={color}>
        {value}
      </Typography>
    </Card>
  );

  const renderStep2 = () => {
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const paginatedBarcodes = barcodeList.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return (
      <Box display="flex" flexDirection="column" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid container spacing={2} mb={2}>
          <Grid size={3}>
            <SummaryCard label="Total Lots Available" value={summary.totalLots} />
          </Grid>
          <Grid size={3}>
            <SummaryCard label="Categories Selected" value={summary.totalCategories} />
          </Grid>
          <Grid size={3}>
            <SummaryCard label="Brands Selected" value={summary.totalBrands} />
          </Grid>
          <Grid size={3}>
            <SummaryCard label="Models Selected" value={summary.totalModels} />
          </Grid>
        </Grid>

        <TextField
          size="small"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeKeyPress}
          placeholder="Scan or type barcode and press Enter"
          label="Enter Barcode / Lot Number"
          sx={{ mb: 2, width: '400px' }}
          error={!!barcodeInputError}
          helperText={barcodeInputError}
        />

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            backgroundColor: '#fff',
            position: 'relative',
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F9FAFB', width: 80 }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F9FAFB' }}>Barcode / Lot Number</TableCell>
                <TableCell sx={{ fontWeight: 600, backgroundColor: '#F9FAFB', textAlign: 'center', width: 100 }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedBarcodes.length > 0 &&
                paginatedBarcodes.map((lot, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{lot}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setBarcodeList((prev) =>
                            prev.filter((_, i) => i !== page * rowsPerPage + index)
                          )
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {paginatedBarcodes.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
              <Typography variant="body2">No barcodes added yet</Typography>
              <Typography variant="caption" color="text.disabled">Scan or type a barcode above and press Enter</Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
            pt: 1,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <TablePagination
            component="div"
            count={barcodeList.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[20, 50, 100]}
            sx={{ flex: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setCurrentStep(1)}>
              Previous
            </Button>
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNextFromStep2}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  const hasAnySelection = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedModels.length > 0;

  return (
    <Card sx={{ p: 3, height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Stock Reconciliate
        </Typography>
        <Stepper activeStep={currentStep - 1} sx={{ width: '50%' }}>
          {stepLabels.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {currentStep === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
          <Tabs
            value={step1Tab}
            onChange={(e, v) => setStep1Tab(v)}
            sx={{
              minHeight: 42,
              '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 600 },
            }}
          >
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Category
                {selectedCategories.length > 0 && <Chip label={selectedCategories.length} size="small" color="primary" />}
              </Box>
            } />
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Brand
                {selectedBrands.length > 0 && <Chip label={selectedBrands.length} size="small" color="primary" />}
              </Box>
            } />
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Model
                {selectedModels.length > 0 && <Chip label={selectedModels.length} size="small" color="primary" />}
              </Box>
            } />
          </Tabs>

          <Box sx={{ flexGrow: 1, mt: 1, minHeight: 0 }}>
            {step1Tab === 0 && renderCheckboxList('Select Categories', categoryList, selectedCategories, handleCategorySelection, categorySearch, setCategorySearch, handleSelectAllCategories)}
            {step1Tab === 1 && renderCheckboxList('Select Brands', brandList, selectedBrands, handleBrandSelection, brandSearch, setBrandSearch, handleSelectAllBrands)}
            {step1Tab === 2 && renderCheckboxList('Select Models', modelList, selectedModels, handleModelSelection, modelSearch, setModelSearch, handleSelectAllModels)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 2 }}>
            <Button variant="outlined" onClick={() => props.handleClose()}>
              Cancel
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNextFromStep1}
              disabled={!hasAnySelection}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
    </Card>
  );
}

export default NewStockReconcilateForm;
