import React from 'react';
import List from '@mui/material/List';
import GroupItem from './GroupItem';
import {makeStyles} from 'tss-react/mui';
import PropTypes from 'prop-types';
import routesConfig from '../../../../../../pages/routesConfig';
import { useSelector } from 'react-redux';
import Cookies from 'universal-cookie';
import { getsessionStorage } from 'pages/common/login/cookies';

const useStyles = makeStyles(() => ({
  navRoot: {
    position: 'relative',
    padding: 0,
  },
}));
const MenuGroup = ({selectedMenu, setSelectedMenu}) => {
  const classes = useStyles();

  const {modules=[]} = useSelector(state => state.roleReducer.menus_id_get)
  // const cookies =  new Cookies()
  const storage = getsessionStorage()
  const {modules: localModules=[]} = storage || {}

  const getModules = modules.length ? modules : localModules
  
  const filtered = routesConfig[0].children.filter(r => getModules.some(m =>r.messageId === m.module_name)|| r.messageId ==='Dashboard')
  const newRoutesConfig = [...routesConfig]
  newRoutesConfig[0].children = filtered

  return (
    <List className={classes.navRoot} component='div'>
      {newRoutesConfig.map((item, idx) => (
        <React.Fragment key={`${item.id ?? 'menu-group'}-${item.messageId ?? item.url ?? 'menu'}-${idx}`}>
          {/* {item.type === 'group' && (
            <GroupItem
              item={item}
              selectedMenu={selectedMenu} 
              setSelectedMenu={setSelectedMenu}
            />
          )} */}
        </React.Fragment>
      ))}
    </List>
  );
};

export default MenuGroup;

MenuGroup.propTypes = {
  selectedMenu: PropTypes.object,
  setSelectedMenu: PropTypes.func,
};
