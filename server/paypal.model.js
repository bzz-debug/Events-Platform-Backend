const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

function generateAccessToken() {
  return axios({
    url: process.env.PAYPAL_BASE_URL + "/v1/oauth2/token",
    method: "post",
    data: "grant_type=client_credentials",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
  }).then((response) => {
    return response.data.access_token;
  });
  //make sure to error handle here
}

exports.createOrder = (totalPrice, eventId, userId) => {
  return generateAccessToken()
    .then((accessToken) => {
      return axios({
        url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + accessToken,
        },
        data: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              //   items: [
              //     {
              //       name: "Paid Event",
              //       description: "Paid Event",
              //       quantity: 1,
              //       unit_amount: {
              //         currency_code: "GBP",
              //         value: `5`,
              //       },
              //     },
              //   ],
              amount: {
                currency_code: "GBP",
                value: `${totalPrice}`,
                breakdown: {
                  item_total: {
                    currency_code: "GBP",
                    value: `${totalPrice}`,
                  },
                },
              },
            },
          ],
          application_context: {
            return_url:
              "https://weston-walkies.netlify.app" +
              "/api/complete-order" +
              `/${eventId}/${userId}`,
            cancel_url: "https://weston-walkies.netlify.app" + "/cancel-order",
            user_action: "PAY_NOW",
            brand_name: "Weston Walkies",
            shipping_preference: "NO_SHIPPING",
          },
        }),
      });
    })
    .then((response) => {
      //   console.log(
      //     response.data
      // response.data.links.find((link) => link.rel === "approve").href

      return response.data.links.find((link) => link.rel === "approve").href;
    })
    .catch((error) => {
      //   console.log(
      //     "❌ Error in createOrder:",
      //     error.response?.data || error.message
      //   );
      throw error;
    });
};
