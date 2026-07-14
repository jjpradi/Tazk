import React from 'react';
import clsx from 'clsx';
import AppContentView from '@crema/core/AppContentView';
import AppFixedFooter from './AppFixedFooter';
import AppHeader from './AppHeader';
import {useLayoutContext} from '../../../utility/AppContextProvider/LayoutContextProvider';
import AppThemeSetting from '../../AppThemeSetting';
import DefaultLayoutWrapper from './DefaultLayoutWrapper';
import MainContent from './MainContent';
import {LayoutType} from '../../../../shared/constants/AppEnums';
import AppSidebar from './AppSidebar';
import DefaultLayoutContainer from './DefaultLayoutContainer';
import {useSelector} from 'react-redux';
import {getsessionStorage} from '../../../../pages/common/login/cookies';

const DefaultLayout = () => {
  const {footer, layoutType, headerType, footerType} = useLayoutContext();
  const {subscriptionExpired} = useSelector(state => state.NavigationReducer);
  const storage = getsessionStorage();
  const isExpired = subscriptionExpired || storage?.subscriptionRemainingDays === 0;
  const isSuperAdmin = Number(storage?.company_type) === 8;

  if (isExpired && !isSuperAdmin) {
    return (
      <DefaultLayoutContainer
        className={clsx({
          boxedLayout: layoutType === LayoutType.BOXED,
          framedLayout: layoutType === LayoutType.FRAMED,
        })}
      >
        <DefaultLayoutWrapper
          className={clsx('defaultLayoutWrapper', {
            appMainFooter: footer && footerType === 'fluid',
            appMainFixedFooter: footer && footerType === 'fixed',
            appMainFixedHeader: headerType === 'fixed',
          })}
        >
          <MainContent>
            <AppHeader />
            <AppContentView />
          </MainContent>
        </DefaultLayoutWrapper>
      </DefaultLayoutContainer>
    );
  }

  return (
    <DefaultLayoutContainer
      className={clsx({
        boxedLayout: layoutType === LayoutType.BOXED,
        framedLayout: layoutType === LayoutType.FRAMED,
      })}
    >
      <DefaultLayoutWrapper
        className={clsx('defaultLayoutWrapper', {
          appMainFooter: footer && footerType === 'fluid',
          appMainFixedFooter: footer && footerType === 'fixed',
          appMainFixedHeader: headerType === 'fixed',
        })}
      >
        <AppSidebar />

        <MainContent>
          <AppHeader />
          <AppContentView />
          <AppFixedFooter />
        </MainContent>
        <AppThemeSetting />
      </DefaultLayoutWrapper>
    </DefaultLayoutContainer>
  );
};

export default DefaultLayout;
