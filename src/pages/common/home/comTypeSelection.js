import React, { useEffect } from 'react'
import Distribution from '../../assets/images/distribution.png';
import Retail from '../../assets/images/retail.png';
import Payroll from '../../assets/images/payroll.png';
import Service from '../../assets/images/service.png';
import Shop2 from '../../assets/images/shop.png';
import Asset from '../../assets/icon/asset.png';
import TimeSheet from '../../assets/images/timesheet.png';
import Leads from '../../assets/images/leads.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanyTypesAction, getMultiTypesAction } from 'redux/actions/company_actions';
import { Box, Grid, Typography } from '@mui/material';
import { getsessionStorage } from 'pages/login/cookies';

export default function ComTypeSelection(handleSwitch) {
    const dispatch = useDispatch()
    const storage = getsessionStorage()

    const { CompanyReducers: {multiTypes} } = useSelector((state) => state);
    console.log("rfijg", multiTypes)
    useEffect(() => {
      let data ={
        company_id: storage.company_id
      }
    dispatch(getMultiTypesAction(data));
  }, []);

    const CompanyIcon = [
        { id: 2, icon: Retail },
        { id: 3, icon: Distribution },
        { id: 4, icon: Service },
        { id: 5, icon: Payroll },
        { id: 7, icon: Shop2 },
        { id: 9, icon: Asset },
        { id: 10, icon: Leads },
        { id: 11, icon: TimeSheet },
        { id: 12, icon: Service },
    ];
    console.log("khk", CompanyIcon, multiTypes, handleSwitch)

  return (
    <div>
      <Grid container marginTop="10%">
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
      <h2 style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>Welcome Onboard! We’re excited to have you!</h2>
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
      <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      my: 7,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      {multiTypes?.map((type) => {
                        const matchedIcon = CompanyIcon.find(
                          (icon) => icon.id === type.company_type_id,
                        );

                        const isDisabled = type.company_type === 'Time Sheet';

                        return (
                          <Box
                            key={type.company_type_id}
                            display='flex'
                            flexDirection='column'
                            alignItems='center'
                            justifyContent='center'
                            width='100%'
                          >
                            <Box
                              sx={{
                                bgcolor: '#f4f7fe',
                                zIndex: isDisabled ? 0 : 1,
                                width: '55px',
                                p: 2,
                                borderRadius: 2,
                                boxShadow: `0 8px 16px 0 #f4f7fe`,
                                cursor: isDisabled ? 'default' : 'pointer',
                                transition: 'transform 0.3s ease-in-out',
                                position: 'relative',
                                ':hover': !isDisabled && {
                                  transform: 'scale(1.10)',
                                  boxShadow: `0 8px 16px 0 #0A8FDC`,
                                },
                              }}
                              onClick={handleSwitch}
                            >
                              {matchedIcon ? (
                                <Box
                                  component='img'
                                  src={matchedIcon.icon}
                                  alt='icon'
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    filter: isDisabled ? 'grayscale(100%)' : 'none',
                                  }}
                                />
                              ) : null}
                            </Box>

                            <Typography pt={4} fontSize={16}>
                              {type.company_type === 'Asset Management'
                                ? type.company_type.slice(0, 5)
                                : type.company_type}
                            </Typography>

                            <Typography color={type.isActive === 1 ? 'green' : 'red'} pt={4} fontSize={12}>
                              {type.isActive === 1
                                ? 'Active'
                                : 'Expired'}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  </Grid>
      </Grid>
    </div>
  );
}
