import React, { useCallback, useEffect, useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Card, Tabs, Tab, Typography, Grid, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { companyLoanDueForDashbooardAction } from "redux/actions/allLoans_actions";
import { setDashboardPollingTimerIdsAction } from "redux/actions/dashboard_role_actions";
import useCommonRef from "pages/common/home/useCommonRef";
import NoRecordFound from "components/Layout/NoRecordFound";
import moment from "moment";

const LoanDueDashboard = (props) => {
    const dispatch = useDispatch();
    const {
        AllLoansReducer: { companyLoansDue },
    } = useSelector((state) => state);
    const [tabIndex, setTabIndex] = useState(0);
    // const [pollTimer, setPollTimer] = useState(null);

    // useEffect(() => {
    //     dispatch(companyLoanDueForDashbooardAction());
    // }, [dispatch]);

    const today = new Date();
    const currentMonth = today.toLocaleString("en-US", { month: "short" }); 

    const currentMonthDues = props?.data?.filter(
        (loan) => loan.currentMonthEMI?.Month === currentMonth
    ) || [];

    const displayedLoans = tabIndex === 0 ? currentMonthDues : props?.data;

 
// const pollData = useCallback(() => {
//     dispatch(companyLoanDueForDashbooardAction())
// }, [dispatch]);


// useEffect(() => {
//     if (props.inViewport === true) {
//       setTimeout(() => {
//         const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
//         if (props.inViewport === false) {
//           clearTimeout(timer);
//         }
//         dispatch(setDashboardPollingTimerIdsAction(timer));
//         setPollTimer(timer );
//       }, props.DASHBOARD_API_POLL_TIMING);

//     } else {
//       clearTimeout(pollTimer);
//     }

//     return () => clearTimeout(pollTimer);
    
//   }, [props.inViewport]);
    
// console.log("propsprops",props);

    return (
        <div
        
        >
            <Card 
            ref={(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }} 
            sx={{ padding: '18px', paddingTop : '13px', width:' 100%',minHeight: '390px'  }}>
                <Typography variant="h6" gutterBottom>
                    Loan Due
                </Typography>
                {/* <Grid size={{ xs: 2, sm: 1, md: 1, lg: 0.5 }}> */}
          {
              props.mode === 'edit' ?
                  <IconButton
                      aria-label='view code'
                      onClick={() => props.setCardClose()}
                      size='large'
                      sx={{
                        position: 'absolute',
                        top: 5,
                        right: 20,
                      }}
                  >
                      {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                  </IconButton>
                  :
                  ''
          }
           {/* </Grid> */}

                <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)}>
                    <Tab label="Current Month Due" />
                    <Tab label="Overall Due" />
                </Tabs>

                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    <Grid size={12}>
                        <Table >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Loan Account Number</TableCell>
                                    <TableCell>Bank Name</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {displayedLoans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell>{loan.loan_account_number}</TableCell>
                                        <TableCell>{loan.bank_name}</TableCell>
                                        <TableCell>
                                            {loan.currentMonthEMI?.Date ? moment(loan.currentMonthEMI.Date).format("DD/MM/YYYY") : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {tabIndex === 0
                                                ? loan.currentMonthEMI?.EMI
                                                : loan.overallDue}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>{props?.data?.length === 0 && (
                  <TableBody>
                    <TableRow display='flex'>
                      <TableCell align='center' colSpan={9} sx={{ py: 3 }}>
                        <NoRecordFound />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
                        </Table>
                    </Grid>
                </Grid>
            </Card>
        </div>
    );
};

export default useCommonRef(LoanDueDashboard);
