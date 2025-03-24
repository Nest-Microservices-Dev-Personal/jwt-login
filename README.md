## Getting Started with Docker

### Prerequisites

- Docker
- Docker Compose
  
### Running the Application

1. Clone the repository:

   ```
   git clone https://github.com/Nest-Microservices-Dev-Personal/jwt-login.git
   ```

2. Set up environment variables (create a .env file based on .env.example if available).
   
3. Start the services using Docker Compose:

   ```
   docker-compose up -d
   ```

   This command will build and start the services defined in the `docker-compose.yml` file.
  
### Stopping the Application

To stop all services:

```
docker-compose down
```

## Getting Started with nodejs

### Prerequisites

- Node.js V.20
  
### Running the Application

1. Clone the repository:

   ```
   git clone https://github.com/Nest-Microservices-Dev-Personal/jwt-login.git
   ```
2. Project setup

    ```bash
    $ yarn install
    ```
3. Set up environment variables (create a .env file based on .env.example if available).
   
4. Compile and run the project

    ```bash
    # development
    $ yarn run start

    # watch mode
    $ yarn run start:dev

    # production mode
    $ yarn run start:prod
    ```

5. Run tests

    ```bash
    # unit tests
    $ yarn run test

    # e2e tests
    $ yarn run test:e2e

    # test coverage
    $ yarn run test:cov
    ```
### Swagger documentation

You can see the API Documentacion here: 
http://localhost:3000/api#/

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
