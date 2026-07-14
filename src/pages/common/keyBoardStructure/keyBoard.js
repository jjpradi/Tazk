import React, {useEffect, useState} from 'react';
// import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import BackspaceIcon from '@mui/icons-material/Backspace';
import {Button, Typography} from '@mui/material';
import { useSelector } from 'react-redux';

// const useStyles = makeStyles(() => ({

//     Active: {
//         backgroundColor: 'rgb(22, 169, 199)',
//         width: '25%',
//         height: '50px',
//         fontSize: '100%'
//     },
//     Button:{
//         borderRadius:0,
//         width: 80,
//         height:40,
//         //
//         // width: '20px',
//         // height: '20px',
//         fontSize: '1.3rem',
//     },
//     option:{
//         width: 80,
//         height:40,
//         borderRadius:0,
//         fontSize: '1rem',
//     }
// }));

function KeyPadComponent(props) {
  // const classes = useStyles();
  const [active, setActive] = useState('');
  const [toggle, settoggle] = useState(false);
  // discount_type

  const {NotificationReducer : {is_serialied}} = useSelector(state => state)


  return (
    <>
      <div>
        <div style={{display: 'flex', color: 'rgba(0, 0, 0, 0.23)'}}>
          <Button
            color='inherit'
            size='large'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='1'
            onClick={(e) => props.onClick(1)}
          >
            <Typography  variant='h9' color='black'>
              1
            </Typography>
          </Button>

          <Button
            color='inherit'
            size='large'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='2'
            onClick={(e) => props.onClick(2)}
          >
            <Typography  variant='h9' color='black'>
              2
            </Typography>
          </Button>

          <Button
            color='inherit'
            size='large'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='3'
            onClick={(e) => props.onClick(3)}
          >
            <Typography  variant='h9' color='black'>
              3
            </Typography>
          </Button>
          <Button
            style={{borderRadius: 0, width: 79}}
            variant={
              props.activeButtonName === 'quantity' ? 'contained' : 'outlined'
            }
            name='quantity'
            size='large'
            color={
              props.activeButtonName === 'quantity' ? 'primary' : 'inherit'
            }
            disabled= {is_serialied === 1 && true   }
            onClick={(e) =>{
              props.onClick('quantity');
              props.activeButton('quantity');
              settoggle(false);
            }}
          >
            <Typography
               variant='h9'
              color={props.activeButtonName === 'quantity' ? 'white' : 'black'}
            >
              Qty
            </Typography>
          </Button>
        </div>

        <div style={{display: 'flex', color: 'rgba(0, 0, 0, 0.23)'}}>
          <Button
            color='inherit'
            size='large'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='4'
            onClick={(e) => props.onClick(4)}
          >
            <Typography  variant='h9' color='black'>
              4
            </Typography>
          </Button>

          <Button
            color='inherit'
            size='large'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='5'
            onClick={(e) => props.onClick(5)}
          >
            <Typography  variant='h9' color='black'>
              5
            </Typography>
          </Button>

          <Button
            color='inherit'
            size='large'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='6'
            onClick={(e) => props.onClick(6)}
          >
            <Typography  variant='h9' color='black'>
              6
            </Typography>
          </Button>

          <Button
            size='small'
            style={{borderRadius: 0, width: '79px'}}
            name='discount'
            color={
              props.activeButtonName === 'discount' ? 'primary' : 'inherit'
            }
            variant={
              props.activeButtonName === 'discount' ? 'contained' : 'outlined'
            }
            disabled={props.discountButtonDisable}
            onClick={(e) => {
              props.onClick('discount');
              props.activeButton('discount');
              toggle && props.setswitchDis(!props.switchDis);
              settoggle(true);
            }}
          >
            <Typography
              variant='h9'
              marginLeft='6px'
              color={props.activeButtonName === 'discount' ? 'white' : 'black'}
            >
              {props.switchDis ? 'DISC %' : 'DISC ₹'}
            </Typography>
          </Button>
        </div>

        <div style={{display: 'flex', color: 'rgba(0, 0, 0, 0.23)'}}>
          <Button
            size='large'
            color='inherit'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='7'
            onClick={(e) => props.onClick(7)}
          >
            <Typography  variant='h9' color='black'>
              7
            </Typography>
          </Button>

          <Button
            size='large'
            color='inherit'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='8'
            onClick={(e) => props.onClick(8)}
          >
            <Typography  variant='h9' color='black'>
              8
            </Typography>
          </Button>

          <Button
            size='large'
            color='inherit'
            style={{borderRadius: 0, width: 79}}
            variant='outlined'
            name='9'
            onClick={(e) => props.onClick(9)}
          >
            <Typography  variant='h9' color='black'>
              9
            </Typography>
          </Button>

          <Button
            size='large'
            style={{borderRadius: 0, width: '79px'}}
            variant={
              props.activeButtonName === 'selling_price'
                ? 'contained'
                : 'outlined'
            }
            name='selling_price'
            color={
              props.activeButtonName === 'selling_price' ? 'primary' : 'inherit'
            }
            onClick={(e) => {
              props.onClick('selling_price');
              props.activeButton('selling_price');
              settoggle(false);
            }}
          >
            <Typography
               variant='h9'
              color={
                props.activeButtonName === 'selling_price' ? 'white' : 'black'
              }
            >
              price
            </Typography>
          </Button>
        </div>

        <div style={{display: 'flex', color: 'rgba(0, 0, 0, 0.23)'}}>
          <Button
            size='large'
            color='inherit'
            style={{borderRadius: 0, width: '79px'}}
            variant='outlined'
            name='c'
            onClick={(e) => props.onClick('c')}
          >
            <Typography  variant='h9' color='black'>
              +/-
            </Typography>
          </Button>

          <Button
            size='large'
            color='inherit'
            style={{borderRadius: 0, width: '79px'}}
            variant='outlined'
            name='0'
            onClick={(e) => props.onClick(0)}
          >
            <Typography  variant='h9' color='black'>
              0
            </Typography>
          </Button>

          <Button
            size='large'
            color='inherit'
            style={{borderRadius: 0, width: '79px'}}
            variant='outlined'
            name='.'
            onClick={(e) => props.onClick('.')}
          >
            <Typography  variant='h9' color='black'>
              .
            </Typography>
          </Button>

          <Button
            size='large'
            color='inherit'
            style={{borderRadius: 0, width: '79px'}}
            variant='outlined'
            name='backSpace'
            onClick={(e) => props.onClick('backSpace')}
          >
            <Typography display='flex' color='black'>
              <BackspaceIcon />
            </Typography>
          </Button>
          <br />
        </div>
      </div>
    </>
  );
}

export default KeyPadComponent;
