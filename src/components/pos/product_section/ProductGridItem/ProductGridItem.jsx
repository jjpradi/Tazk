import React, { useEffect, useState } from 'react';
import {Grid, Typography, Tooltip, Card, CardMedia, CardContent, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {
  PushProductList,
  PushPreOrderItems,
} from '../../../../redux/actions/pos_product_list';
import {Badge} from '@mui/material';
import {base_url} from '../../../../http-common';
import './header.css';

const style = {
  // borderLeft: `solid 3px `,
  borderRadius: '5px',
  padding: '9px',
  backgroundColor: 'white',
  border: '1px solid lightgrey',
  cursor: 'pointer',
  fontSize: '12px',
  height: '100%',
  width: '100%',
  // display: 'flex',
  //margin:'10px'
};

const zeroQtyStyle = {
  opacity: '0.4',
  cursor : 'default',
  pointerEvents: 'none',
}
//  const imagecontainer = {
//     position : 'relative',
//     textalign: 'center',
//     color: 'white',
//   }

const imgStyle = {
  borderradius: '5px',
  padding: '1px',
  // border: '2px solid #73AD21',
  width: '80px',
  height: '80px',
  margin: 'auto',
  marginTop: '-19px',
  display: 'flex',
};

const titleStyle = {
  color: 'black',
  fontSize: '12px',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  textAlign: 'center',
  opacity: '1',
  fontWeight: 'bold',
};
// const centered = {
//     position: 'absolute',
//     top: '50%',h
//     left:'50%',
//     transform : 'translate(-50%, -50%)',
//   }

const priceStyle = {
  height: '20px',
  fontSize: '12px',
  marginTop: '1px',
  // marginRight: '10px',
  // padding: '1px',
  backgroundColor: 'rgba(0, 0, 0, 0.23)',
  color: 'black',
  borderRadius: '2px',
  fontColor: 'white',
  width: 'inherit',
  // margin: '15px',
  marginLeft: '1px',
  marginRight: '1px',
  textAlign: 'center',
  lineHeight: '1.8',
  fontWeight: 'bold',
  // lineHeight:'1.5'
  // position: 'absolute',
  // width: '100%',
  // alignSelf: 'flex-end',
};

function ProductGridItem({
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
  tax_category
}) {
  const dispatch = useDispatch();
  // const {list} = useSelector(state=>state.productListReducer)
  // var db = new DB('pos_schema');
  const {
    productListReducer: {pre_order_status, product_lists},
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
      await dispatch(PushPreOrderItems({...data}, posId));
    } else {
      if(data.is_serialized === 1){
        setSerialNumberDialogOpen(true)
      }
      else{
        await dispatch(PushProductList({...data}, posId));
      }
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
        // style = {{...style}}
        onClick={handleClick}
        {...(lastProductElementRef !== '' && {ref:lastProductElementRef }) }
        {...(lastProductItemID !== '' && {'data-lastitemid':lastProductItemID }) }
      >
        <Badge
          badgeContent={receiving_quantity.toString()}
          color="primary"
          sx={{ left: '8px', bottom: '3px', visibility: stock_type === 1  ? 'visible' : 'hidden' }}
        />

        <Card sx={{
            width: '100%',
            height: '100%',
            maxWidth: 'inherit',
            maxHeight: 'inherit',
            textAlign: 'center',
            boxShadow: 3,
            position: 'relative',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            bottom: '23px',
            '&:hover': {
              transform: 'scale(1.07)',
              boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)'
            }
          }}>
          <CardMedia
            component="img"
            height="135px"
            image={imageSrc}
            alt={title || "Product Image"}
            sx={{
              objectFit: "cover",
              width: "100%",
              backgroundColor: "rgb(255, 255, 255)"
            }}
          />

          <Box component='div' sx={{ width: '100%', position: 'absolute', bottom: '0px', backgroundColor: 'rgba(255, 255, 255, 0.8)', py: '2px' }}>
            <Grid container spacing={1}>
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Tooltip title={title} placement="top">
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "12px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", paddingX: 1.5 }}
                  >
                    {title}
                  </Typography>
                </Tooltip>
              </Grid>

              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "12px"}}
                >
                  {
                    tax_category === "GST0" ? `₹ ${unit}` : `₹ ${stock_type === 1 ? ((unit / 100) * getIgst(data) + unit).toFixed(2) : max_price}`
                  }
                  {/* {`₹.${stock_type === 1 ? ((unit / 100) * getIgst(data) + unit).toFixed(2) : max_price}`} */}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </div>
      <Dialog open={serialNumberDialogOpen} onClose={() => {
        setSerialNumberDialogOpen(false);
        setSerialNumberError('');
        setSerialNumberDialogOpen(false);
      }}>
        {/* <DialogTitle>Serial Number</DialogTitle> */}

        <DialogContent>
          <TextField
            label="Serial Number"
            value={serialNumber}
            onChange={(event) => {
              setSerialNumber(event.target.value);
              setSerialNumberError(''); 
            }}
            error={Boolean(serialNumberError)}
            helperText={serialNumberError}
            autoFocus
          />
        </DialogContent>

        <DialogActions>
          <Grid container spacing={3} display='flex' justifyContent='flex-end'>
            <Grid>
              <Button variant='contained' color='error' onClick={() => {
                setSerialNumber('')
                setSerialNumberDialogOpen(false);
                setSerialNumberError('');
                setSerialNumberDialogOpen(false);
              }}>Cancel</Button>
            </Grid>

            <Grid>
            <Button variant='contained'  disabled={!serialNumber.trim()} onClick={handleProductAdd}>Add</Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    </>
  );

  // return (
  //   // <Link to={`/product/${id}`}>
  //   <div 
  //     style={{...style}} onClick={handleClick} 
  //     {...(lastProductElementRef !== '' && {ref:lastProductElementRef }) } 
  //     {...(lastProductItemID !== '' && {'data-lastitemid':lastProductItemID }) }
  //   >
  //     <Grid container>
  //       <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4, xl: 1.5 }}>
          
  //         <Badge
  //           sx={{visibility: stock_type === 1  ? 'visible' : 'hidden'}}
  //           badgeContent={receiving_quantity.toString()}
  //           color='primary'
  //         />
          
  //         <div className='head-text'>
  //           <div className='head-image'>
  //             <img
  //               src={
  //                 thumbnail && base_url !== ''
  //                   ? `${base_url}${thumbnail}`
  //                   : 'img.png'
  //               }
  //               style={imgStyle}
  //               alt=''
  //             />
  //           </div>
  //           <div className='text-on-image'>
  //             <Typography  style={titleStyle}>
  //               {title?.length > 25 ? (
  //                 <>
  //                   <Tooltip title={title} placement='top-start' arrow>
  //                     <Typography style={titleStyle}>
  //                       {title?.slice(0, 25).concat('...')}
  //                     </Typography>
  //                   </Tooltip>
  //                 </>
  //               ) : (
  //                 title
  //               )}
  //             </Typography>
  //             {/* <p>{title.length>8? <> {title.slice(0,8).concat('...')}</>: title}</p> */}
  //             {/* <p>    
  //               </>:
  //               title }</Typography>
  //               </p> */}
  //             {/* {title.length? <>
  //                   <Tooltip title={title} placement="top-start" arrow>
  //                   <Typography  style={{textOverflow:'ellipsis',overflow: 'hidden', fontSize:'12px'}}>{title.slice(0,8).concat('...')}</Typography>
  //                   </Tooltip> 
  //               </>:
  //               title } */}
  //           </div>
  //         </div>
  //         {/* <img src={'photo.png'} style={imgStyle}/> */}
  //       </Grid>
  //     </Grid>
  //     {/* <Typography style={{margin:'5px'}}>{title.length? <>
  //                   <Tooltip title={title} placement="top-start" arrow>
  //                   <Typography  style={{textOverflow:'ellipsis',overflow: 'hidden', fontSize:'12px'}}>{title.slice(0,8).concat('...')}</Typography>
  //                   </Tooltip> 
  //               </>:
  //               title }</Typography> */}
  //     <div>
  //       {/* {stock_type === 1 && */}
  //       {/* <Badge sx={{visibility:stock_type === 1 ? 'visible' : 'hidden'}} badgeContent={receiving_quantity.toString()}  color="primary" /> */}
  //       {/* } */}

  //       {/* <Typography style={{fontSize:'10px',textAlign:'center',color:'#69706c'}}>MRP. {max_price}</Typography><br/> */}
  //       <Typography style={priceStyle}>
  //         ₹.{' '}
  //         {stock_type === 1
  //           ? ((unit / 100) * getIgst(data) + unit).toFixed(2)
  //           : max_price}
  //       </Typography>
  //     </div>
  //     {/* unit_price / 100 * gst + unit_price */}
  //     {/* <div  style={priceStyle}>
  //               <p style={{textAlign:'left'}}><Chip label={stock} /></p>
  //               <p>₹ {price}</p>
  //               </div> */}
  //   </div>
  //   // </Link>
  // );
}

export default ProductGridItem;
