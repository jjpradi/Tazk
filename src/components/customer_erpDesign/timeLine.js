import { Button, Typography } from '@mui/material';
import * as React from 'react';
import TimelineDesign from '../erpDesign/timeline_design';

export default function OppositeContentTimeline(props) {
  let customerDetails = props.customer_erp_details?.[0];

  let timeLine_data = [];

  if (customerDetails) {
    const { timeLine_data: timeline, last_bill_child } = customerDetails;

    const poToInvoiceMap = {};
    last_bill_child.forEach(item => {
      if (item.po_number) {
        poToInvoiceMap[item.po_number] = item.invoice_number || '';
      }
    });

    timeLine_data = [...timeline]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .map(item => ({
        ...item,
        invoice_number: poToInvoiceMap[item.po_number] || item.invoice_number,
      }));
  }

  const formatAmount = (value) => Number(value || 0).toFixed(2);

    // console.log(timeLine_data,props.customer_erp_details[0],'6tgyftddfdfdfdf')
  
  function getCustomerTimeLine(m) {
    
    const descriptionObj = {
      1: 'Sales Order',
      2: 'Sales Invoice',
      3: 'On Hold',
      4: 'Ready To Ship',
      5: 'In Transit',
      6: 'Delivered',
      8: 'Delivery Challan',
      19: 'Edited',
      20:'Receipt Deleted',
      21:'Cheque Bounce',
      23:'Opening Balance',
      0: 'SO Deleted'
    }

    const titleObj = {
      2: 'Invoice Added',
      10: 'Payment Added',
      11: 'Receipt Deleted',
      1: 'Sales Order',
      8: 'Delivery Challan',
      'CN' : m.total > 0 ? 'Credit Noted Added' : 'Credit Note Used',
      12: 'Sales Order Updated',
      26: 'Vendor Linked',
      27: 'Vendor Unlinked',
      15 : 'Contact',
      16 : 'Contact Updated',
      20:'Receipt Deleted',
      21:'Cheque Entry',
      24:'Opening Balance',
      25:'Opening Balance Update',
      0: 'SO Deleted'
    }

    const contentObj = {
      2: `Invoice ${m.invoice_number} of amount ₹${formatAmount(m.total)} created by ${m.username} `,
      8: `Delivery Challan ${m.dc_number} created by ${m.username} `,
      10 : `${ m.invoice_number ? `Invoice ${m.invoice_number}` : `Sale Order ${m.so_number}`} of amount ₹${formatAmount(m.payment_amount)} Received by ${m.username}`,
      11: `Receipt ${m.receipt_number} has been deleted by ${m.username}`,
      1: `${m.so_number ? `Sales Order ${m.so_number}, ` : ''}created by ${m.username}`,
      'CN' : m.total > 0 ? `Credit Note ${m.sequence_number} of amount ₹${formatAmount(m.total)} Added by ${m.username || ''}` : `Credit Note of amount ₹${formatAmount(Math.abs(m.total))} Used for Invoice ${m.invoice_number} by ${m.username || ''}`,
      12: `Sales Order ${m.so_number} has been updated by ${m.username}`,
      26: `${m.supplier_name} has been linked successfully`,
      27: `${m.supplier_name} has been unlinked successfully`,
      15 : `Contact has been created by ${m.username}`,
      16 : `Contact has been Updated by ${m.username}`,
      20: `Receipt ${m.receipt_number} of amount ₹${formatAmount(m.payment_amount)} has been deleted`,
      21 :`Cheque for ${m.receipt_number} of amount ₹${formatAmount(m.payment_amount)} has been received`,
      23 :`Opening Balance for ${m.receipt_number} of amount ₹${formatAmount(m.payment_amount)} has been received`,
      24 :`Opening Balance amount of ₹${formatAmount(m.payment_amount)} Created for ${m.username}`,
      25 :`Opening Balance update amount of ₹${formatAmount(m.payment_amount)} updated by ${m.username}`,
      0 : `Sales Order ${m.so_number} has been deleted by ${m.username}`
    }

    function status_description() {
      if (m.status in descriptionObj) {
        return descriptionObj[m.status];
      } else {
        return 'Cancelled'
      }
    }

    function title() {
      if (m.status in titleObj) {
        return titleObj[m.status];
      } else {
        return 'Updated'
      }
    }
    function content() {
      if (m.status in contentObj) {  
        return contentObj[m.status];
      } else if (m.status === 7) {
        const heading = m.invoice_number ? 'Invoice' : 'Delivery Challan';
        const reference = m.invoice_number || m.dc_number;
         return `${heading} ${reference ? reference : ''} Cancelled by ${m.username}`;
      } else {
        const refStatus = m.status === 19 ? 'Sales Order' : 'Invoice'
        return `${refStatus} ${m.invoice_number || m.so_number} marked as ${status_description()} by ${m.username} `
      }
    }

    return {
      status_description,
      title,
      content
    }

  }
  function getSupplierTimeLine(m) {

     const invoiceText = m.invoice_number ? `INV${m.invoice_number} ` : '';

    const titleObj = {
      'New': 'Purchase Order',
      'Open': 'Invoice Added',
      'paid': 'Payment Added',
      'CN' : m.total > 0 ? 'Debit Noted Added' : 'Debit Note Used',
      'link': 'Customer Linked',
      'unlink': 'Customer Unlinked',
      'Payment Delete': 'Payment Deleted',
      'Pending Payment': 'Bills Added',
      'updated': 'Update Payment',
      'Purchase Return': 'Purchase Return',
      'Contact Created' : 'Created',
      'Opening Balance' : 'Opening Balance',
      'Contact Updated' : 'Contact Updated',
      'Opening Balance Update' : 'Opening Balance Update',
      'PO Delete' : 'PO Deleted',
      'Bills Delete' : 'Bills Delete',
      'Expense Delete' : 'Expense Delete',
      'DN Delete' : m.dnstatus ? 'DN Delete' : ''
    }

    const contentObj = {
      'New': `Purchase Order (${m.po_number}) of amount ₹${formatAmount(m.total)}  created`,
      'Open': `Purchase Order ${invoiceText} (${m.po_number}) of amount ₹${formatAmount(m.received_amount)}  created and mail has been sent to ${m.username}`,
      'received': `Purchase Order ${invoiceText} (${m.po_number}) of ordered quantity has been delivered by ${m.username}`,
      'CN' : m.total > 0 ? `Debit Note ${m.sequence_number} of amount ₹${formatAmount(m.total)} added by ${m.username}` : `Debit Note of amount ₹${formatAmount(Math.abs(m.total))} Used for Purchase Payment ${m.po_number} by ${m.username}`,
      'link': `${m.customer_name} has been linked successfully`,
      'unlink': `${m.customer_name} has been unlinked successfully`,
      'Payment Delete': `Payment (${m.receipt_number}) of amount ₹${formatAmount(m.payment_amount)} has been deleted`,
      'Pending Payment': `Bills (${m.po_number}) of amount ₹${formatAmount(m.total)} created by ${m.username}`,
      'updated': `Bills (${m.po_number}) of amount ₹${formatAmount(m.payment_amount)} paid `,
      'Purchase Return' : `Bills (${m.po_number}) of amount ₹${formatAmount(m.total)} returned`,
      'Opening Balance Receipt' :`Opening Balance for ${m.receipt_number} of amount ₹${formatAmount(m.payment_amount)} has been received`,
      'Opening Balance' :`Opening Balance amount of ₹${formatAmount(m.payment_amount)} Created for ${m.username}`,
      'Opening Balance Update':`Opening Balance update amount of ₹${formatAmount(m.payment_amount)} updated by ${m.username}`,
      'Contact Created' : `Contact has been created by ${m.username}`,
      'Contact Updated' : `Contact has been Updated by ${m.username}`,
      'PO Delete': `Purchase Order ${m.po_number} has been deleted`,
      'Bills Delete': `Invoice ${m.po_number} has been deleted`,
      'Expense Delete' : `Expense ${m.expense_id} has been deleted by ${m.username}`,
      'DN Delete' : `Debit Note ${m.sequencenumber} has been deleted`,
    }
    function title() {
      if (m.status in titleObj) {
        return titleObj[m.status];
      } else {
        return 'Updated'
      }
    }
    function content() {
      if (m.status in contentObj) {
        return contentObj[m.status];
      } else {
        return `Bills ${invoiceText} (${m.po_number}) of amount ₹${m.status === 'paid' ? m.payment_amount || 0 : m.total} paid `
      }
    }

    return {
      title,
      content
    }

  }
  console.log(timeLine_data,'timeLine_data');

    const [visibleCount, setVisibleCount] = React.useState(10);

   const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10); // Show 10 more items each time
  };

  const visibleItems = timeLine_data.slice(0, visibleCount);

  console.log(visibleCount , timeLine_data.length,'timwell888')
  
  return (
    <React.Fragment>
      <Typography variant='h6' style={{paddingLeft: 10 }}>TimeLine</Typography>

      {props.contactType === 'Customer'
        ? visibleItems?.map((m, ind) => {
            let title = getCustomerTimeLine(m).title();
            let content = getCustomerTimeLine(m).content();
            return (
            <>
              <TimelineDesign key={ind} m={m} title={title} content={content} contactType={'Customer'}/>
            </>);
          })
        : visibleItems?.map((m, ind) => {
          console.log('mg5555',m)
              let title = getSupplierTimeLine(m).title();
              let content = getSupplierTimeLine(m).content();
              return <TimelineDesign key={ind} m={m} title={title} content={content} />;
          })}

          {visibleCount < timeLine_data.length && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Button variant="outlined" onClick={handleShowMore}>
                    Show More
                  </Button>
                </div>
              )}
          
    </React.Fragment>
  );
}
