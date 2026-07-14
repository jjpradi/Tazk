import { Box, Card, Grid, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import OppositeContentTimeline from 'components/erpDesign/timeline_design';
import { headerStyle } from 'utils/pageSize';
import dayjs from "dayjs";
const CheckBounceLandingPage = (props) => {

    const {
        salesManReducer: { getChequeById },
        vendorReducer: { po_temp },
    } = useSelector(state => state)

    const getCheque = getChequeById ? Object.keys(getChequeById).length : 0

    const address = getCheque > 0 ? [getChequeById.cust?.[0]?.address, getChequeById?.cust?.[0]?.area].filter(Boolean).join(', ') : ''
    const address1 = getCheque > 0 ? [getChequeById.cust?.[0]?.city, getChequeById.cust?.[0]?.state, getChequeById.cust?.[0]?.zip].filter(Boolean).join(', ') : ''

    const numberToWords = (num) => {
        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
            'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ]
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

        const numToWords = (n) => {
            if (n < 20) return a[n]
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '')
            if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '')
            if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '')
            return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '')
        }

        if (!num || isNaN(num)) return ''
        return numToWords(Number(num)) + ' Only'
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

    // const handlePrintReceipt = () => {
    //     try {
    //         const base64 = po_temp.pdfBase64

    //         const byteChars = atob(base64)
    //         const byteNumbers = new Array(byteChars.length)

    //         for (let i = 0; i < byteChars.length; i++) {
    //             byteNumbers[i] = byteChars.charCodeAt(i)
    //         }

    //         const byteArray = new Uint8Array(byteNumbers)
    //         const blob = new Blob([byteArray], { type: 'application/pdf' })

    //         const blobUrl = URL.createObjectURL(blob)

    //         const iframe = document.createElement('iframe')
    //         iframe.style.display = 'none'
    //         iframe.src = blobUrl
    //         document.body.appendChild(iframe)

    //         iframe.onload = () => {
    //             iframe.contentWindow.focus()
    //             iframe.contentWindow.print()
    //         }
    //     } 
    //     catch (err) {
    //         console.error('Print error:', err)
    //     }
    // }


    // const handleDownloadReceipt = () => {
    //     try {
    //         const base64 = po_temp.pdfBase64

    //         const byteCharacters = atob(base64)
    //         const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i))
    //         const byteArray = new Uint8Array(byteNumbers)
    //         const blob = new Blob([byteArray], { type: 'application/pdf' })

    //         const url = URL.createObjectURL(blob)
    //         const link = document.createElement('a')
    //         link.href = url
    //         link.download = getCheque ? `${getChequeById.chequeDetails[0]?.receipt_number || 'Download'}.pdf` : 'Downlaod.pdf'
    //         document.body.appendChild(link)
    //         link.click()
    //         document.body.removeChild(link)
    //         URL.revokeObjectURL(url)
    //     } 
    //     catch (err) {
    //         console.error('Download error:', err)
    //     }
    // }


    return (
        <>
            <Card sx={{ p: 5, height: 'calc(100vh - 80px)', overflowY: 'auto','&::-webkit-scrollbar': {display: 'none',},scrollbarWidth: 'none',  }}> 
                <Grid container spacing={2}>
                    <Grid
                        style={{ backgroundColor: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        size={12}>
                        <Typography variant='h6' textAlign='left'>
                            CHEQUE NUMBER : {getCheque > 0 ? getChequeById.chequeDetails?.[0]?.cheque_number || '' : ''}
                        </Typography>

                        <Stack direction='row' display='flex' justifyContent='flex-end' gap={3}>
                            {/* <Tooltip title='Download' placement='top'>
                            <IconButton onClick={handleDownloadReceipt} disabled={getCheque === 0}>
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Print' placement='top'>
                            <IconButton onClick={handlePrintReceipt} disabled={getCheque === 0}>
                                <PrintIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Edit' placement='top'>
                            <IconButton onClick={props.handleEdit} disabled={getCheque === 0}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Delete' placement='top'>
                            <IconButton onClick={props.handleDelete} disabled={getCheque === 0}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip> */}
                        </Stack>
                    </Grid>

                    <Grid
                        sx={{ minHeight: '40px', maxHeight: '120px' }}
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>

                        <Grid container>
                            <Grid size={8}>
                                <Typography variant='h6'>{getCheque > 0 ? (getChequeById.cust?.[0]?.company_name || getChequeById.chequeDetails[0]?.company_name || '').toUpperCase() : ''}</Typography>
                            </Grid>

                            <Grid display='flex' justifyContent='flex-end' size={4}>
                                <Typography variant='h6'> Date: {getCheque > 0 ? dayjs(getChequeById.chequeDetails?.[0]?.date).format('DD/MM/YYYY') : ''}</Typography>
                            </Grid>
                        </Grid>
                        {
                            address &&
                            <Typography sx={{ fontSize: '12px' }}>{address}</Typography>
                        }
                         {
                            address1 &&
                            <Typography sx={{ fontSize: '12px' }}>{address1}</Typography>
                        }
                        {
                            (getChequeById?.chequeDetails[0]?.type === 'Receipts' || getChequeById?.chequeDetails[0]?.type === 'Payments') &&
                               <Typography sx={{ fontSize: '12px' }}>GSTIN/UIN : {getCheque > 0 ? getChequeById.cust?.[0]?.tax_id || '' : ''}</Typography>
                        }
                     
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Grid container spacing={3}>
                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Box sx={{ borderBottom: '1px solid', width: 'auto', mb: 2 }} />
                            </Grid>

                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Grid container spacing={3}>
                                    <Grid
                                        size={{
                                            lg: 8,
                                            md: 8,
                                            sm: 8,
                                            xs: 8
                                        }}>
                                        <Grid container spacing={2}>
                                            <Grid
                                                size={{
                                                    lg: 12,
                                                    md: 12,
                                                    sm: 12,
                                                    xs: 12
                                                }}>
                                                <Grid container spacing={3}>
                                                    <Grid
                                                        size={{
                                                            lg: 4,
                                                            md: 6,
                                                            sm: 6,
                                                            xs: 6
                                                        }}>
                                                        <Typography variant='h6'>Payment Mode</Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 1,
                                                            md: 1,
                                                            sm: 1,
                                                            xs: 1
                                                        }}>
                                                        <Typography variant='h6'> : </Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 5,
                                                            md: 5,
                                                            sm: 5,
                                                            xs: 5
                                                        }}>
                                                        <Typography sx={{ fontSize: '12px' }}>{'CHEQUE'}</Typography>
                                                    </Grid>
                                                    {['Pay In', 'Pay Out'].includes(getChequeById.chequeDetails?.[0]?.type) && (
                                                        <>
                                                            <Grid
                                                                size={{
                                                                    lg: 4,
                                                                    md: 6,
                                                                    sm: 6,
                                                                    xs: 6
                                                                }}>
                                                                <Typography variant='h6'>Cash Type</Typography>
                                                            </Grid>
                                                            <Grid
                                                                size={{
                                                                    lg: 1,
                                                                    md: 1,
                                                                    sm: 1,
                                                                    xs: 1
                                                                }}>
                                                                <Typography variant='h6'> : </Typography>
                                                            </Grid>
                                                            <Grid
                                                                size={{
                                                                    lg: 5,
                                                                    md: 5,
                                                                    sm: 5,
                                                                    xs: 5
                                                                }}>
                                                                <Typography sx={{ fontSize: '12px' }}>
                                                                    {getChequeById.chequeDetails?.[0]?.type}
                                                                </Typography>
                                                            </Grid>
                                                        </>
)}

                                                </Grid>
                                            </Grid>

                                            <Grid
                                                size={{
                                                    lg: 12,
                                                    md: 12,
                                                    sm: 12,
                                                    xs: 12
                                                }}>
                                                <Grid container spacing={3}>
                                                    <Grid
                                                        size={{
                                                            lg: 4,
                                                            md: 6,
                                                            sm: 6,
                                                            xs: 6
                                                        }}>
                                                        <Typography variant='h6'>Reference Number</Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 1,
                                                            md: 1,
                                                            sm: 1,
                                                            xs: 1
                                                        }}>
                                                        <Typography variant='h6'> : </Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 5,
                                                            md: 5,
                                                            sm: 5,
                                                            xs: 5
                                                        }}>
                                                        <Typography sx={{ fontSize: '12px' }}>{getCheque > 0 ? getChequeById.chequeDetails?.[0]?.reference || '' : ''}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid
                                                size={{
                                                    lg: 12,
                                                    md: 12,
                                                    sm: 12,
                                                    xs: 12
                                                }}>
                                                <Grid container spacing={3}>
                                                    <Grid
                                                        size={{
                                                            lg: 4,
                                                            md: 6,
                                                            sm: 6,
                                                            xs: 6
                                                        }}>
                                                        <Typography variant='h6'>Amount(In Words)</Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 1,
                                                            md: 1,
                                                            sm: 1,
                                                            xs: 1
                                                        }}>
                                                        <Typography variant='h6'> : </Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 5,
                                                            md: 5,
                                                            sm: 5,
                                                            xs: 5
                                                        }}>
                                                        <Typography sx={{ fontSize: '12px' }}>{getCheque > 0 ? numberToWords(getChequeById?.chequeDetails?.reduce((sum, list) => sum + Number(list?.amount || 0), 0)) : ''}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid
                                                size={{
                                                    lg: 12,
                                                    md: 12,
                                                    sm: 12,
                                                    xs: 12
                                                }}>
                                                <Grid container spacing={3}>
                                                    <Grid
                                                        size={{
                                                            lg: 4,
                                                            md: 6,
                                                            sm: 6,
                                                            xs: 6
                                                        }}>
                                                        <Typography variant='h6'>Note</Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 1,
                                                            md: 1,
                                                            sm: 1,
                                                            xs: 1
                                                        }}>
                                                        <Typography variant='h6'> : </Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 5,
                                                            md: 5,
                                                            sm: 5,
                                                            xs: 5
                                                        }}>
                                                        <Typography sx={{ fontSize: '12px' }}>{getCheque > 0 ? getChequeById.chequeDetails[0]?.description.split('-')[0] ?? '' : ''}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>

                                            <Grid
                                                size={{
                                                    lg: 12,
                                                    md: 12,
                                                    sm: 12,
                                                    xs: 12
                                                }}>
                                                <Grid container spacing={3}>
                                                    <Grid
                                                        size={{
                                                            lg: 4,
                                                            md: 6,
                                                            sm: 6,
                                                            xs: 6
                                                        }}>
                                                        <Typography variant='h6'>Entry Date</Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 1,
                                                            md: 1,
                                                            sm: 1,
                                                            xs: 1
                                                        }}>
                                                        <Typography variant='h6'> : </Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 5,
                                                            md: 5,
                                                            sm: 5,
                                                            xs: 5
                                                        }}>
                                                        <Typography sx={{ fontSize: '12px' }}>{getCheque > 0 ? getChequeById?.chequeDetails[0]?.entry_date ?? '' : ''}</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid
                                        display='flex'
                                        justifyContent='flex-end'
                                        size={{
                                            lg: 4,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <Box
                                            width={180}
                                            height={70}
                                            bgcolor="green"
                                            display="flex"
                                            flexDirection="column"
                                            justifyContent="center"
                                            alignItems="center"
                                            borderRadius={1}
                                        >
                                            <Typography color="white" fontWeight="bold" fontSize={14}>{getCheque > 0 ? getChequeById.chequeDetails[0]?.type === 'Receipts' || getChequeById.chequeDetails[0]?.type === 'Pay In'  ? 'Amount Received' : 'Amount Paid' : ''}</Typography>
                                            <Typography color="white" fontWeight="bold" fontSize={18}>{getCheque > 0 ? `₹ ${getChequeById?.chequeDetails?.reduce((sum, list) => sum + Number(list?.amount || 0), 0) ?? 0}` : ''}</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        {/* <Box sx={{ borderBottom: '1px solid', width: 'auto', mb: 5 }} />

                    <Table>
                        <TableHead style={{ backgroundColor : '#e8e8e8' }}>
                            <TableRow>
                                <TableCell>Invoice Number</TableCell>
                                <TableCell>Invoice Date</TableCell>
                                <TableCell>Invoice Amount</TableCell>
                                <TableCell>Due Amount</TableCell>
                                <TableCell>{props.type === 'Receipts' ? 'Received Amount' : 'Paid Amount'}</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {
                                getCheque > 0 ?
                                getChequeById?.receipts?.length > 0 &&
                                    getChequeById?.receipts?.map((rowData, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{rowData?.invoice_number === null ? 'Advance' : rowData?.invoice_number}</TableCell>
                                                <TableCell>{rowData?.invoice_date || ''}</TableCell>
                                                <TableCell>{rowData?.total || ''}</TableCell>
                                                <TableCell>{rowData?.due_amount || ''}</TableCell>
                                                <TableCell>{rowData?.payment_amount || ''}</TableCell>
                                            </TableRow>
                                        )
                                    }) : ''
                            }
                        </TableBody>
                    </Table> */}
                    </Grid>

                    {getCheque > 0 && getChequeById?.timelineData?.length > 0 && (
                        <>
                            <Grid container>
                                <Grid
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <hr></hr>
                                        <h4 style={{ paddingLeft: 10, fontSize: headerStyle.fontSize, fontWeight: headerStyle.fontWeight }}>
                                            TimeLine
                                        </h4>
                                    </div>
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    {getChequeById.timelineData.map((data) => (
                                        <OppositeContentTimeline
                                            key={data.id}
                                            m={{ ...data, updated_at: data.updated_at }}
                                            title={'Cheque Entry'}
                                            content={data.content}
                                        />
                                    ))}
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Card>
        </>
    );
}

export default CheckBounceLandingPage;