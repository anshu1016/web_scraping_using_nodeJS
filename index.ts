import express from "express";
import puppeteer from "puppeteer";
import schedule from "node-schedule";

const app = express();
const port = 3000;

// Function to scrape title and price from a webpage
const getTitleAndPrice = async (url: string) => {
  let browser;
  try {
    // Launch Puppeteer with headless mode and necessary flags
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Important flags for running in sandboxed environments
    });
    const page = await browser.newPage();
    await page.goto(url);

    // Adjust these selectors to the actual page structure
    return await page.evaluate(() => {
      const title = document.querySelector(".information")?.textContent?.trim(); // Replace with actual selector
      const price = document
        .querySelector(".rateBlock")
        ?.textContent.split(" ")[0]
        .split(".")[0];
      //const price = parseInt(stringPrice, 10);
      return { title, price };
    });
  } catch (error) {
    console.error("Error fetching title and price:", error);
    return { title: null, price: null };
  } finally {
    if (browser) await browser.close();
  }
};

// Function to compare current price with the threshold
const comparePrice = (currentPrice: string | null, threshold: number) => {
  if (!currentPrice) {
    console.log("Price not available.");
    return;
  }

  // Assuming price starts with a currency symbol (e.g., "$1,200")
  const priceNumber = parseFloat(currentPrice.replace(/[^0-9.]/g, ""));
  if (priceNumber < threshold) {
    console.log("Yohuu, Amount reduced. Please check.");
  } else {
    console.log("Price has not dropped below the threshold.");
  }
};

// Schedule the task to run every minute
schedule.scheduleJob("*/1 * * * *", async () => {
  const url =
    "https://www.flipkart.com/apple-iphone-13-blue-128-gb/p/itm6c601e0a58b3c?pid=MOBG6VF5SMXPNQHG&lid=LSTMOBG6VF5SMXPNQHGL5FN51&marketplace=FLIPKART&q=i+phone+13&store=tyy%2F4io&srno=s_1_1&otracker=search&otracker1=search&fm=Search&iid=0f7ce846-68cb-44fd-83d1-a1c06727883f.MOBG6VF5SMXPNQHG.SEARCH&ppt=sp&ppn=sp&ssid=lr2wolx84w0000001728923039086&qH=a919e22e1bbe313d";
  const { title, price } = await getTitleAndPrice(url);
  const threshold = 1000;

  if (title && price) {
    console.log(`Product: ${title}, Current Price: ${price}`);
    comparePrice(price, threshold);
  } else {
    console.log("Failed to retrieve product data.");
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Hello CodeSandbox!");
});

// Start server
app.listen(port, () => {
  console.log(`Sandbox listening on port ${port}`);
});
