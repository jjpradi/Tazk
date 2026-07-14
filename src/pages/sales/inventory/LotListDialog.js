import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, Drawer, Grid, IconButton, TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import apiCalls from 'utils/apiCalls';
import {
  updateLotNumberAction,
} from '../../../redux/actions/product_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import { roleType } from 'utils/roleType';

export default function LotList(props) {
  let storage = getsessionStorage();
  const dispatch = useDispatch();

  const [lotNumber, setLotNumber] = useState([]);
  const [editableLotList, setEditableLotList] = useState([]);
  const [editable, setEditable] = useState(false);
  const [originalLot, setOriginalLot] = useState([]);

  useEffect(() => {
    setOriginalLot(props.data.map(i => ({ ...i })));
    setLotNumber(props.data);
    setEditableLotList([]);
    setEditable(false);
  }, [props.data]);

  const pageSize = props.pageSize || 200;
  const page = props.page || 0;
  const total = props.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 0;
  const hasNext = (page + 1) * pageSize < total;

  const handleEdit = () => setEditable(true);

  const handleSubmit = () => {
    const data = editableLotList.map((i) => ({
      lot_id: i.lot_id,
      lot_number: i.lot_number,
      item_id: i.item_id
    }));
    if (data.length > 0) {
      apiCalls(dispatch(updateLotNumberAction(data, (res) => {
        props.updateTableData(res);
      })));
      handleClose();
    }
  };

  const handleClose = () => props.handleClose();

  return (
    <Drawer
      anchor="right"
      open={props.open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 420 }, p: 0 },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid #E8EDF5', bgcolor: '#FAFBFC' }}>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59' }}>
            {props.name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#8C8C8C' }}>
            {total} lot{total !== 1 ? 's' : ''}
            {totalPages > 1 ? ` — page ${page + 1} of ${totalPages}` : ''}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Lot List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={1.5}>
          {lotNumber.length > 0 ? (
            lotNumber.map((d, idx) => (
              <Grid key={d.lot_id ?? `${d.location_id}-${d.lot_number}-${idx}`} size={{ xs: 6 }}>
                <TextField
                  name='lot'
                  defaultValue={d.lot_number}
                  size='small'
                  fullWidth
                  sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
                  onChange={(e) => {
                    const val = e.target.value;
                    const ind = lotNumber.findIndex((i) => d.lot_id === i.lot_id);
                    const temp = [...lotNumber];
                    temp[ind].lot_number = val;
                    let edit = [...editableLotList];
                    if (editableLotList.some((i) => i.lot_id === temp[ind].lot_id)) {
                      let index = edit.findIndex((i) => i.lot_id === temp[ind].lot_id);
                      edit[index].lot_number = val;
                    } else {
                      edit.push({ lot_id: temp[ind].lot_id, lot_number: temp[ind].lot_number, item_id: temp[ind].item_id });
                    }
                    setEditableLotList(edit);
                    setLotNumber(temp);
                  }}
                  disabled={!editable}
                />
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ fontSize: 12, color: '#8C8C8C', textAlign: 'center', py: 4 }}>No lots found</Typography>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderTop: '1px solid #E8EDF5' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='outlined'
            size="small"
            disabled={!hasPrev || editable}
            onClick={() => props.onPageChange && props.onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant='outlined'
            size="small"
            disabled={!hasNext || editable}
            onClick={() => props.onPageChange && props.onPageChange(page + 1)}
          >
            Next
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant='outlined' size="small" onClick={handleClose} color={editable ? 'secondary' : 'primary'}>
            {editable ? 'Cancel' : 'Close'}
          </Button>
          {roleType.includes(storage.role_name) ? (
            !editable ? (
              <Button variant='outlined' size="small" onClick={handleEdit}>Edit</Button>
            ) : (
              <Button variant='outlined' size="small" onClick={handleSubmit} disabled={editableLotList.length === 0}>Save</Button>
            )
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
}
