import { Autocomplete, Button, Card, Dialog, DialogContent, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import PrintLabel from "../pages/sales/purchases/PrintLabel"
import BarCode from "react-barcode"
import { useDispatch, useSelector } from "react-redux"
import { listProductAction } from "redux/actions/product_actions"
import Context from '../context/CreateNewButtonContext';
import { getBarCodeQrSeq } from "redux/actions/purchase_actions"
import { capitalize } from "lodash"
import { maxBodyHeight, maxHeight } from "utils/pageSize"
import { Height } from "@mui/icons-material"

// when accepting values from api, shoulsd update state of current_seq, lot_number, sequence_id to accept the exact values of that particular company

function BarCodeGenerator(){

    const dispatch = useDispatch()
    const{setModalTypeHandler, setLoaderStatusHandler} = useContext(Context)
    const {productReducer: {product}, purchasesReducer: {barCodeQrSeq}} = useSelector((state) => state)

    const[values, setValues] = useState({
        labelType: 'qrCode',
        product: null,
        mrp: null,
        offerPrice: null,
        prefix: null,
        quantity: null,
        lot_number: 10000000,
        sequence_id: 1310,
        codeSeqence: {}// pot_code_seq 
    })
    const[errors, setErrors] = useState({
        product: null,
        mrp: null,
        offerPrice: null,
        quantity: null,
    })
    const[formValues, setFormValues] = useState({text0: {}})
    const[products, setProduct] = useState([])
    const[open, setOpen] = useState(false)
    //This state needs to be updated when the product gets changed
    // const[product, setProduct] = useState({
    //     name: 'Test',
    //     cost: 10
    // })
    // const[prefix, setPrefix] = useState(null)

    useEffect(() => {
        dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler))
    }, [])

    useEffect(() => {
        if(values.quantity !== null){
            const payload = {
                sequence_name: values.labelType === 'barCode' ? 'BARCODE SEQUENCE' : 'QR SEQUENCE',
                prefix: values.prefix,
                quantity: values.quantity
            }
            dispatch(getBarCodeQrSeq(payload))
        }
    }, [values.product, values.quantity, values.prefix])

    const handleChange = async (val, name) => {
        
        console.log(val,name,'89798978989798FG',values.labelType,val !== values.labelType)

        if(val !== '' && val !== null){
            if(name === 'product'){
                await setProduct(val)
                await setValues({...values, [name]: val})
                setErrors({...errors, [name]: null})
            }
            else{
                await setValues({...values, [name]: val})
                setErrors({...errors, [name]: null})
            }
        }
        else {
            setValues({...values, [name]: null})
            setErrors({...errors, [name]: `${name} is Required`})
        }

      if(val !== values.labelType && name === 'labelType'){
    setValues(prev => ({
        ...prev,
        product: null,
        mrp: null,
        offerPrice: null,
        prefix: null,
        quantity: null
    }));

    setErrors(prev => ({
        ...prev,
        product: null,
        mrp: null,
        offerPrice: null,
        prefix: null,
        quantity: null
    }));
}
    }

    const handleClose = () => {
        setOpen(false)
    }

    const potCodeSubmit = (data) => {
        // setFormValues(data)
    }

    const handlePrint = () => {
        // setOpen(true)

        const payload = {
            sequence_name: values.labelType === 'barCode' ? 'BARCODE SEQUENCE' : 'QR SEQUENCE',
            prefix: values.prefix,
            quantity: values.quantity
        }
        dispatch(getBarCodeQrSeq(payload))
        // setValues({...values, codeSequence: generateCodeSequence(values.quantity)})
        // setBarCodeValues(generateBarCodeValues(values.quantity))
    }

    const validateForm = () => {
        const newErrors = {};
        // console.log(values,"values")
        if (!values.labelType) newErrors.labelType = 'Label type is required';
        if (!values.product) newErrors.product = 'Product is required';
        if (!values.mrp) newErrors.mrp = 'MRP is required';
        if (!values.offerPrice) newErrors.offerPrice = 'Offer Price is required';
        if (!values.quantity) newErrors.quantity = 'Quantity is required';
        // console.log("errors",errors)
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    return (
        <>
            <Card sx={{
                p: 5,
                height: 'calc(100vh - 80px)'
            }}
            >

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Typography>Bar Code/QR Code Generator</Typography>
                </Grid>
                <br />

                <Grid container spacing={2}>
                    <Grid
                        size={{
                            lg: 10,
                            md: 10,
                            sm: 10,
                            xs: 10
                        }}>
                    <Grid container spacing={3}>
                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <FormControl fullWidth>
                            <InputLabel >Select Type</InputLabel>
                            <Select
                                value= {values.labelType || ''}
                                variant="filled"
                                onChange={(e) => handleChange(e.target.value, 'labelType')}
                            >
                                <MenuItem value={'barCode'}>BarCode</MenuItem>
                                <MenuItem value={'qrCode'}>QrCode</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <TextField 
                           label='Product'
                            placeholder="Product"
                            fullWidth
                            required
                            variant="filled"
                            //type='number'
                            value={values.product || ''}
                            onChange={(e) => handleChange(e.target.value, 'product')}
                            error={!!errors.product}
                            helperText={errors.product || ''}
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <TextField 
                            label='MRP' 
                            placeholder="MRP"
                            fullWidth
                            required
                            variant="filled"
                            type='number'
                            value={values.mrp || ''}
                            onChange={(e) => handleChange(e.target.value, 'mrp')}
                            error={!!errors.mrp}
                            helperText={errors.mrp || ''}
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <TextField 
                            label='Offer Price' 
                            placeholder="Offer Price"
                            fullWidth
                            required
                            variant="filled"
                            type='number'
                            inputProps={{ min: 0 }} 
                            value={values.offerPrice || ''}
                            onChange={(e) => handleChange(e.target.value, 'offerPrice')}
                               error={!!errors.offerPrice}
                            helperText={errors.offerPrice || ''}
                           
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <TextField 
                            label='Prefix' 
                            placeholder="Prefix"
                            fullWidth
                            variant="filled"
                            value={values.prefix || ''}
                            onChange={(e) => handleChange(e.target.value, 'prefix')} 
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <TextField 
                            label='Quantity' 
                            placeholder="Quantity"
                            fullWidth
                            required
                            variant="filled"
                            type='number'
                            value={values.quantity || ''}
                            onChange={(e) => handleChange(e.target.value, 'quantity')}
                              error={!!errors.quantity}
                            helperText={errors.quantity || ''}
                        
                        />
                    </Grid>

                    <Grid
                        size={{
                            lg: 3,
                            md: 4,
                            sm: 6,
                            xs: 12
                        }}>
                        <TextField 
                            label={`Sample ${values.labelType === 'barCode' ? "BarCode" : "QR Code"}`}
                            value={values.prefix !== null ? `${values.prefix}000000001` : '000000001'}
                            onChange={(e) => e.preventDefault()}
                            variant="filled"
                            fullWidth
                        />
                    </Grid>
                    </Grid>
                    </Grid>
                    <Grid
                        size={{
                            lg: 2,
                            md: 2,
                            sm: 2,
                            xs: 2
                        }}></Grid>

                    <Grid
                        display={'flex'}
                        justifyContent={'flex-end'}
                        alignItems={'end'}
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>                          
                                <PrintLabel
                                    type='barCodeQrGenerator'
                                    pot_code_seq={barCodeQrSeq}
                                    row_id= {{id: "", data: {name: values?.product,
                                                            receiving_quantity: values.quantity,
                                                            received_quantity: values.quantity,
                                                            max_price: values.mrp,
                                                            offer_price: values.offerPrice
                                    }}}
                                    formValues={formValues}
                                    potCodeSubmit={potCodeSubmit}
                                    serialPopClose = {handleClose}
                                    labelType={values.labelType}
                                    validateForm={validateForm}
                                />                        
                    </Grid>

                </Grid>
                {/* <Button onClick={handlePrint}>Print Label</Button> */}
            </Card>
            {/* <Dialog open={open} maxWidth='lg' >
                <DialogContent>
                    <Grid container spacing={5}>
                        {
                            barCodeValues.map((d) => (
                                <Grid size={12} key={d.lot_number}>
                                    <Card>
                                        <BarCode value={d.lot_number} height={60} width={3.5}/>
                                        <Typography>{d.name}</Typography>
                                        <Typography>{d.selling_price}</Typography>
                                    </Card>
                                </Grid>
                            ))
                        }
                    </Grid>
                    <Grid>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </Grid>
                </DialogContent>
            </Dialog> */}
        </>
    );

}

export default BarCodeGenerator