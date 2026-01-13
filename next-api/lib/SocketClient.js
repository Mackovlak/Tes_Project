// lib/socketClient.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function notifySocket(event, payload, caseInfo) {
    console.log("THIS IS THE CASEINFO",caseInfo)
    console.log(`${process.env.WEBSOCKET_URL}emit`)
    try {
        await axios.post(`${process.env.WEBSOCKET_URL}emit`, { event, payload, caseInfo });
    } catch (e) {
        console.error("Socket notify error:", e.message);
    }
}
