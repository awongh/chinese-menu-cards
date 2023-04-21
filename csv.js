const pinyin = require("pinyin");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
// const filename = process.argv[2];
// const runId = process.argv[3];

const filename = "2023-4-21-12-19-25_restaurants.json";
const runId = "2023-4-21-12-19-25";

// Define the headers for the CSV file
const csvHeaders = [
  { id: "restaurant-name", title: "restaurant-name" },

  { id: "restaurant-name-pinyin", title: "restaurant-name-pinyin" },

  { id: "restaurant-name-english", title: "restaurant-name-english" },

  { id: "cuisines", title: "cuisines" },

  { id: "cuisines-pinyin", title: "cuisines-pinyin" },

  { id: "cuisines-english", title: "cuisines-english" },

  { id: "dish", title: "dish" },

  { id: "dish-pinyin", title: "dish-pinyin" },

  { id: "dish-english", title: "dish-english" },

  { id: "dish-type", title: "dish-type" },

  { id: "dish-type-pinyin", title: "dish-type-pinyin" },

  { id: "dish-type-english", title: "dish-type-english" },

  { id: "dish-description", title: "dish-description" },

  { id: "dish-description-pinyin", title: "dish-description-pinyin" },

  { id: "dish-description-english", title: "dish-description-english" },

  { id: "image-html", title: "image-html" },
];

// const py = pinyin(input, {
//   segment: true, // Enable segmentation. Needed for grouping.
//   group: true, // Group pinyin segments
// });

function getCuisine(restaurant) {
  return restaurant?.characteristics?.cuisines
    ?.map((cuisine) => cuisine.name)
    .join(" ");
}

function getImageHtml(runId, menuId, menuCategoryId, productId) {
  const filepath = `${runId}_${menuId}-${menuCategoryId}-${productId}.jpg`;
  return `<img class="dish-image" src="${filepath}" />`;
}

function extractData(jsonData) {
  const result = [];

  // for (let i = 0; i < jsonData.restaurants.length; i += 1) {
  for (let i = 0; i < 2; i += 1) {
    const jsonRest = jsonData.restaurants[i];

    const cuisine = getCuisine(jsonRest);

    if (!jsonRest.menus) continue;
    for (let i = 0; i < jsonRest.menus.length; i += 1) {
      const menu = jsonRest.menus[i];
      console.log(jsonRest.menus[i]);
      const menuId = menu.id;
      for (let i = 0; i < menu.menu_categories.length; i += 1) {
        const category = menu.menu_categories[i];
        const menuCategoryId = category.id;
        for (let i = 0; i < category.products.length; i += 1) {
          const product = category.products[i];
          const productId = product.id;
          const imageHtml = getImageHtml(
            runId,
            menuId,
            menuCategoryId,
            productId
          );

          const dish = {
            "restaurant-name": jsonRest.name,
            "restaurant-name-pinyin": "placeholder",
            "restaurant-name-english": "placeholder",
            cuisines: cuisine,
            "cuisines-pinyin": "placeholder",
            "cuisines-english": "placeholder",
            dish: product.name,
            "dish-pinyin": "placeholder",
            "dish-english": "placeholder",
            "dish-type": category.name,
            "dish-type-pinyin": "placeholder",
            "dish-type-english": "placeholder",
            "dish-description": product.description,
            "dish-description-pinyin": "placeholder",
            "dish-description-english": "placeholder",
            "image-html": imageHtml,
          };

          result.push(dish);
        }
      }
    }
  }

  return result;
}

async function writeCsvFromJson() {
  try {
    // Read the JSON file
    const jsonData = JSON.parse(await fs.promises.readFile(filename));

    // extract JSON data
    const inputData = extractData(jsonData);

    // Create a new CSV file and write the data to it
    const csvWriter = createCsvWriter({
      path: "anki-output.csv",
      header: csvHeaders,
    });

    await csvWriter.writeRecords(inputData);
    console.log("CSV file successfully written!");
  } catch (err) {
    console.error(err);
  }
}

writeCsvFromJson();
