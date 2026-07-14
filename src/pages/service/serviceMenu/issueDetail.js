import React, { useEffect, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useSearchParams } from 'react-router-dom';

const IssueDetail = ({ issuedata, handleDelete, handleEdit, editdata }) => {
  const [selectedProductArray, setSelectedProductArray] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  let type = searchParams.get("type")
  console.log(type,'123');
  // useEffect(() => {
  //   console.log(type, '123');
  //   if (type === 'edit') {
  //     console.log('1');
  //     if (editdata?.issues) {
  //       let data = JSON.parse(editdata.issues)
  //       const dataWithId = data.map((row, index) => ({ ...row, id: index }));
  //       setSelectedProductArray(dataWithId);
  //     }
  //   } else if (Array.isArray(issuedata)) {
  //     const dataWithId = issuedata.map((row, index) => ({ ...row, id: index }));
  //     setSelectedProductArray(dataWithId);
  //   }
  // }, [type, editdata, issuedata]);

  useEffect(() => {
    const dataWithId = issuedata?.map((row, index) => ({ ...row, id: index }));
        setSelectedProductArray(dataWithId);
  },[issuedata])

  const columns = [
    { field: 'type', headerName: 'Type', width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
        <div style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}>
          {params.value}
        </div>
        </Tooltip>
      )
     },
    { field: 'issue', headerName: 'Issue', width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
        <div style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}>
          {params.value}
        </div>
        </Tooltip>
      )
     },
    { field: 'remarks', headerName: 'Remarks', width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value}>
        <div style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}>
          {params.value}
        </div>
        </Tooltip>
      )
     },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <div>
          <IconButton
            color="primary"
            aria-label="edit"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="secondary"
            aria-label="delete"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div style={{ margin: '0px 30px 0px 0px' }}>
      <Box sx={{ height: 200, width: '100%' }}>
        <DataGrid
          rows={selectedProductArray}
          columns={columns}
          hideFooter={true}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              '& .MuiDataGrid-columnHeader:last-of-type .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
            },
          }}
        />
      </Box>
    </div>
  );
};

export default IssueDetail;
