## Description
Application in NestJS that caches DB records with multiple fields in Redis for fast searching. The search feature enables fuzzy searches across fields, using restaurant data as an example. A search query may contain the restaurant name or its partial location. The cache is invalidated when any record is updated or a new restaurant is added to the database. The search results are always consistent with the actual database query.

## Installation

```bash
$ yarn install
```

## Api documentation

https://documenter.getpostman.com/view/23141290/2s9YsNeAXE#d7282833-4769-4b76-acde-c3306bc8f3bf

## env variables

```bash
DATABASE_URL=
JWT_SECRET=
```

## Running the app locally

```bash

# 1. install dependencies 
$ yarn

# 2. start redis and postgres on docker
$ yarn db:dev:up

# 3. generate prisma client
$ yarn prisma:generate

# 4. run migrations
$ yarn prisma:dev:deploy

# 5. start the app
$ yarn start:dev

```

## Running the app using docker-compose

```bash
$ docker-compose up
```