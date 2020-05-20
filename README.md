

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

## Running the tests
- Unit Tests - `npm run test`
- Integration Tests - `npm run test:integration`

## Running the application via the cluster
Update the cluster to disable pb via the cluster and a disabledUrl is set. In you `local-overrides.yaml` it will look something like this;
```javascript
of: 
  enabled: false 
  disabledUrl: "http://localhost:3006/order"
```

All environment variables are provided a default to work with your local cluster in `config.js` except;

`OIDC_CLIENT_SECRET` and `COOKIE_SECRET`

Add these to your `.env` file in project root. Ask a colleague for their values

Run the app with `npm run start:dev`
Application should now be running on <a href="http://localhost:3006/order/">http://localhost:3006/order/</a>.

## Running the application locally
Create a `.env` file in the root of the project.
Look at the `Dependencies` section to run each app on your local machine.
Update the `.env` file to point to dependencies

Start local redis in your terminal run `npm run start:redis` this will run your local redis on port `6380`
Add `REDIS_PORT=6380` to you `.env` file

On a seperate terminal run the app with `npm run start:dev`
Application should now be running on <a href="http://localhost:3006/order/">http://localhost:3006/order/</a>.

## Debugging the application

 1. In Visual Studio Code, go to Preferences > Settings and search for 'node debug' and turn the 'Auto Attach' option ON.
 2. Insert breakpoint/s.
 3. In Visual Studio Code, open the integrated terminal and run `npm run debug`

## Dependencies
[Identity Server](https://github.com/nhs-digital-gp-it-futures/BuyingCatalogueIdentity).
[Order Form API](https://github.com/nhs-digital-gp-it-futures/BuyingCatalogueOrdering#running-the-application).
