import {Card} from '@mui/material';

export const emailValidation = (value) => {
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !(!value || emailRegex.test(value) === false);
};

export const phoneValidation = (value) => {
  const phoneRegex =/^[6-9]\d{9}$/;
  return !(!value || phoneRegex.test(value) === false);
};

export const empIdValidation = (value) => {
  const phoneRegex =/^[a-zA-Z0-9-]*$/;
  return !(!value || phoneRegex.test(value) === false);
};

export const lanValidation = (value) => {
  const phoneRegex = /^\d{10}(\d{1})?$/;
  return !(!value || phoneRegex.test(value) === false);
};


export const locationcodeValidation = (value) => {
  const codeRegex = /^[A-Z0-9]{4}$/;
  return !(!value || codeRegex.test(value) === false);
};


export const gstValidation = (value) => {
  // const gstRegex = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  const gstRegex = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z]([1-9A-Z]Z[0-9A-Z]|[0-9]{3})$/
  
  //const gstRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
  return !(!value || gstRegex.test(value) === false);
};

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_ERROR_MESSAGES = {
  required: 'Password is required.',
  minLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
  noSpaces: 'Password must not contain spaces.',
  mismatch: 'Passwords must match.',
};

export const passwordValidation = (value) => {
  let passwordRegex = /^\S*$/;
  let passwordRegex1 = /^.{6,}$/;
  return !(!value || (passwordRegex.test(value) && passwordRegex1.test(value) === false)
  );
};

export const zipValidation = (value) => {
  const zipRegex = /^\d{6}$/;
  return !(!value || zipRegex.test(value) === false);
};

export const urlValidation = (value) => {
  const urlRegex =
    /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
  return !(!value || urlRegex.test(value) === false);
};

export const PWDRequisite = ({
  // capsLetterFlag,
  // numberFlag,
  pwdLengthFlag,
  removeSpace,
  // specialCharFlag,
}) => {
  return (
    <Card className='message'>
      {/* <p className={capsLetterFlag} style={{paddingLeft:"10px"}}>Must contain 1 Capital Letter</p>
        <p className={numberFlag} style={{paddingLeft:"10px"}}>Must contain number</p> */}
      <p className={pwdLengthFlag} style={{paddingLeft: '10px'}}>
        Must be 6 Chars long
      </p>
      <p className={removeSpace} style={{paddingLeft: '10px'}}>
        Avoid Space
      </p>
    </Card>
  );
};

export const hostNameValidation = (value) => {
  const Regex = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?$/;
  return !(!value || Regex.test(value) === false);
};

export const Duration = (value) => {
  const getTimer = /^([0-9]{1,2}):([0-9]{2})$/;
  return !(!value || getTimer.test(value) === false);
};

export const bssIdValidation = (value) => {
  const bssIdRegex = /^([0-9a-zA-Z]{2}:){5}[0-9a-zA-Z]{2}$/;
  return !(!value || bssIdRegex.test(value) === false);
};

export const ifscValidation = (value) => {
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/gm;
  return !(!value || ifscRegex.test(value) === false);
};

export const dobValidation = (value) => {
  const dobRegex = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/(19|20)\d{2}$/;
  return !(!value || !dobRegex.test(value));
};


export const bankAccountValidation = (value) => {
  const bankAccountRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,30}$/;
  return !(!value || bankAccountRegex.test(value) === false);
};

export const longitudeValidation = (value) => {
  const longitudeRegex = /^-?([1-9]?[0-9]|1[0-7][0-9]|180)(\.\d+)?$/;
  return !(!value || longitudeRegex.test(value) === false);
};

export const latitudeValidation = (value) => {
  const latitudeRegex = /^-?([1-8]?[0-9]|90)(\.\d+)?$/;
  return !(!value || latitudeRegex.test(value) === false);
};

export const esiValidation = (value) => {
  const esiRegex = /^\d{17}$/;
  return !(!value || esiRegex.test(value) === false);
};

export const uanValidation = (value) => {
  const uanRegex = /^\d{12}$/;
  return !(!value || uanRegex.test(value) === false);
};

export const vehicleNumberValidation = (value) => {
  // const validRegex1 = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i
  // const validRegex2 = /^\d{2}\s?BH\s?\d{4}\s?[A-Z]{2}$/i
  // return !!value && (validRegex1.test(value) || validRegex2.test(value))
  const vehicleNumberRegex= /^([A-Z|a-z|0-9]{4,20})$/;
  return !(!value || vehicleNumberRegex.test(value) === false);
}

export const accountNoValidation = (value) => {
  const accRegex = /^[a-zA-Z0-9]{3,20}$/;
  return !(!value || accRegex.test(value) === false);
};