import MaterialTable, { MTableBody, MTableToolbar } from 'utils/SafeMaterialTable';
import { Card, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import context from 'context/CreateNewButtonContext';
import {
  headerStyle,
  cellStyle,
  Time12Hr,
} from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import { commonDateFormat } from 'utils/getTimeFormat';

function EmployeeAttCorrections(props) {
  const {
    setLoaderStatusHandler,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
  } = useContext(context);

  const [open, setOpen] = useState(true)
  const [isApiFinished, setIsApiFinished] = useState(false)

  useEffect(() => {
    if (props.mode === 'edit') {
      setOpen(false)
    }
    else {
      setOpen(true)
    }
  }, [props.mode])

  const commonCellStyle = {
    fontFamily: "poppins",
    fontSize: "11px",
    fontWeight: "400",
    color: 'rgba(0, 0, 0, 0.7)',
  };
console.log("erfretgrtg",props);

  const validData = Array.isArray(props.data)
    ? props.data.filter(obj => obj && Object.keys(obj).length > 0)
    : [];

  const tableData = validData.length > 0 ? validData : [{ noData: true }];

  return (
    <>
      <style>
        {`
            ::-webkit-scrollbar-button {
                display : none
            }
            ::-webkit-scrollbar {
                width : 10px
            }
            ::-webkit-scrollbar-thumb {
                background-color : #888
                border-radius : 10px
            }
            ::-webkit-scrollbar-thumb:hover {
                background-color : #555
            }
        `}
      </style>
      <Card
        ref={(el) => {
          props.ref1(el)
          props.isVisibleRef.current = el
        }}
        sx={{ width: '100%', height: '100%', overflow: 'auto', maxHeight: '600px' }}>

        <MaterialTable
          style={{ border: 'none', boxShadow: 'none', overflow: 'auto' }}
          totalCount={validData.length}
          page={props.page}
          onPageChange={(page) => props.handlePageChange(page)}
          onRowsPerPageChange={(size) => props.handlePageSizeChange(size)}
          components={{
            Toolbar: (props) => (
              <>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <div style={{ width: '100%' }}>
                    <MTableToolbar {...props} />
                  </div>
                </div>
              </>
            ),
             Body: (bodyProps) => {
              if (
                bodyProps.renderData.length === 1 &&
                bodyProps.renderData[0].noData
              ) {
                return (
                  <tbody>
                    <tr>
                      <td colSpan={bodyProps.columns.length}>
                        <div
                          style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'rgba(0,0,0,0.6)',
                            fontFamily: 'poppins',
                          }}
                        >
                          No records to display
                        </div>
                      </td>
                    </tr>
                  </tbody>
                );
              }
              return <MTableBody {...bodyProps} />;
            }
          }}
          options={{
            showEmptyDataSourceMessage: props.purpose === 'employee' ? props.lateLoginApiFinished : isApiFinished,
            headerStyle,
            cellStyle,
            paging: props.purpose === 'employee' ? true : false,
            search: false,
            maxBodyHeight: '430px',
            exportButton: false,
          }}
          actions={[
            {
              icon: () => props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
              // tooltip: 'Close',
              isFreeAction: true,
              hidden: open,
              // onClick: (event) => alert("You want to add a new row")
              onClick: () => props.setCardClose()
            }
          ]}
          columns={[
            {
              field: 'date',
              title: 'Date',
              headerStyle: {
                fontFamily: "poppins",
                fontSize: "12px",
                fontWeight: "600",
                color: 'rgba(0, 0, 0, 0.7)'
              },
              cellStyle: commonCellStyle,
              render: (rowData) =>
                <div>
                  {rowData.date
                    ? commonDateFormat(rowData.date)
                    : ''}
                </div>
            },
            // {
            //   field: 'request_type',
            //   title: 'Request',
            //   cellStyle: commonCellStyle,
            //   render: (rowData) =>

            //     rowData.request_type ? rowData.request_type : '-',

            // },

            {
              field: 'start_time',
              title: 'Check-In Time',
              headerStyle: {
                fontFamily: "poppins",
                fontSize: "12px",
                fontWeight: "600",
                color: 'rgba(0, 0, 0, 0.7)'
              },
              cellStyle: commonCellStyle,
              render: (rowData) => {
                if (!rowData.start_time) return '';
                const [hours, minutes] = rowData.start_time.split(':');
                const h = ((+hours % 12) || 12);
                const ampm = +hours < 12 ? 'AM' : 'PM';
                return `${h}:${minutes} ${ampm}`;
              }
            },
            // {
            //   field: 'duration',
            //   title: 'Late Duration',
            //   headerStyle: {
            //     fontFamily: "poppins",
            //     fontSize: "12px",
            //     fontWeight: "600",
            //     color: 'rgba(0, 0, 0, 0.7)'
            //   },
            //   cellStyle: commonCellStyle,
            //   render: (rowData) => 
            //   <div>
            //   {rowData.Startduration
            //     ? Duration(rowData.Startduration)
            //     : rowData.late_login_duration ?  Duration(rowData.late_login_duration) : '-'}
            // </div>
            // },
            {
              field: 'end_time',
              title: 'CheckOut Time',
              headerStyle: {
                fontFamily: "poppins",
                fontSize: "12px",
                fontWeight: "600",
                color: 'rgba(0, 0, 0, 0.7)'
              },
              cellStyle: commonCellStyle,
              render: (rowData) => {
                if (!rowData.end_time) return '';
                const [hours, minutes] = rowData.end_time.split(':');
                const h = ((+hours % 12) || 12);
                const ampm = +hours < 12 ? 'AM' : 'PM';
                return `${h}:${minutes} ${ampm}`;
              }
            },
              {
                  field: 'status',
                  title: 'Status',
                  headerStyle: {
                      fontFamily: "poppins",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: 'rgba(0, 0, 0, 0.7)'
                  },
                  cellStyle: { textTransform: "capitalize", ...commonCellStyle },
                  render: (rowData) =>
                      // rowData.first_name ? rowData.first_name + (rowData.last_name && rowData.last_name.length > 0 ? ' ' + rowData.last_name : '') : '-',
                      rowData.status ? rowData.status : ''
              },
            // {
            //   field: 'early_logout_duration',
            //   title: 'Early Duration',
            //   headerStyle: {
            //     fontFamily: "poppins",
            //     fontSize: "12px",
            //     fontWeight: "600",
            //     color: 'rgba(0, 0, 0, 0.7)'
            //   },
            //   cellStyle: commonCellStyle,
            //   render: (rowData) => 
            //   <div>
            //   {rowData.Endduration
            //     ? Duration(rowData.Endduration)
            //     : rowData.early_logout_duration
            //     ?   Duration(rowData.early_logout_duration
            //     ) : '-'}
            // </div>
            // },
          ]}
          data={tableData}
          title={
            <Typography
              className='dashboard-card-title'
              variant='h6'
              align='left'
              style={{
                padding: '5px',
                paddingBottom: props.mode === 'edit' ? '23px' : '20px'
              }}
            >
              Attendance Corrections
            </Typography>
          }
        />
      </Card>
    </>
  );
}
export default useCommonRef(EmployeeAttCorrections);

