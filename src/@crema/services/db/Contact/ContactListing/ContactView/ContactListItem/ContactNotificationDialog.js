import React, {useState, useEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Button,
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
  listenabledntfyAction,
  updatedNtfyAction,
} from 'redux/actions/notification_actions';
import {getsessionStorage} from 'pages/common/login/cookies';

const ContactNotificationDialog = ({ open, onClose, person_id }) => {
  const dispatch = useDispatch();
  let storage = getsessionStorage();
  let receiver_id = storage.person_id;
  const {
    NotificationReducer: {list_enabled},
  } = useSelector((state) => state);

  // Step 2: Create state for checkbox data
  const [checkboxData, setCheckboxData] = useState({
    earlyCheckOut: false,
    lateLogin: false,
    present: false,
    absent: false,
  });

  useEffect(() => {
    // Create a copy of the existing checkboxData
    const updatedCheckboxData = {...checkboxData};

    for (let obj of list_enabled) {
      // Use hasOwnProperty in a safer way
      if (Object.prototype.hasOwnProperty.call(updatedCheckboxData, obj.type)) {
        // If the key 'type' from object 'obj' exists in updatedCheckboxData, set it to 'true'
        updatedCheckboxData[obj.type] = true;
      }
    }

    // Update the checkboxData state with the updated data
    setCheckboxData(updatedCheckboxData);
    return () => {
      setCheckboxData({
        earlyCheckOut: false,
        lateLogin: false,
        present: false,
        absent: false
      })
    }
  }, [list_enabled, open]);

  const handleCheckboxClick = (event) => {
    const {name, checked} = event.target;
    setCheckboxData((prevCheckboxData) => ({
      ...prevCheckboxData,
      [name]: checked,
    }));
  };

  const handleSubmit = () => {
    let trueKeys = [];

    for (let key in checkboxData) {
      if (checkboxData[key] === true) {
        trueKeys.push(key);
      }
    }

    let data = {
      receiver_id: receiver_id,
      senderId: person_id,
      filtered: trueKeys,
    };
    dispatch(updatedNtfyAction(data));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Notification Settings</DialogTitle>
      <DialogContent sx={{minWidth: '600px'}}>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxData.earlyCheckOut}
                onChange={handleCheckboxClick}
                name='earlyCheckOut'
              />
            }
            label='Early check out'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxData.lateLogin}
                onChange={handleCheckboxClick}
                name='lateLogin'
              />
            }
            label='Late login'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxData.present}
                onChange={handleCheckboxClick}
                name='present'
              />
            }
            label='Present'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkboxData.absent}
                onChange={handleCheckboxClick}
                name='absent'
              />
            }
            label='Absent'
          />
        </FormGroup>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px',
          }}
        >
          <Button onClick={onClose}>Close</Button>
          <Button
            sx={{marginLeft: '10px'}}
            variant='contained'
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

ContactNotificationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ContactNotificationDialog;
