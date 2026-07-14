import React from 'react';
import Grid from '@mui/material/Grid';
import {getMonthName, getDateFormat} from '../../utils/getTimeFormat';


function StatementDialog(props) {
  let from = getMonthName(props.from);
  let to = getMonthName(props.to);
  return (
    <div>
      <Grid
        container
        rowSpacing={3}
        justifyContent={'center'}
        textAlign={'center'}
      >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container row>
            <Grid
              style={{fontWeight: 'bold'}}
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              {props.data[0].company_name}
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              Statement of Accounts
            </Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>{`${props.data[0].area}, ${props.data[0].address}`}</Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>{`${props.data[0].city}-${props.data[0].zip}`}</Grid>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>{`${props.data[0].state}, Ph No ${props.data[0].phone_number}`}</Grid>
          </Grid>
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>{`${from} to ${to}`}</Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <tbody>
              <hr style={{width: '600%'}} />
              <tr style={{width: '100%', borderCollapse: 'collapse'}}>
                <th>Date</th>
                <th>Details</th>
                <th>Vch Type</th>
                <th>Vch No</th>
                <th>Debit</th>
                <th>Credit</th>
              </tr>
              <hr style={{width: '600%'}} />
              <tr>
                <td>1-1-2022</td>
                <td>Opening Balance</td>
                <td></td>
                <td></td>
                <td></td>
                <td style={{fontWeight: 'bold'}}>{props.openingBalance}</td>
              </tr>
              {props.data.map((f) => (
                <tr key={f.id}>
                  <td>{f.Date}</td>
                  <td style={{fontWeight: 'bold'}}>{f.name}</td>
                  <td style={{fontWeight: 'bold'}}>{f.voucherType}</td>
                  <td>{f.id}</td>
                  <td>{f.debit}</td>
                  <td>{f.credit}</td>
                </tr>
              ))}
              {/* <tr>
              <td>20-1-2022</td>
              <td style={{fontWeight:"bold"}}>Axis Bank</td>
              <td style={{fontWeight:"bold"}}>Receipt</td>
              <td>635</td>
              <td></td>
              <td>27,059.10</td>
            </tr> */}
            </tbody>
          </table>
          <Grid
            style={{marginTop: 10}}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <hr
              style={{width: '30%', textAlign: 'right', marginRight: 25}}
              noshade
            />
            <Grid container style={{justifyContent: 'right'}}>
              <Grid
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2,
                  xs: 2
                }}>
                2,17,344.07
              </Grid>
            </Grid>
            <Grid container>
              <Grid
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2,
                  xs: 2
                }}>
                Cr
              </Grid>
              <Grid
                style={{fontWeight: 'bold'}}
                size={{
                  lg: 4,
                  md: 4,
                  sm: 4,
                  xs: 4
                }}>
                Closing Balance
              </Grid>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                {props.data[0].closingBalance}
              </Grid>
            </Grid>
            <hr
              style={{width: '30%', textAlign: 'right', marginRight: 25}}
              noshade
            />
            <Grid container style={{justifyContent: 'right'}}>
              <Grid
                style={{fontWeight: 'bold'}}
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2,
                  xs: 2
                }}>
                {props.data[0].closingBalance}
              </Grid>
              <Grid
                style={{fontWeight: 'bold'}}
                size={{
                  lg: 2,
                  md: 2,
                  sm: 2,
                  xs: 2
                }}>
                2,17,344.07
              </Grid>
            </Grid>
            <hr
              style={{
                width: '30%',
                textAlign: 'right',
                marginRight: 20,
                borderWidth: '2px',
                border: '1px solid black',
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default StatementDialog;
