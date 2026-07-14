import React, { useContext, useEffect, useRef, useState } from 'react'
import TransactionsTable from './transactions/TransactionsTable'
import CreateNewButtonContext from "context/CreateNewButtonContext";
import apiCalls from 'utils/apiCalls'
import { getSaleOrderDeliveryChallanByCustomerAction } from 'redux/actions'
import { getsessionStorage } from "pages/common/login/cookies";
import { useSelector, useDispatch } from 'react-redux';

const CustomerReceipts = () => {
    const {
        setLoaderStatusHandler,
        setModalTypeHandler
    } = useContext(CreateNewButtonContext);
    const storage = getsessionStorage()
    const dispatch = useDispatch()
    const searchDebounceRef = useRef(null);

    const [pageSize, setPageSize] = useState(20)
    const [page, setPage] = useState(0)
    const [filters, setFilters] = useState({});
    const [searchVal, setSearchVal] = useState('')

    const { salesReducer: { customerPayments } } = useSelector(state => state)

    useEffect(() => {
        const payload = {
            customerId: storage.customer_id,
            type: "customerReceipts",
            searchString: "",
            pageCount: page || 0,
            numPerPage: pageSize || 0
        }
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getSaleOrderDeliveryChallanByCustomerAction(payload))
        )
    }, [])

    const title = 'Customer Receipts'
    const customerPaymentColumns = [
        {
            title: 'Receipt Date',
            field: 'receipt_date'
        },
        {
            title: 'Transaction Date',
            field: 'transactionDate',
        },
        {
            title: 'Receipt Number',
            field: 'receipt_number',
            render: (rowData) => (
                <div
                    style={{
                        textDecoration: 'none',
                        cursor: 'pointer',
                        color: '#03adfc',
                        display: 'inline-block',
                        padding: '5px'
                    }}
                    onClick={(e) => { e.stopPropagation(); handleReceiptTempOpen(rowData, 'Receipts') }}
                >
                    {rowData.receipt_number}
                </div>
            )
        }, {
            title: 'Invoice Adjusted',
            field: 'invoice_adjusted'
        },
        {
            title: 'Amount',
            field: 'paid_amount',
            render: (rowData) => (
                <div
                    style={{
                        textAlign: 'right',
                        minWidth: '60px',
                        maxWidth: '80px',
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {rowData.paid_amount}
                </div>
            )
        },
        {
            title: 'Reference',
            field: 'reference'
        },
        {
            title: 'Note',
            field: 'note'
        },
        {
            title: 'Location',
            field: 'location_name'
        }
    ]

    const fetchPaginatedData = async (page, pageSize) => {
        await apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(getSaleOrderDeliveryChallanByCustomerAction({
                ...filters,
                customerId: storage.customer_id,
                type: null,
                pageCount: page,
                numPerPage: pageSize,
                searchString: '',
            })));
    };

    useEffect(() => {
        setSearchVal('');
        return () => {
            if (searchDebounceRef.current) {
                searchDebounceRef.current.cancel();
            }
        };
    }, []);

    const handlePageChange = async (newPage) => {
        setPage(newPage);
        fetchPaginatedData(newPage, pageSize)
    };


    const handlePageSizeChange = async (newPageSize) => {
        setPageSize(newPageSize);
        setPage(0);
        fetchPaginatedData(0, newPageSize)
    };

    return (

        <TransactionsTable
            tableName={title}
            columns={customerPaymentColumns}
            tableData={customerPayments}
            // saleData={props.customerSalesDetailById}
            // onRowClick={selectedConfig.onRowClick}
            handlePageSizeChange={handlePageSizeChange}
            handlePageChange={handlePageChange}
            page={page}
            pageSize={pageSize}
            selectedTab={"customerReceipts"}
            // setSelectedTab={setSelectedTab}
            customer_id={storage.customer_id}
            filters={filters}
            setFilters={setFilters}
            contactType={"Customer"}
            totalCount={0}
            searchVal={searchVal}
        />
    )
}

export default CustomerReceipts