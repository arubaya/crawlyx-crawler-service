import express from "express";
import http from "http";
import dotenv from "dotenv";
import puppeteer from "puppeteer";
import { readdirSync } from "fs";

/**
 * NodeJs server initialization
 */
dotenv.config(); // Used for init env
const PORT = process.env.PORT || 8080; // Set server PORT, default 8080
const app = express(); // Init expressJs
const server = http.createServer(app); // Create http server, if want to use https you need config
const router = express.Router(); // init server router
app.use(express.json());

/**
 * ExpressJs router handler
 */
router.get("/", async (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

router.post("/api/scraping", async (req, res) => {
  try {
    const data = req.body;
    console.log("Body", { data });
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        deviceScaleFactor: 1,
        hasTouch: false,
        height: 1080,
        isLandscape: true,
        isMobile: false,
        width: 1920,
      },
    });
    const page = await browser.newPage();

    await page.goto(data.url);

    await page.waitForSelector("body");

    const elementText = await page.$eval("body", (el) => el.innerHTML);

    await browser.close();
    res
      .send({ message: `Success go to: ${data.url}`, content: elementText })
      .status(200);
  } catch (e: any) {
    console.log("Error:", e);
    const workingDir = process.cwd();
    const fileDir = readdirSync(workingDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    res
      .send({
        message: "error",
        errorMessage: e.message,
        platform: process.platform,
        workingDir,
        fileDir,
      })
      .status(500);
  }
});
app.use(router);

/**
 * Server listener
 */
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
