# Honey Moa Server

## DB setup

1. Run `docker-compose up`

## Getting Started

1. Define the required env
2. [set DB](#-db-setup)
3. Run `npm run build` and `npm run start` or `npm run start:dev`

## Create migration

1. Modify schema.prisma
2. Run `npm run prisma:migrate:preview` and check changes
3. Run `npm run prisma:migrate:deploy` for deploy
4. Apply changes by `npm run prisma:generate`
