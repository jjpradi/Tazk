import moment from 'moment';

export const getDateTimeFormat = (date) => {
  let dt = new Date(date);
  let localTime = dt.getTime();
  let localOffset = dt.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let offset = 5.5;
  let IST = utc + 3600000 * offset;
  let new_dt = new Date(IST);
  let current_timezone_time = `${new_dt
    .getFullYear()
    .toString()
    .padStart(4, '0')}-${(new_dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${new_dt.getDate().toString().padStart(2, '0')} ${new_dt
    .getHours()
    .toString()
    .padStart(2, '0')}:${new_dt
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${new_dt.getSeconds().toString().padStart(2, '0')}`;

  return current_timezone_time;
};

export const getDateFormat = (date) => {
  let dt = new Date(date);
  let localTime = dt.getTime();
  let localOffset = dt.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let offset = 5.5;
  let IST = utc + 3600000 * offset;
  let new_dt = new Date(IST);
  let current_timezone_date = `${new_dt
    .getFullYear()
    .toString()
    .padStart(4, '0')}-${(new_dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${new_dt.getDate().toString().padStart(2, '0')}`;

  return current_timezone_date;
};

export const yyyymmdd_ddmmyyyy = (date) => {
  const [year, month, day] = date.split('-');

  return `${day}/${month}/${year}`;
};

export const getDateTime = (date) => {
  let dt = new Date(date);
  let localTime = dt.getTime();
  let localOffset = dt.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let offset = 5.5;
  let IST = utc + 3600000 * offset;
  let new_dt = new Date(IST);
  let current_timezone_date = `${new_dt
    .getDate()
    .toString()
    .padStart(2, '0')}/${(new_dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${new_dt.getFullYear().toString().padStart(4, '0')}`;

  var hourEnd = date.indexOf(':');
  var H = date.slice(10, hourEnd);
  var h = H % 12 || 12;
  var ampm = H < 12 ? ' AM' : ' PM';
  let time = h + date.substr(hourEnd, 3) + ampm;
  // document.write(time);
  return current_timezone_date + ' ' + time;
};

export const getMonthName = (date) => {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  let dt = new Date(date);
  let localTime = dt.getTime();
  let localOffset = dt.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let offset = 5.5;
  let IST = utc + 3600000 * offset;
  let new_dt = new Date(IST);
  let current_timezone_date = `${new_dt
    .getDate()
    .toString()
    .padStart(2, '0')}-${monthNames[dt.getMonth()]}-${new_dt
    .getFullYear()
    .toString()
    .padStart(4, '0')}`;

  return current_timezone_date;
};


export function getCurrentFinancialYear() {


  let fiscalyear = {};
  let today = new Date();
  if ((today.getMonth() + 1) <= 3) {
      fiscalyear.fromDate = (today.getFullYear() - 1) + "-04-01"
      fiscalyear.toDate = (today.getFullYear()) + "-03-31"
    
  } else {
      fiscalyear.fromDate = (today.getFullYear()) + "-04-01"
      fiscalyear.toDate = (today.getFullYear() + 1) + "-03-31"
  }
  

  const result = {
    fromDate: fiscalyear.fromDate,
    toDate: fiscalyear.toDate,
    format(str) {
      const formattedDate = {
        fromDate: moment(fiscalyear.fromDate).format(str),
        toDate : moment(fiscalyear.toDate).format(str)
      }

      return formattedDate
    }
  }


  return result
}

export const ConvertNumberToWords = (numberInput) => {
  let oneToTwenty = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  let tenth = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const numberString = Math.abs(numberInput).toString();
  if (numberString.length > 7) return 'overlimit';
  //let num = ('0000000000'+ numberInput).slice(-10).match(/^(\d{1})(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  let num = ('0000000' + numberString)
    .slice(-7)
    .match(/^(\d)?(\d{1})(\d{2})(\d{1})(\d{2})$/);
  if (!num) return;

  let outputText =
    num[1] != 0
      ? (oneToTwenty[Number(num[1])] ||
          `${tenth[num[1][0]]} ${oneToTwenty[num[1][1]]}`) + ' Million '
      : '';

  outputText +=
    num[2] != 0
      ? (oneToTwenty[Number(num[2])] ||
          `${tenth[num[2][0]]} ${oneToTwenty[num[2][1]]}`) + 'Hundred '
      : '';
  outputText +=
    num[3] != 0
      ? (oneToTwenty[Number(num[3])] ||
          `${tenth[num[3][0]]} ${oneToTwenty[num[3][1]]}`) + ' Thousand '
      : '';
  outputText +=
    num[4] != 0
      ? (oneToTwenty[Number(num[4])] ||
          `${tenth[num[4][0]]} ${oneToTwenty[num[4][1]]}`) + 'Hundred '
      : '';
  outputText +=
    num[5] != 0
      ? oneToTwenty[Number(num[5])] ||
        `${tenth[num[5][0]]} ${oneToTwenty[num[5][1]]} `
      : '';

  
  return numberInput === 0 ? '-' : `${outputText.trim()} Rupees only.`;
};

export const commonDateFormat = (date) => {
  let dt = new Date(date);
  let localTime = dt.getTime();
  let localOffset = dt.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let offset = 5.5;
  let IST = utc + 3600000 * offset;
  let new_dt = new Date(IST);
  let current_timezone_date = `${new_dt.getDate().toString().padStart(2, '0')}/${(new_dt.getMonth() + 1).toString().padStart(2, '0')}/${new_dt.getFullYear().toString().padStart(4, '0')}`;

  return current_timezone_date;
};

export const commonDateFormat1 = (date) => {
  let dt = new Date(date);
  let localTime = dt.getTime();
  let localOffset = dt.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let offset = 5.5;
  let IST = utc + 3600000 * offset;
  let new_dt = new Date(IST);
  let current_timezone_date = `${new_dt.getDate().toString().padStart(2, '0')}-${(new_dt.getMonth() + 1).toString().padStart(2, '0')}-${new_dt.getFullYear().toString().padStart(4, '0')}`;

  return current_timezone_date;
};

export const momentDateFormat = (date) => {
  const current_timezone_date = date === null ? '' : moment(date).format('DD/MM/YYYY')
  return current_timezone_date;
};

export const momentDateTimeFormat = (date) => {
  const current_timezone_date = date === null ? '' : moment(date).format('DD/MM/YYYY HH:MM')
  return current_timezone_date;
};

export const uid = function(){
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 12).padStart(12, 0)
}
