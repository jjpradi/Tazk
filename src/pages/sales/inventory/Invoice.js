import React, {useState, useEffect, useRef, useContext} from 'react';
import {Grid, Typography} from '@mui/material';
import './styles.css';
import {useSelector, useDispatch} from 'react-redux';
import {getAppConfigDataAction} from '../../../redux/actions/app_config_actions';
import apiCalls from 'utils/apiCalls';
import context from '../../../context/CreateNewButtonContext';


export default function App({
  custData,
  invoice,
  soDate,
  sales_items,
  custType,
  sourcelocation,
  destinationlocation,
  ponumber,
  transfer,
}) {
  const [uniqueData, setuniqueData] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [companyEmail, setEmail] = useState('');
  const dispatch = useDispatch();
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);
  
  const tempinitsform = useRef(null);
  const {
    appConfigReducer: {app_config_data},
  } = useSelector((state) => state);

  const taxes = () => {
    let total = 0;
    for (let data of sales_items) {
      let arr = [];
      if (data.item_unit_price && data.item_unit_price > 0) {
        arr.push(data.item_unit_price);
      }
      else {
        arr.push(data.trans_items_cost_price)
      }
      if (data.quantity) {
        arr.push(data.quantity);
      } else {
        arr.push(1);
      }
      if (data.taxes) {
        data.taxes.forEach((t) => {
          if (t.tax_group === 'IGST') {
            arr.push(t.tax_rate);
          }
        });
      }
      total += ((arr[0] * arr[1]) / 100) * arr[2];
    }
    return total ? total : 0;
  };

  const totalCost = () => {
    let total = 0;
    let price = 0
    sales_items.forEach((d) => {
      price = (!d.item_unit_price || d.item_unit_price === 0) ? d.trans_items_cost_price : d.item_unit_price
      total += (d.quantity || 1) * price;
    });
    return total;
  };

  const withoutTax = (qty, cost, d) => {
    const val = (qty || 1) * cost;
    return val;
  };

  const totalQuantity = () => {
    let total = 0;
    sales_items.forEach((d) => {
      total += +d.quantity;
    });
    return total;
  };

  const groupTaxes = (tax_rate, tax_category) => {
    let total = 0;
    for (let data of sales_items) {
      let arr = [];
      let arr1 = [];
      if (data.taxes[0]?.tax_category === tax_category) {
        for (let d in data) {
          if (['item_unit_price', 'quantity'].includes(d)) {
            arr.push(Number(data[d]));
          }
        }
        if(arr[0] == 0 ){
          for (let d in data) {
            if (['trans_items_cost_price', 'quantity'].includes(d)) {
              arr1.push(Number(data[d]));
            }
          }
          total += ((arr1[0] * arr1[1]) / 100) * tax_rate;
        }else{
        total += ((arr[0] * arr[1]) / 100) * tax_rate;
        }
      }
    }
    return total ? total.toFixed(2) : 0;
  };

  useEffect(() => {
    const getData = sales_items.map((d) => d.taxes || []);
    const uniqueAddresses = Array.from(
      new Set(getData.map((a) => a[0]?.tax_category)),
    ).map((name) => {
      return getData.find((a) => a[0]?.tax_category === name);
    });
    setuniqueData(uniqueAddresses);
  }, [sales_items]);

  const getIgst = (data) => {
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

  const initsform = () => {
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(getAppConfigDataAction())
    );
  };
  tempinitsform.current = initsform;
  
  useEffect(() => {
    tempinitsform.current();
  }, []);

  useEffect(() => {
    const companyName = app_config_data.filter((f) => f.key_name === 'company.name');
    const fullAddress = app_config_data.filter(
      (f) => f.key_name === 'address.fulladdress',
    );
    const emailData = app_config_data.filter((f) => f.key_name === 'company.email');

    setCompanyName(companyName.length > 0 ? companyName[0].value : '');
    setFullAddress(fullAddress.length > 0 ? fullAddress[0].value : '');
    setEmail(emailData.length > 0 ? emailData[0].value : '');
  }, [app_config_data]);

  return (
    <Grid>
      <Typography style={{width: '21cm', marginTop: 0}} className='t_center'>
        Delivery Note
      </Typography>
      <div style={{width: '21cm', display: 'flex'}}>
        <div
          style={{
            border: '1px solid black',
            width: '100%',
            height: '100%',
            margin: 'auto',
          }}
        >
          <Grid container spacing={0}>
            {/* Header Section */}
            <Grid style={{marginBottom: 5}} size={7}>
              <div style={{paddingLeft: 8, paddingTop: 8, paddingBottom: 8}}>
                <Typography className='p' style={{fontWeight: 'bold', marginBottom: 4}}>{companyName}</Typography>
                <Typography className='p' style={{fontSize: '0.85rem'}}>{fullAddress}</Typography>
                <Typography className='p' style={{fontSize: '0.85rem'}}>{companyEmail}</Typography>
              </div>
            </Grid>
            
            {/* Right Header Info */}
            <Grid style={{borderLeft: '1px solid black'}} size={5}>
              <Grid container spacing={0}>
                <Grid size={12}>
                  <div className='invoice' style={{borderBottom: '1px solid black', padding: 8, minHeight: '40px'}}>
                    <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Delivery Challan Number</Typography>
                    <Typography className='p' style={{fontSize: '0.9rem'}}>{ponumber}</Typography>
                  </div>
                  <div className='invoice' style={{borderBottom: '1px solid black', padding: 8, minHeight: '40px'}}>
                    <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Source Location</Typography>
                    <Typography className='p' style={{fontSize: '0.9rem'}}>{sourcelocation?.location_name}</Typography>
                  </div>
                  <div className='invoice' style={{padding: 8, minHeight: '40px'}}>
                    <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Destination Location</Typography>
                    <Typography className='p' style={{fontSize: '0.9rem'}}>{destinationlocation?.location_name}</Typography>
                  </div>
                </Grid>
              </Grid>
            </Grid>

            {/* Table Header */}
            <Grid size={7}>
              <div style={{display: 'flex', borderTop: '1px solid black', borderBottom: '1px solid black', height: 35}}>
                <div style={{width: '8%', borderRight: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Sl No.</Typography>
                </div>
                <div style={{width: '92%', display: 'flex', alignItems: 'center', paddingLeft: 8}}>
                  <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Description of Goods</Typography>
                </div>
              </div>
            </Grid>

            <Grid size={5}>
              <Grid container spacing={0}>
                <Grid style={{borderTop: '1px solid black', borderBottom: '1px solid black', borderLeft: '1px solid black'}} size={12}>
                  <Grid container spacing={0}>
                    <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={3}>
                      <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>HSN/SAC</Typography>
                    </Grid>
                    <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={3}>
                      <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Qty</Typography>
                    </Grid>
                    <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={2}>
                      <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Rate</Typography>
                    </Grid>
                    <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={1}>
                      <Typography className='p' style={{fontSize: '0.75rem', fontWeight: 'bold'}}>per</Typography>
                    </Grid>
                    <Grid style={{padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                      <Typography className='p' style={{fontSize: '0.85rem', fontWeight: 'bold'}}>Amount</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Items */}
            <Grid size={12}>
              <Grid container spacing={0}>
                {sales_items.map((d, i) => (
                  <Grid key={i} size={12} style={{borderBottom: '1px solid black'}}>
                    <Grid container spacing={0}>
                      <Grid style={{borderRight: '1px solid black'}} size={7}>
                        <Grid container spacing={0}>
                          <Grid style={{borderRight: '1px solid black', width: '8%', padding: 8, display: 'flex', alignItems: 'flex-start', justifyContent: 'center'}}>
                            <Typography className='p' style={{fontSize: '0.9rem'}}>{i + 1}</Typography>
                          </Grid>
                          <Grid style={{width: '92%', padding: 8, display: 'flex', alignItems: 'flex-start'}}>
                            <Typography className='p' style={{fontSize: '0.9rem'}}>{d.name}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid style={{borderLeft: '1px solid black'}} size={5}>
                        <Grid container spacing={0}>
                          <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={3}>
                            <Typography className='p' style={{fontSize: '0.9rem'}}>{d.hsn_code}</Typography>
                          </Grid>
                          <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                            <Typography className='p' style={{fontSize: '0.9rem'}}>{`${d.quantity} ${d?.unit_name?.toUpperCase() || 'NOS'}`}</Typography>
                          </Grid>
                          <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={2}>
                            <Typography className='p' style={{fontSize: '0.9rem'}}>
                              {((!d.item_unit_price || d.item_unit_price === 0) ? d.trans_items_cost_price : d.item_unit_price).toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={1}>
                            <Typography className='p' style={{fontSize: '0.75rem'}}>{d?.unit_name?.toUpperCase() || 'NOS'}</Typography>
                          </Grid>
                          <Grid style={{padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                            <Typography className='p' style={{fontSize: '0.9rem'}}>
                              {withoutTax(d.quantity, (!d.item_unit_price || d.item_unit_price === 0) ? d.trans_items_cost_price : d.item_unit_price).toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Tax Rows */}
            {uniqueData.map((d, idx) => (
              <Grid key={idx} size={12} style={{borderBottom: '1px solid black'}}>
                <Grid container spacing={0}>
                  <Grid style={{borderRight: '1px solid black'}} size={7}>
                    <div style={{padding: 8, display: 'flex', justifyContent: 'flex-end'}}>
                      <Typography className='p' style={{fontSize: '0.9rem'}}>
                        {`Output CGST ${getIgst({taxes: d}) / 2}%`}
                      </Typography>
                    </div>
                    <div style={{padding: 8, paddingTop: 0, display: 'flex', justifyContent: 'flex-end'}}>
                      <Typography className='p' style={{fontSize: '0.9rem'}}>
                        {`Output SGST ${getIgst({taxes: d}) / 2}%`}
                      </Typography>
                    </div>
                  </Grid>
                  <Grid style={{borderLeft: '1px solid black'}} size={5}>
                    <Grid container spacing={0}>
                      <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={3}>
                      </Grid>
                      <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                      </Grid>
                      <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={2}>
                        <div>
                          <Typography className='p' style={{fontSize: '0.9rem'}}>
                            {getIgst({taxes: d}) / 2}
                          </Typography>
                          <Typography className='p' style={{fontSize: '0.9rem'}}>
                            {getIgst({taxes: d}) / 2}
                          </Typography>
                        </div>
                      </Grid>
                      <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={1}>
                        <div>
                          <Typography className='p' style={{fontSize: '0.75rem'}}>%</Typography>
                          <Typography className='p' style={{fontSize: '0.75rem'}}>%</Typography>
                        </div>
                      </Grid>
                      <Grid style={{padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                        <div>
                          <Typography className='p' style={{fontSize: '0.9rem'}}>
                            {groupTaxes(getIgst({taxes: d}) / 2, d[0]?.tax_category)}
                          </Typography>
                          <Typography className='p' style={{fontSize: '0.9rem'}}>
                            {groupTaxes(getIgst({taxes: d}) / 2, d[0]?.tax_category)}
                          </Typography>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            ))}

            {/* Round Off Row */}
            <Grid size={12} style={{borderBottom: '1px solid black'}}>
              <Grid container spacing={0}>
                <Grid style={{borderRight: '1px solid black'}} size={7}>
                  <div style={{padding: 8, display: 'flex', justifyContent: 'flex-end'}}>
                    <Typography className='p' style={{fontSize: '0.9rem', fontWeight: '500'}}>Round Off</Typography>
                  </div>
                </Grid>
                <Grid style={{borderLeft: '1px solid black'}} size={5}>
                  <Grid container spacing={0}>
                    <Grid style={{borderRight: '1px solid black'}} size={3}></Grid>
                    <Grid style={{borderRight: '1px solid black'}} size={3}></Grid>
                    <Grid style={{borderRight: '1px solid black'}} size={2}></Grid>
                    <Grid style={{borderRight: '1px solid black'}} size={1}></Grid>
                    <Grid style={{padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                      <Typography className='p' style={{fontSize: '0.9rem'}}>0.00</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Total Row */}
            <Grid size={12} style={{borderTop: '1px solid black'}}>
              <Grid container spacing={0}>
                <Grid style={{borderRight: '1px solid black'}} size={7}>
                  <div style={{padding: 8, display: 'flex', justifyContent: 'flex-end'}}>
                    <Typography className='p' style={{fontSize: '0.95rem', fontWeight: 'bold'}}>Total</Typography>
                  </div>
                </Grid>
                <Grid style={{borderLeft: '1px solid black'}} size={5}>
                  <Grid container spacing={0}>
                    <Grid style={{borderRight: '1px solid black'}} size={3}></Grid>
                    <Grid style={{borderRight: '1px solid black', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                      <Typography className='p' style={{fontSize: '0.95rem', fontWeight: 'bold'}}>{totalQuantity()}</Typography>
                    </Grid>
                    <Grid style={{borderRight: '1px solid black'}} size={2}></Grid>
                    <Grid style={{borderRight: '1px solid black'}} size={1}></Grid>
                    <Grid style={{padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}} size={3}>
                      <Typography className='p' style={{fontSize: '0.95rem', fontWeight: 'bold'}}>
                        ₹ {(totalCost() + taxes()).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    </Grid>
  );
}
