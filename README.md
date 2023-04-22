# chinese-menu-cards

This library downloads a set of restaruant menus from Food Panda and creates Anki flashcards out of them.

An overview of the process looks like this:

- Scrape a specific city for restaurants and menus.
    - Creates a JSON file
    - Saves associated image files locally
- Use the JSON file to create a csv file for import into Anki
    - also make pinyin and english translations of each item

- Create a template and fieldset in Anki into which the csv will be imported.
    - also has settings for iOS text-to-speech

# Connecting Chrome to `scrape.js`

https://medium.com/@jaredpotter1/connecting-puppeteer-to-existing-chrome-window-8a10828149e0


# Getting Started
Start Chrome with remote debugging enabled.

## MAC

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')
```

For Mac, once run you’ll see a printout like this:

```
DevTools listening on ws://localhost:9222/devtools/browser/41a0b5f0–6747–446a-91b6–5ba30c87e951
```

## Windows

Right click on your Google Chrome shortcut icon => Properties

In Target field, add to the very end `--remote-debugging-port=9222`

Should look something like

```
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

Click “Apply” and re-launch Chrome

For Windows, next you’ll open a browser to http://127.0.0.1:9222/json/version


# Paste the WS URL

Next, inside your file, instead of launching a new instance of Chrome you’ll connect to this existing version.

```
const wsChromeEndpointurl = 'ws://localhost:9222/devtools/browser/41a0b5f0–6747–446a-91b6–5ba30c87e951';
```

Couple of final tips:

Avoid calling browser.close(); at the end of your script unless that’s what you specifically intend to do. Otherwise you’ll have to re-open Chrome with the commands above.

Be aware that Puppeteer runs in a Node.js environment and thus has access to read/write files to the file system (fs is my favorite). Handy for exporting scraped data.

When navigating to a new page in Puppeteer and it happens to be a SPA utilizing the following syntax helps ensure the page fully loads before starting to interact with its elements.

```
await page.goto(pageUrl, {
    waitUntil: 'networkidle0'
});
```

# Anki Card Format

https://www.lengthytravel.com/create-anki-deck-google-sheets-spreadsheet/

#### Official Docs
https://docs.ankiweb.net/

#### Note
Add the template variable (fields) before adding the template HTML and styles. (Anki will throw an error).

#### Test Sheet URL
https://docs.google.com/spreadsheets/d/14EyU2Pdh6P3v9RtXIQ5xrtUxq5-3smwutTb7J62Z920/edit?usp=sharing

## Add the fields to the Anki Cards

#### template variable names
```
{{restaurant-name}}
{{restaurant-name-pinyin}}
{{restaurant-name-english}}
{{cuisines}}
{{cuisines-pinyin}}
{{cuisines-english}}
{{dish}}
{{dish-pinyin}}
{{dish-english}}
{{dish-type}}
{{dish-type-pinyin}}
{{dish-type-english}}
{{dish-description}}
{{dish-description-pinyin}}
{{dish-description-english}}
{{image-html}}
```

```
restaurant-name
restaurant-name-pinyin
restaurant-name-english
cuisines
cuisines-pinyin
cuisines-english
dish
dish-pinyin
dish-english
dish-type
dish-type-pinyin
dish-type-english
dish-description
dish-description-pinyin
dish-description-english
image-html
```


### Text to Speech
https://docs.ankiweb.net/templates/fields.html?highlight=tts#text-to-speech
```
{{tts zh_TW voices=Apple_Mei-Jia:dish}}
```

### Add the example.jpg file to your media
https://www.reddit.com/r/Anki/comments/bzyua5/where_to_find_collectionmedia_folder_mac/
```
cd ~/Library/Application\ Support/Anki2                                             2023-04-21-12
```

### Add the Card Templates to Anki
```
html/front-template.html
html/back-template.html
```

See and Change the CSS of the card using the example templates

## Copy all the media files
```
cp -R menu-images {PATH TO YOUR ANKI MEDIA COLLECTION}
```

## Run csv.js to turn the JSON into a CSV file

#### Get the run ID from the JSON file.

```
node csv.js 2023-4-21-12-19-22_restaurants.json 2023-4-21-12-19-22
```

```
node csv.js {JSON FILEPATH} {RUN ID}
```

 #### Create a new empty deck

 #### Import the csv into Anki

 #### Sync the deck to the cloud

 # Enjoy
