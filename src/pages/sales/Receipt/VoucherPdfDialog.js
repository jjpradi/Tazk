import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'
import ShareIcon from '@mui/icons-material/Share'

const VoucherPdfDialog = ({ open, onClose, pdfBase64, voucherNumber, title }) => {

    const pdfDataUrl = pdfBase64 ? `data:application/pdf;base64,${pdfBase64}#toolbar=0&navpanes=0&scrollbar=1` : ''

    const getPdfBlob = () => {
        const byteChars = atob(pdfBase64)
        const byteNumbers = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i))
        return new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' })
    }

    const handlePrint = () => {
        if (!pdfBase64) return
        const blobUrl = URL.createObjectURL(getPdfBlob())
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = blobUrl
        document.body.appendChild(iframe)
        iframe.onload = () => {
            iframe.contentWindow.focus()
            iframe.contentWindow.print()
        }
    }

    const handleDownload = () => {
        if (!pdfBase64) return
        const url = URL.createObjectURL(getPdfBlob())
        const link = document.createElement('a')
        link.href = url
        link.download = `${voucherNumber || 'voucher'}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleShare = async () => {
        if (!pdfBase64) return
        const fileName = `${voucherNumber || 'voucher'}.pdf`
        const file = new File([getPdfBlob()], fileName, { type: 'application/pdf' })

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ title: fileName, files: [file] })
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Share failed:', err)
            }
        } else {
            handleDownload()
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { height: '90vh', display: 'flex', flexDirection: 'column' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, px: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography component="span" sx={{ fontSize: '14px', fontWeight: 600 }}>
                    {title || voucherNumber || 'Voucher Preview'}
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ flex: 1, p: 0, overflow: 'hidden' }}>
                {pdfBase64 ? (
                    <iframe
                        src={pdfDataUrl}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Voucher PDF"
                    />
                ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography color="text.secondary">No PDF available</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ borderTop: '1px solid #e0e0e0', px: 2, py: 1 }}>
                <Button onClick={onClose} variant="outlined" size="small">
                    Close
                </Button>
                <Button onClick={handleShare} variant="outlined" size="small" startIcon={<ShareIcon />} disabled={!pdfBase64}>
                    Share
                </Button>
                <Button onClick={handleDownload} variant="outlined" size="small" startIcon={<DownloadIcon />} disabled={!pdfBase64}>
                    Download
                </Button>
                <Button onClick={handlePrint} variant="contained" size="small" startIcon={<PrintIcon />} disabled={!pdfBase64}>
                    Print
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default VoucherPdfDialog
