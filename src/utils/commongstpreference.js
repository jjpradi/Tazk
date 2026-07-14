import React from "react";
import { Autocomplete, TextField } from "@mui/material";

export default function CommonAutoCategory({
  labelName = "Tax Category",
  value,
  setValue,
  searchVal = [],
  requestSearch,
  required = false,
  disabled = false,
  type
}) {
  return (
    <Autocomplete
      disablePortal
      options={searchVal}
      getOptionLabel={(option) => option.label || ""}
      value={value || null}
      onChange={(event, newValue) => {
        setValue(newValue || null);
      }}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === "input") requestSearch(newInputValue);
        else if (reason === "clear") requestSearch("");
      }}
      isOptionEqualToValue={(option, val) =>
        option.value === val?.value
      }
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={type === 'salesDC' || type === 'bills' ? '' : labelName}
          variant={type === 'salesDC' ? 'standard' : "filled"}
          required={required}
          placeholder={type === 'salesDC' || type === 'bills' ? '' : "Select Tax Category"}
        />
      )}
    />
  );
}
