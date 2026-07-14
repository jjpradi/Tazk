import React, {useContext, useEffect, useState} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AccountTabsWrapper from './AccountTabsWrapper';
import {AppAnimate} from '../../@crema';
import {Tooltip} from '@mui/material';
import DocumentType1 from './documents/documentType1';
import DocumentType2 from './documents/documentType2';
import {useDispatch, useSelector} from 'react-redux';
import {
  EmployeeVerificationDetail,
  verificationTypeAction,
} from 'redux/actions/userCreation_actions';
import NewType from './documents/newType';
import LicenseVerification from './documents/licenseVerification';
import Social from './social';
import Residence from './residence';
import PassportAadhar from './passport';
import PanVerification from './PanVerification';
import DrugVerification from './DrugVerification';
import FamilyBackgroundVerification from './familyBackgroung';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Documents = ({tabs, user}) => {
  const dispatch = useDispatch();
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const {
    UserCreationReducer: {verificationType, empVerificationDetail},
  } = useSelector((state) => state);
  const [value, setValue] = useState(0);
  const [edit, setEdit] = useState(false);
  const [dialog, setDialog] = useState(false);

  useEffect(() => {
    setEdit(false);
    const data = {type: value};
    const empDetail = {index_value: value, employee_id: user.employee_id};
    if(Object.keys(user).length > 0){
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(verificationTypeAction(data)),
        dispatch(EmployeeVerificationDetail(empDetail)),
      )
    }
  }, [value, user.employee_id, dispatch]);

  const onTabsChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderTabContent = (index) => {
    const commonProps = {
      index: index,
      userId: user.employee_id,
      handleDialogOpen: () => setDialog(true),
    };

    const specificProps = {
      10: {
        Component: PassportAadhar,
        props: {socials: empVerificationDetail},
      },
      4: {
        Component: LicenseVerification,
        props: {
          verificationType: verificationType,
          data: empVerificationDetail,
          edit: edit,
          setEdit: setEdit,
          handleClose: () => setEdit(false),
        },
      },
      5: {
        Component: Social,
        props: {socials: empVerificationDetail},
      },
      9: {
        Component: Residence,
        props: {
          data: empVerificationDetail,
          edit: edit,
          setEdit: setEdit,
          handleClose: () => setEdit(false),
        },
      },
      7: {
        Component: DrugVerification,
        props: {
          data: empVerificationDetail,
          edit: edit,
          setEdit: setEdit,
          handleClose: () => setEdit(false),
        },
      },
      8: {
        Component: FamilyBackgroundVerification,
        props: {
          data: empVerificationDetail,
          edit: edit,
          setEdit: setEdit,
          handleClose: () => setEdit(false),
        },
      },
      11: {
        Component: PanVerification,
        props: {
          data: empVerificationDetail,
          edit: edit,
          setEdit: setEdit,
          handleClose: () => setEdit(false),
        },
      },
      default: {
        Component: DocumentType1,
        props: {
          verificationType: verificationType,
          data: empVerificationDetail,
          edit: edit,
          setEdit: setEdit,
          handleClose: () => setEdit(false),
          typeLabel:
            index === 0
              ? 'ID TYPE'
              : index === 1
              ? 'ADDRESS PROOF '
              : index === 2 || index === 3
              ? 'DOCUMENT'
              : 'DOCUMENT',
          numberLabel:
            index === 0 || index === 1
              ? 'ID NUMBER'
              : index === 2
              ? 'REF.NUMBER'
              : index === 3
              ? 'DOCUMENT NUMBER'
              : 'REF.NUMBER',
        },
      },
    };

    const {Component, props: componentProps} =
      specificProps[index] || specificProps.default;

    return <Component {...commonProps} {...componentProps} />;
  };

  return (
    <>
      <AccountTabsWrapper>
        <AppAnimate animation='transition.slideLeftIn' delay={1000}>
          <Tabs
            className='account-tabs'
            value={value}
            onChange={onTabsChange}
            aria-label='basic tabs example'
            orientation='vertical'
          >
            {tabs.map((tab, index) => (
              <Tab
                className='account-tab'
                label={tab.name}
                icon={tab.icon}
                key={index}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </AppAnimate>
        <AppAnimate animation='transition.slideRightIn' delay={1000}>
          <Box className='account-tabs-content'>
            <AppAnimate animation='transition.slideRightIn' delay={1000}>
              {renderTabContent(value)}
            </AppAnimate>
          </Box>
        </AppAnimate>
      </AccountTabsWrapper>

      {dialog && (
        <NewType
          open={dialog}
          handleClose={() => setDialog(false)}
          index={value}
        />
      )}
    </>
  );
};

export default Documents;
