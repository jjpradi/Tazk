import React, {useMemo} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import VerticalCollapse from '../VerticalCollapse';
import VerticalItem from '../VerticalItem';
import IntlMessages from '../../../../../utility/IntlMessages';
import {checkPermission} from '../../../../../utility/helper/RouteHelper';
import {useAuthUser} from '../../../../../utility/AuthHooks';
import {useSidebarContext} from '../../../../../utility/AppContextProvider/SidebarContextProvider';
import VerticalNavGroupItem from './VerticalNavGroupItem';
import { TextField } from '@mui/material';

const VerticalNavGroup = ({item, level}) => {
  const {sidebarTextColor} = useSidebarContext();
  const {user} = useAuthUser();
  const hasPermission = useMemo(
    () => checkPermission(item.permittedRole, user.role),
    [item.permittedRole, user.role],
  );

  if (!hasPermission) {
    return null;
  }
  return (
    <>
      {/* <VerticalNavGroupItem
        level={level}
        sidebarTextColor={sidebarTextColor}
        component='div'
        className={clsx('nav-item nav-item-header')}
      >
        {item.messageId} */}
        {/* <TextField placeholder='Search' size='small' sx={{ pl: '10px' }} /> */}
      {/* </VerticalNavGroupItem> */}

      {item.children && (
        <>
          {item.children.map((item, idx) => (
            <React.Fragment key={`${item.id ?? 'nav'}-${item.messageId ?? item.url ?? 'menu'}-${idx}`}>
              {item.type === 'group' && (
                <NavVerticalGroup item={item} level={level} />
              )}

              {item.type === 'collapse' && (
                <VerticalCollapse item={item} level={level} />
              )}

              {(item.type === 'item' || item.type === 'panel-item') && (
                <VerticalItem item={item} level={level} />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </>
  );
};

VerticalNavGroup.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    type: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    permittedRole: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    messageId: PropTypes.string,
    children: PropTypes.array,
  }),
  level: PropTypes.number,
};

const NavVerticalGroup = VerticalNavGroup;

export default NavVerticalGroup;
