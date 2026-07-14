import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColumnMenu,
  GridColumnMenuContainer,
} from '@mui/x-data-grid';
import { MenuItem } from '@mui/material';
const stickyStyles = {
  stickyHeaderLeft: 'sticky-header-left',
  stickyHeaderRight: 'sticky-header-right',
  stickyCellLeft: 'sticky-cell-left',
  stickyCellRight: 'sticky-cell-right',
};

const stickySx = {
  '& .sticky-header-left': {
    position: 'sticky',
    left: 0,
    zIndex: 1001,
    backgroundColor: '#f4f7fe',
  },
  '& .sticky-header-right': {
    position: 'sticky',
    right: 0,
    zIndex: 1001,
    backgroundColor: '#f4f7fe',
  },
  '& .sticky-cell-left': {
    position: 'sticky',
    left: 0,
    zIndex: 1001,
    backgroundColor: '#f4f7fe',
  },
  '& .sticky-cell-right': {
    position: 'sticky',
    right: 0,
    zIndex: 1000,
    backgroundColor: '#f4f7fe',
  },
};

function DataGridDemo() {
  const [pinnedColumnsLeft, setPinnedColumnsLeft] = useState([]);
  const [pinnedColumnsRight, setPinnedColumnsRight] = useState([]);

  const getHeaderStyle = (name) => {
    if (pinnedColumnsLeft.includes(name)) {
      return stickyStyles.stickyHeaderLeft;
    } else if (pinnedColumnsRight.includes(name)) {
      return stickyStyles.stickyHeaderRight;
    } else {
      return '';
    }
  };

  const getCellStyle = (name) => {
    if (pinnedColumnsLeft.includes(name)) {
      return stickyStyles.stickyCellLeft;
    } else if (pinnedColumnsRight.includes(name)) {
      return stickyStyles.stickyCellRight;
    } else {
      return '';
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      headerClassName: getHeaderStyle('id'),
      cellClassName: getCellStyle('id'),
    },
    {
      field: 'firstName',
      headerName: 'First name',
      width: 130,
      headerClassName: getHeaderStyle('firstName'),
      cellClassName: getCellStyle('firstName'),
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      width: 130,
      headerClassName: getHeaderStyle('lastName'),
      cellClassName: getCellStyle('lastName'),
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 90,
      headerClassName: getHeaderStyle('age'),
      cellClassName: getCellStyle('age'),
    },
  ];

  const [dataGridColumns, setDataGridColumns] = useState(columns);

  const findVirtualScroller = () => {
    const virtualScrollerElement = document.querySelector(
      '.MuiDataGrid-virtualScroller'
    );
    if (!virtualScrollerElement) {
      setTimeout(findVirtualScroller, 100);
    } else {
      virtualScrollerElement.addEventListener(
        'scroll',
        handleScrollHorizontal
      );
      return () => {
        virtualScrollerElement.removeEventListener(
          'scroll',
          handleScrollHorizontal
        );
      };
    }
  };

  useEffect(() => {
    findVirtualScroller();
  }, []);

  useEffect(() => {
    const leftColumnData = columns.filter((col) =>
      pinnedColumnsLeft.includes(col.field)
    );
    const rightColumnData = columns.filter((col) =>
      pinnedColumnsRight.includes(col.field)
    );
    const columnData = columns.filter(
      (col) =>
        !pinnedColumnsLeft.includes(col.field) &&
        !pinnedColumnsRight.includes(col.field)
    );

    setDataGridColumns([...leftColumnData, ...columnData, ...rightColumnData]);

    findVirtualScroller();
  }, [pinnedColumnsLeft, pinnedColumnsRight]);

  const handleScrollHorizontal = () => {
    const currentScrollPos = document.querySelector(
      '.MuiDataGrid-virtualScroller'
    ).scrollLeft;
    const columnsHeaders = document.querySelectorAll('.MuiDataGrid-columnHeader');
    const columnCells = document.querySelectorAll('.MuiDataGrid-cell');

    columnsHeaders.forEach((columnHeader) => {
      const dataField = columnHeader.getAttribute('data-field');
      if (!pinnedColumnsLeft.includes(dataField) && !pinnedColumnsRight.includes(dataField)) {
        columnHeader.style.transform = `translate3d(-${currentScrollPos}px, 0px, 0px)`;
      } else {
        columnHeader.style.transform = 'none';
      }
    });

    columnCells.forEach((columnCell) => {
      const dataField = columnCell.getAttribute('data-field');
      if (!pinnedColumnsLeft.includes(dataField) && !pinnedColumnsRight.includes(dataField)) {
        columnCell.style.transform = `translate3d(-${currentScrollPos}px, 0px, 0px)`;
      } else {
        columnCell.style.transform = 'none';
      }
    });
  };

  const CustomColumnMenu = (props) => {
    const { hideMenu, currentColumn } = props;

    const handlePinLeft = (event) => {
      setPinnedColumnsLeft((prev) => [...prev, currentColumn.field]);
      if (pinnedColumnsRight.length > 0 && pinnedColumnsRight.includes(currentColumn.field)) {
        const updatedPinnedColumnsRight = pinnedColumnsRight.filter(
          (item) => item !== currentColumn.field
        );
        setPinnedColumnsRight(updatedPinnedColumnsRight);
      }
      hideMenu(event);
    };

    const handlePinRight = (event) => {
      setPinnedColumnsRight((prev) => [...prev, currentColumn.field]);
      if (pinnedColumnsLeft.length > 0 && pinnedColumnsLeft.includes(currentColumn.field)) {
        const updatedPinnedColumnsLeft = pinnedColumnsLeft.filter(
          (item) => item !== currentColumn.field
        );
        setPinnedColumnsLeft(updatedPinnedColumnsLeft);
      }
      hideMenu(event);
    };

    const handleUnpin = (event, type) => {
      if (type === 'left') {
        const updatedPinnedColumnsLeft = pinnedColumnsLeft.filter(
          (item) => item !== currentColumn.field
        );
        setPinnedColumnsLeft(updatedPinnedColumnsLeft);
      } else {
        const updatedPinnedColumnsRight = pinnedColumnsRight.filter(
          (item) => item !== currentColumn.field
        );
        setPinnedColumnsRight(updatedPinnedColumnsRight);
      }
      hideMenu(event);
    };

    if (pinnedColumnsLeft.includes(currentColumn.field)) {
      return (
        <GridColumnMenuContainer>
          <GridColumnMenu {...props} />
          <MenuItem onClick={(event) => handleUnpin(event, 'left')}>Unpin</MenuItem>
          <MenuItem onClick={(event) => handlePinRight(event)}>Pin Right</MenuItem>
        </GridColumnMenuContainer>
      );
    }

    if (pinnedColumnsRight.includes(currentColumn.field)) {
      return (
        <GridColumnMenuContainer>
          <GridColumnMenu {...props} />
          <MenuItem onClick={(event) => handlePinLeft(event)}>Pin Left</MenuItem>
          <MenuItem onClick={(event) => handleUnpin(event, 'right')}>Unpin</MenuItem>
        </GridColumnMenuContainer>
      );
    }

    return (
      <GridColumnMenuContainer>
        <GridColumnMenu {...props} />
        <MenuItem onClick={(event) => handlePinLeft(event)}>Pin Left</MenuItem>
        <MenuItem onClick={(event) => handlePinRight(event)}>Pin Right</MenuItem>
      </GridColumnMenuContainer>
    );
  };

  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={dataGridColumns}
        slots={{
          columnMenu: CustomColumnMenu,
        }}
        sx={{
          ...stickySx,
          '& .MuiDataGrid-columnHeaders': {
            '& .MuiDataGrid-columnHeadersInner': {
              transform: 'none !important',
            },
          },
        }}
      />
    </div>
  );
}

export default DataGridDemo;
