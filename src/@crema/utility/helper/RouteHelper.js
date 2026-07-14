import ContactPage from '../../services/db/Contact/index';

export const checkPermission = (routeRole, userRole) => {
  if (!routeRole || !routeRole) {
    return true;
  }

  if (userRole && Array.isArray(userRole) && !Array.isArray(routeRole)) {
    return userRole.indexOf(routeRole) >= 0;
  }
  if (routeRole.length === 0) {
    return !userRole || userRole.length === 0;
  }
  if (userRole && Array.isArray(userRole) && Array.isArray(routeRole)) {
    return routeRole.some((r) => userRole.indexOf(r) >= 0);
  }
  return routeRole.indexOf(userRole) >= 0;
};

export const OpenCustomerLandingPage = (data) => {
  console.log(data, 'opencustomer')
  if (data) {
    return (
      <ContactPage
        rowIndex={data.rowIndex}
        sales_customer_id={data.sales_customer_id}
        routeFrom={data.routeFrom}
        salesOrder={data.salesOrder}
        payable={data.payable}
        purchaseOrder={data.purchaseOrder}
        mail_configuration={data.mail_configuration}
        setOnbackClick={data.setOnbackClick}
        backToSales={data.backToSales}
      />
    )
  }
  return null;
};
