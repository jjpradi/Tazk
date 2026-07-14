import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { useDispatch, useSelector } from 'react-redux';
import { cashbalanceAction } from 'redux/actions/cashbalance';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import Cards from '../../dynamicCards/index';
import cashinhandIcon from '../../../assets/dashboardIcons/money.svg';
import bankIcon from '../../../assets/dashboardIcons/bank-statement.svg';
import apiCalls from 'utils/apiCalls';

const cashBalance = () => {
    const [data, Setdata] = useState()
    const dispatch = useDispatch();
    const {
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
    } = useContext(CreateNewButtonContext)
    const cashBalance = useSelector((state) => state.cashBalance);
    useEffect(() => {
        apiCalls(
            setModalTypeHandler, 
            setLoaderStatusHandler,
            dispatch(cashbalanceAction(setModalTypeHandler, setLoaderStatusHandler))
        );
    }, [])


    return (
        <>
            <Grid container>
                <Typography
                    style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                >
                    Cash Balance
                </Typography>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 6,
                        xs: 6
                    }}>
                    <Grid  direction='row' style={{ display: 'flex', alignItems: 'center', justifyContent: "flex-start"}}>
                        <Cards>
                            <Typography
                                style={{ fontSize: 14 }}

                                gutterBottom
                            >
                                <Grid container paddingLeft={3}>
                                    <Grid style={{ paddingTop: '5px' }}>
                                        <img src={cashinhandIcon} width={40} height={50} />
                                    </Grid>
                                    <Grid style={{paddingRight: '20px'}}>
                                        <Typography variant='h5' component='h2'>

                                            <Typography style={{ paddingLeft: '5px' }}>
                                                <CurrencyRupeeIcon style={{ paddingLeft: '12px', paddingTop: "12px" }} /><span> {cashBalance?.Cashbalance?.map((v) => {
                                                    return (
                                                        v.parentAccountName === "Cash-in-hand" && v.cashinhand
                                                    )
                                                })}             </span>
                                                <br />
                                                <Typography color="textSecondary" >   <span style={{ paddingLeft: '12px' }} >Cash in hand </span></Typography>
                                            </Typography>
                                        </Typography>
                                    </Grid>
                                </Grid>

                            </Typography>

                        </Cards>
                        <Cards>
                            <Typography
                                style={{ fontSize: 14 }}
                                gutterBottom
                            >
                                <Grid container  paddingLeft={3}>
                                    <Grid>
                                        <img src={bankIcon} width={40} height={60} />
                                    </Grid>
                                    <Grid style={{paddingRight: '20px'}}>
                                        <Typography variant='h5' component='h2' style={{ paddingLeft: '5px' }}>
                                            <CurrencyRupeeIcon style={{ paddingLeft: '12px', paddingTop: "12px" }}/>
                                            <span style={{ paddingLeft: '5px' }}>
                                                {cashBalance?.Cashbalance?.map((v) => {
                                                    return (
                                                        v.parentAccountName === "Bank" && v.cashinhand
                                                    )
                                                }
                                                )}
                                            </span>
                                            <br />
                                       <Typography color='textSecondary'>    
                                     <span style={{ paddingLeft: '16px' }}  >
                                    Bank
                                </span>
                                </Typography>
                                        </Typography>
                                    </Grid>
                                </Grid>
                               
                            </Typography>

                        </Cards>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
}

export default cashBalance;
