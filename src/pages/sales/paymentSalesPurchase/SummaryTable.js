import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect } from "react";

function SummaryTable(props){

    const { summaryData, receiptDate, selectionModel, allPaymentModes, Tdata, setTdata } = props


    useEffect(() => {
        const updatedTData = Tdata.map((data) => {
            const saleIds = summaryData.find(summary => summary.paymentCreditNoteId === data.paymentId).sale_id
            return {
                ...data, 
                due: selectionModel.filter(sale => saleIds.includes(sale.id)).reduce((sum, list) => sum + Number(list?.paymentAmount || 0), 0)
            }
        })
        setTdata(updatedTData)
    }, [])

    const getReference = (payment_type, paymentMode) => {
        const payment = Tdata.find(pay => pay.paymentId === paymentMode.paymentId)
        switch(payment_type){
            case 'Cheque':
                return `Chq No: ${payment?.chequeNumber}, Bank: ${payment?.bankName}`
            case 'Card':
            case 'UPI':
            case 'NEFT / RTGS / IMPS':
            case 'NEFT':
            case 'RTGS':
            case 'IMPS':
                return payment?.referenceNumber || ''
            case 'Credit Note':
                return selectionModel.filter(s => s.type === 'Credit Note')[0]?.refNumber || ''
            default:
                return ''
        }
    }

    return(
        <TableContainer style={{minHeight: '430px', maxHeight: '430px', overflow: 'auto'}}>
           <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Transaction Date</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell>Receipt For</TableCell>
                        <TableCell>Receipt Amount</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {
                        summaryData.map((summary) => {
                            const paymentMode = allPaymentModes.find(payment => payment.paymentId === summary.paymentCreditNoteId)
                            const selectedSales = selectionModel.filter(sale => summary.sale_id.includes(sale.id) && sale.type === 'Invoice')
                            const receivedAmount = Tdata.find(pay => pay.paymentId === summary.paymentCreditNoteId)
                        
                            return selectedSales.map((sale, idx) => (
                                <TableRow key={`${summary.paymentCreditNoteId}-${sale.id}`}>
                                    <TableCell>{paymentMode?.payment_type || 'Credit Note'}</TableCell>
                                    <TableCell>{summary.transDate}</TableCell>
                                    <TableCell>{getReference(paymentMode?.payment_type || 'Credit Note', paymentMode)}</TableCell>
                                    <TableCell>{sale.refNumber}</TableCell>
                                    <TableCell>{sale.paymentAmount}</TableCell>
                                </TableRow>
                            ))
                        })
                    }
                </TableBody>
           </Table>
        </TableContainer>
    )
}

export default SummaryTable