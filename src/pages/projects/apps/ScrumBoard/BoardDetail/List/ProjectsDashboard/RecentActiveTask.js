import React from "react";
import {
  Card,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create Material-UI theme with Poppins font and font size 12
const theme = createTheme({
  typography: {
    fontFamily: "Poppins, Arial, sans-serif", // Add Poppins font
    fontSize: 12, // Set the default font size to 12px
  },
});

const RecentActiveTask = () => {
  const staticdata = [
    {
      user: "user-1",
      action: "created",
      item: "test1-78 - testinggg",
      time: "about 2 hours ago",
    },
    {
      user: "Test-2",
      action: "created",
      item: "test-2-78 - work to test",
      time: "about 2 hours ago",
    },
    {
      user: "Star-5",
      action: "created",
      item: "test-77 - api ",
      time: "about 2 hours ago",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          Recent activity
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Stay up to date with what's happening across the project.
        </Typography>
        <List>
          {staticdata.map((activity, index) => (
            <ListItem key={index} sx={{ alignItems: "flex-start" }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: blue[500] }}>
                  {activity.user.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", display: "inline" }}
                    >
                      {activity.user}
                    </Typography>{" "}
                    {activity.action} on{" "}
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", display: "inline" }}
                    >
                      {activity.item}
                    </Typography>
                  </>
                }
                secondary={activity.time}
              />
            </ListItem>
          ))}
        </List>
      </Card>
    </ThemeProvider>
  );
};

export default RecentActiveTask;
