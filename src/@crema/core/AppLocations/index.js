import React,{useContext,useState, useEffect} from 'react';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import {Fonts} from 'shared/constants/AppEnums';
import {
  useLocaleActionsContext,
  useLocaleContext,
} from '../../utility/AppContextProvider/LocaleContextProvide';
import Typography from '@mui/material/Typography';
import {alpha, Box, Button} from '@mui/material';
import PropsTypes from 'prop-types';
import AppTooltip from '../AppTooltip';
import context from '../../../context/CreateNewButtonContext'
import ArrowDropDownCircleOutlinedIcon from '@mui/icons-material/ArrowDropDownCircleOutlined';
import _ from 'lodash'
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useLocation } from 'react-router-dom';
import { getsessionStorage } from 'pages/common/login/cookies';
import { all } from 'redux-saga/effects';
import { getMultiTypesAction, updateDefaultTypeAction } from 'redux/actions/company_actions';
import { useDispatch, useSelector } from 'react-redux';
import Distribution from '../../../assets/images/distribution.png';
import Retail from '../../../assets/images/retail.png'
import Payroll from '../../../assets/images/payroll.png';
import Service from '../../../assets/images/service.png';
import Shop2 from '../../../assets/images/shop.png';
import Asset from '../../../assets/images/asset.png';
import TimeSheet from '../../../assets/images/timesheet.png';
import Leads from '../../../assets/images/leads.png';
import Avatar from '@mui/material/Avatar';
import { useAuthMethod } from '@crema/utility/AuthHooks';
import { getusermenus } from 'redux/actions/role_actions';
import login_services from 'services/login_services';

