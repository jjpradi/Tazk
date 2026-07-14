import { Button, Grid, TextField, Typography } from "@mui/material"
import { useState } from "react"
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { capitalize } from "lodash";
import { whatsAppLeadProposalAction } from "redux/actions/leadManagement_actions";
import { useDispatch } from "react-redux";

const ProposalWhatsApp = (props)=>{

  const dispatch = useDispatch()

    const [formData,setFormData] = useState({
        title : null,
        content : null
    })

     const [formErrors,setFormErrors] = useState({
        title : null,
        attachment : null,
        content : null
    })

    const [uploadedFiles, setUploadedFiles] = useState([]);

     const requiredFields = [
    'title',
    'content',
  ];

const setStateHandler = (name, value) => {
        setFormData({
      ...formData,
      [name]: value,
    });
    validateForm(name, value);
  };

    const validateForm = (name, value) => {
      if (!Object.keys(formErrors).includes(name)) return;
  
      if (requiredFields.includes(name) && (value === null || value === '')) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name.replace(/_/g, '')) + 'is required',
        });
      }
       else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
    }

      const handleSubmit = async (e, type) => {
        console.log(formData,'formdatsasasdsa',uploadedFiles)
        e.preventDefault();
        let isValid = true;
        let formErrorsObj = {...formErrors};
        requiredFields.forEach((key) => {
          if (
            formData[key] === null ||
            formData[key] === 'null' ||
            formData[key] === ''  || !uploadedFiles
          ) {
            isValid = false;
            formErrorsObj[key] = capitalize(key) + ' is required';
          } else {
            formErrorsObj[key] = null;
          }
        });
    
        setFormErrors(formErrorsObj);

        console.log(isValid,'hjgsdgisValid')

        if(isValid){

          const data = {
            title : formData.title,
            content : formData.content,
            attachment : uploadedFiles
          }

          await dispatch(whatsAppLeadProposalAction(data))
          props.handleClose()
        }

    }


    return (
      <>
        <Grid container spacing={2} p={5}>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                <TextField
                fullWidth
                value={formData.title || ''}
                required
                label='Title'
                name='title'
                variant='filled'
                onChange={(e) => setStateHandler('title', e.target.value)}
                error={formErrors.title !== null}
                helperText={formErrors.title}
                />
            </Grid>

            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 12
              }}>
                <TextField
                    fullWidth
                    label='Content'
                    required
                    rows={4}
                    variant='filled'
                    value={formData.content || ''}
                    onChange={(e) => setStateHandler('content', e.target.value)}
                    multiline
                    error={formErrors.content !== null}
                    helperText={formErrors.content}
                />
                </Grid>

               <Grid
                 size={{
                   lg: 12,
                   md: 12,
                   sm: 12,
                   xs: 12
                 }}>
                        <AttachmentField
                          previews={uploadedFiles}
                          setPreviews={setUploadedFiles}
                        />
                        <Typography color='error'>
                          {formErrors.attachment !== null
                            ? formErrors.attachment
                            : ''}
                        </Typography>
                      </Grid>

            

                 <Grid
                   size={{
                     lg: 12,
                     md: 12,
                     sm: 12,
                     xs: 12
                   }}>
                            <Grid container justifyContent='flex-end' spacing={2}>
                              <Grid>
                                <Button
                                  variant = 'contained'
                                  color = 'error'
                                  onClick = {() => props.handleClose()}
                                >
                                  Cancel
                                </Button>
                              </Grid>
                
                              <Grid>
                                <Button
                                  variant = 'contained'
                                  color = 'primary'
                                  onClick = {handleSubmit}
                                >
                                  Save
                                </Button>
                              </Grid>
                            </Grid>
                          </Grid>

                          </Grid>
      </>
    );
}

export default ProposalWhatsApp