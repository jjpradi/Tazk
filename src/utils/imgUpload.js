import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material';

const AvatarViewWrapper = styled('div')(({ theme }) => {
  return {
    position: 'relative',
    cursor: 'pointer',
    '& .edit-icon, & .delete-icon': {
      position: 'absolute',
      zIndex: 1,
      border: `solid 2px ${theme.palette.background.paper}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.7),
      color: theme.palette.primary.contrastText,
      borderRadius: '50%',
      width: 26,
      height: 26,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.4s ease',
      cursor: 'pointer',
      '& .MuiSvgIcon-root': {
        fontSize: 16,
      },
    },
    '& .edit-icon': {
      bottom: 0,
      right: 0,
    },
    '& .delete-icon': {
      bottom: 0,
      left: 0, 
      zIndex:100,// Positioning the delete icon on the left side
    },
    '&.dropzone': {
      outline: 0,
      '&:hover .edit-icon, &:focus .edit-icon, &:hover .delete-icon, &:focus .delete-icon': {
        display: 'flex',
      },
    },
  };
});

export default AvatarViewWrapper;
