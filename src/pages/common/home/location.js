import React, { Component } from 'react';
import { connect } from 'react-redux';
import { listStockLocationAction, updateStockLocationAction, getbyidStockLocationAction, deleteStockLocationAction, createStockLocationAction, location_typeAction, getsourcelocationAction, set_SearchlocationAction, get_SearchlocationAction, stockLocationPaginationAction } from '../../../redux/actions/stock_Location_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import Cookies from 'universal-cookie';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { listUserlocationsAction } from '../../../redux/actions/userCreation_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import DefaultLocationAlert from 'components/defaultLocationAlert';
import { titleURL } from 'http-common';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import InitialLocation from './InitialLocation';

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};

class Location extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      stock_location_data: [],
      open: false,
      edit_id_data: [],
      dialog: { open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      deleteDefaultLocation: false,
      id: '',
      searchVal: '',
      count: 0,
      page: 0,
      pageSize: 20,
      isApiFinished: false,
      rowData: null,
      newDefaultLocation: ''
    };
    this.cookies = new Cookies();
  }
  storage = getsessionStorage();

  async componentDidMount() {
    this.props.set_SearchlocationAction({ data: [], numRows: 0 })
    const context = this.context;

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockLocationPaginationAction(body)
    ).finally(() => this.setState({ isApiFinished: true }))

    await this.props.location_typeAction()
    await this.props.restrictNewCreationBasedOnPlanAction()
  }

  headerUpdate = null;
  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    if (prevState.pageSize !== this.state.pageSize) {

      this.props.set_SearchlocationAction({ data: [], numRows: 0 })

      const body = {
        pageCount: 0,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockLocationPaginationAction(body)
      )
    }

    if (prevState.page !== this.state.page) {

      this.props.set_SearchlocationAction({ data: [], numRows: 0 })

      const body = {
        pageCount: this.state.page,
        numPerPage: this.state.pageSize,
        searchString: this.state.searchVal,
        employeeId: context.commoncookie,
        headerLocationId: context.headerLocationId
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockLocationPaginationAction(body)
      )
    }
  }

  handlePageSizeChange = async (size) => {
    this.setState({ pageSize: size })
  }
  handlePageChange = async (page) => {
    this.setState({ page: page })
  }

  handleEdit = async (id) => {
    const context = this.context;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidStockLocationAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
    );
    this.setState({ open: true, status: 'edit' });
  };
  handleDelete = async (id) => {
    const context = this.context;
    const body = {
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteStockLocationAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
    ).then((res) => {
      context.setHeaderLocationIdHandeler('null')
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.stockLocationPaginationAction(body)
      )
    })
    this.setState({ delete: false });
  };


  handleConfirmDelete = (rowData) => {
    console.log('YYUYU', rowData);
    const context = this.context;

    console.log('fdfijgjtjtj', context);
    if (rowData.locationTypeName !== 'Default Location') {
      this.setState({ delete: true, id: rowData.location_id });
    } else {
      this.setState({ deleteDefaultLocation: true, rowData: rowData })
    }
  }


  handledialog = (id) => {
    this.setState({ delete: true, id: id });
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', false);
    }
    this.setState({ open: false, dialog: false, delete: false });
  };
  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', true);
    }
    await this.setState({
      ...this.state.dialog,
      dialog: { msg: res, severity: resSeverity, open: true },
    });
  };

  sample = async (value) => {
    const context = this.context;
    await this.setState({ open: value });
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stocklocation', true);
    }
  };

  handleDefaultClose = () => {
    this.setState({ deleteDefaultLocation: false })
  }

  handleSubmit = async (data) => {
    const context = this.context;
  
    this.setState({ page: data.location_id ? this.state.page : 0 });
  
    const body = {
      pageCount: data.location_id ? this.state.page : 0,
      numPerPage: this.state.pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId,
    };
  
    if (data.location_id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateStockLocationAction(
          data.location_id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
          'detailpage'
        )
      )
        .then((res) => {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.stockLocationPaginationAction(body),
            this.props.location_typeAction(),
            this.props.listStockLocationAction(
              context.commoncookie,
              context.headerLocationId
            )
          );
        })
        .finally(() => this.setState({ isApiFinished: true }));
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createStockLocationAction(
          data,
          context.commoncookie,
          context.headerLocationId,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
          'detailpage'
        )
      )
        .then((res) => {
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.stockLocationPaginationAction(body),
            this.props.location_typeAction(),
            this.props.listStockLocationAction(
              context.commoncookie,
              context.headerLocationId
            )
          );
        })
        .finally(() => this.setState({ isApiFinished: true }));
    }
  };
  
  

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({ page: 0, searchVal: '' });
    this.props.set_SearchlocationAction({ data: [], numRows: 0 })

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: '',
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.stockLocationPaginationAction(body)
    )
  };

  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val });

    this.props.set_SearchlocationAction({ data: [], numRows: 0 })

    const body = {
      pageCount: 0,
      numPerPage: this.state.pageSize,
      searchString: val.trim(),
      employee_id: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    this.props.get_SearchlocationAction(
      body,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler
    )
  };

  setDefaultFunc = (val) => {
    console.log('RTRT', val);
  }
  render() {


    console.log('sdsdsd121', this.state.rowData, this.state.id, this.props.location_type, this.state.deleteDefaultLocation, this.props.search_location_data);
    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title> {titleURL} | Locations </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({ setModalStatusHandler, setModalTypeHandler, drawerOpen, commoncookie,
            headerLocationId,
            setLoaderStatusHandler, }) => (
            <div
            // style={{
            //   width: drawerOpen
            //     ? 'calc(100vw - 325px)'
            //     : 'calc(100vw - 143px)',
            // }}
            >
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              <InitialLocation
                status={this.state.status}
                edit_id_data={this.props.stocklocation_id_data}
                handleClose={this.handleClose}
                handleSubmit={this.handleSubmit}
                {...this.props}
                type='stockLocation'
                activeStep = {this.props.activeStep}
                setModalStatusHandler={setModalStatusHandler}
                setModalTypeHandler={setModalTypeHandler}
              />

              {

                <DefaultLocationAlert
                  open={this.state.deleteDefaultLocation}
                  handleClose={this.handleDefaultClose}
                  location_data={this.state.rowData}
                  locations={this.props.search_location_data}
                // handleDelete={() => { }}
                />

              }

            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    stocklocation: state.stockLocationReducer.stocklocation || [],
    stocklocation_id_data:
      state.stockLocationReducer.stocklocation_id_data || [],
    location_type:
      state.stockLocationReducer.location_type || [],
    get_source_locationdata: state.stockLocationReducer.get_source_locationdata || [],
    search_location_data: state.stockLocationReducer.search_location_data || [],
    search_location_count: state.stockLocationReducer.search_location_count || [],
    restrictUserLocationCreation: state.SubscriptionReducer.restrictUserLocationCreation
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listStockLocationAction: (
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack
    ) => {
      return dispatch(
        listStockLocationAction(
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack
        ),
      );
    },
    location_typeAction: () => {
      return dispatch(
        location_typeAction(),
      );
    },
    createStockLocationAction: (
      data,
      employee_id,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        createStockLocationAction(
          data,
          employee_id,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    getbyidStockLocationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getbyidStockLocationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    updateStockLocationAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      type,
    ) => {
      return dispatch(
        updateStockLocationAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteStockLocationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteStockLocationAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    listUserlocationsAction: (employee_id, setModalTypeHandler,
      setLoaderStatusHandler) => {
      return dispatch(listUserlocationsAction(employee_id, setModalTypeHandler,
        setLoaderStatusHandler));
    },
    getsourcelocationAction: () => {
      return dispatch(getsourcelocationAction());
    },
    set_SearchlocationAction: (val) => {
      return dispatch(set_SearchlocationAction(val))
    },
    get_SearchlocationAction: (
      val,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        get_SearchlocationAction(
          val,
          setModalTypeHandler,
          setLoaderStatusHandler,
        )
      );
    },
    stockLocationPaginationAction: (data) => {
      console.log(data, 'stockdata')
      return dispatch(stockLocationPaginationAction(data));
    },
    restrictNewCreationBasedOnPlanAction: () => {
      return dispatch(restrictNewCreationBasedOnPlanAction());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Location);
