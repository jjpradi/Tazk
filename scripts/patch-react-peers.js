/**
 * Patches React peer dependency ranges for selected third-party packages.
 * This keeps runtime code unchanged while allowing React 19 installs.
 */
const fs = require('fs');
const path = require('path');

const peerPatches = {
  'react-material-ui-carousel': {
    react: '^17.0.1 || ^18.0.0 || ^19.0.0',
    'react-dom': '^17.0.2 || ^18.0.0 || ^19.0.0',
  },
  'react-popper': {
    react: '^16.8.0 || ^17 || ^18 || ^19.0.0',
    'react-dom': '^16.8.0 || ^17 || ^18 || ^19.0.0',
  },
  'react-leaflet': {
    react: '^18.0.0 || ^19.0.0',
    'react-dom': '^18.0.0 || ^19.0.0',
  },
  '@react-leaflet/core': {
    react: '^18.0.0 || ^19.0.0',
    'react-dom': '^18.0.0 || ^19.0.0',
  },
  'react-to-print': {
    react: '^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
    'react-dom': '^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
  },
  'material-ui-popup-state': {
    react: '^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
  },
  'react-bottom-scroll-listener': {
    react: '^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
    'react-dom': '^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
  },
  'react-csv-reader': {
    react: '^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
    'react-dom': '^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
  },
  'react-helmet-async': {
    react: '^16.6.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
  },
  'react-intersection-observer': {
    react: '^15.0.0 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0',
  },
  'react-intl': {
    react: '^16.6.0 || 17 || 18 || 19',
  },
};

const resolvePackageJson = (packageName) =>
  path.resolve(
    __dirname,
    '..',
    'node_modules',
    ...packageName.split('/'),
    'package.json',
  );

const patchLockfile = (lockfilePath) => {
  if (!fs.existsSync(lockfilePath)) return {patched: 0, skipped: 0};

  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
  const packages = lockfile.packages || {};
  let patched = 0;
  let skipped = 0;

  for (const [packageName, peerRanges] of Object.entries(peerPatches)) {
    const lockKey = `node_modules/${packageName}`;
    const pkg = packages[lockKey];
    if (!pkg) {
      skipped += 1;
      continue;
    }

    pkg.peerDependencies = pkg.peerDependencies || {};
    for (const [peerName, peerRange] of Object.entries(peerRanges)) {
      if (pkg.peerDependencies[peerName] !== peerRange) {
        pkg.peerDependencies[peerName] = peerRange;
        patched += 1;
      }
    }
  }

  fs.writeFileSync(lockfilePath, `${JSON.stringify(lockfile, null, 2)}\n`, 'utf8');
  return {patched, skipped};
};

let patchedPackages = 0;
let skippedPackages = 0;

for (const [packageName, peerRanges] of Object.entries(peerPatches)) {
  const packageJsonPath = resolvePackageJson(packageName);
  if (!fs.existsSync(packageJsonPath)) {
    skippedPackages += 1;
    continue;
  }

  const json = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  json.peerDependencies = json.peerDependencies || {};

  let changed = false;
  for (const [peerName, peerRange] of Object.entries(peerRanges)) {
    if (json.peerDependencies[peerName] !== peerRange) {
      json.peerDependencies[peerName] = peerRange;
      changed = true;
    }
  }

  if (!changed) continue;

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  patchedPackages += 1;
  console.log(`Patched peers: ${packageName}`);
}

const rootLockResult = patchLockfile(path.resolve(__dirname, '..', 'package-lock.json'));
const nodeModulesLockResult = patchLockfile(
  path.resolve(__dirname, '..', 'node_modules', '.package-lock.json'),
);

console.log(
  `react peer patch complete (${patchedPackages} packages patched, ${skippedPackages} packages skipped)`,
);
console.log(
  `lockfile peer patch complete (root: ${rootLockResult.patched} entries patched, node_modules: ${nodeModulesLockResult.patched} entries patched)`,
);
