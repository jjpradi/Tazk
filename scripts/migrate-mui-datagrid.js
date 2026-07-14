const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const exts = new Set(['.js', '.jsx', '.ts', '.tsx']);

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

const gridModules = new Set([
  '@mui/x-data-grid',
  '@mui/x-data-grid-pro',
  '@mui/x-data-grid-premium',
]);

const oldToNewProps = new Map([
  ['rowsPerPageOptions', 'pageSizeOptions'],
  ['onSelectionModelChange', 'onRowSelectionModelChange'],
  ['selectionModel', 'rowSelectionModel'],
  ['components', 'slots'],
  ['componentsProps', 'slotProps'],
  ['disableSelectionOnClick', 'disableRowSelectionOnClick'],
]);

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'build') continue;
      walk(full, out);
      continue;
    }
    if (exts.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function jsxElementNameToString(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') {
    const left = jsxElementNameToString(nameNode.object);
    const right = jsxElementNameToString(nameNode.property);
    if (!left || !right) return null;
    return `${left}.${right}`;
  }
  return null;
}

function getAttrExpr(attr, source) {
  if (!attr) return null;
  if (!attr.value) return 'true';
  if (attr.value.type === 'StringLiteral') {
    return source.slice(attr.value.start, attr.value.end);
  }
  if (attr.value.type === 'JSXExpressionContainer') {
    const expr = attr.value.expression;
    if (!expr || expr.type === 'JSXEmptyExpression') return null;
    return source.slice(expr.start, expr.end);
  }
  return source.slice(attr.value.start, attr.value.end);
}

function addReplacement(replacements, start, end, text) {
  replacements.push({start, end, text});
}

function collectGridLocalNames(ast) {
  const localNames = new Set();
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const mod = node.source && node.source.value ? String(node.source.value) : '';
    if (!gridModules.has(mod)) continue;
    for (const spec of node.specifiers) {
      if (!spec.local || !spec.local.name) continue;
      if (/^DataGrid(?:Pro|Premium)?$/.test(spec.local.name)) {
        localNames.add(spec.local.name);
      }
    }
  }
  return localNames;
}

function getAttrMap(node) {
  const map = new Map();
  for (const attr of node.attributes) {
    if (attr.type !== 'JSXAttribute') continue;
    if (!attr.name || attr.name.type !== 'JSXIdentifier') continue;
    map.set(attr.name.name, attr);
  }
  return map;
}

function toSet(arr) {
  return new Set(arr.filter(Boolean));
}

