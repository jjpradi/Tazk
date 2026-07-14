// Forge JWT for arbitrary company/role. args: <role> <company_id>
const jwt = require('jsonwebtoken');
const role = process.argv[2] || 'Administrator';
const companyId = Number(process.argv[3] || 401);
const payload = {
  name: 'rbac.probe',
  id: 99999,
  employee_id: 99999,
  company_id: companyId,
  company_type: '3',
  user_location: [1],
  subscriptionEndTime: '2028-05-02 11:59:00',
  role_id: 99999,
  role_name: role,
  departments: [],
  department_head: 0,
  subscription_type: '20',
  company_name: 'PROBE',
  login_type: 'WEB',
  default_com_type: 0,
  default_sub_type: 0,
  person_id: 99999,
  customer_id: null,
  location_id: 1,
  headerLocationId: 1,
};
console.log(jwt.sign(payload, 'AccessTokenSecret', { expiresIn: '1h', issuer: 'pos.vtt.im', algorithm: 'HS256' }));
