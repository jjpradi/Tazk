// SendInvoiceButton.js
import React from 'react';
import Button from '@mui/material/Button';
import MailIcon from '@mui/icons-material/Mail';

const SendInvoiceButton = ({ email, subject, body }) => {
  const handleSendInvoice = () => {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <Button variant="contained" color="primary" onClick={handleSendInvoice}>
      <MailIcon sx={{ mr: 1 }} fontSize="small" />
      SEND INVOICE
    </Button>
  );
};

export default SendInvoiceButton;
