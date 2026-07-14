import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';
import TemplatesApi from './templatesApi';

function renderTemplate(body, variables) {
  const text = (body || '').toString();
  return text.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, key) => {
    const value = variables?.[key];
    if (value === undefined || value === null || value === '') return `{{${key}}}`;
    return String(value);
  });
}

function leadVarsFromRow(rowData) {
  const leadId = rowData?.lead_id;
  const leadName = rowData?.['Lead Name'];
  const companyName = rowData?.company_name;
  const leadOwner = rowData?.['Lead Owner'];
  const leadStage = rowData?.['Lead Stage'] || rowData?.['Lead Status'];
  const leadSource = rowData?.['Lead Source'];

  const phone =
    rowData?.phone ||
    rowData?.Phone ||
    rowData?.mobile ||
    rowData?.Mobile ||
    rowData?.mobile_no ||
    rowData?.phone_no;

  const email = rowData?.email || rowData?.Email || rowData?.['Email'];

  return {
    leadId,
    leadName,
    companyName,
    leadOwner,
    leadStatus: leadStage,
    leadStage,
    leadSource,
    phone,
    email,
  };
}

export default function TemplatePickerDialog({
  open,
  onClose,
  leadRowData,
  lockedChannel,
  primaryActionLabel,
  onPrimaryAction,
  hideCopyButton = false,
}) {
  const [channel, setChannel] = useState(lockedChannel || 'whatsapp');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const leadVars = useMemo(() => leadVarsFromRow(leadRowData), [leadRowData]);
  const preview = useMemo(
    () => renderTemplate(selected?.body, leadVars),
    [selected, leadVars],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await TemplatesApi.list({
        page: 1,
        limit: 100,
        channel,
        search,
        isActive: true,
      });
      const nextItems = res?.data?.items || [];
      setItems(nextItems);
      setSelected((prev) => {
        if (!prev) return nextItems[0] || null;
        const stillThere = nextItems.find((t) => t.template_id === prev.template_id);
        return stillThere || nextItems[0] || null;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (lockedChannel) setChannel(lockedChannel);
    load();
  }, [open, channel, lockedChannel]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preview || '');
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Templates</DialogTitle>
      <DialogContent>
        <Box sx={{display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap'}}>
          {!lockedChannel && (
            <FormControl size="small" sx={{minWidth: 160}}>
              <InputLabel>Channel</InputLabel>
              <Select
                label="Channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load();
            }}
          />
          <Button variant="outlined" onClick={load} disabled={loading}>
            Search
          </Button>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 2, mt: 2}}>
          <Box sx={{border: '1px solid', borderColor: 'divider', borderRadius: 1}}>
            <List dense sx={{maxHeight: 360, overflow: 'auto'}}>
              {items.map((t) => (
                <ListItemButton
                  key={t.template_id}
                  selected={selected?.template_id === t.template_id}
                  onClick={() => setSelected(t)}
                >
                  <ListItemText
                    primary={t.name}
                    secondary={t.is_active ? t.channel : `${t.channel} (inactive)`}
                  />
                </ListItemButton>
              ))}
              {!items.length && (
                <Box sx={{p: 2}}>
                  <Typography color="text.secondary">
                    No templates found.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>

          <Box>
            <Typography sx={{fontWeight: 600}}>Preview</Typography>
            <Divider sx={{my: 1}} />
            <TextField value={preview} multiline minRows={12} fullWidth />
            <Typography color="text.secondary" sx={{mt: 1}}>
              Variables like {'{{leadName}}'} are filled from the current Lead Hub row.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        {!hideCopyButton && (
          <Button onClick={handleCopy} variant="outlined" disabled={!selected}>
            Copy Message
          </Button>
        )}
        {primaryActionLabel && (
          <Button
            onClick={() =>
              onPrimaryAction?.({channel, template: selected, message: preview, leadVars})
            }
            variant="contained"
            disabled={!selected}
          >
            {primaryActionLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
