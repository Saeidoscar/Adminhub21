<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function tools(): JsonResponse
    {
        $tools = [
            [
                'id' => 'tool-1',
                'name' => 'Laravel Forge',
                'descEn' => 'Server management and deployment platform for Laravel applications.',
                'descFa' => 'پلتفرم مدیریت سرور و استقرار برای اپلیکیشن‌های لاراول.',
                'category' => 'DevOps',
                'icon' => 'https://example.com/icons/laravel-forge.png',
                'rating' => 4.8,
                'reviews' => 1240,
                'popular' => true,
                'priceToman' => 0,
                'priceUSD' => 0,
                'createdAt' => '2024-01-15T00:00:00Z',
            ],
            [
                'id' => 'tool-2',
                'name' => 'Postman',
                'descEn' => 'API development and testing tool with collaboration features.',
                'descFa' => 'ابزار توسعه و تست API با ویژگی‌های همکاری.',
                'category' => 'API',
                'icon' => 'https://example.com/icons/postman.png',
                'rating' => 4.7,
                'reviews' => 980,
                'popular' => true,
                'priceToman' => 0,
                'priceUSD' => 0,
                'createdAt' => '2024-02-01T00:00:00Z',
            ],
            [
                'id' => 'tool-3',
                'name' => 'Redis Cloud',
                'descEn' => 'Managed Redis service for real-time caching and messaging.',
                'descFa' => 'سرویس مدیریت شده Redis برای کش و پیام‌رسانی لحظه‌ای.',
                'category' => 'Database',
                'icon' => 'https://example.com/icons/redis.png',
                'rating' => 4.6,
                'reviews' => 750,
                'popular' => false,
                'priceToman' => 320000,
                'priceUSD' => 8,
                'createdAt' => '2024-03-10T00:00:00Z',
            ],
            [
                'id' => 'tool-4',
                'name' => 'Sentry',
                'descEn' => 'Error tracking and performance monitoring for applications.',
                'descFa' => 'ردیابی خطا و مانیتورینگ عملکرد برای اپلیکیشن‌ها.',
                'category' => 'Monitoring',
                'icon' => 'https://example.com/icons/sentry.png',
                'rating' => 4.5,
                'reviews' => 620,
                'popular' => true,
                'priceToman' => 0,
                'priceUSD' => 0,
                'createdAt' => '2024-04-05T00:00:00Z',
            ],
        ];

        return response()->json(['tools' => $tools]);
    }

    public function editors(): JsonResponse
    {
        $editors = [
            [
                'id' => 'editor-1',
                'nameEn' => 'Sarah Chen',
                'nameFa' => 'سارا چن',
                'photo' => 'https://example.com/photos/sarah.jpg',
                'specialty' => 'Frontend Architecture',
                'rating' => 4.9,
                'reviews' => 85,
                'projects' => 142,
                'delivery' => '2 weeks',
                'rateToman' => 4500000,
                'rateUSD' => 110,
                'bioEn' => 'Senior frontend architect with 10+ years of React and Vue experience.',
                'bioFa' => 'معمار ارشد فرانت‌اند با بیش از 10 سال تجربه در React و Vue.',
                'createdAt' => '2024-01-10T00:00:00Z',
            ],
            [
                'id' => 'editor-2',
                'nameEn' => 'Mohammad Rezaei',
                'nameFa' => 'محمد رضایی',
                'photo' => 'https://example.com/photos/mohammad.jpg',
                'specialty' => 'Laravel Backend',
                'rating' => 4.8,
                'reviews' => 64,
                'projects' => 98,
                'delivery' => '1 week',
                'rateToman' => 3800000,
                'rateUSD' => 92,
                'bioEn' => 'Laravel specialist focused on scalable API design and database optimization.',
                'bioFa' => 'متخصص لاراول متمرکز بر طراحی API مقیاس‌پذیر و بهینه‌سازی پایگاه داده.',
                'createdAt' => '2024-02-15T00:00:00Z',
            ],
            [
                'id' => 'editor-3',
                'nameEn' => 'Aisha Patel',
                'nameFa' => 'عایشا پاتل',
                'photo' => 'https://example.com/photos/aisha.jpg',
                'specialty' => 'UI/UX Design',
                'rating' => 4.7,
                'reviews' => 112,
                'projects' => 210,
                'delivery' => '3 days',
                'rateToman' => 2800000,
                'rateUSD' => 68,
                'bioEn' => 'Award-winning designer crafting intuitive digital experiences.',
                'bioFa' => 'طراح برنده جوایز خالق تجربیات دیجیتال شهودی.',
                'createdAt' => '2024-03-01T00:00:00Z',
            ],
            [
                'id' => 'editor-4',
                'nameEn' => 'David Kim',
                'nameFa' => 'دیوید کیم',
                'photo' => 'https://example.com/photos/david.jpg',
                'specialty' => 'Mobile Development',
                'rating' => 4.6,
                'reviews' => 47,
                'projects' => 73,
                'delivery' => '2 weeks',
                'rateToman' => 5200000,
                'rateUSD' => 125,
                'bioEn' => 'Full-stack mobile developer specializing in React Native and Flutter.',
                'bioFa' => 'توسعه‌دهنده موبایل فول‌استک متخصص در React Native و Flutter.',
                'createdAt' => '2024-03-20T00:00:00Z',
            ],
        ];

        return response()->json(['editors' => $editors]);
    }

    public function vibeCoders(): JsonResponse
    {
        $vibeCoders = [
            [
                'id' => 'vibe-1',
                'nameEn' => 'Alex Rivera',
                'nameFa' => 'الکس ریورا',
                'photo' => 'https://example.com/photos/alex.jpg',
                'stack' => 'React, Node.js, PostgreSQL',
                'rating' => 4.8,
                'reviews' => 92,
                'projects' => 156,
                'rateToman' => 3500000,
                'rateUSD' => 85,
                'delivery' => '1 week',
                'bioEn' => 'Vibe coder focused on rapid prototyping and AI-assisted development.',
                'bioFa' => 'وایب کدر متمرکز بر نمونه‌سازی سریع و توسعه با کمک هوش مصنوعی.',
                'createdAt' => '2024-01-20T00:00:00Z',
            ],
            [
                'id' => 'vibe-2',
                'nameEn' => 'Fatima Noor',
                'nameFa' => 'فاطمه نور',
                'photo' => 'https://example.com/photos/fatima.jpg',
                'stack' => 'Next.js, Tailwind, Supabase',
                'rating' => 4.9,
                'reviews' => 78,
                'projects' => 134,
                'rateToman' => 3200000,
                'rateUSD' => 78,
                'delivery' => '3 days',
                'bioEn' => 'Full-stack vibe coder shipping production-ready apps in days.',
                'bioFa' => 'وایب کدر فول‌استک تحویل اپ‌های آماده تولید در عرض روزها.',
                'createdAt' => '2024-02-08T00:00:00Z',
            ],
            [
                'id' => 'vibe-3',
                'nameEn' => 'Omar Hassan',
                'nameFa' => 'عمر حسن',
                'photo' => 'https://example.com/photos/omar.jpg',
                'stack' => 'Vue 3, Pinia, Laravel API',
                'rating' => 4.7,
                'reviews' => 55,
                'projects' => 89,
                'rateToman' => 2900000,
                'rateUSD' => 70,
                'delivery' => '1 week',
                'bioEn' => 'Vue ecosystem expert building seamless full-stack experiences.',
                'bioFa' => 'متخصص اکوسیستم Vue خالق تجربیات فول‌استک یکپارچه.',
                'createdAt' => '2024-04-12T00:00:00Z',
            ],
            [
                'id' => 'vibe-4',
                'nameEn' => 'Lina Zayed',
                'nameFa' => 'لنا زاید',
                'photo' => 'https://example.com/photos/lina.jpg',
                'stack' => 'Python, FastAPI, React',
                'rating' => 4.6,
                'reviews' => 41,
                'projects' => 67,
                'rateToman' => 2700000,
                'rateUSD' => 65,
                'delivery' => '1 week',
                'bioEn' => 'AI-powered vibe coder specializing in data-driven web apps.',
                'bioFa' => 'وایب کدر با هوش مصنوعی متخصص در اپ‌های وب مبتنی بر داده.',
                'createdAt' => '2024-05-01T00:00:00Z',
            ],
        ];

        return response()->json(['vibeCoders' => $vibeCoders]);
    }
}
