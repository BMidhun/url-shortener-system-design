# DOCKER COMPOSE Commands to run

`docker compose --env-file .env.development up --build`

Scale express app dynamically with

`docker compose --env-file .env.development up --build --scale express-app=5`
