import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import InvoiceDialog from '../sales/InvoiceDialog';
import Fab from '@mui/material/Fab';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Tooltip from '@mui/material/Tooltip';
// import ReceiptIcon from '@mui/icons-material/Receipt';

export default function SplitButton(props) {
  const [Dopen, setDopen] = useState(false);
  const [disable, setDisable] = useState(false);

  useEffect(()=>{
    if(props.poOption === '2' && props.showpopup === true){
      setDopen(true);
    }
   else if( props.showpopup === false){
      setDopen(false)
    }else{
      setDopen(true)
    }

  },[props.showpopup])

  


  // console.log(props.tcs,props.tcs_percent,'doopen', Dopen)
  return (
    <React.Fragment>
      <InvoiceDialog
        tableHandleClose={props.handleClose}
        handleDraft={props.handleDraft}
        appConfigData={props.appConfigData}
        note={props.note}
        addNote={props.addNote}
        createMail={props.createMail}
        custData={props.custData}
        invoice={props.invoice}
        soDate={props.soDate}
        sales_items={props.sales_items}
        open={Dopen}
        handleClose={() => setDopen(false)}
        mail_configuration={props.mail_configuration}
        tcs={props.tcs}
        tds={props.tds}
        tcspercent={props.tcs_percent}
        tdspercent={props.tds_percent}
        tds_value={props.tds_value}
        status={props.status}
      />

     <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  }}
>
  <Tooltip>
    {/* <Fab
      size='small'
      onClick={props.payment}
      // disabled={!props.isDisable}
      color='primary'
      sx={{ mb: 1 }}
      aria-label='add'
    >
      <AccountBalanceWalletIcon fontSize='small' />
    </Fab> */}
  </Tooltip>

    {props.isPrint ? (
      <Button
        variant='contained'
        color='primary'
        onClick={() => {
          setDopen(true);
        }}
      >
        View & send PO
      </Button>
        ) : (props.status !== 'edit' && props.poOption !== '2') ? (
      <Button
        variant='contained'
        disabled={!props.isDisable ? true : disable}
        color='primary'
        onClick={() => {
          props.handleSubmit(true, setDisable);
          // setDopen(true);
        }}
      >
        Save & Send PO
      </Button>
    ) : (
      <Button
        variant='contained'
        color='primary'
            disabled={!props.isDisableSaveButton 
             || props.checkReceivingQty  
            }
            onClick={ ()=> {
              props.handleSubmit()
             
        }}
      >
        Save
      </Button>
    )}
  </div>
    </React.Fragment>
  );
}
