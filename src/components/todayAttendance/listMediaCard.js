import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  styled,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

function ListMediaCard({height, maxWidth, item}) {
  const {
    url,
    clock_out_url,
    first_name,
    clock_in_time,
    clock_out_time,
    start_location,
    end_location,
    attendance_date,
  } = item;
  return (
    <Card sx={{display: 'flex'}}>
      <Box sx={{display: 'flex'}}>
        <CardMedia
          sx={{height: height, width: maxWidth}}
          component='img'
          image={url ?? '/assets/images/no_selfie_image.jpg'}
          alt='Live from space album cover'
        />
        {/* <CardMedia
          sx={{height: height, width: maxWidth}}
          component='img'
          image={url ?? '/assets/images/no_selfie_image.jpg'}
          alt='Live from space album cover'
        /> */}
        <CardContent sx={{flex: '1 0 auto'}}>
          <Typography gutterBottom variant='h3' component='div'>
            {first_name}
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            style={{paddingBottom: '20px'}}
          >
            IN : {clock_in_time ?? ''}
            <br />
            <div style={{display: 'flex', alignItems: 'center'}}>
              <PlaceIcon sx={{fontSize: '15px'}} />

              <span> : {start_location ?? ''}</span>
            </div>
          </Typography>

          <Typography variant='h6' color='text.secondary'>
            OUT : {clock_out_time ?? ''}
            <br />
            <div style={{display: 'flex', alignItems: 'center'}}>
              <PlaceIcon sx={{fontSize: '15px'}} />

              <span> : {end_location ?? ''}</span>
            </div>
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            style={{marginLeft: 'auto'}}
          >
            {attendance_date}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}

export default ListMediaCard;
