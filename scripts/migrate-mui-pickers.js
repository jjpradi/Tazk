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

const pickerNamePattern = /(?:Date|Time|Range|Calendar|Clock|Picker|Field)/;

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

function isValidIdentifier(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
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

function getReturnedJsx(body) {
  if (!body) return null;
  if (body.type === 'JSXElement') return body;
  if (body.type === 'JSXFragment') return body;
  if (body.type === 'ParenthesizedExpression') return getReturnedJsx(body.expression);
  if (body.type === 'BlockStatement') {
    for (const stmt of body.body) {
      if (stmt.type === 'ReturnStatement' && stmt.argument) {
        return getReturnedJsx(stmt.argument);
      }
    }
  }
  return null;
}

function buildTextFieldSlotPropsFromRenderInput(renderAttr, source) {
  if (!renderAttr || renderAttr.type !== 'JSXAttribute') {
    return {ok: false, reason: 'renderInput attribute missing'};
  }
  if (!renderAttr.value || renderAttr.value.type !== 'JSXExpressionContainer') {
    return {ok: false, reason: 'renderInput is not JSX expression'};
  }

  const expr = renderAttr.value.expression;
  if (expr.type !== 'ArrowFunctionExpression' && expr.type !== 'FunctionExpression') {
    return {ok: false, reason: 'renderInput is not function'};
  }

  const firstParam = expr.params[0];
  const firstParamName = firstParam && firstParam.type === 'Identifier' ? firstParam.name : null;
  const returned = getReturnedJsx(expr.body);

  if (!returned || returned.type !== 'JSXElement') {
    return {ok: false, reason: 'renderInput does not return JSX element'};
  }

  const opening = returned.openingElement;
  const openingName = jsxElementNameToString(opening.name);
  if (openingName !== 'TextField') {
    return {ok: false, reason: `renderInput returns ${openingName || 'non-TextField'}`};
  }

  const propEntries = [];
  for (const attr of opening.attributes) {
    if (attr.type === 'JSXSpreadAttribute') {
      if (
        firstParamName &&
        attr.argument &&
        attr.argument.type === 'Identifier' &&
        attr.argument.name === firstParamName
      ) {
        continue;
      }
      const spreadExpr = source.slice(attr.argument.start, attr.argument.end).trim();
      if (spreadExpr) propEntries.push(`...${spreadExpr}`);
      continue;
    }

    if (attr.type !== 'JSXAttribute') continue;
    if (!attr.name || attr.name.type !== 'JSXIdentifier') continue;

    const keyName = attr.name.name;
    const keyText = isValidIdentifier(keyName) ? keyName : JSON.stringify(keyName);

    let valueText = 'true';
    if (attr.value) {
      if (attr.value.type === 'StringLiteral') {
        valueText = source.slice(attr.value.start, attr.value.end);
      } else if (attr.value.type === 'JSXExpressionContainer') {
        if (attr.value.expression && attr.value.expression.type !== 'JSXEmptyExpression') {
          valueText = source.slice(attr.value.expression.start, attr.value.expression.end);
        } else {
          valueText = 'undefined';
        }
      } else {
        valueText = source.slice(attr.value.start, attr.value.end);
      }
    }

    propEntries.push(`${keyText}: ${valueText}`);
  }

  const textFieldObject = propEntries.length ? `{ ${propEntries.join(', ')} }` : '{}';
  return {
    ok: true,
    slotPropsText: `slotProps={{ textField: ${textFieldObject} }}`,
  };
}

function collectPickerLocalNames(ast) {
  const localNames = new Set();
  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const src = node.source && node.source.value ? String(node.source.value) : '';
    if (!src.startsWith('@mui/x-date-pickers') && !src.startsWith('@mui/lab')) continue;

    for (const spec of node.specifiers) {
      if (spec.local && spec.local.name && pickerNamePattern.test(spec.local.name)) {
        localNames.add(spec.local.name);
      }
    }
  }
  return localNames;
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
    if (source.includes('@mui/x-date-pickers') || source.includes('@mui/lab')) {
      unsupported.push({
        file: filePath,
        line: 1,
        reason: `parse failed: ${err.message}`,
      });
    }
    return {changed: false, inputFormatCount: 0, renderInputCount: 0};
  }

  const pickerLocalNames = collectPickerLocalNames(ast);
  if (pickerLocalNames.size === 0) {
    return {changed: false, inputFormatCount: 0, renderInputCount: 0};
  }

  const replacements = [];
  let inputFormatCount = 0;
  let renderInputCount = 0;

  traverse(ast, {
    JSXOpeningElement(pathNode) {
      const node = pathNode.node;
      const tagName = jsxElementNameToString(node.name);
      if (!tagName || !pickerLocalNames.has(tagName)) return;

      let inputFormatAttr = null;
      let renderInputAttr = null;
      let slotPropsAttr = null;

      for (const attr of node.attributes) {
        if (attr.type !== 'JSXAttribute' || !attr.name || attr.name.type !== 'JSXIdentifier') continue;
        if (attr.name.name === 'inputFormat') inputFormatAttr = attr;
        if (attr.name.name === 'renderInput') renderInputAttr = attr;
        if (attr.name.name === 'slotProps') slotPropsAttr = attr;
      }

      if (inputFormatAttr) {
        const valueText = inputFormatAttr.value
          ? source.slice(inputFormatAttr.value.start, inputFormatAttr.value.end)
          : "''";
        replacements.push({
          start: inputFormatAttr.start,
          end: inputFormatAttr.end,
          text: `format=${valueText}`,
        });
        inputFormatCount += 1;
      }

      if (renderInputAttr) {
        if (slotPropsAttr) {
          unsupported.push({
            file: filePath,
            line: renderInputAttr.loc?.start?.line || 1,
            reason: `has both slotProps and renderInput on <${tagName}>`,
          });
          return;
        }

        const converted = buildTextFieldSlotPropsFromRenderInput(renderInputAttr, source);
        if (!converted.ok) {
          unsupported.push({
            file: filePath,
            line: renderInputAttr.loc?.start?.line || 1,
            reason: `${converted.reason} on <${tagName}>`,
          });
          return;
        }

        replacements.push({
          start: renderInputAttr.start,
          end: renderInputAttr.end,
          text: converted.slotPropsText,
        });
        renderInputCount += 1;
      }
    },
  });

  if (replacements.length === 0) {
    return {changed: false, inputFormatCount, renderInputCount};
  }

  replacements.sort((a, b) => b.start - a.start);
  let next = source;
  for (const r of replacements) {
    next = next.slice(0, r.start) + r.text + next.slice(r.end);
  }

  if (next !== source) {
    fs.writeFileSync(filePath, next, 'utf8');
    return {changed: true, inputFormatCount, renderInputCount};
  }

  return {changed: false, inputFormatCount, renderInputCount};
}

function main() {
  const files = walk(srcDir);
  const unsupported = [];

  let changedFiles = 0;
  let totalInputFormat = 0;
  let totalRenderInput = 0;

  for (const file of files) {
    const result = migrateFile(file, unsupported);
    if (result.changed) changedFiles += 1;
    totalInputFormat += result.inputFormatCount;
    totalRenderInput += result.renderInputCount;
  }

  console.log(`Changed files: ${changedFiles}`);
  console.log(`Converted inputFormat -> format: ${totalInputFormat}`);
  console.log(`Converted renderInput -> slotProps.textField: ${totalRenderInput}`);

  if (unsupported.length > 0) {
    console.log(`Unsupported cases: ${unsupported.length}`);
    const reportPath = path.join(rootDir, 'scripts', 'mui-picker-migration-unsupported.txt');
    const lines = unsupported
      .map((item) => `${path.relative(rootDir, item.file)}:${item.line} - ${item.reason}`)
      .sort();
    fs.writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');
    console.log(`Report written: ${path.relative(rootDir, reportPath)}`);
  } else {
    const reportPath = path.join(rootDir, 'scripts', 'mui-picker-migration-unsupported.txt');
    if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
  }
}

main();
