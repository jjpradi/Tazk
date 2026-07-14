import React, {Component} from 'react';
//import NewCustomer from '../../components/Customer';
import {connect} from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
import NewCashBox from '../../../components/NewCashBox';
import {
  listCashBoxAction,
  createCashBoxAction,
  updateCashBoxAction,
} from '../../../redux/actions/cash_box_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {
  createDiscountTypeAction,
  listDiscountTypeAction,
} from '../../../redux/actions/discountType_actions';
import DiscountType from '../../../components/NewDiscountType';
import apiCalls from 'utils/apiCalls';

class CashBoxCreation extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_id_data: [],
      dialog: {open: false, msg: '', severity: ''},
      delete: false,
      id: '',
    };
  }

  async componentDidMount() {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listDiscountTypeAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	   );
    if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  handleEdit = async (id) => {
    if (_.isEmpty(id)) {
      let getId = await this.props.discount_type_list
        .map((m) => {
          return m.discount_id === id ? m : null;
        })
        .filter((f) => f !== null);
      await this.setState({edit_id_data: getId, open: true});
    }
  };
  //   handleDelete = async (id) => {
  //     const context = this.context;
  //     await this.props.deleteCashBoxAction(id, context.setModalTypeHandler, context.setLoaderStatusHandler)
  //     this.setState({ delete: false })
  //   }
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };
  handleClose = (id) => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('newDiscountType', false);
    }
    this.setState({open: false, dialog: false, delete: false});
  };
  responseDialog = async (res) => {
    if (res === true) {
      if (this.props.setModalStatusHandler) {
        this.props.setModalStatusHandler(false);
        this.props.setselectData('newDiscountType', false);
      }
    }
    // await this.setState({ ...this.state.dialog, dialog: { msg: res, severity: resSeverity, open: true } })
  };


  handleSubmit = async (data) => {
    const context = this.context;
    if (data.id) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateCashBoxAction(
          data.id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
        
        );
      await this.setState({open: false});
    } else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createDiscountTypeAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.responseDialog,
        )
       );

      await this.setState({open: true});
    }
  };

  render() {
    return (
      <React.Fragment>
        <CreateNewButtonContext.Consumer>
          {({setModalStatusHandler, setModalTypeHandler}) => (
            <div>
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />

              <DiscountType
                edit_id_data={this.state.edit_id_data}
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleSubmit={this.handleSubmit}
                {...this.props}
                setModalStatusHandler={setModalStatusHandler}
                type='NewDiscountType'
                setModalTypeHandler={setModalTypeHandler}
              />
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    discount_type_list: state.discountTypeReducer.discount_type_list || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listDiscountTypeAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(
        listDiscountTypeAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    createDiscountTypeAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      responseDialog,
    ) => {
      return dispatch(
        createDiscountTypeAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          responseDialog,
        ),
      );
    },
    // updateCashBoxAction: (id, data, setModalTypeHandler, setLoaderStatusHandler) => {
    //   dispatch(updateCashBoxAction(id, data, setModalTypeHandler, setLoaderStatusHandler));
    // }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CashBoxCreation);

