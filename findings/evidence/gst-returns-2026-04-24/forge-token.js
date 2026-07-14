// Forge a JWT matching the backend's access_token_secret.
// Used ONLY to prove requireRole middleware behaviour under different role claims.
const jwt = require('jsonwebtoken');
const role = process.argv[2] || 'Cashier';
const payload = {
  name: 'rbac.' + role.toLowerCase().replace(/\s+/g,''),
  id: 99999,
  employee_id: 99999,
  company_id: 401,
  company_type: '3',
  user_location: [750, 751],
  subscriptionEndTime: '2028-05-02 11:59:00',
  role_id: 99999,
  role_name: role,
  departments: [],
  department_head: 0,
  subscription_type: '20',
  company_name: 'VEETEE TRADING PRIVATE LIMITED',
  login_type: 'WEB',
  default_com_type: 0,
  default_sub_type: 0,
  person_id: 99999,
  customer_id: null,
  location_id: 750,
  headerLocationId: 750,
};
const token = jwt.sign(payload, 'AccessTokenSecret', { expiresIn: '1h', issuer: 'pos.vtt.im', algorithm: 'HS256' });
console.log(token);
