import React, {useState} from 'react';
import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {Button, Grid, Typography} from '@mui/material';
import {useEffect} from 'react';
import PosSession from '../../../services/pos_session';
import { font14_500, maxBodyHeight, tabHeight } from 'utils/pageSize';
import moment from 'moment';

export default function ViewReport({
  pos_session,
  index,
  setViewReport,
  handleClose,
  setofflineData,
  offlineData,
  setMoreClick,
}) {
  const [Tdata, setTdata] = useState();

  useEffect(() => {
    const data = pos_session.map((r) => {
      return r;
    });
    setTdata(data[index].posSessionData);
  }, [pos_session]);
  // const formValues=  [{'point of sale': "Vtt",'sesssion id': "1234567890",  'responsible':"vtt@gmail.com", 'opening date':"13/3/2001", 'closing date':"18/2/2002", 'status':"good"},
  // {'point of sale': "shreeni",'sesssion id': "12345678",  'responsible':"vtt@gmail.com", 'opening date':"13/3/2001", 'closing date':"18/2/2002", 'status':"good"}]  ;

  // const [data, setData] = React.useState([]);

  // React.useEffect(() => {
  //   const url = "https://randomuser.me/api/?results=15";
  //   fetch(url)
  //     .then((response) => response.json())
  //     .then((json) => setData(json['results']))
  // }, []);
  const handleClick = async (rowData) => {
    let res = await PosSession.getSalesBySession(rowData.id);
    const sales_data = res.data || [];
    const balance = await res.data?.reduce((acc, obj) => acc + +obj.amount, 0);
    // offlineData[`offline_${rowData.posId}`] = { balance, data: sales_data }
    await setofflineData({
      ...offlineData,
      [`offline_${rowData.posId}`]: {balance, data: sales_data},
    });
    await handleClose(
      rowData.posId,
      rowData.closingDate,
      rowData.id,
      rowData.active,
    );
  };

  return (
    <>
      <MaterialTable
        actions={
          [
            // {
            //   icon: 'edit',
            //   tooltip: 'edit',
            //   position: 'row',
            //   onClick: (event, rowData) => this.handleEdit(rowData.id)
            // },
            // {
            //   icon: 'delete',
            //   tooltip: 'Delete',
            //   onClick: (event, rowData) => this.handledialog(rowData.id)
            // },
            // {
            //   icon: 'add',
            //   tooltip: 'add',
            //   isFreeAction: true,
            //   // onClick: (event, rowData) =>
            // }
          ]
        }
        components={{
          Toolbar: (props) => (
            <div>
              <MTableToolbar {...props} />
            </div>
          ),
        }}
        options={{
          headerStyle: {
            fontSize: 15,
          },
         
            paging: true,
            pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            maxBodyHeight: 'calc(100vh - 300px)',
            minBodyHeight: 'calc(100vh - 300px)',
            overflowY:'visible',
          exportButton: true,
          // filtering: false,
          // pageSize : Tdata.length,
          // actionsColumnIndex: -1,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) =>
                ExportPdf(cols, datas, 'OrderSummary'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) =>
                ExportCsv(cols, datas, 'OrderSummary'),
            },
          ],
        }}
        columns={[
          {
            field: 'posName',
            title: 'Point Of Sale',
            render: (rowData) => (
              <div
                style={{cursor: 'pointer', textDecoration: 'underline'}}
                onClick={() => handleClick(rowData)}
              >
                {rowData.posName}
              </div>
            ),
          },
          {
            field: 'id',
            title: 'Sesssion ID',
          },
          {
            field: 'location_name',
            title: 'Responsible',
          },
          {
            field: 'openingDate',
            title: 'Opening Date',
            render : (rowData)=>{
              return rowData.openingDate ?  moment(rowData.openingDate).format('DD/MM/YYYY hh:mm A') : '-'
            }
          },
          {
            field: 'closingDate',
            title: 'Closing Date',
            render : (rowData)=>{
              return rowData.closingDate ?  moment(rowData.closingDate).format('DD/MM/YYYY hh:mm A') : '-'
            }
          },
          {
            field: 'status',
            title: 'Status',
            //render:(row)=><div style={{display:'flex' }}></div>
          },
        ]}
        data={Tdata}
        title={<Typography variant='h6'>View Report</Typography>}
      />
      <Grid
        container
        spacing={3}
        display='flex'
        justifyContent='flex-end'
        alignItems='center'
        style={{paddingTop: '20px'}}
      >
        <Grid>
          <Button
            variant='contained'
            color='error'
            onClick={() => {
              setViewReport(false);
              setMoreClick(false);
            }}
          >
            Back
          </Button>
          {/* </span> */}
        </Grid>
      </Grid>
    </>
  );
}
// export default ViewReport;

