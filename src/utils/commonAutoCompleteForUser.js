import {
  Autocomplete,
  Checkbox,
  ListItemText,
  TextField,
  Chip,
  createFilterOptions,
  Paper,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getsessionStorage } from 'pages/common/login/cookies';
import { capitalize } from 'lodash';
import { useRef } from 'react';


export default function CommonUserAutoComplete(props) {
  const {
    type,
    value,
    allEmployeesSelected = false,
    setAllEmployeesSelected,
    labelName,
    setValue,
    error,
    selectedAll,
    setSelectedAll,
    searchVal,
    requestSearch,
    searchType,
    reqType,
    disabled = false,
    pageType,
    isMandatory
  } = props;

  const searchList = searchVal ? searchType : type;
  const listboxRef = useRef(null);
  const scrollTopRef = useRef(0);
  const storage = getsessionStorage();
  const isReportingManagerCompany = Number(storage?.company_type) === 5;

  const allOption = pageType == 'approvals' ? {
    first_name: "Reporting Manager",
    resolver_type: "REPORTING_MANAGER",
    employee_id: "0",
  } : {
    first_name: "All Employees",
    last_name: "",
    employee_code: "",
    employee_id: "all",
  }

  const [list, setList] = useState([]);


  useEffect(() => {
    if (value?.length === 0) setSelectedAll(false);
  }, [value]);

  useEffect(() => {
    if (allEmployeesSelected) {
      setValue(searchList);
      setSelectedAll(true);
    }
  }, [allEmployeesSelected, searchList]);


  useEffect(() => {
    if (searchList.length === 0) {
      setList([]);
    } else {
      const shouldShowAllOption =
        pageType === 'approvals' ? isReportingManagerCompany : true;
      let arr = [
          ...(shouldShowAllOption ? [allOption] : []),
          ...searchList.sort((a, b) =>
          (a.first_name || "").localeCompare(b.first_name || "")
        ),
      ];
      setList(arr);
    }
  }, [searchList, pageType, isReportingManagerCompany]);


  useEffect(() => {
    const allSelected =
      pageType !== 'approvals' &&
      searchList.length > 1 &&
      value.length === searchList.length &&
      searchList.every((item) =>
        value.some((selected) => selected.employee_id === item.employee_id)
      );

    if (allSelected !== selectedAll) setSelectedAll(allSelected);
  }, [value, searchList, selectedAll, pageType]);



  const handleDelete = (item) => {
    let result = value.filter((x) => x.employee_id !== item.employee_id);
    setValue(result);
  };

  const filterOptions = createFilterOptions({ trim: true });


  const MAX_VISIBLE = 1;
  
  return (
    <>
      <Autocomplete
        multiple
        size="small"
        filterOptions={filterOptions}
        disableCloseOnSelect
        options={list}
        value={value}
        disabled={disabled}
        required={!reqType && isMandatory}
        getOptionLabel={(option) =>
          `${capitalize(option.first_name)} ${option.last_name ? capitalize(option.last_name) : ""
          } ${option.employee_code ? " - " + option.employee_code : ""}`
        }


        sx={{
          "& .MuiInputBase-root": {
            minHeight: "46px",
            maxHeight: "46px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          },
        }}

        renderOption={(props, option) => (
          <li {...props} style={{ height: 40 }}>
            <Checkbox
              checked={
                value.some((i) => i.employee_id === option.employee_id) ||
                (option.employee_id === "all" && selectedAll)
              }
              disabled={pageType !== 'approvals' && option.employee_id !== "all" && selectedAll}
              sx={{ marginRight: 1 }}
            />
            <ListItemText
              primary={`${capitalize(option.first_name)} ${option.last_name ? capitalize(option.last_name) : ""
                } ${option.employee_code ? " - " + option.employee_code : ""
                }`}
            />
          </li>
        )}

        ListboxProps={{
             ref: listboxRef,
             style: { maxHeight: "170px" },
             onScroll: (e) => {
               scrollTopRef.current = e.currentTarget.scrollTop;
             },
           }}



        renderInput={(params) => {
          const isErrorVisible = value?.length === 0 ? Boolean(error) : false;
          const errorText = value?.length === 0 ? (error || "") : "";
        return(
          <TextField
            {...params}
            fullWidth
            label={
                <>
                  {labelName || 'Select Employees'}
                  {(props.required || props.isMandatory) && (
                    <span
                      style={{
                        color: 'red',
                        marginLeft: 4,
                        fontSize: '1.15rem',   
                      }}
                    >
                      *
                    </span>
                  )}
                </>
              }
            variant="filled"
            size="small"
            error={isErrorVisible}
            helperText={errorText}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiInputBase-root": {
                minHeight: "46px",
                maxHeight: "46px",
                overflow: "hidden",
                display: "flex",
                flexWrap: "nowrap",
              },
              "& .MuiChip-root": {
                height: "26px",
                margin: "2px",
                flexShrink: 0,
              }
            }}

          />
        )
        }}

        PaperComponent={(props) => (
          <Paper {...props} style={{ maxHeight: 170, overflowY: "auto" }} />
        )}


        renderTags={(value, getTagProps) => {
          if (selectedAll) {
            return (
              <Chip
                label="All Employees"
                onDelete={() => {
                  setValue([]);
                  setSelectedAll(false);
                }}
                sx={{ height: 28, margin: "2px" }}
              />
            );
          }

          const visible = value.slice(0, MAX_VISIBLE);
          const hiddenCount = value.length - MAX_VISIBLE;

          return (
            <>
              {visible.map((item, index) => (
                <Chip
                  key={item.employee_id || index}
                  {...getTagProps({ index })}
                  label={`${capitalize(item.first_name)} ${capitalize(
                    item.last_name
                  )}${item.employee_code ? " - " + item.employee_code : ""
                    }`}
                  onDelete={() => handleDelete(item)}
                  sx={{ height: 28, margin: "2px" }}
                />
              ))}

              {hiddenCount > 0 && (
                <Chip
                  label={`+${hiddenCount}`}
                  sx={{
                    height: 28,
                    margin: "2px",
                    background: "#e0e0e0",
                    cursor: "pointer",
                  }}
                />
              )}
            </>
          );
        }}


        onChange={(event, newValue) => {
          const selectAll = newValue.find((i) => i.employee_id === "all");
          const prevScroll = scrollTopRef.current;
        if (selectAll) {
             if (!selectedAll) setValue(searchList);
             else setValue([]);
               setSelectedAll(!selectedAll);

               setTimeout(() => {
                if (listboxRef.current) {
                   listboxRef.current.scrollTop = prevScroll;
                }
            }, 0);
          return;
        }

         const uniqueValues = newValue.filter(
              (item, index, self) =>
             index === self.findIndex((i) => i.employee_id === item.employee_id)
             );

             setValue(uniqueValues);
            setSelectedAll(false);

           setTimeout(() => {
             if (listboxRef.current) {
             listboxRef.current.scrollTop = prevScroll;
            }
        }, 0);
    }}


        onInputChange={(event, newValue) => requestSearch(newValue)}
      />
    </>
  );
}
