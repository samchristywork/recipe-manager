![Banner](https://s-christy.com/status-banner-service/recipe-manager/banner-slim.svg)

## Overview

This is an application that helps users plan meals and nutrient consumption by
taking advantage of the USDA's data provided through the USDA Global Branded
Food Products Database and other data sources.

## Screenshots

<div><img alt="Main page" style="" src="./res/main.png"></div>
<div><img alt="Nutrition information" style="" src="./res/nutrition.png"></div>

## Features

## Usage

Use `npm i` to install node modules.

Create a file called `.env` in the same directory as `index.js` with your API
key and port. You can get an API key for free from from <a
href="https://fdc.nal.usda.gov/">the FoodData Cental Website</a>.

```
API_KEY="YOUR_KEY"
PORT=3000
SECRET="YOUR_SECRET"
```

Run the server with `npm start`.

Alternatively, use `nodemon index.js` for ease of development.

## License

This work is licensed under the GNU General Public License version 3 (GPLv3).

[<img src="https://s-christy.com/status-banner-service/GPLv3_Logo.svg" width="150" />](https://www.gnu.org/licenses/gpl-3.0.en.html)
