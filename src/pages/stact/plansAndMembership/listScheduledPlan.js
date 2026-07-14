import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import { Button, Grid, IconButton, Typography } from '@mui/material'
import { titleURL } from 'http-common'
import React, { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize'
import SchedulePlans from './schedulePlan'
import { useDispatch, useSelector } from 'react-redux'
import { getAllPlansAction, getAllSchedulePlanAction, getSearchScheduledPlansAction, setSearchScheduledPlansAction } from 'redux/actions/clientSubscription_action'
import moment from 'moment'
import EditIcon from '@mui/icons-material/Edit';
import CommonSearch from 'utils/commonSearch'
import context from 'context/CreateNewButtonContext'

const ListSchedulePlan = () => {
  const dispatch = useDispatch();

    const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setModalTypeHandler,
    commoncookie,
  } = useContext(context);

    const {
    ClientSubscriptionReducer: { getAllSchedulePlan }
  } = useSelector((state) => state);

  const [ open, setOpen ] = useState(false);
  const [ edit_id_data, setEdit_id_data ] = useState([])
  const [ status, setStatus ] = useState('create')
  const [searchVal, setSearchVal] = useState('');
  const [filteredData, setFilteredData] = useState([]); 
  const [searchData, setSearchData] = useState({searchVal: ''})

   useEffect(() => {
       const data = {
          searchString: searchVal
        }
      dispatch(getAllSchedulePlanAction(data));
    }, [dispatch]);

    const handlePageChange = async (page) => {
      setSearchData({...searchData});
      }
    
      const handlePageSizeChange = async (size) => {
        setSearchData({...searchData});
      };

      const handleOpen = () => {
        setOpen(true);
        setStatus('create');
        setEdit_id_data({})
      };

      const handleClose = () => {
        setOpen(false);
        setStatus('create');
        setEdit_id_data({})
      };

      const handleEdit = (rowData) => {
        setEdit_id_data(rowData);
        setStatus('edit');
        setOpen(true);
      };

      const requestSearch = (e) => {
        let val = e.target.value
        setSearchVal(val)
        let searchKeywords = val
    
        const searchSplit = searchKeywords.trim().split(/\s+/);
    
        const matchedRecords = getAllSchedulePlan.filter((record) => {
          const recordValues = flattenObjectValues(record).join(" ").toLowerCase();
    
          const allKeywordsPresent = searchSplit.every((keyword) =>
            recordValues.includes(keyword.toLowerCase())
          );
    
          return allKeywordsPresent;
        });
    
        setFilteredData(matchedRecords)
      };
    
      const flattenObjectValues = (obj) => {
        const values = [];
    
        function flatten(value) {
          if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(flatten);
            } else {
              Object.values(value).forEach(flatten);
            }
          } else if (value !== null && value !== undefined) {
            let val = value.toString();
            values.push(val);
          }
        }
    
        flatten(obj);
        return values;
      };
    
      const cancelSearch = (e) => {
        setSearchVal('')
        setFilteredData(getAllSchedulePlan);
      };

  return (
    <React.Fragment>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Scheduled Plan List </title>
      </Helmet>
      {open && (
        <SchedulePlans
          handleClose={handleClose}
          edit_id_data={status === 'create' ? {} : edit_id_data}
          status={Object.keys(edit_id_data || {}).length > 0 ? "edit" : "create"}
          setStatus={setStatus}
        />
      )}
      {open === false && (
          <>
          <MaterialTable
                      title={<Typography className='page-title'>Scheduled Plan List</Typography>}
                      components={{
                        Toolbar: (props) => (
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ width: '100%' }}>
                                <MTableToolbar {...props} />
                              </div>
                              <div>
                                <Grid
                                  display='flex'
                                  justifyContent='flex-end'
                                  alignItems='center'
                                  size={{
                                    lg: 4,
                                    md: 4,
                                    sm: 4,
                                    xs: 12
                                  }}>
                                  <CommonSearch
                                        searchVal={searchVal}
                                        cancelSearch={cancelSearch}
                                        requestSearch={requestSearch}
                                      />
                                </Grid>
          
                              </div>
                            </div>
                          </div>
                        ),
                      }}
                      actions={[
                        {
                          icon: 'add',
                          tooltip: 'Add',
                          isFreeAction: true,
                          onClick: () => handleOpen(),
                        }
                      ]}
                      onPageChange={handlePageChange}
                      onRowsPerPageChange={handlePageSizeChange}
                      columns={[
                        {
                          title: 'Plan Name',
                          field: 'Subscription_Name',
                        },
          
                        {
                          title: 'Client StartDate',
                          field: 'start_date',
                          render: (rowData) =>
                            rowData.start_date ? moment(rowData.start_date).format('DD/MM/YYYY') : '',
                        },
          
                        {
                          title: 'Client EndDate',
                          field: 'end_date',
                          render: (rowData) =>
                            rowData.end_date ? moment(rowData.end_date).format('DD/MM/YYYY') : '',
                        },
                        
          
                        {
                          title: 'Status',
                          field: 'Status',
                        },

                        {
                          title: 'Actions',
                          field: 'action',
                          render: (rowData) => (
                            <IconButton onClick={() => handleEdit(rowData)}>
                              <EditIcon />
                            </IconButton>
                          ),
                        },
                      ]}
                      data={searchVal ? filteredData : getAllSchedulePlan}
                      options={{
                        headerStyle,
                        cellStyle,
                        search: false,
                        pageSize: 20,
                        paging: true,
                        pageSizeOptions: [ 20, 50, 100 ],
                        maxBodyHeight: maxBodyHeight,
                        minBodyHeight: maxBodyHeight
                      }}
                    />
     </>
        )}
    </React.Fragment>
  );
}

export default ListSchedulePlan
