# 🛠️ دستورات کاربردی کانتینر `dadline-api-1`

> مجموعه دستورات پرکاربرد برای مدیریت کانتینر API پروژه دادلاین

---

## 📦 Composer (مدیریت پکیج‌ها)

| توضیح | دستور |
|-------|-------|
| نصب پکیج جدید | `docker exec dadline-api-1 composer require vendor/package` |
| نصب پکیج dev | `docker exec dadline-api-1 composer require --dev vendor/package` |
| حذف پکیج | `docker exec dadline-api-1 composer remove vendor/package` |
| آپدیت همه پکیج‌ها | `docker exec dadline-api-1 composer update` |
| بازسازی Autoload | `docker exec dadline-api-1 composer dump-autoload` |
| بهینه‌سازی Autoload | `docker exec dadline-api-1 composer dump-autoload --optimize` |
| لیست پکیج‌های نصب‌شده | `docker exec dadline-api-1 composer show` |
| بررسی نسخه پکیج خاص | `docker exec dadline-api-1 composer show vendor/package` |

---

## 🎨 Artisan Make (ساخت فایل‌ها)

| توضیح | دستور |
|-------|-------|
| ساخت Controller | `docker exec dadline-api-1 php artisan make:controller UserController` |
| ساخت Resource Controller | `docker exec dadline-api-1 php artisan make:controller UserController --resource` |
| ساخت Model | `docker exec dadline-api-1 php artisan make:model User` |
| ساخت Model + Migration + Controller | `docker exec dadline-api-1 php artisan make:model User -mcr` |
| ساخت Migration | `docker exec dadline-api-1 php artisan make:migration create_users_table` |
| ساخت Seeder | `docker exec dadline-api-1 php artisan make:seeder UserSeeder` |
| ساخت Factory | `docker exec dadline-api-1 php artisan make:factory UserFactory` |
| ساخت Request | `docker exec dadline-api-1 php artisan make:request StoreUserRequest` |
| ساخت Middleware | `docker exec dadline-api-1 php artisan make:middleware CheckRole` |
| ساخت Job | `docker exec dadline-api-1 php artisan make:job ProcessPayment` |
| ساخت Event | `docker exec dadline-api-1 php artisan make:event UserRegistered` |
| ساخت Listener | `docker exec dadline-api-1 php artisan make:listener SendWelcomeEmail` |
| ساخت Policy | `docker exec dadline-api-1 php artisan make:policy UserPolicy` |
| ساخت Rule | `docker exec dadline-api-1 php artisan make:rule Uppercase` |
| ساخت Command | `docker exec dadline-api-1 php artisan make:command SendEmails` |

---

## 🗄️ Migration (مدیریت دیتابیس)

| توضیح | دستور |
|-------|-------|
| اجرای Migration ها | `docker exec dadline-api-1 php artisan migrate` |
| اجرای با force (Production) | `docker exec dadline-api-1 php artisan migrate --force` |
| Rollback آخرین Migration | `docker exec dadline-api-1 php artisan migrate:rollback` |
| Rollback چند مرحله | `docker exec dadline-api-1 php artisan migrate:rollback --step=3` |
| Reset همه Migration ها | `docker exec dadline-api-1 php artisan migrate:reset` |
| Refresh (Reset + Migrate) | `docker exec dadline-api-1 php artisan migrate:refresh` |
| Fresh (Drop + Migrate) | `docker exec dadline-api-1 php artisan migrate:fresh` |
| وضعیت Migration ها | `docker exec dadline-api-1 php artisan migrate:status` |
| اجرای Seeder ها | `docker exec dadline-api-1 php artisan db:seed` |
| اجرای Seeder خاص | `docker exec dadline-api-1 php artisan db:seed --class=UserSeeder` |
| Fresh + Seed | `docker exec dadline-api-1 php artisan migrate:fresh --seed` |

---

## 🗃️ Cache (مدیریت کش)

