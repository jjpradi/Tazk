import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import compression from 'vite-plugin-compression';
import path from 'path';
import fs from 'fs';

const srcDir = path.resolve(__dirname, 'src');
const exts = ['', '.js', '.jsx', '.ts', '.tsx', '.json'];
const strictBuildFlag = (process.env.VITE_STRICT_BUILD || process.env.STRICT_BUILD || '').toLowerCase();
const isStrictBuild = strictBuildFlag === '1' || strictBuildFlag === 'true' || strictBuildFlag === 'yes';

// Resolve an import specifier to an absolute file path inside src/
function tryResolve(absPath) {
  for (const ext of exts) {
    const c = absPath + ext;
    try { if (fs.statSync(c).isFile()) return c; } catch {}
  }
  try {
    if (fs.statSync(absPath).isDirectory()) {
      for (const ext of exts) {
        if (!ext) continue;
        const idx = path.join(absPath, 'index' + ext);
        try { if (fs.statSync(idx).isFile()) return idx; } catch {}
      }
    }
  } catch {}
  return null;
}

function resolveImport(source, importerDir) {
  if (source.startsWith('.')) return tryResolve(path.resolve(importerDir, source));
  if (source.startsWith('/') || source.startsWith('\0')) return null;
  if (source.startsWith('@') && !source.startsWith('@crema')) return null;
  return tryResolve(path.resolve(srcDir, source));
}

// Scan a file's code for exported names AND all declared identifiers.
// We need declared names too so we don't add `export const X = undefined`
// that conflicts with an existing `function X` or `class X` declaration.
// filePath is needed to resolve `export * from '...'` statements.
function getExportedAndDeclaredNames(code, filePath, _seen) {
  const exported = new Set();
  const declared = new Set();
  _seen = _seen || new Set();
  let m;
  // export [async] const/let/var/function/class NAME
  const re1 = /\bexport\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+(\w+)/g;
  while ((m = re1.exec(code)) !== null) { exported.add(m[1]); declared.add(m[1]); }
  // export default [async] function/class NAME
  if (/\bexport\s+default\b/.test(code)) exported.add('default');
  const reDefName = /\bexport\s+default\s+(?:async\s+)?(?:function\*?|class)\s+(\w+)/g;
  while ((m = reDefName.exec(code)) !== null) declared.add(m[1]);
  // export { A, B } or export { A, B } from '...'
  const re2 = /\bexport\s*\{([^}]+)\}/g;
  while ((m = re2.exec(code)) !== null) {
    for (const part of m[1].split(',')) {
      const t = part.trim();
      if (!t) continue;
      const asMatch = t.match(/^\w+\s+as\s+(\w+)$/);
      exported.add(asMatch ? asMatch[1] : t);
    }
  }
  // export * from '...' — resolve and include all exports from the source
  if (filePath) {
    const reStar = /\bexport\s*\*\s*from\s*["']([^"']+)["']/g;
    while ((m = reStar.exec(code)) !== null) {
      const resolved = resolveImport(m[1], path.dirname(filePath));
      if (resolved && !_seen.has(resolved)) {
        _seen.add(resolved);
        try {
          const srcCode = fs.readFileSync(resolved, 'utf8');
          const sub = getExportedAndDeclaredNames(srcCode, resolved, _seen);
          for (const n of sub.exported) if (n !== 'default') exported.add(n);
        } catch {}
      }
    }
  }
  // All declarations (function, class, const, let, var) — catches non-exported ones too
  const re3 = /\b(?:function\*?|class|const|let|var)\s+(\w+)/g;
  while ((m = re3.exec(code)) !== null) declared.add(m[1]);
  return { exported, declared };
}

