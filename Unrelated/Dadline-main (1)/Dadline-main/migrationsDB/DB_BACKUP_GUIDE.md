# 🗄️ راهنمای جامع بکاپ و مدیریت دیتابیس PostgreSQL در Docker
این سند شامل دستورات ضروری برای تهیه بکاپ، بازگردانی (Restore) و انتقال دیتابیس `new_dadline_db` از کانتینر `dadline_postgres` است.

```powershell
# 1. ایجاد بکاپ در داخل کانتینر
docker exec -t dadline_postgres pg_dump -U dadline_user -d new_dadline_db -Fc -f /tmp/new_postgre_backup.dump

# 2. کپی فایل بکاپ از کانتینر به سیستم میزبان
docker cp dadline_postgres:/tmp/new_postgre_backup.dump ./new_postgre_backup.dump


# کپی فایل به داخل کانتینر مقصد
## اجرا در مسیر داکر اصلی پروژه D:\docker\dadlinenet
docker cp ./migrationsDB/new_postgre_backup.dump dadline-postgres-1:/tmp/

# اجرای دستور ریستور
## اجرا در مسیر داکر اصلی پروژه D:\docker\dadlinenet
docker exec -t dadline-postgres-1 pg_restore -U dadline -d dadline_legacy -v --clean --if-exists /tmp/new_postgre_backup.dump