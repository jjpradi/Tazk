import React from 'react'
import { Grid, CardContent, Typography, Card, ThemeProvider } from '@mui/material';

function Smallcards({children}) {
    return (
        <Grid
            size={{
                lg: 3,
                md: 12,
                sm: 12,
                xs: 12
            }}>
            <Card style={{padding: '10px 0px 0px 5px' , minHeight:'90px', maxHeight:'90px',justifyContent:"flex-start", marginLeft:'10px',marginTop:'10px'}}>
                <CardContent style={{display:"contents", justifyContent:"flex-start", flexDirection:"column" }}>
                {children}
                </CardContent>
            </Card>
        </Grid>
    );
}

export default Smallcards