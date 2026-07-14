import * as React from 'react';
import Button from '@mui/material/Button';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import BackspaceIcon from '@mui/icons-material/Backspace';
import {v4 as uuidv4} from 'uuid';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Draggable from 'react-draggable';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
// import KeyboardHideIcon from '@mui/icons-material/KeyboardHide';
import CloseIcon from '@mui/icons-material/Close';
import context from '../../../context/CreateNewButtonContext';
import { headerStyle } from 'utils/pageSize';
// import Box from '@mui/material/Box';

const buttonSize = {
  // height:64,
  fontSize: headerStyle.fontSize,
};

export default function BasicPopover({
  Tdata,
  setTdata,
  index,
  total,
  isEntered,
  setEntered,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {commoncookie} = React.useContext(context);
  const [axis] = React.useState({x: -257, y: -194});
  const nodeRef = React.useRef(null);

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // React.useEffect(() => {
  //     if (Boolean(anchorEl)) {
  //         const { x, y } = anchorEl.getBoundingClientRect()
  //         setaxis({ x: x - 321, y: y - 133 })//x - 321, y: y - 133
  //     }
  // }, [anchorEl])

  const change = (getData, getAmount) => {
    const newAmount = getAmount - +total;
    getData.forEach((d, ind) => {
      if (
        ind === index &&
        Math.sign(newAmount) === 1 &&
        +getData[index].payment_amount
      ) {
        getData[index].cash_adjustment = newAmount;
      } else {
        getData[ind].cash_adjustment = '';
      }
    });
    setTdata(getData);
  };

  const editPay = (getData, getAmount, cindex) => {
    let nindex = index;

    for (let i = index + 1; i < getData.length; i++) {
      let due = +getData[nindex].due - +getData[nindex].payment_amount;
      getData[i].due = Math.sign(due) === 1 ? due : 0;
      nindex += 1;

      if (i === getData.length - 1 && getAmount > +total) {
        if (cindex) {
          cindex.forEach((d) => {
            if (getData.length - 1 === d) getData.splice(d, 1);
          });
        }
      }
    }
  };

  const setDefault = (getData, getAmount, cindex) => {
    let venter = false;

    if (cindex.length >= 1 && cindex.length) {
      venter = true;
    } else {
      venter = false;
    }

    if (venter && index < getData.length - 1) {
      editPay(getData, getAmount, cindex);
    } else if (!venter && getAmount < +total) {
      editPay(getData, getAmount);
      const obj = {
        id: uuidv4(),
        due: +total - getAmount,
        payment_amount: '',
        cash_adjustment: 0,
        payment_type: ``,
        cash_refund: 0,
        employee_id: commoncookie,
        reference_code: '',
        tendered: [],
        change: [],
      };
      getData.push(obj);
    } else {
      editPay(getData, getAmount);
    }
    return getData;
  };

  const keyboard = (val) => {
    const getData = [...Tdata];
    if (!getData[index]) return;
    getData[index].payment_amount = !+getData[index].payment_amount
      ? val
      : getData[index].payment_amount + val;
    let cindex = [];

    const getAmount = getData.reduce(function (acc, obj, i) {
      if (!+obj.payment_amount) {
        cindex.push(i);
      }
      return acc + +obj.payment_amount;
    }, 0);

    change(setDefault(getData, getAmount, cindex), getAmount);
  };

  const backSpace = () => {
    const getData = [...Tdata];
    if (!getData[index]) return;
    getData[index].payment_amount =
      getData[index].payment_amount.toString().slice(0, -1) || '';
    getData[index].cash_adjustment = '';
    let cindex = [];

    const getAmount = getData.reduce(function (acc, obj, i) {
      if (!+obj.payment_amount) {
        cindex.push(i);
      }
      return acc + +obj.payment_amount;
    }, 0);

    change(setDefault(getData, getAmount, cindex), getAmount);
  };

  // const addAmount = (val) => {
  //     const getData = [...Tdata]
  //     if (!getData[index]) return;
  //     getData[index].payment_amount = !+getData[index].payment_amount ? val : +getData[index].payment_amount + val;
  //     let cindex = []

  //     const getAmount = getData.reduce(function (acc, obj, i) {
  //         if (!+obj.payment_amount) {
  //             cindex.push(i)
  //         }
  //         return acc + +obj.payment_amount;
  //     }, 0);

  //     change(setDefault(getData, getAmount, cindex), getAmount)
  // }

  const clear = () => {
    const getData = [...Tdata];
    if (!getData[index]) return;
    getData[index].payment_amount = '';
    getData[index].cash_adjustment = '';

    let cindex = [];

    const getAmount = getData.reduce(function (acc, obj, i) {
      if (!+obj.payment_amount) {
        cindex.push(i);
      }
      return acc + +obj.payment_amount;
    }, 0);

    setTdata(setDefault(getData, getAmount, cindex));
  };

  const KeyboardContent = (
    <Paper elevation={3}>
      <div style={{display: 'flex', marginTop: '5pc'}}>
        <div style={{display: 'flex'}}>
          <div>
            <div style={{display: 'flex'}}>
              {['7', '8', '9'].map((d) => (
                <Button
                  style={buttonSize}
                  key={d}
                  size='large'
                  onClick={() => keyboard(d)}
                >
                  {d}
                </Button>
              ))}
              {/* <Button size='large' style={buttonSize} onClick={() => addAmount(10)} >+10</Button> */}
            </div>
            <div style={{display: 'flex'}}>
              {['4', '5', '6'].map((d) => (
                <Button
                  key={d}
                  style={buttonSize}
                  size='large'
                  onClick={() => keyboard(d)}
                >
                  {d}
                </Button>
              ))}
              {/* <Button size='large' style={buttonSize} onClick={() => addAmount(20)} >+20</Button> */}
              {/* <ActionKeyboard/> */}
            </div>
            <div style={{display: 'flex'}}>
              {['1', '2', '3'].map((d) => (
                <Button
                  key={d}
                  style={buttonSize}
                  size='large'
                  onClick={() => keyboard(d)}
                >
                  {d}
                </Button>
              ))}
              {/* <Button size='large' style={buttonSize} onClick={() => addAmount(50)} >+50</Button> */}
            </div>
            <div style={{display: 'flex'}}>
              {['0', '.'].map((d) => (
                <Button
                  key={d}
                  style={buttonSize}
                  size='large'
                  onClick={() => keyboard(d)}
                >
                  {d}
                </Button>
              ))}
              <Button size='large' style={buttonSize} onClick={backSpace}>
                <BackspaceIcon />
              </Button>
              {/* <Button size='large' style={buttonSize} onClick={() => addAmount(100)} >+100</Button>style={buttonSize} */}
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{height: '100%', display: 'flex'}}>
              <Button
                size='large'
                style={{cursor: 'move', fontSize: '1.15rem'}}
                className='handle'
              >
                <DragIndicatorIcon />
              </Button>
            </div>
            <div style={{height: '100%', display: 'flex'}}>
              <Button size='large' style={buttonSize} onClick={clear}>
                <ClearAllIcon />
              </Button>
            </div>
            <div style={{height: '100%', display: 'flex'}}>
              <Button size='large' style={buttonSize} onClick={handleClose}>
                <CheckCircleIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Paper>
  );

  return (
    <div>
      <div style={{color: 'rgba(0, 0, 0, 0.23)'}}>
        <Button
          aria-describedby={id}
          variant='outlined'
          color='inherit'
          onClick={handleClick}
        >
          <span style={{color: 'black', display: 'flex'}}>
            {open ? <CloseIcon /> : <KeyboardIcon />}
          </span>
        </Button>
      </div>

      <Draggable nodeRef={nodeRef} handle='.handle' defaultPosition={{x: axis.x, y: axis.y}}>
        <Fade in={open} timeout={350}>
          <div ref={nodeRef} style={{position: 'absolute', zIndex: 100}}>
            {KeyboardContent}
          </div>
        </Fade>
      </Draggable>
    </div>
  );
}
