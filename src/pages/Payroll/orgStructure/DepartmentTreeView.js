import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Collapse, IconButton, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { updateDepartmentHierarchyAction } from 'redux/actions/orgStructure.actions';

const DeptNode = ({ dept, allDepts, level = 0, onEdit }) => {
  const [expanded, setExpanded] = useState(true);
  const children = allDepts.filter((d) => d.parent_department_id === dept.department_id);

  return (
    <Box sx={{ ml: level > 0 ? 3 : 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: 1.5, mb: 1, borderRadius: 2,
          border: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        <CorporateFareIcon sx={{ fontSize: 22, color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
            {dept.department_name}
          </Typography>
          {dept.description && (
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              {dept.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {dept.head_name && (
            <Chip
              icon={<PersonIcon />}
              label={dept.head_name}
              size='small'
              variant='outlined'
              sx={{ fontSize: 10 }}
            />
          )}
          <Chip
            icon={<PeopleIcon />}
            label={dept.employee_count || 0}
            size='small'
            color='primary'
            variant='outlined'
            sx={{ fontSize: 10 }}
          />
          <IconButton size='small' onClick={() => onEdit(dept)}>
            <EditIcon fontSize='small' />
          </IconButton>
          {children.length > 0 && (
            <IconButton size='small' onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon fontSize='small' /> : <ExpandMoreIcon fontSize='small' />}
            </IconButton>
          )}
        </Box>
      </Paper>

      {children.length > 0 && (
        <Collapse in={expanded}>
          <Box sx={{ borderLeft: '2px solid', borderColor: 'divider', ml: 2 }}>
            {children.map((child) => (
              <DeptNode key={child.department_id} dept={child} allDepts={allDepts} level={level + 1} onEdit={onEdit} />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default function DepartmentTreeView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({});

  const dispatch = useDispatch();
  const { OrgStructureReducer: { departmentTree } } = useSelector((state) => state);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  const allDepts = departmentTree || [];
  const rootDepts = allDepts.filter((d) => !d.parent_department_id);

  const handleEdit = (dept) => {
    setFormValues({
      department_id: dept.department_id,
      department_name: dept.department_name,
      parent_department_id: dept.parent_department_id || '',
      level: dept.level || 0,
      sort_order: dept.sort_order || 0,
      description: dept.description || '',
    });
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await apiCalls(
      setModalTypeHandler, setLoaderStatusHandler,
      dispatch(updateDepartmentHierarchyAction(formValues, setModalTypeHandler, setLoaderStatusHandler)),
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {allDepts.length} departments &nbsp;|&nbsp; Drag to rearrange or click edit to set parent
        </Typography>
      </Box>

      {rootDepts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <CorporateFareIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography>No departments found</Typography>
        </Box>
      )}

      {rootDepts.map((dept) => (
        <DeptNode key={dept.department_id} dept={dept} allDepts={allDepts} level={0} onEdit={handleEdit} />
      ))}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          Edit Department: {formValues.department_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select name='parent_department_id' label='Parent Department' size='small' fullWidth
                value={formValues.parent_department_id} onChange={handleChange}
              >
                <MenuItem value=''>None (Root Level)</MenuItem>
                {allDepts
                  .filter((d) => d.department_id !== formValues.department_id)
                  .map((d) => (
                    <MenuItem key={d.department_id} value={d.department_id}>
                      {d.path || d.department_name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='sort_order' label='Sort Order' size='small' fullWidth type='number'
                value={formValues.sort_order} onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name='description' label='Description' size='small' fullWidth multiline rows={2}
                value={formValues.description} onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color='error'>Cancel</Button>
          <Button onClick={handleSave} variant='contained'>Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
