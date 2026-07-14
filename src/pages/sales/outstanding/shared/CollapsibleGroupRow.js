import React, { useState } from 'react';
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

/**
 * Renders a parent TableRow with an expand toggle and a colSpan'd
 * collapsible row that shows `expanded` content below.
 *
 * Props:
 *   parent: ReactNode (or function(open) => ReactNode) - the parent TableCells (excluding the expand-icon cell, which is added internally)
 *   expanded: ReactNode (or function(open) => ReactNode) - body shown when open
 *   colSpan: number - colSpan for the collapsed row's cell (parent column count + 1 for the icon cell)
 *   onToggle: optional (nextOpen: boolean) => void fired on every expand/collapse click
 *   parentRowSx: optional sx override on the parent TableRow
 */
export default function CollapsibleGroupRow({
  parent,
  expanded,
  colSpan,
  onToggle,
  parentRowSx,
}) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (onToggle) onToggle(next);
  };

  return (
    <React.Fragment>
      <TableRow
        sx={
          parentRowSx || {
            '& > *': { borderBottom: 'unset' },
            '&:hover': { backgroundColor: '#f5f5f5', cursor: 'pointer' },
          }
        }
      >
        <TableCell sx={{ width: 32 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={toggle}
            sx={{ p: 0.25 }}
          >
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        {typeof parent === 'function' ? parent(open) : parent}
      </TableRow>
      {open && (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0, border: 0 }}
            colSpan={colSpan}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ mx: 1, my: 0.5 }}>
                {typeof expanded === 'function' ? expanded(open) : expanded}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}
