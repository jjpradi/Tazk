// import * as React from 'react';
import React, {useEffect, useState, useRef, useContext} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import useStyles from './cardStyles';
import Paper from '@mui/material/Paper';
import { Chip } from '@mui/material';
import { getIgst } from 'components/pos/checkout_products/commonTax';

export default function PosSaleProductInfo(props) {
  const c = useStyles();
  const [value, setValue] = useState([]);
  const [computedData, setComputedData] = useState([]);
  useEffect(() => {
    mergeTwoObjects();
  }, [props.posSaleData, props.posSalesItems]);


  const mergeTwoObjects = () => {
    let tempObj = {};
    let tempArr = [];

    props.posSaleData?.map((data) => {
      let temp = props.posSalesItems.find(
        (item) => item.sale_id === data.sale_id,
      );
      tempObj = {...data, ...temp};
      tempArr.push(tempObj);
    });

    setComputedData(tempArr);
  };

  return (
    // <Box>
    // </Box>
    <Card variant='outlined'>
      <MaterialTable
        component={{
          Container: (props) => <Paper {...props} elevation={0} />,
        }}
        // actions={[
        //   {
        //     icon: 'edit',
        //     tooltip: 'edit',
        //     position: 'row',
        //     onClick: (event, rowData) => this.handleEdit(rowData.id),
        //   },
        //   {
        //     icon: 'delete',
        //     tooltip: 'Delete',
        //     onClick: (event, rowData) => this.handledialog(rowData.id),
        //   },
        //   {
        //     icon: 'add',
        //     tooltip: 'add',
        //     isFreeAction: true,
        //     onClick: (event, rowData) =>
        //       this.setState({
        //         edit_id_data: [],
        //         open: true,
        //         status: 'create',
        //       }),
        //   },
        // ]}
        // options={{
        //   headerStyle: {
        //     fontSize: 15
        //   },
        //   exportButton: true,
        //   filtering: false,
        //   actionsColumnIndex: -1,
        //   maxBodyHeight: maxBodyHeight,
        //   pageSize: 20,
        //   pageSizeOptions: [20, 50, 100],
        //   exportMenu: [
        //     {
        //       label: 'Export PDF',
        //       exportFunc: (cols, datas) =>
        //         ExportPdf(cols, datas, 'LedgerListData'),
        //     },
        //     {
        //       label: 'Export CSV',
        //       exportFunc: (cols, datas) =>
        //         ExportCsv(cols, datas, 'LedgerListData'),
        //     },
        //   ],
        // }}
        columns={[
          {field: 'name', title: 'Item name'},
          {field: 'quantity', title: 'Quantity'},
          {
            field: 'soldLots',
            title: 'Lot Number',
            render: (rowData) => {
              return typeof rowData.soldLots[0] !== 'undefined' ? rowData.soldLots.map(lot => lot.lot_number).join(",") : '';
            },
          },
          {field: 'unit_price', title: 'Unit price'},
          {field: 'tax_category', title: 'Gst', render: (rowData) => `${getIgst(rowData)}%`},
          {field: 'total', title: 'Total'},
        ]}
        data={props.posSalesItems}
        title={<Typography variant='h6'>Product Info</Typography>}
      />
    </Card>
  );
}