function migrateFile(filePath, unsupported) {
  const source = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = parser.parse(source, {
      sourceType: 'unambiguous',
      plugins: parsePlugins,
      errorRecovery: false,
    });
  } catch (err) {
    if (source.includes('@mui/x-data-grid')) {
      unsupported.push({
        file: filePath,
        line: 1,
        reason: `parse failed: ${err.message}`,
      });
    }
    return {changed: false, renamed: 0, paginationMigrated: 0};
  }

  const gridLocalNames = collectGridLocalNames(ast);
  if (gridLocalNames.size === 0) {
    return {changed: false, renamed: 0, paginationMigrated: 0};
  }

  const replacements = [];
  let renamed = 0;
  let paginationMigrated = 0;

  traverse(ast, {
    JSXOpeningElement(pathNode) {
      const node = pathNode.node;
      const tagName = jsxElementNameToString(node.name);
      if (!tagName || !gridLocalNames.has(tagName)) return;

      const attrMap = getAttrMap(node);
      const removeAttrs = new Set();
      const appendAttrs = [];

      // Simple prop renames.
      for (const [oldName, newName] of oldToNewProps.entries()) {
        const oldAttr = attrMap.get(oldName);
        if (!oldAttr) continue;

        if (attrMap.has(newName)) {
          removeAttrs.add(oldAttr);
          continue;
        }

        addReplacement(replacements, oldAttr.name.start, oldAttr.name.end, newName);
        renamed += 1;
      }

      // Pagination migration.
      const pageSizeAttr = attrMap.get('pageSize');
      const rowsPerPageAttr = attrMap.get('rowsPerPage');
      const pageAttr = attrMap.get('page');
      const onPageChangeAttr = attrMap.get('onPageChange');
      const onPageSizeChangeAttr = attrMap.get('onPageSizeChange');
      const paginationModelAttr = attrMap.get('paginationModel');
      const onPaginationModelChangeAttr = attrMap.get('onPaginationModelChange');
      const initialStateAttr = attrMap.get('initialState');

      const hasLegacyPagination =
        !!pageSizeAttr || !!rowsPerPageAttr || !!pageAttr || !!onPageChangeAttr || !!onPageSizeChangeAttr;

      if (hasLegacyPagination) {
        const pageSizeExpr = getAttrExpr(pageSizeAttr || rowsPerPageAttr, source);
        const pageExpr = getAttrExpr(pageAttr, source) || '0';
        const onPageChangeExpr = getAttrExpr(onPageChangeAttr, source);
        const onPageSizeChangeExpr = getAttrExpr(onPageSizeChangeAttr, source);

        if (!pageSizeExpr && !paginationModelAttr && !initialStateAttr) {
          unsupported.push({
            file: filePath,
            line: node.loc?.start?.line || 1,
            reason: `cannot infer pageSize for <${tagName}>`,
          });
        } else {
          // Build pagination state prop only when absent.
          if (!paginationModelAttr && !initialStateAttr && pageSizeExpr) {
            if (pageAttr) {
              appendAttrs.push(`paginationModel={{ page: ${pageExpr}, pageSize: ${pageSizeExpr} }}`);
            } else {
              appendAttrs.push(
                `initialState={{ pagination: { paginationModel: { page: 0, pageSize: ${pageSizeExpr} } } }}`
              );
            }
            paginationMigrated += 1;
          }

          // Replace onPageChange/onPageSizeChange with onPaginationModelChange when absent.
          if (!onPaginationModelChangeAttr && (onPageChangeExpr || onPageSizeChangeExpr)) {
            const bodyLines = [];
            if (onPageChangeExpr) {
              if (pageAttr) {
                bodyLines.push(`if (model.page !== ${pageExpr}) { (${onPageChangeExpr})(model.page); }`);
              } else {
                bodyLines.push(`(${onPageChangeExpr})(model.page);`);
              }
            }
            if (onPageSizeChangeExpr) {
              if (pageSizeExpr) {
                bodyLines.push(
                  `if (model.pageSize !== ${pageSizeExpr}) { (${onPageSizeChangeExpr})(model.pageSize); }`
                );
              } else {
                bodyLines.push(`(${onPageSizeChangeExpr})(model.pageSize);`);
              }
            }

            if (bodyLines.length > 0) {
              appendAttrs.push(`onPaginationModelChange={(model) => { ${bodyLines.join(' ')} }}`);
              paginationMigrated += 1;
            }
          }
        }

        // Remove legacy pagination attrs.
        for (const attr of toSet([pageSizeAttr, rowsPerPageAttr, pageAttr, onPageChangeAttr, onPageSizeChangeAttr])) {
          removeAttrs.add(attr);
        }
      }

      for (const attr of removeAttrs) {
        addReplacement(replacements, attr.start, attr.end, '');
      }

      if (appendAttrs.length > 0) {
        const insertPos = node.attributes.length
          ? node.attributes[node.attributes.length - 1].end
          : node.name.end;
        addReplacement(replacements, insertPos, insertPos, ` ${appendAttrs.join(' ')}`);
      }
    },
  });

  if (replacements.length === 0) {
    return {changed: false, renamed, paginationMigrated};
  }

  replacements.sort((a, b) => b.start - a.start);
  let next = source;
  for (const r of replacements) {
    next = next.slice(0, r.start) + r.text + next.slice(r.end);
  }

  if (next !== source) {
    fs.writeFileSync(filePath, next, 'utf8');
    return {changed: true, renamed, paginationMigrated};
  }

  return {changed: false, renamed, paginationMigrated};
}

function main() {
  const files = walk(srcDir);
  const unsupported = [];

  let changedFiles = 0;
  let renamedCount = 0;
  let paginationCount = 0;

  for (const file of files) {
    const result = migrateFile(file, unsupported);
    if (result.changed) changedFiles += 1;
    renamedCount += result.renamed;
    paginationCount += result.paginationMigrated;
  }

  console.log(`Changed files: ${changedFiles}`);
  console.log(`Renamed deprecated props: ${renamedCount}`);
  console.log(`Migrated pagination props: ${paginationCount}`);

  if (unsupported.length > 0) {
    console.log(`Unsupported cases: ${unsupported.length}`);
    const reportPath = path.join(rootDir, 'scripts', 'mui-datagrid-migration-unsupported.txt');
    const lines = unsupported
      .map((item) => `${path.relative(rootDir, item.file)}:${item.line} - ${item.reason}`)
      .sort();
    fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');
    console.log(`Report written: ${path.relative(rootDir, reportPath)}`);
  } else {
    const reportPath = path.join(rootDir, 'scripts', 'mui-datagrid-migration-unsupported.txt');
    if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
  }
}

main();
