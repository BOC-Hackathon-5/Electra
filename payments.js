const axios = require("axios");
const fs = require("fs");

async function sign_payment_payload(base_url, account_id_1, account_id_2, sum) {
  console.log(base_url + "jwssignverifyapi/sign");
  let response = await axios.post(
    base_url + "jwssignverifyapi/sign",
    {
      debtor: {
        bankId: "",
        accountId: account_id_1,
      },
      creditor: {
        bankId: "BCYPCY2NXXX",
        accountId: account_id_2,
      },
      transactionAmount: {
        amount: sum,
        currency: "EUR",
      },
      paymentDetails: "SWIFT Transfer",
    },
    {
      headers: {
        "Content-Type": "application/json",
        tppId: "singpaymentdata",
      },
    }
  );

  return response.data;
}

async function init_payment_payload(base_url, payload, oauth2_token) {
  let response = await axios.post(base_url + "v1/payments/initiate", payload, {
    headers: {
      lang: "en",
      originUserId: "test",
      timestamp: "test",
      loginTimeStamp: "test",
      customerDevice: "test",
      customerSessionId: "test",
      customerIP: "test",
      journeyId: "test",
      "Content-Type": "application/json",
      Authorization: "Bearer " + oauth2_token,
    },
  });
  return response.data;
}

async function execute_payment(base_url, payment_id, oauth2_token) {
  let response = await axios.post(
    base_url + "v1/payments/" + payment_id + "/execute",
    {},
    {
      headers: {
        lang: "en",
        originUserId: "test",
        timestamp: "test",
        Authorization: "Bearer " + oauth2_token,
      },
    }
  );
  console.log("Payment executed:", response);
  return response.data;
}

module.exports = {
  sign_payment_payload,
  init_payment_payload,
  execute_payment,
};
