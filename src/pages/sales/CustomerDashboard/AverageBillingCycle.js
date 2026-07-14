import React from 'react'
import DashboardTile from 'components/DashboardTile'
import useCommonRef from 'pages/common/home/useCommonRef'

const AverageBillingCycle = (props) => {
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
            title = 'Average Billing Cycle'
            // icon = {statusIcon}
            value = {props?.data[0]?.avgBilling_cycle === null ? 0 : props?.data[0]?.avgBilling_cycle}
            currencyIcon = {false}
        />
    </div>
  )
}

export default useCommonRef(AverageBillingCycle)