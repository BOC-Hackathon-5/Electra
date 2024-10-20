const axios = require("axios");
const fs = require("fs");

// write function to export the request object
async function get_oath_token(base_url, client_id, client_secret) {
  try {
    const response = await axios.post(
      base_url + "oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
        scope: "TPPOAuth2Security",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // record oauth2_token in a file
    fs.writeFile("token.txt", response.data.access_token, (err) => {
      if (err) {
        console.error("Error writing token to file:", err);
      } else {
        console.log("Token saved to token.txt");
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting token:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

async function get_subscription_id(base_url, accessToken) {
  try {
    const response = await axios.post(
      base_url + "v1/subscriptions",
      {
        accounts: {
          transactionHistory: true,
          balance: true,
          details: true,
          checkFundsAvailability: true,
        },
        payments: {
          limit: 99999999,
          currency: "EUR",
          amount: 999999999,
        },
      },
      {
        headers: {
          originUserId: "test",
          timeStamp: "now", // Or use a formatted timestamp if needed
          journeyId: "test",
          app_name: "Test",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // record subscription in a file
    fs.writeFile("subscription.txt", response.data.subscriptionId, (err) => {
      if (err) {
        console.error("Error writing subscription to file:", err);
      } else {
        console.log("Subscription saved to subscription.txt");
      }
    });

    return response.data.subscriptionId;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

// get_oath_token_to_update();
async function get_oath_token_to_update(
  base_url,
  code,
  client_id,
  client_secret
) {
  let response = await axios.post(
    base_url + "oauth2/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: client_id,
      client_secret: client_secret,
      code: code,
      scope: "UserOAuth2Security",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  fs.writeFile("token_to_update.txt", response.data.access_token, (err) => {
    if (err) {
      console.error("Error writing token to file:", err);
    } else {
      console.log("Token to update saved to token_to_update.txt");
    }
  });
  return response.data.access_token;
}

// get_payment_token_to_update();
async function get_payment_token_to_update(
  base_url,
  code,
  client_id,
  client_secret
) {
  let response = await axios.post(
    base_url + "oauth2/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: client_id,
      client_secret: client_secret,
      code: code,
      scope: "UserOAuth2Security",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  fs.writeFile("token_to_pay.txt", response.data.access_token, (err) => {
    if (err) {
      console.error("Error writing token to file:", err);
    } else {
      console.log("Token to update saved to token_to_update.txt");
    }
  });
  return response.data.access_token;
}

// get_subscription_after_update();
async function get_subscription_id_after_update(
  base_url,
  accessToken,
  subscriptionId
) {
  try {
    let subscription_id;
    await axios
      .get(base_url + "v1/subscriptions/" + subscriptionId, {
        headers: {
          journeyid: "test",
          originuserid: "test",
          timestamp: "test",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log("Response:", response.data[0].subscriptionId);
        subscription_id = response.data[0].subscriptionId;
      });

    return subscription_id;
  } catch (error) {
    console.error("Error getting subscription:", error);
    throw error;
  }
}

// activate_the_subscription();
async function activate_the_subscription(
  base_url,
  accessToken,
  updatedSubscriptionId
) {
  try {
    let response = await axios.patch(
      base_url + "v1/subscriptions/" + updatedSubscriptionId,
      {
        selectedAccounts: [
          {
            accountId: "351012345674",
          },
          {
            accountId: "351012345673",
          },
          {
            accountId: "351012345671",
          },
          {
            accountId: "351012345675",
          },
        ],
        accounts: {
          transactionHistory: true,
          balance: true,
          details: true,
          checkFundsAvailability: true,
        },
        payments: {
          limit: 99999999,
          currency: "EUR",
          amount: 999999999,
        },
      },
      {
        headers: {
          app_name: "Test",
          journeyid: "test",
          originuserid: "test",
          timestamp: "test",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    fs.writeFile("activated_subscription.txt", "Activated", (err) => {});

    return response.data;
  } catch (error) {
    console.error("Error getting subscription:", error);
    throw error;
  }
}

module.exports = {
  get_oath_token,
  get_subscription_id,
  get_oath_token_to_update,
  get_subscription_id_after_update,
  activate_the_subscription,
};
//
