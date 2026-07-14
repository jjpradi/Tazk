import React, {useEffect, useState, useContext} from 'react';
import ReactSpeedometer from 'react-d3-speedometer';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from "@mui/material";
import {listdebitor} from '../../../redux/actions/sales_actions';

const styles = {
  dial: {
    display: 'inline-block',
    width: `300px`,
    height: `auto`,
    color: '#000',
    border: '0.5px solid #fff',
    padding: '2px',
  },
  title: {
    fontSize: '1em',
    color: '#000',
  },
};

const Speedometer = ({ id, value, title, Totalvalue, avgDay }) => {
  const dispatch = useDispatch()

  const { salesReducer: { consolidated_data } } = useSelector(state => state)  
  const [Totalvalues, setTo] = useState();
  useEffect(() => {
    {{{consolidated_data.map((a,i) => {
      setTo(a.avgCredit_days)
    })}}}
    // alert('Terminal')
  }, [])
  return (
    <>
      <Card sx={{minWidth: 275}}>
        {/* <button onClick={() => setTo(Totalvalues + 10)}>hjkk</button> */}

        <div style={styles.dial}>
          <ReactSpeedometer
            maxValue={100}
            minValue={0}
            height={190}
            width={290}
            value={Totalvalue}
            needleTransition='easeQuadIn'
            needleTransitionDuration={1000}
            needleColor='red'
            startColor='green'
            segments={10}
            endColor='blue'
          />
          <div style={styles.title}>{title}</div>
        </div>
      </Card>
    </>
  );
};

export default Speedometer;
