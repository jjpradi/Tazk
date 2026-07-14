import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Tabs, Tab, Grid, Card } from "@mui/material";
import { viewSelfieAttendanceImagesAction } from "redux/actions/attendance_actions";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

// const payableData = [
//   { id: 1, startDate: "2025-03-24", endDate: "2024-03-24", start_location: "STOCKTRANSFER", end_location: "STOCKTRANSFER", startTime: null, endTime: null, difference: null },
//   { id: 2, startDate: "2025-02-27", endDate: "2025-02-27", start_location: "Main", end_location: "Main", startTime: null, endTime: null, difference: null },
//   { id: 3, startDate: "2025-03-22", endDate: "2025-03-22", start_location: "STOCKTRANSFER", end_location: "STOCKTRANSFER", startTime: null, endTime: null, difference: null },
//   { id: 4, startDate: "2025-03-19", endDate: "2025-03-19", start_location: "HMD", end_location: "HMD", startTime: null, endTime: null, difference: null },
// ];

const AttendanceLog = () => {
  const { attendanceReducer: { selfie_images }, } = useSelector((state) => state);
  const [tabValue, setTabValue] = useState(0);
  const dispatch = useDispatch();
  const today = moment();
  const [formValues, setFormValues] = useState({
    empName: [''],
    location: [''],
    department: [''],
    date: moment().format('YYYY-MM-DD'),
  });
  useEffect(() => {
    let data = {
      ...formValues,
      searchString: '',
      date: moment().format('YYYY-MM-DD'),
      type: tabValue
    };
    dispatch(viewSelfieAttendanceImagesAction(data));
  }, []);

  const handleChange = (newValue) => {
    setTabValue(newValue)
    let data = {
      ...formValues,
      searchString: '',
      date: moment().format('YYYY-MM-DD'),
      type: newValue
    };
    dispatch(viewSelfieAttendanceImagesAction(data));
  }

  console.log(tabValue, 'tabValue')
  // const filterDataByTab = () => {
  //   switch (tabValue) {
  //     case 0:
  //       return payableData;
  //     case 1:
  //       return payableData.filter((row) =>
  //         moment(row.startDate).isSame(today, "week")
  //       );
  //     case 2:
  //       return payableData.filter((row) =>
  //         moment(row.startDate).isSame(today, "month")
  //       );
  //     case 3:
  //       return payableData.filter((row) =>
  //         moment(row.startDate).isSame(moment().subtract(1, "month"), "month")
  //       );
  //     default:
  //       return payableData;
  //   }
  // };

  const filteredData = selfie_images;

  const columns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 80,
      sortable: false,
      filterable: false,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1,
    },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "startTime", headerName: "Check In", flex: 1 },
    { field: "endTime", headerName: "Check Out", flex: 1 },
    { field: "difference", headerName: "Spend Time", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
  ];

  return (
    <Card style={{ display: "flex", flexDirection: "column", height: 'calc(100vh - 80px)', overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => handleChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" />
          <Tab label="Week" />
          <Tab label="Month" />
          <Tab label="Last Month" />
        </Tabs>

        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          <DataGrid
            rows={filteredData}
            columns={columns}
            
            pageSizeOptions={[5]}
            disableRowSelectionOnClick
            autoHeight
            style={{ flex: 1, overflow: "hidden" }}
            sx={{
              '& .MuiDataGrid-overlay': {
                backgroundColor: 'transparent', // ⬅️ removes gray/white background
              },
            }} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
          />
        </div>
      </div>
    </Card>

  );


};

export default AttendanceLog;
