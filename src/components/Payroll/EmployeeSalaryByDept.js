import React, { useContext, useEffect, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector, useDispatch } from "react-redux";
import { Box, Grid, IconButton, Typography , Card, ToggleButton, ToggleButtonGroup, FormControl, Select, MenuItem} from "@mui/material";
import { Tabs, Tab } from "@mui/material";
import { salaryBasedCategoryAction, salaryBasedDepartmentAction, salaryByCategoryAction } from "redux/actions/dashboard_role_actions";
import useCommonRef from "pages/common/home/useCommonRef";
import context from "context/CreateNewButtonContext";

function EmployeeSalaryByDepartmentAndCategory(props) {
  const dispatch = useDispatch();

  const {
    DashboardRoleReducer: { salaryBasedDepartment, salaryBasedCategory },
  } = useSelector((state) => state);

  console.log(salaryBasedCategory,"salaryBasedCategory")

  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(context);

  const [activeTab, setActiveTab] = useState(0); 

  // useEffect(() => {
  //   if (activeTab === 0) {
  //     dispatch(salaryBasedDepartmentAction({}, () => {}));
  //   } else {
  //     dispatch(salaryBasedCategoryAction({}, () => {}));
  //   }
  // }, [activeTab]);

  // Format Data for Department and Category
  function formatData(data, yKey, xYearKey, xMonthKey, valueKey) {
    const yAxisLabels = [...new Set(data.map((item) => item[yKey]))];
    const xCategories = [
      ...new Set(
        data.map((item) => `${item[xYearKey]}-${String(item[xMonthKey]).padStart(2, "0")}`)
      ),
    ];

    const seriesData = yAxisLabels.map((yLabel) => ({
      name: yLabel,
      data: xCategories.map((date) => {
        const matchingData = data.find(
          (item) =>
            item[yKey] === yLabel &&
            `${item[xYearKey]}-${String(item[xMonthKey]).padStart(2, "0")}` === date
        );
        return {
          x: date,
          y: matchingData ? matchingData[valueKey] : 0,
        };
      }),
    }));

    return { seriesData, xCategories };
  }

  // Format data for department and category
  const { seriesData: departmentSeries, xCategories: departmentXCategories } =
    formatData(
      props?.data?.salaryByDepartment || [],
      "department_name",
      "salary_year",
      "salary_month",
      "total_earnings"
    );

  const { seriesData: categorySeries, xCategories: categoryXCategories } =
    formatData(
      props?.data?.salaryByCategory || [],
      "category_name",
      "salary_year",
      "salary_month",
      "total_earnings"
    );

  const options = {
    chart: {
      height: 300,
      type: "heatmap",
      toolbar : {
        show : false
      }
    },
    plotOptions: {
      heatmap: {
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ["#fff"],
      },
    },
    xaxis: {
      categories: activeTab === 0 ? departmentXCategories : categoryXCategories,
      labels: {
        rotate: 0,
      },
    },
    colors: ["#008FFB"],
  };

  const chartRef = useRef(null);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const toolbar = chartRef.current?.querySelector(".apexcharts-toolbar");
      if (toolbar) {
        toolbar.style.position = "absolute";
        toolbar.style.right = "40px";
        toolbar.style.top = "-22px";
        toolbar.style.transform = "none";
      }
    });

    if (chartRef.current) {
      observer.observe(chartRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Card
    sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    ref={(el) => {
      props.ref1(el);
      props.isVisibleRef.current = el;
    }}
    >
      <Grid 
        container 
        display = 'flex'
        justifyContent = 'space-between'
        alignItems = 'center'
        style = {{
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '3px' : '13px'
        }}
      >
        <Grid>
          <Typography className="dashboard-card-title" variant="h6">
            {
              activeTab === 0
              ? "Employee Salary By Department"
              : "Employee Salary By Category"
            }
          </Typography>
        </Grid>

        <Grid style={{ marginLeft : 'auto', width : '150px' }}>
          <FormControl
            fullWidth
            size = 'small'
            sx = {{
              '& .MuiOutlinedInput-root': {
                borderRadius : '10px !important',
                backgroundColor : '#f7f7f7 !important',
                color : '#808080',
                height : '25px'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: "none !important"
              },
              '& .MuiMenuItem-root' : {
                color : 'none !important'
              }
            }}
          >
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <MenuItem value={0}>Department</MenuItem>
              <MenuItem value={1}>Category</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid>
          {
            props.mode === 'edit' ? (
            <IconButton
              aria-label="view code"
              onClick={() => props.setCardClose()}
              size="large"
            >
              {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
            </IconButton>
            ) : (
            ''
            )
          }
        </Grid>
      </Grid>
      <Grid
        style={{ marginLeft : '20px' }}
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <ReactApexChart
          options={options}
          series={activeTab === 0 ? departmentSeries : categorySeries}
          type="heatmap"
          height="330"
        />
      </Grid>
    </Card>
  );
}

export default useCommonRef(EmployeeSalaryByDepartmentAndCategory);