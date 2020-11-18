# JoinMeUp
One to one video call web app.

# Technologies
Webrtc - Kurento - React.js - Node.js

# Demo
Available soon at: https://joinmeup.com

# Local installation
  1. Install Kurento
     https://doc-kurento.readthedocs.io/en/6.15.0/user/installation.html
  2. Import joinMeUp.sql
  3. Install libs-dependencies
     cd project-folder
     npm install
     npm client-install
     
# Client ports
     cd project-folder/client
     Edit package.json
     "start": "BROWSER=none PORT=PORT_NUMBER_YOU_WANT react-scripts start",
# Server ports
    cd project-folder
    Edit index.js
    const port = PORT_NUMBER_YOU_WANT;
    Or you can modify as you want
    ----------------------------------
    In order to connect to your db you have to specify these enviromental variables
    SQL_HOST
	  SQL_USER
	  SQL_PASSWORD
	  SQL_DATABASE
    You can either
    -> Create a .env file
    -> If you are in a linux machine, create a service file
    -> In your terminal type export SQL_HOST=YOUR HOST;
# Run
    cd project-folder
    npm run dev
# Notes
    Make sure you are either running on a https enviroment or localhost
    If you are using chrome you can take advantage of
    chrome://flags/? -> Insecure origins treated as secure -> Enter the url and enable
    
