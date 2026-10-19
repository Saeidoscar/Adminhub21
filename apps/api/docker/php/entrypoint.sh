#!/bin/sh
# Container entrypoint for the Laravel API.
#
# `docker compose up` should be the whole setup story: the container waits for
# PostgreSQL, applies the schema, and (for local stacks) seeds the demo dataset
# before php-fpm starts accepting requests.
set -e

cd /var/www/html

wait_for_database() {
    [ "${DB_CONNECTION:-pgsql}" = "pgsql" ] || return 0

    attempts=0
    until php -r '
        try {
            new PDO(
                sprintf("pgsql:host=%s;port=%s;dbname=%s", getenv("DB_HOST") ?: "postgres", getenv("DB_PORT") ?: "5432", getenv("DB_DATABASE") ?: "adminhub"),
                getenv("DB_USERNAME") ?: "postgres",
                getenv("DB_PASSWORD") ?: "postgres",
            );
            exit(0);
        } catch (Throwable $e) {
            exit(1);
        }
    ' 2>/dev/null; do
        attempts=$((attempts + 1))
        if [ "$attempts" -ge 30 ]; then
            echo "database did not become reachable in 60s" >&2
            exit 1
        fi
        sleep 2
    done
}

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    wait_for_database

    if [ -z "${APP_KEY:-}" ]; then
        echo "APP_KEY is empty; the API cannot boot without it." >&2
        exit 1
    fi

    php artisan migrate --force

    # Local stacks only: DemoSeeder creates accounts with a known password.
    if [ "${SEED_DEMO:-false}" = "true" ]; then
        php artisan db:seed --force
    fi

    # Public disk for uploaded media; harmless when it already exists.
    php artisan storage:link >/dev/null 2>&1 || true
fi

exec "$@"
