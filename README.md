
* rename `config_example.json` to `config.json` and populate:
    * host (`my-server.com`)
    * user - this user will be used in the header request
        * domain
        * name 
* certificates - add `client.pem`, `client_key.pem` and `root.pem` in `cert` folder
* run `npm install`
* run `npm run start`
* open browser and navigate to `http://localhost:8080`