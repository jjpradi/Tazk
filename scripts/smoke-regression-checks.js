const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const rootDir = path.resolve(__dirname, '..');

const parsePlugins = [
  'jsx',
  'typescript',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'objectRestSpread',
  'optionalChaining',
  'nullishCoalescingOperator',
  'dynamicImport',
  'importMeta',
  'logicalAssignment',
  'numericSeparator',
  'topLevelAwait',
];

function abs(relPath) {
  return path.resolve(rootDir, relPath);
}

function readFile(relPath) {
  const absolutePath = abs(relPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`missing file: ${relPath}`);
  }
  return fs.readFileSync(absolutePath, 'utf8');
}

function ensureParseable(relPath) {
  const code = readFile(relPath);
  try {
    parser.parse(code, {
      sourceType: 'unambiguous',
      plugins: parsePlugins,
      errorRecovery: false,
    });
  } catch (error) {
    throw new Error(`parse failed for ${relPath}: ${error.message}`);
  }
}

function ensurePatterns(relPath, patterns) {
  const code = readFile(relPath);
  for (const pattern of patterns) {
    if (!pattern.test(code)) {
      throw new Error(`pattern ${pattern} not found in ${relPath}`);
    }
  }
}

function ensurePackage(pkg) {
  try {
    require.resolve(pkg, {paths: [rootDir]});
  } catch {
    try {
      require.resolve(`${pkg}/package.json`, {paths: [rootDir]});
    } catch {
      throw new Error(`required package not resolvable: ${pkg}`);
    }
  }
}

function main() {
  const checks = [];

  // Auth OTP smoke checks.
  checks.push(() =>
    ensurePatterns('src/pages/common/auth/ResetPasswordAwsCognito.js', [
      /import\s+VerificationCodeInput/,
      /<VerificationCodeInput/,
    ])
  );
  checks.push(() =>
    ensurePatterns('src/pages/common/auth/ConfirmSignupAwsCognito.js', [
      /import\s+VerificationCodeInput/,
      /<VerificationCodeInput/,
    ])
  );
  checks.push(() => ensureParseable('src/pages/common/auth/VerificationCodeInput.js'));

  // Maps smoke checks.
  checks.push(() =>
    ensurePatterns('src/pages/Payroll/liveLocation/index.js', [
      /@react-google-maps\/api/,
      /react-leaflet/,
    ])
  );
  checks.push(() =>
    ensurePatterns('src/pages/Payroll/attendance/attendanceMap.js', [/react-leaflet/])
  );
  checks.push(() =>
    ensurePatterns('src/components/employeeVerification/map/index.js', [/react-leaflet/])
  );

  // Print flow smoke checks.
  checks.push(() =>
    ensurePatterns('src/pages/sales/Receipt/index.js', [/react-to-print/])
  );
  checks.push(() =>
    ensurePatterns('src/pages/sales/Receipt/ReceiptReport.js', [/react-to-print/])
  );
  checks.push(() =>
    ensurePatterns('src/components/pos/session/SummaryDialog.js', [/useReactToPrint|react-to-print/])
  );

  // Key DataGrid report smoke checks.
  checks.push(() =>
    ensurePatterns('src/components/dataGridTemp.js', [/<DataGrid/])
  );
  checks.push(() =>
    ensurePatterns('src/pages/sales/salesReport/index.js', [/DataGridTemp/])
  );
  checks.push(() =>
    ensurePatterns('src/pages/Payroll/AttendanceReports/attendanceReports.js', [/DataGrid/])
  );
  checks.push(() =>
    ensurePatterns('src/pages/sales/ReceivableReport/index.js', [/DataGridTemp/])
  );
  checks.push(() =>
    ensurePatterns('src/pages/sales/PayableReport/index.js', [/DataGridTemp/])
  );
  checks.push(() =>
    ensurePatterns('src/pages/sales/StockAgeingReport/index.js', [/DataGridTemp/])
  );

  // Route registration smoke checks.
  checks.push(() =>
    ensurePatterns('src/pages/allRoutes.js', [
      /path:\s*'\/payroll\/LiveLocation'/,
      /path:\s*'\/payroll\/AttendanceReports'/,
      /path:\s*'\/sales\/salesReport'/,
      /path:\s*'\/sales\/stockAgeingReport'/,
      /path:\s*'\/sales\/SACReport'/,
      /path:\s*'\/pointofsale\/preOrderReport'/,
      /path:\s*'\/receivableReport'/,
      /path:\s*'\/payableReport'/,
    ])
  );

  // Ensure critical libs are available.
  const requiredPackages = [
    '@mui/x-data-grid',
    '@mui/x-date-pickers',
    'react-to-print',
    'react-leaflet',
    '@react-google-maps/api',
    '@material-table/core',
  ];
  for (const pkg of requiredPackages) {
    checks.push(() => ensurePackage(pkg));
  }

  const errors = [];
  for (const runCheck of checks) {
    try {
      runCheck();
    } catch (error) {
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    console.error('Smoke regression checks failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Smoke regression checks passed (${checks.length} assertions).`);
}

main();
