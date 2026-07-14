import React from 'react'
import DashboardTile from 'components/DashboardTile'
import totaloutstandingIcon from 'assets/dashboardIcons/Union.svg';
import useCommonRef from 'pages/common/home/useCommonRef';

const OutstandingReceivedCard = (props) => {
  return (
    <div
        ref = {(el) => {
            props.ref1(el)
            props.isVisibleRef.current = el
        }}
        style = {{ width : '100%' }}
    >
        <DashboardTile 
            {...props}
            title = 'Outstanding Received'
            icon = {totaloutstandingIcon}
            value = {props?.data[0]?.outstanding_value || 'No Outstanding'}
            currencyIcon = {false}
        />
    </div>
  )
}

export default useCommonRef(OutstandingReceivedCard)