import axios from "axios";

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

if (!PAYMONGO_SECRET_KEY) {
  throw new Error("Missing PAYMONGO_SECRET_KEY in environment variables");
}

// PayMongo auth = HTTP Basic Auth, secret key as username, blank password
const authHeader =
  "Basic " + Buffer.from(`${PAYMONGO_SECRET_KEY}:`).toString("base64");

const paymongo = axios.create({
  baseURL: "https://api.paymongo.com/v1",
  headers: {
    Authorization: authHeader,
    "Content-Type": "application/json",
  },
});

export default paymongo;
