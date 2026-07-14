import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
  IconButton
} from "@mui/material";
import useCommonRef from "pages/common/home/useCommonRef";
import employeIcon from "../../assets/dashboardIcons/employees.svg";
import presentIcon from "../../assets/dashboardIcons/presentIcon.png";
import absentIcon from "../../assets/dashboardIcons/absent.png";
import { useSelector } from "react-redux";

function AttendanceCombinedCard(props) {
  const combinedData = props.data.reduce(
    (acc, obj) => ({ ...acc, ...obj }),
    {}
  );

  const {
    PayrolldashboardReducers: { employeeCount },
  } = useSelector((state) => state);

  return (
    <div
      ref={(el) => {
        props.ref1(el);
        props.isVisibleRef.current = el;
      }}
      style={{ height: '100%' }}
    >
      <Card sx={{ borderRadius: 3, p: 4, position: 'relative', height: '100%'}}>
        {props.mode === 'edit' && (
          <IconButton
            aria-label='view code'
            onClick={() => props.setCardClose()}
            size='large'
            sx={{
              position: 'absolute',
              top: 8,
              left: 5
            }}
          >
            {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
          </IconButton>
        )}
        <CardContent>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            sx={{ textAlign: "center" }}
          >
            <Grid size="grow">
              <Box>
                <Box sx={{ width: 35, mx: "auto" }}>
                  <img
                    src={employeIcon}
                    alt="Employees"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Employees
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {/* {combinedData.empCount ?? 0} */}
                  {employeeCount.empCount ?? 0}
                </Typography>
              </Box>
            </Grid>

            <Divider orientation="vertical" flexItem />

            <Grid size="grow">
              <Box>
                <Box sx={{ width: 35, mx: "auto" }}>
                  <img
                    src={presentIcon}
                    alt="Present"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  No of Present
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {/* {combinedData.present_count ?? 0} */}
                  {employeeCount.checkincount ?? 0}
                </Typography>
              </Box>
            </Grid>

            <Divider orientation="vertical" flexItem />

            <Grid size="grow">
              <Box>
                <Box sx={{ width: 35, mx: "auto" }}>
                  <img
                    src={absentIcon}
                    alt="Absent"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  No of Absent
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {/* {combinedData.absent_count ?? 0} */}
                  {employeeCount.notcheckIn ?? 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}

export default useCommonRef(AttendanceCombinedCard);
