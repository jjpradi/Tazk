import React from 'react';
import {alpha, styled} from '@mui/material/styles';
import { Grid , Card ,Typography,CardContent} from '@mui/material'
import ListItem from '@mui/material/ListItem'
import { Box ,IconButton} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import clsx from 'clsx';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';

const ContactListItemWrapper = styled(ListItem)(({ theme }) => {
    return {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      fontSize: 14,
      borderBottom: `1px solid ${theme.palette.divider}`,
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 5,
      paddingRight: 1,
      cursor: 'pointer',
      overflow: 'hidden',
      '&.rootCheck': {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        boxShadow: `0 3px 5px 0 ${alpha(theme.palette.common.black, 0.08)}`,
      },
      '& .conActionHoverHideRoot': {
        transition: 'all 0.4s ease',
      },
      '&:hover': {
        '& .conActionHoverRoot': {
          opacity: 1,
          visibility: 'visible',
          right: 0,
        },
        '& .conActionHoverHideRoot': {
          opacity: 0,
          visibility: 'hidden',
        },
        '& .contactViewInfo': {
          [theme.breakpoints.up('sm')]: {
            width: 'calc(100% - 114px)',
          },
        },
      },
    };
  });

  const tasks = [
    {
      id: 1,
      title: 'Task 1',
      description: 'This is a description for task 1.',
      label: 'Important',
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'This is a description for task 2.',
      label: 'Optional',
    },

  ];

const StarredTask = () => {
    return (
        <Box>
          {tasks.map((task) => (
            <ContactListItemWrapper
              key={task.id}
              className={clsx('item-hover')}
              onClick={() => console.log(`Clicked on ${task.title}`)}
              >
                  <IconButton
                      sx={{
                          color: 'gray',
                          marginRight: 2, 
                          '&:hover': {
                              color: 'gold',
                          },
                      }}
                      onClick={(e) => {
                          e.stopPropagation();
                      }}
                  >
                      <StarBorderOutlinedIcon />
                  </IconButton>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    mr: 2.5,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {task.title}
                  </Typography>
                  <Typography variant="body2">
                    {task.description}
                  </Typography>
                </Box>
                <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: 'auto',
                marginRight: '10px',
              }}
            >
            </Box>
              </Box>
            </ContactListItemWrapper>
          ))}
        </Box>
      );
}

export default StarredTask