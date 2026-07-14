import React, {useContext, useEffect, useRef} from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {useDispatch, useSelector} from 'react-redux';
import Search from './Search';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { listPickCustomerAction } from 'redux/actions/customer_actions';
import Context from '../../../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';

const columns = [
  {
    field: 'company',
    headerName: 'Full name',
    flex: 1,
    renderCell: (rowData) => (
      <List component='nav' aria-label='main mailbox folders'>
        <ListItem>
          <ListItemIcon>
            {rowData.row.customer_type === '0' ? (
              <PersonIcon />
            ) : (
              <BusinessIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={rowData.row.company} />
        </ListItem>
      </List>
    ),
    // valueGetter: (params) =>
    //     `${params.row.first_name || ''} ${params.row.last_name || ''
    //     }`,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
  },
  {
    field: 'phone_number',
    headerName: 'Phone number',
    flex: 1,
  },
];

export default function DataGridDemo(props) {
  const {customer} = useSelector((state) => state.customerReducer);
  const {customerReducer: {pickCustomer,pickCustomerCount}} = useSelector((state) => state)
  const dispatch = useDispatch();
  const makestar = (str) => {
    if (!str) {
      return '';
    }
    let star = '';
    str.split('').forEach((d) => {
      star += '*';
    });
    return star;
  };
  const filNo = pickCustomer?.filter((d) => d.customer_id).map((d) => {
    const data = {...d};
    data.company =
      data.customer_type === '0' ? data.first_name : data.company_name;
    // data.phone_number=makestar(data.phone_number)
    return data;
  });

  const [searchText, setSearchText] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const tempdisrow = useRef(null);

  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    commoncookie,
  } = useContext(Context);

  function escapeRegExp(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  const requestSearch = (searchValue) => {
    setSearchText(searchValue);
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');

    const filteredRows = pickCustomer?.filter((row) => {
      const {first_name, last_name, email, phone_number} = row;
      const newRow = {first_name, last_name, email, phone_number};
      return Object.keys(newRow).some((field) => {
        return searchRegex.test(row[field]);
      });
    });
    const filterNo = filteredRows.map((data) => {
      const newData = {...data};
      let num = newData.phone_number;
      const startingIndex = num.indexOf(searchValue);

      if (num.startsWith(searchValue)) {
        if (startingIndex !== -1) {
          const endingIndex = startingIndex + searchValue.length;

          const start = num.slice(0, startingIndex);
          let highlightedText = start ? makestar(start) : '';

          const center = num.slice(startingIndex, endingIndex);
          highlightedText += center;

          const end = num.slice(endingIndex);
          highlightedText += end ? makestar(end) : '';

          num = highlightedText;
        }
      } else {
        num = makestar(num);
      }
      newData.phone_number = num;
      return newData;
    });
    setRows(filterNo);
  };
  const disrow = () => {
    setRows(filNo);
  };
  tempdisrow.current = disrow;
  React.useEffect(() => {
    tempdisrow.current();
  }, [props.pageSize, props.pageCount, pickCustomer]);

  useEffect(() => {
    const data = {
      pageCount: 0,
      numPerPage: props.pageSize,
      searchString:''
    }
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listPickCustomerAction(data, true, setLoaderStatusHandler)),
    );
  }, [customer])

  return (
    <div style={{height: '70vh', width: '100%'}}>
      <DataGrid
        slots={{toolbar: Search}}
        rows={rows}
        columns={columns}
        // hideFooter
        disableColumnMenu
        // pageSize={20}
        // rowsPerPageOptions={[20]}
        
        
        rowCount={pickCustomerCount}
        
        paginationMode='server'
        pageSizeOptions={[20, 50, 100]}
        slotProps={{
          toolbar: {
            value: searchText,
            onChange: (event) => requestSearch(event.target.value),
            clearSearch: () => requestSearch(''),
            setnewCust: () => props.setnewCust(true),
          },
        }}
        onRowClick={(e) => {
          props.setone(e.row);
        }}
        onRowDoubleClick={(e) => {
          props.handleClose();
        }} initialState={{ pagination: { paginationModel: { page: 0, pageSize: props.pageSize } } }} onPaginationModelChange={(model) => { (props.handlePageChange)(model.page); if (model.pageSize !== props.pageSize) { (props.handlePageSizeChange)(model.pageSize); } }}
      />
    </div>
  );
}
