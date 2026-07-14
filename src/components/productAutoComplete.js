import React from 'react';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import {Close, Add, Edit} from '@mui/icons-material';
import {TextField, IconButton, Tooltip, Icon} from '@mui/material';
import CommonToolTip from './ToolTip';

export default function ProductSelect({
  name,
  label,
  value,
  product,
  interSection = [],
  filterOptions,
  onChange,
  error,
  addIconClick,
  editIconClick,
  getOptionLabel,
  disabled=false,
  edit,
  variantType,
  productReturn,
  onInputChange,
  onKeyDown,
  sale_type,
  productCreateBtn,
  productEditBtn
}) {
  return (
    <CommonToolTip title = {value?.name || ''}>
      <Autocomplete
        fullWidth
        name={name}
        value={value}
        options={product.filter(
          (p1) => !interSection.some((s1) => p1.item_id === s1.item_id),
        )}
        getOptionLabel={(option) => {
          const label = getOptionLabel ? getOptionLabel(option) : option?.name;
          return label == null ? '' : label;
        }}
        disableCloseOnSelect
        // inputProps={{ value: props.value }}
        filterOptions={filterOptions}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        onChange={onChange}
        autoHighlight={true}
        // style={{width: 250}}
        disabled={disabled}
        noOptionsText="Not Available"
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.item_id}>
              {option.name}
            </li>
          );
        }}
        renderInput={(params) => {
          const get = {...params};

          get.InputProps = {
            ...params.InputProps,
            style: {
              paddingLeft: '1px'},
            startAdornment: !productReturn ? (
              edit ? (
                productEditBtn && <Tooltip title='Edit'>
                  {
                    variantType === 'standard' ?
                      <Icon onClick={editIconClick} style={{ cursor : 'pointer', color : '#666666' }}>
                        edit
                      </Icon>
                    :
                    <IconButton size='small' onClick={editIconClick}>
                      <Edit fontSize='small' />
                    </IconButton>
                  }
                </Tooltip>
            ) : sale_type == 1 ? (
              productCreateBtn && <Tooltip title='Create New'>
                {
                  variantType === 'standard' ? 
                    <Icon onClick={addIconClick} style={{ cursor : 'pointer', color : '#666666' }}>
                      add
                    </Icon>
                  :
                  <IconButton size='small' onClick={addIconClick}>
                    <Add fontSize='small' />
                  </IconButton>
                }
                </Tooltip>
            ) : null
            ) : null,
          };

          return (
            //autoFocus
            <TextField {...get} error={error} fullWidth label={label} variant={variantType ? 'standard' : 'filled'} />
          );
        }}
      />
    </CommonToolTip>
  );
}
