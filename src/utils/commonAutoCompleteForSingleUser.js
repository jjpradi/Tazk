import React, { useEffect, useState } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { capitalize } from 'lodash';


import { getsessionStorage } from 'pages/common/login/cookies';



export default function CommonUserAutoCompleteForSingleUser(props) {

//    console.log("444",props.filter)
    const { type, value, labelName, setValue, error, searchVal, requestSearch, searchType, setSearchValEmployeeFilter, pageType } = props;
    // console.log("valu",value)
    const storage = getsessionStorage()
    const isReportingManagerCompany = Number(storage?.company_type) === 5;

    const typeOptions = Array.isArray(type) ? type : [];
    const searchedOptions = Array.isArray(searchType) ? searchType : [];
    const searchList = searchVal ? searchedOptions : typeOptions;

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
        setList(searchList);
    }, [searchList]);

    const handleDelete = () => {
        setValue({});
    }

    useEffect(() => {
        if (props.filter === true && (storage.role_name === 'Employee' ||storage.role_name === 'Manager' )) {
            setValue(typeOptions[0])
        }
    }, [props.filter, storage.role_name, typeOptions])

    
    useEffect(() => {
        if (pageType == 'approvals') {
            if (searchList.length === 0) {
                setList([]);
            } else {
                let arr = [
                    ...(isReportingManagerCompany ? [allOption] : []),
                    ...searchList.sort((a, b) =>
                        (a.first_name || "").localeCompare(b.first_name || "")
                    ),
                ];
                setList(arr);
            }
        }
    }, [pageType, searchList, isReportingManagerCompany]);

    // if(labelName === 'Assignee'){
    //     useEffect(() => {
    //         if (labelName === 'Assignee') {
    //             console.log(list, "ccccc")
    //             const temp = list?.find( e => e.employee_id == value.asignee)
    //             setValue(temp)
    //             console.log(temp, "temp21")
    //         }
    //     }, [list])
    // }

    const handleAutocompleteChange = (event, newValue) => {

        if (!newValue) {
            setValue(null);
            setSearchValEmployeeFilter('')
        } else {

            setValue(newValue);
        }
    };

    const handleInputChange =(event) =>{
        const newValue = event.target.value;

        if (newValue === '') {
            setValue([]);
            setSearchValEmployeeFilter('');
            return;
        }
        requestSearch(newValue);
    }

    const variants = {
        "Assignee": "outlined",
        "Select Employee": "filled",
        "Select Verifier":"filled",
        "Select Engineer":"filled"
    }

    const filterOptions = createFilterOptions({
        trim: true,
      });

    return (
        <Autocomplete
            // required
            options={list}
            disabled={props?.disabled}
            filterOptions={filterOptions}
            getOptionLabel={(option) =>
                `${capitalize(option.first_name)} ${option.last_name ? capitalize(option.last_name) : ''} ${option.employee_code ?  ' - ' + option.employee_code  : ''}`
              }
            renderOption={(props, option) => (
                <li {...props} style={{ height: '40px' }}>
                    <Checkbox
                        style={{ marginRight: 8 }}
                        checked={value && value.first_name === option.first_name  && value.employee_code === option.employee_code}
                    />
                    <ListItemText
                        primary={`${capitalize(option.first_name)} ${option.last_name ? capitalize(option.last_name) : ''} ${option.employee_code ? ' - ' + option.employee_code : ''}`}
                    />
                </li>
            )}
            ListboxProps={{
                style: {
                    maxHeight: "170px",
                },
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth
                    style={{ margin: 0 }}
                    label={labelName}
                    variant={variants[labelName]}
                    placeholder={props.placeholder ? props.placeholder : 'Employee...'}
                    required={props.isMandatory ? true : false}
                    error={!error ? false : true}
                    helperText={!error ? '' : error}
                    onChange={handleInputChange}


                />
            )}
            value={value}
            onChange={handleAutocompleteChange}
      

        />
    );
}
