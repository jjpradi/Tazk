// @flow
import React, {useEffect, useState, useRef} from 'react';
import _ from 'lodash';
import MaterialTable from 'utils/SafeMaterialTable';
import {Grid, Button, Typography} from '@mui/material';
// import theme from '../../theme';
// import {ThemeProvider} from '@mui/material/styles';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize';

const DetailTable = (props) => {
  const [tableData, setTableData] = useState([]);
  const tempedit = useRef(null);

  const edits = () => {
    const {filterId, data} = props;
    if (filterId) {
      const filtering = data.filter((f) => f.id === filterId);
      if (!_.isEmpty(filtering)) {
        const addAward = filtering.map((f) => {
          if (f.id) {
            return f;
          } else if (filtering[0].target_status === 'each') {
            return {
              ...f,
              award:
                (filtering[0].qty / filtering[0].target) * filtering[0].award,
            };
          } else if (filtering[0].target_status === 'total') {
            let products = filtering.length - 1;
            return {...f, target: Math.round(filtering[0].target / products)};
          }
          return null;
        });
        setTableData(addAward);
      }
    }
  };
  tempedit.current = edits;

  useEffect(() => {
    tempedit.current();
  }, []);
  return (
    <div>
      <MaterialTable
        options={{
          headerStyle,
          cellStyle,
          // fixedColumns: {
          //   left: 2,
          //   right: 0
          // },
          exportButton: true,
          filtering: false,
          actionsColumnIndex: -1,
          maxBodyHeight: maxBodyHeight,
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) =>
                ExportPdf(cols, datas, 'SchemeDetail'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) =>
                ExportCsv(cols, datas, 'SchemeDetail'),
            },
          ],
        }}
        columns={[
          {title: 'Scheme&ItemName', field: 'scheme_name'},
          {title: 'Item', field: 'item'},
          {title: 'Brand', field: 'brand'},
          {title: 'CustomerName', field: 'company_name'},
          {title: 'Location', field: 'location_name'},
          {title: 'Target', field: 'target'},
          {title: 'Award', field: 'award'},
          {title: 'Quantity', field: 'qty'},
        ]}
        data={tableData}
        //  parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
        title={<Typography variant='h6'>{props.SchemeName}</Typography>}
      />
      {/* <ThemeProvider theme={theme}> */}
      <Grid
        style={{paddingTop: '20px'}}
        spacing={0}
        // lg={12}
        // md={12}
        // sm={12}
        // xs={12}
        container
        direction='row'
        //
        form={false}
      >
        <Grid
          align='Right'
          form={false}
          size={{
            lg: 12,
            md: 2,
            sm: 6,
            xs: 6
          }}>
          <Button
            onClick={() => props.handleClose()}
            style={{}}
            name='Cancel'
            variant='contained'
            color='secondary'
            size='medium'
            text='button'
            fullWidth={false}
            type='cancel'
          >
            Back
          </Button>
        </Grid>
      </Grid>
      {/* </ThemeProvider> */}
    </div>
  );
};
export default DetailTable;

