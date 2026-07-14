import React, { useState, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Link,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { amountCellSx, reportTheme } from '../reportUtils';

/**
 * TreeTable — Expand/collapse hierarchical account rows.
 *
 * @param {object}  props
 * @param {Array}   props.columns     - [{ key, label, align, width, render }]
 * @param {Array}   props.rows        - flat list with { id/accountId, parentId, level, isParent, children?, ... }
 * @param {string}  [props.nameKey='accountName']
 * @param {(row)=>void} [props.onRowClick]  - Fires when a row is clicked (opens drawer)
 * @param {(row)=>void} [props.onNameClick] - Fires when the name link is clicked (navigates to ledger page)
 * @param {object}  [props.footerRow]
 * @param {boolean} [props.stickyHeader=true]
 * @param {string}  [props.maxHeight='calc(100vh - 320px)']
 * @param {boolean} [props.defaultExpandAll=false]  - Start with all parents expanded
 */
const TreeTable = ({
  columns,
  rows = [],
  nameKey = 'accountName',
  onRowClick,
  onNameClick,
  footerRow,
  stickyHeader = true,
  maxHeight = 'calc(100vh - 320px)',
  defaultExpandAll = false,
}) => {
  // Track expanded parent IDs
  const [expanded, setExpanded] = useState(() => {
    const initial = new Set();
    rows.forEach((r) => {
      const id = r.id ?? r.accountId;
      if (defaultExpandAll && isParentRow(r)) {
        initial.add(id);
      } else if (r.level === 0 && isParentRow(r)) {
        initial.add(id);
      }
    });
    return initial;
  });

  const toggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Build visible rows: show a row if all ancestors are expanded
  const visibleRows = useMemo(() => {
    return rows.filter((r) => {
      if (r.level === 0) return true;
      let pid = r.parentId ?? r.parentAccountId;
      while (pid != null) {
        if (!expanded.has(pid)) return false;
        const parent = rows.find((p) => (p.id ?? p.accountId) === pid);
        if (!parent) break;
        pid = parent.parentId ?? parent.parentAccountId;
      }
      return true;
    });
  }, [rows, expanded]);

  const rowId = (r) => r.id ?? r.accountId;

  const baseCellSx = {
    py: 0.5,
    px: 1,
    fontSize: '0.8125rem',
    borderBottom: `1px solid ${reportTheme.borderColor}`,
  };

  return (
    <TableContainer sx={{ maxHeight, overflow: 'auto' }}>
      <Table size="small" stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || 'left'}
                sx={{
                  ...baseCellSx,
                  bgcolor: reportTheme.headerBg,
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.3,
                  width: col.width,
                  position: stickyHeader ? 'sticky' : undefined,
                  top: 0,
                  zIndex: 1,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row) => {
            const id = rowId(row);
            const isPar = isParentRow(row);
            const isExp = expanded.has(id);

            return (
              <TableRow
                key={id}
                hover
                onClick={() => onRowClick && onRowClick(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  bgcolor: isPar ? reportTheme.parentRowBg : 'transparent',
                  '&:hover': { bgcolor: reportTheme.hoverBg },
                }}
              >
                {columns.map((col) => {
                  // Name column: indent + expand icon + clickable link
                  if (col.key === nameKey) {
                    return (
                      <TableCell key={col.key} sx={{ ...baseCellSx, fontWeight: isPar ? 600 : 400 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', pl: (row.level || 0) * 2 }}>
                          {isPar ? (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle(id);
                              }}
                              sx={{ mr: 0.5, p: 0.25 }}
                            >
                              {isExp ? (
                                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          ) : (
                            <Box sx={{ width: 26 }} />
                          )}
                          {onNameClick ? (
                            <Link
                              component="button"
                              underline="hover"
                              sx={{
                                fontSize: 'inherit',
                                fontWeight: 'inherit',
                                color: reportTheme.accentColor,
                                textAlign: 'left',
                                lineHeight: 1.3,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onNameClick(row);
                              }}
                            >
                              {row[nameKey]}
                            </Link>
                          ) : (
                            <Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                              {row[nameKey]}
                            </Typography>
                          )}
                          {row.accountCode && (
                            <Typography
                              component="span"
                              sx={{ ml: 0.75, fontSize: '0.65rem', color: 'text.disabled' }}
                            >
                              {row.accountCode}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    );
                  }

                  // Amount columns with render function
                  if (col.render) {
                    return (
                      <TableCell key={col.key} align={col.align || 'right'} sx={{ ...baseCellSx, ...amountCellSx }}>
                        {col.render(row)}
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell
                      key={col.key}
                      align={col.align || 'right'}
                      sx={{ ...baseCellSx, ...(col.mono !== false ? amountCellSx : {}) }}
                    >
                      {row[col.key] ?? ''}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}

          {visibleRows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                sx={{ ...baseCellSx, textAlign: 'center', py: 4, color: 'text.secondary' }}
              >
                No data to display
              </TableCell>
            </TableRow>
          )}

          {/* Footer totals row */}
          {footerRow && (
            <TableRow sx={{ bgcolor: reportTheme.sectionBg, position: 'sticky', bottom: 0, zIndex: 1 }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || (col.key === nameKey ? 'left' : 'right')}
                  sx={{
                    ...baseCellSx,
                    ...amountCellSx,
                    fontWeight: 700,
                    borderTop: `2px solid ${reportTheme.borderColor}`,
                    bgcolor: reportTheme.sectionBg,
                    fontSize: '0.8125rem',
                  }}
                >
                  {col.render ? col.render(footerRow) : footerRow[col.key] ?? ''}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/** Check if a row is a parent (has children or isParent flag). */
function isParentRow(r) {
  return r.isParent === 1 || (r.children && r.children.length > 0);
}

export default TreeTable;
