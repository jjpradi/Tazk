import React, { useState, useEffect, useContext,useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout"; //{ Responsive, WidthProvider }
import "./styles.css";
import "../../../node_modules/react-grid-layout/css/styles.css";
import "../../../node_modules/react-resizable/css/styles.css";
import ExpenseCard from "components/dashboard/expanseAnalysis/expenseCard";
import TotalCard from "components/dashboard/expanseAnalysis/totalCard";
import SpendingCard from "components/dashboard/expanseAnalysis/spendingCard";
import PieChart from "components/dashboard/expanseAnalysis/pieChart";
import AreaChart from "components/dashboard/expanseAnalysis/areaChart";
import { listExpenseAreaChart } from "redux/actions/profitloss_actions";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import moment from 'moment';
import Filters from "components/dashboard/ProfitAndLoss/filters";
import RevenueAndCost from 'components/dashboard/ProfitAndLoss/revenue_and_cost';
import Profit from "components/dashboard/ProfitAndLoss/profit";
import BreakDown from "components/dashboard/ProfitAndLoss/break_down_cost";
import Receivables from "components/dashboard/payable_receivable/totalAccountsReceivables";
import Payables from "components/dashboard/payable_receivable/totalAccountsPayables";
import ReceivableAndPayableAging from "components/dashboard/payable_receivable/receivableAndPayableAging"
import TotalReceivables from "components/dashboard/payable_receivable/totalReceivables";
import AvailStock from "pages/sales/inventoryMD/AvailStock";
import StockSummary from "pages/sales/inventoryMD/StockSummary";
import LocateStock from "pages/sales/inventoryMD/LocateStock";
import NonmoveCategory from "pages/sales/inventoryMD/NonmoveCategory";
import Linechart from "components/dashboard/linechart/linechart";
import CashFlow from "components/dashboard/CashFlow";
import TotalSales from "components/dashboard/SalesDashboard/totalSales";
import BrandSales from "components/dashboard/SalesDashboard/brandSales";
import SalesComparison from "components/dashboard/SalesDashboard/salesComparison";
import AreaWiseSale from "components/dashboard/SalesDashboard/areaWiseSale";
import TodaySales from "components/dashboard/SalesDashboard/todaySales&salesTillDate";
import SalesToday from "components/dashboard/PosUser/salesTodayCard";
import CashInHand from "components/dashboard/PosUser/cashInHandCard";
import TargetAchievement from "components/dashboard/PosUser/targetAchievementCard";
import PosSummary from "components/dashboard/PosUser/posSummary";
import CurrentSale from "components/dashboard/SalesManDashboard/SalesDetails/currentSale";
import TargetSale from "components/dashboard/SalesManDashboard/SalesDetails/targetSale";
import CustomerBilled from "components/dashboard/SalesManDashboard/SalesDetails/customerBilled";
import CustomerUnBilled from "components/dashboard/SalesManDashboard/SalesDetails/customerUnBilled";
import TopSales from "components/dashboard/SalesManDashboard/SalesDetails/topSales";
import VisitsReport from "components/dashboard/visits";
import EmployeeCard from "components/Payroll/employeeCard";
import LateCheckCards from "components/Payroll/lateCheckCard";
import EarlyCheckoutCards from "components/Payroll/earlyCheckoutCard";
import HolidayCards from "components/Payroll/holidayCard";
import CheckedIn from "components/Payroll/checkedIn";
import NotCheckedIn from "components/Payroll/notCheckedIn";
import LateLogin from "components/Payroll/lateLogin";
import CompleteList from "components/Payroll/completeList";
import SaleCard from "components/widgetsDashboard/saleCard";
import WidgetGrossProfit from "components/widgetsDashboard/grossProfit";
import RoiCard from "components/widgetsDashboard/ROICard";
import NetProfit from "components/widgetsDashboard/netProfit";
import WidgetTopSales from "components/widgetsDashboard/topSales";
import { Grid } from "@mui/material";
import FilterButtonGroup from "components/dashboard/ProfitAndLoss/filterButtonGroup";
import {clientwebsocket } from '../../../http-common'
import CreateNewButtonContext from "../../context/CreateNewButtonContext";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getDashboardRoleDataAction, listDashboardAction, listDashboardByRoleAction } from "redux/actions/dashboard_role_actions";
import apiCalls from "utils/apiCalls";
import DashboardDialog from "./dashboardDialog";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Cookies from 'universal-cookie';
import TotalOutstandingCard from "components/dashboard/SalesManDashboard/outstandingReport.js/totalOutstandingCard";
import OverDueCard from "components/dashboard/SalesManDashboard/outstandingReport.js/overDueCard";
import CollectTodayCard from "components/dashboard/SalesManDashboard/outstandingReport.js/collectTodayCard";
import CollectOverDueCard from "components/dashboard/SalesManDashboard/outstandingReport.js/collectOverDueCard";
import CollectStatusCard from "components/dashboard/SalesManDashboard/outstandingReport.js/collectStausCard"
import TopTenOutstandingCard from "components/dashboard/SalesManDashboard/outstandingReport.js/topTenOutstandingCard";
import ChequeBouncesCard from "components/dashboard/SalesManDashboard/chequeBouncesCard";
import TotalPayables from "components/dashboard/payable_receivable/totalPayable";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default function DashBoardTest() {
  const [compactType] = useState("vertical");
  const [mounted, setmounted] = useState(false);
  const [load, setLoad] = useState(0);
  const [removeCard, setRemoveCard] = useState({totalCard : false,expenseCard : false,spendingCard : false,pieCard : false,areaCard : false,filterCard : false,revenueCard : false,profitCard : false,breakDownCard : false,filterButtonCard : false,receivablesCard : false,payablesCard : false,totalPayableReceivableCard : false,totalReceivableCard : false,availStockCard : false,stockSummaryCard : false,locateStockCard : false,nonmoveCategoryCard : false,cashFlowCard : false,linechartCard : false,totalSalesCard : false,brandSalesCard : false,salesComparisonCard : false,areaWiseSaleCard : false,todaySalesCard : false,salesTodayCard : false,cashInHandCard : false,targetAchievementCard : false,posSummaryCard : false,currentSaleCard : false,targetSaleCard : false,customerBilledCard : false,customerUnBilledCard : false,topSalesCard : false,TotalOutstanding : false,OverDue : false,CollectToday : false,CollectOverDue : false,CollectStatus : false,TopTenOutstanding : false,ChequeBounces : false,visitsReportCard : false,employeeCard : false,lateCheckCard : false,earlyCheckoutCard : false,holidayCard : false,checkedInCard : false,notCheckedInCard : false,lateLoginCard : false,completeListCard : false,saleCard : false,widgetGrossProfitCard : false,roiCard : false,netProfitCard : false,widgetTopSalesCard : false,totalPayableCard : false
  }) 
  const {totalCard,expenseCard,spendingCard,pieCard,areaCard,filterCard,revenueCard,profitCard,breakDownCard,filterButtonCard,receivablesCard,payablesCard,totalPayableReceivableCard,totalReceivableCard,availStockCard,stockSummaryCard,locateStockCard,nonmoveCategoryCard,cashFlowCard,linechartCard,totalSalesCard,brandSalesCard,salesComparisonCard,areaWiseSaleCard,todaySalesCard,salesTodayCard,cashInHandCard,targetAchievementCard,posSummaryCard,currentSaleCard,targetSaleCard,customerBilledCard,customerUnBilledCard,topSalesCard,TotalOutstanding,OverDue,CollectToday,CollectOverDue,CollectStatus,TopTenOutstanding,ChequeBounces,visitsReportCard,employeeCard,lateCheckCard,earlyCheckoutCard,holidayCard,checkedInCard,notCheckedInCard,lateLoginCard,completeListCard,saleCard,widgetGrossProfitCard,roiCard,netProfitCard,widgetTopSalesCard,totalPayableCard} = removeCard
  const dispatch = useDispatch();
  const cookies = new Cookies();
  let date = new Date();
  const [layout, setLayout] = useState([
    { i: "1", x: 0, y: 1, w: 4, h: 3, minW: 3,  maxW: 4, minH: 3, maxH: 3, type: 'ExpenseCard' },//0 x: 0, y: 0, w: 4, h: 3, minW: 3,  maxW: 4, minH: 3,maxH: 3,
    { i: "2", x: 0, y: 2, w: 4, h: 3, minW: 3,  maxW: 4, minH: 3, maxH: 3, type: 'TotalCard' }, //1
    { i: "3", x: 0, y: 3, w: 4, h: 3, minW: 3,  maxW: 4, minH: 3, maxH: 3, type: 'SpendingCard' },//2

    { i: "4", x: 0, y: 0, w: 4, h: 3, minW: 3,  maxW: 4, minH: 3, maxH: 3, type: 'PieChart' },//3
    { i: "5", x: 0, y: 0, w: 4, h: 3, minW: 3,  maxW: 4, minH: 3, maxH: 3, type: 'AreaChart' },//4

    { i: "f", x: 0, y: 15.6, w: 4, h: 28.8, type: 'Filters' },//5
    { i: "f1", x: 4, y: 15.6, w: 8, h: 2, type: 'FilterButtonGroup' },//6
    { i: "g", x: 4, y: 17.6, w: 8, h: 8.7, type: 'RevenueAndCost' },//7
    { i: "h", x: 4, y: 26.3, w: 8, h: 9, type: 'Profit' },//8
    { i: "i", x: 4, y: 35.3, w: 8, h: 9, type: 'BreakDown' },//9

    { i: "j", x: 0, y: 44.4, w: 2, h: 6.6, type: 'Receivables' },//10
    { i: "k", x: 0, y: 51, w: 2, h: 6.6, type: 'Payables' },//11
    { i: "l", x: 2, y: 44.3, w: 10, h: 13.2, type: 'PayablesAndReceivables' },//12

    // { i: "m", x: 0, y: 58.3, w: 12, h: 6.2, type: 'TotalReceivables' },//
    // { i: "n", x: 0, y: 64.5, w: 4, h: 3, type: 'AvailStock' }, //

    { i: "o", x: 6, y: 57.6, w: 6, h: 11.5, type: 'StockSummary' },//13
    { i: "p", x: 0, y: 57.6, w: 6, h: 11.6, type: 'LocateStock' },//14
    { i: "q", x: 0, y: 69.2, w: 12, h: 14.2, type: 'NonmoveCategory' },//15
    { i: "r", x: 0, y: 83.4, w: 12, h: 13, type: 'LineChart' },//16
    { i: "s", x: 0, y: 96.4, w: 12, h: 11.3, type: 'CashFlow' },//17

    { i: "t", x: 0, y: 107.7, w: 6, h: 10, type: 'TotalSales' },//18
    { i: "u", x: 6, y: 107.7, w: 6, h: 10, type: 'BrandSales' },//19
    { i: "v", x: 0, y: 117.7, w: 6, h: 9, type: 'SalesComparison' },//20
    { i: "w", x: 6, y: 117.7, w: 6, h: 9, type: 'AreaWiseSale' },//21

    // { i: "x", x: 0, y: 150.8, w: 12, h: 11.1, type: 'TodaySales' },//

    { i: "y", x: 0, y: 126.7, w: 4, h: 4.3, type: 'SalesToday' },//22
    { i: "Z", x: 4, y: 126.7, w: 4, h: 4.3, type: 'CashInHand' },//23
    { i: "aa", x: 8, y: 126.7, w: 4, h: 4.3, type: 'TargetAchievement' },//24
    { i: "ab", x: 0, y: 131, w: 12, h: 11.4, type: 'PosSummary' },//25
    { i: "ac", x: 0, y: 142.4, w: 3, h: 4.3, type: 'CurrentSale' },//26
    { i: "ad", x: 3, y: 142.4, w: 3, h: 4.3, type: 'TargetSale' },//27
    { i: "ae", x: 6, y: 142.4, w: 3, h: 4.3, type: 'CustomerBilled' },//28
    { i: "af", x: 9, y: 142.4, w: 3, h: 4.3, type: 'CustomerUnBilled' },//29
    { i: "ag", x: 0, y: 146.7, w: 12, h: 8, type: 'TopSales' },//30

    { i: "av", x: 0, y: 157.7, w: 4, h: 4.3, type: 'TotalOutstandingCard' },//31
    { i: "aw", x: 4, y: 157.7, w: 4, h: 4.3, type: 'OverDueCard' },//32
    { i: "ax", x: 8, y: 157.7, w: 4, h: 4.3, type: 'CollectTodayCard' },//33
    { i: "ay", x: 0, y: 162, w: 4, h: 2.8, type: 'CollectOverDueCard' },//34
    { i: "az", x: 4, y: 162, w: 4, h: 2.8, type: 'CollectStatusCard' },//35

    { i: "ba", x: 0, y: 164.8, w: 12, h: 11, type: 'TopTenOutstandingsCard' },//36
    { i: "bb", x: 0, y: 173, w: 12, h: 10.4, type: 'ChequeBouncesCard' },//37

    { i: "ah", x: 0, y: 183.4, w: 12, h: 9.4, type: 'VisitsReport' },//38
    { i: "ai", x: 0, y: 189.7, w: 3, h: 3, type: 'EmployeeCard' },//39
    { i: "aj", x: 3, y: 189.7, w: 3, h: 3, type: 'LateCheckCards' },//40
    { i: "ak", x: 6, y: 189.7, w: 3, h: 3, type: 'EarlyCheckoutCards' },//41
    { i: "al", x: 9, y: 189.7, w: 3, h: 3, type: 'HolidayCards' },//42
    { i: "am", x: 0, y: 192.7, w: 12, h: 10.3, type: 'CheckedIn' },//43
    { i: "an", x: 0, y: 203, w: 12, h: 10.4, type: 'NotCheckedIn' },//44
    { i: "ao", x: 0, y: 213.4, w: 12, h: 10.3, type: 'LateLogin' },//45
    { i: "ap", x: 0, y: 223.7, w: 12, h: 10.3, type: 'CompleteList' },//46
    { i: "aq", x: 0, y: 234, w: 3, h: 3.5, type: 'SaleCard' },//47
    { i: "ar", x: 3, y: 237.5, w: 3, h: 3.5, type: 'WidgetGrossProfit' },//48
    { i: "as", x: 6, y: 241, w: 3, h: 3.5, type: 'RoiCard' },//49
    { i: "at", x: 9, y: 244.5, w: 3, h: 3.5, type: 'NetProfit' },//50

    { i: "bc", x: 0, y: 248, w: 6, h: 6, type: 'TotalReceivables' },//51
    { i: "bd", x: 6, y: 254, w: 6, h: 6, type: 'TotalPayables' },//52
    { i: "be", x: 0, y: 260, w: 6, h: 9, type: 'TodaySales' },//53

    { i: "au", x: 6, y: 269, w: 6, h: 9, type: 'WidgetTopSales' },//54

    { i: "bf", x: 0, y: 278, w: 4, h: 3, type: 'AvailStock' },//55
  ]);
  const [mode, setMode] = useState('view');

  const theme = useTheme();
  const large = useMediaQuery(theme.breakpoints.up('lg'));
  const medium = useMediaQuery(theme.breakpoints.up('md'));
  const small = useMediaQuery(theme.breakpoints.up('sm'));
  const extraSmall = useMediaQuery(theme.breakpoints.up('xs'));


  const { DashboardRoleReducer: {getalldashboarddata,dashboardRoleData,dashboardListByRole} } = useSelector((state) => state);
  
  const {setModalTypeHandler, setLoaderStatusHandler,} = useContext(CreateNewButtonContext);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getDashboardRoleDataAction(cookies.get('login')?.role_id)),
      dispatch(listDashboardAction())
    );
  }, [load]);

  const getAccessDashBoard = useCallback ((name) =>{
  
    return dashboardRoleData.some((d)=> (d.dashboard_name === name) )
  },[dashboardRoleData])

  const handleChange = (event, newMode) => {
    setMode(newMode);
  };


  const onDrop = elemParams => {
    alert(
      `Element parameters:\n${JSON.stringify(
        elemParams,
        ["x", "y", "w", "h"],
        2
      )}`
    );
  };

  const {
    ProfitLossDashboardReducer: {
      day,
      week,
      month,
      year,
      getByDate,
    },
  } = useSelector((state) => state);
  const [filters, setFilters] = useState(month);
  const [activeButton, setActiveButton] = useState('day')

  const handleDate = () => {
    setFilters(getByDate);
  };


 const setStateHandler = (name) => (value) => {
  
  setRemoveCard({ ...removeCard, [name] : value})
 }


  return (
    <>
      <Grid container spacing={2} mt='10px'>
        {/* <Grid size={{ lg: 12 }} direction='row'> */}

          <Grid size={{
            lg: 2
          }}>
            {/* <Autocomplete
              multiple
              id="checkboxes-tags-demo"
              options={getalldashboarddata}
              disableCloseOnSelect
              getOptionLabel={(option) => option.dashboard_name}
              renderOption={(props, option, { selected }) => (
                // <DragDashboardList getalldashboarddata={getalldashboarddata}>
                  <li {...props}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.dashboard_name}
                  </li>
                // </DragDashboardList>
              )}
              style={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Checkboxes" placeholder="Favorites" />
              )}
            /> */}
            {/* <DragDashboardList getalldashboarddata={getalldashboarddata}/> */}

            <ToggleButtonGroup
              color="primary"
              value={mode}
              exclusive
              sx={{mb : '10px'}}
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton value="view">View Mode</ToggleButton>
              <ToggleButton value="edit">Edit Mode</ToggleButton>
            </ToggleButtonGroup>

            {
              mode === 'edit' ? 
              <DashboardDialog load={load} setLoad={setLoad}/>
              :
              ""
            }

          </Grid>

        {/* </Grid> */}
      </Grid>
      <ResponsiveReactGridLayout
        className="layout"
        rowHeight={30}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        layout={layout}
        // onLayoutChange={this.onLayoutChange}
        onDrop={onDrop}
        // WidthProvider option
        measureBeforeMount={false}
        // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
        // and set `measureBeforeMount={true}`.
        useCSSTransforms={mounted}
        compactType={compactType}
        preventCollision={!compactType}
        isDroppable={true}
        // droppingItem={{ i: "xx", h: 50, w: 250 }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        allowOverlap={false}

        // isDraggable
        // isRearrangeable
        // isResizable
        // draggableHandle=".grid-item__title"
      >
        {/* {layout.map((itm, i) => (
          <div key={itm.i} data-grid={itm} className="block">
            <GetAllDashBoards type={itm.type}/>
            </div>
        ))} */}

        {/* {
          layoutTitle.map((itm, i) => (
            <div key={itm} item={itm}>
              <GetAllDashBoards item={itm}/>
              welcome
              {
                GetAllDashBoards(itm)
              }
            </div>
          ))
        } */}

          {/* <div key="ExpenseCard">1</div>
          <div key="TotalCard">2</div>
          <div key="SpendingCard">3</div> */}

        {
          (totalCard !== true && getAccessDashBoard('ExpensesAnalysis')) ?
            <div key='1' className="">
              <TotalCard setTotalCardClose={setStateHandler('totalCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (expenseCard !== true && getAccessDashBoard('ExpensesAnalysis')) ?
            <div key='2' className="">
              <ExpenseCard setexpenseCardClose={setStateHandler('expenseCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (spendingCard !== true && getAccessDashBoard('ExpensesAnalysis')) ?
            <div key='3' className="">
              <SpendingCard setSpendingCardClose={setStateHandler('spendingCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (pieCard !== true && getAccessDashBoard('ExpensesAnalysis')) ?
            <div key='4'  className="">
              <PieChart setPieCardClose={setStateHandler('pieCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (areaCard !== true && getAccessDashBoard('ExpensesAnalysis')) ?
            <div key='5' className="">
              <AreaChart setAreaCardClose={setStateHandler('areaCard')} mode={mode} />
            </div>
            :
            " "
        } 

        {
          (filterCard !== true && getAccessDashBoard('ProfitLossDashboard')) ?
            <div key='f' data-grid={layout[5]} className="block">
              <Filters handleDate={() => handleDate()} setFilterCardClose={setStateHandler('filterCard')} mode={mode} activeButton={activeButton} setActiveButton={setActiveButton}/>
            </div>
            :
            " "
        }

        {
          (filterButtonCard !== true && getAccessDashBoard('ProfitLossDashboard')) ?
            <div key='f1' data-grid={layout[6]} className="block">
              <FilterButtonGroup filters={filters} setFilters={setFilters} activeButton={activeButton} setActiveButton={setActiveButton} setFilterButtonCardClose={setStateHandler('filterButtonCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (revenueCard !== true && getAccessDashBoard('ProfitLossDashboard')) ?
            <div key='g' data-grid={layout[7]} className="block">
              <RevenueAndCost RevenueAndCost={filters} setRevenueCardClose={setStateHandler('revenueCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (profitCard !== true && getAccessDashBoard('ProfitLossDashboard')) ?
            <div key='h' data-grid={layout[8]} className="block">
              <Profit profit={filters} setProfitCardClose={setStateHandler('profitCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (breakDownCard !== true && getAccessDashBoard('ProfitLossDashboard')) ?
            <div key='i' data-grid={layout[9]} className="block">
              <BreakDown breakDown={filters} setBreakDownCardClose={setStateHandler('breakDownCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (receivablesCard !== true && getAccessDashBoard('PayableReceivableDashboard')) ?
            <div key='j' data-grid={layout[10]} className="block">
              <Receivables setReceivablesCardClose={setStateHandler('receivablesCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (payablesCard !== true && getAccessDashBoard('PayableReceivableDashboard')) ?
            <div key='k' data-grid={layout[11]} className="block">
              <Payables setPayablesCardClose={setStateHandler('payablesCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (totalPayableReceivableCard !== true && getAccessDashBoard('PayableReceivableDashboard')) ?
            <div key='l' data-grid={layout[12]} className="block">
              <ReceivableAndPayableAging setTotalPayableReceivableCardClose={setStateHandler('totalPayableReceivableCard')} mode={mode} />
            </div>
            :
            " "
        } 

        {/* {
          (totalReceivableCard !== true && getAccessDashBoard('PayableReceivableDashboard')) ?
            <div key='m' data-grid={layout[13]} className="block">
              <TotalReceivables setTotalReceivableCardClose={setStateHandler('totalReceivableCard')} mode={mode} />
            </div>
            :
            " "
        } */}

        {/* {
          (availStockCard !== true && getAccessDashBoard('InventoryMD')) ?
            <div key='n' data-grid={layout[14]} className="block">
              <AvailStock setAvailStockCardClose={setStateHandler('availStockCard')} mode={mode} />
            </div>
            :
            " "
        } */}

        {
          (stockSummaryCard !== true && getAccessDashBoard('InventoryMD')) ?
            <div key='o' data-grid={layout[13]} className="block">
              <StockSummary setStockSummaryCardClose={setStateHandler('stockSummaryCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (locateStockCard !== true && getAccessDashBoard('InventoryMD')) ?
            <div key='p' data-grid={layout[14]} className="block">
              <LocateStock setLocateStockCardClose={setStateHandler('locateStockCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (nonmoveCategoryCard !== true && getAccessDashBoard('InventoryMD')) ?
            <div key='q' data-grid={layout[15]} className="block">
              <NonmoveCategory setNonmoveCategoryCardClose={setStateHandler('nonmoveCategoryCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (linechartCard !== true && getAccessDashBoard('LineChart')) ?
            <div key='r' data-grid={layout[16]} className="block">
              <Linechart setLinechartCardClose={setStateHandler('linechartCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (cashFlowCard !== true && getAccessDashBoard('CashFlow')) ?
            <div key='s' data-grid={layout[17]} className="block">
              <CashFlow setCashFlowCardClose={setStateHandler('cashFlowCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (totalSalesCard !== true && getAccessDashBoard('SalesDashboard')) ?
            <div key='t' data-grid={layout[18]} className="block">
              <TotalSales setTotalSalesCardClose={setStateHandler('totalSalesCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (brandSalesCard !== true && getAccessDashBoard('SalesDashboard')) ?
            <div key='u' data-grid={layout[19]} className="block">
              <BrandSales setBrandSalesCardClose={setStateHandler('brandSalesCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (salesComparisonCard !== true && getAccessDashBoard('SalesDashboard')) ?
            <div key='v' data-grid={layout[20]} className="block">
              <SalesComparison setSalesComparisonCardClose={setStateHandler('salesComparisonCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (areaWiseSaleCard !== true && getAccessDashBoard('SalesDashboard')) ?
            <div key='w' data-grid={layout[21]} className="block">
              <AreaWiseSale setCardClose={setStateHandler('areaWiseSaleCard')} mode={mode} />
            </div>
            :
            " "
        } 


        {/* {
          (todaySalesCard !== true && getAccessDashBoard('SalesDashboard')) ?
            <div key='x' data-grid={layout[24]} className="block">
              <TodaySales setCardClose={setStateHandler('todaySalesCard')} mode={mode} />
            </div>
            :
            " "
        } */}

        {
          (salesTodayCard !== true && getAccessDashBoard('PosUserDashboard')) ?
            <div key='y' data-grid={layout[22]} className="block">
              <SalesToday setSalesTodayCardClose={setStateHandler('salesTodayCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (cashInHandCard !== true && getAccessDashBoard('PosUserDashboard')) ?
            <div key='z' data-grid={layout[23]} className="block">
              <CashInHand setCashInHandCardClose={setStateHandler('cashInHandCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (targetAchievementCard !== true && getAccessDashBoard('PosUserDashboard')) ?
            <div key='aa' data-grid={layout[24]} className="block">
              <TargetAchievement setTargetAchievementCardClose={setStateHandler('targetAchievementCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (posSummaryCard !== true && getAccessDashBoard('PosUserDashboard')) ?
            <div key='ab' data-grid={layout[25]} className="block">
              <PosSummary setPosSummaryCardClose={setStateHandler('posSummaryCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (currentSaleCard !== true && getAccessDashBoard('SalesManDashboard')) ?
            <div key='ac' data-grid={layout[26]} className="block">
              <CurrentSale setCurrentSaleCardClose={setStateHandler('currentSaleCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (targetSaleCard !== true && getAccessDashBoard('SalesManDashboard')) ?
            <div key='ad' data-grid={layout[27]} className="block">
              <TargetSale setTargetSaleCardClose={setStateHandler('targetSaleCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (customerBilledCard !== true && getAccessDashBoard('SalesManDashboard')) ?
            <div key='ae' data-grid={layout[28]} className="block">
              <CustomerBilled setCustomerBilledCardClose={setStateHandler('customerBilledCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (customerUnBilledCard !== true && getAccessDashBoard('SalesManDashboard')) ?
            <div key='af' data-grid={layout[29]} className="block">
              <CustomerUnBilled setCustomerUnBilledCardClose={setStateHandler('customerUnBilledCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (topSalesCard !== true && getAccessDashBoard('SalesManDashboard')) ?
            <div key='ag' data-grid={layout[30]} className="block">
              <TopSales setTopSalesCardClose={setStateHandler('topSalesCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          TotalOutstanding !== true && getAccessDashBoard('SalesManDashboard') ?
            <div key='av' data-grid={layout[31]} className="block">
              <TotalOutstandingCard setTotalOutstandingCardClose={setStateHandler('TotalOutstanding')} mode={mode} />
            </div>
            :
            " "
        }

        {
          OverDue !== true && getAccessDashBoard('SalesManDashboard') ?
            <div key='aw' data-grid={layout[32]} className="block">
              <OverDueCard setOverDueCardClose={setStateHandler('OverDue')} mode={mode} />
            </div>
            :
            " "
        }

        {
          CollectToday !== true && getAccessDashBoard('SalesManDashboard') ?
            <div key='ax' data-grid={layout[33]} className="block">
              <CollectTodayCard setCollectTodayCardClose={setStateHandler('CollectToday')} mode={mode} />
            </div>
            :
            " "
        }
        
        {
          CollectOverDue !== true && getAccessDashBoard('SalesManDashboard') ?
            <div key='ay' data-grid={layout[34]} className="block">
              <CollectOverDueCard setCollectOverDueCardClose={setStateHandler('CollectOverDue')} mode={mode} />
            </div>
            :
            " "
        }

        {
          CollectStatus !== true && getAccessDashBoard('SalesManDashboard') ? 
            <div key='az' data-grid={layout[35]} className="block">
              <CollectStatusCard setCollectStatusCardClose={setStateHandler('CollectStatus')} mode={mode} />
            </div>
            :
            " "
        }

        {
          TopTenOutstanding !== true && getAccessDashBoard('SalesManDashboard') ?
            <div key='ba' data-grid={layout[36]} className="block">
              <TopTenOutstandingCard setTopTenOutstandingCardClose={setStateHandler('TopTenOutstanding')} mode={mode} />
            </div>
            :
            " "
        }
        
        {/* { error
          ChequeBounces !== true ? 
            <div key='bb' data-grid={layout[37]} className="block">
              <ChequeBouncesCard setChequeBouncesCardClose={setStateHandler('ChequeBounces')} mode={mode} />
            </div>
            :
            " "
        } */}

        {
          (visitsReportCard !== true && getAccessDashBoard('visitsReport')) ?
            <div key='ah' data-grid={layout[38]} className="block">
              <VisitsReport setVisitsReportCardClose={setStateHandler('visitsReportCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (employeeCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='ai' data-grid={layout[39]} className="block">
              <EmployeeCard setEmployeeCardClose={setStateHandler('employeeCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (lateCheckCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='aj' data-grid={layout[40]} className="block">
              <LateCheckCards setLateCheckCardClose={setStateHandler('lateCheckCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (earlyCheckoutCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='ak' data-grid={layout[41]} className="block">
              <EarlyCheckoutCards setEarlyCheckoutCardClose={setStateHandler('earlyCheckoutCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (holidayCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='al' data-grid={layout[42]} className="block">
              <HolidayCards setHolidayCardClose={setStateHandler('holidayCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (checkedInCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='am' data-grid={layout[43]} className="block">
              <CheckedIn setCheckedInCardClose={setStateHandler('checkedInCard')} mode={mode} />
            </div>
            :
            " "
        }

        {/* {
          (notCheckedInCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='an' data-grid={layout[44]} className="block">
              <NotCheckedIn setNotCheckedInCardClose={setStateHandler('notCheckedInCard')} mode={mode} />
            </div>
            :
            " "
        } */}

        {
          (lateLoginCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='ao' data-grid={layout[45]} className="block">
              <LateLogin setLateLoginCardClose={setStateHandler('lateLoginCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (completeListCard !== true && getAccessDashBoard('PayrollDashboard')) ?
            <div key='ap' data-grid={layout[46]} className="block">
              <CompleteList setCompleteListCardClose={setStateHandler('completeListCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (saleCard !== true && getAccessDashBoard('WidgetsDetails')) ?
            <div key='aq' data-grid={layout[47]} className="block">
              <SaleCard setSaleCardClose={setStateHandler('saleCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (widgetGrossProfitCard !== true && getAccessDashBoard('WidgetsDetails')) ?
            <div key='ar' data-grid={layout[48]} className="block">
              <WidgetGrossProfit setWidgetGrossProfitCardClose={setStateHandler('widgetGrossProfitCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (roiCard !== true && getAccessDashBoard('WidgetsDetails')) ?
            <div key='as' data-grid={layout[49]} className="block">
              <RoiCard setRoiCardClose={setStateHandler('roiCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (netProfitCard !== true && getAccessDashBoard('WidgetsDetails')) ?
            <div key='at' data-grid={layout[50]} className="block">
              <NetProfit setNetProfitCardClose={setStateHandler('netProfitCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (totalReceivableCard !== true && getAccessDashBoard('PayableReceivableDashboard')) ?
            <div key='bc' data-grid={layout[51]} className="block">
              <TotalReceivables setTotalReceivableCardClose={setStateHandler('totalReceivableCard')} mode={mode} />
            </div>
            :
            " "
        } 

        {
          (totalPayableCard !== true && getAccessDashBoard('PayableReceivableDashboard')) ?
            <div key='bd' data-grid={layout[52]} className="block">
              <TotalPayables setTotalPayableCardClose={setStateHandler('totalPayableCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (todaySalesCard !== true && getAccessDashBoard('SalesDashboard')) ?
            <div key='x' data-grid={layout[53]} className="block">
              <TodaySales setCardClose={setStateHandler('todaySalesCard')} mode={mode} />
            </div>
            :
            " "
        }

        {
          (widgetTopSalesCard !== true && getAccessDashBoard('WidgetsDetails')) ?
            <div key='au' data-grid={layout[54]} className="block">
              <WidgetTopSales setWidgetTopSalesCardClose={setStateHandler('widgetTopSalesCard')} mode={mode} />
            </div>
            :
            " "
        } 

        {
          (availStockCard !== true && getAccessDashBoard('InventoryMD')) ?
            <div key='n' data-grid={layout[55]} className="block">
              <AvailStock setAvailStockCardClose={setStateHandler('availStockCard')} mode={mode} />
            </div>
            :
            " "
        }

      </ResponsiveReactGridLayout>
    </>
  );
}
