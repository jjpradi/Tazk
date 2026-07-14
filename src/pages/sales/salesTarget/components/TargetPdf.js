import React, { useRef } from 'react';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const formatCurrency = (val) => {
  if (val == null || val === '' || isNaN(val)) return '\u20B90';
  return `\u20B9${Number(val).toLocaleString('en-IN')}`;
};

const cellSx = { fontSize: 11, py: 0.5, px: 1, border: '1px solid #e0e0e0' };
const headerSx = { ...cellSx, fontWeight: 700, bgcolor: '#F5F7FA', fontSize: 10 };

export function TargetLetterPdf({ periodName, rows, companyName }) {
  const ref = useRef();

  const handleDownload = () => {
    const el = ref.current;
    html2canvas(el, { scale: 2, useCORS: true }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth() - 20;
      const ratio = w / canvas.width;
      const h = canvas.height * ratio;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, w, h);
      pdf.save(`TargetLetter_${periodName || 'report'}.pdf`);
    });
  };

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}
        onClick={handleDownload} sx={{ textTransform: 'none' }}>
        Target Letter PDF
      </Button>

      <Box ref={ref} sx={{ position: 'absolute', left: -9999, top: 0, width: 800, bgcolor: '#fff', p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
          {companyName || 'Company'}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, textAlign: 'center', mb: 2 }}>
          Sales Target Assignment — {periodName}
        </Typography>

        <Table size="small" sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>#</TableCell>
              <TableCell sx={headerSx}>Salesman</TableCell>
              <TableCell sx={headerSx}>Location</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Target Value</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Target Qty</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Collection</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>New Cust.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell sx={cellSx}>{i + 1}</TableCell>
                <TableCell sx={cellSx}>{r.employee_name}</TableCell>
                <TableCell sx={cellSx}>{r.location_name || '-'}</TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{formatCurrency(r.target_value)}</TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{r.target_quantity || '-'}</TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{formatCurrency(r.target_collection)}</TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{r.target_new_customers || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Typography sx={{ fontSize: 9, color: '#999', mt: 2, textAlign: 'right' }}>
          Generated on {new Date().toLocaleDateString('en-IN')}
        </Typography>
      </Box>
    </>
  );
}

export function AchievementReportPdf({ periodName, rows, companyName }) {
  const ref = useRef();

  const handleDownload = () => {
    const el = ref.current;
    html2canvas(el, { scale: 2, useCORS: true }).then((canvas) => {
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      const w = pdf.internal.pageSize.getWidth() - 20;
      const ratio = w / canvas.width;
      const h = canvas.height * ratio;

      // Multi-page if content is tall
      const pageH = pdf.internal.pageSize.getHeight() - 20;
      if (h <= pageH) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, w, h);
      } else {
        let y = 0;
        while (y < canvas.height) {
          const sliceH = Math.min(canvas.height - y, pageH / ratio);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          sliceCanvas.getContext('2d').drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          if (y > 0) pdf.addPage();
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 10, 10, w, sliceH * ratio);
          y += sliceH;
        }
      }
      pdf.save(`Achievement_${periodName || 'report'}.pdf`);
    });
  };

  return (
    <>
      <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}
        onClick={handleDownload} sx={{ textTransform: 'none' }}>
        Achievement PDF
      </Button>

      <Box ref={ref} sx={{ position: 'absolute', left: -9999, top: 0, width: 1100, bgcolor: '#fff', p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
          {companyName || 'Company'}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, textAlign: 'center', mb: 2 }}>
          Achievement Report — {periodName}
        </Typography>

        <Table size="small" sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>#</TableCell>
              <TableCell sx={headerSx}>Salesman</TableCell>
              <TableCell sx={headerSx}>Location</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Target</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Achieved</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Gap</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Ach. %</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>Collection</TableCell>
              <TableCell sx={{ ...headerSx, textAlign: 'right' }}>New Cust.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => {
              const tv = Number(r.target_value) || 0;
              const av = Number(r.achieved_value) || 0;
              const pct = tv > 0 ? ((av / tv) * 100) : 0;
              const gap = tv - av;
              return (
                <TableRow key={i}>
                  <TableCell sx={cellSx}>{i + 1}</TableCell>
                  <TableCell sx={cellSx}>{r.employee_name}</TableCell>
                  <TableCell sx={cellSx}>{r.location_name || '-'}</TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{formatCurrency(tv)}</TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right', color: '#2e7d32' }}>{formatCurrency(av)}</TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right', color: gap > 0 ? '#d32f2f' : '#2e7d32' }}>{formatCurrency(Math.abs(gap))}</TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right', fontWeight: 600 }}>{pct.toFixed(1)}%</TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{formatCurrency(r.collection_value || r.achieved_collection)}</TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{r.new_customers || r.achieved_new_customers || 0}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Typography sx={{ fontSize: 9, color: '#999', mt: 2, textAlign: 'right' }}>
          Generated on {new Date().toLocaleDateString('en-IN')}
        </Typography>
      </Box>
    </>
  );
}
