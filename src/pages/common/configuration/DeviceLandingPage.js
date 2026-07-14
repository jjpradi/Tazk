import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Autocomplete, Button, Card, Dialog, Grid, IconButton, TextField, Tooltip, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import CommonSearch from 'utils/commonSearch';
import { maxBodyHeight } from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import _, { capitalize } from 'lodash';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getRegisteredUsersAction } from 'redux/actions/attendance_actions';
import { BiometricAction, biometricRegistrationAction, getBioMetricAction, setBioMetricAction } from 'redux/actions/face_registration_action';



const DeviceLandingPage = ( props ) => {
  const { handleClose } = props;

        const dispatch = useDispatch()

        const { attendanceReducer: { getRegisteredUsers }} = useSelector((state) => state)

       const [paginateData,setPaginateData] = useState({
        pageSize : 5,
        pageCount : 0,
        searchRegistered: '',
        searchUnRegistered: ''
        })

        const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
            CreateNewButtonContext,
        );

      const [searchRegistered, setSearchRegistered] = useState('');
       const [searchUnRegistered, setSearchUnRegistered] = useState('');
 

      const columns = [
     
        {
          field: 'serial_number',
          title: 'Name'
        },
        {
          field: 'location_name',
          title: 'Code'
        },
        {
          field: 'port',
          title: 'Port'
        },
        
      ];

      const handlePageChange =(page)=>{
        setPaginateData({...paginateData,pageCount : page})
    }

        const handleSizeChange =(size)=>{
        setPaginateData({...paginateData,pageSize:size})
    }

      const cancelSearchRegistered = () => {
        setPaginateData({...paginateData, searchRegistered: ''});

        dispatch(
            getBioMetricAction({
                        data : [],
                        numRows: 0,
                    })
                )
                const payload ={
                    searchString : '',
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
                }
            dispatch(BiometricAction(payload))

      }

      const cancelSearchunRegistered = () => {
        setPaginateData({...paginateData, searchUnRegistered: ''});

        dispatch(
            getBioMetricAction({
                        data : [],
                        numRows: 0,
                    })
                )
                const payload ={
                    searchString : '',
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
                }
            dispatch(BiometricAction(payload))

      }

      const requestSearchRegistered = async(e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchRegistered: val});

        console.log(val,'asdasdaA')

        dispatch(
            getBioMetricAction({
                        data : []
                    })
                )

        const payload ={
                    searchString : paginateData.searchRegistered,
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
         }

        await  dispatch(setBioMetricAction(
                            payload,
                            setModalTypeHandler,
                            setLoaderStatusHandler
                        ))
      }

       const requestSearchunRegistered = async(e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchUnRegistered: val});

        console.log(val,'asdasdaA')

        dispatch(
            getBioMetricAction({
                        data : []
                    })
                )

        const payload ={
                    searchString : paginateData.searchUnRegistered,
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
         }

        await  dispatch(setBioMetricAction(
                            payload,
                            setModalTypeHandler,
                            setLoaderStatusHandler
                        ))
      }

            

      useEffect(()=>{
         const payload ={
                    searchString : paginateData.searchString,
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
         }
        dispatch(getRegisteredUsersAction(payload))
        
      },[dispatch,paginateData.pageSize,paginateData.pageCount])


  return (
    <div>
         <MaterialTable
            columns={columns}
            data={getRegisteredUsers.data}
            title={'Registered Contacts'}
            totalCount={getRegisteredUsers.numRows}
            options={{
              actionsColumnIndex: -1,
              filtering: false,
              search: false,
              paging: true,
              pageSize: paginateData.pageSize,
              pageSizeOptions: [5, 10, 20],
              maxBodyHeight: maxBodyHeight,
            }}
            page={paginateData.pageCount}
            onPageChange={(page) => {
              handlePageChange(page);
            }}
            onRowsPerPageChange={(size) => {
              handleSizeChange(size);
            }}
            components={{
              Toolbar: (props) => (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <div style={{width: '100%'}}>
                    <MTableToolbar {...props} />
                  </div>
                  <div>
                    <CommonSearch
                      searchVal={paginateData.searchRegistered}
                      cancelSearch={cancelSearchRegistered}
                      requestSearch={requestSearchRegistered}
                    />
                  </div>
                </div>
              ),
            }}
          />

          <MaterialTable
            columns={columns}
            data={getRegisteredUsers.data}
            title={'Un Registered Contacts'}
            totalCount={getRegisteredUsers.numRows}
            options={{
              actionsColumnIndex: -1,
              filtering: false,
              search: false,
              paging: true,
              pageSize: paginateData.pageSize,
              pageSizeOptions: [5, 10, 20],
              maxBodyHeight: maxBodyHeight,
            }}
            page={paginateData.pageCount}
            onPageChange={(page) => {
              handlePageChange(page);
            }}
            onRowsPerPageChange={(size) => {
              handleSizeChange(size);
            }}
            components={{
              Toolbar: (props) => (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <div style={{width: '100%'}}>
                    <MTableToolbar {...props} />
                  </div>
                  <div>
                    <CommonSearch
                      searchVal={paginateData.searchUnRegistered}
                      cancelSearch={cancelSearchunRegistered}
                      requestSearch={requestSearchunRegistered}
                    />
                  </div>
                </div>
              ),
            }}
          />
          <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 20,
        }}
      >
        <button
         onClick={handleClose} 
          style={{
            background: "#d32f2f",
            color: "white",
            border: "none",
            padding: "8px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Close
        </button>
      </div>

    </div>
  )
}

export default DeviceLandingPage
