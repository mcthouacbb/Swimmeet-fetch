# Data fetcher for swimmeet.com
Fetches swim time data from [swimmeet.com](https://swimmeet.com) and outputs it in a convenient format

## Usage
Create a text file and copy and paste each link from [swimmeet.com](https://swimmeet.com)
On a separate line type the fields. Fields can be one of "place", "school", "name", "time", and "timeStr"
"place": the ranking of the time. 1 is the best
"school": The school of the swimmer who placed the time
"name": The name of the swimmer
"time": the time, in seconds
"timeStr": the time, in the format minutes:seconds, seconds can be a decimal
Lines starting with two slashes will be ignored

An example input text file
```
https://www.swimmeet.com/swdistrict24/cincinnati/psych-sheets/girls-d1-50-freestyle.html
https://www.swimmeet.com/swdistrict24/cincinnati/psych-sheets/boys-d1-100-backstroke.html
// this commment will be ignored
school, time, timeStr, place
```

Run `node fetch-data.js <path-to-your-text-file>` from the directory containing `fetch-data.js`
A file named `results.txt` with the current date and time in the name will appear. This file contains the output of the program.

## installation
You will need to install nodejs and npm to run this project
Run `npm install` to install the dependencies
