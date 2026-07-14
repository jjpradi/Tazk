import { Card, Grid, IconButton, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { cellStyle } from 'utils/pageSize';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function DashboardTile(props){
    const theme = useTheme()

    return (
        <Card sx={{ width: '100%', overflow: 'hidden', p: 0 }}>
            {/* Blue header - flush edge to edge */}
            <Typography className='dashboard-tile-header' sx={{ backgroundColor: theme.palette.primary.main }}>
                {props.title}
            </Typography>

            {/* Content area */}
            <Grid container alignItems='center'>
                <Grid
                    size={{
                        lg: props.mode === 'edit' ? 10 : 12,
                        md: props.mode === 'edit' ? 10 : 12,
                        sm: props.mode === 'edit' ? 10 : 12,
                        xs: props.mode === 'edit' ? 10 : 12
                    }}>

                    <Grid container>

                        <Grid
                            display='flex'
                            justifyContent='center'
                            padding={1}
                            size={{
                                lg: 4,
                                md: 4,
                                sm: 4,
                                xs: 4
                            }}>
                            <div style={{ width: '35px', height: '40px'}}>
                                <div style={{ width: '35px', height: '35px'}}>
                                    <img src={props.icon} style={{ width : '100%', height : '100%', objectFit: 'contain'}}/>
                                </div>
                            </div>
                        </Grid>

                        <Grid
                            display='flex'
                            alignItems='center'
                            size={{
                                lg: 8,
                                md: 8,
                                sm: 8,
                                xs: 8
                            }}>
                            {
                                props.currencyIcon ?
                                    props?.secondaryText ?
                                        props.arrow ?
                                            <Grid container>
                                                <Grid
                                                    display='flex'
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    size={{
                                                        lg: 12
                                                    }}>
                                                    <Typography className='dashboard-chart-content-new' display="flex" alignItems="center" >
                                                        <CurrencyRupeeIcon style={{ paddingBottom: '5px', paddingTop: '5px' }} />
                                                    </Typography>

                                                    <Typography className='dashboard-chart-content-new' style={{marginTop: '2px'}}>
                                                        {props.value}
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    size={{
                                                        lg: 12,
                                                        md: 12,
                                                        sm: 12,
                                                        xs: 12
                                                    }}>
                                                    <Grid container>
                                                        <Grid
                                                            display='flex'
                                                            justifyContent='center'
                                                            size={{
                                                                lg: 6,
                                                                md: 6,
                                                                sm: 6,
                                                                xs: 6
                                                            }}>
                                                            <Typography
                                                                className='dashboard-chart-content'
                                                                style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight, width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'clip' }}
                                                            >
                                                                {props?.secondaryText}
                                                            </Typography>
                                                        </Grid>

                                                        <Grid
                                                            display='flex'
                                                            justifyContent='center'
                                                            size={{
                                                                lg: 6,
                                                                md: 6,
                                                                sm: 6,
                                                                xs: 6
                                                            }}>
                                                            <Typography
                                                                variant="body2"
                                                                color={
                                                                ((props?.arrowData.PreMonthTotal - props?.arrowData.monthtotal) / props?.arrowData.PreMonthTotal) * 100 >= 100
                                                                    ? 'green'
                                                                    : 'red'
                                                                }
                                                                display="flex"
                                                                style={{ fontSize: '11px' }}
                                                            >
                                                                {((props?.arrowData.PreMonthTotal - props?.arrowData.monthtotal) / props?.arrowData.PreMonthTotal) * 100 >= 100 ? (
                                                                    <ArrowUpwardIcon sx={{paddingBottom: '8px', paddingLeft: '10px'}} />
                                                                ) : (
                                                                    <ArrowDownwardIcon sx={{paddingBottom: '8px', paddingLeft: '10px'}} />
                                                                )}
                                                                {isNaN(((props?.arrowData.PreMonthTotal - props?.arrowData.monthtotal) / props?.arrowData.PreMonthTotal) * 100)
                                                                ? ''
                                                                : `${(
                                                                    ((props?.arrowData.PreMonthTotal - props?.arrowData.monthtotal) / props?.arrowData.PreMonthTotal) * 100
                                                                ).toFixed(2)}%`}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        :
                                            <Grid container>
                                                <Grid
                                                    display='flex'
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    size={{
                                                        lg: 12
                                                    }}>
                                                    <Typography className='dashboard-chart-content-new' display="flex" alignItems="center" >
                                                        <CurrencyRupeeIcon style={{ paddingBottom: '5px', paddingTop: '5px' }} />
                                                    </Typography>

                                                    <Typography className='dashboard-chart-content-new' style={{marginTop: '2px'}}>
                                                        {props.value}
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    display='flex'
                                                    justifyContent='center'
                                                    alignItems='center'
                                                    size={{
                                                        lg: 12
                                                    }}>
                                                    <Typography className='dashboard-chart-content' style={{ paddingLeft: '10px'}} color='textSecondary'>
                                                        <span style={{ fontSize: cellStyle.fontSize, fontWeight: cellStyle.fontWeight ,color: "#ff726f", width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'clip' }}>
                                                            {props?.secondaryText}
                                                        </span>
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                    :
                                        <Typography className='dashboard-chart-content-new' width='100%' display="flex" justifyContent='center' alignItems="center">
                                            <CurrencyRupeeIcon style={{ paddingBottom: '5px', paddingTop: '5px' }} />
                                            {props.value}
                                        </Typography>
                                :
                                    <Typography className='dashboard-chart-content-new' width='100%' display='flex' justifyContent='center' alignItems='center'>
                                        {(props.value === '' || props.value === '-') ? 0 :props.value  }
                                    </Typography>
                            }
                        </Grid>

                    </Grid>

                </Grid>

                {props.mode === 'edit' && (
                    <Grid
                        size={{
                            lg: 2,
                            md: 2,
                            sm: 2,
                            xs: 2
                        }}>
                        <IconButton
                            aria-label='view code'
                            onClick={() => props.setCardClose()}
                            size='medium'
                            className='dashboard-visibility-icon'
                            sx={{backgroundColor: theme.palette.primary.main}}
                        >
                            {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
                        </IconButton>
                    </Grid>
                )}
            </Grid>
        </Card>
    );
}

export default DashboardTile