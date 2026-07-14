import MaterialTable, {MTableToolbar} from 'utils/SafeMaterialTable';
import moment from 'moment';
import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {maxBodyHeight, headerStyle, cellStyle} from 'utils/pageSize';
import AddIcon from '@mui/icons-material/Add';
import { Card, Dialog,Box, Tabs, Tab, Typography } from '@mui/material';
import ProposalMail from 'components/proposalmail';
import { useCustomFetch } from 'utils/useCustomFetch';
import ProposalWhatsApp from './ProposalWhatsapp';
import API_URLS from '../../../../utils/customFetchApiUrls';
function ProposalCard(props) {
  const customFetch = useCustomFetch()

  const [pagination, setPagination] = useState({
    pageCount: 0,
    numPerPage: 5,
  });
  const [display, setDisplay] = useState(false);
  const [tdata, setTabledata] = useState([]);
  const [apiError, setApiError] = useState('');

    const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const a11yProps = (index) => ({
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  });

  useEffect(() => { (async () => {
    let mounted = true;

    const loadProposalHistory = async () => {
      if (!props?.data?.lead_id) {
        if (mounted) {
          setTabledata([]);
          setApiError('');
        }
        return;
      }

      const payload = { type: 'get' };
      const response = await customFetch(
        API_URLS.CREATE_QUOTATION_PROPOSAL,
        'POST',
        payload
      );

      if (!mounted) return;

      if (response?.error) {
        setApiError('Unable to load proposal history');
        setTabledata([]);
        return;
      }

      setApiError('');
      setTabledata(Array.isArray(response?.data) ? response.data : []);
    };

    loadProposalHistory();
    return () => {
      mounted = false;
    };
  })();
}, [pagination.pageCount, pagination.numPerPage, props?.data?.lead_id]);

  const handlePageChange = (page) => {
    setPagination({...pagination, pageCount: page});
  };

  const handlePageSizeChange = (size) => {
    setPagination({...pagination, numPerPage: size});
  };

  const handleFormOpen = () => {
    setDisplay(true);
  };
  const handleMailClose = (data) => {
    setDisplay(false);
    setTabledata(Array.isArray(data) ? data : []);
  };
  const columns = [
    {
      field: 'to',
      title: 'To',
    },
    {
      field: 'cc',
      title: 'CC',
    },
    {
      field: 'subject',
      title: 'Subject',
    },
    {
      field: 'content',
      title: 'Content',
    },
    {
      field: 'createdAt',
      title: 'Created At',
      render: (rowData) => moment(rowData.createdAt).format('DD/MM/YYYY hh:mm A'),
    },
  ];
  

  return (
    <>
      {display === false && (
        <Card style={{ width: '100%', margin: '10px auto' }}>
        {apiError ? (
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography color='error'>{apiError}</Typography>
          </Box>
        ) : null}
        <MaterialTable
          totalCount={Array.isArray(tdata) ? tdata.length : 0}
          data={Array.isArray(tdata) ? tdata : []}
          columns={columns}
          options={{
            filtering: false,
            actionsColumnIndex: -1,
            paging: true,
            pageSize: pagination.numPerPage,
            pageSizeOptions: [5, 10, 20],
            search: false,
            maxBodyHeight: maxBodyHeight,
            headerStyle,
            cellStyle,
          }}
          page={pagination.pageCount}
          onPageChange={(page) => handlePageChange(page)}
          onRowsPerPageChange={(size) => handlePageSizeChange(size)}
          components={{
            Toolbar: (props) => (
              <div>
                <div
                  style={{ display: 'flex', width: '100%', alignItems: 'center' }}
                >
                  <div style={{ width: '100%' }}>
                    <MTableToolbar {...props} />
                  </div>
                </div>
              </div>
            ),
          }}
          actions={[
            {
              icon: () => <AddIcon />,
              tooltip: 'Add',
              isFreeAction: true,
              onClick: handleFormOpen,
            },
          ]}
          title="Proposal"
        />
        </Card>
      )}
      
      {display === true && (
        <Dialog open={display} maxWidth="lg" fullWidth>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="Proposal Tabs">
          <Tab label="Email" {...a11yProps(0)} />
          <Tab label="WhatsApp" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {value === 0 && (
        <ProposalMail handleMailClose={handleMailClose} />
      )}

      {value === 1 && (
        <ProposalWhatsApp handleClose={handleMailClose} />
      )}
    </Dialog>
      )}
    </>
  );
}  

ProposalCard.propTypes = {
  data: PropTypes.array,
};

export default ProposalCard;

