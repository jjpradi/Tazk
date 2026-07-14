import MaterialTable from "@material-table/core";
import { maxBodyHeight, headerStyle, cellStyle } from "utils/pageSize";

export default function Assetdetails(props) {

  const rawData = props.data;

  const tableData = Array.isArray(rawData)
    ? rawData
    : rawData
    ? [rawData]
    : [];
  
  const columns = [
    { field: "code", title: "Code" },
    { field: "asset_group", title: "Group" },
    { field: "asset_type", title: "Type" },
    { field: "status", title: "Status" },
    { field: "asset_condition", title: "Condition" },
    { field: "asset_cost", title: "Asset Cost" },

  ];

  return (
    <MaterialTable
      title="Asset Details"
      data={tableData}
      columns={columns}
      options={{
        headerStyle,
        cellStyle,
        filtering: false,
        actionsColumnIndex: -1,
        paging: false,
        search: false,
        maxBodyHeight: maxBodyHeight
      }}
        page={props.pageCount || 0}
      totalCount={props.count || tableData.length}
      onPageChange={(page) => props.handlePageChange(page)}
      onRowsPerPageChange={(size) => props.handlePageSizeChange(size)}
    />
  );
}