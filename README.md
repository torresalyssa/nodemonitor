# nodemonitor
NW.js app that uses PM2 to monitor the status of an app.

## To run
- Do an `npm update` in the root of the project and a `bower update` in nodemonitor/assets.

- Edit fields in the config.json to what you need.
      
- Start the app you want to monitor with PM2 via `pm2 start app.js`.

- Tell PM2 to start reporting monitoring information to `localhost:9615` by running `pm2 web` in the terminal.