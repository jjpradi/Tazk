import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import {Box} from '@mui/material';
import PropTypes from 'prop-types';
import {base_url} from 'http-common';

const Members = (props) => {
  const {members, assignee_name} = props;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Tooltip title={assignee_name ?? ''}>
        {members ? (
          <Avatar
            sx={{
              width: 25,
              height: 25,
              mr: 1.5,
            }}
            src={`${base_url}${members}`}
            alt=''
          />
        ) : (
          <Avatar
            sx={{
              width: 25,
              height: 25,
              mr: 1.5,
              fontSize: 'small'
            }}
          >
            {assignee_name?.[0]?.toUpperCase() ?? '?'}
          </Avatar>
        )}
      </Tooltip>
    </Box>
  );
};

export default Members;

Members.propTypes = {
  members: PropTypes.string,
  assignee_name: PropTypes.string,
};
