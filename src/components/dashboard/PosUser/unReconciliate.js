import React, { useState, useEffect, useContext } from 'react';
import { Grid, CardContent, Typography, Card, IconButton } from '@mui/material';
import http from '../../../http-common';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import restoreIcon from '../../../assets/dashboardIcons/history.png';
import useCommonRef from 'pages/common/home/useCommonRef';
import { font14_500 } from 'utils/pageSize';
import moment from 'moment';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { SetPaymentData } from 'redux/actions/pos_product_list';
import { useCustomFetch } from 'utils/useCustomFetch';
import DashboardTile from 'components/DashboardTile';

const UnReconciliate = (props) => {
    // const [data, setData] = useState('')
    // const customFetch = useCustomFetch()


    // const {
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     commoncookie,
    //     headerLocationId
    // } = useContext(CreateNewButtonContext);
    
    // useEffect(() => {
    //     let data = {
    //         employeeId : commoncookie,
    //         locationId: headerLocationId
    //        }
        
    //     const { data: finalRes } = await customFetch(`/posSession/posUserDashBoard/unReconciliate`, 'POST', data)

    //     setData(finalRes[0]?.amount)
    // }, [])

    // const finalResult = data ? (data === 0 ? '0.00' : data.toFixed(2)) : '0.00'


    return (
        <div 
            ref={(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }}
            style={{width: '100%'}}
        >
            <DashboardTile
                {...props}
                title='Unreconciliate'
                icon={restoreIcon}
                value={props?.data[0]?.amount.toFixed(2) || '0.00'}
                currencyIcon={true}
            />
        </div>
    );
};

export default useCommonRef(UnReconciliate);
