import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
  alpha,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fonts } from '../../../shared/constants/AppEnums';
import { useDispatch, useSelector } from 'react-redux';
import Context from '../../../context/CreateNewButtonContext';
import {
  tempListAction,
  customerListAction,
} from '../../../redux/actions/whatsappAction';
import apiCalls from 'utils/apiCalls';
import AppCard from '../../../@crema/core/AppCard';
import NewTemp from '../newTemp';
import AssignTemp from '../assignTemp';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

const TempList = () => {
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;
  const navigate = useNavigate();

  const {
    WhatsappReducers: { tempList },
    rbacReducer: { menuAccess }
  } = useSelector((s) => s);

  const [data, setData] = useState([]);
  const [open, setOpen] = useState('1');
  const [id, setId] = useState();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(Context);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(tempListAction()),
      dispatch(customerListAction()),
    );
  }, []);

  useEffect(() => {
    setData(tempList);
  }, [tempList]);

  const onAddClick = () => {
    setOpen('2')
  };
  const handleClose =()=>{
    setOpen('1')
  }
const allowedCompanyTypes = [3, 9]; 

const whatsappCreate = allowedCompanyTypes.includes(storage?.company_type) ? UserRightsAuthorization( menuAccess?.[selectedRole], 'config__whatsapp', 'can_create') : true;  return (
    <>
      {open === "1" &&
        <Grid container display='flex' flexDirection='row' spacing={3} padding={5}>
          <Grid size={12}>
            <Box
              display='flex'
              flexDirection='row'
              justifyContent='space-between'
              flexWrap='wrap'
              gap={1}
              my={3}
            >
              <Box display='flex'>
                <Typography
                  className='page-title'
                >
                  Template List
                </Typography>
              </Box>
              {whatsappCreate && (
              <Button size='small' variant='outlined' onClick={onAddClick}>
                Add
              </Button>
              )}
            </Box>
          </Grid>

          {data?.map((t) => (
            <Grid
              key={t.id}
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  m: 3,
                  cursor: 'pointer',
                  backgroundColor: '#F4F7FE',
                  boxShadow: '0px 10px 10px 4px rgba(0, 0, 0, 0.10)',
                  borderRadius: 4,
                  transition: 'transform 0.3s ease-in-out',
                  ':hover': {
                    transform: 'scale(1.03)',
                    boxShadow: `0 8px 16px 0 #278351`,
                  },
                }}
                onClick={()=>{setId(t.id),setOpen('3')}}
              >
                <CardHeader
                  sx={{
                    px: 6,
                    pb: 0,
                    '& .MuiCardHeader-action': {
                      marginTop: 0,
                      marginRight: 0,
                    },
                    '& .MuiCardHeader-content': {
                      overflow: 'hidden',
                    },
                  }}
                  title={
                    <Box
                      component='h3'
                      sx={{
                        color: 'text.primary',
                        fontWeight: Fonts.SEMI_BOLD,
                        fontSize: 16,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                      }}
                    >
                      {t.name}
                    </Box>
                  }
                />
                {t.header ? (
                  <CardContent
                    sx={{
                      height: '100%',
                      px: 6,
                      '&:last-of-type': {
                        pb: 4,
                      },
                    }}
                  >
                    {t.header}
                  </CardContent>
                ) : null}
                <CardContent
                  sx={{
                    height: '100%',
                    px: 6,
                    '&:last-of-type': {
                      pb: 4,
                    },
                  }}
                >
                  {t.body}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>}
      {open === '2' &&
        <NewTemp handleClose={handleClose} />
      }
      {open === '3' &&
        <AssignTemp handleClose={handleClose} id={id}/>
      }
    </>
  );
};

export default TempList;
