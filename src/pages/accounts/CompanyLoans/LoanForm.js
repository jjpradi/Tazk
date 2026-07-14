import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { OpenalertActions } from '../../../redux/actions/alert_actions';
import {
  Box, Card, Typography, Button, IconButton, TextField, MenuItem,
  Switch, FormControlLabel, CircularProgress, Divider, Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CompanyLoansService from '../../../services/companyLoans_services';
import moment from 'moment';

// Lender types determine TDS and accounting head
const LENDER_TYPES = [
  { value: 1, label: 'Bank' },
  { value: 0, label: 'NBFC' },
  { value: 2, label: 'Individual (Director/Partner)' },
  { value: 3, label: 'Group Company' },
];

// Loan types with config for which fields to show
const LOAN_TYPE_CONFIG = {
  'Business Loan':      { lenders: [0,1], secured: true,  hasProcessingFee: true,  hasInsurance: false, hasSanction: true,  hasSecurity: true,  hasGuarantor: true  },
  'Vehicle Loan':       { lenders: [0,1], secured: true,  hasProcessingFee: true,  hasInsurance: true,  hasSanction: true,  hasSecurity: true,  hasGuarantor: true  },
  'Working Capital':    { lenders: [0,1], secured: true,  hasProcessingFee: true,  hasInsurance: false, hasSanction: true,  hasSecurity: true,  hasGuarantor: false },
  'Personal Loan':      { lenders: [0,1], secured: false, hasProcessingFee: true,  hasInsurance: false, hasSanction: true,  hasSecurity: false, hasGuarantor: false },
  'Gold Loan':          { lenders: [0,1], secured: true,  hasProcessingFee: true,  hasInsurance: false, hasSanction: true,  hasSecurity: true,  hasGuarantor: false },
  'Property Loan':      { lenders: [0,1], secured: true,  hasProcessingFee: true,  hasInsurance: true,  hasSanction: true,  hasSecurity: true,  hasGuarantor: true  },
  'Equipment Loan':     { lenders: [0,1], secured: true,  hasProcessingFee: true,  hasInsurance: true,  hasSanction: true,  hasSecurity: true,  hasGuarantor: false },
  'Director Loan':      { lenders: [2],   secured: false, hasProcessingFee: false, hasInsurance: false, hasSanction: false, hasSecurity: false, hasGuarantor: false },
  'Inter-Company Loan': { lenders: [3],   secured: false, hasProcessingFee: false, hasInsurance: false, hasSanction: false, hasSecurity: false, hasGuarantor: false },
};

const INTEREST_TYPES = [
  { value: 'reducing', label: 'Reducing Balance' },
  { value: 'fixed', label: 'Fixed Rate' },
  { value: 'floating', label: 'Floating Rate' },
];

// Repayment mode
const REPAYMENT_MODES = [
  { value: 'emi', label: 'Fixed EMI (Monthly)' },
  { value: 'lump_sum', label: 'Lump Sum at Maturity' },
  { value: 'interest_only', label: 'Interest Only (Principal at End)' },
];

const PDF_LOAN_TYPE_MAP = {
  'used car loan': 'Vehicle Loan', 'new car loan': 'Vehicle Loan', 'car loan': 'Vehicle Loan',
  'auto loan': 'Vehicle Loan', 'vehicle loan': 'Vehicle Loan', 'two wheeler loan': 'Vehicle Loan',
  'home loan': 'Property Loan', 'housing loan': 'Property Loan', 'mortgage loan': 'Property Loan',
  'loan against property': 'Property Loan', 'lap loan': 'Property Loan',
  'gold loan': 'Gold Loan', 'personal loan': 'Personal Loan',
  'business loan': 'Business Loan', 'business loans': 'Business Loan',
  'msme loan': 'Business Loan', 'sme loan': 'Business Loan',
  'working capital': 'Working Capital', 'working capital loan': 'Working Capital',
  'overdraft': 'Working Capital', 'overdraft facility': 'Working Capital',
  'cash credit': 'Working Capital', 'cc facility': 'Working Capital',
  'od facility': 'Working Capital', 'machinery loan': 'Equipment Loan',
  'equipment loan': 'Equipment Loan', 'equipment finance': 'Equipment Loan',
};

const matchLoanType = (val) => {
  const v = String(val).trim().toLowerCase();
  if (v.length < 4) return null;
  const types = Object.keys(LOAN_TYPE_CONFIG);
  let matched = null;
  let matchType = '';

  if (PDF_LOAN_TYPE_MAP[v]) { matched = PDF_LOAN_TYPE_MAP[v]; matchType = 'exact-map'; }

  if (!matched) {
    const partialKey = Object.keys(PDF_LOAN_TYPE_MAP).find((k) => v.includes(k));
    if (partialKey) { matched = PDF_LOAN_TYPE_MAP[partialKey]; matchType = `partial-map: "${partialKey}"`; }
  }

  if (!matched) {
    const exact = types.find((t) => t.toLowerCase() === v);
    if (exact) { matched = exact; matchType = 'exact-config'; }
  }

  if (!matched) {
    const partial = types.find((t) => v.includes(t.toLowerCase()));
    if (partial) { matched = partial; matchType = `partial-config: "${partial}"`; }
  }
  if (matched) console.log(`matchLoanType("${val}") → "${matched}" [${matchType}]`);
  return matched;
};

const WORD_TO_NUM = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100,
};

