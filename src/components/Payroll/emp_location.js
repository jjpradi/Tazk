import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {Button, Card, Grid, InputAdornment, TextField, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getEmpLocationAction,
  updateLocationStatusAction,
  getEmpLocationActiveAction
} from 'redux/actions/payrollDashboard_actions';
import context from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import useCommonRef from 'pages/common/home/useCommonRef';
import { getsessionStorage } from 'pages/common/login/cookies';


function Emp_location(props) {
  const dispatch = useDispatch();
  const {
    setLoaderStatusHandler,
    setModalTypeHandler
  } = useContext(context);


  const {
    PayrolldashboardReducers: {getEmpLocationpModel, getActiveLocation},
  } = useSelector((state) => state);

  const storage = getsessionStorage();
  let emp_id = storage?.employee_id || '';

  const id = props?.customerData?.employee_id
  console.log(id,props.customerData,'jh');

    const [columns, setColumns] = useState([
      {
        field: 'location_name',
        title: 'location Name'
      },
      {
        field: 'lattitude',
        title: 'Latitude'
      },
      {
        field: 'longitude',
        title: 'Longitude'
      },
      ...(props.type !== 'edit' ? [{
        field: 'status',
        title: 'Status'
      }] : [])
      ])
      

      // const [empLocations, setEmpLocations] = useState(getEmpLocationpModel)

    useEffect(() => {
        if(id){
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getEmpLocationAction(id)),
            props?.type === 'edit' && dispatch(getEmpLocationActiveAction(id))
        )
        }
        
    }, [id,props.status, props?.type ])

    useEffect(() => {
      
      if(props.type === 'edit'){
        setColumns([...columns, {
          field: 'actions',
          title: 'Actions',
          render: (rowData) => {
            return (
              <>
                <Grid container spacing={5}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 5,
                      sm: 5,
                      xs: 12
                    }}>
                    <Button
                      size="small"
                      color='primary'
                      variant="outlined"
                      onClick={() => openInMaps(rowData.lattitude, rowData.longitude)}
                    >Open in Maps</Button>
                  </Grid>

                    <Grid
                      size={{
                        lg: 5,
                        md: 5,
                        sm: 5,
                        xs: 12
                      }}>
                    <Button
                      size="small"
                      color='error'
                      variant="outlined"
                      onClick={() => onInActive(rowData.id, rowData.employee_id)}
                    >InActive</Button>
                  </Grid>
                
                </Grid>
              </>
            );
          }
        }])
      }
    }, [props.type])

    const openInMaps = (lat, long) => {
      console.log("LatLong", lat, long)
      const url = `https://www.google.com/maps?q=${lat},${long}`;
      window.open(url, '_blank')
    }

    const onInActive = (location_id, empId) => {
      // console.log("rowData.employee_id",empId)
      dispatch(updateLocationStatusAction(location_id))
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getEmpLocationAction(empId)),
        props?.type === 'edit' && dispatch(getEmpLocationActiveAction(empId))
    )
    }

  return (
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    sx={{width: '100%', height:'100%', overflow:'auto'}}>
      
    <MaterialTable
        style={{ height: '115%' }}
        //totalCount={employeeCheckinOutDetails?.count}
      components={{
        Toolbar: (props) => (
          <>
            <div style={{display: 'flex', width: '100%', alignItems: 'center'}}>
              <div style={{width: '100%'}}>
                <MTableToolbar {...props} />
              </div>
            </div>
          </>
        ),
      }}
      columns={columns}
      data={props?.type === 'edit' ? getActiveLocation : getEmpLocationpModel}
      title={ 
        <Typography
          variant='h6'
          align='left'
          style={{paddingTop: '10px', paddingBottom: '10px'}}
        >
          WorkFromHome Location
        </Typography>
      }
    />
    </Card>
  );
}
export default useCommonRef(Emp_location);

