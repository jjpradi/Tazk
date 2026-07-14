// @flow
import React, {useState, useEffect, useContext, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {
  listReportsAction,
  deleteReportsAction,
  updateReportsAction,
} from '../../../redux/actions/reports_actions';
// import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
// import CardHeader from '@mui/material/CardHeader';
// import CardContent from '@mui/material/CardContent';
// import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
// import Collapse from '@mui/material/Collapse';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import context from '../../../context/CreateNewButtonContext';
import AlertDialog from '../../common/Dialog';
import CardList from './CardList';
import CloseIcon from '@mui/icons-material/Close';
// import InputBase from '@mui/material/InputBase';
// import { useTheme } from '@mui/material/styles';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import NoRecordFound from '../../../components/Layout/NoRecordFound';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';

// import { minWidth, width } from '@mui/system';

// const useStyles = makeStyles(() => ({
//   search: {
//     position: 'relative',
//     // marginTop:'-7px',
//     borderRadius: useTheme().shape.borderRadius,
//     // backgroundColor: 'white',
//     backgroundColor: '#E6E6E6',
//     width: '250px',
//     height: '53px'
//   },
//   searchIcon: {
//     padding: useTheme().spacing(0, 1),
//     height: '100%',
//     position: 'absolute',
//     pointerEvents: 'none',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     // paddingTop: '3px'
//   },
//   inputRoot: {
//     color: 'inherit',
//   },
//   inputInput: {
//     // padding: useTheme().spacing(1, 1, 1, 8),
//     // //marginTop: '7px',
//      marginLeft: '20px',
//     // // vertical padding + font size from searchIcon
//     // // paddingLeft: `calc(1em + ${useTheme().spacing(4)}px)`,
//     // transition: useTheme().transitions.create('width'),
//     width: '100%',
//     // [useTheme().breakpoints.up('sm')]: {
//     //   width: '12ch',
//     //   '&:focus': {
//     //     width: '20ch',
//     //   },
//     // },
//   },
// }));

const GeneratedReports = (props) => {
  // const classes = useStyles();
  const {reports} = useSelector((state) => state.reportsReducer);
  const dispatch = useDispatch();
  const history = useNavigate();
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(context);
  const tempdis = useRef(null);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [activeID, setActiveID] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState();
  const [filterData, setFilterData] = useState([]);
  const [filterSting, setFilterSting] = useState('');
  const [favorite_reportData, setFavorite_reportData] = useState([]);
  const [favoriteMsg, setFavoriteMsg] = useState('Add to Favorite');
  const [isApiFinished, setIsApiFinished] = useState(false);
  
  const tempinitsform = useRef(null);
  const tempinitsformVal = useRef(null);
  const tempinitsformValue = useRef(null);

  // const handleListItemClick = (event, index) => {
  //   // setSelectedIndex(index);
  // };


  const dis = () => {
    
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listReportsAction(setModalTypeHandler, setLoaderStatusHandler))
    ).finally(() => setIsApiFinished(true));
  };

  tempdis.current = dis;

  const setToFilerData = (data) => {
    setFilterData(data.filter((r) => r.favorite_report === 0));
    setFavorite_reportData(data.filter((r) => r.favorite_report === 1));
  };

  // useEffect(() => {
  //   tempdis.current();
  //   setToFilerData(reports)

  // }, [])

  const initsformValue = () => {
    tempdis.current();
    setToFilerData(reports);
  };
  tempinitsformValue.current = initsformValue;
  useEffect(() => {
    tempinitsformValue.current();
  }, []);

  useEffect(() => {
    setToFilerData(reports);
  }, [reports]);

  // useEffect(() => {
  //   ReportFiltering();
  // }, [filterSting])

  const initsform = () => {
    ReportFiltering();
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, [filterSting]);

  // useEffect(() => {
  //   const active_id = reports.filter(r => r.report_id == activeID)
  //   if (active_id.length > 0) {
  //     if (active_id[0].favorite_report == 1) {
  //       setFavoriteMsg('Remove from Favorite')
  //     }
  //     else {
  //       setFavoriteMsg('Add to Favorite')
  //     }

  //   }

  // }, [activeID])

  const initsformVal = () => {
    const active_id = reports.filter((r) => r.report_id === activeID);
    if (active_id.length > 0) {
      if (active_id[0].favorite_report === 1) {
        setFavoriteMsg('Remove from Favorite');
      } else {
        setFavoriteMsg('Add to Favorite');
      }
    }
  };
  tempinitsformVal.current = initsformVal;
  useEffect(() => {
    tempinitsformVal.current();
  }, [activeID]);

  const handleEdit = () => {
    history(`edit-reports/${activeID}`);
  };

  const handleCardClick = (id) => {
    history(`view-reports/${id}`);
  };
  const handleDelete = () => {
    
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(deleteReportsAction(activeID,setModalTypeHandler,setLoaderStatusHandler))
    );
    setOpen(false);
    setDeleteAlert(false);
  };

  const addToFavorite = async (msg) => {
    const data = reports.filter((f) => f.report_id === activeID);
    return data.length > 0
      ? (
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            dispatch(
              updateReportsAction(data[0].report_id, {
                ...data[0],
                favorite_report: favoriteMsg === 'Add to Favorite' ? 1 : 0,
              }),
            )
          ),

        setOpen(false))
      : '';
  };
  const cancelDelete = () => {
    setDeleteAlert(!deleteAlert);
  };
  const handleClick = (newPlacement, id, event, msg) => {
    setActiveID(id);
    setFavoriteMsg(msg);
    setAnchorEl(event.currentTarget);
    setOpen(!open);
    setPlacement(newPlacement);
  };
  const ReportFiltering = (data) => {
    const filtered = reports.filter((r) =>
      r.report_name.toLowerCase().includes(filterSting.toLowerCase()),
    );
    setToFilerData(filtered);
  };
  return (
    <React.Fragment>
      <Helmet>
               <meta charSet="utf-8" />
               <title> {titleURL} | Generated Reports </title>
     </Helmet>
      <CreateNewButtonContext.Consumer>
        {({loaderStatus}) => (
          <div>
            
            <Grid container direction='row'>
              <Grid
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
              <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              Report List
            </Typography>
              </Grid>
              <Grid
                // align='Right'
                style={{justifyContent: 'flex-end', display: 'flex'}}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                {/* <div className={classes.search} >
            {
              <div>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <div style={{ justifyContent: 'flex-end', display: 'flex' }}>
                  <IconButton style={{ position: 'absolute', justifyContent: 'flex-end', display: 'flex', marginTop: '7px' }}
                    onClick={e => { setFilterSting('') }}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            }
            <InputBase
              placeholder="Search…"
              onChange={e => { setFilterSting(e.target.value) }}
              value={filterSting}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            /> </div> */}
                {/* <CommonSearch
                  searchVal={filterSting}
                  cancelSearch={setFilterSting('')}
                  requestSearch={setFilterSting}
                  type="border"
                /> */}
                <TextField
                  variant='filled'
                  // fullWidth
                  size='small'
                  placeholder='Search…'
                  onChange={(e) => {
                    setFilterSting(e.target.value);
                  }}
                  value={filterSting}
                  // style={{ backgroundColor: "white", borderRadius: "5px" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <CloseIcon
                        sx={{cursor: 'pointer'}}
                        onClick={(e) => {
                          setFilterSting('');
                        }}
                      />
                    ),
                  }}
                />
              </Grid>
            </Grid>
            {loaderStatus === false && favorite_reportData.length > 0 && (
              <React.Fragment>
                <Typography
                  gutterBottom
                  variant='h6'
                  align='left'
                  component='div'
                >
                  Favorite List
                </Typography>
                <Divider />
                <div style={{paddingTop: '20px', paddingBottom: '10px'}}>
                  <CardList
                    open={open}
                    anchorEl={anchorEl}
                    placement={placement}
                    filterData={favorite_reportData}
                    handleClick={handleClick}
                    handleEdit={handleEdit}
                    setDeleteAlert={setDeleteAlert}
                    favoriteMsg='Remove from Favorite'
                    addToFavorite={addToFavorite}
                    handleCardClick={handleCardClick}
                  />
                </div>
              </React.Fragment>
            )}

            <Divider />
            <div style={{paddingTop: '20px', paddingBottom: '10px'}}>
              <CardList
                open={open}
                anchorEl={anchorEl}
                placement={placement}
                filterData={filterData}
                handleClick={handleClick}
                handleEdit={handleEdit}
                setDeleteAlert={setDeleteAlert}
                favoriteMsg='Add to Favorite'
                addToFavorite={addToFavorite}
                handleCardClick={handleCardClick}
              />
            </div>
            {filterData.length === 0 && loaderStatus === false && (
              isApiFinished ? 
              <NoRecordFound /> : ""
            )}

            <Popper
              open={open}
              anchorEl={anchorEl}
              placement={placement}
              transition
            >
              {({TransitionProps}) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper sx={{minWidth: '10px', minHeight: '50px'}}>
                    <List component='nav' aria-label='main mailbox folders'>
                      <ListItemButton onClick={(event) => handleEdit()}>
                        {/* <ListItemIcon> */}
                        <ModeEditIcon />
                        {/* </ListItemIcon> */}
                        <ListItemText primary='Edit' />
                      </ListItemButton>
                      {/* <br/> */}
                      <ListItemButton onClick={(event) => setDeleteAlert(true)}>
                        {/* <ListItemIcon> */}
                        <DeleteIcon />
                        {/* </ListItemIcon> */}
                        <ListItemText primary='Delete' />
                      </ListItemButton>
                      {/* <br/> */}
                      <ListItemButton onClick={(event) => addToFavorite()}>
                        {/* <ListItemIcon> */}
                        <FavoriteIcon />
                        {/* </ListItemIcon> */}
                        <ListItemText primary={favoriteMsg} />
                      </ListItemButton>
                    </List>
                  </Paper>
                </Fade>
              )}
            </Popper>
            {deleteAlert && (
              <AlertDialog
                delete={deleteAlert}
                handleClose={cancelDelete}
                deleteFuc={handleDelete}
              />
            )}
            {/* </Grid> */}
          </div>
        )}
      </CreateNewButtonContext.Consumer>
    </React.Fragment>
  );
};
export default GeneratedReports;
