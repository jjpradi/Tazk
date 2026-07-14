import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Badge, Card, Divider, Fab, Grid, IconButton, Modal, Button, Typography ,Link} from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import DownloadIcon from '@mui/icons-material/Download';
import { CSVDownload, CSVLink } from 'react-csv';
import { Box } from '@mui/system';
import FileDragDrop from '../../../pages/sales/sales/fileDragDrop'
import { ExportCsv } from '@material-table/exporters';
import excelicon from 'assets/icon/excelicon.svg'
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 25,
    p: 5,
    borderRadius: 5,
    display:"flex",
    flexDirection:'column',
};

const cardcss = {
    position : 'relative',
    top: '27%'
}

const button = {
    position: 'absolute',
    top: '89%',
    left: '37%',
};





export default function CommonImport(props) {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const csvReport = {
        headers: props.headers,
        data:props.data,
        filename:"Sample Template.csv",
        target: "_blank" 
    }

    const saleColumnData = [{'title': 'ProductName'},{'title': 'Qty'},{'title': 'LotNumber'},{'title': 'SellingCost'}]
    const purchaseColumnData = [
        { title: 'InvoiceNo', field: 'InvoiceNo' },
        { title: 'InvoiceDate', field: 'InvoiceDate' },
        { title: 'ProductName', field: 'ProductName' },
        { title: 'LotNumber', field: 'LotNumber' },
        { title: 'SupplierName', field: 'SupplierName' },
        { title: 'PurchaseQuantity', field: 'PurchaseQuantity' },
        { title: 'PurchaseCost', field: 'PurchaseCost' }
      ];
    const salesRowData = []
    const purchaseRowData =  [
        {
          InvoiceNo: 'test',
          InvoiceDate: '02-05-2025',
          ProductName: 'test',
          LotNumber: '"12345,123333"',
          SupplierName: 'test',
          PurchaseQuantity: 2,
          PurchaseCost: 2000,
        }
      ];
    return (
        <>
            <Modal
                open={props.open}
                onClose={() => props.handleClose(false)}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
                align="center"
            >

                <Card sx={style} >
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                        <IconButton aria-label="close" onClick={() => props.handleClose(false)} style={{display:'flex',justifyContent:'flex-end'}}>
                            <CloseIcon />

                        </IconButton>
                        </div>
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>

                        {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }} sx={{}} fullWidth='true' >
                            <Fab color="secondary" variant="extended" size="medium" fullWidth
                                component='label'
                            >
                                <DownloadIcon sx={{ mr: 1 }} />
                                Sample Template
                            </Fab>
                               <CSVLink
                                 {...csvReport}>
                                </CSVLink>
                        </Grid> */}
                        
                        {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} fullWidth='true' display='flex' justifyContent={'center'}>
                            <Fab
                                 variant="extended"
                            
                                component='label'

                            >
                                <input type='file' hidden onChange={props.encodeImageFileAsURL} />
                                <UploadFileIcon sx={{ mr: 1 }} />
                                <Typography style={{ fontSize: '15px' }}>Upload File</Typography>
                            </Fab>

                        </Grid> */}

                        <Grid>
                            <Box
                                p='30px'
                                display='flex'
                                justifyContent='center'
                                alignItems='center'
                                style={{
                                backgroundColor: '#F4F7FE',
                                width: '100%',
                                height: '80%',
                                borderRadius: '10px',
                                }}
                            >
                            <FileDragDrop
                                setUploadedFiles={setUploadedFiles}
                                uploadedFiles={uploadedFiles}
                                encodeImageFileAsURL={props.encodeImageFileAsURL}
                                
                            />
                            </Box>
                        </Grid>
                        <Grid
                            fullWidth='true'
                            display='flex'
                            justifyContent={'center'}
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>

                            {
                                props.type === 'sale' ?
                                <Link
                                href={`${import.meta.env.BASE_URL}salesUploadTemplate.xlsx`}
                                download="salesUploadTemplate.xlsx"
                                underline="hover"
                                sx={{
                                    display: "flex",
                                    alignItems: "left",
                                    cursor: "pointer",
                                    color: "primary.main",
                                }}
                            >
                                <img
                                    src={excelicon}
                                    alt="upload"
                                    style={{ height: 28, width: 24 }}
                                />
                                Sample Template
                            </Link>
                             :

                                    <Link
                                        href={`${import.meta.env.BASE_URL}purchaseUploadTemplate.xlsx`}
                                        download="purchaseUploadTemplate.xlsx"
                                        underline="hover"
                                        sx={{
                                            display: "flex",
                                            alignItems: "left",
                                            cursor: "pointer",
                                            color: "primary.main",
                                        }}
                                    >
                                        <img
                                            src={excelicon}
                                            alt="upload"
                                            style={{ height: 28, width: 24 }}
                                        />
                                        Sample Template
                                    </Link>


                            }


                        </Grid>

                    </Grid>

                </Card>
            </Modal>
        </>
    );
}
