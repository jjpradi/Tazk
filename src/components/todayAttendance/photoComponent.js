import {Grid} from '@mui/material';
import GridMediaCard from './gridMediaCard';
import ListMediaCard from './listMediaCard';
import NoRecordFound from 'components/Layout/NoRecordFound';
import ImageViewDialog from './imageViewDialog';
import {useState} from 'react';

function PhotoComponent({selfie_images, toggleGridView, isApiFinished}) {
  const [image, setImage] = useState(null);
  const [open, setOpen] = useState(false);
  // const [viewCss, setViewCss] = useState({});
  let viewCss = {};
  if (selfie_images.length === 0 && isApiFinished) {
    return (
      <Grid
        container
        display='flex'
        justifyContent='center'
        alignItems='center'
        sx={{
          width: '100%',
          height: 'calc(100vh - 270px)',
          overflowY: 'scroll',
          mb: 8,
          ...viewCss,
          '&::-webkit-scrollbar': {
            width: 5,
          },
          '&::-webkit-scrollbar-track': {
            // backgroundColor: "#E0E0E0"
            '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#B2B2B2',
            borderRadius: 2,
            border: '2px solid white',
          },
        }}
      >
        <Grid>
          <NoRecordFound />
        </Grid>
      </Grid>
    );
  }
  // let viewCss = {};
  // console.log('viewCss',viewCss)

  if (toggleGridView) {
    viewCss = {
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))!important',
      gridGap: '20px',
    };
  } else {
    viewCss = {
      display: 'flex',
      //   justifyContent: 'center',
      flexDirection: 'row',
    };
  }

  const handleClick = (img) => {
    if (img !== '/static/media/noimage.ce612dd4.png') {
      setImage(img);
      setOpen(true);
    }
  };

  return (
    <>
      <Grid
        container
        display='flex'
        flexDirection='row'
        spacing={3}
        sx={{
          width: '100%',
          height: 'calc(100vh - 270px)',
          overflowY: 'scroll',
          mb: 8,
          ...viewCss,
          '&::-webkit-scrollbar': {
            width: 5,
          },
          '&::-webkit-scrollbar-track': {
            // backgroundColor: "#E0E0E0"
            '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#B2B2B2',
            borderRadius: 2,
            border: '2px solid white',
          },
        }}
      >
        {selfie_images.map((item, i) => (
          <>
            {!toggleGridView ? (
              <Grid
                size={{
                  xl: 2.4,
                  lg: 3,
                  md: 4,
                  sm: 6,
                  xs: 12
                }}>
                <GridMediaCard
                  key={item.id}
                  height={0}
                  maxWidth={0}
                  item={item}
                  handleClick={handleClick}
                />
              </Grid>
            ) : (
              <Grid
                size={{
                  lg: 4,
                  md: 6,
                  sm: 6,
                  xs: 12
                }}>
                <ListMediaCard
                  key={item.id}
                  height={200}
                  maxWidth={250}
                  item={item}
                />
              </Grid>
            )}
          </>
        ))}

        <ImageViewDialog
          open={open}
          handleClose={() => {
            setOpen(false);
            setImage(null);
          }}
          img={image}
        />
      </Grid>
    </>
  );
}

export default PhotoComponent;
