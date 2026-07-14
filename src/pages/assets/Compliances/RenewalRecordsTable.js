import MaterialTable from "utils/SafeMaterialTable";
import moment from "moment";
import PropTypes from "prop-types";
import { maxBodyHeight, headerStyle, cellStyle } from "utils/pageSize";
import { useState } from "react";

function RenewalRecordsTable(props){
const [openImage, setOpenImage] = useState(null);
    const columns = [
        {
            field: 'start_date',
            title: 'Window Start',
            render: (rowData) => {
                return rowData.start_date ? moment(rowData.start_date).format('DD/MM/YYYY') : "-"
            }
        },
        {
            field: 'end_date',
            title: 'Window End',
            render: (rowData) => {
                return rowData.end_date ? moment(rowData.end_date).format('DD/MM/YYYY') : "-"
            }
        },
        {
            field: 'status',
            title: 'Status',
            render: (rowData => {
                if(rowData.status === 'ACTIVE_SUB' || rowData.status === 'ACTIVE'){
                    return 'Active'
                }
                else{
                    return 'Expired'
                }
            })
        },
        {
            field: 'Image',
            title: 'Attachment',
            render: (rowData) => {
                console.log(rowData, "dfsdfsd");

                // const imageUrl = rowData?.image?.[0].imageUrl
                const imageUrl = rowData?.image?.[0]?.imageUrl;

                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Attachment"
                        style={{ width: 60, height: 60, objectFit: 'cover' ,cursor : "pointer" }}
                         onClick={() => setOpenImage(imageUrl)}
                    />
                ) : (
                    '-'
                );
            }

        }
    ]

    return(
        <>
        <MaterialTable 
            title = 'Renewal Record'
            columns = {columns}
            data ={props.data}
            totalCount = {props.count}
            options = {{
                headerStyle,
                cellStyle,
                filtering: false,
                actionsColumnIndex: -1,
                pageSize: props.numPerPage,
                pageSizeOptions: [5, 15, 30],
                search: false,
                maxBodyHeight: maxBodyHeight
            }}
            page = {props.pageCount}
            onPageChange = {(page) => props.handlePageChange(page)}
            onRowsPerPageChange = {(size) => props.handlePageSizeChange(size)}
        />
            {
                openImage && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0,0,0,0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor : "pointer",
                            zIndex: 9999
                        }}
                        onClick={() => setOpenImage(null)}
                    >
                        <img
                            src={openImage}
                            alt="Preview"
                            style={{
                                maxWidth: "90%",
                                maxHeight: "90%",
                                borderRadius: 8
                            }}
                        />
                    </div>
                )}
        </>

    )
}

// RenewalRecordsTable.propTypes = {
//     data: PropTypes.object,
//     count: PropTypes.number,
//     numPerPage: PropTypes.number,
//     pageCount: PropTypes.number,
//     handlePageChange: PropTypes.func,
//     handlePageSizeChange: PropTypes.func
// }

export default RenewalRecordsTable
