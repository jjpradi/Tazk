// @flow
import React, {useRef, useState, useEffect} from 'react';
import {Card, Divider, Grid} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {useSelector} from 'react-redux';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import moment from "moment";

function CashBoxSummary({posId, CashBoxClick, s_id, active}) {
  const {
    cashBoxReducer: {cash_box_summary, cash_box_denomination, cash_box_list},
    posSessionReducer: {pos_session},
  } = useSelector((store) => store);

  const [sessionData, setSessionData] = useState({
    closing_date: '',
    openingDate: '',
    opening_balance: '',
    closing_balance: '',
  });

  useEffect(() => { (async () => {
    if (active && s_id && active === 'D') {
      let PosSession = await pos_session.filter((f) => f.posId === posId);
      if (PosSession.length) {
        let session_data = await PosSession[0]?.posSessionData.filter(
          (f) => f.id === s_id,
        );
        if (session_data.length) {
          await setSessionData({
            closing_date: session_data[0].closingDate,
            openingDate: session_data[0].openingDate,
            opening_balance: session_data[0].opening_balance,
            closing_balance: session_data[0].closing_balance,
          });
        }
      }
    }
  })();
}, [active, s_id, posId]);

  let isDenominationAllowed = false
  if(cash_box_summary.length > 0){
    isDenominationAllowed = cash_box_summary[0]?.allowdenomination === 1 ? true : false;
  }

  console.log(cash_box_summary[0]?.closing_date,sessionData?.closing_date,'dateisuueueeee',cash_box_summary)

  return (
    <Card
      sx={{
      minWidth: '60vw',
      p: '20px',
        // minHeight: CashBoxClick === true ? '15vh' : '44vh',
      }}
    >
      {CashBoxClick === true ? (
        <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
          CASHBOX SUMMARY
        </Typography>
      ) : (
        ' '
      )}
      <Grid container display='flex' flexDirection='row' alignItems='center' justifyContent='space-between' >
        <Grid
          size={{
            xs: 4,
            sm: 6,
            md: 3,
            lg: 4
          }}>
          <Typography
            variant='h6'
            gutterBottom
            // style={{paddingLeft: '20px'}}
          >
            CLOSING :{' '}
            {cash_box_summary.length > 0 &&
            sessionData.closing_balance === ''
              ? cash_box_summary[0].closing_balance
              : sessionData.closing_balance}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 4,
            sm: 6,
            md: 3,
            lg: 4
          }}>
          <Typography
            variant='h6' 
            gutterBottom
            // style={{paddingLeft: '20px'}}
          >
            OPENING :{' '}
            {cash_box_summary.length > 0 &&
            sessionData.opening_balance === ''
              ? cash_box_summary[0].opening_balance
              : sessionData.opening_balance}
          </Typography>
        </Grid>
        <Grid
          size={{
            xs: 4,
            sm: 6,
            md: 3,
            lg: 4
          }}>
          <Typography
            variant='h6' 
            // style={{paddingLeft: '20px'}}
          >
            CLOSING DATE :{' '}
            {
            
            cash_box_summary.length > 0 &&  
            (sessionData.closing_date === ''
              ? moment(cash_box_summary[0].closing_date).format('DD/MM/YYYY')
              : moment(sessionData.closing_date).format('DD/MM/YYYY')
              )
              }
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      {isDenominationAllowed && (
        <Grid container direction='row' spacing={2} pt='10px'>
          <Grid
            size={{
              xs: 6,
              sm: 6,
              md: 6,
              lg: 6
            }}>
            <TableContainer component={Paper}  sx={{ maxHeight: '30vh', minHeight: '30vh' }}>
              <Table sx={{minWidth: 200}} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell style={{textAlign:"center"}}>Denomination</TableCell>
                    <TableCell  style={{textAlign:"center"}}>Count</TableCell>
                    <TableCell  style={{textAlign:"center"}}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cash_box_summary.slice(0, 5).map((summary) => {
                    let denomination = cash_box_denomination.filter(
                      (f) => f.id === summary.denomination_dtl_id,
                    )[0]?.denomination;
                    return (
                      <TableRow
                        key={summary.denomination_dtl_id}
                        sx={{
                          '&:last-child td, &:last-child th': {border: 0},
                        }}
                      >
                        <TableCell component='th' scope='row'  style={{textAlign:"center"}}>
                          {denomination}
                        </TableCell>
                        <TableCell align='left'  style={{textAlign:"center"}}>
                          {summary.current_balance_count}
                        </TableCell>
                        <TableCell width={50} style={{ textAlign: "right", paddingRight: 30 }}>
                          {!isNaN(summary.current_balance_count * denomination)
                            ? summary.current_balance_count * denomination
                            : 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid
            size={{
              xs: 6,
              sm: 6,
              md: 6,
              lg: 6
            }}>
            <TableContainer component={Paper} sx={{ maxHeight: '30vh', minHeight: '30vh' }}>
              <Table sx={{minWidth: 200}} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell style={{textAlign:"center"}}>Denomination</TableCell>
                    <TableCell style={{textAlign:"center"}}>Count</TableCell>
                    <TableCell style={{textAlign:"center"}}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cash_box_summary.slice(5, 10).map((summary) => {
                    let denomination = cash_box_denomination.filter(
                      (f) => f.id === summary.denomination_dtl_id,
                    )[0]?.denomination;
                    return (
                      <TableRow
                        key={summary.denomination_dtl_id}
                        sx={{
                          '&:last-child td, &:last-child th': {border: 0},
                        }}
                      >
                        <TableCell style={{textAlign:"center"}} component='th' scope='row'>
                          {denomination}
                        </TableCell>
                        <TableCell style={{textAlign:"center"}} align='left'>
                          {summary.current_balance_count}
                        </TableCell>
                        <TableCell width={50}  style={{textAlign:'right',paddingRight:30}}>
                          {summary.current_balance_count * denomination}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Card>
  );
}
export default CashBoxSummary;
