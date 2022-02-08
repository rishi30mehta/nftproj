const axios = require('axios');
const cheerio = require('cheerio')
const pretty = require("pretty");
const tabletojson = require('tabletojson').Tabletojson;
var fs = require('fs');


// Entry Path Defination
const ADDRESS = "0x53930807383be7139e1da1a758370cd64469ee43"; // String Input for Contract Address
var pageNo = 1; //start of the page

// Define Base URL
var baseURL = "https://arbiscan.io/txs?a=" + ADDRESS + "&p=" + pageNo; // URL string will change with page No

console.log(baseURL)

// Fetch baseURL HTML and extract Total No of Pages
// Fetch Table from BaseURL

const main = async _ => {
    console.log("Start");
    var jsonData = [];

    const totalPages = await getTotalPages(baseURL);
    console.log(totalPages);

    //navigate through pages and extract table Data and populate jsonData object
    for (let index = 1; index < totalPages + 1; index++) {

        const pageURL = "https://arbiscan.io/txs?a=" + ADDRESS + "&p=" + index; // URL string will change with page No
        console.log(pageURL)

        const pageData = await getTableData(baseURL)
        jsonData.push(pageData)
        // console.log(jsonData)

    }

    fs.writeFileSync('jsonData.json', JSON.stringify(jsonData)).then(console.log('File Saved Successfully'));

    console.log("End");
};

main()


// Supporting Functions

async function getTotalPages(url) {
    try {
        let response = await axios(url)
        // // check response status
        // if(response.status == 200){
        //     // test for status you want, etc
        //     console.log(response.status)
        // }    

        const html = response.data;
        const $ = cheerio.load(html)

        // Extract total no of pages from page navigation elements
        const lastPage = parseInt($(" #ContentPlaceHolder1_topPageDiv > nav > ul > \
                li:nth-child(3) > span > strong:nth-child(2)").text());

        return lastPage
    }
    catch (err) {
        console.error(err);
    }
}

async function getTableData(url) {
    try {
        let response = await axios(url)
        // // check response status
        // if(response.status == 200){
        //     // test for status you want, etc
        //     console.log(response.status)
        // }    

        const html = response.data;
        const $ = cheerio.load(html)

        // Extract table and convert to json
        const tableData = $("#paywall_mask").html();

        // Convert html table data to json format    
        const tableJsonData = tabletojson.convert(tableData);

        // Some of the values are not mapped correctly, the following commands are to correct and format json keys
        var formattedtableJsonData = tableJsonData[0].map(
            obj => {
                return {
                    // "0": obj["0"],
                    "timestamp": obj["4"],
                    "from": obj["6"],
                    "txn_fee": obj["10"],
                    "txn_hash": obj["Txn Hash"],
                    "method": obj["Method"],
                    "block": obj["Block"],
                    "age": obj["From"],
                    "direction": obj["To"],
                    "to": obj["Value"],
                    "value": obj["[Txn Fee]"]
                }
            }
        );

        // console.log(Object.keys(formattedtableJsonData).length)

        return formattedtableJsonData
    }
    catch (err) {
        console.error(err);
    }
}