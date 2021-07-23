# Rentx
![CircleCI](https://img.shields.io/circleci/build/github/DiegoVictor/rentx?style=flat-square&logo=circleci)
[![typescript](https://img.shields.io/badge/typescript-4.3.5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![postgres](https://img.shields.io/badge/postgres-8.6.0-326690?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![redis](https://img.shields.io/badge/redis-3.1.2-d92b21?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![eslint](https://img.shields.io/badge/eslint-7.31.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-27.0.6-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/rentx?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/rentx)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/rentx/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Rentx&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Frentx%2Fmaster%2FInsomnia_2021-07-22.json)


Allows users to register yourself, manage his token, reset passwords, see his own profile, update his avatar, create cars and set specification and categories to it, import a bulk of categories at once, see available cars for rent, attach cars'images, rent a car, see previous rents and make a car devolution. The app has rate limit, friendly errors, use JWT to logins, validation, also a simple versioning was made.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [Redis](#redis)
    * [Postgres](#postgres)
      * [Migrations](#migrations)
    * [.env](#env)
    * [Rate Limit (Optional)](#rate-limit-optional)
* [Usage](#usage)
  * [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [Bearer Token](#bearer-token)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application uses two databases: [Postgres](https://www.postgresql.org/) and [Redis](https://redis.io/). For the fastest setup is recommended to use [docker-compose](https://docs.docker.com/compose/), you just need to up all services:
```
$ docker-compose up -d
```
### Redis
Responsible to store data utilized by the rate limit middleware. If for any reason you would like to create a Redis container instead of use `docker-compose`, you can do it by running the following command:
```
$ docker run --name rentx-redis -d -p 6379:6379 redis:alpine
```

### Postgres
Responsible to store all application data. If for any reason you would like to create a MongoDB container instead of use `docker-compose`, you can do it by running the following command:
```
$ docker run --name rentx-postgres -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```
> Then create two databases: `rentx` and `test` (in case you would like to run the tests).

#### Migrations
Remember to run the database migrations:
```
$ yarn ts-node-dev ./node_modules/typeorm/cli.js migration:run
```
Or:
```
$ yarn typeorm migration:run
```
> See more information on [TypeORM Migrations](https://typeorm.io/#/migrations).

### .env
In this file you may configure your Redis and Postgres database connection, JWT settings, the environment, app's port, mail and storage driver, aws settings (case be necessary) and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|API_URL|Used to mount avatars' urls.|`http://localhost:3333`
|PORT|Port number where the app will run.|`3333`
|RESET_PASSWORD_URL|Url where the user will be able to change the password|`http://localhost:3333/v1/password/reset?token=`
|JWT_SECRET|A alphanumeric random string. Used to create signed tokens.| -
|JWT_EXPIRATION_TIME|How long time will be the token valid. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) repo for more information.|`15m`
|REFRESH_TOKEN_SECRET|A alphanumeric random string. Used to create signed refresh tokens.| -
|REFRESH_TOKEN_EXPIRATION_DAYS|How many days long will be the refresh token valid. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) repo for more information.|30
|DB_HOST|Postgres host.|`pg`
|DB_PORT|Postgres port.|`5432`
|DB_USER|Postgres user.| -
|DB_PASSWORD|Postgres password.| -
|DB_NAME|Application's database name.| -
|REDIS_HOST|Redis host.| `redis`
|REDIS_PORT|Redis port.| `6379`
|REDIS_PASSWORD|Redis password.| -
|STORAGE_DRIVER|Set where the files will be stored, the available values are: `local` and `s3`.|`local`
|MAIL_DRIVER|Set what service to use to send mails, the available values are: `ethereal` and `ses`.|`ses`
|MAIL_SENDER|The `from` sent in the email.| -
|AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY| These keys are necessary to AWS allow the application to use the S3 and SES services throught API. See how to get yours keys here: [Set up AWS Credentials](https://docs.aws.amazon.com/toolkit-for-eclipse/v1/user-guide/setup-credentials.html).| -
|AWS_BUCKET|Amazon S3 stores data as objects within buckets. To create a bucket see [Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html).| -
|AWS_BUCKET_URL|Utilized to mount avatars' urls when using `s3` as `STORAGE_DRIVER`. Can also be found while creating the bucket.| -
|AWS_REGION|You can see your default region in the navigation bar at the top right after login in the [AWS Management Console](https://sa-east-1.console.aws.amazon.com/console/home). Read [AWS service endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html) to know more about regions.| -
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/rentx#errors-reference`

### Rate Limit (Optional)
The project comes pre-configured, but you can adjust it as your needs.

* `src/config/rateLimit.ts`

|key|description|default
|---|---|---
|duration|Number of seconds before consumed points are reset.|`300`
|points|Maximum number of points can be consumed over duration.|`10`

> The lib [`rate-limiter-flexible`](https://github.com/animir/node-rate-limiter-flexible) was used to rate the api's limits, for more configuration information go to [Options](https://github.com/animir/node-rate-limiter-flexible/wiki/Options#options) page.

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Too Many Requests",
  "code": 749,
  "docs": "https://github.com/DiegoVictor/rentx#errors-reference"
}
```
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|140|Email or password incorrect.|Password did not match.
|141|Invalid token.|The reset password refresh token not references an existing one in the database.
|142|Token expired.|The provided reset password refresh token has already expired.
|144|Refresh Token does not exists.|The provided authentication refresh token was not found in the database.
|240|User already exists.|Already exists an user with the same `email`.
|244|User does not exists.|Was not found the user by the provided `email` to reset the password.
|245|User does not exists.|The provided `id` does not reference an user in the database.
|340|Car already exists.|You are trying to create a car with a `license_plate` already in use.
|341|Car is unavailable.|Is not possible rent a car that is already rent.
|344|Car does not exists.|The provided `id` does not reference a car in the database.
|440|Category already exists.|You are trying to create a category with a `name` already in use.
|540|Specification already exists.|You are trying to create a specification with a `name` already in use.
|640|There's a rental in progress for this user.|Is not possible to make more than one rent at time.
|641|A rental must have at least 24 hours of duration.|Is not allowed to rent a car by less than 24 hours.
|644|Rental does not exists.|The provided `id` does not references a previous rental.
|741|User is not authorized.|You don't have enough permission to do this action.
|742|Missing authorization token.|The Bearer Token was not sent.
|743|Invalid token.|The Bearer Token provided is invalid or expired.
|749|Too many requests.|You reached at the requests limit.

## Bearer Token
A few routes expect a Bearer Token in an `Authorization` header.
> You can see these routes in the [routes](#routes) section.
```
GET http://localhost:3333/v1/rentals Authorization: Bearer <token>
```
> To achieve this token you just need authenticate through the `/sessions` route and it will return the `token` key with a valid Bearer Token.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/rentals
```

## Routes
|route|HTTP Method|params|description|auth method
|:---|:---:|:---:|:---:|:---:
|`/sessions`|POST|Body with user's `email` and `password`.|Authenticates user, return a Bearer Token and user's name, email, token and refresh token.|:x:
|`/refresh_token`|POST|Body with `refresh_token`.|Exchange an new token and refresh token|:x:
|`/cars`|POST|Body with cars' `name`, `description`, `daily_rate`, `license_plate`, `fine_amount`, `brand`, `category_id`.|Create a new car.|Bearer
|`/cars/:id/specifications`|POST|`:id` of the car and body with an array of specifications `ids`.|Add specification to a car.|Bearer
|`/cars/:id/images`|POST|`:id` of the car and multipart body with `car_images` fields with a image (See insomnia file for good example).|Add images to a car.|Bearer
|`/cars/availables`|GET|`brand`, `name` or `category_id` query parameters.|Retrieve cars available for rent.|:x:
|`/categories`|GET| - |Retrieve a list of categories.|:x:
|`/categories`|POST|Body with user's `name` and `description`.|Create a new category.|Bearer
|`/categories/import`|POST|Multipart payload with a `file` field with a image (See insomnia file for good example).|Import a bulk of categories.|Bearer
|`/password/forgot`|POST|Body with user's `email`.|Send reset password email.|:x:
|`/password/reset`|POST|`token` query parameter and body with user's new `password`.|Update user's password.|:x:
|`/rentals/user`|GET| - |Retrieve user's rentals.|Bearer
|`/rentals`|POST|Body with rental's `expected_return_date` and `car_id`.|Create a car rent.|Bearer
|`/rentals/:id/devolution`|POST|`id` query parameter.|Close rental.|Bearer
|`/specifications`|POST|Body with user's `name` and `description`.|Create a new specification.|Bearer
|`/users`|GET| - |Return user's profile.|Bearer
|`/users`|POST|Body with user's.|Return user's `name`, `email`, `password` and `driver_license`.|:x:
|`/users/avatar`|PATCH|Multipart payload with a atavar field with a image (See insomnia file for good example).|Update user avatar.|Bearer

> Routes with `Bearer` as auth method expect an `Authorization` header. See [Bearer Token](#bearer-token) section for more information.

### Requests
* `POST /session`

Request body:
```json
{
  "email": "johndoe@example.com",
  "password": "123456"
}
```

* `POST /refresh_token`

Request body:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
}
```

* `POST /cars`

Request body:
```json
{
  "name": "Car name",
  "description": "Car description",
  "daily_rate": 140.0,
  "license_plate": "XYZ1234",
  "fine_amount": 100,
  "brand": "Car brand",
  "category_id": "6878f9b2-eb7c-4ad6-ac72-66d958f117c2"
}
```

* `POST /cars/:id/specifications`

Request body:
```json
{
  "specifications_id": ["b3267e11-eec4-46a4-accc-9e8b4fad0af7"]
}
```

* `POST /cars/:id/images`<br>
Image file(s)

* `POST /categories`

Request body:
```json
{
  "name": "Category name",
  "description": "Category description"
}
```

* `POST /categories/import`<br>
CSV file

* `POST /password/forgot`

Request body:
```json
{
  "email": "johndoe@example.com"
}
```

* `POST /password/reset`

Request body:
```json
{
  "password": "123456"
}
```

* `POST /rentals`

Request body:
```json
{
  "expected_return_date": "2021-04-08T01:31:15.328Z",
  "car_id": "01931fee-32d4-4af7-b4e9-12159c5d703e"
}
```

* `POST /specifications`

Request body:
```json
{
  "name": "Specification name",
  "description": "Specification description"
}
```

* `POST /users`

Request body:
```json
{
  "name": "John",
  "email": "johndoe@example.com",
  "password": "123456",
  "driver_license": "782378234923"
}
```

* `PATCH /users/avatar`<br>
Image file

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
