import React from 'react';
import {Route, Routes} from 'react-router-dom';
import Layout from './components/Layout';

const RenderRoutes = ({routes}) => {
  function RouteWithSubRoutes(route) {
    return (
      // <Layout>
      //</Layout>
      <Route
        path={route.path}
        exact={route.exact}
        render={(props) => <route.component {...props} routes={route.routes} />}
      />
    );
  }

  return (
    <Routes>
      <Layout>
        {routes.map((route, i) => {
          return <RouteWithSubRoutes key={route.key} {...route} />;
        })}
      </Layout>
      <Route component={() => <h1>Not Found!</h1>} />
    </Routes>
  );
};

export default RenderRoutes;
