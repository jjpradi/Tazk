import React, { useContext, useEffect } from 'react';

import SidebarSettings from '@crema/core/AppThemeSetting/SidebarSettings';
import NavStyles from '@crema/core/AppThemeSetting/NavStyles';
import Box from '@mui/material/Box';
import ThemeModes from '@crema/core/AppThemeSetting/ThemeModes';
import ThemeColors from '@crema/core/AppThemeSetting/ThemeColors';
import {Helmet} from "react-helmet-async";
import { titleURL } from 'http-common';
import { useDispatch, useSelector } from 'react-redux';
import { getThemesAction, updateThemesAction } from 'redux/actions/userCreation_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { navStyles } from '@crema/services/db/navigationStyle';
import { useLayoutActionsContext } from '@crema/utility/AppContextProvider/LayoutContextProvider';
const CustomizeThemes = () => {
  const dispatch = useDispatch();
  const {updateNavStyle} = useLayoutActionsContext();

  const { UserRoleReducer: getThemes } = useSelector((state) => state);

  const {commoncookie} = useContext(
    CreateNewButtonContext,
  );

  useEffect(() => {
    dispatch(getThemesAction(commoncookie))
  }, [])

  const handleThemeUpdate = (key, value) => {
    const currentTheme =
      getThemes?.[0] ||
      JSON.parse(localStorage.getItem('design')) ||
      {};

    const updatedTheme = {
      ...currentTheme,
      [key]: value,
    };

    localStorage.setItem('design', JSON.stringify(updatedTheme));

    if (key === 'nav_styles') {
      const selectedLayout = navStyles.find((layout) => layout.id === value);
      if (selectedLayout) updateNavStyle(selectedLayout.alias);
    }

    dispatch(
      updateThemesAction(
        commoncookie,
        { [key]: value },
        () => dispatch(getThemesAction(commoncookie))
      )
    );
  };

  return (
    <div>
      <Helmet>
               <meta charSet="utf-8" />
               <title> {titleURL} | Customize Themes </title>
     </Helmet>
      <Box
       sx={{
         padding: 2,
       }}
     >
     <Box component='h2'>Customize Themes</Box>
       <NavStyles onChange={handleThemeUpdate}/>
       <SidebarSettings onChange={handleThemeUpdate}/>
       <ThemeModes onChange={handleThemeUpdate}/>
       <ThemeColors onChange={handleThemeUpdate}/>
     </Box>
    </div>
  );
};
export default CustomizeThemes;

