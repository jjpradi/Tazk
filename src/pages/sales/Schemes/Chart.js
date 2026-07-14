import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import {
  Grid,
  Typography,
  Divider,
  TextField,
  Autocomplete,
  Card,
} from '@mui/material';
import {listDashBoardSchemesAction} from '../../../redux/actions/schemes_actions';
import DetailTable from './DetailTable';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { titleURL } from 'http-common';

class ApexChart extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.date = new Date();
    this.state = {
      series: [100, 12],
      size: [12, 10],
      dashBoardData: [],
      TableVisible: false,
      filterId: '',
      SchemeName: '',
      months: [
        {name: 'January', value: '01'},
        {name: 'February', value: '02'},
        {name: 'March', value: '03'},
        {name: 'April', value: '04'},
        {name: 'May', value: '05'},
        {name: 'June', value: '06'},
        {name: 'July', value: '07'},
        {name: 'August', value: '08'},
        {name: 'September', value: '09'},
        {name: 'October', value: '10'},
        {name: 'November', value: '11'},
        {name: 'December', value: '12'},
      ],
    };
  }

  async componentDidMount() {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.listDashBoardSchemesAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
	  );
    this.Filtering();
  }

  Filtering = async () => {
    const data = [...this.props.schemesDashBoard];
    const Filtering = data.filter((f) => f.id);
    await this.setState({dashBoardData: Filtering});
    this.DateFiletering(this.state.months[this.date.getMonth()].value);
  };

  componentDidUpdate(preProps, preState) {
    if (preProps.schemesDashBoard !== this.props.schemesDashBoard) {
      this.Filtering();
    }
  }

  DateFiletering = async (month) => {
    const data = [...this.props.schemesDashBoard];
    if (month !== '' && typeof month !== 'undefined') {
      const Filtering = data.filter(
        (f) =>
          (f.id &&
            f.from.split('-')[0] == this.date.getFullYear() &&
            f.id &&
            f.from.split('-')[1] == month) ||
          (f.id &&
            f.to.split('-')[0] == this.date.getFullYear() &&
            f.id &&
            f.to.split('-')[1] == month) ||
          (f.id &&
            f.to.split('-')[0] == this.date.getFullYear() &&
            f.id &&
            f.to.split('-')[1] > month &&
            f.id &&
            f.from.split('-')[0] == this.date.getFullYear() &&
            f.id &&
            f.from.split('-')[1] <= month) ||
          (f.id &&
            f.from.split('-')[0] < this.date.getFullYear() &&
            f.id &&
            f.to.split('-')[0] == this.date.getFullYear() &&
            f.id &&
            f.to.split('-')[1] >= month),
      );
      this.setState({dashBoardData: Filtering});
    }
  };

  GoTableVisible = async (id) => {
    await this.setState({filterId: id, TableVisible: true});
  };

  handleClose = () => {
    this.setState({TableVisible: false});
  };

  render() {
    const {schemesDashBoard} = this.props;
    const { TableVisible, dashBoardData } = this.state;
    
    return (
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%', overflow: 'auto' }}>
        <React.Fragment>
           <Helmet>
                  <meta charSet="utf-8" />
                  <title> {titleURL} | Shemes DashBoard </title>
        </Helmet>
          <CreateNewButtonContext.Consumer>
            {({loaderStatus}) => (
              <div>
              <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  Scheme Dashboard
                </Typography>
                <Divider />
                {TableVisible === false && (
                  <Grid
                    spacing={0}
                    style={{paddingTop: '20px', paddingBottom: '20px'}}
                    justifyContent='flex-end'
                    alignItems='center'
                    // lg={12}
                    // md={12}
                    // sm={12}
                    // xs={12}
                    container
                    direction='row'
                    //
                  >
                    <Grid
                      size={{
                        lg: 2,
                        md: 3,
                        sm: 6,
                        xs: 12
                      }}>
                      <Autocomplete
                        id='multiple-limit-tags'
                        options={this.state.months}
                        defaultValue={this.state.months[this.date.getMonth()]}
                        // inputProps={{ value: this.state.months[0] }}
                        getOptionLabel={(option) => option.name}
                        onChange={(e, v) =>
                          v !== null ? this.DateFiletering(v.value) : ''
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant='filled'
                            label='Select Month'
                            placeholder='Select Month'
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                )}
                <Grid container>
                  {dashBoardData.length === 0 &&
                    TableVisible === false &&
                    loaderStatus === false && <NoRecordFound />}

                  {dashBoardData && TableVisible === false ? (
                    dashBoardData.map((s, i) => {
                      return (
                        <Grid
                          key={i}
                          onClick={() => {
                            this.GoTableVisible(s.id);
                            this.setState({SchemeName: s.scheme_name});
                          }}
                          size={{
                            xs: 12,
                            sm: 12,
                            md: 6,
                            lg: 4
                          }}>
                          <ReactApexChart
                            options={{
                              chart: {
                                width: 380,
                                type: 'pie',
                              },
                              title: {
                                text: s.scheme_name,
                              },
                              legend: {
                                formatter: function (val, opts) {
                                  return val === 'Target'
                                    ? val + ' - ' + s.target
                                    : val === 'Achieved' && s.qty == null
                                    ? val + ' - ' + 0
                                    : val === 'Achieved' && s.qty !== null
                                    ? val + ' - ' + s.qty
                                    : val === 'Brand'
                                    ? val + ' - ' + s.brand
                                    : val === 'From'
                                    ? val + ' - ' + s.from.split(' ')[0]
                                    : val + ' - ' + s.to.split(' ')[0];
                                },
                              },
                              labels: [
                                'Target',
                                'Achieved',
                                'Brand',
                                'From',
                                'To',
                              ],
                              responsive: [
                                {
                                  breakpoint: 480,
                                  options: {
                                    chart: {
                                      width: 200,
                                    },
                                    legend: {
                                      position: 'bottom',
                                    },
                                  },
                                },
                              ],
                            }}
                            series={[
                              s.qty == null ? s.target : s.target - s.qty,
                              s.qty == null ? 0 : s.qty,
                            ]}
                            type='pie'
                            width={450}
                          />
                        </Grid>
                      );
                    })
                  ) : (
                    <></>
                  )}
                </Grid>

                {TableVisible && (
                  <DetailTable
                    data={this.props.schemesDashBoard}
                    SchemeName={this.state.SchemeName}
                    filterId={this.state.filterId}
                    handleClose={this.handleClose}
                  />
                )}
              </div>
            )}
          </CreateNewButtonContext.Consumer>
        </React.Fragment>
      </Card>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    schemesDashBoard: state.schemesReducer.schemesDashBoard,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listDashBoardSchemesAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listDashBoardSchemesAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ApexChart);
