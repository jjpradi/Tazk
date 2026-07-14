/**
 * Patches react-draggable to work with React 19 (which removed ReactDOM.findDOMNode).
 * Run automatically via postinstall or manually: node scripts/patch-react-draggable.js
 */
const fs = require('fs');
const path = require('path');

const patches = [
  {
    file: 'node_modules/react-draggable/build/cjs/Draggable.js',
    from: 'return this.props?.nodeRef?.current ?? _reactDom.default.findDOMNode(this);',
    to: 'return this.props?.nodeRef ? this.props.nodeRef.current : (_reactDom.default.findDOMNode ? _reactDom.default.findDOMNode(this) : null);',
  },
  {
    file: 'node_modules/react-draggable/build/cjs/DraggableCore.js',
    from: 'return this.props?.nodeRef ? this.props?.nodeRef?.current : _reactDom.default.findDOMNode(this);',
    to: 'return this.props?.nodeRef ? this.props?.nodeRef?.current : (_reactDom.default.findDOMNode ? _reactDom.default.findDOMNode(this) : null);',
  },
];

let patched = 0;
for (const { file, from, to } of patches) {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(from)) {
    content = content.replace(from, to);
    fs.writeFileSync(filePath, content, 'utf8');
    patched++;
    console.log(`Patched: ${file}`);
  } else if (content.includes(to)) {
    console.log(`Already patched: ${file}`);
  } else {
    console.warn(`Could not find expected code in: ${file}`);
  }
}
console.log(`react-draggable patch complete (${patched} file(s) patched)`);
