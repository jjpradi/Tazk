import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import {baseURL} from '../../../http-common';

export default function StandardImageList(props) {
  console.log(props.images,"images");
  return (
    <ImageList sx={{ width: 500, height: 450 }} cols={3} rowHeight={164}>
      {props.images.map((item) => (
        <ImageListItem key={item.img_name}>
          <img
            srcSet={item.img_url}
            src={item.img_url}
            alt={item.img_name}
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}

