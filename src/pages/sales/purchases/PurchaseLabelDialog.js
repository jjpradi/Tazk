import React, { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from "@mui/material";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";
import CustomPrintQrCode from "./CustomPrintQrCode";
import CustomPrintBarCode from "./CustomPrintBarCode";

const PAGE_SIZE = 20;

export default function PurchaseLabelDialog({
  open,
  onClose,
  labelData = []
}) {

  const [labelType, setLabelType] = useState("qrCode");
  const [page, setPage] = useState(1);

  const printRef = useRef(null);
  const handlePrintAll = () => {
    if (!printRef.current) return;
    const zplText = printRef.current.textContent || "";
    const escapedZpl = zplText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Purchase Labels</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 16px; }
            .print-grid { display: flex; flex-wrap: wrap; gap: 12px; }
            .print-card {
              width: 220px;
              border: 1px solid #ddd;
              border-radius: 6px;
              padding: 8px;
              box-sizing: border-box;
              page-break-inside: avoid;
            }
            .name { font-weight: 700; margin-top: 6px; }
            .text { margin-top: 4px; }
            @media print {
              body { margin: 8px; }
            }
          </style>
        </head>
        <body>
          <pre style="white-space: pre-wrap; font-family: Consolas, monospace;">${escapedZpl}</pre>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  const totalPages = Math.ceil(labelData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return labelData.slice(start, start + PAGE_SIZE);
  }, [labelData, page]);


  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <DialogContent
        dividers
        sx={{
          maxHeight: "65vh",
          overflowY: "auto",
          position: "relative"
        }}
      >
        <Grid container spacing={2}>

          <Grid
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 5,
              backgroundColor: "#fff",
              pb: 1
            }}
            size={12}>
            <Box display="flex" justifyContent="flex-start">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={labelType}
                  label="Type"
                  onChange={(e) => setLabelType(e.target.value)}
                >
                  <MenuItem value="qrCode">QR Code</MenuItem>
                  <MenuItem value="barCode">Bar Code</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

     
          {paginatedData.map((d) => (
            <Grid key={d.lot_number} size={4}>
              <Card sx={{ p: 1 }}>
                {labelType === "qrCode" ? (
                  <QRCode value={d.lot_number} size={120} />
                ) : (
                  <Barcode value={d.lot_number} height={60} />
                )}
                <Typography
                  fontWeight="bold"
                  sx={{
                    maxWidth: "100%",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.2,
                    minHeight: "2.4em",
                    wordBreak: "break-word"
                  }}
                  title={d.name}
                >
                  {d.name}
                </Typography>
                <Typography
                  sx={{
                    maxWidth: "100%",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                  title={d.lot_number}
                >
                  {d.lot_number}
                </Typography>
                <Typography>SP: {d.selling_price}</Typography>
                {Number(d.max_price) !== 0 && (
                  <Typography>MRP: {d.max_price}</Typography>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <div style={{ position: "absolute", left: "-99999px", top: 0 }}>
        {labelType === "qrCode" ? (
          <CustomPrintQrCode ref={printRef} potcode={labelData} />
        ) : (
          <CustomPrintBarCode ref={printRef} potcode={labelData} />
        )}
      </div>
      <DialogActions
        sx={{
          position: "sticky",
          bottom: 0,
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          justifyContent: "space-between",
          px: 2
        }}
      >

        {totalPages > 1 ? (
          <Box>
            <Button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              variant='contained'
              color='primary'
            >
              Prev
            </Button>

            <Typography component="span" mx={2}>
              Page {page} / {totalPages}
            </Typography>

            <Button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              variant='contained'
              color='primary'
            >
              Next
            </Button>
          </Box>
        ) : (
          <span />
        )}


        <Box>
          <Button onClick={onClose} variant="contained" color="error" sx={{mr:'6px'}} >Cancel</Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handlePrintAll}
            disabled={!labelData?.length}
          >
            Print All
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
