import React from 'react'
import { Grid, CardContent, Typography, Card, ThemeProvider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

function Cards(props) {
    const { children } = props;
    const matches = useMediaQuery((theme) => theme.breakpoints.up('2560'));

    if(props.isDashboardCard === undefined || props.isDashboardCard === true){
        return (
            <Grid style={{width:'100%'}} >
                <Card style={{minHeight:'70px', maxHeight:'70px', display:'flex', alignItems:'center', padding:'10px 0px 0px 10px',}}>
                    <CardContent style={{display:"contents", justifyContent:"center", flexDirection:"column" }}>
                    {children}
                    </CardContent>
                </Card>
            </Grid>
        )
    }
      
    return (
        <Grid
            size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
            }}>
            <Card style={{minHeight:'70px', maxHeight:'70px', display:'flex', alignItems:'center', padding:'10px 0px 0px 10px', marginLeft:'10px',marginTop:'10px'}}>
                <CardContent style={{display:"contents", justifyContent:"center", flexDirection:"column" }}>
                {children}
                </CardContent>
            </Card>
        </Grid>
    );
}

export default Cards