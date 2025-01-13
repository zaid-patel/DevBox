import dotenv from "dotenv"
import express from "express";
import { createServer } from "http";
import { initWs } from "./ws.js";
import { initHttp } from "./http.js";
import cors from "cors";


dotenv.config()

const app = express();
app.use(cors());
const httpServer = createServer(app);

initWs(httpServer);
initHttp(app);

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`listening on *:${port}`);
});