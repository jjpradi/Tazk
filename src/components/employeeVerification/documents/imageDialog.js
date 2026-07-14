import {
  AppBar,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
  Slide,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  Box,
  TextField,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const ImageViewDialog = (props) => {
  const {
    open,
    handleClose,
    img,
    type,
    handleVerification,
    isVerified,
    getFieldProps,
  } = props;

  const handleDialogClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={() => handleClose()}
      TransitionComponent={Transition}
    >
      <AppBar sx={{position: 'relative'}} onClick={handleDialogClick}>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ml: 2, flex: 1}} variant='h6' component='div'>
            Preview
          </Typography>

          <FormControl component='fieldset'>
            <FormGroup aria-label='position' row>
              <FormControlLabel
                value={isVerified}
                control={
                  <Checkbox color={isVerified ? 'success' : 'default'} />
                }
                label={isVerified ? 'Verified' : 'Verify'}
                labelPlacement='start'
                onClick={handleVerification}
              />
            </FormGroup>
          </FormControl>

          {isVerified ? (
            <Button
              color='success'
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              Submit
            </Button>
          ) : null}
        </Toolbar>
      </AppBar>
      <DialogContent onClick={handleDialogClick}>
        <Grid container display='flex' flexDirection='row' spacing={5}>
          <Grid height={700} size={12}>
            {type === 'preview' ? (
              <>
                {img?.map((i) => {
                  return (
                    <>
                      {i.type === 'application/pdf' ? (
                        <object
                          data={i.preview}
                          type='application/pdf'
                          width='100%'
                          height='100%'
                          style={{borderRadius: 10}}
                        >
                          PDF cannot be displayed.
                        </object>
                      ) : (
                        <img
                          src={i.preview}
                          alt=''
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            display: 'block',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            borderRadius: 10,
                          }}
                        />
                      )}
                    </>
                  );
                })}
              </>
            ) : (
              <>
                {img.map((i) => (
                  <>
                    {i.fileType === 'application/pdf' ? (
                      <object
                        data={i.preview}
                        type='application/pdf'
                        width='100%'
                        height='100%'
                        style={{borderRadius: 10}}
                      >
                        PDF cannot be displayed.{' '}
                        <a href={i.preview}>Download the PDF</a>.
                      </object>
                    ) : (
                      <img
                        src={i.preview}
                        alt=''
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          display: 'block',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          borderRadius: 10,
                        }}
                      />
                    )}
                  </>
                ))}
              </>
            )}
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='REMARK'
              name='remarks'
              type='text'
              {...getFieldProps('remarks')}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewDialog;
