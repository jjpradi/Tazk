import { Card } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { qrAttendanceAction } from 'redux/actions/attendance_actions';
import QrView from 'components/qrAttendance/qrView';

function QRAttendance() {
    const dispatch = useDispatch();
    const {
        stockLocationReducer: { allliststocklocation },
        attendanceReducer: { qrAttendance },
    } = useSelector((state) => state);

    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
    } = useContext(CreateNewButtonContext);

    const [location, setLocation] = useState('');
    const [locationName, setLocationName] = useState('');
    const [locationObject, setLocationObject] = useState({});
    const [time, setTime] = useState(30);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(prevTime => {
                // Reset time to 30 after it reaches 0
                if (prevTime === 0) {
                    return 30;
                }
                return prevTime - 1;
            });
        }, 1000); // Update the time every 1 second

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, []);

    useEffect(() => {
        setLocationObject(qrAttendance);
    }, [qrAttendance]);

    useEffect(() => {
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(allListStockLocation()),
        );
    }, []);

    const locationString = locationObject.qr_id ?? ""

    function newQr() {
        let body = {
            location_id: location
        }

        dispatch(qrAttendanceAction(body))
    }

    useEffect(() => {
        // Function to make an API call
        const makeApiCall = () => {
            newQr(); // Replace this with your actual API call
        };

        // Setup interval to make an API call every 30 seconds
        const apiCallInterval = setInterval(makeApiCall, 30000);

        // Cleanup function to clear interval and remove listener
        return () => {
            clearInterval(apiCallInterval);
        };
    }, [location]);

    const handleQr = (newValue) => {
        console.log(newValue,'vvv');
        setTime(0)
        setLocation(newValue.props.value);
        setLocationName(newValue.props.children);

        let body = {
            location_id: newValue.props.value
        }

        dispatch(qrAttendanceAction(body))
    }

    return (
        <Card sx={{ p: '25px', height:'100%' }}>
            <QrView
                stockLocation={allliststocklocation}
                handleQr={handleQr}
                locationName={locationName}
                locationString={locationString}
                time={time}
                location={location}
                setLocation={setLocation}
                qrAttendance={qrAttendance}
            />
        </Card>
    );
}

export default QRAttendance;
