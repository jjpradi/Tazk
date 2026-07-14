import AppTextField from "@crema/core/AppFormComponents/AppTextField";
import IntlMessages from "@crema/utility/IntlMessages";
import styled from "@emotion/styled";
import { Box, Button, Card, Chip, Grid, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import ReactQuill, { Quill } from 'react-quill-new'
import { useDispatch, useSelector } from "react-redux";
import { getAppConfigDataAction } from "redux/actions/app_config_actions";
import SendIcon from '@mui/icons-material/Send';
import PropTypes from "prop-types";
import 'react-quill-new/dist/quill.snow.css'
import { getsessionStorage } from "pages/common/login/cookies";
import { capitalize } from "lodash";
import { createQuotationPdfAction, sendQuotationMailAction } from "redux/actions/quotation_actions";
import ReactDOMServer from 'react-dom/server'
import CreateNewButtonContext from "context/CreateNewButtonContext";
import moment from "moment";
import { useCustomFetch } from "utils/useCustomFetch";
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';

let Block = Quill.import('blots/block');
Block.tagName = 'table';
Quill.register(Block)

const ReactQuillWrapper = styled(ReactQuill)(() => {
  return {
    '& .ql-toolbar': {
      borderRadius: '8px 8px 0 0',
    },
    '& .ql-container': {
      borderRadius: '0 0 8px 8px',
      minHeight: 150,
      maxHeight: 200,
    },
    '& .quill-editor': {
      maxHeight: '400px',
      overflow: 'auto'
    },    
    '& .quill-editor, & .ql-container': {
      overflow: 'auto'
    },
    '& .quill-editor, & .ql-editor': {
      minHeight: '200px',
      overflowWrap: 'break-word'
    }
  };
})

const emailContent = (data) => {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Quotation Email Template</title>
        </head>

        <body style="margin: 0; background-color: #cccccc; height: max-content;">
          <center style="width: 100%; table-layout: fixed; background-color: #cccccc;">
            <table style="background-color: #ffffff; margin: 0 auto; max-width: 800px; font-family: 'Times New Roman', Times, serif; color: #171a1b; font-size: 13px; border-collapse: collapse; width: 100%;">
              
              <tr height="8">
                <td style="background-color: #171a1b;"></td>
                <td style="background-color: #171a1b;"></td>
                <td style="background-color: #171a1b;"></td>
              </tr>

              <tr height="40">
                <td style="background-color: #4285f4; color: #ffffff; text-align: center; width: 10%;"></td>
                <td style="background-color: #4285f4; color: #ffffff; text-align: center; width: 80%;">
                  <h3>QUOTE - # ${data.quoteNumber}</h3>
                </td>
                <td style="background-color: #4285f4; color: #ffffff; text-align: center; width: 10%;"></td>
              </tr>

              <tr height="15"></tr>

              <tr>
                <td style="width: 10%;"></td>
                <td style="width: 80%;">
                  Dear ${data.customerName},
                  <br><br>
                  Thank you for contacting us. Your quote can be viewed, printed and downloaded as PDF from the link below.
                </td>
                <td style="width: 10%;"></td>
              </tr>

              <tr height="15"></tr>

              <tr>
                <td style="width: 10%;"></td>
                <td style="width: 80%;">
                  <table style="background-color: #e1c16e; width: 100%;">

                    <tr height="5"></tr>

                    <tr height="10">
                      <td style="width: 10%;"></td>
                      <td style="width: 80%; text-align: center;">
                        QUOTE AMOUNT
                      </td>
                      <td style="width: 10%;"></td>
                    </tr>

                    <tr height="10">
                      <td style="width: 10%;"></td>
                      <td style="width: 80%; text-align: center; color: #d22b2b; font-size: 16px;">
                        ₹${data.total}
                      </td>
                      <td style="width: 10%;"></td>
                    </tr>

                    <tr>
                      <td style="width: 10%;"></td>
                      <td style="width: 80%;">
                        <hr style="border-top: 1px solid #fdda0d;">
                      </td>
                      <td style="width: 10%;"></td>
                    </tr>

                    <tr height="8"></tr>

                    <tr>
                      <td style="width: 10%;"></td>
                      <td style="width: 80%;">
                        <table style="width: 100%;">
                          <tr>
                            <td style="width: 20%;"></td>
                            <td style="width: 30%;">
                              Quotation Number
                            </td>
                            <td style="width: 15%;"></td>
                            <td style="width: 25%;">
                              ${data.quoteNumber}
                            </td>
                            <td style="width: 10%;"></td>
                          </tr>
                        </table>
                      </td>
                      <td style="width: 10%;"></td>
                    </tr>

                    <tr height="3"></tr>

                    <tr>
                      <td style="width: 10%;"></td>
                      <td style="width: 80%;">
                        <table style="width: 100%;">
                          <tr>
                            <td style="width: 20%;"></td>
                            <td style="width: 30%;">
                              Quotation Date
                            </td>
                            <td style="width: 15%;"></td>
                            <td style="width: 25%;">
                              ${data.createdDate}
                            </td>
                            <td style="width: 10%;"></td>
                          </tr>
                        </table>
                      </td>
                      <td style="width: 10%;"></td>
                    </tr>

                    <tr height="15"></tr>

                  </table>
                </td>
                <td style="width: 10%;"></td>
              </tr>

              <tr height="15"></tr>

              <tr>
                <td style="width: 10%;"></td>
                <td style="width: 80%;">
                  Regards,
                </td>
                <td style="width: 10%;"></td>
              </tr>

              <tr>
                <td style="width: 10%;"></td>
                <td style="width: 80%;">
                  ${data.sender}
                  <br>
                  ${data.companyName}
                </td>
                <td style="width: 10%;"></td>
              </tr>

              <tr height="20"></tr>

            </table>
          </center>
        </body>
      </html>`
}

const previewContent = (data) => {
  return `
    <h3 class="ql-align-center">QUOTE - # ${data.quoteNumber}</h3>
<table>
  <tr>
    <td><br></td>
  </tr>
</table>
<h3>Dear ${data.customerName},</h3>
<table>
  <tr>
    <td>Thank you for contacting us. Your quote can be viewed, printed, and downloaded as a PDF from the link below.</td>
  </tr>
</table>
<table>
  <tr>
    <td><br></td>
  </tr>
</table>
<h3 class="ql-align-center">QUOTE AMOUNT</h3>
<h3 class="ql-align-center">₹${data.total}</h3>
<h3 class="ql-align-center">Quotation Number:  ${data.quoteNumber}</h3>
<h3 class="ql-align-center">Quotation Date: ${data.createdDate}</h3>
<table>
  <tr>
    <td><br></td>
  </tr>
</table>
<table>
  <tr>
    <td>Regards,</td>
  </tr>
</table>
<table>
  <tr>
    <td>${data.sender}</td>
  </tr>
</table>
</br>
<table>
  <tr>
    <td>${data.companyName}</td>
  </tr>
</table>`
}
function Mail(props){

  const date = new Date()
  const currentDate = moment(date).format('DD/MM/YYYY')
  const storage = getsessionStorage()
  const dispatch = useDispatch()
  const {
    appConfigReducer: {app_config_data},
    quotationReducer: {quotationPdf}
  } = useSelector(state => state)
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)

  const [formValues, setFormValues] = useState({
    from: null,
    to: [],
    cc: null,
    bcc: null,
    subject: null,
    content: null,
  })
  const [formErrors, setFormErrors] = useState({
    from: null,
    to: null,
    subject: null,
    content: null,
  })
  const [isShowChip, setIsShowChip] = useState(false)
  const [isShowCc, setIsShowCc] = useState(false)
  const [isShowBcc, setIsShowBcc] = useState(false)
  const [emails, setEmails] = useState('')
  const [fileName, setFileName] = useState('')
  const [url, setUrl] = useState('');
  //const [content, setContent] = useState('');

  const senderFullName = storage.last_name === null || storage.last_name === "" ? storage.first_name : `${storage.first_name} ${storage.last_name}`

  const customFetch = useCustomFetch();

  useEffect(() => {
    const html = emailContent({quoteNumber: props.data.quotation_number, createdDate: moment(props.data.quotation_date).format('DD/MM/YYYY'), customerName: props.data.customerFullName, total: props.data.total, sender: senderFullName, companyName: props.company.companyName})
    const content = previewContent({quoteNumber: props.data.quotation_number, createdDate: moment(props.data.quotation_date).format('DD/MM/YYYY'), customerName: props.data.customerFullName, total: props.data.total, sender: senderFullName, companyName: props.company.companyName})
    console.log(content,'content');
    setFormValues((prev) => ({
      ...prev,
      content: content,  
      html: html, 
    }));
  }, []); 

  // const fetchHtmlContent = async () => {
  //   try {
  //     const response = await customFetch(`/Leads/get_html/design`, 'GET');
  //     console.log('Updated content123:', response?.data);
  //     setFormValues((prev) => ({
  //       ...prev,
  //       content: response?.data,
  //       html: response?.data,
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching HTML:', error);
  //   }
  // };
  useEffect(() => {
    if(app_config_data.length > 0){
      app_config_data.map((data) => {
        if(data.key_name === 'company.email'){
          setFormValues((prev) => ({...prev, from: data.value}))
        }
      })
    }
  }, [app_config_data])

  useEffect(() => { (async () => {
    let pdfLink = ''
    let resData = null
    const payload = {
      quotation_id: props.data.quotation_id,
      companyLogo: props.company.company_logo,
      companyName: props.company.companyName,
      companyFullAddress: props.company.fullAddress,
      companyPincode: props.company.pincode,
      customerFullName: props.data.customerFullName,
      customerAddress: props.data.customerAddress,
      customerArea: props.data.customerArea ? props.data.customerArea : '', 
      customerCity: props.data.customerCity ? props.data.customerCity : '' ,
      customerState: props.data.customerState,
      customerPincode: props.data.customerPincode,
      reference: props.data.reference ? props.data.reference : '',
      quotationFor: props.data.quotation_for ? props.data.quotation_for : '',
      quotationNumber: props.data.quotation_number,
      quotationDate: moment(props.data.quotation_date).format('DD/MM/YYYY'),
      expiry: props.data.expiry,
      paymentTerms: props.data.payment_terms ? props.data.payment_terms : '',
      deliveryTerms: props.data.delivery_terms ? props.data.delivery_terms : '',
      createdByFullName: props.data.createdByFullName ? props.data.createdByFullName : '',
      contactPersonFullName: props.data.contactPersonFullName,
      contactPersonPhoneNumber: props.data.contactPersonPhoneNumber,
      contactPersonEmail: props.data.contactPersonEmail,
      approvedByFullName: props.data?.approvedBy || '',
      products: props.data.products,
      subTotal: props.data.total,
      amountInWords: `${numberToWords(props.data.total)} Only`,
      terms: props.data.terms,
      acceptedBy: '',
      title: '',
      currentDate: currentDate
    }
    await dispatch(createQuotationPdfAction(payload, setModalTypeHandler, setLoaderStatusHandler))
    // const html = emailContent({quoteNumber: props.data.quotation_number, createdDate: moment(props.data.quotation_date).format('DD/MM/YYYY'), customerName: props.data.customerFullName, total: props.data.total, sender: senderFullName, companyName: props.company.companyName})
    // const content = previewContent({quoteNumber: props.data.quotation_number, createdDate: moment(props.data.quotation_date).format('DD/MM/YYYY'), customerName: props.data.customerFullName, total: props.data.total, sender: senderFullName, companyName: props.company.companyName})

    setFormValues((prev) => ({...prev, subject: `QUOTE - ${props.data.quotation_number} Details` }))
  })();
}, [props.data])

  useEffect(() => {
    if(quotationPdf.length > 0){
      setFormValues((prev) => ({...prev, attachments: {filename: quotationPdf[0].fileName, contentType: quotationPdf[0].contentType, path: quotationPdf[0].path}}))
      setUrl(quotationPdf[0].url)
    }
  }, [quotationPdf])

  const numberToWords = (num) => {

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
      'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const numberToWordsHelper = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numberToWordsHelper(n % 100) : '');
      if (n < 1000000) return numberToWordsHelper(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numberToWordsHelper(n % 1000) : '');
      return numberToWordsHelper(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + numberToWordsHelper(n % 1000000) : '');
    };

    return numberToWordsHelper(num);
  }

  const isValidEmail = (value) => {
    return value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
  }

  const handleBlur = () => {
    if (isValidEmail(formValues.to)) {
      setIsShowChip(true);
    }
  }

  const handleDeleteEmail = (emailToDelete) => {
    let nonDeletedEmails = formValues.to.filter((email) => email !== emailToDelete)
    setFormValues((prev) => ({...prev, to: nonDeletedEmails}))
  }

  const handleKeyDown = (event) => {
    if(event.key === 'Enter' || event.key === ','){
      event.preventDefault()
      handleAddEmail()
    }
  }

  const handleAddEmail = () => {
    if(isValidEmail(emails.trim())){
      let toEmails = formValues.to || []
      toEmails.push(emails.trim())
      setFormValues((prev) => ({...prev, to: [...toEmails]}))
      setEmails('')
    }
  }

  const handleSend = async(event) => {
    event.preventDefault()
    const requiredFields = ['from', 'to', 'subject', 'content']
    let isValid = true
    let formErrorObj = {...formErrors}

    Object.keys(formValues).map((key) => {
      if(requiredFields.includes(key) && formValues[key] === null || formValues[key] === 'null' || formValues[key] === ''){
        isValid = false
        formErrorObj.key = `${capitalize(key)} is Required`
      }
      if(key === 'to' && formValues[key].length === 0){
        isValid = false
        formErrorObj.key = `${capitalize(key)} is Required`
      }
    })
    setFormErrors(formErrorObj)

    if(isValid){
      await dispatch(sendQuotationMailAction(formValues, props.setModalTypeHandler, props.setLoaderStatusHandler), async(response) => {
        const res = await response
        if(res.data.msg !== "Setup Mail COnfiguration"){
          props.handleMailClose()
        }
      })
    }
  }

  const handleQuillChange = (value) => {
    const sanitizedHTML = DOMPurify.sanitize(value);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedHTML;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    console.log(value, 'textContent');
    setFormValues((prev) => ({
      ...prev,
      content: value
    }));
  };


  return (
    <Card sx={{p: 5, overflow: 'auto'}}>
      <Grid container spacing={3}>
        <Grid
          display='flex'
          justifyContent='center'
          sx={{borderBottom: '2px solid #d9dadc', pb: 3, mb: 3}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='h6'>Compose Mail</Typography>
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <TextField
            value={formValues.from || ''}
            label='From'
            placeholder='From'
            fullWidth
          />
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container display='flex' alignItems='center'>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={2}>
                {formValues.to?.map((email, index) => (
                  <Grid key={index}>
                    <Chip
                      label={email}
                      color={isValidEmail(email) ? 'primary' : 'secondary'}
                      onDelete={() => handleDeleteEmail(email)}
                      variant='outlined'
                    />
                  </Grid>
                ))}
                <Typography color='error'>{formErrors.to}</Typography>
              </Grid>
            </Grid>

            <Grid
              size={{
                lg: 11,
                md: 11,
                sm: 11,
                xs: 11
              }}>
              <TextField
                className='ccBccTextField'
                value={emails}
                label='To'
                placeholder='To'
                fullWidth
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onChange={(event) => setEmails(event.target.value)}
                sx={formValues.to && formValues.to.length > 0 ? {mt: 5} : ''}
              />
            </Grid>

            <Grid
              size={{
                lg: 1,
                md: 1,
                sm: 1,
                xs: 1
              }}>
              <div
                className='ccBccView'
                style={{display: 'flex', justifyContent: 'center'}}
              >
                <Box
                  component='span'
                  sx={{cursor: 'pointer'}}
                  onClick={() => setIsShowCc(!isShowCc)}
                >
                  <IntlMessages id='Cc' />
                </Box>

                <Box
                  component='span'
                  sx={{cursor: 'pointer', ml: 3}}
                  onClick={() => setIsShowBcc(!isShowBcc)}
                >
                  <IntlMessages id='Bcc' />
                </Box>
              </div>
            </Grid>
          </Grid>
        </Grid>

        {isShowCc ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              value={formValues.cc}
              label='Cc'
              placeholder='Cc'
              fullWidth
            />
          </Grid>
        ) : null}

        {isShowBcc ? (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              value={formValues.bcc}
              label='Bcc'
              placeholder='Bcc'
              fullWidth
            />
          </Grid>
        ) : null}

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <TextField
            value={formValues.subject || ''}
            label='Subject'
            placeholder='Subject'
            fullWidth
            onChange={(event) =>
              setFormValues((prev) => ({...prev, subject: event.target.value}))
            }
          />
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <ReactQuillWrapper
            theme='snow'
            placeholder='Write Something....'
            value={formValues.content}
            onChange={handleQuillChange}
            //dangerouslySetInnerHTML={{ __html: formValues.content }}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                ['link', 'image', 'video', 'formula'],
                [{header: 1}, {header: 2}],
                [{list: 'ordered'}, {list: 'bullet'}, {list: 'check'}],
                [{script: 'sub'}, {script: 'super'}],
                [{indent: '-1'}, {indent: '+1'}],
                [{direction: 'rtl'}],
                [{size: ['small', false, 'large', 'huge']}],
                [{header: [1, 2, 3, 4, 5, 6, false]}],
                [{color: []}, {background: []}],
                [{font: []}],
                [{align: []}],
                ['clean'],
              ],
            }}
          />
        </Grid>

        <Grid
          display='flex'
          justifyContent='space-evenly'
          sx={{marginTop: 3}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography>Attachment</Typography>
          <Button
            sx={{border: '1px solid #e6e6e9', px: 4, py: 2, borderRadius: 2}}
            onClick={() => window.open(url, '_blank')}
          >
            <Typography>{formValues?.attachments?.filename}</Typography>
          </Button>
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container spacing={3}>
            <Grid>
              <Button onClick={() => props.handleMailClose()}>Close</Button>
            </Grid>

            <Grid>
              <Button onClick={handleSend}>
                Send &nbsp;
                <SendIcon />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}

Mail.propTypes = {
  handleMailClose: PropTypes.func,
  data: PropTypes.object,
  setModalTypeHandler: PropTypes.func,
  setLoaderStatusHandler: PropTypes.func
}

export default Mail