import { useLocation } from 'react-router-dom'
import LegacyNewQuotationForm from './oldQuotation/LegacyNewQuotationForm'
import QuotationFormPage from '../quotations/QuotationFormPage'

function NewQuotationForm(props) {
  const location = useLocation()

  if (
    location.pathname.startsWith('/crm/quotation') ||
    location.pathname.startsWith('/crm/quotations')
  ) {
    return <QuotationFormPage mode='create' onClose={props?.handleClose} />
  }

  return <LegacyNewQuotationForm {...props} />
}

export default NewQuotationForm
