import { useLocation } from 'react-router-dom'
import LegacyQuotationTable from './oldQuotation/LegacyQuotationTable'
import QuotationListPage from '../quotations/QuotationListPage'

function QuotationTable(props) {
  const location = useLocation()

  if (location.pathname.startsWith('/crm/quotation')) {
    return <QuotationListPage />
  }

  return <LegacyQuotationTable {...props} />
}

export default QuotationTable
