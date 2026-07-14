import * as XLSX from "xlsx-js-style";

const getData = (worksheet, bankColumn, bankName) => {
  
  const range = {};

  //check if 1st and last column name exists in excel
  range.topLeft = Object.keys(worksheet).find(
    (k) => worksheet[k].v === bankColumn[0]
  );

  range.topRight = Object.keys(worksheet).find(
    (k) => worksheet[k].v === bankColumn.at(-1)
  );

  if (!range.topLeft || !range.topRight) {
    return "Invalid file";
  }

  range.topLeftRowNum = parseInt(range.topLeft.replace(/^\D+/g, ""));
  range.topLeftRowName = range.topLeft.replace(/[0-9]/g, "");

  // helper fun to find last row of transaction table
  const findLastRow = () => {
    let tempRow = range.topLeftRowNum;
    let tempTopLeft = `${range.topLeftRowName}${range.topLeftRowNum}`;

    while (worksheet[tempTopLeft] !== undefined) {
      tempTopLeft = `${range.topLeftRowName}${++tempRow}`;
    }
    return tempRow - 1;
  };

  // check whether imported excel is valid or not
  const isValidFile = (bankColumn, range) => {
    let count = bankColumn.length;
    let i = 0;
    let n = range.topLeftRowName.charCodeAt(0) - 65;
    let tempTopLeft = `${range.topLeftRowName}${range.topLeftRowNum}`;
    
    while (worksheet[tempTopLeft] !== undefined) {
      tempTopLeft = `${getColumnDescription(n)}${range.topLeftRowNum}`;

      if (
        worksheet[tempTopLeft] !== undefined &&
        worksheet[tempTopLeft].v.trim() === bankColumn[i]
      ) {
        count = count - 1;
      }
      n++;
      i++;
    }
    return count === 0;
  };

  // helper function
  function getColumnDescription(i) {
    const m = i % 26;
    const c = String.fromCharCode(65 + m);
    const r = i - m;
    return r > 0 ? `${getColumnDescription((r - 1) / 26)}${c}` : c;
  }

  // convert excel data to json
  const convertToJson = (headers, data) => {
    const rows = [];
    data.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        rowData[headers[index].trim()] = element;
      });
      rows.push(rowData);
    });
    return rows;
  };

  // convert json to array of objects
  const convertAxisToTableData = (data) => {
    let d = convertToJson(data[0], data);
    d = d.slice(1);
    const rows = [];
    d.forEach((row, i) => {
      let rowData = {};
      rowData.ids = i;
      rowData.date = row["Tran Date"];
      rowData.reference = row["Transaction Particulars"];
      // if (row["DR|CR"] === "CR") {
      rowData.amount = parseInt(`${ row["Amount(INR)"] }`) + ' ' + row["DR|CR"] || 0;
        // rowData.deposit = parseInt(row["DR|CR"] === "CR" ? row["Amount(INR)"]: 0);
        // rowData.withdrawal = parseInt(row["DR|CR"] === "DR"? row["Amount(INR)"] : 0);
      // if (row["DR|CR"] === "CR") {
      //   rowData.deposit = parseInt(row["Amount(INR)"]);
      // }
      // if (row["DR|CR"] === "DR") {
      //   rowData.withdrawal = parseInt(row["Amount(INR)"]);
      // }
      rows.push(rowData);
    }); 
    return rows;
  };

  const convertIndusintToTableData = (data) => {
    let d = convertToJson(data[0], data);
    d = d.slice(1);
    const rows = [];
    d.forEach((row,i) => {
      let rowData = {};
      rowData.ids = i;
      rowData.date = row["Date"];
      rowData.reference = row["Description"];
      rowData.amount = parseInt(`${ row["Amount(INR)"] }`) + ' ' + row["DR|CR"] || 0;
        // rowData.deposit = isNaN(row["Debit"]) !==true ? parseInt( row["Debit"]):'';
        // rowData.withdrawal =  isNaN(row["Credit"]) !==true ? parseInt( row["Credit"]):'';
      rows.push(rowData);
    }); 
    return rows;
  };

  const converthdfcbankToTableData = (data) => {
    let d = convertToJson(data[0], data);
    d = d.slice(1);
    const rows = [];
    d.forEach((row, i) => {
      let rowData = {};
      rowData.ids = i;
      rowData.date = row["Date"];
      rowData.reference = row["Narration"].concat("/", row["Chq./Ref.No."]);
      rowData.amount = parseInt(`${ row["Amount(INR)"] }`) + ' ' + row["DR|CR"] || 0;
        // rowData.deposit = isNaN(row["Withdrawal Amt."]) !==true ? parseInt( row["Withdrawal Amt."]):'';
        // rowData.withdrawal = isNaN(row["Deposit Amt."]) !==true ? parseInt( row["Deposit Amt."]):'';
        
        if(i!==0){
      rows.push(rowData);
        }
    }); 
    return rows;
  };

  if (!isValidFile(bankColumn, range)) {
    return "Invalid file";
  }

  range.lastRowNum = findLastRow();
  range.bottomLeft = range.topLeftRowName + range.lastRowNum;

  range.topRightRowName = range.topRight.replace(/[0-9]/g, "");
  range.bottomRight = range.topRightRowName + range.lastRowNum;

  const importRange = `${range.topLeft}:${range.bottomRight}`;
  const headers = 1;
  const data = XLSX.utils.sheet_to_json(worksheet, {
    range: importRange,
    header: headers,
    raw: false
  });

  switch(bankName) {
    case 'Axis Bank':
     return convertAxisToTableData(data)
    case 'INDUSIND BANK':
      return convertIndusintToTableData(data)
    case 'HDFC Bank':
      return converthdfcbankToTableData(data)
      // code block
  };
};

export default getData;
