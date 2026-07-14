import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useMemo
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Card,
  Chip,
  Grid,
  Typography,
  Box
} from '@mui/material';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import ReactToPrint from 'react-to-print';
import { useDispatch } from 'react-redux';

import { potCodeAction } from '../../../redux/actions/purchase_actions';
import CustomPrintQrCode from './CustomPrintQrCode';
import CustomPrintBarCode from './CustomPrintBarCode';
import { getIgst } from '../../../components/pos/checkout_products/commonTax';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';

const PAGE_SIZE = 20;

export default function AlertDialog({
  pot_code_seq,
  row_id,
  potCodeSubmit,
  serialPopClose,
  formValues,
  labelType,
  type,
  list,
  from,
  validateForm
}) {
  const dispatch = useDispatch();
  const { setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const [open, setOpen] = useState(false);
  const [potcode, setPotcode] = useState([]);
  const [page, setPage] = useState(1);

  const pagePrintRef = useRef(null);
  const allPrintRef = useRef(null);

  const {
    name,
    model,
    max_price,
    item_unit_price: cp,
    receiving_quantity,
    received_quantity,
    price_list_mrp,
    offer_price,
    assetCode,
    ownerName
  } = row_id.data;

  const handleClickOpen = () => {


    const qty = Number(receiving_quantity);
    if (!qty) return;

    dispatch(
      potCodeAction(qty, setLoaderStatusHandler, (res) => {
        if (res === 200) {
          if (validateForm && !validateForm()) return;
          setOpen(true);
        }
      })
    );
  };

  const handleClose = () => {
    setOpen(false);
    serialPopClose();
    setPage(1);
  };
  const componentRef = useRef(null);
  useEffect(() => {

    if (list === 'asset') {
      setOpen(true)
    }
    if (!open || !pot_code_seq?.length) return;

    const selling_price =
      type === 'barCodeQrGenerator'
        ? offer_price
        : (cp + (cp / 100) * getIgst(row_id.data)).toFixed(2);

    const lots = Object.values(formValues).filter(
      d => d.lot_number && !d.lot_id
    );

    const mappedLots = lots.map(d => ({
      ...d,
      name,
      model,
      max_price,
      price_list_mrp,
      selling_price
    }));

    const mappedSeq = pot_code_seq.map(d => ({
      ...d,
      name,
      model,
      max_price,
      price_list_mrp,
      selling_price
    }));

    if (+receiving_quantity && mappedLots.length !== received_quantity) {
      setPotcode(mappedSeq);

      const { current_seq, sequence_id } =
        mappedSeq[mappedSeq.length - 1] || {};

      potCodeSubmit(
        [...mappedSeq, ...mappedLots],
        current_seq,
        sequence_id
      );
    } else if (mappedLots.length === received_quantity) {
      setPotcode(mappedLots);
      potCodeSubmit(mappedLots, '', '', from);
    } else {
      setPotcode(mappedLots);
    }
  }, [open, pot_code_seq]);

  const totalPages = Math.ceil(potcode.length / PAGE_SIZE);

  const paginatedPotcode = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return potcode.slice(start, start + PAGE_SIZE);
  }, [potcode, page]);

  /* ---------------- UI ---------------- */
  return (
    <>
      {list !== 'asset' && (
        <Chip
          color="primary"
          disabled={!receiving_quantity}
          label={
            'View Label'
          }
          onClick={handleClickOpen}
        />
      )}
      <Dialog open={open} maxWidth={list === 'asset' ? 'sm' : 'lg'} fullWidth>
        <DialogContent
          dividers
          sx={{
            maxHeight: '65vh',
            overflowY: 'auto'
          }}
        >
          <Grid container spacing={2}>
            {list === 'asset' ? (
              <>
                <Grid
                  size={{
                    xs: 4,
                    lg: 12
                  }}>
                  <Grid sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Grid sx={{ display: 'flex', flexDirection: 'column' }}>
                      <QRCode
                        size={230}
                        style={{ height: '70%', width: '70%' }}
                        value={`${assetCode}`}
                        viewBox={`0 0 256 256`}
                      />
                      <Typography variant='h3' sx={{ ml: 10, mt: 2 }}>{assetCode}</Typography>
                    </Grid>
                    <Grid sx={{ display: 'flex', flexDirection: 'column', mt: 10 }}>
                      <Typography variant="h4" sx={{ fontWeight: 500 }}>Property of</Typography>
                      <Typography variant="h4" sx={{ mt: 2 }}>{ownerName}</Typography>
                    </Grid>
                  </Grid>
                </Grid>

              </>
            ) : (
              paginatedPotcode.map(d => (
                <Grid key={d.lot_number} size={4}>
                  {labelType === 'qrCode' ? (
                    <Card sx={{ p: 1 }}>
                      <QRCode value={d.lot_number} size={120} />
                      <Typography
                        fontWeight="bold"
                        sx={{
                          maxWidth: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2,
                          minHeight: '2.4em',
                          wordBreak: 'break-word'
                        }}
                        title={d.name}
                      >
                        {d.name}
                      </Typography>
                      <Typography
                        sx={{
                          maxWidth: '100%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
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
                  ) : (
                    <Card sx={{ p: 1, textAlign: 'center' }}>
                      <Barcode value={d.lot_number} height={60} />
                      <Typography
                        fontWeight="bold"
                        sx={{
                          maxWidth: '100%',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.2,
                          minHeight: '2.4em',
                          wordBreak: 'break-word'
                        }}
                        title={d.name}
                      >
                        {d.name}
                      </Typography>
                      <Typography>SP: {d.selling_price}</Typography>
                      {Number(d.max_price) !== 0 && (
                        <Typography>MRP: {d.max_price}</Typography>
                      )}
                    </Card>
                  )}
                </Grid>
              ))
            )}
          </Grid>
        </DialogContent>




        <div style={{ display: 'none' }}>

          {labelType === 'qrCode' ?
            <div>
              {
                list === 'asset' ? (
                  <>
                    <CustomPrintQrCode type='asset' assetCode={assetCode} ref={componentRef} />
                  </>
                ) : (
                  <>
                    <CustomPrintQrCode
                      ref={allPrintRef}
                      potcode={potcode}
                    />
                  </>
                )
              }
            </div> :
            <div>
              <CustomPrintBarCode
                ref={allPrintRef}
                potcode={potcode}
              />
            </div>}
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
        
                {list !== 'asset' && totalPages > 1 ? (
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
               <Button onClick={handleClose} variant="contained" color="error">Close</Button>
        
                    {list === 'asset' ? (
            <ReactToPrint
              trigger={() => <Button color="primary">Print</Button>}
              content={() => componentRef.current}
            />
          )
            : ''}
                </Box>
              </DialogActions>

      </Dialog>
    </>
  );
}