const parseTenure = (val) => {
  if (!val) return null;
  const s = String(val).trim().toLowerCase();

  const directNum = s.match(/^(\d+)(?:\.\d+)?$/);
  if (directNum) return parseInt(directNum[1]);

  const numMonths = s.match(/(\d+)\s*(?:months?|mon|mos?)/i);
  if (numMonths) return parseInt(numMonths[1]);

  const numYears = s.match(/(\d+)\s*(?:years?|yrs?)/i);
  if (numYears) return parseInt(numYears[1]) * 12;

  const yearMonth = s.match(/(\d+)\s*(?:years?|yrs?)\s*(?:and\s*)?(\d+)\s*(?:months?|mon)/i);
  if (yearMonth) return parseInt(yearMonth[1]) * 12 + parseInt(yearMonth[2]);

  let total = 0;
  const words = s.replace(/[^a-z\s]/g, '').split(/\s+/);
  for (const w of words) {
    if (WORD_TO_NUM[w]) total += WORD_TO_NUM[w];
  }
  if (total > 0) {
    if (/years?|yrs?/.test(s)) return total * 12;
    return total;
  }

  return null;
};

const loadPdfJsFromCDN = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load pdf.js'));
    document.head.appendChild(script);
  });
};

const extractFromPdf = async (file) => {
  const pdfjs = await loadPdfJsFromCDN();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const rawTexts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach((item) => {
      if (item.str && item.str.trim()) rawTexts.push(item.str.trim());
    });
  }

  const allTexts = [];
  for (let i = 0; i < rawTexts.length; i++) {
    const curr = rawTexts[i];
    const next = rawTexts[i + 1];

    if (next && /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{1,3}$/.test(curr) && /^\d{1,2}$/.test(next)) {
      const merged = curr + next;
      if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(merged)) {
        allTexts.push(merged);
        i++;
        continue;
      }
    }

    if (/^\d+$/.test(curr)) {
      let merged = curr;
      let validMerged = null;
      let validLen = 0;
      const amountRegex = /^\d{1,3}(,\d{2,3})+\.\d{2}$/;
      for (let j = i + 1; j < rawTexts.length && j < i + 6; j++) {
        const piece = rawTexts[j];
        if (piece === ',' || piece === '.' || /^\d+\.?\d*$/.test(piece)) {
          merged += piece;
          if (amountRegex.test(merged)) {
            validMerged = merged;
            validLen = j - i + 1;
          }
        } else break;
      }
      if (validMerged) {
        allTexts.push(validMerged);
        i += validLen - 1;
        continue;
      }
    }

    allTexts.push(curr);
  }

  const joined = allTexts.join(' ');
  const result = {};

  const loanTypeLabelRegex = /^(Loan\s*Type|Product\s*Description|Loan\s*Category|Loan\s*Product|Scheme\s*Name):?$/i;
  const loanTypeLabelIdx = allTexts.findIndex((t) => loanTypeLabelRegex.test(t));
  if (loanTypeLabelIdx !== -1) {
    for (let i = loanTypeLabelIdx - 1; i >= 0 && i >= loanTypeLabelIdx - 10; i--) {
      const matched = matchLoanType(allTexts[i]);
      if (matched) { result.loan_types = matched; break; }
    }
    if (!result.loan_types) {
      for (let i = loanTypeLabelIdx + 1; i < allTexts.length && i <= loanTypeLabelIdx + 5; i++) {
        const matched = matchLoanType(allTexts[i]);
        if (matched) { result.loan_types = matched; break; }
      }
    }
  }

  if (!result.loan_types && /Product\s*Description|Loan\s*Type|Loan\s*Category/i.test(joined)) {
    for (const t of allTexts) {
      const matched = matchLoanType(t);
      if (matched) { result.loan_types = matched; break; }
    }
  }

  if (!result.loan_types) {
    for (const t of allTexts) {
      const matched = matchLoanType(t);
      if (matched) { result.loan_types = matched; break; }
    }
  }

  const hasTenureLabel = /T\s*enur\s*e/i.test(joined);
  if (hasTenureLabel) {
    for (let i = 0; i < Math.min(allTexts.length, 20); i++) {
      const parsed = parseTenure(allTexts[i]);
      if (parsed && parsed > 0 && parsed <= 360) {
        result.tenor_of_loan = String(parsed);
        break;
      }
    }
  }

  if (!result.tenor_of_loan) {
    for (let i = 0; i < allTexts.length; i++) {
      if (/total\s*instl|total\s*installment|total\s*instalment/i.test(allTexts[i])) {
        for (let j = i + 1; j < allTexts.length && j <= i + 5; j++) {
          const parsed = parseTenure(allTexts[j]);
          if (parsed && parsed > 0 && parsed <= 360) {
            result.tenor_of_loan = String(parsed);
            break;
          }
        }
        if (!result.tenor_of_loan) {
          for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
            const parsed = parseTenure(allTexts[j]);
            if (parsed && parsed > 0 && parsed <= 360) {
              result.tenor_of_loan = String(parsed);
              break;
            }
          }
        }
        if (result.tenor_of_loan) break;
      }
    }

    if (!result.tenor_of_loan) {
      for (let i = 0; i < allTexts.length; i++) {
        if (/tenure|tenor|period|term/i.test(allTexts[i])) {
          for (let j = i + 1; j < allTexts.length && j <= i + 5; j++) {
            const parsed = parseTenure(allTexts[j]);
            if (parsed && parsed > 0 && parsed <= 360) {
              result.tenor_of_loan = String(parsed);
              break;
            }
          }
          if (!result.tenor_of_loan) {
            for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
              const parsed = parseTenure(allTexts[j]);
              if (parsed && parsed > 0 && parsed <= 360) {
                result.tenor_of_loan = String(parsed);
                break;
              }
            }
          }
          if (result.tenor_of_loan) break;
        }
      }
    }
  }

  const isValidAccountNo = (t) => {
    if (t.length < 6) return false;

    if (!/\d/.test(t)) return false;

    if (!/^[A-Z0-9\-]+$/i.test(t)) return false;

    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(t)) return false;

    if (/@|\.com|\.in|\.org|\.net/i.test(t)) return false;

    if (/^\d{10,14}$/.test(t)) return false;
    return true;
  };

  const hasAcctLabel = /loan\s*account|account\s*(?:#|no|number)|reement\s*no|agreement/i.test(joined);
  if (hasAcctLabel) {
    const candidates = [];
    for (let i = 0; i < allTexts.length; i++) {
      const single = allTexts[i];
      if (isValidAccountNo(single)) candidates.push(single);
      if (i + 1 < allTexts.length && single.length <= 2 && /^[A-Z]+$/i.test(single)) {
        const next = allTexts[i + 1];
        if (/^[A-Z0-9]+$/i.test(next) && /\d/.test(next)) {
          const merged = single + next;
          if (isValidAccountNo(merged)) candidates.push(merged);
        }
      }
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.length - a.length);
      result.loan_account_number = candidates[0];
    }
  }

  const parseAmount = (t) => {
    const cleaned = String(t).replace(/,/g, '').replace(/INR|₹|Rs\.?/gi, '').trim();
    const match = cleaned.match(/^(\d+(?:\.\d+)?)$/);
    if (!match) return null;
    const num = parseFloat(match[1]);
    if (num >= 1000 && num <= 1000000000) return num;
    return null;
  };

  const amountLabelRegex = /(?:amount\s*financed|mount\s*financed|sanctioned\s*amount|disbursed\s*amount|loan\s*amount|principal\s*amount|financed\s*amount)/i;
  const amountLabelIdx = allTexts.findIndex((t) => amountLabelRegex.test(t));
  console.log('Amount label search: index =', amountLabelIdx, 'text =', amountLabelIdx !== -1 ? allTexts[amountLabelIdx] : 'not found');

  if (amountLabelIdx !== -1) {
    const amountCandidates = [];
    for (let j = Math.max(0, amountLabelIdx - 50); j <= Math.min(allTexts.length - 1, amountLabelIdx + 5); j++) {
      if (j === amountLabelIdx) continue;
      const parsed = parseAmount(allTexts[j]);
      if (parsed) {
        amountCandidates.push({ value: parsed, dist: Math.abs(j - amountLabelIdx), text: allTexts[j] });
      }
    }
    console.log('Amount candidates near label:', amountCandidates);
    if (amountCandidates.length > 0) {
      amountCandidates.sort((a, b) => a.dist - b.dist);
      result.net_amount = String(amountCandidates[0].value);
    }
  }

  if (!result.net_amount) {
    const hasAmountKeyword = /amount\s*financed|sanctioned\s*amount|disbursed\s*amount|loan\s*amount|financed/i.test(joined);
    console.log('Amount keyword in joined text:', hasAmountKeyword);
    if (hasAmountKeyword) {
      const allAmounts = [];
      for (const t of allTexts) {
        const parsed = parseAmount(t);
        if (parsed) allAmounts.push(parsed);
      }
      console.log('All amounts found in PDF:', allAmounts);
      if (allAmounts.length > 0) {
        const uniqueAmounts = [...new Set(allAmounts)];
        uniqueAmounts.sort((a, b) => b - a);
        result.net_amount = String(uniqueAmounts.length > 1 ? uniqueAmounts[1] : uniqueAmounts[0]);
      }
    }
  }

  const amountCounts = {};
  for (const t of allTexts) {
    const parsed = parseAmount(t);
    if (parsed && parsed >= 500 && parsed < 1000000) {
      amountCounts[parsed] = (amountCounts[parsed] || 0) + 1;
    }
  }
  let mostRepeated = null;
  let maxCount = 0;
  for (const [amt, count] of Object.entries(amountCounts)) {
    if (count > maxCount && count >= 3) {
      maxCount = count;
      mostRepeated = parseFloat(amt);
    }
  }
  console.log('EMI detection - amount counts:', amountCounts, 'most repeated:', mostRepeated, '×', maxCount);
  if (mostRepeated) {
    result.EMI_amount = String(mostRepeated);
    console.log('EMI_amount set to:', mostRepeated);
  }

  const parseRate = (t) => {
    const cleaned = String(t).replace(/%|APR|p\.a\.?|per\s*annum/gi, '').trim();
    const match = cleaned.match(/^(\d+(?:\.\d+)?)$/);
    if (!match) return null;
    const num = parseFloat(match[1]);
    if (num >= 0.01 && num <= 50) return num;
    return null;
  };

  const rateLabelRegex = /current\s*rate\s*of\s*interest|rate\s*of\s*interest|interest\s*rate|roi|rate\s*type/i;
  const rateLabelIdx = allTexts.findIndex((t) => rateLabelRegex.test(t));
  if (rateLabelIdx !== -1) {
    const rateCandidates = [];
    for (let j = Math.max(0, rateLabelIdx - 10); j <= Math.min(allTexts.length - 1, rateLabelIdx + 10); j++) {
      if (j === rateLabelIdx) continue;
      const parsed = parseRate(allTexts[j]);
      if (parsed) rateCandidates.push({ value: parsed, dist: Math.abs(j - rateLabelIdx) });
    }
    if (rateCandidates.length > 0) {
      rateCandidates.sort((a, b) => a.dist - b.dist);
      result.ROI_amount = String(rateCandidates[0].value);
    }
  }

  console.log('ROI fallback check:', {
    hasROI: !!result.ROI_amount,
    net_amount: result.net_amount,
    tenor: result.tenor_of_loan,
    EMI: result.EMI_amount,
  });
  if (!result.ROI_amount && result.net_amount && result.tenor_of_loan && result.EMI_amount) {
    const P = Number(result.net_amount);
    const n = Number(result.tenor_of_loan);
    const emi = Number(result.EMI_amount);
    console.log('ROI calc inputs:', { P, n, emi, totalPayable: emi * n });
    if (P > 0 && n > 0 && emi > 0 && emi * n > P) {
      let low = 0;
      let high = 0.05;
      let rate = 0;
      for (let iter = 0; iter < 100; iter++) {
        rate = (low + high) / 2;
        const calculated = rate === 0 ? P / n : (P * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
        if (Math.abs(calculated - emi) < 0.5) break;
        if (calculated < emi) low = rate;
        else high = rate;
      }
      const annualRate = Math.round(rate * 12 * 100 * 100) / 100;
      console.log('ROI binary search result:', { rate, annualRate });
      if (annualRate >= 0.01 && annualRate <= 50) {
        result.ROI_amount = String(annualRate);
        console.log('ROI calculated and set:', annualRate);
      }
    } else {
      console.log('ROI calc skipped - invalid inputs');
    }
  } else {
    console.log('ROI fallback skipped - missing required fields or rate already set');
  }

  const BANK_KEYWORDS = /\bbank\b|\bbanking\b/i;
  const NBFC_KEYWORDS = /\bnbfc\b|\bfinance\b|\bfinancial\s*services\b/i;

  const KNOWN_LENDERS = [
    { match: /\bICICI\b/i, name: 'ICICI Bank', type: 1 },
    { match: /\bHDFC\b/i, name: 'HDFC Bank', type: 1 },
    { match: /\bSBI\b|state\s*bank\s*of\s*india/i, name: 'State Bank of India', type: 1 },
    { match: /\bAXIS\b|axis\s*bank/i, name: 'Axis Bank', type: 1 },
    { match: /\bkotak\b/i, name: 'Kotak Mahindra Bank', type: 1 },
    { match: /\byes\s*bank\b/i, name: 'Yes Bank', type: 1 },
    { match: /\bIDFC\b/i, name: 'IDFC First Bank', type: 1 },
    { match: /\bIDBI\b/i, name: 'IDBI Bank', type: 1 },
    { match: /\bPNB\b|punjab\s*national\s*bank/i, name: 'Punjab National Bank', type: 1 },
    { match: /bank\s*of\s*baroda|\bBOB\b/i, name: 'Bank of Baroda', type: 1 },
    { match: /\bcanara\s*bank\b/i, name: 'Canara Bank', type: 1 },
    { match: /\bUnion\s*Bank\b/i, name: 'Union Bank of India', type: 1 },
    { match: /\bUSFB\b|unity\s*small\s*finance|theunitybank/i, name: 'Unity Small Finance Bank', type: 1 },
    { match: /\bindusind\b/i, name: 'IndusInd Bank', type: 1 },
    { match: /\bfederal\s*bank\b/i, name: 'Federal Bank', type: 1 },
    { match: /\bRBL\b/i, name: 'RBL Bank', type: 1 },
    { match: /\bshriram\b/i, name: 'Shriram Finance', type: 0 },
    { match: /\bbajaj\s*finance\b|\bbajaj\s*finserv\b/i, name: 'Bajaj Finance', type: 0 },
    { match: /\bmuthoot\b/i, name: 'Muthoot Finance', type: 0 },
    { match: /\bmahindra\s*finance\b/i, name: 'Mahindra Finance', type: 0 },
    { match: /\bL\s*&\s*T\s*finance\b/i, name: 'L&T Finance', type: 0 },
    { match: /\btata\s*capital\b/i, name: 'Tata Capital', type: 0 },
    { match: /\bcholamandalam\b/i, name: 'Cholamandalam Investment & Finance', type: 0 },
    { match: /\bhero\s*fincorp\b/i, name: 'Hero FinCorp', type: 0 },
  ];

  for (const lender of KNOWN_LENDERS) {
    if (lender.match.test(joined)) {
      result.bank_name = lender.name;
      result.type = lender.type;
      console.log('Lender matched (known):', lender.name);
      break;
    }
  }

  if (!result.bank_name) {
    const bankMatch = joined.match(/([A-Z][A-Za-z&]+(?:\s+[A-Z][A-Za-z&]+){0,3})\s+(?:BANK|Bank)(?:\s*(?:Ltd\.?|Limited|LTD\.?))?/);
    if (bankMatch && bankMatch[0].length >= 5 && bankMatch[0].length <= 50) {
      result.bank_name = bankMatch[0].replace(/\s+/g, ' ').trim();
      result.type = 1;
      console.log('Lender matched (generic bank):', result.bank_name);
    } else {
      const nbfcMatch = joined.match(/([A-Z][A-Za-z&]+(?:\s+[A-Z][A-Za-z&]+){0,3})\s+(?:Finance|FINANCE|NBFC)(?:\s*(?:Ltd\.?|Limited|LTD\.?))?/);
      if (nbfcMatch && nbfcMatch[0].length >= 5 && nbfcMatch[0].length <= 50) {
        result.bank_name = nbfcMatch[0].replace(/\s+/g, ' ').trim();
        result.type = 0;
        console.log('Lender matched (generic NBFC):', result.bank_name);
      }
    }
  }

  if (result.type === undefined) {
    if (BANK_KEYWORDS.test(joined)) result.type = 1;
    else if (NBFC_KEYWORDS.test(joined)) result.type = 0;
  }

  if (result.net_amount) {
    result.sanction_amount = result.net_amount;
  }

  const parseDate = (t) => {
    const s = String(t).trim().replace(/\s+\d{1,2}:\d{2}(:\d{2})?$/, '').trim();
    const formats = [
      'DD-MMM-YYYY', 'D-MMM-YYYY', 'DD-MMM-YY',
      'DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY',
      'MMMM D, YYYY', 'MMM D, YYYY', 'MMMM DD, YYYY',
      'YYYY-MM-DD', 'DD MMM YYYY', 'D MMM YYYY',
    ];
    for (const fmt of formats) {
      const parsed = moment(s, fmt, true);
      if (parsed.isValid()) return parsed.format('YYYY-MM-DD');
    }
    return null;
  };

  const dateLabelRegex = /agmt\.?\s*date|agreement\s*date|sanction\s*date|disbursement\s*date|disbursed\s*date|first\s*instal?ment\s*date|loan\s*date|^date\s*:?$|^date$/i;
  const dateLabelIdx = allTexts.findIndex((t) => dateLabelRegex.test(t));
  console.log('Date label search: index =', dateLabelIdx, 'text =', dateLabelIdx !== -1 ? allTexts[dateLabelIdx] : 'not found');
  if (dateLabelIdx !== -1) {
    for (let j = Math.max(0, dateLabelIdx - 10); j <= Math.min(allTexts.length - 1, dateLabelIdx + 10); j++) {
      if (j === dateLabelIdx) continue;
      const parsed = parseDate(allTexts[j]);
      if (parsed) {
        result.sanction_date = parsed;
        console.log('Sanction date extracted:', allTexts[j], '→', parsed);
        break;
      }
    }
  }

  if (!result.sanction_date && /agmt|agreement|sanction|\bdate\b/i.test(joined)) {
    for (const t of allTexts) {
      const parsed = parseDate(t);
      if (parsed) {
        result.sanction_date = parsed;
        console.log('Sanction date fallback:', t, '→', parsed);
        break;
      }
    }
  }

  const allDates = [];
  for (const t of allTexts) {
    const parsed = parseDate(t);
    if (parsed) allDates.push(parsed);
  }
  console.log('All dates found in PDF:', allDates.length);

  if (allDates.length >= 3) {
    const uniqueDates = [...new Set(allDates)].sort();
    const scheduleDates = uniqueDates.filter((d) => d !== result.sanction_date);
    if (scheduleDates.length > 0) {
      let firstEmi;
      if (result.sanction_date) {
        firstEmi = scheduleDates.find((d) => d > result.sanction_date) || scheduleDates[0];
      } else {
        firstEmi = scheduleDates[0];
      }
      result.EMI_date = firstEmi;
      console.log('First EMI date (earliest schedule date after sanction):', firstEmi);
    }
  } else if (allDates.length > 0 && !result.EMI_date) {
    const emi = allDates.find((d) => d !== result.sanction_date);
    if (emi) result.EMI_date = emi;
  }

  console.log('PDF extraction result:', result);
  return result;
};

