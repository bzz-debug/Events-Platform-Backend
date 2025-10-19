const { db } = require("./firebase");

exports.postGoogleUser = async function (email, googleId, refreshToken) {
  console.log(googleId);
  const userDocRef = db.collection("googleUsers").doc(googleId);
  await userDocRef.set(
    {
      email,
      googleId,
      refreshToken,
    },
    { merge: true }
  );
  const response = await userDocRef.get();
  return {
    success: true,
    user: response.data(),
  };
};
exports.fetchRefreshToken = async (userId) => {
  const userDocRef = db.collection("googleUsers").doc(userId);
  const doc = await userDocRef.get();
  if (!doc.exists) {
    console.log("No user found for this userId!");
    return null;
  }
  const data = doc.data();
  console.log("User doc data:", data);
  return data.refreshToken;
};

exports.addAttendee = async (eventId, newAttendeeEmail) => {
  const eventRef = doc(db, "events", eventId);
  await updateDoc(eventRef, {
    attendees: arrayUnion(newAttendeeEmail),
  });
  const updatedDoc = (await getDoc(eventRef)).data();
  return updatedDoc.attendees;
};
