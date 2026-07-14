

import moment from "moment";

const toMomentOrNull = (value) => {
    if (!value) return null;
  
    if (moment.isMoment(value)) {
      //console.log('Momentvalue', value)
      return value?.isValid() ? value : null;
    }

    if (typeof value === 'string' && value.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const timeParsed = moment(value, 'HH:mm:ss');
    if (timeParsed.isValid()) {
      return timeParsed;
    }
  }
  
    const strictParsed = moment(
      value,
      [moment.ISO_8601, 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY'],
      true
    );
  
    if (strictParsed.isValid()) return strictParsed;
  
    const looseParsed = moment(value);
    return looseParsed.isValid() ? looseParsed : null;
  };
  
  export default toMomentOrNull;