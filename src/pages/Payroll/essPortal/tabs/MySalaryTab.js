import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Divider,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function MySalaryTab() {
  const { EssPortalReducer: { mySalaryStructure, mySalaryDeductions } } = useSelector((s) => s);

  const allowances = mySalaryStructure || [];
  const deductions = mySalaryDeductions || [];

  const structureName = allowances.length > 0 ? allowances[0].structure_name : null;
  const fromDate = allowances.length > 0 ? allowances[0].from_date : null;
  const toDate = allowances.length > 0 ? allowances[0].to_date : null;

  const totalAllowance = allowances.reduce((sum, a) => sum + (parseFloat(a.allowance_amount) || 0), 0);
  const totalDeduction = deductions.reduce((sum, d) => sum + (parseFloat(d.deduction_amount) || 0), 0);
  const netPay = totalAllowance - totalDeduction;

  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>My Salary Structure</Typography>

      {allowances.length === 0 && deductions.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
            No salary structure assigned yet. Contact HR for details.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Header */}
          {structureName && (
            <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: '#f5f5f5' }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box>
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Structure</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{structureName}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Effective From</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{fromDate || '-'}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Effective To</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{toDate || 'Present'}</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Summary Cards */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', borderLeft: '3px solid #2e7d32' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
                  <Box>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Total Earnings</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2e7d32' }}>
                      {totalAllowance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', borderLeft: '3px solid #d32f2f' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon sx={{ fontSize: 20, color: '#d32f2f' }} />
                  <Box>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Total Deductions</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#d32f2f' }}>
                      {totalDeduction.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', borderLeft: '3px solid #1976d2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                  <Box>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>Net Pay</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#1976d2' }}>
                      {netPay.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Tables */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: '#2e7d32' }}>Earnings / Allowances</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Component</TableCell>
                      <TableCell align='right' sx={{ fontSize: 11, fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allowances.map((a) => (
                      <TableRow key={a.allowance_id}>
                        <TableCell sx={{ fontSize: 12 }}>{a.allowance_name}</TableCell>
                        <TableCell align='right' sx={{ fontSize: 12, fontWeight: 500 }}>
                          {parseFloat(a.allowance_amount || 0).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Chip size='small' label={a.amount_type || 'Fixed'}
                            sx={{ fontSize: 10, height: 20 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>Total</TableCell>
                      <TableCell align='right' sx={{ fontSize: 12, fontWeight: 700 }}>
                        {totalAllowance.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: '#d32f2f' }}>Deductions</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>Component</TableCell>
                      <TableCell align='right' sx={{ fontSize: 11, fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deductions.map((d) => (
                      <TableRow key={d.deduction_id}>
                        <TableCell sx={{ fontSize: 12 }}>{d.deduction_name}</TableCell>
                        <TableCell align='right' sx={{ fontSize: 12, fontWeight: 500 }}>
                          {parseFloat(d.deduction_amount || 0).toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {deductions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} sx={{ textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>
                          No deductions
                        </TableCell>
                      </TableRow>
                    )}
                    {deductions.length > 0 && (
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>Total</TableCell>
                        <TableCell align='right' sx={{ fontSize: 12, fontWeight: 700 }}>
                          {totalDeduction.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
