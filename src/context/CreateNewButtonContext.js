import { getsessionStorage } from 'pages/common/login/cookies';
import React from 'react';

let storage = getsessionStorage()

export default React.createContext({
  //   actionVisibleId: '',
  //   setActionVisibleId: () => {},
  //   rightSideComIsDragging: () => {},
  modalStatus: false,
  setModalStatusHandler: () => {},
  setModalTypeHandler: () => {},
  //   removeProjectHandler: () => {},
  //   removeProjectId: '',
  creatNewData: [],
  setcreatNewDataHandler: () => {},
  setLoaderStatusHandler: () => {},
  //   setOutsideCompDraggingHandler: () => {},
  //   setInsideCompDraggingHandler: () => {},
  //   isOutsideCompDragging: false,
  //   isInsideCompDragging: false,
  //   setDrawerdisableHandler: () => {},
  //   drawerDisable:false
  soDialogOpenStatus: false,
  setSoDialogOpenHandler: () => {},
  headerLocationId: 'null',
  commoncookie : storage?.employee_id || null,
  setHeaderLocationIdHandeler: () => {},
  editProductData : {},
  setEditProductDataHandler : () => {},
  editCustomertData : {},
  setEditPCustomerDataHandler : () => {}
});
