import React, {Component} from 'react';
import {Grid, CardContent, Typography, Card, Box} from '@mui/material';
import {
  getProductDateAction,
  getProductMonthAction,
  getProductTillAction,
  getTotalPurchasedQtyAction
} from '../../redux/actions/product_actions';
import {connect} from 'react-redux';
import CardTemplate from '../customer_erpDesign/cardTemplate';
import apiCalls from 'utils/apiCalls';
import moment from 'moment';
import { commonDateFormat } from 'utils/getTimeFormat';

class PurchaseCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // productDate : '',
      // productMonth : '',
      // productTill : ''
    };
  }

  async componentDidMount() {

    const context = this.context;
    const itemId = this.props.item_id === "" ? this.props.product[0]?.item_id : this.props.item_id;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.getProductDateAction(itemId),
      // this.props.getProductMonthAction(this.props.item_id),
      // this.props.getProductTillAction(itemId),
      // this.props.getTotalPurchasedQtyAction(itemId)
	  );
  }

  // async componentDidUpdate(pprops){
  //     if(pprops.product_id_data_date != this.props.product_id_data_date){
  //         const pDate = this.props.product_id_data_date.map((d)=>{
  //             return {productdate : d.creationDate } //, productmonth : d.monthSold
  //         })
  //         this.setState({productDate : pDate})
  //     }
  //     if(pprops.product_id_data != this.props.product_id_data){
  //         const pMonth = this.props.product_id_data.map((d)=>{
  //             return {productmonth : d.monthSold } //, productmonth : d.monthSold
  //         })
  //         this.setState({productMonth : pMonth})
  //     }
  // if(pprops.product_id_data != this.props.product_id_data){
  //     const pDate = this.props.product_id_data.map((d)=>{
  //         return {productdate : d.creationDate } //, productmonth : d.monthSold
  //     })
  //     this.setState({productDate : pDate})
  // }
  // }

  render() {
    return (
      <>
        {/* <Grid container>
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>

                        <Grid container direction="row">

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>

                                <Card style={{ width: 390 }}>

                                    <CardContent>
                                        <Typography style={{ fontSize: 14 }} color="textSecondary" gutterBottom>
                                            Launch Date 
                                        </Typography>
                                        <Typography variant="h5" component="h2">
                                            {this.props.product_id_data_date[0]?.creationDate}
                                        </Typography>
                                    </CardContent>

                                </Card>

                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>

                                <Card style={{ width: 390 }}>

                                    <CardContent>
                                        <Typography style={{ fontSize: 14 }} color="textSecondary" gutterBottom>
                                            Qty Sold Current Month
                                        </Typography>
                                        <Typography variant="h5" component="h2">
                                            {this.props.product_id_data_month[0]?.monthSold}
                                        </Typography>
                                    </CardContent>

                                </Card>

                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>

                                <Card style={{ width: 390 }}>

                                    <CardContent>
                                        <Typography style={{ fontSize: 14 }} color="textSecondary" gutterBottom>
                                            Till Do To Sold
                                        </Typography>
                                        <Typography variant="h5" component="h2">
                                            {this.props.product_id_data_till[0]?.tillSold}
                                        </Typography>
                                    </CardContent>

                                </Card>

                            </Grid>
                        </Grid>

                    </Grid>
                </Grid> */}
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              lg: 4,
              md: 4,
              sm: 4
            }}>
            <Box>
              <Card
                style={{color: 'white', backgroundColor: '#4285F5'}}
                variant='outlined'
                sx={{padding: '10px', width: '100%'}}
              >
                <Typography variant='body1' component='div' align='center'>
                  Launch Date
                </Typography>

                <Typography variant='h6' align='center'>
                  {commonDateFormat(this.props.product_id_data_date[0]?.creationDate) || '-'}
                </Typography>
              </Card>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
              md: 4,
              sm: 4
            }}>
            <Box>
              <Card
                style={{color: 'white', backgroundColor: '#999999'}}
                variant='outlined'
                sx={{padding: '10px', width: '100%'}}
                v1={'body1'}
                v2={'body1'}
              >
                {/* <Typography variant='body1' component='div' align='center'>
                  Qty Sold Current Month
                </Typography> */}
                <Typography variant='body1' component='div' align='center'>
                  Purchased Qty
                </Typography>

                <Typography variant='h6' align='center'>
                  {this.props.totalPurchasedQty[0]?.total_purchase || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4,
              md: 4,
              sm: 4
            }}>
            <Box>
              <Card
                style={{color: 'white', backgroundColor: '#4D4D4D'}}
                variant='outlined'
                sx={{padding: '10px', width: '100%'}}
                v1={'body1'}
                v2={'body1'}
              >
                <Typography variant='body1' component='div' align='center'>
                  Sold Qty
                </Typography>

                <Typography variant='h6' align='center'>
                  {this.props.product_id_data_till[0]?.tillSold || 0}
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    product: state.productReducer.product,
    product_id_data: state.productReducer.product_id_data,
    product_id_data_date: state.productReducer.product_id_data_date,
    product_id_data_month: state.productReducer.product_id_data_month,
    product_id_data_till: state.productReducer.product_id_data_till,
    totalPurchasedQty: state.productReducer.totalPurchasedQty
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getProductDateAction: (id) => {
      return dispatch(getProductDateAction(id));
    },
    getProductMonthAction: (id) => {
      return dispatch(getProductMonthAction(id));
    },
    getTotalPurchasedQtyAction: (id) => {
      return dispatch(getTotalPurchasedQtyAction(id));
    },
    getProductTillAction: (id) => {
      return dispatch(getProductTillAction(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseCard);
// export default PurchaseCard;
