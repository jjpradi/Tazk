import { Box, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGST3BReportAction } from "redux/actions/tax_actions";
import GSTR3BFilter from "./GSTR3BFilter";
import context from '../../../../context/CreateNewButtonContext';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { getsessionStorage } from "pages/common/login/cookies";
import { getBillingcompany } from "redux/actions/sales_actions";
import { useNavigate } from "react-router-dom";

const hdrSx = {
  py: 0.75, px: 1.5, fontWeight: 700, fontSize: '0.75rem',
  textTransform: 'uppercase', letterSpacing: 0.3, bgcolor: '#f5f5f5',
  borderBottom: '2px solid #e0e0e0', whiteSpace: 'nowrap',
};
const cellSx = { py: 0.75, px: 1.5, fontSize: '0.8125rem', borderBottom: '1px solid #e0e0e0' };
const boldCellSx = { ...cellSx, fontWeight: 700 };
const numSx = { ...cellSx, fontFamily: 'monospace' };
const boldNumSx = { ...numSx, fontWeight: 700 };

const fmt = (v) => {
  const n = parseFloat(v || 0);
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function GST3BReport() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { taxReducer: { gst3bReport }, salesReducer: { getbillingcompanydetails } } = useSelector(state => state)
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(context);
  const storage = getsessionStorage();
  const subcompany = storage?.subcompany

  const [from, setFrom] = useState(moment().startOf('month'));
  const [to, setTo] = useState(moment().endOf('month'));
  const [dateRange, setDateRange] = useState('This Month')
  const [filterOpen, setFilterOpen] = useState(null)
  const [subcompanyId, setSubcompanyId] = useState('All')

  useEffect(() => { subcompany > 0 && dispatch(getBillingcompany()) }, [subcompany])

  useEffect(() => {
    dispatch(getGST3BReportAction({ fromDate: from, toDate: to, sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler))
  }, [])

  const handleChange = async (data) => {
    if (data.target.name === 'dateRange') { await setFrom(data.target.value); await setTo(data.target.value1); await setDateRange(data.target.value2); }
    else if (data.target.name === 'subcompanyId') { setSubcompanyId(data.target.value.sub_company_id) }
    else { let date_val = data.target.value.startOf('day').format('YYYY-MM-DD'); if (data.target.name === 'from') await setFrom(date_val); if (data.target.name === 'to') await setTo(date_val); }
  }

  const clearButton = async () => {
    setFrom(moment().startOf('month')); setTo(moment().endOf('month')); setDateRange(null); setSubcompanyId('All')
    await dispatch(getGST3BReportAction({ fromDate: moment().startOf('month'), toDate: moment().endOf('month'), sub_company_id: 'All' }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const ApplyButton = async () => {
    await dispatch(getGST3BReportAction({ fromDate: from, toDate: to, sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const d = gst3bReport || {}
  const o = (d.outward || [])[0] || {}
  const i = (d.inward || [])[0] || {}
  // 3.1 rows
  const outwardTotalRow = {
    taxable: o.taxable_value, igst: o.igst, cgst: o.cgst, sgst: o.sgst, cess: 0,
  };
  const section31Rows = [
    { label: '(a) Outward taxable supplies (other than zero rated, nil rated and exempted)', ...outwardTotalRow },
    { label: '(b) Outward taxable supplies (zero rated)', taxable: 0, igst: 0, cgst: null, sgst: null, cess: 0 },
    { label: '(c) Other outward supplies (Nil rated, exempted)', taxable: 0, igst: null, cgst: null, sgst: null, cess: null },
    { label: '(d) Inward supplies (liable to reverse charge)', taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
    { label: '(e) Non-GST outward supplies', taxable: 0, igst: null, cgst: null, sgst: null, cess: null },
  ];
  const totalRow31 = {
    taxable: (o.taxable_value || 0),
    igst: (o.igst || 0), cgst: (o.cgst || 0), sgst: (o.sgst || 0), cess: 0,
  };

  // 4. Eligible ITC
  const itcRows = [
    { label: '(1) Import of Goods', igst: 0, cgst: null, sgst: null, cess: 0 },
    { label: '(2) Import of Services', igst: 0, cgst: null, sgst: null, cess: 0 },
    { label: '(3) Inward supplies liable to reverse charge (other than 1 & 2 above)', igst: 0, cgst: 0, sgst: 0, cess: 0 },
    { label: '(4) Inward supplies from ISD', igst: null, cgst: null, sgst: null, cess: null, note: true },
    { label: '(5) All other ITC', igst: i.igst, cgst: i.cgst, sgst: i.sgst, cess: 0 },
  ];

  // 5.1 Tax Payable
  const netIgst = (d.net_igst || 0);
  const netCgst = (d.net_cgst || 0);
  const netSgst = (d.net_sgst || 0);

  const fromFormatted = moment(from).format('DD/MM/YYYY');
  const toFormatted = moment(to).format('DD/MM/YYYY');

  return (
    <>
      <Helmet><meta charSet="utf-8" /><title>{titleURL} | GSTR 3B</title></Helmet>
      <Box
        sx={{
          p: 2,
          height: 'calc(100vh - 80px)',
          overflowY: 'auto',
        }}
      >
        <Grid container display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant='h6'>
            <Box style={{ display: 'flex' }}>
              <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
              &nbsp;/&nbsp;GSTR 3B
            </Box>
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <GSTR3BFilter fromTo={true} from={from} to={to} subcompanyId={subcompanyId} dateRange={dateRange} handleChange={handleChange} handleClose={() => setFilterOpen(false)} handleOpen={() => setFilterOpen(true)} open={filterOpen} ApplyButton={ApplyButton} clearButton={clearButton} />
          </div>
        </Grid>

        {/* Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" fontWeight="bold">GSTR-3B Summary</Typography>
            <Typography variant="body2" color="text.secondary">From {fromFormatted} To {toFormatted}</Typography>
          </CardContent>
        </Card>

        {/* 3.1 Details of Outward Supplies */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              3.1 Details of Outward Supplies and inward supplies liable to reverse charge
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={hdrSx}>Nature of Supply</TableCell>
                    <TableCell align="right" sx={hdrSx}>Taxable Value</TableCell>
                    <TableCell align="right" sx={hdrSx}>Integrated Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>Central Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>State/UT Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>CESS Tax</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section31Rows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={cellSx}>{row.label}</TableCell>
                      <TableCell align="right" sx={numSx}>{fmt(row.taxable)}</TableCell>
                      <TableCell align="right" sx={numSx}>{row.igst !== null ? fmt(row.igst) : ''}</TableCell>
                      <TableCell align="right" sx={numSx}>{row.cgst !== null ? fmt(row.cgst) : ''}</TableCell>
                      <TableCell align="right" sx={numSx}>{row.sgst !== null ? fmt(row.sgst) : ''}</TableCell>
                      <TableCell align="right" sx={numSx}>{row.cess !== null ? fmt(row.cess) : ''}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={boldCellSx}>Total value</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(totalRow31.taxable)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(totalRow31.igst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(totalRow31.cgst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(totalRow31.sgst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(totalRow31.cess)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* 3.2 Inter-State Supplies */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              3.2 Of the supplies shown in 3.1 (a) above, details of inter-State supplies made to unregistered persons, composition taxable persons and UIN holders
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={hdrSx}>Description</TableCell>
                    <TableCell align="right" sx={hdrSx}>Place of Supply</TableCell>
                    <TableCell align="right" sx={hdrSx}>Taxable Value</TableCell>
                    <TableCell align="right" sx={hdrSx}>Integrated Tax</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={cellSx}>Supplies made to Unregistered Persons</TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={cellSx}>Supplies made to Composition Taxable Persons</TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={cellSx}>Supplies made to UIN holders</TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                    <TableCell align="right" sx={numSx}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* 4. Eligible ITC */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>4. Eligible ITC</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={hdrSx}>Details</TableCell>
                    <TableCell align="right" sx={hdrSx}>Integrated Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>Central Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>State/UT Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>CESS Tax</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={boldCellSx} colSpan={5}>(A) ITC Available (whether in full or part)</TableCell>
                  </TableRow>
                  {itcRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ ...cellSx, pl: 4 }}>{row.label}</TableCell>
                      {row.note ? (
                        <TableCell align="center" colSpan={4} sx={{ ...cellSx, color: 'text.secondary', fontStyle: 'italic' }}>
                          - - - Not tracked - - -
                        </TableCell>
                      ) : (
                        <>
                          <TableCell align="right" sx={numSx}>{row.igst !== null ? fmt(row.igst) : ''}</TableCell>
                          <TableCell align="right" sx={numSx}>{row.cgst !== null ? fmt(row.cgst) : ''}</TableCell>
                          <TableCell align="right" sx={numSx}>{row.sgst !== null ? fmt(row.sgst) : ''}</TableCell>
                          <TableCell align="right" sx={numSx}>{row.cess !== null ? fmt(row.cess) : ''}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* 5. Values of exempt, nil-rated and non-GST inward supplies */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              5. Values of exempt, nil-rated and non-GST inward supplies
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={hdrSx}>Nature of Supply</TableCell>
                    <TableCell align="right" sx={hdrSx}>Inter-State Supplies</TableCell>
                    <TableCell align="right" sx={hdrSx}>Intra-State Supplies</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={cellSx}>Composition Scheme, Exempted, Nil Rated</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(0)}</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={cellSx}>Non-GST supply</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(0)}</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* 5.1 Tax Payable Summary */}
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>5.1 Tax Payable</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={hdrSx}>Description</TableCell>
                    <TableCell align="right" sx={hdrSx}>Integrated Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>Central Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>State/UT Tax</TableCell>
                    <TableCell align="right" sx={hdrSx}>CESS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={boldCellSx}>Tax payable</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(o.igst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(o.cgst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(o.sgst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={cellSx}>Tax paid through ITC</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(i.igst)}</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(i.cgst)}</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(i.sgst)}</TableCell>
                    <TableCell align="right" sx={numSx}>{fmt(0)}</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#fafafa', borderTop: '2px solid #e0e0e0' }}>
                    <TableCell sx={boldCellSx}>Net Tax Payable</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(netIgst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(netCgst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(netSgst)}</TableCell>
                    <TableCell align="right" sx={boldNumSx}>{fmt(0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default GST3BReport
