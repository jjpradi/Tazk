import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getBreaksDurationForReportsAction } from "redux/actions/attendance_actions";
import moment from "moment/moment";

const BreakHoursDialog = ({ open, onClose, rowData }) => {

const dispatch = useDispatch();
// console.log(rowData,"propsfd");
const {
    attendanceReducer: { getBreaksDetailsForReport}
  } = useSelector((state) => state);
useEffect(() => {
    let data = {
     employee_id : rowData.employee_id,
     date : rowData.shift_date
    }

    dispatch(getBreaksDurationForReportsAction(data))
    
  }, [rowData]);

const totalBreak = getBreaksDetailsForReport.find(
  (item) => item.break_type === "Total"
);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* <DialogTitle>Break Hours</DialogTitle> */}
      <DialogContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Break Hours</Typography>
          <Box textAlign="right">
            <Typography variant="body2"><b>Employee:</b> {rowData.full_name}</Typography>
            <Typography variant="body2"><b>Date:</b> {moment(rowData.shift_date).format('DD/MM/yyyy')}</Typography>
          </Box>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Break Type</b></TableCell>
              <TableCell><b>Out Time</b></TableCell>
              <TableCell><b>In Time</b></TableCell>
              <TableCell><b>Break Duration</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getBreaksDetailsForReport.filter(row => row.break_type !== "Total").map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.break_type}</TableCell>
                <TableCell>{row.out_time}</TableCell>
                <TableCell>{row.in_time}</TableCell>
                <TableCell>{row.break_duration}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}><b>Total Break Hours</b></TableCell>
              <TableCell><b>{rowData?.total_break_hours || "00:00:00"}</b></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BreakHoursDialog;
