import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {useEffect, useMemo, useState} from 'react';
import TemplatesApi from './templatesApi';

function extractVariables(body) {
  const text = (body || '').toString();
  const re = /{{\s*([a-zA-Z0-9_.]+)\s*}}/g;
  const set = new Set();
  let m;
  while ((m = re.exec(text)) !== null) set.add(m[1]);
  return Array.from(set);
}

function renderTemplate(body, variables) {
  const text = (body || '').toString();
  return text.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_, key) => {
    const value = variables?.[key];
    if (value === undefined || value === null || value === '') return `{{${key}}}`;
    return String(value);
  });
}

const EMPTY_EDITOR = {
  template_id: null,
  channel: 'whatsapp',
  name: '',
  body: '',
  isActive: true,
};

export default function TemplatesPage() {
  const [channel, setChannel] = useState('all');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState(EMPTY_EDITOR);
  const [sampleVars, setSampleVars] = useState({});

  const variables = useMemo(() => extractVariables(editor.body), [editor.body]);
  const preview = useMemo(
    () => renderTemplate(editor.body, sampleVars),
    [editor.body, sampleVars],
  );

  useEffect(() => {
    setSampleVars((prev) => {
      const next = {...prev};
      variables.forEach((v) => {
        if (!(v in next)) next[v] = '';
      });
      Object.keys(next).forEach((k) => {
        if (!variables.includes(k)) delete next[k];
      });
      return next;
    });
  }, [variables]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await TemplatesApi.list({
        page: 1,
        limit: 100,
        search,
        channel: channel === 'all' ? undefined : channel,
      });
      setItems(res?.data?.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [channel]);

  const openCreate = () => {
    setEditor(EMPTY_EDITOR);
    setSampleVars({});
    setEditorOpen(true);
  };

  const openEdit = (row) => {
    setEditor({
      template_id: row.template_id,
      channel: row.channel || 'whatsapp',
      name: row.name || '',
      body: row.body || '',
      isActive: !!row.is_active,
    });
    setSampleVars({});
    setEditorOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      channel: editor.channel,
      name: editor.name,
      body: editor.body,
      variables,
      isActive: editor.isActive,
    };

    if (editor.template_id) {
      await TemplatesApi.update(editor.template_id, payload);
    } else {
      await TemplatesApi.create(payload);
    }

    setEditorOpen(false);
    await load();
  };

  const handleDelete = async (row) => {
    if (!row?.template_id) return;
    if (!window.confirm(`Delete template "${row.name}"?`)) return;
    await TemplatesApi.remove(row.template_id);
    await load();
  };

  return (
    <Box sx={{p: 2}}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{fontWeight: 700}}>Templates</Typography>
        <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
          <FormControl size="small" sx={{minWidth: 160}}>
            <InputLabel>Channel</InputLabel>
            <Select
              label="Channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search templates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load();
            }}
          />
          <Button variant="outlined" onClick={load} disabled={loading}>
            Search
          </Button>
          <Button variant="contained" onClick={openCreate}>
            New Template
          </Button>
        </Box>
      </Box>

      <Box sx={{mt: 2, overflowX: 'auto'}}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Channel</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Variables</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.template_id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.channel}</TableCell>
                <TableCell>{row.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  {(row.variables || []).slice(0, 6).map((v) => (
                    <Chip key={v} label={v} size="small" sx={{mr: 0.5, mb: 0.5}} />
                  ))}
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(row)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(row)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">
                    No templates found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={editorOpen} onClose={() => setEditorOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editor.template_id ? 'Edit Template' : 'New Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1}}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
              <FormControl size="small" fullWidth>
                <InputLabel>Channel</InputLabel>
                <Select
                  label="Channel"
                  value={editor.channel}
                  onChange={(e) => setEditor((p) => ({...p, channel: e.target.value}))}
                >
                  <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Name"
                value={editor.name}
                onChange={(e) => setEditor((p) => ({...p, name: e.target.value}))}
                fullWidth
              />

              <TextField
                label="Body"
                value={editor.body}
                onChange={(e) => setEditor((p) => ({...p, body: e.target.value}))}
                fullWidth
                multiline
                minRows={8}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editor.isActive}
                    onChange={(e) =>
                      setEditor((p) => ({...p, isActive: e.target.checked}))
                    }
                  />
                }
                label="Active"
              />
            </Box>

            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
              <Typography sx={{fontWeight: 600}}>Preview</Typography>
              <TextField value={preview} multiline minRows={10} fullWidth />

              <Typography sx={{fontWeight: 600, mt: 1}}>Sample Variables</Typography>
              {!variables.length && (
                <Typography color="text.secondary">
                  No variables detected. Use syntax like {'{{leadName}}'} in the body.
                </Typography>
              )}
              {variables.map((v) => (
                <TextField
                  key={v}
                  size="small"
                  label={v}
                  value={sampleVars?.[v] || ''}
                  onChange={(e) =>
                    setSampleVars((p) => ({...p, [v]: e.target.value}))
                  }
                  fullWidth
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditorOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
