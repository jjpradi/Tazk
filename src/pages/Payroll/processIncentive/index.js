import MaterialTable from 'utils/SafeMaterialTable'
import React, { useContext, useEffect, useState } from 'react'
import ProcessingIncentive from './processIncentive';
import { useDispatch, useSelector } from 'react-redux';
import { getIncentiveMonthDataAction } from 'redux/actions/incentiveProcess_action';
import context from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';

function ProcessInsentive() {
 const dispatch = useDispatch();



  const [open, setOpen] = useState(false);
  useEffect(() => {
    dispatch(getIncentiveMonthDataAction())
   },[open])
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const handleClose = () => {
    setOpen(false)
  }

 

  const {
    incentiveReducer: { monthDetails }
  } = useSelector((state) => state);

console.log(monthDetails,'ddd');
  return (
    <div style={{ maxWidth: '100%' }}>
      {open === true ? (<ProcessingIncentive handleClose={handleClose} />) : (
        <MaterialTable
          columns={[
            { title: 'Emp id', field: 'employee_id' },
            { title: 'Emp Name', field: 'first_name', render: rowData => rowData.first_name + (rowData.last_name ? ' ' + rowData.last_name : '') },
            { title: 'Month', field: 'month' },
            { title: 'Year', field: 'year' }
          ]}
          data={monthDetails}
          title="Incentive Details"
          actions={[
            {
              icon: 'add',
              tooltip: 'Add User',
              isFreeAction: true,
              onClick: (event) => setOpen(true)
            }
          ]}
        />)}
    </div>
  )
}

export default ProcessInsentive



