import React, { useContext, useEffect } from 'react';
import DataGridTemp from 'components/dataGridTemp';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import moment from 'moment';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { useNavigate } from 'react-router-dom';
import { addretailcustomerinteractionaction, addretailServiceAction, clearEditDataAction, getretailServiceAction, getServicePaymentAction, updateretailServiceAction } from 'redux/actions/retail_service_action';
import context from '../../../context/CreateNewButtonContext'

export default function ServicePayment() {
  const navigate = useNavigate()
  const {
    commoncookie,
    setModalStatusHandler,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
  const yesterday = new Date();
  const { retailServiceReducer: { listRetailService, numRows, editdata,get_service_payment }, productReducer: { product }, attendanceReducer: { get_empbasecompany, searchCompanyBasedEmployeeFilter } } = useSelector((state) => state);
  console.log(listRetailService, editdata, 'retailreducer')
  yesterday.setDate(yesterday.getDate() - 1);

  const date = new Date();
  const defaultFrom = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const lastDayOfPreviousMonth = new Date(date.getFullYear(), date.getMonth(), 0);
  const defaultTo = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), lastDayOfPreviousMonth.getDate());
  const currentMonthFirstDate = new Date(date.getFullYear(), date.getMonth(), 1);

  const [filterDate, setFilterDate] = useState({
    from: defaultFrom,
    to: defaultTo
  });
  const [searchVal, setSearchVal] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [value1, setValue1] = React.useState([]);
  const isValidValue1 = value1.length > 0 && !value1.every(item => item === null);
  const [selectedRow, setSelectedRow] = useState(null);
  console.log(selectedRow, 'selerow')
  const dispatch = useDispatch();

  useEffect(() => {
    let data = {
      page: pageCount,
      per_page: pageSize
    }
    dispatch(getServicePaymentAction(data, setModalTypeHandler, setLoaderStatusHandler))

    
  }, [pageCount, pageSize])

  const columns = [
    { field: 'service_id', headerName: 'job ID', width: 190 },
    { field: 'full_name', headerName: 'Customer Name', width: 190 },
    { field: 'phone_number', headerName: 'Mobile Number', width: 190 },
    { field: 'payment_type', headerName: 'Payment Type', width: 190 },
    { field: 'total', headerName: 'Total Amount', width: 190 }
  ];

  const handlePageChange = async (page) => {
    setPageCount(page)
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: page,
      numPerPage: pageSize,
      searchString: searchVal
    }
  }

  const handlePageSizeChange = async (size) => {
    setPageSize(size)
    setPageCount(0)
    let payLoad = {
      fromDate: moment(filterDate.from, 'year', 'month', 'day').format('YYYY-MM-DD'),
      toDate: moment(filterDate.to, 'year', 'month', 'day').format('YYYY-MM-DD'),
      pageCount: size,
      numPerPage: pageSize,
      searchString: searchVal
    }
  };

  const dataWithId = get_service_payment.data?.length ? get_service_payment.data?.map((row, index) => ({ ...row, id: index })) : []
  console.log(dataWithId,'dataWithId',get_service_payment)
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Service </title>

      </Helmet>

      <DataGridTemp
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            '& .MuiDataGrid-columnHeader:last-of-type .MuiDataGrid-columnSeparator': {
              display: 'none !important'
            }
          }
        }}
        columns={columns}
        columnData={columns}
        exportData={true}
        data={dataWithId}
        pageSize={pageSize}
        pageType='task'
        page={pageCount}
        onPageChange={(page) => handlePageChange(page)}
        onPageSizeChange={(size) => handlePageSizeChange(size)}
        title={'Payment'}
        rowCount={numRows ?? 0}
      />
    </>

  );
};

