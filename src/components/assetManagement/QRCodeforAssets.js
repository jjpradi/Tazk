import { Button, Container, Grid, Typography } from "@mui/material"
import CustomPrintQrCode from "pages/sales/purchases/CustomPrintQrCode";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code"
import { useDispatch, useSelector } from "react-redux";
import ReactToPrint from "react-to-print"
import { listUserCreationAction } from "redux/actions/userCreation_actions";

function QRCodeForAssets(props){

    const componentRef = useRef(null);
    const dispatch = useDispatch()
    const{
        UserCreationReducer: {createUser}
    } = useSelector((state) => state)

    const[ownerName, setOwnerName] = useState('')
    const assetData = props?.assetData ?? {};
    const assetCode = assetData?.Code || '';

    useEffect(() => {
        dispatch(listUserCreationAction())
    }, [dispatch])

    useEffect(() => {
        let fullName = ''
        if(assetData?.asset_owner !== 0 && assetData?.asset_owner){
            let ownerDetails = createUser.find((e) => e.employee_id === assetData.asset_owner)
            console.log(ownerDetails, 'owner')
            fullName = ownerDetails?.last_name ? `${ownerDetails?.first_name} ${ownerDetails?.last_name}` : ownerDetails?.first_name
        }
        else{
            fullName =  ''
        }
        setOwnerName(fullName)
    }, [assetData, createUser])

    return (
        <>
            <Container sx={{p: 5}}>
                <Grid container spacing={5}>
                    <Grid
                        sx={4}
                        size={{
                            lg: 4,
                            md: 4,
                            sm: 4
                        }}>
                        <Grid container rowGap={4}>
                            <Grid
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <QRCode 
                                    size={230}
                                    style={{height: '100%', width: '100%'}}
                                    value={assetCode}
                                    viewBox={`0 0 256 256`}
                                />
                            </Grid>

                            <Grid
                                display='flex'
                                justifyContent='center'
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Typography variant='h3'>{assetCode || '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        sx={8}
                        size={{
                            lg: 8,
                            md: 8,
                            sm: 8
                        }}>
                        <Grid container rowGap={2}>
                            <Grid
                                display='flex'
                                justifyContent='center'
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Typography variant="h4">Property of</Typography>
                            </Grid>

                            <Grid
                                display='flex'
                                justifyContent='center'
                                size={{
                                    lg: 12,
                                    md: 12,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <Typography variant="h4">{assetData?.['Asset Owner'] || ownerName || '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid
                        display='none'
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <CustomPrintQrCode type='asset' assetCode={assetCode} ref={componentRef} />
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Grid container spacing={2} display='flex' justifyContent='flex-end'>
                            {/* {
                                props.type === 'list' &&
                                <>
                                <Grid>
                                    <Button variant="contained" color="error" onClick={() => props.handleClose()}>Close</Button>
                                </Grid>
                                </>
                            } */}
                            
                            <Grid>
                                {/* <Button variant="contained" color="primary">Print</Button> */}
                                <ReactToPrint 
                                    trigger={() => <Button variant="contained">Print</Button>}
                                    content={() => componentRef.current}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </>
    );

}

export default QRCodeForAssets