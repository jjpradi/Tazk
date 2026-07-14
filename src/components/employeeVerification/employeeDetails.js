import React from 'react';
import PropTypes from 'prop-types';
import {grey} from '@mui/material/colors';
import {Fonts} from '../../shared/constants/AppEnums';
import {alpha, CardMedia, Grid, Chip, Box} from '@mui/material';
import ZoomInBox from 'utils/zoomInBox';
import UserImage from '../../assets/user/noimage.png';
import {AppAnimate} from '../../@crema';

function EmployeeDetails(props) {
  const {user} = props;

  return (
    <AppAnimate animation='transition.slideUpIn' delay={1000}>
      <Box
        className='account-tabs-content'
        sx={{
          display: 'flex',
          flexDirection: {xs: 'column', sm: 'row'},
          backgroundColor: (theme) => theme.palette.background.paper,
          backgroundImage: (theme) =>
            `linear-gradient(${alpha(
              theme.palette.common.white,
              0.05,
            )}, ${alpha(theme.palette.common.white, 0.05)})`,
          boxShadow: '0px 10px 10px 4px rgba(0, 0, 0, 0.04)',
          borderRadius: (theme) => theme.cardRadius / 4,
          p: 5,
        }}
      >
        {/* <Box
          sx={{
            mr: {sm: 5},
            mb: {xs: 3, sm: 0},
            '.crUserImage': {
              objectFit: 'contain',
              borderRadius: 50,
              width: {xs: 160, sm: 110},
              height: {xs: 160, sm: 110},
            },
          }}
        >
          <ZoomInBox>
            <CardMedia
              component='img'
              image={user?.url ?? UserImage}
              width={150}
              height={150}
            />
          </ZoomInBox>
        </Box> */}

        <Box>
          <Grid
            container
            spacing={5}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Grid
              sx={{
                mx: {xs: -1, xl: -2},
                fontSize: 16,
                fontWeight: Fonts.BOLD,
                color: 'text.secondary',
              }}
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              {user?.full_name}
            </Grid>

            <Grid
              sx={{mx: {xs: -1, xl: -2}}}
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Chip
                label={`Employee Code - ${user?.employeeId}`}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.type === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  padding: '4px 12px',
                  marginTop: 2,
                  marginRight: {sx: 1, xl: 2},
                  marginLeft: {sx: 1, xl: 2},
                  border: '1px solid',
                  borderColor: grey[500],
                  borderRadius: 2,
                  width: '100%',
                }}
              />
            </Grid>
            <Grid
              sx={{mx: {xs: -1, xl: -2}}}
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Chip
                label={`Phone Number - ${user?.phone_number}`}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.type === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  padding: '4px 12px',
                  marginTop: 2,
                  marginRight: {sx: 1, xl: 2},
                  marginLeft: {sx: 1, xl: 2},
                  border: '1px solid',
                  borderColor: grey[500],
                  borderRadius: 2,
                  width: '100%',
                }}
              />
            </Grid>
            <Grid
              sx={{mx: {xs: -1, xl: -2}}}
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Chip
                label={`DOB - ${user?.dob}`}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.type === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  padding: '4px 12px',
                  marginTop: 2,
                  marginRight: {sx: 1, xl: 2},
                  marginLeft: {sx: 1, xl: 2},
                  border: '1px solid',
                  borderColor: grey[500],
                  borderRadius: 2,
                  width: '100%',
                }}
              />
            </Grid>
            <Grid
              sx={{mx: {xs: -1, xl: -2}}}
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Chip
                label={`DOJ - ${user?.dateOfJoining}`}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.type === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  padding: '4px 12px',
                  marginTop: 2,
                  marginRight: {sx: 1, xl: 2},
                  marginLeft: {sx: 1, xl: 2},
                  border: '1px solid',
                  borderColor: grey[500],
                  borderRadius: 2,
                  width: '100%',
                }}
              />
            </Grid>
            <Grid
              sx={{mx: {xs: -1, xl: -2}}}
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Chip
                label={`Email - ${user?.email}`}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.type === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  padding: '4px 12px',
                  marginTop: 2,
                  marginRight: {sx: 1, xl: 2},
                  marginLeft: {sx: 1, xl: 2},
                  border: '1px solid',
                  borderColor: grey[500],
                  borderRadius: 2,
                  width: '100%',
                }}
              />
            </Grid>
            <Grid
              sx={{mx: {xs: -1, xl: -2}}}
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Chip
                label={`Department - ${user?.department}`}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.type === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  padding: '4px 12px',
                  marginTop: 2,
                  marginRight: {sx: 1, xl: 2},
                  marginLeft: {sx: 1, xl: 2},
                  border: '1px solid',
                  borderColor: grey[500],
                  borderRadius: 2,
                  width: '100%',
                }}
              />
            </Grid>
            <Grid
              sx={{mx: {xs: -1, xl: -2}}}
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Chip
                label={`Designation - ${user?.designation}`}
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.type === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                  padding: '4px 12px',
                  marginTop: 2,
                  marginRight: {sx: 1, xl: 2},
                  marginLeft: {sx: 1, xl: 2},
                  border: '1px solid',
                  borderColor: grey[500],
                  borderRadius: 2,
                  width: '100%',
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AppAnimate>
  );
}

export default EmployeeDetails;

EmployeeDetails.propTypes = {
  user: PropTypes.object,
};
