import MaterialTable from "@material-table/core"
import PropTypes from "prop-types"
import { cellStyle, headerStyle } from "utils/pageSize"

function ReceiptTableLanding(props){

    const columns = [
        {
            field: 'receipt_date',
            title: 'Receipt Date'
        },
        {
            field: 'entry_date',
            title: 'Entry Date'
        },
        {
            field: 'receipt_number',
            title: 'Voucher#'
        },
        {
            field: 'payment_amount',
            title: 'Amount'
        },
        {
            field: 'payment_mode',
            title: 'Payment Mode'
        },
        {
            field: 'received_by',
            title: props.title === 'Receipts' ? 'Received By' : 'Payment By'
        }
    ]
console.log(props.data)
    return(
        <MaterialTable
            title={props.title}
            columns = {columns}
            data={props.data}
            options={{
                search: false,
                pageSizeOptions: [5, 10, 20],
                headerStyle: { ...headerStyle, backgroundColor: '#F4F7FE' },
                cellStyle: cellStyle,
            }}
        />
    )

}

ReceiptTableLanding.propTypes = {
    data: PropTypes.array,
    title: PropTypes.string
}

export default ReceiptTableLanding