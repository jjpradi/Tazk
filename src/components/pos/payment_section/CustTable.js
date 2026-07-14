import React, {useContext, useEffect, useRef} from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {useDispatch, useSelector} from 'react-redux';
import Search from './Search';
import {List, ListItem, ListItemIcon, ListItemText} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { listPickCustomerAction, set_searchPickcustomerContactsAction, get_searchPickcustomerContactsAction } from 'redux/actions/customer_actions';
import Context from '../../../context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls';
const columns = [
  {
    field: 'company',
    headerName: 'Full name',
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
          <ListItemText
            primary={
              rowData.row.customer_type === '0'
                ? rowData.row.first_name
                : rowData.row.company_name
            }
          />
        </ListItem>
      </List>
    ),
    flex: 1,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
  },
  {
    field: 'phone_number_s',
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
  const filNo = pickCustomer?.length ? pickCustomer?.filter((d) => d.customer_id)?.map((d) => {
      const data = {...d};
      data.company =
        data.customer_type === '0' ? data.first_name : data.company_name;
      data.phone_number_s = makestar(data.phone_number);
      return data;
    }) : [];

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
    dispatch(set_searchPickcustomerContactsAction({ data: [], numRows: 0 }))
    const body = {
      pageCount: 0,
      numPerPage: props.pageSize,
      searchString: searchValue
    }
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(get_searchPickcustomerContactsAction(body, setModalTypeHandler, setLoaderStatusHandler))
      // dispatch(listPickCustomerAction(data, true, setLoaderStatusHandler)),
    );

   // const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');

    // const filteredRows = pickCustomer.filter((row) => {
    //   if (row.customer_id) {
    //     const {first_name, last_name, email, phone_number} = row;
    //     const newRow = {first_name, last_name, email, phone_number};
    //     return Object.keys(newRow).some((field) => {
    //       return searchRegex.test(row[field]);
    //     });
    //   } else {
    //     return false;
    //   }
    // });
    // const filterNo = filteredRows.map((data) => {
    //   const newData = {...data};
    //   let num = newData.phone_number;
    //   const startingIndex = num.indexOf(searchValue);

    //   if (num.startsWith(searchValue)) {
    //     if (startingIndex !== -1) {
    //       const endingIndex = startingIndex + searchValue.length;

    //       const start = num.slice(0, startingIndex);
    //       let highlightedText = start ? makestar(start) : '';

    //       const center = num.slice(startingIndex, endingIndex);
    //       highlightedText += center;

    //       const end = num.slice(endingIndex);
    //       highlightedText += end ? makestar(end) : '';

    //       num = highlightedText;
    //     }
    //   } else {
    //     num = makestar(num);
    //   }
    //   newData.phone_number_s = num;
    //   return newData;
    // });
    // setRows(filterNo);
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
      searchString: searchText
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
        }} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 20 } } }} onPaginationModelChange={(model) => { (props.handlePageChange)(model.page); if (model.pageSize !== 20) { (props.handlePageSizeChange)(model.pageSize); } }}
      />
    </div>
  );
}