// ---------------------------------------------------------------------------
// Plugin 1: Add missing exports as undefined stubs.
//
// At startup, scans all src/ files to build a map of what named exports each
// file is expected to provide. During transform, compares with actual exports
// and appends `export const X = undefined;` for any missing ones.
// This preserves ESM live bindings and avoids TDZ issues with circular deps.
// ---------------------------------------------------------------------------
function addMissingExportsPlugin() {
  // target absolute path → Set<expected named export>
  const expectedMap = new Map();

  function walk(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
        results.push(...walk(full));
      } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        results.push(full);
      }
    }
    return results;
  }

  // Only accept valid JS identifiers (filters out comments, whitespace, etc.)
  const validIdent = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  function addExpected(filePath, name) {
    if (!validIdent.test(name)) return;
    if (!expectedMap.has(filePath)) expectedMap.set(filePath, new Set());
    expectedMap.get(filePath).add(name);
  }

  return {
    name: 'add-missing-exports',
    buildStart() {
      const files = walk(srcDir);
      for (const file of files) {
        let code;
        try { code = fs.readFileSync(file, 'utf8'); } catch { continue; }
        const dir = path.dirname(file);

        // Scan: import { A, B } from '...'
        const re1 = /\bimport\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
        let m;
        while ((m = re1.exec(code)) !== null) {
          const resolved = resolveImport(m[2], dir);
          if (!resolved) continue;
          for (const part of m[1].split(',')) {
            const t = part.trim().split(/\s+as\s+/)[0].trim();
            if (t) addExpected(resolved, t);
          }
        }

        // Scan: import Default, { A, B } from '...'
        const re2 = /\bimport\s+\w+\s*,\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
        while ((m = re2.exec(code)) !== null) {
          const resolved = resolveImport(m[2], dir);
          if (!resolved) continue;
          for (const part of m[1].split(',')) {
            const t = part.trim().split(/\s+as\s+/)[0].trim();
            if (t) addExpected(resolved, t);
          }
        }

        // Scan: export { A, B } from '...' (re-exports also need the source to provide them)
        const re3 = /\bexport\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
        while ((m = re3.exec(code)) !== null) {
          const resolved = resolveImport(m[2], dir);
          if (!resolved) continue;
          for (const part of m[1].split(',')) {
            const t = part.trim().split(/\s+as\s+/)[0].trim();
            if (t) addExpected(resolved, t);
          }
        }
      }
    },
    transform(code, id) {
      if (!id.includes('/src/') || id.includes('node_modules')) return null;

      const expected = expectedMap.get(id);
      if (!expected || expected.size === 0) return null;

      const { exported, declared } = getExportedAndDeclaredNames(code, id);
      // Names that are expected but not yet exported
      const notExported = [...expected].filter((n) => !exported.has(n));
      if (notExported.length === 0) return null;

      // For names already declared but not exported: re-export the existing binding
      // For names not declared at all: create a new const stub
      const reExports = notExported.filter((n) => declared.has(n));
      const newStubs = notExported.filter((n) => !declared.has(n));

      const lines = [];
      if (reExports.length > 0) lines.push(`export { ${reExports.join(', ')} };`);
      if (newStubs.length > 0) lines.push(...newStubs.map((n) => `export const ${n} = undefined;`));
      if (lines.length === 0) return null;

      return { code: code + '\n' + lines.join('\n') + '\n', map: null };
    },
  };
}

