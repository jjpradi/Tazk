import MaterialTable from "utils/SafeMaterialTable"
import { ExportCsv, ExportPdf } from "@material-table/exporters"
import PropTypes from "prop-types"

function Products(props){

    const replacingProductColumns = [
        {
            field: 'name',
            title: 'Item'
        },
        {
            field: 'description',
            title: 'Description'
        },
        {
            field: 'quantity',
            title: 'Qty'
        },
        {
            field: 'lot_number',
            title: 'Defect Lot Number'
        }
    ]

    const replacedProductColumns = [
        {
            field: 'name',
            title: 'Item'
        },
        {
            field: 'description',
            title: 'Description'
        },
        {
            field: 'quantity',
            title: 'Qty'
        },
        {
            field: 'lot_number',
            title: 'Replaced Lot Number'
        }
    ]

    const collectDefectColumns = [
        {
            field: 'name',
            title: 'Item'
        },
        {
            field: 'quantity',
            title: 'Qty'
        },
        {
            field: 'lot_number',
            title: 'Lot Number'
        },
        {
            field: 'item_unit_price',
            title: 'Sold Price'
        },
        {
            field: 'product_total',
            title: 'Sub Total'
        }
    ]
    
        const sendDefectColumns = [
        {
            field: 'name',
            title: 'Item'
        },
        {
            field: 'quantity',
            title: 'Qty'
        },
        {
            field: 'lot_number',
            title: 'Lot Number'
        },
        {
            field: 'item_cost_price',
            title: 'Purchased Price'
        },
        {
            field: 'product_total',
            title: 'Sub Total'
        }
    ]

    const getFileName = () => {
        switch(props.type){
            case 'replacingProduct':
                return 'Defect Product'

            case 'collectDefect':
                return 'Products Collected'
            
            case 'sendDefect':
                return 'Products Sent'

            case 'replacedProduct':
                return 'Replaced Product'

            default:
                return ''
        }
    }

    return(
        <MaterialTable
            title={props.type === 'collectDefect' ? 'Products Collected' : props.type === 'sendDefect' ? 'Products Sent' : props.type === 'replacingProduct' ? 'Defect Product' : 'Replaced Product'}
            columns={props.type === 'collectDefect' ? collectDefectColumns : props.type === 'sendDefect' ? sendDefectColumns : props.type === 'replacingProduct' ? replacingProductColumns : replacedProductColumns}
            data={props.type === 'collectDefect' || props.type === 'sendDefect' ? props.data?.defectItems || [] : props.type === 'replacingProduct' ? props.data?.replacingItems || [] : props.data?.replacedItems || []}
            options={{
                toolbar: true,
                search: false,
                pageSizeOptions: [20, 50, 100],
                minBodyHeight: '300px',
                maxBodyHeight: '300px',
                exportButton: true,
                exportMenu: [
                    {
                        label: 'Export PDF',
                        exportFunc: (cols, data) => {
                            ExportPdf(cols, data, getFileName())
                        }
                    },
                    {
                        label: 'Export CSV',
                        exportFunc: (cols, data) => {
                            ExportCsv(cols, data, getFileName())
                        }
                    }
                ]
            }}
        />
    )
}

Products.propTypes = {
    data: PropTypes.object
}

export default Products
