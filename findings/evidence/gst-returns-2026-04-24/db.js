// DB helper — SELECT-only. Pass SQL via argv. Example:
//   node db.js "SELECT id FROM pos_company LIMIT 1"
const mysql = require('mysql2/promise');

(async () => {
  const sql = process.argv.slice(2).join(' ');
  if (!sql) { console.error('usage: node db.js <SELECT sql>'); process.exit(2); }
  if (!/^\s*(SELECT|SHOW|DESCRIBE|DESC)\b/i.test(sql)) {
    console.error('REFUSED: non-SELECT query');
    process.exit(3);
  }
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'root', password: 'root',
    database: 'pos_erp_db_dev', dateStrings: true,
  });
  try {
    const [rows] = await conn.query(sql);
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await conn.end();
  }
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