// ---------------------------------------------------------------------------
// Plugin 2: Lenient named imports from node_modules only.
//
// Some node_modules exports are TypeScript types that don't exist at runtime
// (e.g. GridValueGetterParams from @mui/x-data-grid). For these, convert
// named imports to namespace + destructure so missing exports become undefined
// instead of SyntaxError. Only applied to imports from non-src packages.
// ---------------------------------------------------------------------------
function lenientNodeModuleImportsPlugin() {
  function isSrcImport(source) {
    if (source.startsWith('.') || source.startsWith('/')) return true;
    if (source.startsWith('@') && !source.startsWith('@crema')) return false;
    const abs = path.resolve(srcDir, source.split('?')[0]);
    return tryResolve(abs) !== null;
  }

  return {
    name: 'lenient-node-module-imports',
    transform(code, id) {
      if (!/\/src\/.*\.(js|jsx|ts|tsx)$/.test(id) || id.includes('node_modules')) return null;

      let n = 0;
      let out = code;

      function toDestructure(names) {
        return names.replace(/\b(\w+)\s+as\s+(\w+)\b/g, '$1: $2');
      }

      // 1) import Default, { A, B } from 'node-module' (mixed — must come first)
      out = out.replace(
        /\bimport\s+(\w+)\s*,\s*\{([^}]+)\}\s*from\s*(["'][^"']+["'])\s*;?/g,
        (m, def, names, src) => {
          if (isSrcImport(src.slice(1, -1))) return m;
          const v = `__lnm${n++}`;
          return `import ${def} from ${src}; import * as ${v} from ${src}; const {${toDestructure(names)}} = ${v};`;
        },
      );

      // 2) import { A, B } from 'node-module'
      out = out.replace(
        /\bimport\s*\{([^}]+)\}\s*from\s*(["'][^"']+["'])\s*;?/g,
        (m, names, src) => {
          if (isSrcImport(src.slice(1, -1))) return m;
          const v = `__lnm${n++}`;
          return `import * as ${v} from ${src}; const {${toDestructure(names)}} = ${v};`;
        },
      );

      if (n === 0) return null;
      return { code: out, map: null };
    },
  };
}

// ---------------------------------------------------------------------------
// Plugin 3: CRA baseUrl resolution.
//
// Mimics CRA's jsconfig "baseUrl": "src" — resolves bare imports against src/
// if a matching file/directory exists there, otherwise falls through to normal
// node_modules resolution.
// ---------------------------------------------------------------------------
function craBaseUrlPlugin() {
  return {
    name: 'cra-base-url',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('.') || source.startsWith('/') || source.startsWith('\0')) return null;
      if (source.startsWith('@') && !source.startsWith('@crema')) return null;

      const queryIndex = source.indexOf('?');
      const query = queryIndex >= 0 ? source.slice(queryIndex) : '';
      const cleanSource = queryIndex >= 0 ? source.slice(0, queryIndex) : source;

      const srcPath = path.resolve(srcDir, cleanSource);
      const resolved = tryResolve(srcPath);
      if (resolved) return resolved + query;

      return null;
    },
  };
}

