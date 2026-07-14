import * as React from 'react';
import Popover from '@mui/material/Popover';
import {Card, CardContent} from '@mui/material';
import MaterialTable from 'utils/SafeMaterialTable';
import { headerStyle, cellStyle } from 'utils/pageSize';

export default function LotsPopover({
  stockLotItems,
  open,
  anchorEl,
  setLotTable,
  stockReconcilate,
  stockLots,
}) {
  const handleClose = () => {
    setLotTable(false);
  };
  const id = open ? 'simple-popover' : undefined;


  return (
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        elevation= '2'
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
          <Card sx={{minWidth: '5vw', minHeight: '20vh', width: 200}}>
            <CardContent>
              <MaterialTable
                options={{
                  headerStyle,
                  cellStyle,
                  showTitle: false,
                  toolbar: false,
                  pageSize: stockLots.length,
                  exportButton: true,
                }}
                columns={[
                  {
                    title: 'Lot Number',
                    field: 'lotNumber',
                  },
                ]}
                data={stockLots}
                // data = {
                //     stockReconcilate.map((d) => {
                //         return d.lots
                //     })
                //     // stockReconcilate.map((r,i) => {
                //     //     const {tableData, ...record} = r;
                //     //     return { i, ...record}
                //     // })
                // }
              />
            </CardContent>
          </Card>
      </Popover>
  );
}

