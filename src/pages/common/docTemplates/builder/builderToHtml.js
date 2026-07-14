/**
 * Pure function: builder_json -> { html_content, css_content }
 * Generates Handlebars-compatible HTML that the backend renderTemplateHTML can process.
 */
import { BLOCK_TYPES } from './builderConstants';

function esc(str) {
    return (str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Individual block HTML generators ──

function headerHtml(block) {
    const c = block.content || {};
    const lines = (c.subtitleLines || []).map(l => `<p class="header-sub">${l}</p>`).join('\n    ');
    let logoHtml = '';
    if (c.showLogo) {
        logoHtml = `{{#if company.logo}}<img src="{{company.logo}}" class="header-logo" style="max-height:${c.logoMaxHeight || '60px'}" />{{/if}}`;
    }
    if (c.showLogo && c.logoPosition === 'left') {
        return `<table class="${block.id} header-block header-with-logo"><tr>
    <td class="header-logo-cell">${logoHtml}</td>
    <td class="header-text-cell">
        <h2 class="header-title">${c.titleText || ''}</h2>
        ${lines}
    </td>
</tr></table>`;
    }
    return `<div class="${block.id} header-block">
    ${logoHtml}
    <h2 class="header-title">${c.titleText || ''}</h2>
    ${lines}
</div>`;
}

function companyInfoHtml(block) {
    const c = block.content || {};
    const lines = (c.subtitleLines || []).map(l => `<p>${l}</p>`).join('\n    ');
    let logoHtml = '';
    if (c.showLogo) {
        logoHtml = `{{#if company.logo}}<img src="{{company.logo}}" class="header-logo" style="max-height:${c.logoMaxHeight || '60px'}" />{{/if}}`;
    }
    if (c.showLogo && c.logoPosition === 'left') {
        return `<table class="${block.id} company-info-block header-with-logo"><tr>
    <td class="header-logo-cell">${logoHtml}</td>
    <td class="header-text-cell">
        <h3>${c.titleText || '{{company.name}}'}</h3>
        ${lines}
    </td>
</tr></table>`;
    }
    return `<div class="${block.id} company-info-block">
    ${logoHtml}
    <h3>${c.titleText || '{{company.name}}'}</h3>
    ${lines}
</div>`;
}

function documentInfoHtml(block) {
    const c = block.content || {};
    const fields = (c.fields || []).map(f => {
        let row = `<p><strong>${esc(f.label)}:</strong> ${f.value}</p>`;
        if (f.conditional) row = `{{#if ${f.conditional}}}${row}{{/if}}`;
        return row;
    }).join('\n    ');
    return `<div class="${block.id} doc-info-block">
    ${fields}
</div>`;
}

function customerInfoHtml(block) {
    const c = block.content || {};
    const fields = (c.fields || []).map(f => {
        const boldOpen = f.bold ? '<strong>' : '';
        const boldClose = f.bold ? '</strong>' : '';
        let row = `<p>${boldOpen}${esc(f.label)}: ${f.value}${boldClose}</p>`;
        if (f.conditional) row = `{{#if ${f.conditional}}}${row}{{/if}}`;
        if (f.sectionTag) row = `<!--section-start:${f.sectionTag}-->${row}<!--section-end:${f.sectionTag}-->`;
        return row;
    }).join('\n    ');

    let html = `<div class="${block.id} customer-info-block">
    ${fields}
</div>`;

    if (c.conditionalWrap) {
        html = `{{#if ${c.conditionalWrap}}}\n${html}\n{{/if}}`;
    }
    return html;
}

function itemsTableHtml(block) {
    const c = block.content || {};
    const cols = c.columns || [];

    const thCells = cols.map(col =>
        `<th style="width:${col.width || 'auto'};text-align:${col.align || 'left'}">${esc(col.label)}</th>`
    ).join('\n        ');

    const tdCells = cols.map(col =>
        `<td style="text-align:${col.align || 'left'}">{{${col.key}}}</td>`
    ).join('\n        ');

    let serialRow = '';
    if (c.showSerialNumbers) {
        serialRow = `\n      {{#if this.serial_numbers}}\n      <tr><td colspan="${cols.length}" class="serial-row">S/N: {{this.serial_numbers}}</td></tr>\n      {{/if}}`;
    }

    return `<table class="${block.id} items-table">
    <thead>
      <tr>
        ${thCells}
      </tr>
    </thead>
    <tbody>
      {{#each ${c.loopKey || 'items'}}}
      <tr>
        ${tdCells}
      </tr>${serialRow}
      {{/each}}
    </tbody>
</table>`;
}

function taxSummaryHtml(block) {
    const c = block.content || {};
    const thCells = ['<th>HSN</th>', '<th>Taxable Value</th>'];
    const tdCells = ['<td>{{this.hsn}}</td>', '<td>{{this.taxable_value}}</td>'];
    if (c.showCGST) {
        thCells.push('<th>CGST %</th>', '<th>CGST Amt</th>');
        tdCells.push('<td>{{this.cgst_rate}}</td>', '<td>{{this.cgst_amount}}</td>');
    }
    if (c.showSGST) {
        thCells.push('<th>SGST %</th>', '<th>SGST Amt</th>');
        tdCells.push('<td>{{this.sgst_rate}}</td>', '<td>{{this.sgst_amount}}</td>');
    }
    if (c.showIGST) {
        thCells.push('<th>IGST %</th>', '<th>IGST Amt</th>');
        tdCells.push('<td>{{this.igst_rate}}</td>', '<td>{{this.igst_amount}}</td>');
    }
    thCells.push('<th>Tax Amt</th>');
    tdCells.push('<td>{{this.tax_amount}}</td>');

    return `<table class="${block.id} tax-summary-table">
    <thead>
      <tr>${thCells.join('')}</tr>
    </thead>
    <tbody>
      {{#each tax_summary}}
      <tr>${tdCells.join('')}</tr>
      {{/each}}
    </tbody>
</table>`;
}

function totalsHtml(block) {
    const c = block.content || {};
    const rows = (c.rows || []).map(r => {
        const cls = r.bold ? 'total-row total-grand' : 'total-row';
        const style = r.fontSize ? ` style="font-size:${r.fontSize}"` : '';
        let row = `<div class="${cls}"${style}><span>${esc(r.label)}</span><span>${r.value}</span></div>`;
        if (r.conditional) row = `{{#if ${r.conditional}}}${row}{{/if}}`;
        return row;
    }).join('\n    ');

    return `<div class="${block.id} totals-block">
    ${rows}
</div>`;
}

function paymentsHtml(block) {
    const c = block.content || {};
    const loopKey = c.loopKey || 'payments.splits';
    const staticRows = (c.rows || []).map(r => {
        let row = `<div class="total-row"><span>${esc(r.label)}</span><span>${r.value}</span></div>`;
        if (r.conditional) row = `{{#if ${r.conditional}}}${row}{{/if}}`;
        return row;
    }).join('\n    ');

    return `<div class="${block.id} payments-block">
    {{#each ${loopKey}}}
    <div class="total-row"><span>{{this.type}}</span><span>{{this.amount}}</span></div>
    {{/each}}
    ${staticRows}
</div>`;
}

function signatureHtml(block) {
    const c = block.content || {};
    return `<table class="${block.id} signature-block"><tr>
    <td class="sig-left">
        <div class="sig-line"></div>
        <p>${c.leftLabel || 'Customer Signature'}</p>
    </td>
    <td class="sig-right">
        <div class="sig-line"></div>
        <p>${c.rightLabel || 'Authorized Signatory'}</p>
    </td>
</tr></table>`;
}

function termsHtml(block) {
    const c = block.content || {};
    return `<div class="${block.id} terms-block">
    <p class="section-label"><strong>Terms & Conditions</strong></p>
    <p>${c.text || ''}</p>
</div>`;
}

function bankDetailsHtml(block) {
    const c = block.content || {};
    if (c.fields && c.fields.length) {
        const rows = c.fields.map(f => `<p><strong>${esc(f.label)}:</strong> ${f.value}</p>`).join('\n    ');
        return `<div class="${block.id} bank-details-block">
    <p class="section-label"><strong>Bank Details</strong></p>
    ${rows}
</div>`;
    }
    return `<div class="${block.id} bank-details-block">
    <p class="section-label"><strong>Bank Details</strong></p>
    <p>${c.text || ''}</p>
</div>`;
}

function footerHtml(block) {
    const c = block.content || {};
    return `<div class="${block.id} footer-block">
    <p>${c.text || ''}</p>
</div>`;
}

function customTextHtml(block) {
    const c = block.content || {};
    return `<div class="${block.id} custom-text-block">
    ${c.html || ''}
</div>`;
}

function dividerHtml(block) {
    return `<div class="${block.id} divider-block"></div>`;
}

function spacerHtml(block) {
    const height = block.styles?.height || '16px';
    return `<div class="${block.id} spacer-block" style="height:${height}"></div>`;
}

function shippingInfoHtml(block) {
    const c = block.content || {};
    const fields = (c.fields || []).map(f => {
        const boldOpen = f.bold ? '<strong>' : '';
        const boldClose = f.bold ? '</strong>' : '';
        let row = `<p>${boldOpen}${esc(f.label)}: ${f.value}${boldClose}</p>`;
        if (f.conditional) row = `{{#if ${f.conditional}}}${row}{{/if}}`;
        return row;
    }).join('\n    ');

    let html = `<div class="${block.id} shipping-info-block">
    <p class="section-label"><strong>Ship To</strong></p>
    ${fields}
</div>`;
    if (c.conditionalWrap) {
        html = `{{#if ${c.conditionalWrap}}}\n${html}\n{{/if}}`;
    }
    return html;
}

function eInvoiceHtml(block) {
    const c = block.content || {};
    const fields = (c.fields || []).map(f =>
        `<p><strong>${esc(f.label)}:</strong> ${f.value}</p>`
    ).join('\n    ');
    return `<div class="${block.id} e-invoice-block">
    <p class="section-label"><strong>E-Invoice Details</strong></p>
    ${fields}
</div>`;
}

function amountInWordsHtml(block) {
    const c = block.content || {};
    return `<div class="${block.id} amount-words-block">
    <p><strong>${c.prefix || 'Amount in Words: '}</strong>${c.text || '{{totals.amount_in_words}}'}</p>
</div>`;
}

function declarationHtml(block) {
    const c = block.content || {};
    return `<div class="${block.id} declaration-block">
    <p class="section-label"><strong>${c.title || 'Declaration'}</strong></p>
    <p>${c.text || ''}</p>
</div>`;
}

function qrCodeHtml(block) {
    const c = block.content || {};
    const align = c.alignment || 'right';
    return `<div class="${block.id} qr-code-block" style="text-align:${align}">
    {{#if ${(c.placeholder || '{{document.qr_data}}').replace(/\{\{|\}\}/g, '')}}}
    <img src="${c.placeholder || '{{document.qr_data}}'}" style="width:${c.size || '120px'};height:${c.size || '120px'}" />
    {{/if}}
</div>`;
}

function rowHtml(block) {
    const c = block.content || {};
    const children = c.children || [];
    const colCount = c.columns || children.length || 2;
    const gap = c.gap || '16px';
    const colWidth = `${(100 / colCount).toFixed(1)}%`;

    const cells = children.map(child => {
        const childHtml = blockToHtml(child);
        return `<td style="width:${colWidth};vertical-align:top;padding:0 ${parseInt(gap)/2}px">${childHtml}</td>`;
    }).join('\n    ');

    return `<table class="${block.id} row-block" style="width:100%;border-collapse:collapse">
    <tr>
    ${cells}
    </tr>
</table>`;
}

// ── Block HTML router ──

const blockGenerators = {
    header: headerHtml,
    company_info: companyInfoHtml,
    document_info: documentInfoHtml,
    customer_info: customerInfoHtml,
    shipping_info: shippingInfoHtml,
    e_invoice: eInvoiceHtml,
    items_table: itemsTableHtml,
    tax_summary: taxSummaryHtml,
    totals: totalsHtml,
    amount_in_words: amountInWordsHtml,
    payments: paymentsHtml,
    signature: signatureHtml,
    declaration: declarationHtml,
    terms: termsHtml,
    bank_details: bankDetailsHtml,
    qr_code: qrCodeHtml,
    footer: footerHtml,
    custom_text: customTextHtml,
    divider: dividerHtml,
    spacer: spacerHtml,
    row: rowHtml,
};

function blockToHtml(block) {
    const gen = blockGenerators[block.type];
    if (!gen) return `<!-- unknown block type: ${block.type} -->`;
    return gen(block);
}

// ── CSS generation ──

function generateCss(builderJson) {
    const ps = builderJson.pageStyles || {};
    const isThermal = (ps.paperWidth || '').includes('mm') && parseInt(ps.paperWidth) < 100;

    let css = `/* Auto-generated by Visual Template Builder */
.template-root {
    font-family: ${ps.fontFamily || 'Arial, sans-serif'};
    font-size: ${ps.fontSize || '12px'};
    line-height: ${ps.lineHeight || '1.4'};
    color: ${ps.color || '#333'};
    width: ${ps.paperWidth || '210mm'};
    margin: 0 auto;
    padding: ${isThermal ? '2mm' : '8mm'};
}
.header-block { margin-bottom: 6px; }
.header-title { margin: 0; font-size: ${isThermal ? '14px' : '18px'}; }
.header-sub { margin: 1px 0; font-size: ${isThermal ? '10px' : '11px'}; color: #555; }
.doc-info-block p, .customer-info-block p { margin: 2px 0; }
.section-label { margin: 4px 0 2px; }
.items-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
.items-table th { border-bottom: ${isThermal ? '1px solid #000' : '2px solid #333'}; padding: ${isThermal ? '2px 1px' : '4px 6px'}; font-size: ${isThermal ? '9px' : '11px'}; font-weight: 600; }
.items-table td { padding: ${isThermal ? '2px 1px' : '3px 6px'}; border-bottom: 1px solid #eee; vertical-align: top; }
.serial-row { font-size: ${isThermal ? '9px' : '10px'}; color: #666; padding-left: 16px !important; }
.total-row { display: flex; justify-content: space-between; padding: 1px 0; }
.total-grand { font-weight: bold; font-size: ${isThermal ? '13px' : '14px'}; border-top: 1px solid #333; margin-top: 2px; padding-top: 2px; }
.totals-block, .payments-block { margin: 4px 0; }
.tax-summary-table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: ${isThermal ? '9px' : '10px'}; }
.tax-summary-table th { border-bottom: 1px solid #333; padding: 2px 4px; font-weight: 600; text-align: right; }
.tax-summary-table th:first-child { text-align: left; }
.tax-summary-table td { padding: 2px 4px; border-bottom: 1px solid #eee; text-align: right; }
.tax-summary-table td:first-child { text-align: left; }
.signature-block { width: 100%; border-collapse: collapse; margin-top: 30px; }
.sig-left, .sig-right { text-align: center; width: 40%; vertical-align: bottom; }
.sig-line { border-bottom: 1px solid #333; height: 30px; margin-bottom: 4px; }
.signature-block p { font-size: 10px; margin: 0; }
.terms-block { font-size: ${isThermal ? '9px' : '10px'}; }
.bank-details-block { font-size: 10px; margin: 8px 0; }
.footer-block { margin-top: 4px; }
.divider-block { border-top: ${isThermal ? '1px dashed #000' : '1px solid #ddd'}; margin: ${isThermal ? '3px 0' : '6px 0'}; }
.spacer-block { }
.shipping-info-block p { margin: 2px 0; }
.e-invoice-block p { margin: 2px 0; font-size: ${isThermal ? '9px' : '10px'}; }
.amount-words-block { margin: 4px 0; font-size: ${isThermal ? '10px' : '11px'}; font-style: italic; }
.declaration-block { font-size: ${isThermal ? '9px' : '10px'}; margin: 8px 0; }
.qr-code-block { margin: 4px 0; }
.row-block { margin: 0; }
.header-with-logo { width: 100%; border-collapse: collapse; }
.header-logo-cell { width: 80px; vertical-align: middle; padding-right: 8px; }
.header-logo { max-width: 80px; }
.header-text-cell { vertical-align: middle; }
`;

    // Per-block custom styles (including row children)
    const allBlocks = [];
    (builderJson.blocks || []).forEach(block => {
        allBlocks.push(block);
        if (block.type === 'row' && block.content?.children) {
            block.content.children.forEach(child => allBlocks.push(child));
        }
    });
    allBlocks.forEach(block => {
        if (!block.styles || Object.keys(block.styles).length === 0) return;
        const s = block.styles;
        const props = Object.entries(s)
            .filter(([, v]) => v !== '' && v !== undefined && v !== null)
            .map(([k, v]) => `    ${camelToKebab(k)}: ${v};`)
            .join('\n');
        if (props) {
            css += `.${block.id} { \n${props}\n}\n`;
        }
    });

    return css;
}

function camelToKebab(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// ── Main export ──

export default function builderToHtml(builderJson) {
    if (!builderJson || !builderJson.blocks) {
        return { html_content: '', css_content: '' };
    }

    const htmlParts = [];
    htmlParts.push('<div class="template-root">');

    builderJson.blocks.forEach(block => {
        if (!block.enabled) return;

        const sectionTag = block.sectionTag || BLOCK_TYPES[block.type]?.sectionTag;
        let blockHtml = blockToHtml(block);

        if (sectionTag) {
            blockHtml = `<!--section-start:${sectionTag}-->\n${blockHtml}\n<!--section-end:${sectionTag}-->`;
        }

        htmlParts.push(blockHtml);
    });

    htmlParts.push('</div>');

    return {
        html_content: htmlParts.join('\n\n'),
        css_content: generateCss(builderJson),
    };
}