// ---------------------------------------------------------------------------
// Plugin 4: Fix MUI v7 exports map issue with trailing-slash deep imports.
//
// The commonjs resolver sometimes resolves CJS require("@mui/material") as a
// deep import "@mui/material/" (trailing slash), which maps to "./" specifier
// not present in MUI v7's exports map. This plugin intercepts and fixes it.
// ---------------------------------------------------------------------------
function fixPackageExportsPlugin() {
  return {
    name: 'fix-package-exports',
    enforce: 'pre',
    resolveId(source) {
      // Fix trailing-slash imports from MUI packages
      if (/^@mui\/[^/]+\/$/.test(source)) {
        return this.resolve(source.slice(0, -1), undefined, { skipSelf: true });
      }
      // date-fns v3 removed the esm/ directory; redirect date-fns/esm/X → date-fns/X
      if (source.startsWith('date-fns/esm/')) {
        return this.resolve(source.replace('date-fns/esm/', 'date-fns/'), undefined, { skipSelf: true });
      }
      // date-fns v3/v4 exports don't include /index or /index.js suffixes; strip them
      if (source.startsWith('date-fns/') && /\/index(\.js)?$/.test(source)) {
        return this.resolve(source.replace(/\/index(\.js)?$/, ''), undefined, { skipSelf: true });
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    fixPackageExportsPlugin(),
    craBaseUrlPlugin(),
    !isStrictBuild && addMissingExportsPlugin(),
    !isStrictBuild && lenientNodeModuleImportsPlugin(),
    react(),
    svgr(),
    compression({ algorithm: 'gzip', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', threshold: 1024 }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@crema': path.resolve(srcDir, '@crema'),
      'utils': path.resolve(__dirname, './src/utils'),
    },
    dedupe: [
      '@mui/material',
      '@mui/system',
      '@mui/utils',
      '@mui/icons-material',
      '@mui/private-theming',
      '@emotion/react',
      '@emotion/styled',
      'react',
      'react-dom',
      'react-is',
    ],
  },
  assetsInclude: ['**/*.xlsx'],
  define: {
    global: 'globalThis',
    'process.env': '{}',
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      // Core React
      'react', 'react-dom', 'react-dom/client', 'react-dom/server', 'react-is', 'react-redux', 'react-router-dom',
      'redux', 'redux-saga', 'redux-thunk', '@redux-saga/core',
      // MUI core + sub-paths
      '@mui/material', '@mui/material/utils', '@mui/material/SvgIcon',
      '@mui/material/styles', '@mui/icons-material', '@mui/lab', '@mui/system',
      '@mui/x-date-pickers', '@mui/x-data-grid',
      // Emotion
      '@emotion/react', '@emotion/styled', '@emotion/cache',
      // All project dependencies (CJS compat)
      '@date-io/moment',
      '@hello-pangea/dnd', '@material-table/core', '@material-table/exporters',
      '@preact/signals-react',
      '@react-google-maps/api', '@react-leaflet/core',
      'apexcharts', 'axios', 'axios-mock-adapter', 'bwip-js', 'clsx',
      'crypto-js',
      'date-fns', 'date-fns/addDays', 'date-fns/addSeconds', 'date-fns/addMinutes',
      'date-fns/addHours', 'date-fns/addWeeks', 'date-fns/addMonths', 'date-fns/addYears',
      'date-fns/endOfDay', 'date-fns/endOfWeek', 'date-fns/endOfYear', 'date-fns/endOfMonth',
      'date-fns/format', 'date-fns/getDate', 'date-fns/getDaysInMonth',
      'date-fns/getHours', 'date-fns/getMinutes', 'date-fns/getMonth',
      'date-fns/getSeconds', 'date-fns/getMilliseconds', 'date-fns/getWeek', 'date-fns/getYear',
      'date-fns/isAfter', 'date-fns/isBefore', 'date-fns/isEqual', 'date-fns/isSameDay',
      'date-fns/isSameYear', 'date-fns/isSameMonth', 'date-fns/isSameHour', 'date-fns/isValid',
      'date-fns/isWithinInterval', 'date-fns/parse',
      'date-fns/setDate', 'date-fns/setHours', 'date-fns/setMinutes',
      'date-fns/setMonth', 'date-fns/setSeconds', 'date-fns/setMilliseconds', 'date-fns/setYear',
      'date-fns/startOfDay', 'date-fns/startOfMonth', 'date-fns/startOfWeek', 'date-fns/startOfYear',
      'date-fns/locale', 'date-fns/locale/en-US', 'date-fns/_lib/format/longFormatters',
      'dayjs',
      'dayjs/plugin/advancedFormat', 'dayjs/plugin/customParseFormat',
      'dayjs/plugin/isBetween', 'dayjs/plugin/isLeapYear',
      'dayjs/plugin/localizedFormat', 'dayjs/plugin/quarterOfYear',
      'dayjs/plugin/weekOfYear',
      'events', 'file-saver',
      'firebase/app', 'firebase/messaging', 'firebase/compat/app',
      'firebase/compat/auth', 'firebase/compat/firestore',
      'filefy', 'formik', 'html2pdf.js', 'jspdf', 'leaflet',
      'lodash', 'lodash/isEqual', 'lodash.debounce', 'material-ui-popup-state',
      'moment', 'moment/moment', 'notistack', 'papaparse', 'pdfmake',
      'pdfmake/build/pdfmake', 'pdfmake/build/vfs_fonts',
      'platform', 'pouchdb', 'prism-react-renderer', 'prop-types', 'qrcode',
      'react-accessible-treeview', 'react-apexcharts', 'react-barcode',
      'react-big-calendar', 'react-bottom-scroll-listener', 'react-code-input',
      'react-color', 'react-content-loader', 'react-cropper', 'react-csv',
      'react-csv-reader', 'react-d3-speedometer', 'react-draggable',
      'react-dropzone', 'react-export-table-to-excel', 'react-grid-layout',
      'react-helmet-async',
      'react-image-crop',
      'react-intersection-observer', 'react-intl', 'react-leaflet',
      'react-material-ui-carousel', 'react-player', 'react-popper',
      'react-qr-code', 'react-quill-new', 'react-slick', 'react-to-print',
      'react-toast', 'react-tooltip', 'recharts', 'simplebar-react',
      'socket.io-client', 'stylis', 'stylis-plugin-rtl',
      'tss-react', 'tss-react/mui', 'universal-cookie', 'use-url-search-params',
      'uuid', 'web-vitals', 'websocket', 'xlsx-js-style', 'yup',
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  esbuild: {
    loader: 'jsx',
    include: [/.*\/src\/.*\.jsx?$/],
    exclude: [],
    drop: process.env.NODE_ENV === 'production' ? [] : [],
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    chunkSizeWarningLimit: 15000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (!isStrictBuild && warning.code === 'MISSING_EXPORT') return;
        if (warning.code === 'EVAL') return;
        if (warning.code === 'PLUGIN_WARNING' && warning.message?.includes('dynamically imported')) return;
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          const normalizedId = id.split(path.sep).join('/');
          if (normalizedId.includes('@material-table/core')) {
            return 'vendor-table';
          }
          // MUI chunks (keep MUI X + date adapters with core MUI to avoid circular chunk graphs)
          if (normalizedId.includes('/@mui/icons-material/')) return 'vendor-mui-icons';
          if (normalizedId.includes('/@mui/x-')) return 'vendor-mui';
          if (normalizedId.includes('/@mui/') || normalizedId.includes('/@emotion/')) return 'vendor-mui';
          // Date libs are co-located with MUI because pickers/adapters cross-import both ways.
          if (
            normalizedId.includes('/date-fns/') ||
            normalizedId.includes('/moment/') ||
            normalizedId.includes('/dayjs/') ||
            normalizedId.includes('/@date-io/')
          ) {
            return 'vendor-mui';
          }
          // React core
          if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/') || normalizedId.includes('/react-is/') || normalizedId.includes('/scheduler/')) return 'vendor-react';
          // Redux + saga
          if (normalizedId.includes('redux') || normalizedId.includes('redux-saga') || normalizedId.includes('@redux-saga')) return 'vendor-redux';
          // Charting
          if (normalizedId.includes('recharts') || normalizedId.includes('apexcharts') || normalizedId.includes('react-apexcharts') || normalizedId.includes('d3-')) return 'vendor-charts';
          // Firebase
          if (normalizedId.includes('firebase') || normalizedId.includes('@firebase/')) return 'vendor-firebase';
          // Maps
          if (normalizedId.includes('leaflet') || normalizedId.includes('react-leaflet') || normalizedId.includes('@react-leaflet') || normalizedId.includes('@react-google-maps')) return 'vendor-maps';
          // Socket / realtime
          if (normalizedId.includes('socket.io') || normalizedId.includes('websocket') || normalizedId.includes('pouchdb')) return 'vendor-realtime';
        },
      },
    },
  },
  // Vitest configuration — lives inside defineConfig so vite.config.js stays a single source of truth.
  // Only affects `vitest` / `npm test`, not the prod build.
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    css: false,
    // Reduce noise: MUI + emotion warnings about act() wrappers are expected in integration-style tests
    silent: false,
  },
});
