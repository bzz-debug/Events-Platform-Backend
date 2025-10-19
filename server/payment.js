const { createOrder } = require("./paypal.model");

exports.payment = (req, res) => {
  const { totalPrice, eventId, userId } = req.body;
  return createOrder(totalPrice, eventId, userId)
    .then((url) => {
      console.log("🔗 Redirecting to PayPal:", url);
      res.redirect(url);
    })
    .catch((error) => {
      console.log("❌ Error in payment controller:", error);
      res.send("Error: " + error);
    });
};
