import { Card, CardMedia, Tooltip, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PushProductList, PushPreOrderItems } from '../../../../redux/actions/pos_product_list';

function DetailedProductItem({
    id,
    thumbnail,
    price,
    title,
    receiving_quantity,
    data,
    tab_count,
    unit,
    posId,
    stock_type,
    max_price,
    lastProductElementRef,
    lastProductItemID,
    isQtyAvailable,
    isTabSize,
    tax_category,
    lot_number,
    trans_date
}) {
    const dispatch = useDispatch();
    // const {list} = useSelector(state=>state.productListReducer)
    // var db = new DB('pos_schema');
    const {
        productListReducer: { pre_order_status, product_lists },
    } = useSelector((state) => state);

    const [imageSrc, setImageSrc] = useState(thumbnail && thumbnail.length > 0 ? thumbnail[0] : "/img.png");
    const imageUrl = thumbnail && thumbnail.length > 0 ? thumbnail[0] : null;
    const [serialNumberDialogOpen, setSerialNumberDialogOpen] = useState(false)
    const [serialNumber, setSerialNumber] = useState('');
    const [serialNumberError, setSerialNumberError] = useState('');


    // useEffect(() => {
    //   if (imageUrl) {
    //     const img = new Image();
    //     img.src = imageUrl;
    //     img.onload = () => setImageSrc(imageUrl);
    //     img.onerror = () => setImageSrc("/img.png");
    //   }
    // }, [imageUrl]); 

    const handleClick = async () => {
        if (pre_order_status) {
            await dispatch(PushPreOrderItems({ ...data }, posId));
        } else {
            // if (data.is_serialized === 1) {
            //     setSerialNumberDialogOpen(true)
            // }
            // else {
                await dispatch(PushProductList({ ...data }, posId));
            // }
        }

        // let res = await db.createCheckouts(data, tab_count);
    };
    // const string = "Name".slice(0, 250).concat('...');

    const getIgst = (data) => {
        let tax = '';
        if (data.taxes) {
            data.taxes.forEach((t) => {
                if (t.tax_group === 'IGST') {
                    tax = t.tax_rate;
                }
            });
        }
        return tax;
    };

    const handleProductAdd = async () => {
        if (!serialNumber.trim()) {
            setSerialNumberError('Please enter the serial number for this product');
            return;
        }

        const product = data;

        const hasLotNumber = Object.values(product_lists).some(tab =>
            tab.productData.some(p => p.lot_number === serialNumber)
        );

        if (hasLotNumber) {
            setSerialNumberError('Lot Number already in use');
            return;
        }

        const productLot = product.lots?.find(
            lot => lot.lot_number === serialNumber
        );

        if (!productLot) {
            setSerialNumberError('Please enter the correct serial number');
            return;
        }

        await dispatch(
            PushProductList(
                { ...product, lot_number: productLot.lot_number },
                posId
            )
        );

        setSerialNumber('');
        setSerialNumberError('');
        setSerialNumberDialogOpen(false);
    };


    return (
        <>
            <div
                onClick={handleClick}
                {...(lastProductElementRef !== '' && { ref: lastProductElementRef })}
                {...(lastProductItemID !== '' && { 'data-lastitemid': lastProductItemID })}
            >
                <Card sx={{
                    width: '100%',
                    height: '100%',
                    // maxWidth: 'inherit',
                    // maxHeight: 'inherit',
                    textAlign: 'center',
                    boxShadow: 3,
                    // position: 'relative',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    bottom: '23px',
                    '&:hover': {
                        transform: 'scale(1.07)',
                        boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)'
                    }
                }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                            <CardMedia
                                component="img"
                                height="100px"
                                image={imageSrc}
                                alt={title || "Product Image"}
                                sx={{
                                    // objectFit: "cover",
                                    width: "100%",
                                    backgroundColor: "rgb(255, 255, 255)"
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 8 }} display='flex' alignItems='center'>
                            <Grid container spacing={1} display='flex' alignItems='center'>
                                <Grid size={{ xs: 12 }}>
                                    <Tooltip title={title} placement="top">
                                        <Typography
                                            variant="body2"
                                            sx={{ fontSize: "13px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", paddingX: 1.5 }}
                                        >
                                            {title}
                                        </Typography>
                                    </Tooltip>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "13px", fontWeight: 600 }}
                                    >
                                        {lot_number}
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "13px" }}
                                    >
                                        {
                                            tax_category === "GST0" ? `₹ ${unit}` : `₹ ${stock_type === 1 ? ((unit / 100) * getIgst(data) + unit).toFixed(2) : max_price}`
                                        }
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontSize: "13px", fontWeight: 600  }}
                                    >
                                        {trans_date}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>
            </div>
        </>
    );
}

export default DetailedProductItem