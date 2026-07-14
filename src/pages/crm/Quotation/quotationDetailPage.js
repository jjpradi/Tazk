import { useLocation, useParams } from 'react-router-dom'
import LegacyQuotationDetailPage from './oldQuotation/LegacyQuotationDetailPage'
import QuotationFormPage from '../quotations/QuotationFormPage'
import QuotationViewPage from '../quotations/QuotationViewPage'

function QuotationDetailPage(props) {
  const location = useLocation()
  const params = useParams()

  if (location.pathname.startsWith('/crm/quotation/')) {
    const searchParams = new URLSearchParams(location.search)
    const mode = searchParams.get('mode')
    const quotationId = params?.quotationId || props?.data?.quotation_id

    if (mode === 'edit') {
      return (
        <QuotationFormPage
          mode='edit'
          quotationId={quotationId}
          onClose={props?.handleClose}
        />
      )
    }

    return <QuotationViewPage quotationId={quotationId} onBack={props?.handleClose} />
  }

  return <LegacyQuotationDetailPage {...props} />
}

export default QuotationDetailPage
