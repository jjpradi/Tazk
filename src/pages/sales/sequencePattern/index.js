import {Grid, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import Cookies from 'universal-cookie';
import {connect, useDispatch, useSelector} from 'react-redux';
import {
  listSequenceDataAction,
  deleteListSequenceDataAction,
  updateSequenceDataAction,
} from 'redux/actions/sequencePattern_actions';
import sequencePatternReducer from '../../../redux/reducers/sequencePattern_reducer';
import apiCalls from 'utils/apiCalls';

import {SettingsInputComponentRounded} from '@mui/icons-material';
import NewSequencePattern from '../../../components/newSequencePattern';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight } from 'utils/pageSize';
import { titleURL } from 'http-common';

function SequencePattern() {
  const [sequenceData, setSequenceData] = useState();
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  const handleClose = () => {
    setOpen(false);
  };

  const {
    sequencePatternReducer: {sequence_data},
  } = useSelector((state) => state);
  const {setModalTypeHandler, setLoaderStatusHandler, headerLocationId} =
    useContext(CreateNewButtonContext);

  useEffect(() => {
    dispatch(listSequenceDataAction(headerLocationId));
  }, [headerLocationId]);

  // const handleDelete = () => {
  //   dispatch(deleteListSequenceDataAction(Id));
  //   dispatch(listSequenceDataAction(headerLocationId));
  // }

  return (
    <>
     <Helmet>
                <meta charSet="utf-8" />
                <title> {titleURL} | Sequence Pattern </title>
      </Helmet>
    <Grid>
      {open === false && (
        <MaterialTable
          actions={[
            {
              icon: 'add',
              tooltip: 'add',
              isFreeAction: true,
              onClick: (event, rowData) => setOpen(true),
            },
          ]}
          editable={{
            onRowUpdate: (newRow, oldRow) =>
              new Promise((resolve, reject) => {
                if (oldRow.sequence_id) {
                  const updatedData = [...sequence_data];
                  updatedData[
                    updatedData.findIndex(
                      (x) => x.sequence_id === oldRow.sequence_id,
                    )
                  ] = newRow;
                  setSequenceData(updatedData);
                  dispatch(
                    updateSequenceDataAction(newRow.sequence_id, newRow),
                  );
                  setTimeout(() => resolve(), 500);
                } else {
                  const updatedData = [...sequence_data];
                  updatedData[oldRow.tableData.id] = newRow;
                  setSequenceData(updatedData);
                  dispatch(
                    updateSequenceDataAction(newRow.sequence_id, newRow),
                  );
                  setTimeout(() => resolve(), 500);
                }

                // // //////
                // const updatedData = [...sequence_data]
                // updatedData[oldRow.tableData.id]= newRow;
                // //  setSequenceData(updatedData)

                // dispatch(updateSequenceDataAction(updatedData.sequence_id, updatedData))
                // setTimeout(()=>resolve(),500)
              }),
            // onRowDelete: (oldData) =>
            //   new Promise((resolve, reject) => {
            //     setTimeout(() => {
            //       if (oldData.sequence_id) {
            //         dispatch(deleteListSequenceDataAction(oldData.sequence_id));
            //         resolve();
            //       } else {
            //         const dataDelete = [...sequence_data];
            //         const index = oldData.tableData.id;
            //         dataDelete.splice(index, 1);
            //         setSequenceData([...sequence_data]);
            //         resolve();
            //       }
            //     }, 1000);
            //   }),
          }}
          options={{
            headerStyle: {
              fontSize: 15,
            },
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
                exportFunc: (cols, datas) => {},
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) => {},
              },
            ],
          }}
          // columns={
          //   this.props.stocklocation ? this.props.stocklocation.map((t) =>
          //Object.keys(t).map((o) => { return { title: o, field: o }
          //   }))[0] : []
          // }
          // columns={filteredCol}
          columns={[
            {
              field: 'sequence_name',
              title: 'Sequence Name',
            },
            // {
            //   field: 'short_code',
            //   title: 'Short Code',
            // },
            {
              field: 'current_seq',
              title: 'Current Sequence',
            },
            {
              field: 'pattern',
              title: 'Pattern',
            },
            {
              field: 'sequence_type',
              title: 'Sequence Type',
            },
            {
              field: 'location_name',
              title: 'Location Name',
            },
          ]}
          // components={{
          //   Row: props => <MTableBodyRow id="1" {...props} />
          //  }}
          data={sequence_data}
          title={
            <Typography
              variant='h6'
              align='left'
              style={{paddingTop: '10px', paddingBottom: '10px'}}
            >
              Sequence Pattern
            </Typography>
          }
        />
      )}
      {open === true && <NewSequencePattern handleClose={handleClose} />}
    </Grid>
    </>
  );
}

export default SequencePattern;

