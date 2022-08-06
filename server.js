const express = require('express')
const app = express()
const redis = require('./modules/redis')
const fs = require("fs");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(logger);



const PORT = process.env.PORT || 3000

// Seeder
async function readJsonData() {

    try {

        const data = JSON.parse(await redis.get("palador"))

        if (data !== null) {
            console.log("Read from cache")
        } else {

            const response = await new Promise((resolve, rejects) => {
                fs.readFile("./organization-tree.json", "utf8", (err, jsonString) => {
                    if (err) {
                        rejects(err)
                    }
                    console.log("Read File ...")
                    resolve(jsonString)
                });
            })
            const data = await response;
            //Set data to Redis
            const reply = await redis.set("palador", data)
            console.log(reply)
        }

    } catch (err) {
        console.log(err)
    }
}

readJsonData();

const employeesRouter = require("./routes/employees");

app.use("/employees", employeesRouter);

function logger(req, res, next) {
    console.log(req.originalUrl);
    next();
}

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})