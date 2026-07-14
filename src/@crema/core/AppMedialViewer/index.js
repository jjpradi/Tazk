import React, {useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import Zoom from '@mui/material/Zoom';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import MediaSlider from './MediaSlider';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {Grid} from '@mui/material';
import DownloadS3FileWrapper from '../../../components/downloadFileFromS3';

const settings = {
  dots: false,
  arrows: true,
  infinite: false,
  speed: 300,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: true,
};

const renderRow = (data, index, message_type) => {
  if (message_type === 'PHOTO') {
    return (
      <img
        key={'IMAGE-' + index}
        src={data.fileAccessUrl}
        alt={data.fileName ?? 'detail view'}
      />
    );
  } else if (data.mime_type.startsWith('docs')) {
    return (
      <div className='embed-responsive'>
        <iframe
          key={'DOC-' + index}
          src={data.url}
          title={data.name ? data.name : 'detail view'}
        />
      </div>
    );
  } else {
    return (
      <div className='embed-responsive'>
        <iframe
          key={'DOC-' + index}
          src={data.url}
          title={data.name ? data.name : 'detail view'}
        />
      </div>
    );
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom in ref={ref} {...props} />;
});

const AppMedialViewer = ({index, item, onClose}) => {
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (index > -1) setOpen(true);
    else {
      setOpen(false);
    }
  }, [index]);


  const msg_content = JSON?.parse(item.msg_content)[0];
  const fileName = `${msg_content.fileName.split('__')[0]}.${
    msg_content.format
  }`;

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paperFullScreen': {
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      TransitionComponent={Transition}
    >
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'rgb(49, 53, 65)',
          color: (theme) => theme.palette.common.white,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <IconButton
          sx={{
            color: (theme) => theme.palette.common.white,
            position: 'absolute',
            left: 10,
            top: 10,
            zIndex: 1,
          }}
          onClick={onClose}
          size='large'
        >
          <HighlightOffIcon />
        </IconButton>
        <Grid
          sx={{
            color: (theme) => theme.palette.common.white,
            position: 'absolute',
            right: 10,
            top: 10,
            zIndex: 1,
          }}
        >
          <DownloadS3FileWrapper
            link={item.fileUrl[0]?.fileAccessUrl}
            objectName={item.fileUrl[0]?.fileName}
            style={{padding: 1}}
            fileName={fileName}
          >
            <IconButton>
              <CloudDownloadIcon sx={{fontSize: '25px', color: (theme) => theme.palette.common.white,}} />
            </IconButton>
          </DownloadS3FileWrapper>
        </Grid>
        {index >= 0 ? (
          <MediaSlider>
            <Slider
              settings={{...settings, initialSlide: index}}
              slickGoTo={index}
            >
              {item.fileUrl.map((data, index) =>
                renderRow(data, index, item.message_type),
              )}
            </Slider>
          </MediaSlider>
        ) : null}
      </Box>
    </Dialog>
  );
};

export default AppMedialViewer;
AppMedialViewer.propTypes = {
  index: PropTypes.number,
  medias: PropTypes.array,
  onClose: PropTypes.func,
};
