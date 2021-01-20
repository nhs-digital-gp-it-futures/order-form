# Order Form

Node.js with Express app to present the order form pages.

## Requirements

- Node 14

Install the long-term support (LTS) version of [Node.js](https://nodejs.org/en/), which includes NPM.

## Setting up

```sh
git clone https://github.com/nhs-digital-gp-it-futures/order-form.git
cd order-form
npm install
npm run build
```

## Running the tests

- Unit Tests - `npm run test`
- Integration Tests - `npm run test:integration`

## Running the application via the cluster

Update the cluster to disable pb via the cluster and a disabledUrl is set. In you `local-overrides.yaml` it will look something like this;

```yaml
of:
  enabled: false
  disabledUrl: "http://localhost:3006/order"
```

All environment variables are provided a default to work with your local cluster in `config.js` except;

`OIDC_CLIENT_SECRET` and `COOKIE_SECRET`

Add these to your `.env` file in project root. Ask a colleague for their values

Run the app with `npm run start:dev`
Application should now be running on <http://localhost:3006/order/>.

## Running the application locally

Create a `.env` file in the root of the project.
Look at the `Dependencies` section to run each app on your local machine.
Update the `.env` file to point to dependencies

Start local redis in your terminal run `npm run start:redis` this will run your local redis on port `6380`
Add `REDIS_PORT=6380` to you `.env` file

On a separate terminal run the app with `npm run start:dev`
Application should now be running on <http://localhost:3006/order/>.

## Debugging the application

 1. In Visual Studio Code, go to Preferences > Settings and search for 'node debug' and turn the 'Auto Attach' option ON.
 2. Insert breakpoint/s.
 3. In Visual Studio Code, open the integrated terminal and run `npm run debug`

## Dependencies

[Identity Server](https://github.com/nhs-digital-gp-it-futures/BuyingCatalogueIdentity).
[Order Form API](https://github.com/nhs-digital-gp-it-futures/BuyingCatalogueOrdering#running-the-application).

## Unit tests
Run the jest unit test with `npm run test`.

## UI tests
Run the UI component tests with `npm run test:ui`.

> To run both unit and UI tests, run `npm run test:all`.

## Integration tests helpers

Run the integration tests with `npm run test:integration` by default this will run the integration tests in 2 threads.

### To run a particular browser `b`

`npm run test:integration b=chrome` -> changes the browser to run as chrome. Default set to chrome:headless

### To run ui tests for a particular page `p`

`npm run test:integration p=catalogue=solutions/dashboard` -> Will run the 3 ui.test files within this page directory

### To run a particular ui test file for a page `f`

`npm run test:integration p=catalogue=solutions/dashboard f=general` -> Will run the general.ui.test within this page directory

### Use the full path `fp`

Right click on the test file and copy the path.
`npm run test:integration fp={{path-to-app}}/order-form/app/pages/sections/order-items/catalogue-solutions/dashboard/ui-tests/general.ui.test.js c=1`

### To change the number of concurrent threads `c`

`npm run test:integration c=4` -> Run all the ui tests in 4 threads. Default is 2

These flags can be used together. So if you want to run a single ui.test file in chrome in a single thread then it will be something like this;
`npm run test:integration b=chrome p=catalogue=solutions/dashboard f=general c=1`

The order of these flags do not matter like they used to.

## NOTE: running in concurrent threads will make the test little unstable. TestCafe has a quarantineMode which is set to true when in concurrent mode. This will re-run the test maximum 3 times, if it fails but passes on subsequent attempts you will see the unstable tag next to the test

## ALSO NOTE: The nock checks are disabled when in concurrent mode. If you are getting some nock issues. Then run the test in a single thread. This will re-enable the nock checks

## ANOTHER NOTE: The ui tests will stopOnFirstFail now and will not continue to run through the tests
