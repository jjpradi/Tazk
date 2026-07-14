import { Card, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ images, setImages, title }) => {
  console.log(title,'title')
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmYiIHN0cm9rZT0ibm9uZSIvPjwvc3ZnPg==';

  // State to manage internal images with placeholders for the first 3 images
  const [internalImages, setInternalImages] = useState(images.length > 0 ? images : [
    { img_url: placeholderImage },
    { img_url: placeholderImage },
    { img_url: placeholderImage }
  ]);

  const onDrop = useCallback((acceptedFiles) => {
    const readFile = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

    const processFiles = async (files) => {
      const imagePromises = files.map(async (file) => {
        const base64 = await readFile(file);
        return { img_url: base64 };
      });

      const imageArray = await Promise.all(imagePromises);
      setInternalImages((prevImages) => {
        const updatedImages = [...prevImages.filter(image => image.img_url !== placeholderImage), ...imageArray];
        return updatedImages.length < 3
          ? [...updatedImages, ...Array(3 - updatedImages.length).fill({ img_url: placeholderImage })]
          : updatedImages;
      });
      setImages((prevImages) => [...prevImages, ...imageArray]);
    };

    processFiles(acceptedFiles);
  }, [setImages]);

  const handleRemove = (index, event) => {
    event.stopPropagation();
    setInternalImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      if (index < images.length) {
        setImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages.splice(index, 1);
          return updatedImages;
        });
      }
      return updatedImages;
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
  });

  return (
    <div>
      <Grid container gap={1}>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12
          }}>
          <Card>
            <div {...getRootProps()} style={{ padding: '20px', textAlign: 'center' }}>
              <input {...getInputProps()} />
              <Typography style={{ fontsize: '12px', fontWeight: '700', margin: '5px 0px 0px 10px' }}> {title} </Typography>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {(images.length < 1 ? Array.from({ length: 3 }) : internalImages).map((image, index) => (
                  <div key={index} style={{ position: 'relative', display: 'inline-block', width: '100px', height: '100px', border: '1px solid #cccccc', background: '#f8f8f8' }}>
                    {image && image.img_url && (
                      <img
                        src={image.img_url}
                        alt={`Preview ${index}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    {index < images.length && (
                      <button
                        onClick={(event) => handleRemove(index, event)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ImageUpload;
