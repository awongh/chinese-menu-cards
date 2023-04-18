const puppeteer = require("puppeteer");
const fs = require("fs");
const client = require("https");

const restaurants = [];

const wsChromeEndpointurl =  YOUR WEB SOCKET URL HERE

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
        console.log("workingh");
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

async function writeFile(filename, writedata) {
  try {
    await fs.promises.writeFile(
      filename,
      JSON.stringify(writedata, null, 4),
      "utf8"
    );
    console.log("data is written successfully in the file");
  } catch (err) {
    console.log("not able to write data in the file ");
  }
}

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
    console.log("<<", response.status(), response.url());
    if (isMatch) {
      const responseBuffer = await response.buffer();
      const responseString = responseBuffer.toString();
      const responseObj = JSON.parse(responseString);
      console.log("stuff", responseObj.data);
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
                // get urls
                await downloadImage(
                  image.image_url,
                  `./menu-images/${runId}_${menuId}-${menuCategoryId}-${productId}.jpg`
                );
              }
            }
          }
        }
      }

      restaurants.push(restaurant);
    }
  }
};

// promise delay, if we need it
const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

(async () => {
  const runId = formattedDate();
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

  //for (let i = 0; i < links.length; i++) {
  for (let i = 0; i < 2; i++) {
    const url = links[i];
    const restaurantResponse = await page.goto(`${url}`, {
      waitUntil: "networkidle0",
    });
    // logs the status of the request to the page
    console.log("Request status: ", restaurantResponse?.status(), "\n\n\n\n");

    screenShotCounter += 1;
    await page.screenshot({
      path: `screenshots/${runId}_${screenShotCounter}-result.png`,
    });

    console.log("Screenshot taken");
  }

  const file_path = `./${runId}_restaurants.json`;
  const allData = { restaurants };
  writeFile(file_path, allData);

  // Closes the browser instance
  //await browser.close();
})();
