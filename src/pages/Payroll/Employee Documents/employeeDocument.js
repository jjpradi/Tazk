import { Card } from '@mui/material'
import { Box, Button, Dialog, Grid, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect,useState } from 'react'
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {useDispatch, useSelector} from 'react-redux';
import { EmpDocumentsDetailAction, EmpDocumentsEmailAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { Tooltip } from '@mui/material';
import { capitalize } from 'lodash';
import { emailValidation } from 'components/regexFunction';

function EmployeeDocumentView(props) {
  const {user, setOpenDetailsPage } = props;
const[dialogOpen,setDialogOpen] = useState()
const[emailDialogOpen,setEmailDialogOpen] = useState()
const[images, setImages] = useState([])

const [formValues, setFormValues] = useState({
  emailTo:null
 });
 const [formErrors, setFormErrors] = useState({
  emailTo:null
 });
 const [validRegex, setValidRegex] = useState({
  emailTo: false,
});
 const [requiredFields] = useState([
   'emailTo'
 ]);
const[data, setData] = useState({
  employeeName: ''
})



const dispatch = useDispatch();
const {
  commoncookie,
  setModalTypeHandler,
  setLoaderStatusHandler,
  headerLocationId,
} = useContext(CreateNewButtonContext);




const handleDialogClose = () => {
  setDialogOpen(false)
}

const handleDialogOpen = (url) => {
  setImages([{ imageUrl: url }]);
  setDialogOpen(true);
}

const handleEmailDialogOpen = (url,empName) => {
  setImages([{ imageUrl: url }]);
  setData({employeeName:empName})
  setEmailDialogOpen(true);
}

const handleEmailDialogClose = () => {
  setEmailDialogOpen(false)
  setFormValues({emailTo:null})
}

const setStateHandler = async (name, value) => {
  let formObj = {};

  formObj = {
    ...formValues,
    [name]: value === '' ? null : value,
  };

  await setFormValues(formObj);
};

const handleChange = async (e) => {
  let { name, value } = e.target;

  // Update form values
  await setStateHandler(name, value);

  if (name === 'emailTo') {
    if (!value) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      setValidRegex({ ...validRegex, emailTo: false });
    } else if (!emailValidation(value)) {
      setValidRegex({ ...validRegex, emailTo: false });
      setFormErrors({
        ...formErrors,
        [name]: 'Email is invalid!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      setValidRegex({ ...validRegex, emailTo: true });
    }
  }
};

const handleClose = () => {
  setOpenDetailsPage(false);
};


const handleSubmit = async (event) => {
  event.preventDefault();

  let isValid = true;
  let formErrorsObj = {...formErrors};

  Object.keys(formValues).map((key) => {
    if (requiredFields.includes(key) && (!formValues[key])) {
      isValid = false;
      formErrorsObj[key] = 'Email is Required!';
    }
    return null;
  });

  if (formValues.emailTo && !validRegex.emailTo) {
    isValid = false;
    formErrorsObj.emailTo = 'Email is invalid!';
  }


   setFormErrors(formErrorsObj);
  
  if (isValid) {
    const payload ={
      emailTo : formValues.emailTo,
      employeeName : data.employeeName,
      attachment : images
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(EmpDocumentsEmailAction(payload))
    )
    setEmailDialogOpen(false);
  }
  setFormValues({emailTo:null})
  
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

return (
  <Grid container display={'flex'} direction={'row'} spacing={5}>
    <Grid container justifyContent="flex-end" alignItems="center">
              <Button
                onClick={handleClose}
                style={{}}
                name='Cancel'
                variant='contained'
                color='secondary'
                size='medium'
                text='button'
                fullWidth={false}
                type='cancel'
              >
                Back
              </Button>
              </Grid>
    {user.map((v)=> (
      
         <Grid
           key={v.id}
           size={{
             lg: 12
           }}>
           <Card >
            <Grid container spacing={2} columnSpacing={{  md: 10 }} sx={{ ml: '20px' }}>
              <Grid
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                size={{
                  md: 3,
                  xs: 12
                }}>
                <Typography sx={{ m: '20px 0 0 20px' }}>Type :</Typography>
                <Typography variant='h3' sx={{ m: '5px 0 0 20px' }}>
                  {v.type_name}
                  {/* {v.document_name} */}
                </Typography>
              </Grid>
              <Grid
                direction="row"
                justifyContent="center"
                alignItems="center"
                size={{
                  md: 9,
                  xs: 12
                }}>
                <Typography sx={{ m: '20px 0 0 100px' }}>Updated On:</Typography>
                <Typography variant='h3' sx={{ m: '5px 0 0 100px' }}>
                {formatDate(v.updatedAt && v.updatedAt !== '0000-00-00 00:00:00' ? v.updatedAt : v.createdAt)}
                </Typography>
                 
              </Grid>
              <Grid
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                size={{
                  md: 12,
                  xs: 12
                }}>
                <Typography sx={{ m: '20px 0 0 20px' }}> Name:</Typography>
                <Typography variant='h3' sx={{ m: '5px 0 0 20px' }}>
                {v.type_name === 'Passport & Aadhar Verification' ? v.document_type : v.type_name === 'PAN Verification' ? 'Pan Card' : v.document_name}
                </Typography>
                
              </Grid>
              <Grid
                direction="row"
                justifyContent="flex-start"
                alignItems="flex-start"
                size={{
                  md: 12
                }}>
                 <Typography sx={{ m: '20px 0 0 20px' }}> Remarks:</Typography>
                <Typography variant='h3' sx={{ m: '5px 0 0 20px' }}>{v.remarks}</Typography>
              </Grid>

            <Grid
              size={{
                md: 12
              }}>

              <Box display='flex' flexDirection='row' justifyContent='space-between' p={4}>
                <Box>
                  <Typography marginLeft={'100px'}>{v.file_path}</Typography>
                </Box>

                <Box display='flex' flexDirection='row' justifyContent='space-between' gap={4}>
                  <ShareIcon onClick={() => handleEmailDialogOpen(v.url, v.employeeName)} />

                  <Tooltip title="Preview">
                    <VisibilityIcon onClick={() => handleDialogOpen(v.url)} />
                  </Tooltip>
                </Box>
              </Box>

            </Grid>

            </Grid>
          </Card>
         </Grid>
        ))}
    <Dialog  open={dialogOpen} 
    PaperProps={{
      sx: {
        width: "50%",
        maxWidth: "none",
      },
    }}
    >
      <Card sx={{ width: '100%', p: '10%' }}>
        <Grid
          container
          gap={5}
          sx={{ mb: 5,mt: 5 }}
          display="flex"
          justifyContent="center"
        >
          {images.map((image, index) => (
            <Grid
              key={index}
              sx={{
                border: '1px ridge black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
              size={{
                lg: 3,
                md: 3,
                sm: 4,
                xs: 6
              }}>
              { image.imageUrl?.includes("pdf") ? <object
                  data={image.imageUrl}
                  type='application/pdf'
                  width='100%'
                  height='100%'
                  style={{borderRadius: 10}}
                >
                  PDF cannot be displayed.
                </object> :
              <img
                src={image.imageUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt={`Image ${index}`}
              />
} 


            </Grid>
          ))}
        </Grid>
        <Button variant="contained" color="error" onClick={handleDialogClose}>
          Close
        </Button>
      </Card>
    </Dialog>
    <Dialog  PaperProps={{
            sx: {
              width: "50%",
              maxWidth: "none",
            },
          }}
           open={emailDialogOpen}>
     
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          sx={{
            p: 5
          }}
        >
          <Typography>Send Email</Typography>
        <TextField
        onChange={handleChange}
        onBlur={handleChange}
            required={true}
            fullWidth={true}
            placeholder='Email'
            name='emailTo'
            value={formValues.emailTo === null ? '' : formValues.emailTo}
            color='primary'
            type='email'
            regex='/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/'
            variant='filled'
            error={formErrors.emailTo === null ? false : true}
            helperText={
              formErrors.emailTo === null ? '' : formErrors.emailTo
            }
          />
        </Grid>
        <Grid container justifyContent="flex-end" gap={5} sx={{p: 3}} >
        <Button  variant="contained" color="success" onClick={handleSubmit}>
          Send
        </Button>
        <Button variant="contained" color="error" onClick={handleEmailDialogClose}>
          Close
        </Button>
        </Grid>
     
    </Dialog>
  </Grid>
);

}

export default EmployeeDocumentView