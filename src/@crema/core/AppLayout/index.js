import React, {useContext, useEffect} from 'react';
import AppContentView from '@crema/core/AppContentView';
import {useAuthUser} from '../../utility/AuthHooks';
import {
  useLayoutActionsContext,
  useLayoutContext,
} from '../../utility/AppContextProvider/LayoutContextProvider';
import Layouts from './Layouts';
import AuthWrapper from './AuthWrapper';
import {useUrlSearchParams} from 'use-url-search-params';
import {useSidebarActionsContext} from '../../utility/AppContextProvider/SidebarContextProvider';
import {useThemeActionsContext} from '../../utility/AppContextProvider/ThemeContextProvider';
import {DarkSidebar, LightSidebar} from '../../utility/AppContextProvider/defaultConfig';
import {ThemeMode} from '../../../shared/constants/AppEnums';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import ToastMessage from '../../../firebase/toast_notify';
import Notifications from '../../../firebase/notifications';
import Alertbox from "../../../pages/assets/alert/index";
import { layoutTypes, navStyles } from '@crema/services/db/navigationStyle';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { getThemesAction } from 'redux/actions/userCreation_actions';
import { getsessionStorage } from '../../../pages/common/login/cookies';

const AppLayout = () => {
  const {navStyle} = useLayoutContext();
  const {isAuthenticated} = useAuthUser();
  const {updateNavStyle,updateLayoutType} = useLayoutActionsContext();
  const {updateMenuStyle, setSidebarBgImage, updateSidebarColorSet} = useSidebarActionsContext();
  const {updateThemeMode} = useThemeActionsContext();
  const AppLayout = Layouts[navStyle];
  console.log('[DEBUG AppLayout]', { navStyle, isAuthenticated, AppLayout: !!AppLayout, pathname: window.location.pathname });
  const [params] = useUrlSearchParams();
  const {pathname} = useLocation()
  const { UserRoleReducer: getThemes } = useSelector((state) => state);
  const {commoncookie} = useContext(
      CreateNewButtonContext,
    );
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  useEffect(() => {
    if (params.layout) updateNavStyle(params.layout);
    if (params.menuStyle) updateMenuStyle(params.menuStyle);
    if (params.sidebarImage) setSidebarBgImage(true);
  }, []);

  useEffect(() => {
    if (getThemes?.length) {
      const theme = getThemes[0];
      localStorage.setItem('design', JSON.stringify(theme));
      applyTheme(theme);
    }
  }, [getThemes]);


  useEffect(() => {
    if (isAuthenticated) {
      const cached = localStorage.getItem('design');
      if (cached) {
        applyTheme(JSON.parse(cached));
      }
      storage?.company_type !== 13 && dispatch(getThemesAction(commoncookie));
    }
  }, [isAuthenticated]);


  const applyTheme = (userTheme) => {
    if (!userTheme) return

    if (userTheme.nav_styles) {
      const nav = navStyles.find(
        layout => layout.id === userTheme.nav_styles
      )
      nav && updateNavStyle(nav.alias)
    }

    if (userTheme.layout_styles) {
      const layout = layoutTypes.find(
        layout => layout.id === userTheme.layout_styles
      )
      layout && updateLayoutType(layout.alias)
    }

    if (userTheme.theme_modes) {
      updateThemeMode(userTheme.theme_modes);
      if (userTheme.theme_modes === ThemeMode.DARK) {
        updateSidebarColorSet({ ...DarkSidebar });
      } else {
        updateSidebarColorSet({ ...LightSidebar });
      }
    }
  }
  useEffect(() => {
    if (isAuthenticated && !getThemes?.length) {
      const storedTheme = localStorage.getItem('design')
      if (storedTheme) {
        applyTheme(JSON.parse(storedTheme))
      }
    }
  }, [])

  const getUserTheme = () => {
    if (!getThemes?.length) return;

    const theme = getThemes[0];

    if (theme.nav_styles) {
      const nav = navStyles.find(l => l.id === theme.nav_styles);
      nav && updateNavStyle(nav.alias);
    }

    if (theme.layout_styles) {
      const layout = layoutTypes.find(l => l.id === theme.layout_styles);
      layout && updateLayoutType(layout.alias);
    }
  };


  let except_path_name = [
    '/pointofsale',
    '/pointofsale/payment',
    '/pointofsale/payment/posInvoice',
    '/signin'
  ];

  const toastTrigger = (title, body) => {
    toast(<p>{title} <br/> {body} </p> );
  }
  return (
    <Box width='100%'>
      <Notifications toastTrigger={toastTrigger} />
        <ToastMessage />
        <Alertbox />
      {isAuthenticated ?
        except_path_name.includes(pathname) ?

          <AuthWrapper>
            <AppContentView sxStyle={{p:0}} />
          </AuthWrapper>
          :
          <AppLayout />

      : (
        <AuthWrapper>
          <AppContentView />
        </AuthWrapper>
      )}
    </Box>
  );
};

export default React.memo(AppLayout);
