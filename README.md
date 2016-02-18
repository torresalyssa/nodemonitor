# nodemonitor
NW.js app that uses PM2 to monitor the status of an app.

## To run
- Edit fields in the config.json to what you need.
      
- Start the app you want to monitor with PM2 via `pm2 start app.js`.

- Tell PM2 to start reporting monitoring information to `localhost:9615` by running `pm2 web` in the terminal.

- Run this app to monitor.

## To set up a node server to start on boot/reboot
- Run `pm2 startup` and then run the command pm2 prints out. For OSX this command is `sudo env PATH=$PATH:/usr/local/bin pm2 startup darwin -u username --hp /Users/username`

- Start up the app(s) you want to start on root/reboot with pm2 via the command `pm2 start`, e.g. `pm2 start server.js`.

- Once you have started the apps and want to keep them on server reboot, do `pm2 save`.
 
- Now, PM2 should launch your apps automatically on reboot!