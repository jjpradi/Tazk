import React, {useState, useEffect, useRef, useContext} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { locationWiseCheckedInAction, locationWiseEarlyCheckOutAction, locationWiseLateCheckInAction, locationWiseNotCheckedInAction } from 'redux/actions/payrollDashboard_actions';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { formatDate12Hr, formatDate12Hr1 } from 'utils/pageSize';

export default function LocationWiseCommonTable({rowData, columnType}) {
  const [Tdata, setTdata] = useState([]);
  const tempinitsform = useRef(null);

  const {
    PayrolldashboardReducers: {locationWiseCheckedIn, locationWiseNotCheckedIn, locationWiseLateCheckIn, locationWiseEarlyCheckOut},
  } = useSelector((state) => state);

  const dispatch = useDispatch();
  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
  } = useContext(context);

  console.log('rowData1',locationWiseLateCheckIn)

  const initsform = () => {
    if(columnType === 'Present'){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(locationWiseCheckedInAction(rowData.location_id))
      )
    }
    else if(columnType === 'Absent'){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(locationWiseNotCheckedInAction(rowData.location_id))
      )
    }
    else if(columnType === 'LateCheckIn'){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(locationWiseLateCheckInAction(rowData.location_id))
      )
    }
    else{
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(locationWiseEarlyCheckOutAction(rowData.location_id))
      )
    }
  };

  tempinitsform.current = initsform;

  useEffect(() => {
    tempinitsform.current();
  }, []);

  return (
    <>
      <MaterialTable
        options={{
          headerStyle: {
            fontSize: 12
          },
          showTitle: false,
          paging: Tdata.length > 4 ? true : false,
          toolbar: false,
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
          exportButton: true,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) =>
                ExportPdf(cols, datas, 'InvoiceTable'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) =>
                ExportCsv(cols, datas, 'InvoiceTable'),
            },
          ],
        }}
        columns={
          columnType === 'Present' ?
          [
            {
              field: 'name',
              title: 'EmpName',
              render:(rowData) =>
              rowData.name ? rowData.name : '-',
            },
            {
              field: 'startDate',
              title: 'ClockIn',
              render:(rowData) =>
              rowData.startDate ? formatDate12Hr1(rowData.startDate) : '-',
            },
            {
              field: 'endDate',
              title: 'ClockOut',
              render:(rowData) =>
              rowData.endDate ? formatDate12Hr1(rowData.endDate) : '-',
            },
          ]
          :
          columnType === 'Absent' ?
          [
            {
              field: 'name',
              title: 'EmpName',
              render:(rowData) =>
              rowData.name ? rowData.name : '-',
              cellStyle: {textTransform:"capitalize"}
            },
            {
              field: 'status',
              title: 'Approved',
              render:(rowData) =>
              rowData.status ? rowData.status : '-',
              cellStyle: {textTransform:"capitalize"}
            },
          ]
          :
          [
            {
              field: 'name',
              title: 'EmpName',
              render:(rowData) =>
              rowData.name ? rowData.name : '-',
            },
            {
              field: 'startDate',
              title: 'ClockIn',
              render:(rowData) =>
              rowData.startDate ? formatDate12Hr1(rowData.startDate) : '-',
            },
            {
              field: 'endDate',
              title: 'ClockOut',
              render:(rowData) =>
              rowData.endDate ? formatDate12Hr1(rowData.endDate) : '-',
            },
            {
              field: 'status',
              title: 'Approved',
              render:(rowData) =>
              rowData.status ? rowData.status : '-',
            },
          ]
        }
        data={columnType === 'Present' ? locationWiseCheckedIn : columnType === 'Absent' ? locationWiseNotCheckedIn : columnType === 'LateCheckIn' ? locationWiseLateCheckIn : locationWiseEarlyCheckOut}
      />
    </>
  );
}

