# Scrapper Zameen Backend

This is the backend for the [scrapper_zameen](https://github.com/Muhammad-Abdullah012/scrapper_zameen_v2) application. It provides RESTful APIs to support the frontend application and manages the core business logic and data storage.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Project](#running-the-project)
  - [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

These instructions will help you set up and run the backend project on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your machine:
- [Node.js](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)

### Installation

1. Clone the repository to your local machine:

```sh
git clone https://github.com/Muhammad-Abdullah012/scrapper_zameen_backend.git
cd scrapper_zameen_backend
```
2. Install the project dependencies using pnpm:
```sh
pnpm install
```
### Configuration
1. Create a .env file in the root directory of the project and configure your environment variables. You can use the .env.example file as a template:
```sh
cp .env.example .env
```
2. Edit the .env file and provide the necessary configuration values.
### Running the Project

To start the project in development mode, run the following command:
```sh
pnpm dev
```
The server will start using the port specified in your .env file. By default, you can access it at http://localhost:5000 if `PORT` is set to 5000 in `.env` file.

### Running Tests
To run the tests, use the following command:
```sh
pnpm test
```
### API Documentation

The API documentation is available via Swagger. Once the server is running, you can access the Swagger UI at:
```sh
    ### If server is running on port 5000 (depends on PORT in .env)
    http://localhost:5000/api-docs
```

### Folder Structure
Here is a brief overview of the project's folder structure:
```
│
├──📂 .vscode
│  ├── launch.json
│  └── settings.json
|
|──📂 migrations
|  └── migraion-files
│
├──📂 src
│  ├──📂 config
│  │  |── index.ts
|  |  |── config.js
|  |  └── sequelize.ts
│  │
│  ├──📂 controllers
│  │  ├── auth.controller.ts
|  |  ├── property.controller.ts
│  │  └── users.controller.ts
│  │
│  ├──📂 dtos
│  │  └── users.dto.ts
│  │
│  ├──📂 exceptions
│  │  └── HttpException.ts
│  │
│  ├──📂 http
│  │  ├── auth.http
│  │  └── users.http
│  │
│  ├──📂 interfaces
│  │  ├── auth.interface.ts
│  │  ├── routes.interface.ts
│  │  └── users.interface.ts
│  │
│  ├──📂 middlewares
│  │  ├── auth.middleware.ts
│  │  ├── error.middleware.ts
|  |  ├── pagination.middleware.ts
│  │  └── validation.middleware.ts
│  │
│  ├──📂 models
│  │  └── users.model.ts
│  │
│  ├──📂 routes
│  │  ├── auth.route.ts
|  |  ├── property.route.ts
│  │  └── users.route.ts
│  │
│  ├──📂 services
│  │  ├── auth.service.ts
|  |  ├── property.service.ts
│  │  └── users.service.ts
│  │
│  ├──📂 test
│  │  ├── auth.test.ts
|  |  ├── property.test.ts
│  │  └── users.test.ts
│  │
│  ├──📂 utils
│  │  ├── logger.ts
│  │  └── vaildateEnv.ts
│  │
│  ├── app.ts
│  └── server.ts
│
├── .dockerignore
├── .editorconfig
├── .env.development.local
├── .env.production.local
├── .env.test.local
├── .eslintignore
├── .eslintrc
├── .gitignore
├── .huskyrc
├── .lintstagedrc.json
├── .prettierrc
├── .swcrc
├── docker-compose.yml
├── Dockerfile.dev
├── Dockerfile.prod
├── ecosystem.config.js
├── jest.config.js
├── Makefile
├── nginx.conf
├── nodemon.json
├── package-lock.json
├── package.json
├── swagger.yaml
└── tsconfig.json
```