

# Order Form

  

Nodejs with Express app to present the order form pages.

  

## Requirements
- Node 12

Install the long-term support (LTS) version of <a href="https://nodejs.org/en/">Node.js</a>, which includes NPM.

  

## Setting up
```
git clone https://github.com/nhs-digital-gp-it-futures/order-form.git
cd order-form
npm install
```
## Running the application
- Run - `npm run start`
- Unit Tests - `npm run test`
- Integration Tests - `npm run test:integration`

You should now be able to view the dashboard at [http://localhost:3006](http://localhost:3006)

## Debugging the application

 1. In Visual Studio Code, go to Preferences > Settings and search for 'node debug' and turn the 'Auto Attach' option ON.
 2. Insert breakpoint/s.
 3. In Visual Studio Code, open the integrated terminal and run `npm run debug`

## Dependencies
### Buying Catalogue Identity
In order for the app to function properly, make sure you have an instance of the Buying Catalogue Identity in dev. environment running. How to set up the [Buying Catalogue Identity](https://github.com/nhs-digital-gp-it-futures/BuyingCatalogueIdentity/blob/master/README.md#running-the-application "Identity Server Running the application").

### Order Form API
In order for the app to function properly, make sure you have an instance of the Order Form API in dev. environment running. How to set up the [Order Form API](https://github.com/nhs-digital-gp-it-futures/BuyingCatalogueOrdering#running-the-application).
