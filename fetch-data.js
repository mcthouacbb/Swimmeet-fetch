const fs = require("node:fs");
const { XMLParser } = require("fast-xml-parser");

function getURLs(input) {
    let rawURLs = [];
    let fields = [];
    rawURLs = input.toString().split("\n");
    let urls = [];
    for (const rawURL of rawURLs) {
        if (rawURL.indexOf(".html") == -1) {
            if (rawURL.indexOf(",") != -1 && !rawURL.startsWith("//"))
                fields = rawURL.split(" ").join("").split(",");
            continue;
        }
        urls.push({
            rawURL: rawURL,
            dataURL: rawURL.replace(".html", ".xml")
        });
    }
    if (fields.length == 0)
        console.log("Warning: No fields specified");
    return [urls, fields];
}

function fetchURLPromise(url) {
    return new Promise((resolve, reject) => {
        fetch(url.dataURL)
            .then((response) => response.text())
            .then((text) => resolve(text));
    });
}

async function getURLData(urls) {
    let promises = [];
    for (const url of urls) {
        promises.push(fetchURLPromise(url));
    }
    return await Promise.all(promises);
}

function parseTime(timeStr) {
    let res = timeStr.split(":");
    if (res.length == 2) {
        return parseFloat(res[0]) * 60 + parseFloat(res[1]);
    } else if (res.length == 1) {
        return parseFloat(res[0]);
    } else {
        throw new Error("Time was not in expected format");
    }
}

function processXMLData(urls, rawData) {
    const parser = new XMLParser({
        ignoreAttributes: false
    });
    const data = [];
    for (const rawDataFile of rawData) {
        const xmlData = parser.parse(rawDataFile);
        const results = [];
        for (const result of xmlData.results.result) {
            const timeStr = result["@_ti"];
            const name = result["@_nm"];
            const place = result["@_rk"];
            const school = result["@_sh"];
            results.push({
                place: place,
                school: school,
                name: name,
                time: parseTime(timeStr),
                timeStr: timeStr
            });
        }
        data.push(results);
    }
    return data;
}

function getDateString() {
    let currDate = new Date();
    // the date api goes from sunday-saturday
    let string = "";
    string += (currDate.getMonth() + 1) + "-";
    string += currDate.getDate() + "-";
    string += currDate.getFullYear() + "-";
    string += currDate.getHours() + "-";
    string += currDate.getMinutes();
    return string;
}

function outputData(urls, data, input, fields) {
    let str = "";
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i].rawURL;
        let urlData = data[i];
        str += url + '\n';
        for (let j = 0; j < fields.length; j++) {
            str += fields[j];
            if (j < fields.length - 1)
                str += '\t';
        }
        str += '\n';
        for (const result of urlData) {
            for (let j = 0; j < fields.length; j++) {
                let field = result[fields[j]];
                if (typeof field == "number") {
                    // apply workaround to prevent .9999999 scenario
                    let intString = (Math.round(field * 100)).toString();
                    str += intString.substring(0, intString.length - 2) + "." + intString.substring(intString.length - 2, intString.length);
                } else {
                    str += field;
                }
                if (j < fields.length - 1)
                    str += '\t';
            }
            str += '\n';
        }
        str += '\n';
    }
    fs.writeFileSync("results-" + getDateString() + ".txt", "INPUT\n\n" + input + "\n\nRESULT\n\n" + str);
}

function main() {
    let input;
    if (process.argv.length > 2) {
        try {
            input = fs.readFileSync(process.argv[2]);
        } catch {
            console.log("Could not read from file '" + process.argv[2] + "' or could not find file '" + process.argv[2] + "', quitting");
            return;
        }
    } else {
        console.log("No file path inputted, defaulting to 'sites.txt'");
        try {
            input = fs.readFileSync(process.argv[2]);
        } catch {
            console.log("Could not read from file 'sites.txt' or could not find file 'sites.txt', quitting");
            return;
        }
    }
    const [urls, fields] = getURLs(input);
    getURLData(urls)
        .then((rawData) => processXMLData(urls, rawData))
        .then((data) => outputData(urls, data, input, fields));
}

main();
