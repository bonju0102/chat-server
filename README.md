# chat-server
This is a Node.js chat project with socket.io

# Installation
```shell
$ npm run install
```

# How to start
## DB
```shell
$ docker-compose -f ./db/docker-compose.yml up -d
```

## Server
```shell
# Check package.json for detail
$ npm run start
$ npm run dev
$ npm run prod
```

## Client
```shell
# You can change user with new token from API: http://localhost:8888/auth/getToken
http://localhost:8888/socket1
http://localhost:8888/socket2
```
