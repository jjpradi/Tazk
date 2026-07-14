import { Button, Card, Grid, IconButton, Tooltip } from '@mui/material'
import OptionButton from 'components/erpDesign/actionButton'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import AlertDialog from 'pages/common/Dialog'
import CommonInvoiceTemplate from 'pages/sales/CommonInvoiceTemp/CommonInvoiceTemplate'

const ReceiptDetails = (props) => {

    const {
        vendorReducer : { po_temp }
    } = useSelector(state => state)

    const [optionIndex, setOptionIndex] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    
    const handleReceiptsOptionsChange = (option) => {
        setOptionIndex(option)
        if(option === 1) {
            if(props.type === 'Payments'){
                props.setDeleteDialogOpen(true)
            }
            else{
                setDeleteDialogOpen(true)
            }
        }
        else if(option === 0) {
            setTimeout(() => {
                handlePrintReceipt()
                setOptionIndex(null)
            }, 100)
        }
    }

    const reviveLayout = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(reviveLayout)
        }
        if (obj !== null && typeof obj === 'object') {
            return Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => {
                        return [key, reviveLayout(value)]
                })
            );
        }
        if (typeof obj === 'string' && obj.trim().startsWith('(') && obj.includes('=>')) {
            return eval(`(${obj})`)
        }
        return obj
    }

    const handlePrintReceipt = () =>{  
        try {
            pdfMake.fonts = {
                Poppins : {
                    normal :   'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Regular.ttf',
                    bold :     'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Bold.ttf',
                    italics :  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-Italic.ttf',
                    bolditalics : 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/poppins/Poppins-BoldItalic.ttf'
                }
            }

            let data = reviveLayout(po_temp)
            pdfMake.createPdf(data).getBase64((base64Pdf) => {
                function base64ToBlob(base64, mimeType) {
                    const byteChars = atob(base64)
                    const byteNumbers = new Array(byteChars.length)
                    for (let i = 0; i < byteChars.length; i++) {
                        byteNumbers[i] = byteChars.charCodeAt(i)
                    }
                    const byteArray = new Uint8Array(byteNumbers)
                    return new Blob([byteArray], { type : mimeType })
                }
            
                const pdfBlob = base64ToBlob(base64Pdf, 'application/pdf')
                const blobUrl = URL.createObjectURL(pdfBlob)
            
                const iframe = document.createElement('iframe')
                iframe.style.display = 'none'
                iframe.src = blobUrl
                document.body.appendChild(iframe)
            
                iframe.onload = () => {
                    iframe.contentWindow.focus()
                    iframe.contentWindow.print()
                }
            })
        }
        catch(err){
            return err
        }
    }

    const handleDetailClose = () => {
        props.handleClose()
    }

  return (
      <>
          {
              optionIndex === null &&
              <>
                  <Grid container spacing={2} display='flex' justifyContent='flex-end'>
                      <Grid>
                          <Button
                              variant='contained'
                              color='inherit'
                              onClick={handleDetailClose}
                          >
                              Back
                          </Button>
                      </Grid>

                      <Grid>
                          <OptionButton
                              checkType='ReceiptsOption'
                              handleReceiptsOptionsChange={handleReceiptsOptionsChange}
                          />
                      </Grid>

                      <Grid>
                          <Tooltip title='Previous'>
                              <IconButton
                                  color='primary'
                                  onClick={() => props.handlePrev()}
                                  disabled={props.rowIndex === 0}
                              >
                                  <ArrowBackIosNewIcon />
                              </IconButton>
                          </Tooltip>
                      </Grid>

                      <Grid>
                          <Tooltip title='Next'>
                              <IconButton
                                  color='primary'
                                  onClick={() => props.handleNext()}
                                  disabled={props?.data?.length - 1 === props.rowIndex}
                              >
                                  <ArrowForwardIosIcon />
                              </IconButton>
                          </Tooltip>
                      </Grid>
                  </Grid>

                  
                  <Grid container sx={{ display : 'flex', justifyContent : 'center' }}>
                      <Grid>
                          <Card sx={{ p : 3, width : '845px' }}>
                              <CommonInvoiceTemplate />
                          </Card>
                      </Grid>
                  </Grid>
              </>
          }
          {
              <AlertDialog
                  delete={deleteDialogOpen}
                  handleClose={() => props.handleClose()}
                  handleDelete={() => {props.handleDelete(); props.handleClose()}}
              />
          }
      </>
  );
}

export default ReceiptDetails