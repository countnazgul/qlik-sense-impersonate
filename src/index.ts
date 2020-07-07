import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as bodyParser from 'body-parser';
import * as config from './config.json'
import express from "express";
import axios, { AxiosRequestConfig } from 'axios'

const app = express();
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, `./public/index.html`))
});

app.post("/ticket", async (req, res) => {
    let ticket = await makeRequest(req.body.user, req.body.domain)

    res.send({
        hub: `https://${config.host}/hub?qlikTicket=${ticket}`,
        qmc: `https://${config.host}/qmc?qlikTicket=${ticket}`,
    })
});

function readCertificates() {
    return {
        root: fs.readFileSync(path.join(__dirname, `../cert/root.pem`)),
        client: fs.readFileSync(path.join(__dirname, `../cert/client.pem`)),
        client_key: fs.readFileSync(path.join(__dirname, `../cert/client_key.pem`))
    }
}

async function makeRequest(userId: String, domain: String): Promise<any> {
    const xrfKey = '0123456789123456'
    let certificates = readCertificates()

    let axiosConfig: AxiosRequestConfig = {
        url: `https://${config.host}:4243/qps/ticket?xrfkey=${xrfKey}`,
        method: 'POST',
        data: {
            "UserDirectory": domain,
            "UserId": userId,
            "Attributes": []
        },
        headers: {
            "content-type": "application/json",
            "X-Qlik-xrfkey": xrfKey,
            "X-Qlik-User": `UserDirectory=${config.user.domain};UserId=${config.user.id}`
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
            cert: certificates.client,
            key: certificates.client_key,
            ca: certificates.root
        })
    }

    return await axios(axiosConfig).then((response) => response.data)
}

app.listen(config.port, () => {
    console.log(`Server started at http://localhost:${config.port}`);
});