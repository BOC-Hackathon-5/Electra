const axios = require("axios");
const fs = require("fs");

// get account information
async function get_account_info(
  base_url,
  oauth2_token,
  account_id,
  subscription_id
) {
  try {
    let response = await axios.get(base_url + "v1/accounts/" + account_id, {
      headers: {
        Authorization: "Bearer " + oauth2_token,
        subscriptionId: subscription_id,
        originUserId: "test",
        timestamp: "test",
        journeyId: "test",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting account information:", error);
    throw error;
  }
}

// get account balance
async function get_account_balance(
  base_url,
  oauth2_token,
  account_id,
  subscription_id
) {
  try {
    let response = await axios.get(
      base_url + "v1/accounts/" + account_id + "/balance",
      {
        headers: {
          Authorization: "Bearer " + oauth2_token,
          subscriptionId: subscription_id,
          originUserId: "test",
          timestamp: "test",
          journeyId: "test",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting account balance:", error);
    throw error;
  }
}

// get account statement
async function get_account_statement(
  base_url,
  oauth2_token,
  account_id,
  subscription_id,
  start_date,
  end_date
) {
  try {
    let response = await axios.get(
      base_url +
        "v1/accounts/" +
        account_id +
        "/statement?startDate=" +
        start_date +
        "&endDate=" +
        end_date +
        "&maxCount=0",
      {
        headers: {
          Authorization: "Bearer " + oauth2_token,
          subscriptionId: subscription_id,
          originUserId: "test",
          timestamp: "test",
          journeyId: "test",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting account statement:", error);
    throw error;
  }
}

module.exports = {
  get_account_info,
  get_account_balance,
  get_account_statement,
};