| توضیح | دستور |
|-------|-------|
| پاک کردن Config Cache | `docker exec dadline-api-1 php artisan config:clear` |
| ساخت Config Cache | `docker exec dadline-api-1 php artisan config:cache` |
| پاک کردن Route Cache | `docker exec dadline-api-1 php artisan route:clear` |
| ساخت Route Cache | `docker exec dadline-api-1 php artisan route:cache` |
| پاک کردن View Cache | `docker exec dadline-api-1 php artisan view:clear` |
| پاک کردن App Cache | `docker exec dadline-api-1 php artisan cache:clear` |
| پاک کردن همه Cache ها | `docker exec dadline-api-1 php artisan optimize:clear` |
| بهینه‌سازی Production | `docker exec dadline-api-1 php artisan optimize` |

---

## 🛣️ Route (مدیریت مسیرها)

| توضیح | دستور |
|-------|-------|
| لیست همه Route ها | `docker exec dadline-api-1 php artisan route:list` |
| لیست با جزئیات | `docker exec dadline-api-1 php artisan route:list -v` |
| فیلتر بر اساس URI | `docker exec dadline-api-1 php artisan route:list --path=api` |
| فیلتر بر اساس Method | `docker exec dadline-api-1 php artisan route:list --method=GET` |
| فیلتر بر اساس Name | `docker exec dadline-api-1 php artisan route:list --name=user` |

---

## 🐛 Debug (عیب‌یابی)

| توضیح | دستور |
|-------|-------|
| مشاهده 50 خط آخر Log | `docker exec dadline-api-1 tail -n 50 storage/logs/laravel.log` |
| مشاهده زنده Log | `docker exec dadline-api-1 tail -f storage/logs/laravel.log` |
| پاک کردن Log | `docker exec dadline-api-1 php artisan log:clear` |
| بررسی Environment | `docker exec dadline-api-1 php artisan env` |
| نسخه لاراول | `docker exec dadline-api-1 php artisan --version` |
| ورود به Tinker | `docker exec -it dadline-api-1 php artisan tinker` |
| اجرای کد در Tinker | `docker exec dadline-api-1 php artisan tinker --execute="dump(User::count());"` |

---

## 📝 Swagger (مستندات API)

| توضیح | دستور |
|-------|-------|
| تولید مستندات | `docker exec dadline-api-1 php artisan l5-swagger:generate` |
| کپی JSON به Postman | `docker cp dadline-api-1:/var/www/html/storage/api-docs/api-docs.json ./apps/api/public/postman-collection.json` |

### 🔗 دسترسی به مستندات

| مورد | آدرس |
|------|-------|
| Swagger UI | `http://localhost:8000/api/documentation` |
| فایل JSON | `http://localhost:8000/docs/api-docs.json` |

---

## 🐳 Docker (مدیریت کانتینر)

| توضیح | دستور |
|-------|-------|
| ورود به Shell | `docker exec -it dadline-api-1 sh` |
| مشاهده Logs | `docker logs dadline-api-1` |
| مشاهده زنده Logs | `docker logs -f dadline-api-1` |
| Restart | `docker restart dadline-api-1` |
| Stop | `docker stop dadline-api-1` |
| Start | `docker start dadline-api-1` |
| وضعیت کانتینر | `docker ps` |
| Resource Usage | `docker stats dadline-api-1` |
| کپی فایل از کانتینر | `docker cp dadline-api-1:/path/file ./local/path` |
| کپی فایل به کانتینر | `docker cp ./local/path dadline-api-1:/path/file` |

---

## 🔧 متفرقه

| توضیح | دستور |
|-------|-------|
| ساخت Storage Link | `docker exec dadline-api-1 php artisan storage:link` |
| تغییر Permission | `docker exec dadline-api-1 chmod -R 775 storage bootstrap/cache` |
| بررسی Disk Usage | `docker exec dadline-api-1 du -sh storage/*` |
| لیست همه دستورات | `docker exec dadline-api-1 php artisan list` |
| راهنمای دستور | `docker exec dadline-api-1 php artisan help migrate` |

---

## 🎯 دستورات ترکیبی

### Reset کامل پروژه (Development)

```bash
docker exec dadline-api-1 php artisan migrate:fresh --seed
docker exec dadline-api-1 php artisan optimize:clear
docker exec dadline-api-1 php artisan l5-swagger:generate