import {
  Card,
  CardActions,
  CardMedia,
  Grid,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import ZoomInBox from 'utils/zoomInBox';
import UserImage from '../../assets/user/noimage.png';
import AppAnimate from '../../@crema/core/AppAnimate';
import { commonDateFormat } from 'utils/getTimeFormat';
import moment from 'moment';

function GridMediaCard({height, maxWidth, item, handleClick}) {
  const {
    url,
    user_img_url,
    clock_out_url,
    first_name,
    last_name,
    clock_in_time,
    clock_out_time,
    start_location,
    end_location,
    startDate,
    endDate,
    full_name,
    start_location_code,
    end_location_code,
    start_code,
    end_code,
    in_time,
    out_time,
    type,
    end_type,
    attendance_type
  } = item;
  let setFormatStartDate = startDate ? moment(startDate, 'DD-MM-YYYY').format('DD/MM/YYYY') : '';
  let setFormatEndDate = endDate ? moment(endDate, 'DD-MM-YYYY').format('DD/MM/YYYY') : '';
  
 

  const typeMap = {
    face_attendance: 'Face',
    manual_attendance: 'Manual',
    selfie:"Selfie",
    qr:"Qr",
    gps:"Gps",
    wifi:"WiFi",
    no_restriction:"None",
    device: "Device"
    // Add more types here if needed
  };
 
  return (
    // <Card sx={{width: maxWidth, height: 'min-content'}}>
    //   <CardMedia
    //     sx={{height: height}}
    //     image={url ?? '/assets/images/no_selfie_image.jpg'}
    //     title='green iguana'
    //   />
    //   <CardContent sx={{textAlign: 'center'}}>
    //     <h6 fontSize={14}>{first_name}</h6>
    //   </CardContent>
    //   <CardContent orientation='horizontal'>
    //     <Typography level='body-xs'>6.3k views</Typography>
    //     <Divider orientation='vertical' />
    //     <Typography level='body-xs'>1 hour ago</Typography>
    //   </CardContent>
    //   {/* <CardContent>
    //       <Typography gutterBottom variant='h3' component='div' style={{textTransform:''}}>
    //         {first_name}
    //       </Typography>
    //       <Typography
    //         variant='h6'
    //         color='text.secondary'
    //         style={{paddingBottom: '20px'}}
    //       >
    //         IN : {clock_in_time ?? ''}
    //         <br />
    //         <div style={{display: 'flex', alignItems: 'center'}}>
    //           <PlaceIcon sx={{fontSize: '15px'}} />
    //           <span> : {start_location ?? ''}</span>
    //         </div>
    //       </Typography>
    //       <Typography variant='h6' color='text.secondary'>
    //         OUT : {clock_out_time ?? ''}
    //         <br />
    //         <div style={{display: 'flex', alignItems: 'center'}}>
    //           <PlaceIcon sx={{fontSize: '15px'}} />
    //           <span> : {end_location ?? ''}</span>
    //         </div>
    //       </Typography>
    //     </CardContent> */}
    //   <CardActions>
    //     <Typography
    //       variant='h6'
    //       color='text.secondary'
    //       style={{marginRight: 'auto'}}
    //     >
    //       {attendance_date}
    //     </Typography>
    //   </CardActions>
    // </Card>
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <Card
        sx={{
          position: 'relative',
          backgroundColor: '#F4F7FE',
          height: 380,
        }}
      >
        <CardActions
          sx={{
            textAlign: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant='h6'>{full_name}</Typography>
        </CardActions>
        <Grid container display='flex' flexDirection='row' sx={{flex: 1}}>
          <Grid size={6}>
            {/* In Time and Location Section */}
            {renderSideSection(
              url,
              'In Time',
              clock_in_time || '-',
              'Location',
              start_code ?? start_location,
              'Type', ( type !== null ? typeMap[type] : typeMap[attendance_type] ),
              handleClick,
              // startDate,
              setFormatStartDate
            )}
          </Grid>

          <Grid size={6}>
            {/* Out Time and Location Section */}
            {renderSideSection(
              clock_out_url,
              'Out Time',
              out_time || clock_out_time,
              'Location',
              end_code ?? end_location,
              'Type', ((out_time || clock_out_time) == null ? ''  :end_type !== null ? typeMap[end_type] : typeMap[attendance_type]),
              handleClick,
              // endDate,
              setFormatEndDate
            )}
          </Grid>
        </Grid>
        {/* <CardActions sx={{backgroundColor: '#ecf6fc'}}>
          <Typography
            variant='h6'
            color='text.secondary'
            style={{marginRight: 'auto'}}
          >
            {attendance_date}
          </Typography>
        </CardActions> */}
      </Card>
    </AppAnimate>
  );
}

const renderSideSection = (
  image,
  timeLabel,
  timeValue,
  locationLabel,
  locationValue,
  type,
  typemap,
  onClick,
  date,
) => (
  <>
    <ZoomInBox onClick={() => onClick(image ?? UserImage)}>
      <CardMedia
        sx={{p: 2, height: 120, objectFit: 'cover'}}
        component='img'
        image={image ?? UserImage}
        width='100%'
        height='100%'
      />
    </ZoomInBox>
    <CardActions sx={{justifyContent: 'flex-start'}}>
      <Stack direction='column' display='flex' alignItems='flex-start' gap={2}>
        <InfoRow label={timeLabel} value={timeValue} />
        <InfoRow label={locationLabel} value={locationValue} />
        <InfoRow label={type} value={typemap} />
        <Typography
          variant='h6'
          color='text.secondary'
          sx={{py: 3, position: 'static'}}
        >
          {date ?? '-'}
        </Typography>
      </Stack>
    </CardActions>
  </>
);

const InfoRow = ({label, value}) => (
  <Stack direction='column' display='flex' alignItems='flex-start' gap={1}>
    <Typography sx={{fontSize: '10px'}}>{label}</Typography>
    <Typography
      sx={{
        fontSize: '10px',
        fontWeight: 800,
        maxHeight: 32,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}
    >
      {value ?? '-'}
    </Typography>
  </Stack>
);

export default GridMediaCard;
