import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import moment from "moment";
import useCommonRef from "pages/common/home/useCommonRef";

const BASE_URL = "https://devserver.tazk.in";

function EventsCard(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setCurrentIndex(0);
  };

  const getEventsList = () => {
    if (selectedTab === 0) return props.data?.upcomingEvents || [];
    if (selectedTab === 1) return props.data?.currentMonthEvent || [];
    if (selectedTab === 2) return props.data?.nextMonthEvent || [];
    return [];
  };

  const events = getEventsList();
  const currentEvent = events[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      ref={(el) => {
        props.ref1(el);
        props.isVisibleRef.current = el;
      }}
      style={{ height: '100%' }}
    >
      <Card sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
        {props.mode === 'edit' && (
          <IconButton
            aria-label='view code'
            onClick={() => props.setCardClose()}
            size='large'
            sx={{
              position: 'absolute',
              top: 8,
              left: 5,
              zIndex: 1
            }}
          >
            {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
          </IconButton>
        )}

        <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
          Events
        </Typography>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
        >
          <Tab label="Upcoming" />
          <Tab label="Current Month" />
          <Tab label="Next Month" />
        </Tabs>

        <CardContent sx={{ flex: 1, overflow: "hidden", p: 2 }}>
          <Box
            p={2}
            sx={{
              border: "1px solid #FFC107",
              borderRadius: "3px",
              backgroundColor: "#fff",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}>
            {currentEvent ? (
              <>
                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <ListItem sx={{ width: "auto" }}>
                    <ListItemAvatar>
                      <Avatar
                        alt={currentEvent.event_name}
                        src={BASE_URL + currentEvent.event_image_name}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${currentEvent.first_name ? currentEvent.first_name + " - " : ""}${
                        currentEvent.event_name
                      }`}
                      secondary={moment(currentEvent.event_date).format("DD-MM-YYYY")}
                    />
                  </ListItem>
                </Box>

                {events.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrev}
                      sx={{
                        position: "absolute",
                        left: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "#fff",
                        boxShadow: 2,
                        "&:hover": { backgroundColor: "#f0f0f0" }
                      }}
                    >
                      <ArrowBackIos fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={handleNext}
                      sx={{
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "#fff",
                        boxShadow: 2,
                        "&:hover": { backgroundColor: "#f0f0f0" }
                      }}
                    >
                      <ArrowForwardIos fontSize="small" />
                    </IconButton>
                  </>
                )}
              </>
            ) : (
              <Typography sx={{ p: 2 }}>No events found.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

export default useCommonRef(EventsCard);
