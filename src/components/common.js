import axios from 'axios';
import { filter } from 'lodash';
import http from '../http-common'

export function findAllByKey(obj, keyToFind) {
  return Object.entries(obj) //obj
    .reduce(
      (acc, [key, value]) =>
        key === keyToFind
          ? acc.concat(value)
          : value && typeof value === 'object'
            ? acc.concat(findAllByKey(value, keyToFind))
            : acc,
      [],
    );
}

export const removeDuplicateObjectFromArray = (array, key) => {
  var check = new Set();
  return array.filter((obj) => !check.has(obj[key]) && check.add(obj[key]));
};

export const getLocationDataBasedOnPincode = (value) => {
  return http.get('/company/pincode/'+value)
    .then((res) => {
      return res.data;
    })
    .catch((e) => console.log(e));
};

export const getConvertedDate = (val) => {
  let dt = val;
  let localTime = dt.getTime();
  let localOffset = dt.getTimezoneOffset() * 60000;
  let utc = localTime + localOffset;
  let offset = 5.5;
  let IST = utc + 3600000 * offset;
  let new_dt = new Date(IST);
  let current_timezone_time = `${new_dt
    .getFullYear()
    .toString()
    .padStart(4, "0")}-${(new_dt.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${new_dt.getDate().toString().padStart(2, "0")}`;

  return current_timezone_time;
};
