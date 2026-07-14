import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import {useEffect} from 'react';
import  {listDashboardAction} from '../../../redux/actions/dashboard_role_actions'
import { useDispatch } from 'react-redux';



function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

export default function DashboardRole(props) {
  const dispatch = useDispatch();
  const [checked, setChecked] = React.useState([]);
  const [left, setLeft] = React.useState([]);
  const [right, setRight] = React.useState([]);


  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };
// useEffect(()=>{
//   this.props.listDashboardAction()
// },[])
  useEffect(() => {
    //dispatch(listDashboardAction())
    setRight(props.dashboardRightData || props.dashboard || []);
  }, [props]);

  console.log('asdfasdf',props.dashboardRightData, props.dashboard)

  const filterByReference = (arr1, arr2) => {
    let res = [];
    res = arr1.filter((el) => {
      return !arr2.find((element) => {
        return element.dashboard_id === el.dashboard_id;
      });
    });
    setLeft(res);
  };

  useEffect(() => {
    let listdata = [];
    props.options.map((value) => {
      listdata.push(value);
    });
    if (right.length > 0) {
      filterByReference(listdata, right);
    } else {
      setLeft(listdata);
    }
  }, [props.options, right]);
  console.log("selected", right)
  const customList = (title, items) => (
    <Card
      sx={{
        width: 300,
        height: 450,
        bgcolor: 'background.paper',
        overflow: 'auto',
      }}
    >
      <CardHeader
        sx={{px: 2, py: 1}}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List
        // sx={{
        //   width: 200,
        //   height: 230,
        //   bgcolor: 'background.paper',
        //   overflow: 'auto',
        // }}
        dense
        component='div'
        role='list'
      >
        {items.map((value) => {
          const labelId = `transfer-list-all-item-${value.id}-label`;

          return (
            <ListItem
              key={value}
              role='listitem'
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value.dashboard_name}`} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid>
      <Grid container spacing={2} justifyContent='center' alignItems='center'>
        <Grid>{customList('All Dashboard list', left)}</Grid>
        <Grid>
          <Grid container direction='column' alignItems='center'>
            <Button
              sx={{my: 0.5}}
              variant='outlined'
              size='small'
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label='move selected right'
            >
              &gt;
            </Button>
            <Button
              sx={{my: 0.5}}
              variant='outlined'
              size='small'
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label='move selected left'
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid>{customList('Selected Dashboard list', right)}</Grid>
      </Grid>
      <Grid container spacing={7} display='flex' alignItems='center' justifyContent='center' p='10px 0px'>
        <Grid>
        <Button
          onClick={() => {
            props.onSubmitDashboardMessage(right);
          }}
          name='Submit'
          variant='contained'
          color='primary'
          size='medium'
          text='button'
          fullWidth={false}
        >
          Submit
        </Button>
        </Grid>
        <Grid>
        <Button
    onClick={() => {
      props.handleClose(); // Replace 'onCloseModal' with the actual close function
    }}
    name='Close'
    variant='contained'
    color='secondary'
    size='medium'
    text='button'
    fullWidth={false}
  >
    Close
  </Button>
        </Grid>
      </Grid>
      {/* 
            <Grid display='flex' justifyContent='center' padding={'9px'}>
              <Grid>
                <Button
                  onClick={() => {
                    props.onSubmitDashboardMessage(right);
                  }}
                  name='Submit'
                  variant='contained'
                  color='primary'
                  size='medium'
                  text='button'
                  fullWidth={false}
                >
                  Submit
                </Button>
              </Grid>
            </Grid> */}
    </Grid>
  );
}
