import React, { useEffect, useState } from 'react'
import { Grid, Typography } from '@mui/material'
import BlankProfile from '../../assets/icon/emptyimg.png'
import { base_url } from 'http-common'

const ImageGallaryCard = (props) => {

    const [imageView, setImageView] = useState([])

    useEffect(() => {
        setImageView([])
        if(props.imageData.pic_filename?.length === 6) {
            setImageView([...props.imageData.pic_filename])
        }
        else {
            let toBeInserted = 6 - (props.imageData.pic_filename?.length || 0)
            if(props.imageData.pic_filename) {
                setImageView((prev) => ([...prev, ...props.imageData.pic_filename]))
            }
            while(toBeInserted != 0) {
                setImageView((prev) => ([...prev, BlankProfile]))
                toBeInserted--
            } 
        }
    }, [props.imageData.pic_filename])

  return (
      <Grid container spacing={2}>
          <Grid
              size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
              }}>
              <Typography variant='h6' align='left' style={{ paddingBottom : '20px' }}>
                  Image Gallery
              </Typography>
          </Grid>
          {
              imageView.map((img) => (
                  <Grid
                      size={{
                          lg: 2,
                          md: 2,
                          sm: 2,
                          xs: 2
                      }}>
                      <img
                           src = {img.startsWith('data:') ? img : `${base_url}${img}`}
                           alt = ''
                           style = {{ width : 100, height : 140 }}
                      />
                  </Grid>
              ))
          }
      </Grid>
  );
}

export default ImageGallaryCard