import React, { useEffect, useContext, useState } from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { ListForm12BB } from 'redux/actions/incometax_actions';
import NewForm12BB from './Newform12';
import { getStickyTableOptions } from 'utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';



const Form12BB = () => {

  const dispatch = useDispatch();
  const [editData, setEditData] = useState(null);
  const [edit , setEdit] = useState(false)
  const [newadd, newAdd] = useState(false)
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    selectData, setselectData
  } = useContext(CreateNewButtonContext);

  const handleEdit = (rowData) => {
    setEdit(true)
    setEditData(rowData);
    newAdd(true)
  };

  const {
    IncometaxReducers: { form12bb },rbacReducer: {menuAccess}

  } = useSelector((state) => state);
  const storage = getsessionStorage();
  const selectedRole = storage.role_name
  useEffect(() => {
    if (!selectedRole) return;
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
  }, [selectedRole, dispatch]);
  
    const form12create = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'tds__form12', 'can_create') : true;
    const form12Edit = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'tds__form12', 'can_edit') : true;

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(ListForm12BB())
    )

  }, [])
  const handleClose = (val) => {
    setEdit(false)
    newAdd(false)
    // apiCalls(
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   dispatch(ListForm12BB())
    // )
  }


  return (
    <>
      {newadd === false ?
        <MaterialTable
          title="Form12BB List"
          columns={[
            { title: 'Name', field: 'fullName' },
            {
              title: 'Financial Year',
              field: 'financial_year',
              render: (rowData) => `${rowData?.start_year} - ${rowData?.end_year}`
            },
            { title: 'HRA', field: 'hra_exemption', type: 'numeric', align: 'left' },
            { title: 'LTA', field: 'travel_amount', type: 'numeric', align: 'left' },
            { title: 'Deductions', field: 'total_deductions', type: 'numeric', align: 'left' }

          ]}
          data={form12bb?.length ? form12bb : []}
          actions={[
             form12create && {

              icon: 'add',
              tooltip: 'Add',
              isFreeAction: true,
              onClick: () =>
                newAdd(true)

            },
             form12Edit &&  {
              icon: 'edit',
              tooltip: 'Edit',
              onClick: (event, rowData) => handleEdit(rowData),
            }
          ]}

          options={getStickyTableOptions({
            headerStyle,
            bodyOffset:200,
            options:{
              cellStyle,
              exportButton: true,
              filtering: false,
              actionsColumnIndex: -1, // For actions in last column
              actionsCellStyle: {
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                padding: '4px 8px'
              },
              toolbar: true,
              paging: true,
              pageSize: pageSize,
              pageSizeOptions: [20, 50, 100],
              search: true,
              addRowPosition: 'first',
            }
          })}

        />
        :
        <NewForm12BB
          handleClose={handleClose}
          editData={editData}
          edit={edit}
        />
      }
    </>
  );
};
export default Form12BB;



