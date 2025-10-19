const router = require("express").Router();
const { google } = require("googleapis");
require("dotenv").config();
const {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where,
  arrayRemove,
  deleteDoc,
  onSnapshot,
} = require("firebase/firestore");

const { postGoogleUser, fetchRefreshToken, addAttendee } = require("../model");

const { payment } = require("../payment");

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

const oauth2client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5173"
);

router.get("/", async (req, res, next) => {
  res.send({ message: "Ok api is working 🚀" });
});

router.post("/create-tokens", async (req, res, next) => {
  console.log("POST request received");
  console.log("Request body:", req.body);
  console.log("Content-Type:", req.headers["content-type"]);
  try {
    const { code } = req.body;
    const response = await oauth2client.getToken(code);
    console.log("RESPONSE:", response.tokens);
    const { access_token, refresh_token } = response.tokens;
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const user_info = await userInfoResponse.json();
    const { email, id } = user_info;

    const result = await postGoogleUser(email, id, refresh_token);

    console.log("user_info:", user_info);
    res.send({ user_info });

    // need to store the tokens in the database from here. DO NOT send back to the front end.
  } catch (error) {
    console.log("Error:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.log("Full error:", error);
    next(error);
  }
});

router.post("/create-event", async (req, res, next) => {
  console.log("calendar event request received");
  const {
    eventName,
    startDateTimeObject,
    endDateTimeObject,
    eventDescription,
    userId,
    //need to send user google ID to retrieve the refresh token from the backend.
  } = req.body;

  console.log(req.body);

  const startDateTime = new Date(
    startDateTimeObject.seconds * 1000
  ).toISOString();
  const endDateTime = new Date(endDateTimeObject.seconds * 1000).toISOString();

  const refresh_token = await fetchRefreshToken(userId);

  try {
    oauth2client.setCredentials({ refresh_token });
    const calendar = google.calendar("v3");
    const response = await calendar.events.insert({
      auth: oauth2client,
      calendarId: "primary",
      requestBody: {
        summary: eventName,
        eventDescription: eventDescription,
        colorId: "6",
        start: {
          dateTime: startDateTime,
        },
        end: {
          dateTime: endDateTime,
        },
      },
    });
    res.send(response);
  } catch (error) {
    console.log("Calendar event error:", error);
    //   res.status(500).send({ error: "Internal server error" });
    // }
  }
});

router.post("/pay", payment);

router.get("/complete-order/:eventId/:userId", (req, res, next) => {
  const { eventId, userId } = req.params;
  addAttendee(eventId, userId).then(() => {
    res.redirect("http://localhost:5173/complete-order");
  });
});

module.exports = router;