export default function LoanForm({ mode, loan, onClose, importFiles }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    type: 1, bank_name: '', loan_account_number: '', loan_types: 'Business Loan',
    net_amount: '', ROI_amount: '', ROI_period: 0, tenor_of_loan: '',
    EMI_date: moment().format('YYYY-MM-DD'), interest_type: 'reducing',
    repayment_mode: 'emi',
    processing_fee: '', document_charges: '', other_charges: '',
    insurance_amount: '', tds_applicable: false, tds_rate: 10,
    moratorium_months: 0, sanction_amount: '', sanction_date: '',
    sanction_reference: '', security_details: '', guarantor_details: '', notes: '',
    reminder_email: true, reminder_sms: false, reminder_whatsapp: false,
  });
  const [saving, setSaving] = useState(false);
  const [emiPreview, setEmiPreview] = useState(null);

  useEffect(() => {
    if (mode === 'edit' && loan) {
      setForm({
        type: loan.type ?? 1, bank_name: loan.bank_name || '', loan_account_number: loan.loan_account_number || '',
        loan_types: loan.loan_types || 'Business Loan', net_amount: loan.net_amount || '', ROI_amount: loan.ROI_amount || '',
        ROI_period: loan.ROI_period ?? 0, tenor_of_loan: loan.tenor_of_loan || '',
        EMI_date: loan.EMI_date ? moment(loan.EMI_date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        interest_type: loan.interest_type || 'reducing', repayment_mode: loan.repayment_mode || 'emi',
        processing_fee: loan.processing_fee || '', document_charges: loan.document_charges || '',
        other_charges: loan.other_charges || '', insurance_amount: loan.insurance_amount || '',
        tds_applicable: !!loan.tds_applicable, tds_rate: loan.tds_rate || 10,
        moratorium_months: loan.moratorium_months || 0,
        sanction_amount: loan.sanction_amount || '', sanction_date: loan.sanction_date ? moment(loan.sanction_date).format('YYYY-MM-DD') : '',
        sanction_reference: loan.sanction_reference || '', security_details: loan.security_details || '',
        guarantor_details: loan.guarantor_details || '', notes: loan.notes || '',
      });
    }
  }, [mode, loan]);

  // Parse imported PDF and auto-fill loan_types + tenor_of_loan
  useEffect(() => {
    if (!importFiles || importFiles.length === 0) return;
    const file = importFiles[0];
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') return;

    extractFromPdf(file).then((updates) => {
      if (Object.keys(updates).length > 0) {
        setForm((prev) => ({ ...prev, ...updates }));
      }
    }).catch((err) => console.error('Error parsing PDF:', err));
  }, [importFiles]);

  // Get current loan type config
  const typeConfig = LOAN_TYPE_CONFIG[form.loan_types] || LOAN_TYPE_CONFIG['Business Loan'];

  // Auto-compute EMI preview
  useEffect(() => {
    const p = Number(form.net_amount) || 0;
    const r = Number(form.ROI_amount) || 0;
    const n = Number(form.tenor_of_loan) || 0;
    if (p > 0 && n > 0) {
      if (form.repayment_mode === 'lump_sum') {
        const totalInterest = Math.round(p * (r / 100) * (n / 12));
        setEmiPreview({ emi: 0, totalPayable: p + totalInterest, totalInterest, mode: 'Lump sum at maturity' });
      } else if (form.repayment_mode === 'interest_only') {
        const monthlyInterest = Math.round(p * (r / 12 / 100) * 100) / 100;
        setEmiPreview({ emi: monthlyInterest, totalPayable: p + (monthlyInterest * n), totalInterest: monthlyInterest * n, mode: 'Interest only, principal at end' });
      } else if (form.interest_type === 'fixed') {
        const totalInterest = p * (r / 100) * (n / 12);
        const emi = (p + totalInterest) / n;
        const totalPayable = emi * n;
        setEmiPreview({ emi: Math.round(emi * 100) / 100, totalPayable: Math.round(totalPayable), totalInterest: Math.round(totalInterest), mode: 'Fixed (flat) rate EMI' });
      } else {
        const monthlyR = (r / 12) / 100;
        const emi = r === 0 ? p / n : (p * monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1);
        const totalPayable = emi * n;
        const isFloating = form.interest_type === 'floating';
        setEmiPreview({
          emi: Math.round(emi * 100) / 100,
          totalPayable: Math.round(totalPayable),
          totalInterest: Math.round(totalPayable - p),
          mode: isFloating ? 'Floating rate EMI (indicative)' : 'Reducing balance EMI',
          floating: isFloating,
        });
      }
    } else {
      setEmiPreview(null);
    }
  }, [form.net_amount, form.ROI_amount, form.tenor_of_loan, form.repayment_mode, form.interest_type]);

  const handleField = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-set fields when loan type changes
      if (field === 'loan_types') {
        const cfg = LOAN_TYPE_CONFIG[value] || {};
        // Auto-set lender type
        if (cfg.lenders?.length === 1) updated.type = cfg.lenders[0];
        // Auto-set TDS
        if (value === 'Director Loan' || value === 'Inter-Company Loan') {
          updated.tds_applicable = true;
          updated.type = value === 'Director Loan' ? 2 : 3;
        }
        // Clear irrelevant fields
        if (!cfg.hasProcessingFee) { updated.processing_fee = ''; updated.document_charges = ''; updated.other_charges = ''; }
        if (!cfg.hasInsurance) updated.insurance_amount = '';
        if (!cfg.hasSanction) { updated.sanction_amount = ''; updated.sanction_date = ''; updated.sanction_reference = ''; }
        if (!cfg.hasSecurity) updated.security_details = '';
        if (!cfg.hasGuarantor) updated.guarantor_details = '';
      }

      // Auto-set TDS based on lender type
      if (field === 'type') {
        updated.tds_applicable = value === 0 || value === 2 || value === 3; // NBFC, Individual, Group Company
      }

      return updated;
    });
  };

  const handleSave = async () => {
    if (!form.bank_name || !form.net_amount || !form.tenor_of_loan) return;
    const amount = Number(form.net_amount);
    const rate = Number(form.ROI_amount);
    const tenure = Number(form.tenor_of_loan);
    if (!(amount > 0)) return dispatch(OpenalertActions({ msg: 'Loan amount must be greater than zero', severity: 'warning' }));
    if (!(rate >= 0)) return dispatch(OpenalertActions({ msg: 'Interest rate cannot be negative', severity: 'warning' }));
    if (!(tenure > 0) || !Number.isInteger(tenure)) return dispatch(OpenalertActions({ msg: 'Tenure must be a positive integer (months)', severity: 'warning' }));
    setSaving(true);
    try {
      if (mode === 'edit' && loan) {
        await CompanyLoansService.update(loan.id, form);
      } else {
        await CompanyLoansService.create(form);
      }
      onClose(true);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const fmtAmt = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '';

  // Dynamic label for lender name based on type
  const lenderLabel = form.type === 2 ? 'Director / Partner Name *' : form.type === 3 ? 'Company Name *' : 'Bank / NBFC Name *';
  const accountLabel = form.type === 2 || form.type === 3 ? 'Reference Number' : 'Loan Account Number *';

  // Determine which lender types are valid for selected loan type
  const validLenders = typeConfig.lenders?.length > 0 ? LENDER_TYPES.filter(l => typeConfig.lenders.includes(l.value)) : LENDER_TYPES;

  return (
    <>
      <Helmet><title>{titleURL} | {mode === 'edit' ? 'Edit' : 'New'} Loan</title></Helmet>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 70px)', gap: 1.5, overflow: 'hidden' }}>

        {/* Header */}
        <Card sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} elevation={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton size="small" onClick={() => onClose(false)}><ArrowBackIcon /></IconButton>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{mode === 'edit' ? 'Edit Loan' : 'New Loan'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => onClose(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button variant="contained" size="small" onClick={handleSave} disabled={saving || !form.bank_name}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              sx={{ textTransform: 'none' }}>
              {mode === 'edit' ? 'Update' : 'Save as Draft'}
            </Button>
          </Box>
        </Card>

        {/* Form */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Grid container spacing={2}>
            {/* Left: Form Fields */}
            <Grid size={{ xs: 12, md: 8 }}>

              {/* Loan Details */}
              <Card sx={{ p: 3, mb: 2 }} elevation={0}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>Loan Details</Typography>
                <Typography sx={{ fontSize: 12, color: '#888', mb: 2 }}>
                  {form.loan_types === 'Director Loan' ? 'Loan received from a director or partner of the company. TDS u/s 194A is mandatory.'
                    : form.loan_types === 'Inter-Company Loan' ? 'Loan received from a group company or related entity. TDS u/s 194A is mandatory.'
                    : 'Select loan type to auto-configure fields. Processing fee, insurance, and security fields will show/hide based on loan type.'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField select fullWidth size="small" label="Loan Type *" value={form.loan_types}
                      onChange={(e) => handleField('loan_types', e.target.value)}>
                      {Object.keys(LOAN_TYPE_CONFIG).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField select fullWidth size="small" label="Lender Type *" value={form.type}
                      onChange={(e) => handleField('type', Number(e.target.value))}
                      disabled={validLenders.length === 1}>
                      {validLenders.map(l => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" label={lenderLabel} value={form.bank_name}
                      onChange={(e) => handleField('bank_name', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField fullWidth size="small" label={accountLabel} value={form.loan_account_number}
                      onChange={(e) => handleField('loan_account_number', e.target.value)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField select fullWidth size="small" label="Interest Type" value={form.interest_type}
                      onChange={(e) => handleField('interest_type', e.target.value)}>
                      {INTEREST_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField select fullWidth size="small" label="Repayment Mode" value={form.repayment_mode}
                      onChange={(e) => handleField('repayment_mode', e.target.value)}>
                      {REPAYMENT_MODES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              </Card>

              {/* Financial Details */}
              <Card sx={{ p: 3, mb: 2 }} elevation={0}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>Financial Details</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField type="number" fullWidth size="small" label="Loan Amount (₹) *" value={form.net_amount}
                      onChange={(e) => handleField('net_amount', e.target.value)}
                      inputProps={{ min: 0 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField type="number" fullWidth size="small" label="Interest Rate (% p.a.) *" value={form.ROI_amount}
                      onChange={(e) => handleField('ROI_amount', e.target.value)}
                      inputProps={{ min: 0 }}
                      helperText={form.loan_types === 'Director Loan' ? 'Enter 0 for interest-free loan' : ''} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField type="number" fullWidth size="small" label="Tenure (months) *" value={form.tenor_of_loan}
                      onChange={(e) => handleField('tenor_of_loan', e.target.value)}
                      inputProps={{ min: 1, step: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField type="date" fullWidth size="small" label="First EMI / Repayment Date" value={form.EMI_date}
                      onChange={(e) => handleField('EMI_date', e.target.value)}
                      slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField type="number" fullWidth size="small" label="Moratorium (months)" value={form.moratorium_months}
                      onChange={(e) => handleField('moratorium_months', e.target.value)}
                      helperText="Payment holiday period (interest accrues)" />
                  </Grid>

                  {/* Processing Fee — only for bank/NBFC loans */}
                  {typeConfig.hasProcessingFee && (
                    <>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField type="number" fullWidth size="small" label="Processing Fee" value={form.processing_fee}
                          onChange={(e) => handleField('processing_fee', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField type="number" fullWidth size="small" label="Document Charges" value={form.document_charges}
                          onChange={(e) => handleField('document_charges', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField type="number" fullWidth size="small" label="Other Charges" value={form.other_charges}
                          onChange={(e) => handleField('other_charges', e.target.value)} />
                      </Grid>
                    </>
                  )}

                  {/* Insurance — only for vehicle/property/equipment */}
                  {typeConfig.hasInsurance && (
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField type="number" fullWidth size="small" label="Insurance Premium" value={form.insurance_amount}
                        onChange={(e) => handleField('insurance_amount', e.target.value)} />
                    </Grid>
                  )}

                  {/* TDS */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <FormControlLabel control={
                        <Switch checked={form.tds_applicable}
                          onChange={(e) => handleField('tds_applicable', e.target.checked)}
                          size="small" disabled={form.type === 2 || form.type === 3} />
                      } label={<Typography sx={{ fontSize: 13 }}>TDS Applicable</Typography>} />
                      {form.tds_applicable && (
                        <TextField type="number" size="small" label="Rate %" value={form.tds_rate}
                          onChange={(e) => handleField('tds_rate', e.target.value)} sx={{ width: 70 }} />
                      )}
                      <Tooltip title="TDS u/s 194A is mandatory for NBFC, Director, and Inter-Company loans. Banks are exempt." arrow>
                        <InfoOutlinedIcon sx={{ fontSize: 16, color: '#999' }} />
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </Card>

              {/* Sanction & Security — only for bank/NBFC loans */}
              {(typeConfig.hasSanction || typeConfig.hasSecurity || typeConfig.hasGuarantor) && (
                <Card sx={{ p: 3, mb: 2 }} elevation={0}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>
                    {form.loan_types === 'Director Loan' || form.loan_types === 'Inter-Company Loan' ? 'Additional Details' : 'Sanction & Security'}
                  </Typography>
                  <Grid container spacing={2}>
                    {typeConfig.hasSanction && (
                      <>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField type="number" fullWidth size="small" label="Sanction Amount" value={form.sanction_amount}
                            onChange={(e) => handleField('sanction_amount', e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField type="date" fullWidth size="small" label="Sanction Date" value={form.sanction_date}
                            onChange={(e) => handleField('sanction_date', e.target.value)}
                            slotProps={{ inputLabel: { shrink: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField fullWidth size="small" label="Sanction Reference" value={form.sanction_reference}
                            onChange={(e) => handleField('sanction_reference', e.target.value)} />
                        </Grid>
                      </>
                    )}
                    {typeConfig.hasSecurity && (
                      <Grid size={typeConfig.hasGuarantor ? 6 : 12}>
                        <TextField fullWidth size="small" multiline minRows={2}
                          label={form.loan_types === 'Vehicle Loan' ? 'Vehicle Details (Registration, Model)' : form.loan_types === 'Gold Loan' ? 'Gold Details (Weight, Purity)' : form.loan_types === 'Property Loan' ? 'Property Details (Address, Survey No.)' : 'Security / Collateral Details'}
                          value={form.security_details}
                          onChange={(e) => handleField('security_details', e.target.value)} />
                      </Grid>
                    )}
                    {typeConfig.hasGuarantor && (
                      <Grid size={6}>
                        <TextField fullWidth size="small" multiline minRows={2} label="Guarantor Details" value={form.guarantor_details}
                          onChange={(e) => handleField('guarantor_details', e.target.value)} />
                      </Grid>
                    )}
                    <Grid size={12}>
                      <TextField fullWidth size="small" multiline minRows={2} label="Notes" value={form.notes}
                        onChange={(e) => handleField('notes', e.target.value)} />
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* Notes only — for Director/Inter-Company */}
              {!typeConfig.hasSanction && !typeConfig.hasSecurity && (
                <Card sx={{ p: 3, mb: 2 }} elevation={0}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>Additional Details</Typography>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField fullWidth size="small" multiline minRows={2}
                        label={form.loan_types === 'Director Loan' ? 'Board Resolution / Agreement Details' : 'Agreement Details'}
                        value={form.notes}
                        onChange={(e) => handleField('notes', e.target.value)} />
                    </Grid>
                  </Grid>
                </Card>
              )}

              {/* EMI Reminder Preferences */}
              <Card sx={{ p: 3, mb: 2 }} elevation={0}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>EMI Reminder</Typography>
                <Typography sx={{ fontSize: 12, color: '#888', mb: 2 }}>
                  Choose how you'd like to receive reminders before the EMI due date.
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.5, border: '1px solid #E0E0E0', borderRadius: 1,
                      bgcolor: form.reminder_email ? '#E3F2FD' : 'transparent',
                    }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Email</Typography>
                        <Typography sx={{ fontSize: 11, color: '#888' }}>Via registered email</Typography>
                      </Box>
                      <Switch checked={form.reminder_email} size="small"
                        onChange={(e) => handleField('reminder_email', e.target.checked)} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.5, border: '1px solid #E0E0E0', borderRadius: 1,
                      bgcolor: form.reminder_sms ? '#E3F2FD' : 'transparent',
                    }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>SMS</Typography>
                        <Typography sx={{ fontSize: 11, color: '#888' }}>Text message alert</Typography>
                      </Box>
                      <Switch checked={form.reminder_sms} size="small"
                        onChange={(e) => handleField('reminder_sms', e.target.checked)} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 1.5, border: '1px solid #E0E0E0', borderRadius: 1,
                      bgcolor: form.reminder_whatsapp ? '#E8F5E9' : 'transparent',
                    }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>WhatsApp</Typography>
                        <Typography sx={{ fontSize: 11, color: '#888' }}>Instant notification</Typography>
                      </Box>
                      <Switch checked={form.reminder_whatsapp} size="small"
                        onChange={(e) => handleField('reminder_whatsapp', e.target.checked)} />
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Right: EMI Preview */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ p: 3, position: 'sticky', top: 0 }} elevation={0}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>EMI Calculator</Typography>
                {emiPreview ? (
                  <>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography sx={{ fontSize: 11, color: '#999' }}>
                        {emiPreview.mode}
                      </Typography>
                      <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#1976d2' }}>
                        {emiPreview.emi > 0 ? fmtAmt(emiPreview.emi) : 'No EMI'}
                      </Typography>
                      {emiPreview.emi > 0 && <Typography sx={{ fontSize: 11, color: '#999' }}>per month</Typography>}
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>Loan Amount</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{fmtAmt(form.net_amount)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>Total Interest</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#d32f2f' }}>{fmtAmt(emiPreview.totalInterest)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>Total Payable</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{fmtAmt(emiPreview.totalPayable)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: 12, color: '#666' }}>Tenure</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{form.tenor_of_loan} months</Typography>
                    </Box>
                    {emiPreview.floating && (
                      <Box sx={{ mt: 1.5, p: 1, bgcolor: '#FFF8E1', borderRadius: 1 }}>
                        <Typography sx={{ fontSize: 11, color: '#795548' }}>
                          EMI is indicative and may change with rate revision.
                        </Typography>
                      </Box>
                    )}
                    {form.tds_applicable && (
                      <Box sx={{ mt: 1.5, p: 1, bgcolor: '#FFF3E0', borderRadius: 1 }}>
                        <Typography sx={{ fontSize: 11, color: '#e65100' }}>
                          TDS @ {form.tds_rate}% will be deducted on interest u/s 194A.
                          {form.type === 1 ? ' (Note: Banks are generally exempt)' : ''}
                        </Typography>
                      </Box>
                    )}
                    {Number(form.ROI_amount) === 0 && (
                      <Box sx={{ mt: 1.5, p: 1, bgcolor: '#E8F5E9', borderRadius: 1 }}>
                        <Typography sx={{ fontSize: 11, color: '#2e7d32' }}>Interest-free loan. No interest entries will be created.</Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Typography sx={{ fontSize: 13, color: '#999', textAlign: 'center', py: 4 }}>
                    Enter loan amount, rate, and tenure to see preview
                  </Typography>
                )}

                {/* Accounting Head Info */}
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F5F7FA', borderRadius: 1 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#555', mb: 0.5 }}>Accounting Entries on Disburse</Typography>
                  <Typography sx={{ fontSize: 11, color: '#888' }}>
                    DR: Bank / Cash Account (selected during disburse)
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#888' }}>
                    CR: {form.type === 2 ? 'Loans From Individual' : form.type === 3 ? 'Inter-Company Borrowings' : typeConfig.secured ? 'Secured Loan' : 'Unsecured Loan'} → auto-created ledger
                  </Typography>
                  {Number(form.ROI_amount) > 0 && (
                    <Typography sx={{ fontSize: 11, color: '#888', mt: 0.5 }}>
                      Interest hits: Interest on Loan (P&L Expense)
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