const AppLocationSwitcher = ({iconOnly, tooltipPosition}) => {
  const {locale} = useLocaleContext();
  const dispatch = useDispatch()
  const {updateLocale} = useLocaleActionsContext();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [anchorElLng, setAnchorElLng] = React.useState(null);
  const [hederLocationName, setHederLocationName] = useState('All-Location')
  const [switchingTo, setSwitchingTo] = useState(null) // { name, icon }
  
  const {allData, setHeaderLocationIdHandeler, headerLocationId} = useContext(context)
  const { CompanyReducers: {multiTypes} } = useSelector((state) => state);
  const storage = getsessionStorage()
  const company_type = storage?.company_type || null
  
  const location = useLocation();

  const isLoanRoute = location.pathname.startsWith('/payroll/loans')

  const restrictedLocations = ["/sales/invoices" , "/sales/soTracking" , "/sales/priceList" , "/sales/bills" , "/sales/payable" , "/sales/product" , "/sales/inventory" , "/sales/stockreceive" ]
  const allowedLocation = ["/sales/stocktransfer", "/sales/stockReconcilate", "/sales/stockreceive" ]
  // const locationFilter = ()=>{
  //   let temp =  allData.length === 1 ?
  //    _.unionBy([...allData,{location_name:allData[0].location_name,location_id: 5}],"location_name")
  //   : _.unionBy([...allData,{location_name:'All-Location',location_id:'null'}],"location_name")
  //   //    if (restrictedLocations.includes(location.pathname)){
    
  //   //     return temp.filter(item=>{
  //   //       const type = typeof item.location_type === "number" ? item.locationTypeName : item.location_type
  //   //       return type !== "office" && type !== "Scrap"
  //   //     })

  //   // }
  //   //  else if (!allowedLocation.includes(location.pathname)) {
  //   if(allowedLocation.includes(location.pathname)){
  //     return temp.filter(item=>{
  //       const type = typeof item.location_type === "number" ? item.locationTypeName : item.location_type
  //       return type
  //     })
  //   }
  //     return temp.filter(item=>{
  //       const type = typeof item.location_type === "number" ? item.locationTypeName : item.location_type
  //       return type !== "Scrap"
  //     })
  // };

  const locationFilter = () => {
    const routePath = location.pathname;
    const isAllowed = allowedLocation.includes(routePath);

    const filtered = allData.filter(item => {
      const type = typeof item.location_type === "number" ? item.locationTypeName : item.location_type;
      return isAllowed ? !!type : type !== "Scrap";
    });

    const result = filtered.length > 1
      ? _.unionBy([...filtered, { location_name: 'All-Location', location_id: 'null' }], "location_id")
      : filtered;

    return result;
  };

  useEffect(() => {
    if (!allData || allData.length === 0) return;
    const filtered = locationFilter();
    const isAllowed = allowedLocation.includes(location.pathname);

    const savedLocationName = storage?.headerLocation || null;
  const savedLocationObj = allData.find(
    (loc) => loc.location_name === savedLocationName
  );

  if (savedLocationObj) {
    setSelectedLocation(savedLocationObj.location_name);
    setHederLocationName(savedLocationObj.location_name);
    setHeaderLocationIdHandeler(savedLocationObj.location_id);
    return;
  }

    const selectedLoc = allData.find(loc => loc.location_name === selectedLocation);
    const selectedLocType = selectedLoc
      ? (typeof selectedLoc.location_type === "number" ? selectedLoc.locationTypeName : selectedLoc.location_type)
      : null;

    //    if(location.pathname === '/stockreceive'){
    //   return temp.filter(item=>{
    //     const type = typeof item.location_type === "number" ? item.locationTypeName : item.location_type
    //     return type === "Scrab"
    //   })
    // }

    if (filtered.length === 1) {
      const onlyOption = filtered[0];
      setHeaderLocationIdHandeler(onlyOption.location_id);
      setHederLocationName(onlyOption.location_name);
      setSelectedLocation(onlyOption.location_name);
      return;
    }

    if (!isAllowed && selectedLocType === "Scrap") {
      setHeaderLocationIdHandeler('null');
      setHederLocationName('All-Location');
      setSelectedLocation('All-Location');
      return;
    }

    const isStillValid =
      selectedLocation &&
      filtered.some(loc => loc.location_name === selectedLocation);

    if (!isStillValid && isAllowed) {
      const hasAllLocation = filtered.find(loc => loc.location_id === 'null');
      if (hasAllLocation) {
        setHeaderLocationIdHandeler('null');
        setHederLocationName('All-Location');
        setSelectedLocation('All-Location');
      }
    }

  }, [allData, location.pathname]);

  useEffect(() => {
    if (headerLocationId) {
      const matchedLocation = allData.find((loc) => loc.location_id === headerLocationId);
      if (matchedLocation) {
        setHederLocationName(matchedLocation.location_name);
        setSelectedLocation(matchedLocation.location_name);
      }
    }
  }, [headerLocationId, allData]);

  useEffect(()=>{

    if(allData.length === 0){
      setHeaderLocationIdHandeler('null');
      setHederLocationName('All-Location');
    }

  }, [allData.length === 0])

  // useEffect(() => {
    
  //   if(headerLocationId === 'null'){
  //     changeLocation({location_name:'All-Location', location_id: 'null'})
  //   }

  // },[headerLocationId])
 
  const onClickMenu = (event) => {
    if (allData.length > 1) {
    setAnchorElLng(event.currentTarget);
    }
  };
  const changeLocation = (option) => {
    setSelectedLocation(option.location_name);
    setHeaderLocationIdHandeler(option.location_id);
    setHederLocationName(option.location_name);
    setAnchorElLng(null);
    let storage = JSON.parse(sessionStorage.getItem('login')) || {}
    storage.headerLocation = option.location_name;
    sessionStorage.setItem('login', JSON.stringify(storage));
    console.log("hfiedk", selectedLocation, hederLocationName, storage)
  };

  // useEffect(()=>{
  //   if(location.pathname === '/stockreceive' && allData.length > 0){
  //     const scrabLocation_id = allData.find((e)=> e.location_name === 'Scrab')
  //     console.log(scrabLocation_id.location_id,'scrabLocation_id')
  //     setHeaderLocationIdHandeler(scrabLocation_id.location_id);
  //     return  setHederLocationName('Scrab');

  //   }
  // },[location.pathname === '/stockreceive',allData.length])

  // console.log(allData?.length, 'ghjr45456456r',location.pathname === '/stockreceive',allData)
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
const hasMultipleCompanyTypes = typeof storage?.og_company_type === 'string' && storage?.og_company_type.split(',').length > 1;

  const handleSwitch = async(id) => {
    const matched = multiTypes.find((val) => val.company_type_id === id);
    if (!matched) return;
    const icon = CompanyIcon.find((i) => i.id === matched.company_type_id);
    setSwitchingTo({ name: matched.company_type, icon: icon?.icon });
    try {
      // Update default type in backend
      dispatch(updateDefaultTypeAction({
        company_type: matched.company_type_id,
        subscription_type: matched.plan_type,
        company_id: storage.company_id
      }));
      // Update session and reload — bootstrap will fetch correct menus/permissions
      let storage1 = JSON.parse(sessionStorage.getItem('login')) || {};
      sessionStorage.setItem('login', JSON.stringify({
            ...storage1,
            company_type: matched.company_type_id,
            subscription_type: matched.plan_type,
            default_com_type: matched.company_type_id,
            default_sub_type: matched.plan_type,
          }));
      window.location.reload();
    } catch (e) {
      setSwitchingTo(null);
    }
  }

  return (
    <>
    {switchingTo && (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: '#fff',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        }}
      >
        {/* Company icon with pulse */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            bgcolor: '#f0f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(10,143,220,0.2)' },
              '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 12px rgba(10,143,220,0)' },
            },
          }}
        >
          {switchingTo.icon ? (
            <Box component='img' src={switchingTo.icon} sx={{ width: 40, height: 40 }} />
          ) : (
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main' }} />
          )}
        </Box>

        {/* Text */}
        <Typography sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
          Switching to {switchingTo.name}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 4 }}>
          Loading your workspace...
        </Typography>

        {/* Progress bar */}
        <Box sx={{ width: 200, height: 3, bgcolor: '#e8edf2', borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              width: '40%',
              height: '100%',
              bgcolor: 'primary.main',
              borderRadius: 2,
              animation: 'progress 1.2s ease-in-out infinite',
              '@keyframes progress': {
                '0%': { width: '0%', ml: '0%' },
                '50%': { width: '60%', ml: '20%' },
                '100%': { width: '0%', ml: '100%' },
              },
            }}
          />
        </Box>
      </Box>
    )}
    {storage.role_name !== 'SuperAdmin' && <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0.75,
      }}
    >
      {hasMultipleCompanyTypes ? multiTypes?.map((type) => {
                        const matchedIcon = CompanyIcon.find(
                          (icon) => icon.id === type.company_type_id,
                        );
                        const isActive = type?.isActive == 1;
                        const isCurrent = matchedIcon?.id === storage?.company_type;
                        const shortName = type.company_type === 'Asset Management'
                                ? 'Assets' : type.company_type === 'Point of Sale' ? 'POS' : type.company_type === 'Lead Management'
                                ? 'Leads' : type.company_type;
                        return (
                          <Box
                            key={type.company_type_id}
                            onClick={isActive && !isCurrent ? () => handleSwitch(matchedIcon?.id) : undefined}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 2,
                              cursor: isActive && !isCurrent ? 'pointer' : 'default',
                              bgcolor: isCurrent ? 'primary.main' : 'transparent',
                              border: '1px solid',
                              borderColor: isCurrent ? 'primary.main' : 'divider',
                              opacity: isActive ? 1 : 0.4,
                              transition: 'all 0.2s ease',
                              '&:hover': isActive && !isCurrent ? {
                                bgcolor: 'action.hover',
                                borderColor: 'primary.light',
                              } : {},
                              minWidth: 0,
                            }}
                          >
                              {matchedIcon ? (
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    flexShrink: 0,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    bgcolor: isCurrent ? '#fff' : 'grey.100',
                                    border: '1px solid',
                                    borderColor: isCurrent ? 'rgba(255,255,255,0.5)' : 'divider',
                                  }}
                                >
                                  <Box
                                    component='img'
                                    src={matchedIcon.icon}
                                    alt={shortName}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'contain',
                                      display: 'block',
                                    }}
                                  />
                                </Box>
                              ) : null}
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: isCurrent ? 600 : 500,
                                  color: isCurrent ? '#fff' : 'text.primary',
                                  whiteSpace: 'nowrap',
                                  lineHeight: 1.2,
                                }}
                              >
                              {shortName}
                            </Typography>
                          </Box>
                        );
                      }) : ''}
      { ((company_type !== 6 && company_type !== 9 && company_type !== 10 && company_type !== 5) || (company_type === 5 && storage.role_name === "Front Desk")) && <>
        {iconOnly ? <Typography
                sx={{
                  mb: 0,
                  padding:'6px',
                  fontSize: {xs: 14, sm: 16},
                  fontWeight: Fonts.MEDIUM,
                  color: (theme) => theme.palette.text.secondary,
                //   backgroundColor: (theme) => theme.palette.background.default,
                }}
                component='h4'
                variant='h4'
              >
                {allData?.length === 1 ? allData[0].location_name :hederLocationName}
              </Typography>:''}
      {!iconOnly && company_type !== 6  && company_type !== 9 ? (
        <IconButton
          sx={{
            height: 40,
            fontSize: 16,
            borderRadius: 30,
            padding: '6px 12px',
            color: (theme) => theme.palette.text.secondary,
            backgroundColor: (theme) => theme.palette.background.default,
            border: 1,
            borderColor: 'transparent',
            '&:hover, &:focus': {
              color: (theme) => theme.palette.text.primary,
              backgroundColor: (theme) =>
                alpha(theme.palette.background.default, 0.9),
              borderColor: (theme) => alpha(theme.palette.text.secondary, 0.25),
            },
            '& .langText': {
              ml: 2.5,
              fontSize: 16,
              fontWeight: Fonts.REGULAR,
              display: {xs: 'none', sm: 'inline-block'},
            },
            '& svg': {
              fontSize: 20,
            },
          }}
          className='lang-switcher-btn'
          aria-label='account of current user'
          aria-controls='language-switcher'
          aria-haspopup='true'
          onClick={onClickMenu}
          color='inherit'
          size='large'
        >
          <LocationOnIcon />
          {/* <span className='langText'>{locale.name}</span> */}
        </IconButton>
      ) : ( 
        <AppTooltip title='Location' placement={tooltipPosition}>
          <IconButton
            sx={{
                height: 32,
                width: 32,
                fontSize: 32,
                padding: '6px 9px',
                color: (theme) => theme.palette.text.secondary,
                backgroundColor: (theme) => theme.palette.background.default,
                border: 1,
                borderColor: 'transparent',
                '&:hover, &:focus': {
                  color: (theme) => theme.palette.text.primary,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.background.default, 0.9),
                  borderColor: (theme) =>
                    alpha(theme.palette.text.secondary, 0.25),
                },
                '& .langText': {
                  ml: 2.5,
                  fontSize: 16,
                  fontWeight: Fonts.REGULAR,
                  display: {xs: 'none', sm: 'inline-block'},
                },
                    '& svg': {
                  fontSize: 20,
                   width: 30,
                   height: 30,
                },
              }}
              className='lang-switcher-btn'
              aria-label='account of current user'
              aria-controls='language-switcher'
              aria-haspopup='true'
              onClick={onClickMenu}
              color='inherit'
              size='large'
          >
            <ArrowDropDownCircleOutlinedIcon/>
          </IconButton>
          
        </AppTooltip>
        
      )}
      </>
      }
    {allData.length > 1 && (  <Menu
        anchorEl={anchorElLng}
        id='language-switcher'
        keepMounted
        open={Boolean(anchorElLng)}
        onClose={() => setAnchorElLng(null)}
      >
        {locationFilter().map((option, index) => (
          <MenuItem key={index}  onClick={() =>  changeLocation(option) }
          sx={{ backgroundColor:option.location_name === selectedLocation ? '#d9d9d9' : '#ffffff'}}
          >
            <Box
              sx={{
                width: 160,
               

              }}
            >
              <Typography
                sx={{
                  mb: 0,
                  fontSize: {xs: 14, sm: 16},
                  fontWeight: Fonts.MEDIUM,
                }}
                component='h4'
                variant='h4'
              >
                {option.location_name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>)}
    </Box>}
    </>
  );
};

export default AppLocationSwitcher;

AppLocationSwitcher.propTypes = {
  iconOnly: PropsTypes.bool,
  tooltipPosition: PropsTypes.string,
};
