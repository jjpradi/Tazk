// import React, { useState, useEffect, useContext } from "react";
// import Button from '@mui/material/Button';
// import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
// import DragDashboardList from './dragDashboardList';
// import { listDashboardAction } from 'redux/actions/dashboard_role_actions';
// import apiCalls from 'utils/apiCalls';
// import { useDispatch, useSelector } from "react-redux";
// import CreateNewButtonContext from "../../context/CreateNewButtonContext";

// export default function DashboardDialog() {
//     const [open, setOpen] = React.useState(false);    
    // const dispatch = useDispatch();
    // const { DashboardRoleReducer: {getalldashboarddata} } = useSelector((state) => state);  
    // const {setModalTypeHandler, setLoaderStatusHandler,} = useContext(CreateNewButtonContext);

    // useEffect(() => {
    //     apiCalls(
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     dispatch(listDashboardAction())
    //     );
    // }, []);

//     const handleClickOpen = () => {
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//     };

//     return (
//         <div>
//             <Button variant="outlined" onClick={handleClickOpen}>
//                 Open alert dialog
//             </Button>
//             <Dialog
//                 open={open}
//                 onClose={handleClose}
//                 maxWidth={'sm'}
//                 scroll={'paper'}
//                 aria-labelledby="alert-dialog-title"
//                 aria-describedby="alert-dialog-description"
//             >
//                 <DialogTitle id="dashboarddialog-dialog-title">
//                     {"Use Google's location service?"}
//                 </DialogTitle>
//                 <DialogContent>
//                     <DialogContentText id="dashboarddialog-dialog-description">
//                         <DragDashboardList getalldashboarddata={getalldashboarddata} />
//                     </DialogContentText>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleClose}>Disagree</Button>
//                     <Button onClick={handleClose} autoFocus>Agree</Button>
//                 </DialogActions>
//             </Dialog>
//         </div>
//     );
// }

import React, { useState, useEffect, useContext, useRef } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox, FormControl } from "@mui/material";
import CreateNewButtonContext from "../../../context/CreateNewButtonContext";
import { useDispatch, useSelector } from "react-redux";
import apiCalls from "utils/apiCalls";
import { listDashboardAction, listDashboardByRoleAction, updateDashboardListAction } from "redux/actions/dashboard_role_actions";
import Cookies from 'universal-cookie';

function ConfirmationDialogRaw(props) {
    const { onClose, value: valueProp, open, setLoad, load, ...other } = props;
    const [value, setValue] = useState(valueProp);
    const [checked, setChecked] = useState([]);
    const radioGroupRef = useRef(null);
    const cookies = new Cookies();
    const dispatch = useDispatch();
    const { DashboardRoleReducer: {getalldashboarddata,dashboardRoleData, dashboardListByRole} } = useSelector((state) => state);  
    const {setModalTypeHandler, setLoaderStatusHandler,} = useContext(CreateNewButtonContext);

    useEffect(() => {
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
        );
    }, []);


    useEffect(() => {
        if (!open) {
            setValue(valueProp);
        }
    }, [valueProp, open]);

    const handleEntering = () => {
        if (radioGroupRef.current != null) {
            radioGroupRef.current.focus();
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const handleOk = () => {
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            // dispatch(getDashboardRoleDataAction(cookies.get('login')?.role_id)),
            dispatch(updateDashboardListAction(checked))
        );
        let flag = load + 1
        setLoad(flag)
        onClose(value);
    };

    const handleChange = (event, dashName) => {
        setChecked({ ...checked,[dashName] : event.target.checked })
    };    
    

    return (
        <Dialog
            sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435, height: "80%" } }}
            maxWidth="xs"
            TransitionProps={{ onEntering: handleEntering }}
            open={open}
            onClose={handleCancel}
            {...other}
        >
            <DialogTitle>Dashboard List</DialogTitle>
            <DialogContent dividers>

                    {dashboardRoleData.map((option) => (
                        <FormControl key={option.id} sx={{ mr: 25 }}>
                            <FormControlLabel
                                value={option.dashboard_name}
                                key={option.dashboard_id}
                                control={
                                    <Checkbox
                                        name="dashboardList"
                                        aria-label="dashboardList"
                                        ref={radioGroupRef}
                                        // value={value}
                                        defaultChecked={option.is_active === 1 ? true : false}
                                        onChange={(e) => handleChange(e,option.dashboard_id)}
                                    />
                                }
                                label={option.dashboard_name}
                            />
                        </FormControl>
                    ))}
                {/* </DraggableList> */}
                
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleCancel}>
                    Cancel
                </Button>
                <Button onClick={handleOk}>Ok</Button>
            </DialogActions>
        </Dialog>
    );
}

ConfirmationDialogRaw.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired
};

export default function DashboardDialog({ load, setLoad }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    const handleClickListItem = () => {
        setOpen(true);
    };

    const handleClose = (newValue) => {
        setOpen(false);

        if (newValue) {
            setValue(newValue);
        }
    };


    return (
        <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
            <List component="div" role="group">
                <ListItem
                    // divider
                    aria-haspopup="true"
                    aria-controls="dashboardList-menu"
                    aria-label="dashboard list"
                    onClick={handleClickListItem}
                >
                    <ListItemText primary="Dashboard list" secondary={value} />
                </ListItem>

                <ConfirmationDialogRaw
                    id="dashboardList-menu"
                    keepMounted
                    open={open}
                    onClose={handleClose}
                    value={value}
                    setLoad={setLoad}
                    load={load}
                />
            </List>
        </Box>
    );
}
