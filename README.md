# Authentication Backend

A simple authentication backend built using Node.js, Express, Bcrypt, JWT, Mongoose, and EJS templating engine.

## Features

- User authentication using Express, Bcrypt, and JWT
- Database connection with Mongoose on a local server
- Session management with cookie-parser
- EJS templating engine for dynamic content rendering

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

- Node.js
- NPM
- MongoDB

### Installing

A step by step series of examples that tell you how to get a development environment running

1. Clone the repository
   ```
   git clone https://github.com/Darkx-dev/authentication-backend.git
   ```
2. Install NPM packages
   ```
   npm install
   ```
3. Update the MongoDB connection string in `index.js`
4. Start the server
   ```
   npm start
   ```

## Built With

* [Node.js](https://nodejs.org/) - JavaScript runtime
* [Express](https://expressjs.com/) - Web framework for Node.js
* [Bcrypt](https://www.npmjs.com/package/bcrypt) - Library to help you hash passwords
* [JWT](https://www.npmjs.com/package/jsonwebtoken) - JSON Web Token for authentication
* [Mongoose](https://mongoosejs.com/) - MongoDB object modeling tool
* [Cookie-parser](https://www.npmjs.com/package/cookie-parser) - Parse Cookie header and populate `req.cookies` with an object keyed by the cookie names.
* [EJS](https://ejs.co/) - Embedded JavaScript templates

## Contributing

Please read [CONTRIBUTING.md](https://github.com/Darkx-dev/authentication-backend/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Darkx-dev** - *Initial work* - [Darkx-dev](https://github.com/Darkx-dev)

See also the list of [contributors](https://github.com/Darkx-dev/authentication-backend/contributors) who participated in this project.

## License

This project is licensed under the MIT
