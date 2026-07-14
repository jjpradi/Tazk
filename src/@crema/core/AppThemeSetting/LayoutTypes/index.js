import React from 'react';
import {CustomizerItemWrapper} from '../index.style';
import Box from '@mui/material/Box';
import IntlMessages from '../../../utility/IntlMessages';
import {layoutTypes} from '../../../services/db/navigationStyle';
import {
  useLayoutActionsContext,
  useLayoutContext,
} from '../../../utility/AppContextProvider/LayoutContextProvider';
import AppSelectedIcon from '../../AppSelectedIcon';
import { useDispatch } from 'react-redux';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

const LayoutTypes = ({onChange}) => {
  const {updateLayoutType} = useLayoutActionsContext();
  const {layoutType} = useLayoutContext();

  const onLayoutChange = (layoutType) => {
    updateLayoutType(layoutType);
  };
  return (
    <CustomizerItemWrapper pb={1}>
      <Box component='h3' sx={{mb: 3}}>
        <IntlMessages id='customizer.layoutTypes' />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginLeft: '-10px',
          marginRight: '-10px',
        }}
      >
        {layoutTypes.map((layout) => {
          return (
            <Box
              sx={{
                paddingLeft: 2.5,
                paddingRight: 2.5,
                minWidth: 114,
                maxHeight: 118,
              }}
              key={layout.id}
            >
              <Box
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  
                }}
                // onClick={() => onLayoutChange(layout.alias)}
                 onClick={() => onChange?.('layout_styles', layout.id)}
              >
                <img src={layout.image} alt='nav' style={{height: 100, width: 100}} />
                {layoutType === layout.alias ? <AppSelectedIcon /> : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    </CustomizerItemWrapper>
  );
};

export default LayoutTypes;
