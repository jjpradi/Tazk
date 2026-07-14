import React from 'react';
import TablePagination from '@mui/material/TablePagination';
import PropTypes from 'prop-types';

const AppsPagination = ({
  page,
  onPageChange,
  count = 0,
  rowsPerPage = 20,
  rowsPerPageOptions = [],
  onRowsPerPageChange,
  ...rest
}) => {
  return (
    <TablePagination
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      backIconButtonProps={{ 'aria-label': 'Previous Page' }}
      nextIconButtonProps={{ 'aria-label': 'Next Page' }}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={rowsPerPageOptions}
      {...rest}
    />
  );
};

export default AppsPagination;

AppsPagination.propTypes = {
  count: PropTypes.number,
  page: PropTypes.number,
  onPageChange: PropTypes.func,
  rowsPerPage: PropTypes.number,
  rowsPerPageOptions: PropTypes.array,
  onRowsPerPageChange: PropTypes.func,
};
