import { Box, IconButton, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import Cards from 'components/dynamicCards';
import workDaysIcon from '../../../assets/dashboardIcons/workDays.png';
import useCommonRef from 'pages/common/home/useCommonRef';

function TotalActiveLoansCard(props) {
    const {
        attendanceReducer: {workDetailsList}
    } = useSelector((state) => state);

    return (
        <div 
        ref={(el) => {
            props.ref1(el)
            props.isVisibleRef.current = el
          }}
        style={{width: '100%'}}>
            <Cards sx={{ height: '100%', borderRadius: '20px' }}>
                <Box display='flex' height='100%' p='10px' alignItems='center' >
                    <img src={workDaysIcon} height={40} width={40} />
                    <Box width='100%' pl='15px'>
                        <Typography style={{ fontSize: "13px", fontWeight: 500 , fontFamily:"Poppins"  }}>
                           {'Total: ' + (props?.data?.activeLoansTotal || 0) + ' / Due: ' + (props?.data?.activeLoansDue || 0)}
                        </Typography>
                        <Box display='flex' mt='4px' alignItems='center'>
                            <Typography color='rgba(0, 0, 0, 0.7)' fontSize='13px' fontFamily="Poppins" fontWeight="500">Total Active Loans</Typography>
                        </Box>
                    </Box>
                    {
                        props.mode === 'edit' ?
                            <IconButton
                                aria-label='view code'
                                onClick={() => props.setCardClose()}
                                size='large'
                            >
                                {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                            </IconButton>
                            :
                            ''
                    }
                </Box>
            </Cards>
        </div>
    );
}
export default useCommonRef(TotalActiveLoansCard);
