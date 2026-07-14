// @flow
import * as React from 'react';
import IconButton from '@mui/material/IconButton';
// import Collapse from '@mui/material/Collapse';
import MoreVertIcon from '@mui/icons-material/MoreVert';
// import Popper from '@mui/material/Popper';
// import Fade from '@mui/material/Fade';
// import Paper from '@mui/material/Paper';
// import List from '@mui/material/List';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import ModeEditIcon from '@mui/icons-material/ModeEdit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import FavoriteIcon from '@mui/icons-material/Favorite';
import {Card, Grid, CardHeader, Typography, Tooltip} from '@mui/material';

function CardList(props) {
  return (
    <div>
      <Grid container spacing={2} direction='row'>
        {props.filterData.map((r) => {
          return (
            <Grid
              key={r.report_id}
              size={{
                xs: 12,
                sm: 12,
                md: 6,
                lg: 3
              }}>
              <Card
                key={r.report_id}
                onClick={() => props.handleCardClick(r.report_id)}
                style={{
                  backgroundColor:
                    r.report_type === 'sales'
                      ? '#EFEFFB'
                      : r.report_type === 'inventory'
                      ? '#F7F2E0'
                      : r.report_type === 'customer'
                      ? '#F8E0F7'
                      : '#D8CEF6',
                  cursor: 'pointer',
                }}
              >
                <CardHeader
                  action={
                    <IconButton
                      aria-label='settings'
                      onClick={(e) => {
                        e.stopPropagation();
                        props.handleClick(
                          'right-start',
                          r.report_id,
                          e,
                          props.favoriteMsg,
                        );
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={
                    r.report_name.length > 15 ? (
                      <Tooltip
                        title={r.report_name}
                        placement='top-start'
                        arrow
                      >
                        <Typography
                          style={{
                            textOverflow: 'ellipsis',
                            width: '150px',
                            overflow: 'hidden',
                          }}
                          gutterBottom
                          variant='h6'
                          component='div'
                        >
                          {r.report_name}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography
                        style={{wordWrap: 'break-word'}}
                        gutterBottom
                        variant='h6'
                        component='div'
                      >
                        {r.report_name}
                      </Typography>
                    )
                  } //.length>12?r.report_name.slice(0,12).concat('...'):r.report_name    .length>15?r.report_name.slice(0,15).concat('...'):r.report_name
                  subheader={r.report_type}
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

export default CardList;
