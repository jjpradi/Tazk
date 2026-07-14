import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Divider, Box, MenuItem, Select } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { expenseSearchAction, getExpensesByVendorAction } from "redux/actions/expense_actions";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { incomeBasedOnCustomerAction } from "redux/actions/sales_actions";
import { vendorTotalPurchaseAmountAction } from "redux/actions/purchase_actions";

const IncomeExpenseCard = (props) => {
  const dispatch = useDispatch();
  const { ExpenseReducer: { expensesForSixMonths }, //expense
    salesReducer: { incomeBasedOnCustomer },  //income
    erpDetailsReducer: {customer_erp_details},
    purchasesReducer: {getVendorPurchasesAmount}
  } = useSelector((state) => state);

  const [ chartData, setChartData ] = useState([]);
  const [ categories, setCategories ] = useState([]);

  const getLastSixMonths = () => {
    return [ ...Array(6) ]
      .map((_, i) => dayjs().subtract(i, "month").format("MMM YYYY"))
      .reverse();
  };

  useEffect(() => {
    if (props.customer_id !== null && props.customer_id !== undefined && props.customer_id !== '') {
      // console.log("expensesForSixMonths",expensesForSixMonths)
      if (props.customerType === 0 || props.customerType === 1) {
        const payload = {
          customer_id: props.customer_id
        };
        dispatch(incomeBasedOnCustomerAction(payload));
      }
      if (props.customerType === 2) {
        dispatch(vendorTotalPurchaseAmountAction(props.customer_id)) //this is supplier id
      }
    }
  }, [ props.customer_id, props.customerType ]);

  useEffect(() => {
    const months = getLastSixMonths();
    setCategories(months);

    let incomeMap = {};
    let purchaseMap = {};

    if (incomeBasedOnCustomer?.currentMonthSales?.length > 0) {
      incomeBasedOnCustomer.currentMonthSales.forEach((e) => {
        const saleMonth = dayjs(e.sale_month, 'YYYY-MM').format("MMM YYYY");
        incomeMap[saleMonth] = (incomeMap[saleMonth] || 0) + e.total_sales;
      });
    }
  
    if (getVendorPurchasesAmount?.sixMonthsPurchaseIndividual?.length > 0) {
      getVendorPurchasesAmount.sixMonthsPurchaseIndividual.forEach((e) => {
        const month = dayjs(e.purchase_month).format("MMM YYYY");
        purchaseMap[month] = (purchaseMap[month] || 0) + e.total_purchases;
      });
    }

    const incomeData = months.map((m) => incomeMap[ m ] || 0);
    const purchaseAmountData = months.map((m) => purchaseMap[ m ] || 0);

    setChartData(props.customerType === 2 ? purchaseAmountData : incomeData);
  }, [ incomeBasedOnCustomer, getVendorPurchasesAmount, props.customerType ]);

  const sixMonthsAgo = dayjs().subtract(6, 'month');
  const paidAmountLast6Months = customer_erp_details[0]?.timeLine_data
    ?.filter(item => {
      const date = dayjs(item.updated_at, ['DD/MM/YYYY hh:mm A', 'DD/MM/YYYY'], true);
      return item.status === 'paid' && date.isValid() && date.isAfter(sixMonthsAgo);
    })
    .reduce((acc, cur) => acc + (cur.payment_amount || 0), 0)
    .toFixed(2);

  
  return (
    <Card sx={{ padding: "16px", width: "100%" ,boxShadow:"none !important"}}>
      <Box height={300} mt={2}>
        {chartData?.length > 0 ? (
          <Chart
            options={{
              // series:[{data:chartData}],
              xaxis: { categories },
              yaxis: {
                labels: {
                  formatter: function (value) {
                    return value >= 1000 ? (value / 1000).toFixed(2) + "K" : value;
                  },
                },
              },
              
              chart: { type: "bar" },
              plotOptions: { bar: { horizontal: false } },
              dataLabels: { 
                enabled: true,
                formatter: function (val) {
                return val.toFixed(2);
              }}
            }}
            series={[ { name: props.customerType === 2 ? "Purchase" : "Sale", data: chartData } ]}
            type="bar"
            height={300}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            No Data Available
          </Typography>
        )}
      </Box>

      <Typography variant="body1" fontSize='12px'>
        {props.customerType === 2 ? "Total Purchases" : "Total Sale"} (Last 6 Months) : ₹{props.customerType === 2 ? Number(getVendorPurchasesAmount?.sixMonthPurchases || 0).toFixed(2) : Number(incomeBasedOnCustomer?.sixMonthSales || 0).toFixed(2)}
      </Typography>
    </Card>
  );
};

export default IncomeExpenseCard;
