import React, { useState, useRef, useEffect } from 'react';
import { Button, Grid } from '@mui/material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const CropImage = ({ onSubmit, onClose, selectedImage }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: 'px',
    width: 300,
    height: 200,
    x: 0,
    y: 0,
    aspect: 1.5, // For maintaining a 300x200 aspect ratio
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (selectedImage) {
      setSrc(selectedImage);
      detectContentBounds(selectedImage); // Detect bounds of non-transparent content
    }
  }, [selectedImage]);

  const detectContentBounds = (imageUrl) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const { data } = imageData;

      let top = img.height, left = img.width, right = 0, bottom = 0;

      // Loop through every pixel to find the content bounds
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const alpha = data[(y * img.width + x) * 4 + 3];
          if (alpha > 0) { // Non-transparent pixel found
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
          }
        }
      }

      // Set initial crop bounds based on detected content area and restrict to default dimensions
      setCrop({
        unit: 'px',
        x: left,
        y: top,
        width: Math.min(300, right - left), // Limit width to 300px or content width
        height: Math.min(200, bottom - top), // Limit height to 200px or content height
        aspect: 1.5,
      });
    };
  };

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const makeClientCrop = async (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedUrl = await getCroppedImg(imageRef.current, crop, 'newFile.png');
      setCroppedImageUrl(croppedUrl);
    }
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = fileName;

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
        reader.onerror = () => {
          console.error('Failed to read blob');
          reject(new Error('Failed to read blob'));
        };
        reader.readAsDataURL(blob);
      }, 'image/png');
    });
  };

  return (
    <div>
      {src && (
        <ReactCrop
          crop={crop}
          onComplete={onCropComplete}
          onChange={onCropChange}
          minWidth={50}
          minHeight={50}
          style={{ width: '100%', height: 'auto' }}
          draggable
        >
          <img
            ref={imageRef}
            src={src}
            crossOrigin="anonymous"
            alt="Source"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </ReactCrop>
      )}
      <Grid container gap={2} display='flex' justifyContent='end' spacing={2} padding={'10px'}>
        <Button
          disabled={!croppedImageUrl}
          onClick={() => onSubmit(croppedImageUrl)}
          variant='contained'
        >
          Set Crop
        </Button>
        <Button
          onClick={() => onClose()}
          variant='contained'
          color='error'
        >
          Close
        </Button>
      </Grid>
    </div>
  );
};

export default CropImage;
