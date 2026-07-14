import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const PaymentCollectionOld = lazy(() => import('./paymentCollection.js'));
const PayInOutContraNew = lazy(() => import('./PayInOutContraNew'));

export default function PaymentCollectionWrapper() {
  const location = useLocation();
  const isReport = location.state?.pageType === 'reportPage';

  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>}>
      {isReport ? <PayInOutContraNew /> : <PaymentCollectionOld />}
    </Suspense>
  );
}
