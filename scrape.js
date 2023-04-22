require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const client = require("https");

const restaurants = [];

const wsChromeEndpointurl = process.env.WS_CHROME_ENDPOINT_URL;

function formattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${year}-${month}-${day}-${hour}-${minute}-${second}`;
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log("image downloading");
        res
          .pipe(fs.createWriteStream(filepath))
          .on("error", reject)
          .once("close", () => resolve(filepath));
      } else {
        console.log("trouble");
        // Consume response data to free up memory
        res.resume();
        reject(
          new Error(`Request Failed With a Status Code: ${res.statusCode}`)
        );
      }
    });
  });
}

async function updateJsonFile(filePath, inputData) {
  // Read the JSON file from the given path
  const rawData = await fs.promises.readFile(filePath);
  const jsonData = JSON.parse(rawData);

  // Use the given update function to make changes to the JSON data
  jsonData.restaurants.push(inputData);

  // Write the updated JSON data back to the file
  return await fs.promises.writeFile(
    filePath,
    JSON.stringify(jsonData, null, 4)
  );
}

// promise delay, if we need it
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

(async () => {
  const runId = formattedDate();
  const RUN_FILE = `./json/${runId}_restaurants.json`;

  const listenForMenus = async (response) => {
    // listen for menu URL
    // https://tw.fd-api.com/api/v5/vendors/f6sq?include=menus,bundles,multiple_discounts&language_id=6&opening_type=delivery&basket_currency=TWD&show_pro_deals=true
    const regex = /\/tw.fd-api.com\/api\/v5\/vendors\//;
    const url = response.url();
    const isMatch = regex.test(url);

    // filter out the JS XHR requests
    const headers = response.headers();
    const contentType = headers["content-type"];

    if (contentType === "application/json") {
      if (isMatch) {
        try {
          console.log("<<", response.status(), response.url());
          const responseBuffer = await response.buffer();
          const responseString = responseBuffer.toString();
          const responseObj = JSON.parse(responseString);
          const restaurant = responseObj.data;

          if (!restaurant) return;

          // download images
          if (restaurant.menus) {
            for (var menuIndex in restaurant.menus) {
              const menu = restaurant.menus[menuIndex];
              const menuId = menu.id;
              for (var menuCategoryIndex in menu.menu_categories) {
                const menuCategory = menu.menu_categories[menuCategoryIndex];
                const menuCategoryId = menuCategory.id;

                for (var productIndex in menuCategory.products) {
                  const product = menuCategory.products[productIndex];
                  const productId = product.id;

                  if (product.images.length > 0) {
                    image = product.images[0];
                    const filepath = `menu-images/${runId}_${menuId}-${menuCategoryId}-${productId}.jpg`;
                    product.images[0].local_filepath = filepath;

                    try {
                      await downloadImage(image.image_url, `./${filepath}`);
                    } catch (e) {
                      console.log("ERROR with image download");
                    }
                  }
                }
              }
            }
          }
          const file_path = RUN_FILE;
          await updateJsonFile(file_path, restaurant);
          //restaurants.push(restaurant);
        } catch (e) {
          console.log("**************************");
          console.log("ERROR", e);
          console.log("---------------------------");
          console.log("**************************");
        }
      }
    }
  };

  // init the empty file for this run
  await fs.promises.writeFile(
    RUN_FILE,
    JSON.stringify({ restaurants: [] }, null, 4),
    "utf8"
  );

  let screenShotCounter = 0;
  // Launches a browser instance
  const browser = await puppeteer.connect({
    headless: false,
    //headless: true,
    browserWSEndpoint: wsChromeEndpointurl,
    defaultViewport: null,
  });

  // Creates a new page in the default browser context
  const page = await browser.newPage();

  // Navigates to the page to be scraped
  //const response = await page.goto('https://www.foodpanda.com.tw/');

  // follow city links
  const cityResponse = await page.goto(
    "https://www.foodpanda.com.tw/city/kaohsiung-city",
    {
      waitUntil: "networkidle0",
    }
  );

  let links = await page.evaluate(() => {
    let data = [];
    let elements = document.getElementsByTagName("a");
    for (var element of elements) {
      // push condition
      const regex = /\/restaurant\//;
      const url = element.href;
      const isMatch = regex.test(url);
      if (isMatch) {
        data.push(element.href);
      }
    }
    return data;
  });

  // follow restaurant links
  // consolelog(links);
  page.on("response", listenForMenus);

  for (let i = 0; i < links.length; i++) {
    // for (let i = 0; i < 1; i++) {
    const url = links[i];
    try {
      const restaurantResponse = await page.goto(`${url}`, {
        waitUntil: "networkidle0",
      });
      // logs the status of the request to the page
      console.log("Request status: ", restaurantResponse?.status(), "\n\n\n\n");
    } catch (e) {
      console.log("ERROR waiting for restaurant page");
    }

    // screenShotCounter += 1;
    // await page.screenshot({
    //   path: `screenshots/${runId}_${screenShotCounter}-result.png`,
    // });

    // console.log("Screenshot taken");
  }

  // Closes the browser instance
  //await browser.close();
})();

