<?php

namespace App\Actions\Options;

use App\Models\Option;
use Illuminate\Support\Collection;

class GetPublicPricingAction
{
    private const GROUPS = [
        [
            'key' => 'consultation',
            'title' => 'مشاوره حقوقی تلفنی',
            'description' => 'گفت‌وگوی مستقیم با وکیل یا کارشناس حقوقی در بازه زمانی انتخابی شما.',
            'items' => [
                ['key' => 'phone_counseling_10', 'title' => 'مشاوره ۱۰ دقیقه‌ای', 'description' => 'برای پرسش‌های کوتاه و دریافت راهنمایی اولیه.', 'unit' => 'هر جلسه', 'href' => '/calls'],
                ['key' => 'phone_counseling_20', 'title' => 'مشاوره ۲۰ دقیقه‌ای', 'description' => 'برای بررسی دقیق‌تر موضوع و پاسخ به چند پرسش مرتبط.', 'unit' => 'هر جلسه', 'href' => '/calls', 'featured' => true],
                ['key' => 'phone_counseling_30', 'title' => 'مشاوره ۳۰ دقیقه‌ای', 'description' => 'برای شرح کامل‌تر پرونده و بررسی راهکارهای پیش رو.', 'unit' => 'هر جلسه', 'href' => '/calls'],
                ['key' => 'phone_counseling_40', 'title' => 'مشاوره ۴۰ دقیقه‌ای', 'description' => 'برای موضوعات پیچیده و گفت‌وگوی جامع با متخصص.', 'unit' => 'هر جلسه', 'href' => '/calls'],
            ],
        ],
        [
            'key' => 'documents',
            'title' => 'تنظیم مستندات حقوقی',
            'description' => 'تنظیم تخصصی مستندات پرکاربرد حقوقی متناسب با اطلاعات و نیاز شما.',
            'items' => [
                ['key' => 'doc_bill', 'title' => 'تنظیم لایحه', 'description' => 'تنظیم لایحه حقوقی یا کیفری متناسب با مرحله رسیدگی.', 'unit' => 'هر مستند', 'href' => '/legal-documents'],
                ['key' => 'doc_petition', 'title' => 'تنظیم دادخواست', 'description' => 'تهیه دادخواست با ساختار و خواسته حقوقی صحیح.', 'unit' => 'هر مستند', 'href' => '/legal-documents', 'featured' => true],
                ['key' => 'doc_statement', 'title' => 'تنظیم اظهارنامه', 'description' => 'تنظیم اظهارنامه رسمی برای اعلام یا مطالبه حقوق قانونی.', 'unit' => 'هر مستند', 'href' => '/legal-documents'],
                ['key' => 'doc_complaint', 'title' => 'تنظیم شکواییه', 'description' => 'تنظیم شکواییه کیفری بر اساس موضوع و مستندات شما.', 'unit' => 'هر مستند', 'href' => '/legal-documents'],
                ['key' => 'doc_contract', 'title' => 'تنظیم قرارداد', 'description' => 'تنظیم قرارداد اختصاصی با بندهای حقوقی موردنیاز طرفین.', 'unit' => 'هر قرارداد', 'href' => '/contracts'],
            ],
        ],
        [
            'key' => 'platform',
            'title' => 'خدمات حقوقی آنلاین',
            'description' => 'ثبت درخواست و استفاده از خدمات عمومی سامانه دادلاین.',
            'items' => [
                ['key' => 'submit_question', 'title' => 'ثبت پرسش حقوقی', 'description' => 'ثبت پرسش و دریافت پاسخ از متخصصان حقوقی.', 'unit' => 'هر پرسش', 'href' => '/questions'],
                ['key' => 'submit_case', 'title' => 'ثبت درخواست پرونده', 'description' => 'ایجاد درخواست برای بررسی و پیگیری پرونده حقوقی.', 'unit' => 'هر درخواست', 'href' => '/my-lawyer'],
                ['key' => 'case_price', 'title' => 'بررسی تخصصی پرونده', 'description' => 'بررسی اطلاعات پرونده و ارائه مسیر پیشنهادی توسط متخصص.', 'unit' => 'هر پرونده', 'href' => '/my-lawyer', 'featured' => true],
                ['key' => 'submit_contract', 'title' => 'ثبت قرارداد آنلاین', 'description' => 'ایجاد و ثبت قرارداد در سامانه قراردادهای الکترونیکی.', 'unit' => 'هر قرارداد', 'href' => '/contracts'],
                ['key' => 'submit_legal_doc', 'title' => 'ثبت مستند حقوقی', 'description' => 'ثبت درخواست تهیه یا بررسی یک مستند حقوقی.', 'unit' => 'هر درخواست', 'href' => '/legal-documents'],
            ],
        ],
        [
            'key' => 'membership',
            'title' => 'اشتراک و عضویت حرفه‌ای',
            'description' => 'امکانات تکمیلی سامانه برای استفاده مستمر یا فعالیت حرفه‌ای.',
            'items' => [
                ['key' => 'monthly_subscription_price', 'title' => 'اشتراک ماهانه دادلاین', 'description' => 'دسترسی یک‌ماهه به امکانات اشتراکی سامانه.', 'unit' => 'ماهانه', 'href' => '/start', 'featured' => true],
                ['key' => 'become_vendor_price', 'title' => 'عضویت متخصص حقوقی', 'description' => 'ثبت درخواست فعالیت به‌عنوان وکیل یا کارشناس در دادلاین.', 'unit' => 'یک‌بار', 'href' => '/start'],
            ],
        ],
        [
            'key' => 'ai',
            'title' => 'خدمات هوش مصنوعی حقوقی',
            'description' => 'ابزارهای هوشمند برای تحلیل و بازنویسی محتوای حقوقی.',
            'items' => [
                ['key' => 'ai_analysis_price', 'title' => 'تحلیل هوشمند حقوقی', 'description' => 'تحلیل متن یا مستند حقوقی با ابزارهای هوش مصنوعی دادلاین.', 'unit' => 'هر تحلیل', 'href' => '/ai', 'featured' => true],
                ['key' => 'ai_rewrite_price', 'title' => 'بازنویسی تخصصی حقوقی', 'description' => 'بازنویسی متن با ادبیات رسمی و ساختار حقوقی مناسب.', 'unit' => 'هر بازنویسی', 'href' => '/ai'],
            ],
        ],
    ];

