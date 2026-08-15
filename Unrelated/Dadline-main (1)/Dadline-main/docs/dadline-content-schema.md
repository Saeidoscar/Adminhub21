# Dadline content schema

This document is the corrected implementation contract for stories, blogs, tags, and comments in `apps/api`.

## Corrections applied

- Both stories and blogs reference `legal_categories` through `category_id`.
- Both content types may reference a featured image from the shared `attachments` table.
- `published_at` exists on both content tables and controls scheduled public visibility.
- Public content must have `status = published`, `published_at IS NOT NULL`, and `published_at <= now()`.
- Tag counts are derived from pivot tables. Cached counter columns are intentionally omitted to prevent drift.
- Stories, blogs, tags, and comments use soft deletes.
- Comments have a non-enumerable `public_id` for external routes.
- A reply must target the same story or blog as its parent.
- Content and comment statuses are represented by PHP backed enums and PostgreSQL check constraints.

## Tables

- `stories`
- `blogs`
- `tags`
- `story_tag`
- `blog_tag`
- `comments`

Stories and blogs use unique public slugs. Comments use a unique UUID `public_id`. Internal foreign keys remain BIGINT to match the existing Laravel schema.

## Content workflow

```text
draft -> pending -> published -> archived
                 -> rejected -> draft
```

Publishing can be immediate or scheduled. A future `published_at` keeps the record out of public queries until that timestamp.

## Comment workflow

```text
pending -> approved
        -> rejected
        -> hidden
        -> spam
```

Only approved comments are exposed publicly.

## API routes

Public reads live directly below `/v1`. Authenticated author operations live below `/v1/me` or use authenticated write methods on the content resource. Editorial operations live below `/v1/admin/content` and require one of the `admin`, `manager`, or `editor` roles.

## Legacy content migration

After the Laravel schema migrations have run, migrate legacy content in dependency order:

```bash
php artisan dadline:migrate --only=blogs --dry-run
php artisan dadline:migrate --only=stories --dry-run
php artisan dadline:migrate --only=story-comments --dry-run

php artisan dadline:migrate --only=blogs
php artisan dadline:migrate --only=stories
php artisan dadline:migrate --only=story-comments
```

The migration maps only `ad_posts.post_type = post` to blogs. Story fields come from `ad_dad_story`, while its linked `ad_posts` row supplies the public slug and publication date. The comma-separated legacy story category is normalized into tags because its stored values are topic labels rather than one legal category. `ad_dad_story_comments` is migrated after stories so target and parent relationships can be validated.

Legacy IDs are retained for idempotency. Missing users become nullable authors, unsupported WordPress post types are ignored, and rerunning a migration skips records already present in the target table.
