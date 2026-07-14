import React, { useContext, useEffect, useState } from 'react'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Grid, IconButton, Typography } from '@mui/material';
import CommonSearch from 'utils/commonSearch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useDispatch, useSelector } from 'react-redux';
import context from 'context/CreateNewButtonContext';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';
import { getAllPlansAction, getSearchAllPlansAction, getStatusAction, setSearchAllPlansAction } from 'redux/actions/clientSubscription_action';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import NewPlan from './planCreationForm';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import moment from 'moment';
import EditIcon from '@mui/icons-material/Edit';

const AllPlansList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setModalTypeHandler,
    commoncookie,
  } = useContext(context);

  const [ open, setOpen ] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [ status, setStatus ] = useState('create')
  const [editData, setEditData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filteredData, setFilteredData] = useState([]); 
  const [searchData, setSearchData] = useState({searchVal: ''})
  const { ClientSubscriptionReducer: { getAllPlans } } = useSelector((state) => state)

  useEffect(() => {
    const data = {
      searchString: searchVal
    }
    dispatch(getAllPlansAction(data));
  }, [])

  const handlePageChange = async (page) => {
    setSearchData({...searchData});
    }
  
  const handlePageSizeChange = async (size) => {
    setSearchData({...searchData});
    };

  const handleOpen = () => {
    setShowModal(true);
    setEditData(null);
  };
  

  const handleClose = () => {
    setOpen(false);
    setSelectedPlanId(null);
    setStatus("create");
  };

  const handleEditPlan = (id) => {
    console.log(id,"planId")
    const selectedPlan = getAllPlans.find((plan) => plan.id === id);
    if (selectedPlan) {
      setEditData(selectedPlan);
      setShowModal(true);
    }
  };


  const requestSearch = (e) => {
    let val = e.target.value
    setSearchVal(val)
    let searchKeywords = val

    const searchSplit = searchKeywords.trim().split(/\s+/);

    const matchedRecords = getAllPlans.filter((record) => {
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
    setFilteredData(getAllPlans);
  };


  console.log(getAllPlans, "getAllPlans")
  return (
    <React.Fragment>
      <Helmet>
        <meta charSet='utf-8' />
        <title> {titleURL} | Plans List </title>
      </Helmet>
      {showModal && (
        <NewPlan
          handleClose={() => setShowModal(false)}
          edit_id_data={editData}
          status={editData ? "edit" : "create"}
        />
      )}
      {!showModal && (
              <>
                <MaterialTable
                  title={<Typography className='page-title'>Plans</Typography>}
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
                      title: 'StartDate',
                      field: 'StartDate',
                      render: (rowData) =>
                              rowData.StartDate ? moment(rowData.StartDate).format('DD/MM/YYYY') : '',
                    },

                    {
                      title: 'EndDate',
                      field: 'EndDate',
                      render: (rowData) =>
                              rowData.EndDate ? moment(rowData.EndDate).format('DD/MM/YYYY') : '',
                    },

                    {
                      title: 'Status',
                      field: 'status',
                    },

                    {
                      title: 'Actions',
                      field: 'action',
                      render: (rowData) => (
                        <IconButton onClick={() => handleEditPlan(rowData.id)}>
                          <EditIcon />
                        </IconButton>
                      ),
                    },
                  ]}
                  data={searchVal ? filteredData : getAllPlans}
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

export default AllPlansList
