import React, { useContext, useEffect, useState } from 'react';
import { Card, Grid, IconButton, Typography, Box, Button, Dialog, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { addretailcustomerinteractionaction, getretailServiceAction } from 'redux/actions/retail_service_action';
import moment from 'moment';

const storage = getsessionStorage();

const columns = [
  {
    field: 'createdAt',
    headerName: 'Date',
    width: 100,
    renderCell: (params) => (
      <div>
        {moment(params.value).format('DD-MM-YYYY')}
        <br />
        {moment(params.value).format('hh:mm A')}
      </div>
    )
  },
  { field: 'contact_by', headerName: 'Contact By', width: 130 },
  {
    field: 'note', headerName: 'Note', width: 130,
    renderCell: (params) => (
      <div style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%'
      }}>
        {params.value}
      </div>
    )
  },
];

const ServiceDataGrid = () => {
  const dispatch = useDispatch();
  const { retailServiceReducer: { editdata, listRetailService } } = useSelector((state) => state);
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const [interactions, setInteractions] = useState(editdata?.interactions || []);
  const [formValues, setFormValues] = useState({
    customer_name: "",
    contact_by: `${storage?.first_name} ${storage?.last_name}`,
    note: ""
  });
  console.log(editdata, listRetailService, formValues,'editdata')

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  useEffect(() => {
    setInteractions(editdata?.interactions || []);
  }, [editdata]);

  const handleAdd = () => {
  console.log('cusformval',form)
    setForm(true);
  console.log('cusformval1',form)
    setReadOnly(false); // Allow editing in the form
    setFormValues((prevValues) => ({
      ...prevValues,
      customer_name: "",
      note: ""
    }));
  };

  const handleRowClick = (params) => {
    setForm(true);
    setReadOnly(true); // Set form to read-only mode
    setFormValues({
      customer_name: "",
      contact_by: params.row.contact_by || `${storage?.first_name} ${storage?.last_name}`,
      note: params.row.note
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleCancel = () => {
    setForm(false);
  };

  const handleSubmit = () => {
    const data = { ...formValues, service_id: editdata?.service_id };
    dispatch(addretailcustomerinteractionaction(data, setModalTypeHandler, setLoaderStatusHandler, () => {
      setInteractions((prev) => [...prev, { ...data, createdAt: new Date() }]);
    }));
    setForm(false);
  };

  return (
    <div>
      <Card sx={{ p: '20px', width: '100%', height: '100%', background: '#edb4b400' }}>
        <Grid container alignItems="center" justifyContent="space-between" pb="15px">
          <Grid>
            <Typography variant='h5.7' align='left' p='0px 0px 15px 0px'>
              Customer Interaction
            </Typography>
          </Grid>
          <Grid>
            <IconButton onClick={handleAdd}>
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>

        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={editdata?.interactions ?? []}
            columns={columns}
            hideFooter={true}
            onRowClick={handleRowClick} // Handle row click event
            disableRowSelectionOnClick // Disable row selection on click
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                '& .MuiDataGrid-columnHeader:last-of-type .MuiDataGrid-columnSeparator': {
                  display: 'none'
                }
              }
            }}
          />
        </Box>
      </Card>
      <Dialog open={form} onClose={handleCancel}>
        <Grid container gap={2} padding='20px'>
          <Grid
            marginBottom='10px'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Typography style={{ fontSize: '20px', color: 'black' }}> Customer Interactions </Typography>
          </Grid>
          
          {/* <Grid size={{ xs: 5, sm: 5, md: 5, lg: 5 }}>
            <TextField
              fullWidth
              placeholder='Contact By'
              label='User Name'
              name='contact_by'
              value={formValues.contact_by}
              variant='outlined'
              onChange={handleChange}
              InputProps={{
                readOnly: readOnly // Set input to read-only if readOnly state is true
              }}
              
            />
            
          </Grid> */}
          <Grid
            margin="10px"
            size={{
              lg: 7,
              md: 7,
              sm: 7,
              xs: 7
            }}>
            <Typography>
              User Name:{" "}
              <span style={{ fontSize: "14px" }}>
                {(storage?.first_name || storage?.last_name)
                  ? `${storage?.first_name || ""} ${storage?.last_name || ""}`.trim()
                  : "-"}
              </span>
            </Typography>
          </Grid>

          <Grid
            justifyContent='flex-right'
            flexDirection='column'
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 3
            }}>
               <Typography>Date : {editdata?.interactions?.length ? moment(editdata?.interactions?.createdAt).format("DD-MM-YYYY") : moment().format("DD-MM-YYYY") } </Typography>
    <Typography>Time : {editdata?.interactions?.length ? moment(editdata?.interactions?.createdAt).format("hh:mm A") : moment().format("HH:MM")} </Typography>
    </Grid>
         
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              fullWidth
              placeholder='Interaction Note'
              label='Interaction Note'
              name='note'
              value={formValues.note}
              multiline
              minRows={2}
              variant='outlined'
              onChange={handleChange}
              InputProps={{
                readOnly: readOnly // Set input to read-only if readOnly state is true
              }}
            />
          </Grid>
          <Grid
            gap={2}
            display='flex'
            justifyContent='end'
            paddingRight='10px'
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Button variant='contained' color='error' onClick={handleCancel}> Cancel </Button>
            {!readOnly && <Button variant='contained' onClick={handleSubmit}> Submit </Button>}
          </Grid>
        </Grid>
       
      </Dialog>
    </div>
  );
};

export default ServiceDataGrid;
