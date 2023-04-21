# chinese-menu-cards

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
```



Text to Speech
https://docs.ankiweb.net/templates/fields.html?highlight=tts#text-to-speech
```
{{tts zh_TW:dish}}
```