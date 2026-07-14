import React, { useEffect } from 'react';
import {Provider} from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';
import AuthRoutes from '@crema/utility/AuthRoutes';
import AppContextProvider from '@crema/utility/AppContextProvider';
import AppThemeProvider from '@crema/utility/AppThemeProvider';
import AppStyleProvider from '@crema/utility/AppStyleProvider';
import AppLocaleProvider from '@crema/utility/AppLocaleProvider';
import AppLayout from '@crema/core/AppLayout';
import configureStore from 'redux/store';
import FirebaseAuthProvider from './@crema/services/auth/firebase/FirebaseAuthProvider';
import {BrowserRouter} from 'react-router-dom';
import PosContext from './components/Layout/posContext';
import {HelmetProvider} from 'react-helmet-async';
import "./index.css";

const store = configureStore();

// Temporary error boundary for debugging sidebar issue
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info); }
  render() {
    if (this.state.error) return <div style={{padding:20,color:'red'}}><h2>Render Error</h2><pre>{this.state.error.message}</pre><pre>{this.state.error.stack}</pre></div>;
    return this.props.children;
  


  }
}

// Pipeline test
const App = () => {
  // useEffect(()=>{
  //        document.title = 'bnbnbnb'
  // },[])
  return (
    <HelmetProvider>
    <AppContextProvider>
      <Provider store={store}>
        <AppThemeProvider>
          <AppStyleProvider>
            <AppLocaleProvider>
              <BrowserRouter>
                <FirebaseAuthProvider>
                  <PosContext>
                    <AuthRoutes>
                      <CssBaseline />
                      <ErrorBoundary>
                        <AppLayout />
                      </ErrorBoundary>
                    </AuthRoutes>
                  </PosContext>
                </FirebaseAuthProvider>
              </BrowserRouter>
            </AppLocaleProvider>
          </AppStyleProvider>
        </AppThemeProvider>
      </Provider>
    </AppContextProvider>
    </HelmetProvider>
  );
} 

export default App;
