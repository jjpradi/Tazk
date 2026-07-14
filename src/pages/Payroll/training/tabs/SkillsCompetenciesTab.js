import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Chip,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {
  createSkillAction, updateSkillAction, deleteSkillAction,
  upsertEmployeeSkillAction, deleteEmployeeSkillAction,
} from 'redux/actions/training.actions';

const emptySkillForm = { skill_name: '', skill_category: '', description: '' };
const emptyMapForm = {
  employee_id: '', skill_id: '', proficiency_level: '', acquired_through: '',
  last_assessed_date: '', notes: '',
};

const proficiencyOptions = ['beginner', 'intermediate', 'advanced', 'expert'];
const acquiredOptions = ['training', 'experience', 'certification', 'self_learning'];

const categoryChipColor = (cat) => {
  const lc = (cat || '').toLowerCase();
  if (lc === 'technical') return 'primary';
  if (lc === 'soft skills') return 'success';
  if (lc === 'domain') return 'info';
  return 'default';
};

const proficiencyChipColor = (level) => {
  const lc = (level || '').toLowerCase();
  if (lc === 'beginner') return 'default';
  if (lc === 'intermediate') return 'info';
  if (lc === 'advanced') return 'warning';
  if (lc === 'expert') return 'success';
  return 'default';
};

const acquiredChipColor = (via) => {
  const lc = (via || '').toLowerCase();
  if (lc === 'training') return 'primary';
  if (lc === 'experience') return 'info';
  if (lc === 'certification') return 'success';
  if (lc === 'self_learning') return 'secondary';
  return 'default';
};

const cellSx = { fontSize: 12, py: 1 };
const headSx = { fontSize: 12, fontWeight: 700, py: 1 };

