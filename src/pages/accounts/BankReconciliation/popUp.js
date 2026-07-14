import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Grid
} from '@mui/material';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import Link from '@mui/material/Link';
import { is } from 'date-fns/locale';
import { find } from 'lodash';
import excelicon from 'assets/icon/excelicon.svg'

function PopUpDialog(props) {
  const {
    open,
    handleClose,
    bankStatementColumn,
    importBankName,
    setImportBankName,
    importBankColumn,
    setImportBankColumn,
    importExcel,
  } = props;

    const [fileEvents, setFileEvents] = useState({})

  const [filePreviews, setFilePreviews] = useState([]);
  console.log(filePreviews, "filePreviews");

  function isXlsx(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return ['xls', 'xlsx'].includes(fileExtension);
  }

  const handleUpload = async () => {
    // console.log("sadas",fileEvents)
    const file = fileEvents?.target?.files[0];
   
    //  console.log("file",file)
   
    importExcel(file);
  };
  

  return (
    <Dialog
      open={open}
      fullWidth
      PaperProps={{
        style: { minWidth: '200px', padding: '30px' },
      }}
    >
      <DialogContent>
        <Grid container flexDirection={'column'} justifyContent={'center'} spacing={5}>
          {/* Attachment Field */}
          <Grid size="grow">
            <Grid container justifyContent="center">
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <AttachmentField
                  type='excel'
                  previews={filePreviews}
                  setPreviews={setFilePreviews}
                  bankUpload={true}
                  handleChange={(e) => {
                    // console.log("000",e);
                    setFileEvents(e)
                  }}
                  style={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </Grid>

      
          <Grid>
            <Grid container alignItems="center" justifyContent="space-between">
      
              <Link
                href={`${import.meta.env.BASE_URL}BankStatementUploadTemplate.xlsx`}
                download="BankStatementUploadTemplate.xlsx"
                underline="hover"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  color: "primary.main",
                }}
              >
                <img
                  src={excelicon}
                  alt="Payment Method"
                  style={{ height: 28, width: 24, marginRight: 8 }}
                />
                Sample Template
              </Link>

          
              <Grid>
                <Button
                  onClick={() => {
                    handleClose(false)
                    setFilePreviews([]);
                  }}
                  variant='contained'
                  color='error'
                  sx={{ marginRight: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={filePreviews.length === 0}
                  onClick={handleUpload} 
                >
                  Upload
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}


PopUpDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  bankStatementColumn: PropTypes.array,
  importBankName: PropTypes.string,
  setImportBankName: PropTypes.func,
  importBankColumn: PropTypes.array,
  setImportBankColumn: PropTypes.func,
  importExcel: PropTypes.func,
};

export default PopUpDialog;
