import React, {useEffect, useState, useContext} from 'react';
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { InputAdornment, TextField, Typography } from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
  getShiftHistoryAction, get_searchHistoryReportAction, set_searchHistoryReportAction
} from '../../../redux/actions/shifts.actions';
import apiCalls from 'utils/apiCalls';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CommonSearch from 'utils/commonSearch';
import { commonDateFormat } from 'utils/getTimeFormat';

const HistoryReport = () => {
  const [searchData, setSearchData] = useState({page: 0,
    pageSize: 20,
    searchVal: '',
    searchPageData: []})
  const {commoncookie,setModalTypeHandler, setLoaderStatusHandler,headerLocationId,} = useContext(
    CreateNewButtonContext,
  );
  const dispatch = useDispatch();
  const {
    ShiftsReducer: {shiftHistory, searchHistoryReportData}
  } = useSelector((state) => state);

  useEffect(() => {
    dispatch(set_searchHistoryReportAction({data:[], numRows:0}));
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getShiftHistoryAction(setModalTypeHandler, setLoaderStatusHandler))
    );
  }, []);

  const requestSearch = (e) => {
    // const context = props.context;
    let val = e.target.value;
    setSearchData({...searchData, searchVal: val});

    // if(val.trim() !== ''){
      dispatch(set_searchHistoryReportAction({data:[], numRows:0}))
    // }
    const body = {
      searchString:val,
      employeeId:commoncookie,
      headerLocationId:headerLocationId
    }
    dispatch(get_searchHistoryReportAction(
        body,
        setModalTypeHandler,
        setLoaderStatusHandler
      )
    )
  };

  const cancelSearch = (e) => {
    setSearchData({...searchData, searchPageData: [], page: 0, searchVal: ''});
    dispatch(set_searchHistoryReportAction({data:[], numRows:0}))
  };

  return (
    <>
      <MaterialTable
       style={{height:'89vh',overflow:'auto'}}
        components={{
          Toolbar: (props) => (
            <>
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
                  searchVal={searchData.searchVal}
                  cancelSearch={cancelSearch}
                  requestSearch={requestSearch}
                />
                  {/* <TextField
                    autoFocus={searchData.searchVal ? true : false}
                    sx={{
                      borderRadius: '8px',
                      pr: '10px',
                      '& .MuiOutlinedInput-root': {
                        height: '42px',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <ClearIcon
                            onClick={cancelSearch}
                            sx={{cursor: 'pointer'}}
                          />
                        </InputAdornment>
                      ),
                    }}
                    placeholder='Search'
                    value={searchData.searchVal}
                    onChange={requestSearch}
                  /> */}
                </div>
                <div></div>
              </div>
            </>
          ),
        }}
        options={{
          headerStyle,
          cellStyle,
          search: false,
          exportButton: false,
          filtering: false,
          actionsColumnIndex: -1,
          maxBodyHeight: maxBodyHeight,
          pageSize: pageSize,
          pageSizeOptions: [20, 50, 100],
        }}
        columns={[
          {title: 'Id', field: 'id',
          render:(rowData) =>
          rowData.id ? rowData.id : '',},
          {title: 'Name', field: 'empName',
          render:(rowData) =>
          rowData.empName ? rowData.empName : '',
        },
          {
            title: 'Date',
            field: 'date',
            render: (r) => {
              if (r.date === '0000-00-00') {
                return ''; 
              }
             return  commonDateFormat(r.date)
            
            }
             
          },
          {title: 'Check In', field: 'checkIn',
          render:(rowData) =>
          rowData.checkIn ? rowData.checkIn : '',
        },
          {title: 'Check Out', field: 'checkOut',
          render:(rowData) =>
        rowData.checkOut ? rowData.checkOut : '',},
          {title: 'Break Time', field: 'breakTime',
          render:(rowData) =>
        rowData.breakTime ? rowData.breakTime : '',},
          {title: 'Shift Time', field: 'totalShiftTime',
          render:(rowData) =>
        rowData.totalShiftTime ? rowData.totalShiftTime : '',},
        ]}

        // data={shiftHistory}searchHistoryReportData

        data = {searchHistoryReportData?.length > 0 || searchData.searchVal ? searchHistoryReportData : shiftHistory}

        title={
          <Typography
            variant='h6'
            align='left'
            style={{paddingTop: '10px', paddingBottom: '10px'}}
          >
            History Report
          </Typography>
        }
      />
    </>
  );
};

export default HistoryReport;

