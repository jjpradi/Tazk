import React, {useContext, useEffect, useState} from 'react';
import {TextField, Button, Grid} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import {connect, useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  getMatchedReconciliationAction,
  addBankReconciliationTableAction,
} from 'redux/actions/bankCreation_actions';
import MaterialTable from 'utils/SafeMaterialTable';
import * as XLSX from 'xlsx-js-style';
import {getConvertedDate} from 'components/common';
import moment from 'moment';
import _ from 'lodash';
import { 
    listBankReconciliation } from 'redux/actions/bankCreation_actions';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight } from 'utils/pageSize';

export default function UnmatchEntries(props) {
const [viewData, setViewData] = useState({})
const {
    bankCreationReducer: { bank_reconciliation},
  } = useSelector((state) => state);
  const dispatch = useDispatch();
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(
    CreateNewButtonContext,
  );
 
 useEffect(()=>{
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
        listBankReconciliation(
          props.bankId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      )
  );

 },[])

  return (
    <>
      <Grid
        container
        // display='flex'
        // flexDirection='row'
        // justifyContent='center'
        // spacing={3}
        paddingBottom='20px'
      >
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 12,
            xs: 12
          }}>
          {/* <Typography variant='h6'>Un Matched Entries </Typography> */}
        </Grid>
 
 

      <Grid container spacing={3}>
        <Grid
          xx={12}
          size={{
            lg: 12,
            md: 12,
            sm: 12
          }}>
          <MaterialTable
            // actions={[
            //   {
            //     icon: () => (
            //       <div style={{display: 'flex'}}>
            //         <Button variant='outlined'>Select</Button>
            //       </div>
            //     ),
            //     onClick: (event, rowData) => {
            //       setSelecedRow(rowData);
            //     },
            //     tooltip: 'Match',
            //     isFreeAction: false,
            //   },
            // ]}
         
            options={{
              search: false,
              exportButton: true,
            
              filtering: false,
              actionsColumnIndex: -1,
              maxBodyHeight: maxBodyHeight,
              pageSize:20,
              pageSizeOptions: [20, 50, 100],
        
            }}
            columns={[
              {
                title: 'Date',
                field: 'date',
                type: 'date',
                dateSetting: {locale: 'en-GB', format: 'DD/MM/yyyy'},
              },
            //   {title: 'Detail', field: 'description'},
            //   {title: 'Mode', field: 'sale_time'},
              {title: 'Mode', field: 'payment_type'},
              {title: 'Withdrawal', field: 'withdrawal',cellStyle: { textAlign: 'right',paddingRight: '40px' }},
              {title: 'Deposit', field: 'deposit',cellStyle: { textAlign: 'right',paddingRight: '50px' }},
              {title:'Reference Number', field:'reference'},
              {title:'Cheque Date', field:'chequeDate'},
              {title:'Cheque Number', field:'chequeNumber'},
            ]}
            title={'Un Matched Transactions'}
            data={bank_reconciliation}
          />
        </Grid>
        <Grid
          display='flex'
          justifyContent='flex-start'
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 6
          }}>
          {/* {match === true ? (
            <Typography>Matched</Typography>
          ) : (
            <Typography>Unmatched</Typography>
          )} */}
          <Typography> </Typography>
        </Grid>
        <Grid
          display='flex'
          justifyContent='flex-end'
          gap={5}
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 6
          }}>
          <Button
            variant='outlined'
            onClick={() => {
              props.setViewOpen(false);
            }}
          >
            Close
          </Button>
          {/* <Button
            variant='contained'
            // disabled={
            //   !computedBankReconciliation.every((item) => item.isMatched === 1)
            // }
            onClick={() => {
              // handleSave();
            }}
          >
            Save
          </Button> */}
        </Grid>
      </Grid>
      </Grid>
    </>
  );
}

