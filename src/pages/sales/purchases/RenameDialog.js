import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import {Edit} from '@mui/icons-material';
import MaterialTable from 'utils/SafeMaterialTable';
import {IconButton, Typography} from '@mui/material';

export default function AlertDialog({tabData, setDataApi, dupNames}) {
  const [open, setOpen] = React.useState(false);
  const [dupData, setdupData] = React.useState([]);
  const [uniqData, setuniqData] = React.useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    const unique = [];
    const dup = [];
    tabData.forEach((d) => {
      if (dupNames.includes(d.name)) {
        dup.push(d);
      } else {
        unique.push(d);
      }
    });
    setuniqData(unique);
    setdupData(dup);
  }, []);

  return (
    <div>
      <IconButton sx={{ml: '5px'}} onClick={handleClickOpen}>
        <Edit />
      </IconButton>

      <Dialog
        open={open}
        // onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth='md'
        fullWidth
      >
        <DialogContent>
          <MaterialTable
            options={{
              headerStyle: {
                fontSize: 15
              },
                // showTitle: false,
                // toolbar: false,
                // paging: Tdata.length > 4 ? true : false,
                // pageSize: 20,
                // pageSizeOptions: [20, 50, 100]
            }}

            columns={[
              {
                field: 'name',
                title: 'Name',
              },
            ]}
            data={dupData}
            title={<Typography variant='h6'>Rename Products</Typography>}
            editable={{
              onBulkUpdate: (changes) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    const makeData = [...dupData];
                    Object.keys(changes).map((d) => {
                      makeData[d] = changes[d].newData;
                    });
                    setDataApi([...makeData, ...uniqData]);
                    resolve();
                  }, 1000);
                }),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

