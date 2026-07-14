// import * as React from 'react';
// import Button from '@mui/material/Button';
// import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
// import { useSelector } from 'react-redux';
// import { Avatar, Box, Grid, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
// import { List } from 'react-content-loader';
// import personIcon from '../../../assets/dashboardIcons/total-clients.svg';

// export default function ConflictLeaveDialog(props) {
//     const [open, setOpen] = React.useState(false);
//     const { leaveRequestReducer: { conflictLeaveRequest } } = useSelector((state) => state)

//     const handleClickOpen = () => {
//         setOpen(true);
//     };

//     const handleClose = () => {
//         setOpen(false);
//     };

// const DateWithDayMonthFormat = (date) => {
//     let now = new Date(date);
//     let day = now.getDate();
//     let month = now.toLocaleString('default', { month: 'short' })
//     return month+' '+day
// }

// const handleStatus = (data,approvedBy,cancelledBy, allData) => {
//     if(data === 'Approved'){
//       return `${approvedBy} approved time off`
//     } else if(data === "Pending"){
//       return `${allData.username} Request ${allData.status} for ${allData.reason} leave`
//     } else{
//       return `${cancelledBy} cancelled time off`
//     }
// }


//     return (
//         <>
//             {/* <Button variant="outlined" onClick={handleClickOpen}>
//                     Open alert dialog
//             </Button> */}
//             <Dialog
//                 open={props.openDialog}
//                 onClose={() => props.handleDialogClose(false)}
//                 aria-labelledby="alert-dialog-title"
//                 aria-describedby="alert-dialog-description"
//             >
//                 <DialogTitle id="conflictleavedialog-dialog-title">
//                     {"Use Google's location service?"}
//                 </DialogTitle>
//                 {/* <DialogContent> */}
//                     {/* <DialogContentText id="conflictleavedialog-dialog-description"> */}
//                         {
//                             conflictLeaveRequest.length > 0 ?
//                                 (
//                                     <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} style={{ marginLeft: '20px' }}>
//                                         <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
//                                             {/* <nav aria-label="main mailbox folders"> */}
//                                                 <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
//                                                     {/* {conflictLeaveRequest.length > 0 ? conflictLeaveRequest?.map((f) => ( */}
//                                                         <ListItem >
//                                                             {/* <ListItemButton onClick={() => this.handleApproveRequest(f.leaveId)}> */}
//                                                                 {/* <ListItemAvatar>
//                                                                     <Avatar>
//                                                                         <img src={personIcon} height={60} width={40} />
//                                                                     </Avatar>
//                                                                     </ListItemAvatar> */}
//                                                                     <ListItemAvatar>
//                                                                         <Avatar>
//                                                                             <img src={personIcon} height={60} width={40} />
//                                                                         </Avatar>
//                                                                     </ListItemAvatar>
//                                                                     <ListItemText primary="Photos" secondary="Jan 9, 2014" />
//                                                                     {/* <ListItemText
//                                                                         primary={`${handleStatus(f.status, f.approvedBy, f.cancelledBy, f)}`} 
//                                                                         secondary={`${DateWithDayMonthFormat(f.fromDate)}, ${f.allDay === 0 ? "All day" : "Half day"}`} /> */}
//                                                             {/* </ListItemButton> */}
//                                                         </ListItem>
//                                                     {/* )) : []} */}

//                                                 </List>
//                                             {/* </nav> */}
//                                         </Box>
//                                     </Grid>
//                                 ) :
//                                 (
//                                     ''
//                                 )
//                         }
//                     {/* </DialogContentText> */}
//                 {/* </DialogContent> */}
//                 <DialogActions>
//                     <Button onClick={() => props.handleDialogClose(false)}>Disagree</Button>
//                     <Button onClick={handleClose} autoFocus>
//                         Agree
//                     </Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// }

