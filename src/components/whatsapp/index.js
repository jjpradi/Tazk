import React, {useEffect} from 'react';
import TempList from './tempList';
import AssignTemp from './assignTemp';
import NewTemp from './newTemp';
import {useLocation, useParams} from 'react-router-dom';
import AppCard from '../../@crema/core/AppCard';
import {AppAnimate} from '../../@crema';

const WhatsAppComponent = () => {
  const {id} = useParams();
  const {pathname} = useLocation();

  useEffect(() => {
    document.body.classList.add('whatsapp-no-page-scroll');
    return () => {
      document.body.classList.remove('whatsapp-no-page-scroll');
    };
  }, []);

  // const onGetMainComponent = () => {
  //   if (pathname ===  '/wassup/:id') {
  //     return <AssignTemp />;
  //   } else if (pathname === '/wassup/new') {
  //     return <NewTemp />;
  //   } else {
  //     return <TempList />;
  //   }
  // };
  const onGetMainComponent = () => {
      return <TempList />;
  };
  return (
    <AppAnimate animation='transition.slideLeftIn' delay={1000}>
      <AppCard contentStyle={{flex: 1, minHeight: 0, height: 'auto', overflow: 'auto'}}>
        {onGetMainComponent()}
      </AppCard>
    </AppAnimate>
  );
};

export default WhatsAppComponent;
