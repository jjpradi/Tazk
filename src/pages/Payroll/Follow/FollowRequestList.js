import React from 'react';
import { List, ListItem, ListItemText, Button, Divider, Avatar, Typography } from '@mui/material';

const listItemSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    borderRadius: 1,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    mb: 1,
};
const avatarSx = { mr: 2, bgcolor: 'primary.main' };
const senderNameSx = { fontWeight: 'bold' };
const approveButtonSx = {
    bgcolor: 'success.main',
    color: 'success.contrastText',
    '&:hover': { bgcolor: 'success.dark' },
};
const denyButtonSx = {
    bgcolor: 'error.main',
    color: 'error.contrastText',
    '&:hover': { bgcolor: 'error.dark' },
    ml: 5,
};

function FollowRequestList({ requests, onApprove, onDeny }) {

    return (
        <List>
            {requests.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <Typography variant="subtitle1">No Requests Found</Typography>
                </div>
            ) : (
                requests.map((request, index) => (
                    <React.Fragment key={index}>
                        <ListItem sx={listItemSx}>
                            <Avatar sx={avatarSx}>
                                {request.sender.charAt(0)}
                            </Avatar>
                            <div>
                                <Typography sx={senderNameSx} variant="subtitle1">
                                    {request.sender}
                                </Typography>
                                <ListItemText primary="sent a follow request" />
                            </div>
                            <div>
                                <Button
                                    sx={approveButtonSx}
                                    onClick={() => onApprove(request.sendreq, request.id)}
                                    variant="contained"
                                >
                                    Approve
                                </Button>
                                <Button
                                    sx={denyButtonSx}
                                    onClick={() => onDeny(request.sendreq, request.id)}
                                    variant="contained"
                                >
                                    Deny
                                </Button>
                            </div>

                        </ListItem>
                        {index < requests.length - 1 && <Divider />}
                    </React.Fragment>
                ))
            )}
        </List>

    );
}

export default FollowRequestList;
