import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import useMediaQuery from '@mui/material/useMediaQuery';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getCustomerErpDetails } from 'redux/actions/erpDetails_actions';
import { customerDetailByIdAction, customerSalesDetailAction, imageUpload } from 'redux/actions/customer_actions';
import apiCalls from 'utils/apiCalls';
import OverviewForAllCustType from './overview';

const CustomerGeneralInfo = () => {
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const matches = useMediaQuery('(min-width:600px)');

  const {
    customerReducer: { customer_paginate, customerDetailById },
    erpDetailsReducer: { customer_erp_details },
  } = useSelector((state) => state);

  const sessionCustomerId = storage?.customer_id || storage?.person_id;

  const [customerData, setcustomer] = useState('');
  const [customer_id, setCustomer_id] = useState(sessionCustomerId || '');
  const [index, setIndex] = useState(0);
  const [customerErpDetails, setCustomerErpDetails] = useState({});
  const [contactType, setContactType] = useState('Customer');
  const [srcImage, setSuppplierData] = useState({});
  const [isEnabled, setIsEnabled] = useState(false);
  const [image, setImage] = useState(null);

  const customer_data = customer_paginate || [];

  useEffect(() => {
    if (sessionCustomerId) {
      const type = 'Customer';
      setContactType(type);
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        storage?.company_type !== 5 && dispatch(getCustomerErpDetails(sessionCustomerId, type, setLoaderStatusHandler)),
        dispatch(customerSalesDetailAction(sessionCustomerId, commoncookie)),
        dispatch(customerDetailByIdAction(sessionCustomerId))
      );
    }
  }, [sessionCustomerId]);

  useEffect(() => {
    setCustomerErpDetails(customer_erp_details);
  }, [customer_erp_details]);

  useEffect(() => {
    if (customerDetailById?.length > 0) {
      setCustomer_id(customerDetailById[0].customer_id);
      setcustomer(customerDetailById[0]);
    }
  }, [customerDetailById]);

  const checkType = () => {
    let result = '';
    if (customer_data[index]?.customer_id || sessionCustomerId) {
      result = 'Customer';
    } else if (customer_data[index]?.supplier_id) {
      result = 'Supplier';
    } else if (!(customer_data[index]?.supplier_id) && !(customer_data[index]?.customer_id)) {
      result = 'Employee';
    }
    return result;
  };

  const func1 = async () => {
    const id = customer_data[index]?.customer_id
      || customer_data[index]?.supplier_id
      || sessionCustomerId;
    if (id) {
      const type = customer_data[index]?.customer_id || sessionCustomerId ? 'Customer' : 'Supplier';
      setContactType(type);
      setCustomerErpDetails({});
      await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        storage?.company_type !== 5 && id && dispatch(getCustomerErpDetails(id, type, setLoaderStatusHandler)),
        type === 'Customer' && dispatch(customerSalesDetailAction(id, commoncookie)),
        type === 'Customer' && dispatch(customerDetailByIdAction(id))
      );
      setCustomer_id(id);
      if (customer_data[index]) setcustomer(customer_data[index]);
    }
  };

  const handleBackButtonClick = () => {};

  const setEditfind = () => {};

  const rowPopupClose = () => {};

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/jpg': [],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Only image files allowed!');
        return;
      }
      var reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImage(dataUrl);
          setIsEnabled(true);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    },
  });

  const handleImage = () => {
    const type = checkType();
    const Id =
      type === 'Customer'
        ? customer_data[index]?.customer_id
        : type === 'Supplier'
        ? customer_data[index]?.supplier_id
        : customer_data[index]?.person_id;

    let data = {
      customer_id: Id,
      image: image,
      customer_type: type,
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        imageUpload(data, () => {
          setSuppplierData((prevState) => ({
            ...prevState,
            [Id]: image,
          }));
        })
      )
    );
    setIsEnabled(false);
  };

  return (
    <OverviewForAllCustType
      customerData={customerData}
      customerErpDetails={customerErpDetails}
      contactType={contactType}
      customer_data={customer_data}
      handleImage={handleImage}
      index={index}
      checkType={checkType}
      setEditfind={setEditfind}
      rowPopupClose={rowPopupClose}
      srcImage={srcImage}
      isEnabled={isEnabled}
      customerType={checkType() === 'Customer' ? 1 : checkType() === 'Supplier' ? 2 : 0}
      customer_id={customer_id}
      getInputProps={getInputProps}
      getRootProps={getRootProps}
      handleBackButtonClick={handleBackButtonClick}
      func1={func1}
      matches={matches}
    />
  );
};

export default CustomerGeneralInfo;

 