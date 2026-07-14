import React, { useContext, useEffect, useState , useRef } from 'react'
import { Card, Grid, IconButton, Tooltip } from '@mui/material'
import MaterialTable from 'utils/SafeMaterialTable'
import { useDispatch, useSelector } from 'react-redux';
import { approveSalesApprovalRequest, listSalesManApprovalReq, rejectSalesApprovalRequest } from 'redux/actions/salesMan_action';
import { getsessionStorage } from 'pages/common/login/cookies';
import apiCalls from 'utils/apiCalls';
import context from '../../../context/CreateNewButtonContext'
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import notificationType from 'firebase/notify_type';
import { sendNtfy } from 'firebase/firebase.service';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import { getTokenByEmpId } from 'redux/actions/userRole_actions';
import { CreateNotificationAction } from 'redux/actions/notification_actions';
import { roleType } from 'utils/roleType';
import { headerStyle, cellStyle } from 'utils/pageSize';

export default function ApprovalRequests() {

  const dispatch = useDispatch();
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler, } = useContext(context);

  const {
    salesManReducer: { salesApprovalRequest },
  } = useSelector((state) => state);

  const [empId, setEmpId] = useState(null)

  const storage = getsessionStorage()

  const empIIDD = useRef(null);


  const shop_id = roleType.includes(storage.role_name) ? 1 : 'null';
  const employee_id = storage.employee_id

  console.log('dfsdf', storage);
  // useEffect(() => {
  //     dispatch(listSalesManApprovalReq(shop_id,employee_id));
  // }, [])

  // dispatch(listSalesManApprovalReq(shop_id,employee_id));
  useEffect(() => {

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listSalesManApprovalReq(shop_id, employee_id)),
    );
  }, []);

  const approveResponse = () => {
    console.log('DDDS' , empIIDD.current);
    let storage = getsessionStorage();
    let emp_id = empIIDD.current || '';
    dispatch(
      getTokenByEmpId(emp_id, (token, content) => {
        let notify_type = notificationType('Sale Approval Accepted');
        let notify_content = content?.filter(
          (m) => m.notification_type === notify_type,
        );
        if (notify_content.length) {
          let content_body = notify_content[0].body_msg;
          sendNtfy(token, notify_content[0]?.title, content_body);
          dispatch(
            CreateNotificationAction({
              content_body: content_body,
              title: notify_content[0]?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',
              receiver : emp_id
            }),
          );
        }
      }),
    );
  };
  const rejectResponse = () => {
    console.log('DDDS' , empIIDD.current);
    // let storage = getsessionStorage();
    let emp_id = empIIDD.current || '';
    dispatch(
      getTokenByEmpId(emp_id, (token, content) => {
        let notify_type = notificationType('Sale Approval Rejected');
        let notify_content = content?.filter(
          (m) => m.notification_type === notify_type,
        );
        if (notify_content.length) {
          let content_body = notify_content[0].body_msg;
          sendNtfy(token, notify_content[0]?.title, content_body);
          dispatch(
            CreateNotificationAction({
              content_body: content_body,
              title: notify_content[0]?.title,
              time: getDateTimeFormat(new Date()),
              active: '1',
              receiver : emp_id
            }),
          );
        }
      }),
    );
  };

  useEffect(() => {
  console.log('CCVCVD' , empId);
  },[empId])

  const handleApproveRequest = (data) => {
    empIIDD.current = data.employee_id

    const body = {
      employee_id: data.employee_id,
      customer_id: data.customer_id,
      id: data.id,
      shop_id: shop_id
    }
    console.log('sdadssad', body);
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(approveSalesApprovalRequest(body, approveResponse)),
    );


    console.log('DFSFF', data);
  }


  const handleRejectRequest = (data) => {
    empIIDD.current = data.employee_id

    const body = {
      employee_id: data.employee_id,
      customer_id: data.customer_id,
      id: data.id,
      shop_id: shop_id
    }

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(rejectSalesApprovalRequest(body , rejectResponse)),
    );


    console.log('DFSFF', data);
  }
  return (

    <Card style={{ minHeight: '100%' }}>
      <MaterialTable
        style={{ height: '100%' }}
        options={{
          paging: false,
          actionsColumnIndex: -1,
          headerStyle,
          cellStyle,
        }}
        actions={[
          (rowData) => ({
            icon: () => (
              <DownloadDoneIcon
                fontSize='small'
              />
            ),
            tooltip: 'Approve',
            //   disabled :rowData.status === 'Pending',
            onClick: (event, rowData) => handleApproveRequest(rowData)}),
          (rowData) => ({
            icon: () => (
              <CancelIcon
                fontSize='small'
              />
            ),
            tooltip: 'Reject',
            //   disabled :rowData.status === 'Pending',
            onClick: (event, rowData) => handleRejectRequest(rowData)
          }),
        ]}
        columns={[
          { title: 'Shop name', field: 'shop_name' },
          { title: 'Credit Value', field: 'credit_value', align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' } },
          { title: 'Outstanding', field: 'outstanding', align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' } },
          { title: 'reason', field: 'reason' },
          { title: 'Sales value', field: 'sales_order_value', align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px' } },
          { title: 'Status', field: 'status' },

        ]}
        data={salesApprovalRequest}
        title={"Approval Request"}
      />
    </Card>
  )
}

