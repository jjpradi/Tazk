import MaterialTable from 'utils/SafeMaterialTable';
import {Grid} from '@mui/material';
import React, {useEffect, useState} from 'react';
import Newpolicy from './Newpolicy';
import {useDispatch, useSelector} from 'react-redux';
import apiCalls from 'utils/apiCalls';
import {getPolicyList} from 'redux/actions/shifts.actions';

function PayrollPolicy() {
  const [isAddPolicyOpen, setAddPolicyOpen] = useState(false);

  const dispatch = useDispatch();
  const {
    ShiftsReducer: {policy_list},
  } = useSelector((state) => state);

  useEffect(() => {
    apiCalls(dispatch(getPolicyList()));
  }, []);
  console.log('TRRTR',policy_list)

  const handleOpenPolicy = () => {
    setAddPolicyOpen(true);
    console.log('isAddPolicyOpen', isAddPolicyOpen);
  };
 

  return (
    <>
      <Grid>
        {!isAddPolicyOpen ? (
          <MaterialTable
            actions={[
              {
                icon: 'add',
                tooltip: 'Add',
                isFreeAction: true,
                onClick: () => handleOpenPolicy(),
              },
            ]}
            columns={[
              {title: 'Name', field: 'first_name', render: rowData => rowData.first_name ? (rowData.first_name + (rowData.last_name && rowData.last_name.length > 0 ? ' ' + rowData.last_name : '')) : '-' ,cellStyle: {textTransform:"capitalize"}},
              {title: 'User Name', field: 'username'},
              {title: 'Leave count', field: 'leaveCount'},
              {title: 'Leave frequency', field: 'leaveFrequency',cellStyle: {textTransform:"capitalize"}},
            ]}
            data={policy_list}
            title='Policy'
          />
        ) : (
          <Newpolicy onBack={() => setAddPolicyOpen(false)} />
        )}
      </Grid>
    </>
  );
}

export default PayrollPolicy;