    public function execute(): array
    {
        $keys = collect(self::GROUPS)
            ->flatMap(fn (array $group): array => array_column($group['items'], 'key'));

        $options = Option::query()
            ->whereIn('key', $keys)
            ->get(['key', 'value', 'updated_at'])
            ->keyBy('key');

        $groups = collect(self::GROUPS)
            ->map(fn (array $group): array => $this->mapGroup($group, $options))
            ->filter(fn (array $group): bool => $group['items'] !== [])
            ->values()
            ->all();

        return [
            'currency' => 'IRT',
            'currency_label' => 'تومان',
            'updated_at' => $options->max('updated_at')?->toIso8601String(),
            'groups' => $groups,
        ];
    }

    private function mapGroup(array $group, Collection $options): array
    {
        $items = collect($group['items'])
            ->map(function (array $item) use ($options): ?array {
                $option = $options->get($item['key']);
                $price = $this->normalizePrice($option?->value);

                if ($price === null) {
                    return null;
                }

                return [
                    ...$item,
                    'price' => $price,
                    'featured' => $item['featured'] ?? false,
                ];
            })
            ->filter()
            ->values()
            ->all();

        return [
            'key' => $group['key'],
            'title' => $group['title'],
            'description' => $group['description'],
            'items' => $items,
        ];
    }

    private function normalizePrice(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }

        $price = (int) $value;

        return $price >= 0 ? $price : null;
    }
}
