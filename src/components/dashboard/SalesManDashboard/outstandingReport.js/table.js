import MaterialTable from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TableBody,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getTop10OutstandingReportAction} from 'redux/actions/salesMan_action';
import apiCalls from 'utils/apiCalls';
import { dasboardPageSize } from 'utils/pageSize';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import Top10Outstanding from './tableRow';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';


export default function TopOutstandingTable(props) {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const {
    salesManReducer: {top10OutstandingReport},
  } = useSelector((state) => state);

  useEffect(() => {
    if(props.inView){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          getTop10OutstandingReportAction(
            commoncookie,
            setModalTypeHandler,
            setLoaderStatusHandler,
          ),
        )
      );
    }
  }, [props.inView]);

  return (
    <>
      {/* <Typography variant='h6' p='15px 0px'>Top 10 Outstandings</Typography> */}
      <MaterialTable
        options={{
          headerStyle,
          cellStyle,
          exportButton: true,
          filtering: false,
          maxBodyHeight: '60vh',
          actionsColumnIndex: -1,
           pageSize: dasboardPageSize,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) => ExportPdf(cols, datas, 'Contra'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) => ExportCsv(cols, datas, 'Contra'),
            },
          ],
        }}
        columns={[
          {
            title: 'Customer Name',
            field: 'company_name',
          },
          {
            title: 'Invoice Number',
            field: 'invoice_number',
          },
          {
            title: 'Invoice Date',
            field: 'invoice_date',
          },
          {
            title: 'Invoice Amount',
            field: 'total',
            // cellStyle: {
            //   textAlign: 'right', paddingRight: '60px',
            //   fontSize: '12px'
            // },
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
                {rowData.total.toFixed(2)}
              </div>
            )

          },
          {
            title: 'Due Amount',
            field: 'due_amount',
            // cellStyle: {
            //   textAlign: 'right', paddingRight: '82px',
            //   fontSize: '12px'
            // },
            render : (rowData)=>(
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
                {rowData.due_amount.toFixed(2)}
              </div>
            )

          },
          {
            title: 'Due Days',
            field: 'due_days',
          },
        ]}
        data={top10OutstandingReport}
        title={<h3 style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight}}>Top 10 Outstandings</h3>}
      />

      {/* <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Invoice Date</TableCell>
              <TableCell>Invoice Amount</TableCell>
              <TableCell>Due Amount</TableCell>
              <TableCell>Due Days</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {top10OutstandingReport.map((row) => (
              <Top10Outstanding row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
    </>
  );
}

