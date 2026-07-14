import React, {useMemo, useRef} from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

const VerificationCodeInput = ({value = '', onChange, length = 6}) => {
  const inputRefs = useRef([]);

  const values = useMemo(() => {
    const normalized = digitsOnly(value).slice(0, length);
    return Array.from({length}, (_, index) => normalized[index] || '');
  }, [length, value]);

  const focusInput = (index) => {
    const input = inputRefs.current[index];
    if (input) {
      input.focus();
      input.select?.();
    }
  };

  const updateValue = (nextValues) => {
    onChange(nextValues.join(''));
  };

  const handleChange = (index, event) => {
    const raw = digitsOnly(event.target.value);

    if (!raw) {
      const nextValues = [...values];
      nextValues[index] = '';
      updateValue(nextValues);
      return;
    }

    if (raw.length === 1) {
      const nextValues = [...values];
      nextValues[index] = raw;
      updateValue(nextValues);
      if (index < length - 1) focusInput(index + 1);
      return;
    }

    const merged = [...values];
    for (let i = index; i < length && i - index < raw.length; i++) {
      merged[i] = raw[i - index];
    }
    updateValue(merged);
    focusInput(Math.min(index + raw.length, length - 1));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !values[index] && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = digitsOnly(event.clipboardData?.getData('text')).slice(0, length);
    if (!pasted) return;

    const nextValues = Array.from({length}, (_, index) => pasted[index] || '');
    updateValue(nextValues);
    focusInput(Math.min(pasted.length - 1, length - 1));
  };

  return (
    <Box
      onPaste={handlePaste}
      sx={{
        display: 'flex',
        gap: 1.5,
        flexWrap: 'nowrap',
      }}
    >
      {values.map((digit, index) => (
        <OutlinedInput
          key={index}
          type='password'
          value={digit}
          inputRef={(input) => {
            inputRefs.current[index] = input;
          }}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          inputProps={{
            maxLength: 1,
            inputMode: 'numeric',
            pattern: '[0-9]*',
            'aria-label': `Verification code digit ${index + 1}`,
          }}
          sx={{
            width: {xs: 44, sm: 48},
            '& input': {
              p: 1.25,
              textAlign: 'center',
              fontSize: 18,
            },
          }}
        />
      ))}
    </Box>
  );
};

VerificationCodeInput.propTypes = {
  length: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

export default VerificationCodeInput;
