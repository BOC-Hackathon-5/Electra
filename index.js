const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000; // You can change this
const {
  get_oath_token,
  get_subscription_id,
  get_oath_token_to_update,
  get_subscription_id_after_update,
  activate_the_subscription,
} = require("./requests");

const {
  get_account_info,
  get_account_balance,
  get_account_statement,
} = require("./accounts");

const { sign_payment_payload, init_payment_payload, execute_payment } = require("./payments");
const { processXml } = require("./data-parser");

// get from environment variables
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const base_url = process.env.BASE_URL;
const jwt_base_url = process.env.JWT_BASE_URL;

async function resubscription(base_url, code, patch) {
  let oauth2_token_to_update = await get_oath_token_to_update(base_url, code, client_id, client_secret);
  console.log("Token:", oauth2_token_to_update);

  let subscriptionId = fs.readFileSync("subscription.txt", "utf8");

  let resubscription;
  if (patch) {
    let activation_response = await activate_the_subscription(
      base_url,
      oauth2_token_to_update,
      subscriptionId
    );
    resubscription = activation_response;
    console.log("Activation Response:", activation_response);
  } else {
    resubscription = oauth2_token_to_update;
  }
  return resubscription;
}

app.get("/parse_xml", async (req, res) => {
  await processXml();
  res.send("Data parsed and saved to output.csv");
});

app.get("/", async (req, res) => {
  // if parameter code is present, then we have been redirected from the bank
  if (req.query.code && !fs.existsSync("activated_subscription.txt")) {
    let code = req.query.code;

    let activation_response = await resubscription(base_url, code, true);
    return res.send(activation_response);
  } else if (req.query.code) {
    let payment_code = req.query.code;
    console.log("Payment Code:", payment_code);
    let oauth2_token_payment = await resubscription(base_url, payment_code, false);

    let payment_result = await execute_payment(base_url, fs.readFileSync("payment.txt", "utf8"), oauth2_token_payment);
    return res.send(payment_result.description + " with ref_id: " + payment_result.refNumber);
  }

  // build a page to do the following:
  res.send("welcome to our app");
});



app.get("/create_payment/:price", async (req, res) => {
  let price = req.params.price;
  let payload = await sign_payment_payload(
    jwt_base_url,
    "351092345676",
    "351012345673",
    price
  );
  let token = fs.readFileSync("token.txt", "utf8");
  let payment = await init_payment_payload(base_url, payload, token);
  console.log("Payment Payload Signed");

  let redirectUrl =
    "https://sandbox-apis.bankofcyprus.com/df-boc-org-sb/sb/psd2/oauth2/authorize?response_type=code&redirect_uri=http://localhost&scope=UserOAuth2Security&client_id=" +
    client_id +
    "&paymentid=" +
    payment.payment.paymentId;
  fs.writeFileSync("payment.txt", payment.payment.paymentId);
  return res.redirect(redirectUrl);
});

app.get("/create_subscription", async (req, res) => {

  let oauth2_token = "";
  if (fs.existsSync("token.txt")) {
    oauth2_token = fs.readFileSync("token.txt", "utf8");
  } else {
    oauth2_token = await get_oath_token(base_url, client_id, client_secret);
  }
  console.log("Token:", oauth2_token);

  let subscriptionId = "";
  if (fs.existsSync("subscription.txt")) {
    subscriptionId = fs.readFileSync("subscription.txt", "utf8");
  } else {
    subscriptionId = await get_subscription_id(base_url, oauth2_token);
  }
  console.log("Subscription:", subscriptionId);

  // replace the subscriptionid with the subscription id from the response
  res.redirect(
    base_url +
      "oauth2/authorize?response_type=code&redirect_uri=http://localhost&scope=UserOAuth2Security&client_id=" +
      client_id +
      "&subscriptionid=" +
      subscriptionId
  );
});

app.get("/get_account_info/:id", async (req, res) => {
  let oauth2_token = fs.readFileSync("token.txt", "utf8");
  let subscription_id = fs.readFileSync("subscription.txt", "utf8");

  const account_id = req.params.id;
  let account_info = await get_account_info(
    base_url,
    oauth2_token,
    account_id,
    subscription_id
  );
  console.log("Account Info:", account_info);
  res.send(account_info);
});

app.get("/get_account_balance/:id", async (req, res) => {
  let oauth2_token = fs.readFileSync("token.txt", "utf8");
  let subscription_id = fs.readFileSync("subscription.txt", "utf8");

  const account_id = req.params.id;
  let account_balance = await get_account_balance(
    base_url,
    oauth2_token,
    account_id,
    subscription_id
  );
  console.log("Account Balance:", account_balance);
  res.send(account_balance);
});

app.get("/get_account_available_balance/:id", async (req, res) => {
  let oauth2_token = fs.readFileSync("token.txt", "utf8");
  let subscription_id = fs.readFileSync("subscription.txt", "utf8");

  const account_id = req.params.id;
  let account_balances = await get_account_balance(
    base_url,
    oauth2_token,
    account_id,
    subscription_id
  );
  console.log("Account Available Balance:", account_balances[0].balances[0]);
  res.send(account_balances[0].balances[0].amount.toString());
});

app.get("/get_account_statement/:id", async (req, res) => {
  let oauth2_token = fs.readFileSync("token.txt", "utf8");
  let subscription_id = fs.readFileSync("subscription.txt", "utf8");

  const account_id = req.params.id;
  let account_statement = await get_account_statement(
    base_url,
    oauth2_token,
    account_id,
    subscription_id,
    "16/04/2020",
    "16/04/2024"
  );
  console.log("Account Statement:", account_statement);
  res.send(account_statement);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
