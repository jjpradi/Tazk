import React from 'react';
import { MTableHeader } from 'utils/SafeMaterialTable';

export const getStickyTableBodyHeight = (offset = 250) =>
  `calc(100dvh - ${offset}px)`;

export const getStickyTableOptions = ({
  bodyOffset = 250,
  headerStyle = {},
  headerBackgroundColor = '#F4F7FE',
  options = {},
} = {}) => ({
  search: false,
  toolbar: false,
  tableLayout: 'fixed',
  minBodyHeight: getStickyTableBodyHeight(bodyOffset),
  maxBodyHeight: getStickyTableBodyHeight(bodyOffset),
  headerStyle: {
    ...headerStyle,
    position: 'sticky',
    top: 0,
    zIndex: 3,
    backgroundColor: headerBackgroundColor,
  },
  ...options,
});

export const stickyTableComponents = {
  Header: (props) => (
    <MTableHeader
      {...props}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 3,
        backgroundColor: '#F4F7FE',
      }}
    />
  ),
};

export const stickyMuiTableHeadCellSx = {
  position: 'sticky',
  top: 0,
  zIndex: 3,
  backgroundColor: '#F4F7FE',
};