export default function SkillsCompetenciesTab({
  skills, employeeSkills, refreshSkills, refreshEmployeeSkills,
}) {
  const dispatch = useDispatch();
  const { setModalTypeHandler: s, setLoaderStatusHandler: l } = useContext(CreateNewButtonContext);

  // --- Skills Catalog state ---
  const [skillOpen, setSkillOpen] = useState(false);
  const [skillEditId, setSkillEditId] = useState(null);
  const [skillForm, setSkillForm] = useState({ ...emptySkillForm });
  const [skillDeleteId, setSkillDeleteId] = useState(null);

  // --- Employee Skill Mapping state ---
  const [mapOpen, setMapOpen] = useState(false);
  const [mapEditId, setMapEditId] = useState(null);
  const [mapForm, setMapForm] = useState({ ...emptyMapForm });
  const [mapDeleteId, setMapDeleteId] = useState(null);

  const skillList = skills || [];
  const empSkillList = employeeSkills || [];

  // ========== Skills Catalog handlers ==========
  const openAddSkill = () => {
    setSkillEditId(null);
    setSkillForm({ ...emptySkillForm });
    setSkillOpen(true);
  };
  const openEditSkill = (row) => {
    setSkillEditId(row.id);
    setSkillForm({
      skill_name: row.skill_name || '',
      skill_category: row.skill_category || '',
      description: row.description || '',
    });
    setSkillOpen(true);
  };
  const handleSaveSkill = async () => {
    const payload = { ...skillForm };
    if (skillEditId) {
      await dispatch(updateSkillAction({ id: skillEditId, ...payload }, s, l));
    } else {
      await dispatch(createSkillAction(payload, s, l));
    }
    setSkillOpen(false);
    refreshSkills?.();
  };
  const confirmDeleteSkill = async () => {
    await dispatch(deleteSkillAction(skillDeleteId, s, l));
    setSkillDeleteId(null);
    refreshSkills?.();
  };

  // ========== Employee Skill Mapping handlers ==========
  const openAddMap = () => {
    setMapEditId(null);
    setMapForm({ ...emptyMapForm });
    setMapOpen(true);
  };
  const openEditMap = (row) => {
    setMapEditId(row.id);
    setMapForm({
      employee_id: row.employee_id ?? '',
      skill_id: row.skill_id ?? '',
      proficiency_level: row.proficiency_level || '',
      acquired_through: row.acquired_through || '',
      last_assessed_date: row.last_assessed_date ? row.last_assessed_date.substring(0, 10) : '',
      notes: row.notes || '',
    });
    setMapOpen(true);
  };
  const handleSaveMap = async () => {
    const payload = {
      ...mapForm,
      employee_id: Number(mapForm.employee_id) || 0,
      skill_id: Number(mapForm.skill_id) || 0,
    };
    if (mapEditId) payload.id = mapEditId;
    await dispatch(upsertEmployeeSkillAction(payload, s, l));
    setMapOpen(false);
    refreshEmployeeSkills?.();
  };
  const confirmDeleteMap = async () => {
    await dispatch(deleteEmployeeSkillAction(mapDeleteId, s, l));
    setMapDeleteId(null);
    refreshEmployeeSkills?.();
  };

  const setSkill = (k, v) => setSkillForm((prev) => ({ ...prev, [k]: v }));
  const setMap = (k, v) => setMapForm((prev) => ({ ...prev, [k]: v }));

  return (
    <Box>
      {/* ===== Section 1: Skills Catalog ===== */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Skills Catalog</Typography>
          <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAddSkill}
            sx={{ textTransform: 'none', fontSize: 12 }}>
            Add Skill
          </Button>
        </Box>

        {skillList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              No skills configured yet. Add skills to build your catalog.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Skill Name</TableCell>
                  <TableCell sx={headSx}>Category</TableCell>
                  <TableCell sx={headSx}>Description</TableCell>
                  <TableCell sx={headSx} align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skillList.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={cellSx}>{row.skill_name}</TableCell>
                    <TableCell sx={cellSx}>
                      {row.skill_category ? (
                        <Chip label={row.skill_category} size='small' color={categoryChipColor(row.skill_category)}
                          sx={{ fontSize: 11, height: 22 }} />
                      ) : '-'}
                    </TableCell>
                    <TableCell sx={cellSx}>{row.description || '-'}</TableCell>
                    <TableCell sx={cellSx} align='right'>
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => openEditSkill(row)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => setSkillDeleteId(row.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ===== Section 2: Employee Skill Mapping ===== */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Employee Skill Mapping</Typography>
          <Button size='small' variant='contained' startIcon={<AddIcon />} onClick={openAddMap}
            sx={{ textTransform: 'none', fontSize: 12 }}>
            Map Skill
          </Button>
        </Box>

        {empSkillList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
              No employee skills mapped yet. Map skills to track employee competencies.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>Employee Name</TableCell>
                  <TableCell sx={headSx}>Emp Code</TableCell>
                  <TableCell sx={headSx}>Skill Name</TableCell>
                  <TableCell sx={headSx}>Category</TableCell>
                  <TableCell sx={headSx}>Proficiency</TableCell>
                  <TableCell sx={headSx}>Acquired Through</TableCell>
                  <TableCell sx={headSx}>Last Assessed</TableCell>
                  <TableCell sx={headSx} align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empSkillList.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={cellSx}>{row.employee_name || '-'}</TableCell>
                    <TableCell sx={cellSx}>{row.emp_code || '-'}</TableCell>
                    <TableCell sx={cellSx}>{row.skill_name || '-'}</TableCell>
                    <TableCell sx={cellSx}>
                      {row.skill_category ? (
                        <Chip label={row.skill_category} size='small' color={categoryChipColor(row.skill_category)}
                          sx={{ fontSize: 11, height: 22 }} />
                      ) : '-'}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {row.proficiency_level ? (
                        <Chip label={row.proficiency_level} size='small' color={proficiencyChipColor(row.proficiency_level)}
                          sx={{ fontSize: 11, height: 22 }} />
                      ) : '-'}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {row.acquired_through ? (
                        <Chip label={row.acquired_through.replace('_', ' ')} size='small'
                          color={acquiredChipColor(row.acquired_through)}
                          sx={{ fontSize: 11, height: 22 }} />
                      ) : '-'}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {row.last_assessed_date ? row.last_assessed_date.substring(0, 10) : '-'}
                    </TableCell>
                    <TableCell sx={cellSx} align='right'>
                      <Tooltip title='Edit'>
                        <IconButton size='small' onClick={() => openEditMap(row)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton size='small' color='error' onClick={() => setMapDeleteId(row.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ===== Add/Edit Skill Dialog ===== */}
      <Dialog open={skillOpen} onClose={() => setSkillOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {skillEditId ? 'Edit Skill' : 'Add Skill'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label='Skill Name' size='small' fullWidth required
            value={skillForm.skill_name} onChange={(e) => setSkill('skill_name', e.target.value)} />
          <TextField label='Skill Category' size='small' fullWidth
            value={skillForm.skill_category} onChange={(e) => setSkill('skill_category', e.target.value)} />
          <TextField label='Description' size='small' fullWidth multiline rows={2}
            value={skillForm.description} onChange={(e) => setSkill('description', e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSaveSkill} disabled={!skillForm.skill_name}
            sx={{ textTransform: 'none' }}>
            {skillEditId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Delete Skill Confirmation ===== */}
      <Dialog open={!!skillDeleteId} onClose={() => setSkillDeleteId(null)} maxWidth='xs'>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Delete Skill</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to delete this skill? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDeleteId(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={confirmDeleteSkill}
            sx={{ textTransform: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Map Skill Dialog ===== */}
      <Dialog open={mapOpen} onClose={() => setMapOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>
          {mapEditId ? 'Edit Skill Mapping' : 'Map Skill'}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Employee ID' size='small' fullWidth type='number'
                value={mapForm.employee_id} onChange={(e) => setMap('employee_id', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size='small' fullWidth>
                <InputLabel>Skill</InputLabel>
                <Select label='Skill' value={mapForm.skill_id}
                  onChange={(e) => setMap('skill_id', e.target.value)}>
                  {skillList.map((sk) => (
                    <MenuItem key={sk.id} value={sk.id}>{sk.skill_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size='small' fullWidth>
                <InputLabel>Proficiency Level</InputLabel>
                <Select label='Proficiency Level' value={mapForm.proficiency_level}
                  onChange={(e) => setMap('proficiency_level', e.target.value)}>
                  {proficiencyOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size='small' fullWidth>
                <InputLabel>Acquired Through</InputLabel>
                <Select label='Acquired Through' value={mapForm.acquired_through}
                  onChange={(e) => setMap('acquired_through', e.target.value)}>
                  {acquiredOptions.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label='Last Assessed Date' size='small' fullWidth type='date'
                InputLabelProps={{ shrink: true }}
                value={mapForm.last_assessed_date}
                onChange={(e) => setMap('last_assessed_date', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label='Notes' size='small' fullWidth multiline rows={2}
                value={mapForm.notes} onChange={(e) => setMap('notes', e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' onClick={handleSaveMap}
            disabled={!mapForm.employee_id || !mapForm.skill_id}
            sx={{ textTransform: 'none' }}>
            {mapEditId ? 'Update' : 'Map'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Delete Employee Skill Confirmation ===== */}
      <Dialog open={!!mapDeleteId} onClose={() => setMapDeleteId(null)} maxWidth='xs'>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Delete Skill Mapping</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13 }}>
            Are you sure you want to remove this skill mapping? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapDeleteId(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant='contained' color='error' onClick={confirmDeleteMap}
            sx={{ textTransform: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