import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import { useSelector } from 'react-redux';
import personIcon from '../../../assets/dashboardIcons/total-clients.svg';
import { Box, Divider, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

const emails = ['username@gmail.com', 'user02@gmail.com'];

export default function ConflictLeaveDialog(props) {
    // const { openDialog, handleCancel, handleConflictApprove } = props;
    const { leaveRequestReducer: { conflictLeaveRequest } } = useSelector((state) => state)

    // const handleClose = () => {
    //     onClose(selectedValue);
    // };

    // const handleListItemClick = (value) => {
    //     onClose(value);
    // };

    // console.log('propss',props)

    const handleStatus = (data, approvedBy, cancelledBy, allData) => {
        // console.log('allData',allData)
        if (data === 'Approved') {
            return `${approvedBy} approved time off`
        } else if (data === "Pending") {
            return `${allData.username} Request ${allData.status} for ${allData.reason}`
        } else {
            return `${cancelledBy} cancelled time off`
        }
    }

    const DateWithDayMonthFormat = (date) => {
        let now = new Date(date);
        let day = now.getDate();
        let month = now.toLocaleString('default', { month: 'short' })
        return month + ' ' + day
    }


    return (
        <Dialog onClose={() => props.handleDialogClose(false)} open={props.openDialog}>
            <DialogTitle>Conflict Requests
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => props.handleConflictClose(false)}
              aria-label="close"
             sx={{
               position: 'absolute',
               right: 8,
               top: 8,
      }}
    >
      <CloseIcon />
    </IconButton>
            </DialogTitle>
            <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {conflictLeaveRequest.map((d) => (
                        <>
                            <ListItem disableGutters>
                                <ListItemButton  key={d.leaveId}> {/* onClick={() => handleListItemClick(d.leaveId)} */}
                                    <ListItemAvatar>
                                        <Avatar>
                                            <img src={personIcon} height={60} width={40} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={`${handleStatus(d.status, d.approvedBy, d.cancelledBy, d)}`} secondary={`${DateWithDayMonthFormat(d.fromDate)}, ${d.request_type === 1 ? "All day" : d.startTime + ' - ' + d.endTime}`} />
                                </ListItemButton>
                            </ListItem>

                            <ListItem>
                                <Grid
                                    size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                    }}>
                                    <Grid container direction='row'>
                                        <Grid
                                            size={{
                                                lg: 3,
                                                md: 3.5,
                                                sm: 4,
                                                xs: 4.5
                                            }}>
                                            <Button variant="outlined" onClick={() => props.handleCancel(d)}>deny</Button>
                                        </Grid>
                                        <Grid
                                            size={{
                                                lg: 3,
                                                md: 3.5,
                                                sm: 4,
                                                xs: 4.5
                                            }}>
                                            <Button variant="contained" onClick={() => props.handleConflictApprove(d)}>Approve</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </ListItem>

                            <Divider />
                        </>
                    ))}
                </List>
            </Box>
        </Dialog>
    );
}

// SimpleDialog.propTypes = {
//     onClose: PropTypes.func.isRequired,
//     open: PropTypes.bool.isRequired,
//     selectedValue: PropTypes.string.isRequired,
// };

// export default function ConflictLeaveDialog(props) {
//     const [open, setOpen] = React.useState(false);
//     const [selectedValue, setSelectedValue] = React.useState(emails[1]);

//     const handleClickOpen = () => {
//         setOpen(true);
//     };

//     const handleClose = (value) => {
//         setOpen(false);
//         setSelectedValue(value);
//     };

//     return (
//         <div>
//             {/* <Typography variant="subtitle1" component="div">
//         Selected: {selectedValue}
//       </Typography>
//       <br />
//       <Button variant="outlined" onClick={handleClickOpen}>
//         Open simple dialog
//       </Button> */}
//             <SimpleDialog
//                 selectedValue={selectedValue}
//                 open={props.openDialog}
//                 onClose={() => props.handleDialogClose(false)}
//                 handleCancel={() => props.handleCancel()}
//                 handleConflictApprove={() => props.handleConflictApprove()}
//             />
//         </div>
//     );
// }