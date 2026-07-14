import React, { useEffect, useState, useContext } from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {Card, Typography} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import { getretailServiceAction, getTargetDeliveryAction } from 'redux/actions/retail_service_action';
import { EDIT_RETAIL_SERVICE } from 'redux/actionTypes';
import { useNavigate } from 'react-router-dom';
import context from '../../../context/CreateNewButtonContext'
import moment from 'moment';


export default function StatusPriority({Tdata}) {
  const dispatch= useDispatch()
  const navigate = useNavigate()
  const { retailServiceReducer: { listRetailService, numRows, editdata }, AssetReducers: { deliveryDate } } = useSelector((state) => state);
  console.log(deliveryDate, editdata,'deliveryDate')

  const [openNew, setOpenNew] = useState(false)
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => {
  dispatch(getTargetDeliveryAction())
  }, [])

  const {
    commoncookie,
    setModalStatusHandler,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
  
  useEffect(() => {
    let data = {
      page: pageCount,
      per_page: pageSize
    }
    dispatch(getretailServiceAction(data, setModalTypeHandler, setLoaderStatusHandler))
  }, [pageCount, pageSize])

  const onRowClick = (row) => {
    console.log(row,navigate.name,'rowww')
    setOpenNew(true)
    dispatch({ type: EDIT_RETAIL_SERVICE, payload: row })
    navigate('/jobCard?type=edit')
  }

  const getProgressColor = (targetDelivery) => {
    const currentDate = new Date();
    const deliveryDate = new Date(targetDelivery);
    currentDate.setHours(0, 0, 0, 0);
    deliveryDate.setHours(0, 0, 0, 0);

    if (deliveryDate < currentDate) {
      return '#FF4560'; // Red
    }
  
    if (deliveryDate.getTime() === currentDate.getTime()) {
      return '#ff9800'; // Orange
    }
  
    const tomorrow = new Date();
    tomorrow.setDate(currentDate.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
  
    if (deliveryDate.getTime() === tomorrow.getTime()) {
      return '#ff9800'; // Orange
    }
    // #27d0b2
    return '#4caf50'; // Green
  };
  

  return (
    <>
        <div>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              showTitle: false,
              toolbar: false,
              pageSize: 5,
              exportButton: true,
              minBodyHeight: `calc(${maxBodyHeight} - 220px)`,
              maxBodyHeight: `calc(${maxBodyHeight} - 220px)`,
              exportMenu: [
                {
                  label: 'Export PDF',
                  exportFunc: (cols, datas) =>
                    ExportPdf(cols, datas, 'OrderSummary'),
                },
                {
                  label: 'Export CSV',
                  exportFunc: (cols, datas) =>
                    ExportCsv(cols, datas, 'OrderSummary'),
                },
              ],
            }}
            columns={[
              {title: 'Service Id',
               field: 'service_id',
               width:200 },
              {title: 'Customer Name',
               field: 'first_name',
               width:200 },
              {
                title: 'Status',
                field: 'status',
                width:200,
              },
              {
                title: 'Target Delivery',
                field: 'target_delivery',
                width: 200,
                render: rowData => moment(rowData.target_delivery).format('DD-MM-YYYY'),
              },
              {
                title: 'Progress',
                field: 'progress',
                render: (rowData) => (
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div
                      style={{
                        height: '8px',
                        width: '100%',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginRight: '8px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${rowData.progress}%`,
                          backgroundColor: getProgressColor(rowData.target_delivery),
                        }}
                      ></div>
                    </div>
                  </div>
                ),
              },
            ]}
            data={deliveryDate}
            onRowClick={(event, rowData) => onRowClick(rowData)}
          />
        </div>
    </>
  );
}

