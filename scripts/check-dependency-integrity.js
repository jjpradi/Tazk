const path = require('path');
const {execSync} = require('child_process');

const rootDir = path.resolve(__dirname, '..');

function runJson(command) {
  try {
    const out = execSync(command, {cwd: rootDir, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8'});
    return JSON.parse(out);
  } catch (error) {
    const stdout = error.stdout ? String(error.stdout) : '';
    if (!stdout.trim()) throw error;
    return JSON.parse(stdout);
  }
}

function collectPackageVersions(tree, targetName, out = new Set()) {
  if (!tree || !tree.dependencies) return out;
  for (const [name, dep] of Object.entries(tree.dependencies)) {
    if (name === targetName && dep && dep.version) out.add(String(dep.version));
    collectPackageVersions(dep, targetName, out);
  }
  return out;
}

function resolvePackage(pkg) {
  try {
    require.resolve(pkg, {paths: [rootDir]});
    return true;
  } catch {
    try {
      require.resolve(`${pkg}/package.json`, {paths: [rootDir]});
      return true;
    } catch {
      return false;
    }
  }
}

function main() {
  const failures = [];

  const reactTree = runJson('npm ls react react-dom --all --json');
  const reactVersions = [...collectPackageVersions(reactTree, 'react')];
  const reactDomVersions = [...collectPackageVersions(reactTree, 'react-dom')];

  if (reactVersions.length === 0) failures.push('react is not installed');
  if (reactDomVersions.length === 0) failures.push('react-dom is not installed');

  const badReact = reactVersions.filter((v) => !/^19\./.test(v));
  const badReactDom = reactDomVersions.filter((v) => !/^19\./.test(v));

  if (badReact.length > 0) {
    failures.push(`unexpected react versions detected: ${badReact.join(', ')}`);
  }
  if (badReactDom.length > 0) {
    failures.push(`unexpected react-dom versions detected: ${badReactDom.join(', ')}`);
  }

  const requiredPackages = [
    '@mui/material',
    '@mui/x-data-grid',
    '@mui/x-date-pickers',
    '@material-table/core',
    'react-to-print',
    'react-leaflet',
    '@react-google-maps/api',
  ];

  for (const pkg of requiredPackages) {
    if (!resolvePackage(pkg)) failures.push(`missing required package: ${pkg}`);
  }

  const forbiddenPackages = ['react-code-input', 'material-table'];
  for (const pkg of forbiddenPackages) {
    if (resolvePackage(pkg)) failures.push(`forbidden package is installed: ${pkg}`);
  }

  if (failures.length > 0) {
    console.error('Dependency integrity check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Dependency integrity check passed.');
  console.log(`react versions: ${reactVersions.join(', ')}`);
  console.log(`react-dom versions: ${reactDomVersions.join(', ')}`);
}

main();
