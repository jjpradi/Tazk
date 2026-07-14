import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function ExportMenu({ items, tooltip = 'Export' }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const close = () => setAnchorEl(null);

  if (!items || items.length === 0) return null;

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        {items.map((it) => (
          <MenuItem
            key={it.label}
            onClick={() => {
              it.onClick();
              close();
            }}
          >
            {it.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
