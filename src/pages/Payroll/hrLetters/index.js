import React, { useState, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Autocomplete, Chip, Avatar, Stepper, Step, StepLabel, Divider,
  CircularProgress,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { searchEmployeesAction, getProfileAction } from 'redux/actions/employeeProfile.actions';
import DocTemplateService from 'services/docTemplate_services';

const HR_LETTER_TYPES = [
  { value: 'offer_letter', label: 'Offer Letter', category: 'Joining' },
  { value: 'appointment_letter', label: 'Appointment Letter', category: 'Joining' },
  { value: 'confirmation_letter', label: 'Confirmation Letter', category: 'Confirmation' },
  { value: 'promotion_letter', label: 'Promotion Letter', category: 'Movement' },
  { value: 'increment_letter', label: 'Increment Letter', category: 'Movement' },
  { value: 'transfer_letter', label: 'Transfer Letter', category: 'Movement' },
  { value: 'warning_letter', label: 'Warning Letter', category: 'Disciplinary' },
  { value: 'termination_letter', label: 'Termination Letter', category: 'Separation' },
  { value: 'relieving_letter', label: 'Relieving Letter', category: 'Separation' },
  { value: 'experience_letter', label: 'Experience Letter', category: 'Separation' },
  { value: 'internship_letter', label: 'Internship Letter', category: 'Joining' },
  { value: 'address_proof_letter', label: 'Address Proof Letter', category: 'Certificate' },
  { value: 'salary_certificate', label: 'Salary Certificate', category: 'Certificate' },
  { value: 'employment_certificate', label: 'Employment Certificate', category: 'Certificate' },
  { value: 'noc_letter', label: 'NOC Letter', category: 'Certificate' },
  { value: 'bonafide_letter', label: 'Bonafide Letter', category: 'Certificate' },
];

const categoryColors = {
  Joining: '#1976d2',
  Confirmation: '#2e7d32',
  Movement: '#ed6c02',
  Disciplinary: '#d32f2f',
  Separation: '#9c27b0',
  Certificate: '#0288d1',
};

const steps = ['Select Employee', 'Choose Letter', 'Review & Generate'];

export default function HRLettersPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedLetterType, setSelectedLetterType] = useState('');
  const [placeholders, setPlaceholders] = useState([]);
  const [payload, setPayload] = useState({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [templateResolved, setTemplateResolved] = useState(false);
  const previewRef = useRef(null);

  const dispatch = useDispatch();
  const {
    EmployeeProfileReducer: { employeeList, currentProfile },
  } = useSelector((s) => s);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);

  useEffect(() => {
    apiCalls(setModalTypeHandler, setLoaderStatusHandler,
      dispatch(searchEmployeesAction(setModalTypeHandler, setLoaderStatusHandler)));
  }, []);

  const handleEmployeeSelect = async (emp) => {
    setSelectedEmployee(emp);
    if (emp) {
      await apiCalls(setModalTypeHandler, setLoaderStatusHandler,
        dispatch(getProfileAction(emp.employee_id, setModalTypeHandler, setLoaderStatusHandler)));
    }
  };

  const handleLetterSelect = async (letterType) => {
    setSelectedLetterType(letterType);
    setPreviewHtml('');
    setTemplateResolved(false);

    // Load placeholders for this letter type
    try {
      const res = await DocTemplateService.listPlaceholders(letterType);
      if (res.status === 200) {
        setPlaceholders(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load placeholders:', err);
    }

    // Build default payload from employee profile
    if (currentProfile) {
      const p = currentProfile;
      const today = new Date();
      const formatDate = (d) => {
        if (!d) return '';
        const dt = new Date(d);
        return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
      };

      setPayload({
        'document.issue_date': formatDate(today),
        'document.place': '',
        'document.letter_number': '',
        'employee.name': p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        'employee.employee_code': p.employee_code || '',
        'employee.designation': p.designation || p.current_designation || '',
        'employee.department': p.department_name || '',
        'employee.doj': p.doj_formatted || '',
        'employee.email': p.email || '',
        'employee.phone': p.phone_number || '',
        'employee.address': [p.address, p.area, p.city, p.state, p.zip].filter(Boolean).join(', '),
        'employee.father_name': p.father_name || '',
        'employee.dob': p.dob_formatted || '',
        'employee.pan_number': p.pan_number || '',
        'employee.aadhar_number': p.aadhar_number || '',
        'employee.grade': p.grade_name ? `${p.grade_code} - ${p.grade_name}` : '',
        'employee.reporting_manager': p.reporting_manager_name || '',
      });
    }
  };

  const handlePayloadChange = (key, value) => {
    setPayload((p) => ({ ...p, [key]: value }));
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      // Build nested payload from flat keys
      const nestedPayload = {};
      Object.entries(payload).forEach(([key, value]) => {
        const parts = key.split('.');
        if (parts.length === 2) {
          if (!nestedPayload[parts[0]]) nestedPayload[parts[0]] = {};
          nestedPayload[parts[0]][parts[1]] = value;
        }
      });

      const res = await DocTemplateService.renderPreview({
        document_type: selectedLetterType,
        paper_size: 'A4_portrait',
        output_type: 'print',
        payload: nestedPayload,
      });

      if (res.status === 200 && res.data) {
        setPreviewHtml(res.data.html || res.data.content || '');
        setTemplateResolved(true);
      }
    } catch (err) {
      console.error('Preview failed:', err);
      // Show fallback message
      setPreviewHtml('<div style="padding:40px;text-align:center;color:#666;"><p>No template configured for this letter type yet.</p><p style="font-size:12px;">Go to Document Templates to create and assign a template first.</p></div>');
      setTemplateResolved(false);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    if (!previewHtml) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>${HR_LETTER_TYPES.find((t) => t.value === selectedLetterType)?.label || 'HR Letter'}</title></head>
      <body>${previewHtml}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const canProceed = () => {
    if (activeStep === 0) return !!selectedEmployee;
    if (activeStep === 1) return !!selectedLetterType;
    return true;
  };

  const letterCfg = HR_LETTER_TYPES.find((t) => t.value === selectedLetterType);

  // Group placeholders by section
  const groupedPlaceholders = {};
  placeholders.forEach((ph) => {
    const section = ph.section || 'other';
    if (!groupedPlaceholders[section]) groupedPlaceholders[section] = [];
    groupedPlaceholders[section].push(ph);
  });

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <DescriptionIcon sx={{ fontSize: 28, color: 'primary.main' }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          HR Letters
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: 12 } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Select Employee */}
        {activeStep === 0 && (
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
              Select Employee
            </Typography>
            <Autocomplete
              options={employeeList || []}
              getOptionLabel={(o) => `${o.full_name} (${o.employee_code}) — ${o.designation || ''}`}
              size='small'
              value={selectedEmployee}
              onChange={(_, val) => handleEmployeeSelect(val)}
              sx={{ maxWidth: 500 }}
              renderOption={(props, option) => (
                <Box component='li' {...props} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
                  <Avatar src={option.image} sx={{ width: 32, height: 32, fontSize: 12 }}>
                    {(option.full_name || '?')[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{option.full_name}</Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                      {option.employee_code} &bull; {option.designation} &bull; {option.department_name}
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => <TextField {...params} label='Search employee by name or code' />}
            />

            {selectedEmployee && currentProfile && (
              <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={currentProfile.image} sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                    {(currentProfile.first_name || '?')[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{currentProfile.full_name}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {currentProfile.employee_code} &bull; {currentProfile.designation} &bull; {currentProfile.department_name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      <Chip label={`DOJ: ${currentProfile.doj_formatted}`} size='small' variant='outlined' sx={{ fontSize: 9 }} />
                      {currentProfile.grade_name && (
                        <Chip label={currentProfile.grade_name} size='small' variant='outlined' sx={{ fontSize: 9 }} />
                      )}
                      {currentProfile.employment_type && (
                        <Chip label={currentProfile.employment_type} size='small' variant='outlined' sx={{ fontSize: 9, textTransform: 'capitalize' }} />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* Step 2: Choose Letter Type */}
        {activeStep === 1 && (
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}>
              Select Letter Type
            </Typography>
            {Object.entries(categoryColors).map(([category, color]) => {
              const letters = HR_LETTER_TYPES.filter((t) => t.category === category);
              return (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color, mb: 0.5, textTransform: 'uppercase' }}>
                    {category}
                  </Typography>
                  <Grid container spacing={1}>
                    {letters.map((lt) => (
                      <Grid key={lt.value} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Paper
                          elevation={0}
                          onClick={() => setSelectedLetterType(lt.value)}
                          sx={{
                            p: 1.5, borderRadius: 1.5, cursor: 'pointer',
                            border: '2px solid',
                            borderColor: selectedLetterType === lt.value ? color : 'divider',
                            bgcolor: selectedLetterType === lt.value ? color + '10' : 'transparent',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: color, bgcolor: color + '08' },
                          }}
                        >
                          <Typography sx={{ fontSize: 12, fontWeight: selectedLetterType === lt.value ? 700 : 400 }}>
                            {lt.label}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Step 3: Review & Generate */}
        {activeStep === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {letterCfg?.label} — {selectedEmployee?.full_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size='small' variant='outlined' startIcon={<PreviewIcon />}
                  onClick={handlePreview} disabled={loading}
                  sx={{ fontSize: 11, textTransform: 'none' }}
                >
                  {loading ? <CircularProgress size={16} /> : 'Preview'}
                </Button>
                {previewHtml && (
                  <Button
                    size='small' variant='contained' startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{ fontSize: 11, textTransform: 'none' }}
                  >
                    Print
                  </Button>
                )}
              </Box>
            </Box>

            <Grid container spacing={2}>
              {/* Placeholder Fields */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', maxHeight: 500, overflow: 'auto' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1.5 }}>
                    Letter Data
                  </Typography>
                  {Object.entries(groupedPlaceholders).map(([section, phs]) => (
                    <Box key={section} sx={{ mb: 2 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>
                        {section.replace('_', ' ')}
                      </Typography>
                      {phs.map((ph) => (
                        <TextField
                          key={ph.placeholder_key}
                          label={ph.display_label}
                          size='small'
                          fullWidth
                          required={!!ph.is_required}
                          value={payload[ph.placeholder_key] || ''}
                          onChange={(e) => handlePayloadChange(ph.placeholder_key, e.target.value)}
                          placeholder={ph.sample_value || ''}
                          sx={{ mb: 1 }}
                          slotProps={{ inputLabel: { sx: { fontSize: 11 } }, input: { sx: { fontSize: 12 } } }}
                        />
                      ))}
                    </Box>
                  ))}
                  {placeholders.length === 0 && (
                    <Typography sx={{ fontSize: 11, color: 'text.secondary', textAlign: 'center', py: 2 }}>
                      No placeholders found. Run the placeholder migration first.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Preview */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  ref={previewRef}
                  sx={{
                    p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    minHeight: 500, bgcolor: '#fafafa',
                  }}
                >
                  {previewHtml ? (
                    <Box
                      sx={{ bgcolor: '#fff', p: 3, borderRadius: 1, minHeight: 400, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: 'text.secondary' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <DescriptionIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                        <Typography sx={{ fontSize: 13 }}>Click "Preview" to generate the letter</Typography>
                        <Typography sx={{ fontSize: 11, mt: 0.5 }}>
                          Fill in the fields on the left, then preview the rendered output
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Navigation */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((s) => s - 1)}
            startIcon={<ArrowBackIcon />}
            sx={{ fontSize: 12, textTransform: 'none' }}
          >
            Back
          </Button>
          {activeStep < 2 && (
            <Button
              variant='contained'
              disabled={!canProceed()}
              onClick={() => {
                if (activeStep === 1 && selectedLetterType) {
                  handleLetterSelect(selectedLetterType);
                }
                setActiveStep((s) => s + 1);
              }}
              endIcon={<ArrowForwardIcon />}
              sx={{ fontSize: 12, textTransform: 'none' }}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
