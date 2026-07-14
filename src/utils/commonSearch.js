import React, { useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import AppSearchBar from '@crema/core/AppSearchBar';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { searchErrorMessage } from './content';

export default function CommonSearch(props) {
    const { searchVal, cancelSearch, requestSearch, type, focus } = props;

    const [inputValue, setInputValue] = useState(searchVal || '');
    const dispatch = useDispatch()

    useEffect(() => {
        setInputValue(searchVal || '');
    }, [searchVal]);

    const debounceTimer = useRef(null);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        
        // 1. Update the UI instantly so typing feels fast
        setInputValue(value);

        // 2. Clear any pending API calls from the previous keystroke
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // 3. Set a strict 800ms delay before talking to index.js
        debounceTimer.current = setTimeout(() => {
            if (value.length === 0) {
                if (cancelSearch) cancelSearch();
            }
            else{
                if (requestSearch) requestSearch({ target: { value } });
            }
        }, 1000); // <-- 800ms wait time. Adjust as needed.
    };

    const handleClear = () => {
        setInputValue('');
        if (cancelSearch) {
            cancelSearch();
        } else if (requestSearch) {
            requestSearch({ target: { value: '' } });
        }
    };

    return (
        <AppSearchBar
            iconPosition='right'
            overlap={false}
            value={inputValue}
            onChange={handleSearchChange}
            iconStyle={{
                color: 'grey',
                display: inputValue ? 'none' : 'flex',
            }}
            endAdornment={
                inputValue ? (
                    <InputAdornment position='end' sx={{ mr: 4 }}>
                        <IconButton
                            size='small'
                            onClick={handleClear}
                            edge='end'
                            aria-label='clear search'
                        >
                            <CloseIcon fontSize='small' />
                        </IconButton>
                    </InputAdornment>
                ) : null
            }
            placeholder='Search here'
            sx={{
                width: '100%',
                maxWidth: 280,
                '& .MuiInputBase-root': {
                    position: 'relative',
                    width: '100%',
                    minWidth: 0,
                },
                '& .MuiInputAdornment-root': {
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginRight: 0,
                },
                '& .MuiInputBase-input': {
                    width: '100%',
                    minWidth: 0,
                    paddingRight: inputValue ? '40px' : undefined,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                },
            }}
        />
    );
}
