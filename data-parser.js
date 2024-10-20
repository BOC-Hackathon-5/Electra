const axios = require("axios");
const fs = require("fs");
const { DOMParser } = require("xmldom");
const { converter } = require("json-2-csv"); // You'll need to install this package: npm install json2csv

const bucketUrl = "https://hackatonbucket1.s3.eu-central-1.amazonaws.com/";

async function downloadAndParseJson(key) {
  try {
    const response = await axios.get(`${bucketUrl}${key}`);
    return response.data;
  } catch (error) {
    console.error(`Error downloading ${key}:`, error);
    return null; // Or handle the error as needed
  }
}

async function downloadXMLFromURL(url) {
  try {
    const response = await axios.get(url);
    const xmlContent = response.data;
    return xmlContent;
  } catch (error) {
    console.error("Error downloading XML:", error);
    throw error;
  }
}

async function processXml() {
  try {
    // download XML data from bucket url
    const xmlData = await downloadXMLFromURL(bucketUrl);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");

    console.log("Processing XML data...");

    const keys = xmlDoc.getElementsByTagName("Key");
    const keyValues = [];

    for (let i = 0; i < keys.length; i++) {
      // if string contains .json then push to keyValues
      if (keys[i].textContent.includes(".json"))
        keyValues.push(keys[i].textContent);
    }

    const jsonData = [];

    for (let i = 0; i < 2; i++) {
        console.log(bucketUrl + keyValues[i]);
        let data = await downloadAndParseJson(keyValues[i]);
        jsonData.push(data);
    }

    console.log("Finished processing XML data");

    // Convert JSON data to CSV
    let js = '{"readings": [ 97, 77, 76, 77, 78, 76, 74, 49, 78, 237, 167, 141, 127, 134, 123, 143, 131,123, 125, 155, 114, 112, 109, 101, 62, 159, 88, 82, 81, 68],"readings2": [69, 67, 144, 71, 72, 65, 61, 70, 169, 108, 109, 100, 101, 97, 99, 96, 83,100, 101, 80, 73, 69, 66, 61, 63, 62, 68, 62, 61, 73], "start_time": "16:10:04","end_time": "16:10:33","sum": 3264,"average": 108.8}';
    console.log("Converting JSON data to CSV..." + JSON.parse(js));

    let check = [
        {
      "make": "Nissan",
      "model": "Murano",
      "year": 2013,
      "specifications": {
        "mileage": 7106,
        "trim": "S AWD"
      }
    }
    ];
    const csv = await converter.json2csv([
        {
          "a.a": "1"
        }
      ]);
    console.log(csv);

    // Write CSV to file
    fs.writeFileSync("output.csv", csv);
    console.log("CSV data saved to output.csv");
  } catch (error) {
    console.error("Error processing XML:", error);
  }
}

module.exports = {
  processXml,
};
