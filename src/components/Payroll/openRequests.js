
import React from 'react';
import { useSelector } from 'react-redux';
import useCommonRef from 'pages/common/home/useCommonRef';
import employeIcon from '../../assets/dashboardIcons/presentIcon.png';
import DashboardTile from 'components/DashboardTile';

function openRequestsCard(props) {

    const {
        PayrolldashboardReducers: {  currentDayCard},
    } = useSelector((state) => state);
    
    return (
        <div 
            ref = {(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }}
            style = {{ width: '100%' }}
        >
            <DashboardTile 
                {...props}
                title = 'Open Requests'
                icon = {employeIcon}
                value = {props?.data[0]?.totalOpenRequests || 0}
                currencyIcon = {false}
            />    
        </div>
    );
}
export default useCommonRef(openRequestsCard);
