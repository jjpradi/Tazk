import MaterialTable from 'utils/SafeMaterialTable';
import {Card, Link, ListItem, ListItemText, Typography} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import {
  maxBodyHeight,
  maxHeight,
  pageSize,
  headerStyle,
  cellStyle,
} from 'utils/pageSize';
import {recentCreditDebitNotesAction} from 'redux/actions/manualNotes_actions';
import CreditDebitNoteTemplate from '../../pages/sales/manualNotes/creditDebitNoteTemplate';

export default function RecentCreditDebitNotes({
  customertype,
  customer_erp_details,
  customer_id,
  contactType,
}) {
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const {
    manualNoteReducer: {recentCreditDebitNotes},
  } = useSelector((state) => state);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateData, setTemplateData] = useState({});



  useEffect(() => {
    if (customer_id !== '') {
      const data = {
        customer_id: contactType === 'Customer' ? customer_id : null,
        supplier_id: contactType === 'Supplier' ? customer_id : null,
        limit: 10,
        searchString: ''
      };
      dispatch(recentCreditDebitNotesAction(data))
      // apiCalls(
      //   setModalTypeHandler,
      //   setLoaderStatusHandler,
      //   dispatch(recentCreditDebitNotesAction(data)),
      // );
    }
  }, [customer_id, contactType]);

  return (
    <React.Fragment>
      <Card
      sx={{
              height: '450px',
              overflow: 'auto',
              // "&::-webkit-scrollbar": {
              //   width: 10,
              // },
              // "&::-webkit-scrollbar-track": {
              //   // boxShadow: "inset 0 0 5px black",
              //   borderRadius: 2,
              //   marginTop: '20px',
              //   marginBottom: '20px',
              // },
              // "&::-webkit-scrollbar-thumb": {
              //   background: "#B2B2B2",
              //   borderRadius: 2,
              // },
              // "&::-webkit-scrollbar-thumb:hover": {
              //   background: "#999",
              // }
            }}
      
      >
      <MaterialTable
          actions={[]}
          // sx={{height: '450px'  , overflow: 'auto'}}
        options={{
          headerStyle,
          cellStyle,
          maxBodyHeight: maxBodyHeight,
          minBodyHeight: '450px',
          pageSize: 10,
          paging: false,
          search: false,
        }}
        columns={[
          {title: 'Date', field: 'created_at'},
          {
            title: 'Name',
            field: 'name',
            render: (rowData) => (
              <div
                style={{
                  cursor: rowData.sale_id ? 'pointer' : '',
                  textDecoration: rowData.sale_id ? 'underline' : '',
                }}
                onClick={(event) => {
                  this.getSalesDataById(rowData);
                  event.stopPropagation();
                }}
              >
                {rowData.name}
              </div>
            ),
          },
          {
            title: 'CN/DN No.',
            field: 'sequence_number',
            render: (rowData) => (
              <Link>
                <ListItem>
                  <ListItemText
                    onClick={(event) => {
                      const templateData = {
                        sequence_number: rowData.sequence_number,
                        type: rowData.type,
                        date: rowData.created_at,
                        customer_id: rowData.customer_id,
                        supplier_id: rowData.supplier_id,
                        amount: rowData.amount
                      }
                      setTemplateOpen(true);
                      setTemplateData(templateData);
                      event.stopPropagation();
                    }}
                    style={{
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {rowData.sequence_number}
                  </ListItemText>
                </ListItem>
              </Link>
            ),
          },
          {title: 'Description', field: 'description'},
          {
            title: 'Type',
            field: 'type',
            render: (rowData) => (rowData.type === 'C' ? 'CN' : 'DN'),
          },
          {
            title: 'Amount',
            field: 'amount',
            cellStyle: {
              textAlign: 'right',
              paddingRight: '150px',
              fontSize: cellStyle.fontSize,
            },
            render: (rowData) => rowData.amount.toFixed(2),
          },
        ]}
        data={recentCreditDebitNotes}
        title={
          <Typography variant='h6'>{`Recent ${
            customertype !== 0 ? 'Credit' : 'Debit'
          } Notes`}</Typography>
        }
      />
      {templateOpen && (
        <CreditDebitNoteTemplate
          open={templateOpen}
          handleClose={() => setTemplateOpen(false)}
          templateData={templateData}
        />
      )}
    </Card>
    </React.Fragment>
  );
}

