## Description
Application in NestJS that caches DB records with multiple fields in Redis for fast searching. The search feature enables fuzzy searches across fields, using restaurant data as an example. A search query may contain the restaurant name or its partial location. The cache is invalidated when any record is updated or a new restaurant is added to the database. The search results are always consistent with the actual database query.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# using docker compose
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
