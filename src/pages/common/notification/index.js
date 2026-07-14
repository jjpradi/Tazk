import React, { useEffect, useState, useContext } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useDispatch, useSelector } from 'react-redux';
import { listEmployeeAction } from '../../../redux/actions/message_actions';
import messageReducer from './../../../redux/reducers/message_reducers';
import { clearNotificationAction, listNotificationAction } from 'redux/actions/notification_actions';
import { Avatar, Button, Card, Checkbox, FormControlLabel, FormGroup, List, ListItem, ListItemAvatar, Typography } from '@mui/material';
import moment from 'moment';
import CommonSearch from 'utils/commonSearch';
import { pageSize } from 'utils/pageSize';
import { getsessionStorage } from '../../../pages/common/login/cookies';

const Notification = () => {
      const storage = getsessionStorage()
    const [checkedItems, setCheckedItems] = useState({});
    const dispatch = useDispatch();
    const { NotificationReducer: { getnotificationdata } } = useSelector((state) => state);
    const [page, setPage] = useState(0)
    const [searchVal, setSearchVal] = useState('')
    const checkedItemsLength = Object.values(checkedItems).filter(Boolean).length;
    console.log(getnotificationdata.length,'datalength')
    useEffect(() => {
        let data = {
      pageCount: page,
      numPerPage: pageSize,
      searchString : '',
      employeeId : storage.employee_id
    }
        dispatch(listNotificationAction(data));
    }, [dispatch]);

    const handleClose = () => {
        window.location.replace(`${window.location.origin}/common/home`);
    };

    const handleChange = (id) => {
        setCheckedItems((prevCheckedItems) => ({
            ...prevCheckedItems,
            [id]: !prevCheckedItems[id],
        }));
    };

    const handleCheckAll = () => {
        const allChecked = checkedItemsLength !== getnotificationdata.length;
        const newCheckedItems = {};

        getnotificationdata.forEach((d) => {
            newCheckedItems[d.id] = allChecked;
        });

        setCheckedItems(newCheckedItems);
    };

    const handleDelete = () => {
        if (checkedItemsLength > 0) {
            const data = {
                notificationId: Object.keys(checkedItems).filter(id => checkedItems[id])
            };
            dispatch(clearNotificationAction(data, (response) => {
                if (response === 200) {
                    let data = {
                        pageCount: page,
                        numPerPage: pageSize,
                        searchString: '',
                        employeeId : storage.employee_id
                    }
                    dispatch(listNotificationAction(data));
                }
            }));
            setCheckedItems({});
        }
    };

    const cancelSearch = () => {
    setSearchVal('')
    let payload = {
          pageCount: page,
          numPerPage: pageSize,
          searchString: '',
          employeeId : storage.employee_id
      }
    dispatch(listNotificationAction(payload))
  };

  const requestSearch = (e) => {
    const val = e?.target?.value || '';
    setSearchVal(val)
      let payload = {
          pageCount: page,
          numPerPage: pageSize,
          searchString: val,
          employeeId : storage.employee_id
      }
    console.log(val, payload, 'valpayload')
    dispatch(listNotificationAction(payload))
  };

    return (
        // <Grid
        //     container
        //     spacing={4}
        //     // display='flex'
        //     // flexDirection='row'
        // >
        //     <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> 
        //         <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
        //             <Typography variant='h6'>All Notification List</Typography>
        //         </Grid>
        //         <Grid container>
        //             <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> 
        //                 <Grid lg={6} md={6} sm={6} xs={12} 
        //                     // container 
        //                     // justify="flex-end"
        //                 >
        //                     <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
        //                 </Grid>            
        //                 <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }} >
        //                     <Button variant="contained" color="secondary" onClick={handleCheckAll}>Clear All</Button>
        //                 </Grid>
        //             </Grid>
        //         </Grid>
        //     </Grid>
        <Card style={{height: 'calc(100vh - 80px)'}}>
            <Grid container spacing={4}>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Typography variant='h6'>All Notification List</Typography>
                </Grid>
                <Grid
                    size={{
                        lg: 8.5,
                        md: 8.5,
                        sm: 8.5,
                        xs: 12
                    }}>
                    <CommonSearch
                    searchVal={searchVal}
                    cancelSearch={cancelSearch}
                    requestSearch={requestSearch}/>

                </Grid>
                <Grid
                    size={{
                        lg: 1.5,
                        md: 1.5,
                        sm: 1.5,
                        xs: 5
                    }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCheckAll}
                    >
                        {checkedItemsLength === getnotificationdata.length ? 'Unselect' : 'Select All'}
                    </Button>
                </Grid>
                <Grid
                    size={{
                        lg: 1,
                        md: 1,
                        sm: 1,
                        xs: 3
                    }}>
                    <Button variant="contained" color="inherit" onClick={handleDelete}>Clear</Button>
                </Grid>
                <Grid
                    size={{
                        lg: 1,
                        md: 1,
                        sm: 1,
                        xs: 4
                    }}>
                    <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
                </Grid>
                {getnotificationdata.map(d => (
                    <Grid
                        key={d.id}
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Card>
                            <Grid container display='flex' flexDirection='row' spacing={2} alignItems='center' justifyContent='center' p='10px'>
                                <Grid
                                    size={{
                                        lg: 1,
                                        md: 1,
                                        sm: 1,
                                        xs: 12
                                    }}>
                                    <ListItemAvatar sx={{ minWidth: 0, mr: 4 }}>
                                        <Avatar src={d.image} />
                                    </ListItemAvatar>
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 2,
                                        md: 3,
                                        sm: 3,
                                        xs: 12
                                    }}>
                                    <Typography>{d.title}</Typography>
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 6,
                                        md: 5,
                                        sm: 5,
                                        xs: 12
                                    }}>
                                    <Typography>{d.content_body}</Typography>
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 2.5,
                                        md: 2,
                                        sm: 2,
                                        xs: 12
                                    }}>
                                    <Typography>{moment(d.time).format('DD/MM/yyyy HH:mm:ss')}</Typography>
                                </Grid>
                                <Grid
                                    size={{
                                        lg: 0.5,
                                        md: 1,
                                        sm: 1,
                                        xs: 12
                                    }}>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={<Checkbox checked={checkedItems[d.id] || false} onChange={() => handleChange(d.id)} />}
                                        />
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Card>
    );
};

export default Notification;
