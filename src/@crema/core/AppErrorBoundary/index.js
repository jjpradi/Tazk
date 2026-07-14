import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import ErrorIcon from './ErrorIcon';
import { useNavigate } from 'react-router-dom';
import {
  isRecoverableDynamicImportError,
  recoverDynamicImportError,
} from 'utils/dynamicImportRecovery';
import { reportFrontendError } from 'utils/errorReporter';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.log('error: ', error);
    return { hasError: true, errorMessage: error?.message || String(error) };
  }

  componentDidCatch(error, errorInfo) {
    console.log('errorInfo: ', errorInfo);
    if (recoverDynamicImportError(error)) {
      return;
    }

    if (isRecoverableDynamicImportError(error)) {
      return;
    }
    reportFrontendError(error, errorInfo?.componentStack);
  }

  componentWillUnmount() {
    this.setState({ hasError: false });
  }

  handleClose = async () => {
    this.setState({ hasError: false });
    window.location.replace(`${window.location.origin}/common/home`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',

            '& img': {
              width: '100%',
              maxWidth: 400,
              color: theme.palette.primary.main,
            },
          })}
        >
          <ErrorIcon />
          <Typography variant="h2" component="h2" style={{ fontSize: 30, marginTop: 16 }}>
            Ah! Something went wrong.
          </Typography>
          <Typography style={{ fontSize: 18, marginTop: 12 }}>
            Brace yourself till we get the error fixed.
          </Typography>
          <Typography style={{ fontSize: 18 }}>
            You may also refresh the page or try again latter
          </Typography>
          {this.state.errorMessage && (
            <Typography style={{ fontSize: 12, marginTop: 12, color: '#d32f2f', fontFamily: 'monospace', maxWidth: 600, wordBreak: 'break-word' }}>
              {this.state.errorMessage}
            </Typography>
          )}
          <Button variant="contained" onClick={this.handleClose} sx={{ marginTop: 16 }}>
            Close
          </Button>
        </Box>
      );
    } else {
      return this.props.children;
    }
  }
}

export function AppNavigate(props) {
  const navigate = useNavigate();
  const navigateToHome = () => {
    navigate('/common/home');
  };
  return <AppErrorBoundary navigateToHome={navigateToHome}></AppErrorBoundary>;
}

export default AppErrorBoundary;

AppErrorBoundary.propTypes = {
  children: PropTypes.node,
};
