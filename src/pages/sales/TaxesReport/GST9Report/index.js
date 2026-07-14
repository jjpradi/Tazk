import { Box, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGST9ReportAction } from "redux/actions/tax_actions";
import GSTR9Filter from "./GSTR9Filter";
import context from '../../../../context/CreateNewButtonContext';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { getsessionStorage } from "pages/common/login/cookies";
import { getBillingcompany } from "redux/actions/sales_actions";
import { useNavigate } from "react-router-dom";

function GST9Report(){
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { taxReducer: { gst9Report }, salesReducer: { getbillingcompanydetails } } = useSelector(state => state)
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(context);
  const storage = getsessionStorage();
  const subcompany = storage?.subcompany

  const fiscalStart = moment().month() >= 3 ? moment().month(3).startOf('month') : moment().subtract(1, 'year').month(3).startOf('month');
  const fiscalEnd = fiscalStart.clone().add(1, 'year').subtract(1, 'day');

  const [from, setFrom] = useState(fiscalStart);
  const [to, setTo] = useState(fiscalEnd);
  const [dateRange, setDateRange] = useState('Current Fiscal Year')
  const [filterOpen, setFilterOpen] = useState(null)
  const [subcompanyId, setSubcompanyId] = useState('All')

  useEffect(() => { subcompany > 0 && dispatch(getBillingcompany()) }, [subcompany])

  useEffect(() => {
    dispatch(getGST9ReportAction({ fromDate: from, toDate: to, sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler))
  }, [])

  const handleChange = async (data) => {
    if(data.target.name === 'dateRange'){ await setFrom(data.target.value); await setTo(data.target.value1); await setDateRange(data.target.value2); }
    else if(data.target.name === 'subcompanyId'){ setSubcompanyId(data.target.value.sub_company_id) }
    else { let date_val = data.target.value.startOf('day').format('YYYY-MM-DD'); if(data.target.name === 'from') await setFrom(date_val); if(data.target.name === 'to') await setTo(date_val); }
  }

  const clearButton = async () => {
    setFrom(fiscalStart); setTo(fiscalEnd); setDateRange(null); setSubcompanyId('All')
    await dispatch(getGST9ReportAction({ fromDate: fiscalStart, toDate: fiscalEnd, sub_company_id: 'All' }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const ApplyButton = async () => {
    await dispatch(getGST9ReportAction({ fromDate: from, toDate: to, sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const fmt = (v) => parseFloat(v || 0).toFixed(2)
  const d = gst9Report || {}

  const SummaryTable = ({ title, data }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>{title}</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Description</TableCell>
                <TableCell align="right">Taxable Value</TableCell>
                <TableCell align="right">CGST</TableCell>
                <TableCell align="right">SGST</TableCell>
                <TableCell align="right">IGST</TableCell>
                <TableCell align="right">Total Tax</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data || []).map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">{fmt(row.taxable_value)}</TableCell>
                  <TableCell align="right">{fmt(row.cgst)}</TableCell>
                  <TableCell align="right">{fmt(row.sgst)}</TableCell>
                  <TableCell align="right">{fmt(row.igst)}</TableCell>
                  <TableCell align="right">{fmt(row.total_tax)}</TableCell>
                </TableRow>
              ))}
              {(!data || data.length === 0) && (
                <TableRow><TableCell colSpan={6} align="center">No data available</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  return(
    <>
      <Helmet><meta charSet="utf-8" /><title>{titleURL} | GSTR 9</title></Helmet>
      <Box p={2}>
        <Grid container display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant='h6'>
            <Box style={{ display: 'flex' }}>
              <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
              &nbsp;/&nbsp;GSTR 9 (Annual Return)
            </Box>
          </Typography>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <GSTR9Filter fromTo={true} from={from} to={to} subcompanyId={subcompanyId} dateRange={dateRange} handleChange={handleChange} handleClose={() => setFilterOpen(false)} handleOpen={() => setFilterOpen(true)} open={filterOpen} ApplyButton={ApplyButton} clearButton={clearButton} />
          </div>
        </Grid>

        <SummaryTable title="Part II - Outward Supplies" data={d.outward || []} />
        <SummaryTable title="Part III - Inward Supplies" data={d.inward || []} />
        <SummaryTable title="Part IV - Credit / Debit Notes" data={d.adjustments || []} />
        <SummaryTable title="Part V - Tax Paid Summary" data={d.tax_paid || []} />
      </Box>
    </>
  )
}

export default GST9Report
