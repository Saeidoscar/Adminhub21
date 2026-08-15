-- infrastructure/postgres/init/01-init.sql
-- اجرا فقط در اولین بالا آمدن کانتینر (دایرکتوری خالی داده)

-- افزونه‌ی pg_trgm برای جستجوی فارسی پایه (سند تصمیمات قبلی: pg_trgm baseline search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- افزونه‌ی pgvector برای embedding های BGE-m3 و جستجوی معنایی
CREATE EXTENSION IF NOT EXISTS vector;
