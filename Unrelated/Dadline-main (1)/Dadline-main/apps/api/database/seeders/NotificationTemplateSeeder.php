<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $this->seedSmsTemplatesFromLegacyTable($now);

        foreach ($this->templates() as $template) {
            DB::table('notification_templates')->updateOrInsert(
                [
                    'key' => $template['key'],
                    'channel' => $template['channel'],
                ],
                [
                    'title' => $template['title'] ?? null,
                    'body' => $template['body'],
                    'variables' => json_encode($template['variables'] ?? [], JSON_UNESCAPED_UNICODE),
                    'provider_patterns' => json_encode($template['provider_patterns'] ?? null, JSON_UNESCAPED_UNICODE),
                    'category' => $template['category'] ?? 'system',
                    'priority' => $template['priority'] ?? 'normal',
                    'is_critical' => $template['is_critical'] ?? false,
                    'is_active' => $template['is_active'] ?? true,
                    'quiet_hours_enabled' => $template['quiet_hours_enabled'] ?? true,
                    'dedupe_window_minutes' => $template['dedupe_window_minutes'] ?? 0,
                    'retention_days' => $template['retention_days'] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    private function seedSmsTemplatesFromLegacyTable(mixed $now): void
    {
        DB::table('sms_templates')
            ->where('active', true)
            ->orderBy('key')
            ->get()
            ->each(function (object $template) use ($now): void {
                DB::table('notification_templates')->updateOrInsert(
                    [
                        'key' => $template->key,
                        'channel' => 'sms',
                    ],
                    [
                        'title' => $template->title,
                        'body' => $template->content,
                        'variables' => $template->variables,
                        'provider_patterns' => $template->patterns,
                        'category' => $this->categoryFor($template->key),
                        'priority' => $this->priorityFor($template->key),
                        'is_critical' => $this->isCritical($template->key),
                        'is_active' => true,
                        'quiet_hours_enabled' => ! $this->isCritical($template->key),
                        'dedupe_window_minutes' => $this->dedupeWindowFor($template->key),
                        'retention_days' => $this->retentionDaysFor($template->key),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            });
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function templates(): array
    {
        return [
            ...$this->otpTemplates(),
            ...$this->contractTemplates(),
            ...$this->serviceWorkflowTemplates(),
            ...$this->walletAndBillingTemplates(),
            ...$this->officeAndTicketTemplates(),
            ...$this->adminTemplates(),
            ...$this->systemTemplates(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function otpTemplates(): array
    {
        return [
            $this->template('auth.otp.sms', 'sms', 'کد تایید ورود', 'کد ورود دادلاین: {{ code }}', ['code'], 'auth', 'critical', true, false, 2, 7, $this->smsPattern('send_otp')),
            $this->template('auth.otp.sms', 'bale', 'کد تایید ورود', 'کد ورود دادلاین: {{ code }}', ['code'], 'auth', 'critical', true, false, 2),
            $this->template('auth.otp.call', 'call', 'تماس کد تایید ورود', 'کد ورود دادلاین: {{ code }}', ['code'], 'auth', 'critical', true, false, 2),
            $this->template('auth.otp.call', 'bale', 'کد تایید ورود', 'کد ورود دادلاین: {{ code }}', ['code'], 'auth', 'critical', true, false, 2),
            $this->template('contract.signature_otp.sms', 'sms', 'کد تایید امضای قرارداد', '{{ name }} گرامی، کد امضای قرارداد دادلاین: {{ code }}', ['name', 'code'], 'contract', 'critical', true, false, 2, 7, $this->smsPattern('contract_sign_code')),
            $this->template('contract.signature_otp.sms', 'bale', 'کد تایید امضای قرارداد', 'کد امضای قرارداد دادلاین: {{ code }}', ['code'], 'contract', 'critical', true, false, 2),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function contractTemplates(): array
    {
        return [
            $this->template('contract.invitation.sms', 'sms', 'دعوت به قرارداد', '{{ name }} گرامی، کد پذیرش قرارداد شما: {{ code }}. برای مشاهده قرارداد وارد دادلاین شوید.', ['name', 'code'], 'contract', 'high', true, false, 1440, null, $this->smsPattern('contract_invite_code')),
            $this->template('contract.invitation.sms', 'bale', 'دعوت به قرارداد', 'کد پذیرش قرارداد شما: {{ code }}', ['code'], 'contract', 'high', true, false, 1440),
            $this->template('contract.created', 'database', 'قرارداد جدید', 'قرارداد {{ contract_title }} برای شما ثبت شد.', ['contract_title'], 'contract', 'high', true, false, 1440),
            $this->template('contract.created', 'push', 'قرارداد جدید', 'قرارداد {{ contract_title }} ثبت شد.', ['contract_title'], 'contract', 'high', true, false, 1440),
            $this->template('contract.created', 'telegram', 'قرارداد جدید', "🔸️#قرارداد\n📄 قرارداد: {{ contract_title }}\n👥 طرفین قرارداد: {{ signers }}\nکد پذیرش قرارداد برای شما ارسال شد.\n💎 @dadlinenet", ['contract_title', 'signers'], 'contract', 'high', true, false, 1440),
            $this->template('contract.created', 'eitaa', 'قرارداد جدید', "🔸️#قرارداد\n📄 قرارداد: {{ contract_title }}\n👥 طرفین قرارداد: {{ signers }}\nکد پذیرش قرارداد برای شما ارسال شد.\n💎 @dadlinenet", ['contract_title', 'signers'], 'contract', 'high', true, false, 1440),
            $this->template('contract.completed.sms', 'sms', 'قرارداد منعقد شد', '{{ name }} گرامی، قرارداد شناسه {{ contract_id }} با موفقیت در دادلاین منعقد شد. کد پیگیری: {{ tracking_code }}', ['name', 'contract_id', 'tracking_code'], 'contract', 'high', true, false, 1440, null, $this->smsPattern('contract_final_view')),
            $this->template('contract.completed', 'database', 'قرارداد منعقد شد', 'قرارداد {{ contract_title }} با موفقیت منعقد شد.', ['contract_title'], 'contract', 'high', true, false, 1440),
            $this->template('contract.completed', 'push', 'قرارداد منعقد شد', 'قرارداد {{ contract_title }} منعقد شد.', ['contract_title'], 'contract', 'high', true, false, 1440),
            $this->template('contract.completed', 'telegram', 'قرارداد منعقد شد', "🔸️#قرارداد\n📄 قرارداد: {{ contract_title }}\n👥 طرفین قرارداد: {{ signers }}\nقرارداد با موفقیت منعقد شد.\n💎 @dadlinenet", ['contract_title', 'signers'], 'contract', 'high', true, false, 1440),
            $this->template('contract.completed', 'eitaa', 'قرارداد منعقد شد', "🔸️#قرارداد\n📄 قرارداد: {{ contract_title }}\n👥 طرفین قرارداد: {{ signers }}\nقرارداد با موفقیت منعقد شد.\n💎 @dadlinenet", ['contract_title', 'signers'], 'contract', 'high', true, false, 1440),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function serviceWorkflowTemplates(): array
    {
        return [
            ...$this->multiChannel('service.message.created', 'پیام جدید', 'پیام جدیدی در {{ context }} ثبت شد.', "🔸️#پیام_جدید\n⚖️ {{ context }}: {{ title }}\nشناسه: {{ id }}\nپیام جدیدی ثبت شد، در اسرع وقت بررسی کنید.\n💎 @dadlinenet", ['context', 'title', 'id'], 'system', 'normal', 60),
            ...$this->multiChannel('service.request.submitted', 'درخواست ثبت شد', 'درخواست {{ title }} با موفقیت ثبت شد.', "🔸️#درخواست_جدید\n⚖️ عنوان: {{ title }}\n🔰 حوزه: {{ category }}\nدرخواست شما با موفقیت ثبت شد و در صف بررسی قرار گرفت.\n💎 @dadlinenet", ['title', 'category'], 'system', 'normal', 60),
            ...$this->multiChannel('case.offer.accepted', 'پیشنهاد پذیرفته شد', 'پیشنهاد شما در پرونده {{ case_title }} پذیرفته شد.', "🔸️#پذیرش_پیشنهاد\n⚖️ پرونده: {{ case_title }}\nشناسه پرونده: {{ case_id }}\nپیشنهاد شما پذیرفته شد، در اسرع وقت پرونده را بررسی کنید.\n💎 @dadlinenet", ['case_title', 'case_id'], 'system', 'high', 1440),
            ...$this->multiChannel('document.offer.accepted', 'پیشنهاد پذیرفته شد', 'پیشنهاد شما در مستند {{ document_title }} پذیرفته شد.', "🔸️#پذیرش_پیشنهاد\n⚖️ مستند: {{ document_title }}\nشناسه مستند: {{ document_id }}\nپیشنهاد شما پذیرفته شد، در اسرع وقت اقدام کنید.\n💎 @dadlinenet", ['document_title', 'document_id'], 'system', 'high', 1440),
            ...$this->multiChannel('lawlink.offer.accepted', 'پیشنهاد همکاری پذیرفته شد', 'پیشنهاد شما در درخواست همکاری {{ request_title }} پذیرفته شد.', "🔸️#پذیرش_پیشنهاد_همکاری\n📄 درخواست: {{ request_title }}\n🔰 شناسه: {{ request_id }}\nپیشنهاد شما پذیرفته شد، در اسرع وقت اقدام کنید.\n💎 @dadlinenet", ['request_title', 'request_id'], 'system', 'high', 1440),
            ...$this->multiChannel('question.answer.created', 'پاسخ جدید', 'پاسخ جدیدی روی سوال شما ثبت شد.', "🔸️#پاسخ_جدید\n❓ سوال: {{ question_title }}\nپاسخ جدیدی توسط {{ vendor_name }} ثبت شد.\n💎 @dadlinenet", ['question_title', 'vendor_name'], 'system', 'normal', 60),
            ...$this->multiChannel('vendor.confirmed', 'پذیرش همکاری', 'درخواست همکاری شما به عنوان {{ role }} تایید شد.', "🔸️#همکاری\n{{ name }} گرامی، درخواست شما به عنوان {{ role }} تایید شد.\nبه خانواده دادلاین خوش آمدید.\n💎 @dadlinenet", ['name', 'role'], 'system', 'high', 1440),
            ...$this->multiChannel('case.result.submitted', 'گزارش نهایی پرونده', 'پرونده {{ case_title }} توسط {{ vendor_name }} بررسی و گزارش نهایی ثبت شد.', "🔸️#گزارش_نهایی_پرونده\n⚖️ پرونده: {{ case_title }}\n🖊 شناسه پرونده: {{ case_id }}\n✅ کارشناس: {{ vendor_name }}\nپرونده شما توسط کارشناس بررسی و گزارش نهایی ثبت شد.\n💎 @dadlinenet", ['case_title', 'case_id', 'vendor_name'], 'system', 'high', 1440),
            ...$this->multiChannel('document.result.submitted', 'تنظیم مستند حقوقی', 'مستند {{ document_title }} توسط {{ vendor_name }} بررسی و تنظیم شد.', "🔸️#تنظیم_مستند_حقوقی\n📄 عنوان مستند: {{ document_title }}\n🖊 شناسه مستند: {{ document_id }}\n✅ کارشناس: {{ vendor_name }}\nمستند شما توسط کارشناس بررسی و تنظیم شد.\n💎 @dadlinenet", ['document_title', 'document_id', 'vendor_name'], 'system', 'high', 1440),
            ...$this->multiChannel('subscription.user_message.created', 'پیام جدید موکل', 'پیام جدیدی توسط {{ client_name }} در وکیل مشاور ثبت شد.', "🔸️#پیام_جدید\n💳 کاربر: {{ client_name }}\n💰 اشتراک: {{ subscription_id }}\nپیام جدیدی در سرویس وکیل مشاور ثبت شد، در اسرع وقت پاسخ دهید.\n💎 @dadlinenet", ['client_name', 'subscription_id'], 'system', 'normal', 60),
            ...$this->multiChannel('subscription.vendor_message.created', 'پیام جدید وکیل', 'پیام جدیدی از طرف {{ vendor_name }} در دادلاین ثبت شد.', "🔸️#پیام_جدید\n💳 وکیل: {{ vendor_name }}\nپیام جدیدی از طرف وکیل مشاور شما در دادلاین ثبت شد.\n💎 @dadlinenet", ['vendor_name'], 'system', 'normal', 60),
            ...$this->multiChannel('case.vip.created', 'پرونده ویژه', 'پرونده ویژه {{ case_title }} به شما ارجاع شد.', "🔸️#پرونده_ویژه\n⚖️ عنوان: {{ case_title }}\n🔰 شماره: {{ case_id }}\nپرونده ویژه جدیدی به شما ارجاع شد. لطفا در اسرع وقت بررسی و رسیدگی بفرمایید.\n💎 @dadlinenet", ['case_title', 'case_id'], 'system', 'high', 1440),
            ...$this->multiChannel('document.vip.created', 'تنظیم اوراق قضایی', 'درخواست تنظیم اوراق {{ document_title }} به شما ارجاع شد.', "🔸️#تنظیم_اوراق_قضایی\n☑️ عنوان: {{ document_title }}\n🔰 شناسه: {{ document_id }}\nدرخواست تنظیم اوراق قضایی جدیدی به شما ارجاع شد. لطفا در اسرع وقت بررسی و رسیدگی بفرمایید.\n💎 @dadlinenet", ['document_title', 'document_id'], 'system', 'high', 1440),
            ...$this->multiChannel('vendor.broadcast.case', 'پرونده حقوقی جدید', 'پرونده جدیدی در حوزه {{ category }} ثبت شد.', "🔸️#پرونده_حقوقی\n⚖️ حوزه: {{ category }}\n🌐 عنوان: {{ title }}\nبرای بررسی و ثبت پیشنهاد به دادلاین مراجعه کنید.\n💎 @dadlinenet", ['category', 'title'], 'system', 'normal', 60),
            ...$this->multiChannel('vendor.broadcast.document', 'تنظیم مستند جدید', 'درخواست تنظیم {{ document_type }} در حوزه {{ category }} ثبت شد.', "🔸️#تنظیم_مستند\n🔰 حوزه: {{ category }}\n🌐 نوع: {{ document_type }}\n📄 عنوان: {{ title }}\nبرای بررسی و ثبت پیشنهاد به دادلاین مراجعه کنید.\n💎 @dadlinenet", ['category', 'document_type', 'title'], 'system', 'normal', 60),
            ...$this->multiChannel('vendor.broadcast.lawlink', 'درخواست همکاری جدید', 'درخواست همکاری جدیدی در حوزه {{ category }} ثبت شد.', "🔸️#درخواست_همکاری\n⚖️ حوزه: {{ category }}\n🌐 عنوان: {{ title }}\nدرخواست همکاری جدیدی ثبت شده است، لطفا بررسی کنید.\n💎 @dadlinenet", ['category', 'title'], 'system', 'normal', 60),
            ...$this->multiChannel('vendor.broadcast.call', 'مشاوره تلفنی جدید', 'مشاوره تلفنی جدیدی در حوزه {{ category }} به مدت {{ duration }} دقیقه ثبت شد.', "🔸️#مشاوره_تلفنی\n🔰 حوزه: {{ category }}\n🌐 سوال: {{ text }}\n🕔 زمان: {{ duration }} دقیقه\nبرای پذیرش درخواست به دادلاین مراجعه کنید.\n💎 @dadlinenet", ['category', 'text', 'duration'], 'system', 'normal', 60),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function walletAndBillingTemplates(): array
    {
        return [
            ...$this->multiChannel('wallet.transaction.created', 'تراکنش جدید', '{{ direction }} {{ amount }} تومان بابت {{ description }} ثبت شد.', "🔸️#تراکنش_جدید\n💳 نوع: {{ direction }}\n💰 مقدار: {{ amount }} تومان\n💸 شرح: {{ description }}\n🎛 وضعیت: {{ status }}\n💎 @dadlinenet", ['direction', 'amount', 'description', 'status'], 'payment', 'high', 60),
            ...$this->multiChannel('purchase.completed', 'پرداخت موفق', 'پرداخت {{ amount }} تومان با موفقیت تکمیل شد.', "🔸️#پرداخت_موفق\n💰 مبلغ: {{ amount }} تومان\n📌 نوع: {{ purchase_type }}\nپرداخت شما با موفقیت تکمیل شد.\n💎 @dadlinenet", ['amount', 'purchase_type'], 'payment', 'high', 1440, true, false),
            ...$this->multiChannel('settlement.requested', 'درخواست تسویه ثبت شد', 'درخواست برداشت {{ amount }} تومان ثبت شد و مبلغ قابل واریز {{ payable_amount }} تومان است.', "🔸️#درخواست_تسویه\n💰 مبلغ درخواست: {{ amount }} تومان\n✅ مبلغ قابل واریز: {{ payable_amount }} تومان\n🔖 شناسه: {{ settlement_id }}\n💎 @dadlinenet", ['amount', 'payable_amount', 'settlement_id'], 'payment', 'high', 1440),
            ...$this->multiChannel('settlement.completed', 'تسویه حساب انجام شد', 'مبلغ {{ payable_amount }} تومان به حساب بانکی شما واریز شد.', "🔸️#تسویه_حساب\n✅ مبلغ واریزی: {{ payable_amount }} تومان\n🔖 شناسه: {{ settlement_id }} | {{ tracker_id }}\nواریز با موفقیت انجام شد.\n💎 @dadlinenet", ['payable_amount', 'settlement_id', 'tracker_id'], 'payment', 'high', 1440),
            ...$this->multiChannel('settlement.failed', 'تسویه حساب ناموفق', 'تسویه حساب {{ amount }} تومان انجام نشد و مبلغ به کیف پول شما برگشت.', "🚨#تسویه_ناموفق\n💰 مبلغ: {{ amount }} تومان\n🔖 شناسه: {{ settlement_id }}\n⛓️‍💥 خطا: {{ error }}\nمبلغ به کیف پول شما برگشت داده شد.\n💎 @dadlinenet", ['amount', 'settlement_id', 'error'], 'payment', 'high', 1440, true, false),
            ...$this->multiChannel('settlement.reversed', 'برگشت انتقال بانکی', 'انتقال بانکی {{ amount }} تومان برگشت خورد و مبلغ به کیف پول شما بازگردانده شد.', "🚨#برگشت_تسویه\n💰 مبلغ: {{ amount }} تومان\n🔖 شناسه: {{ settlement_id }} | {{ tracker_id }}\nمبلغ به کیف پول شما بازگردانده شد.\n💎 @dadlinenet", ['amount', 'settlement_id', 'tracker_id'], 'payment', 'high', 1440, true, false),
            ...$this->multiChannel('ai_token.added', 'شارژ توکن هوش مصنوعی', '{{ amount }} توکن هوش مصنوعی برای شما شارژ شد.', "🔸️#پاداش\n{{ amount }} توکن دادبات برای شما شارژ شد.\n💎 @dadlinenet", ['amount'], 'system', 'normal', 60),
            ...$this->multiChannel('ai_token.rewarded_answer', 'پاداش پاسخ', '{{ amount }} توکن دادبات بابت پاسخگویی شما شارژ شد.', "🔸️#پاداش_پاسخ\nبابت پاسخگویی شما به سوالات مشتریان، {{ amount }} توکن دادبات به عنوان پاداش شارژ شد.\nصمیمانه از شما متشکریم.\n💎 @dadlinenet", ['amount'], 'system', 'normal', 60),
            ...$this->multiChannel('subscription.dadcoin.added', 'شارژ اشتراک', 'اشتراک {{ client_name }} با {{ amount }} دادکوین شارژ شد.', "🔸️#شارژ_اشتراک\n💳 کاربر: {{ client_name }}\n💰 مقدار: {{ amount }} دادکوین\nبا موفقیت پرداخت شد.\n💎 @dadlinenet", ['client_name', 'amount'], 'payment', 'high', 60),
            ...$this->multiChannel('subscription.call.requested', 'درخواست تماس تلفنی', 'درخواست مشاوره تلفنی توسط {{ client_name }} به مدت {{ duration }} دقیقه ثبت شد.', "🔸️#تماس_تلفنی\nدرخواست مشاوره تلفنی توسط {{ client_name }} به مدت {{ duration }} دقیقه ثبت شد.\n💎 @dadlinenet", ['client_name', 'duration'], 'system', 'high', 60),
            ...$this->multiChannel('consultation.vip_call.created', 'مشاوره تلفنی جدید', 'مشاوره تلفنی در حوزه {{ category }} با زمان {{ duration }} دقیقه توسط {{ client_name }} ثبت شد.', "🔸️#خرید_مشاوره_تلفنی\n📞 حوزه: {{ category }}\n🕒 زمان: {{ duration }} دقیقه\n❓ کاربر: {{ client_name }}\n💎 @dadlinenet", ['category', 'duration', 'client_name'], 'system', 'high', 60),
            ...$this->multiChannel('consultation.call.accepted', 'مشاوره تلفنی پذیرفته شد', 'درخواست مشاوره تلفنی شما توسط {{ vendor_name }} پذیرفته شد.', "🔸️#مشاوره_تلفنی\n☑️ کارشناس: {{ vendor_name }}\n🔰 نقش: {{ vendor_role }}\nدرخواست مشاوره تلفنی شما پذیرفته شد و حداکثر تا یک ساعت آینده با شما تماس خواهند گرفت.\n💎 @dadlinenet", ['vendor_name', 'vendor_role'], 'system', 'high', 60),
            ...$this->multiChannel('consultation.call.completed', 'ثبت دیدگاه مشاوره تلفنی', 'امیدواریم از مشاوره تلفنی {{ vendor_name }} رضایت داشته باشید؛ لطفا دیدگاه خود را ثبت کنید.', "🔸️#مشاوره_تلفنی\n☑️ کارشناس: {{ vendor_name }}\n{{ name }} عزیز، ضمن سپاس از همراهی شما، لطفا دیدگاه خود را در پیشخوان دادلاین ثبت کنید.\n💎 @dadlinenet", ['name', 'vendor_name'], 'system', 'normal', 60),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function officeAndTicketTemplates(): array
    {
        return [
            ...$this->multiChannel('office.task.created', 'اقدام جدید', 'اقدام جدیدی با عنوان {{ title }} برای شما ثبت شد.', "🔸️#اقدام_جدید\n☑️ عنوان: {{ title }}\n💎 @dadlinenet", ['title'], 'system', 'normal', 60),
            ...$this->multiChannel('office.reminder.due', 'یادآوری', 'یادآوری {{ title }} برای پرونده {{ case_title }} در {{ due_at }}', "🚨#یادآوری\n⚖️ پرونده: {{ case_title }}\n✅ عنوان: {{ title }}\n📄 نوع: {{ type }}\n🕔 {{ due_at }}\n\n{{ note }}\n\n💎 @dadlinenet", ['case_title', 'title', 'type', 'due_at', 'note'], 'legal_deadline', 'critical', 1440, true, false),
            ...$this->multiChannel('ticket.created', 'تیکت ثبت شد', 'تیکت «{{ title }}» با موفقیت برای {{ department }} ثبت شد.', "🎫 #تیکت_ثبت_شد\nعنوان: {{ title }}\nشناسه: {{ ticket_id }}\nواحد: {{ department }}\nاولویت: {{ priority }}\n💎 @dadlinenet", ['title', 'ticket_id', 'department', 'priority'], 'system', 'normal', 60),
            ...$this->multiChannel('ticket.staff.created', 'تیکت جدید', 'تیکت جدید «{{ title }}» توسط {{ user_name }} در {{ department }} ثبت شد.', "🚨 #تیکت_جدید\nعنوان: {{ title }}\nکاربر: {{ user_name }}\nواحد: {{ department }}\nاولویت: {{ priority }}\nشناسه: {{ ticket_id }}\n💎 @dadlinenet", ['title', 'user_name', 'department', 'priority', 'ticket_id'], 'system', 'high', 60),
            ...$this->multiChannel('ticket.staff.message', 'پاسخ پشتیبانی', 'پاسخ جدیدی توسط {{ actor_name }} در تیکت «{{ ticket_title }}» ثبت شد.', "🔸️ #پاسخ_پشتیبانی\nعنوان: {{ ticket_title }}\nپاسخ‌دهنده: {{ actor_name }}\nشناسه: {{ ticket_id }}\nپیام: {{ message }}\n💎 @dadlinenet", ['actor_name', 'ticket_title', 'ticket_id', 'message'], 'system', 'high', 60),
            ...$this->multiChannel('ticket.user.message', 'پیام جدید کاربر', '{{ actor_name }} در تیکت «{{ ticket_title }}» پیام جدیدی ارسال کرد.', "💬 #پیام_کاربر\nعنوان: {{ ticket_title }}\nکاربر: {{ actor_name }}\nشناسه: {{ ticket_id }}\nپیام: {{ message }}\n💎 @dadlinenet", ['actor_name', 'ticket_title', 'ticket_id', 'message'], 'system', 'normal', 60),
            ...$this->multiChannel('ticket.provider.message', 'پیام وکیل یا کارشناس', '{{ actor_name }} در تیکت «{{ ticket_title }}» پیام جدیدی ارسال کرد.', "⚖️ #پیام_پراوایدر\nعنوان: {{ ticket_title }}\nپراوایدر: {{ actor_name }}\nشناسه: {{ ticket_id }}\nپیام: {{ message }}\n💎 @dadlinenet", ['actor_name', 'ticket_title', 'ticket_id', 'message'], 'system', 'normal', 60),
            ...$this->multiChannel('ticket.internal_note.created', 'یادداشت داخلی تیکت', '{{ actor_name }} در تیکت «{{ ticket_title }}» یادداشت داخلی ثبت کرد.', "📝 #یادداشت_داخلی\nعنوان: {{ ticket_title }}\nثبت‌کننده: {{ actor_name }}\nشناسه: {{ ticket_id }}\n💎 @dadlinenet", ['actor_name', 'ticket_title', 'ticket_id'], 'system', 'normal', 60),
            ...$this->multiChannel('ticket.updated', 'به‌روزرسانی تیکت', '{{ field }} تیکت «{{ ticket_title }}» از {{ from }} به {{ to }} تغییر کرد.', "🔄 #بروزرسانی_تیکت\nعنوان: {{ ticket_title }}\nشناسه: {{ ticket_id }}\nمورد: {{ field }}\nاز: {{ from }}\nبه: {{ to }}\n💎 @dadlinenet", ['field', 'ticket_title', 'ticket_id', 'from', 'to'], 'system', 'normal', 60),
            ...$this->multiChannel('story.status.updated', 'به‌روزرسانی تجربه', 'تجربه {{ title }} به وضعیت {{ status }} تغییر کرد.', "🚀 بروزرسانی وضعیت تجربه\n🔸️ عنوان: {{ title }}\n🌺 تجربه شما به وضعیت {{ status }} بروزرسانی شد.\n@dadlinenet", ['title', 'status'], 'system', 'normal', 60),
            ...$this->multiChannel('review.created', 'دیدگاه جدید', 'دیدگاه جدیدی برای شما ثبت شد.', "🔸️#دیدگاه_جدید\n🏷 خدمت: {{ service_type }}\n🌟 ستاره: {{ rating }}\n\n💬 دیدگاه: {{ review }}\n\n💎 @dadlinenet", ['service_type', 'rating', 'review'], 'system', 'normal', 60),
            ...$this->multiChannel('security.login.detected', 'ورود به پنل کاربری دادلاین', 'ورود به حساب شما در {{ time }} از IP {{ ip }} ثبت شد.', "🔐 ورود به پنل کاربری دادلاین\n🕔 تاریخ: {{ time }}\n🌐 آی‌پی: {{ ip }}", ['time', 'ip'], 'security', 'high', 60, true, false),
            ...$this->multiChannel('affiliate.user_registered', 'عضویت جدید', 'کاربر جدیدی با لینک شما عضو دادلاین شد.', "🚀 تبریک، کاربر جدیدی با لینک شما عضو دادلاین شد\n🕔 تاریخ: {{ time }}\n🌺 از همکاری شما صمیمانه متشکریم\n@dadlinenet", ['time'], 'system', 'normal', 60),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function adminTemplates(): array
    {
        return [
            $this->template('admin.income.created', 'telegram', 'درآمد جدید', "🔸️ #درآمد_جدید\n⚖️ نوع: {{ type }}\n🌐 مبلغ: {{ amount }} تومان\n🕔 زمان: {{ time }}\n📄 توضیحات: {{ description }}", ['type', 'amount', 'time', 'description'], 'payment', 'normal', false, true, 0),
            $this->template('admin.income.created', 'eitaa', 'درآمد جدید', "🔸️ #درآمد_جدید\n⚖️ نوع: {{ type }}\n🌐 مبلغ: {{ amount }} تومان\n🕔 زمان: {{ time }}\n📄 توضیحات: {{ description }}", ['type', 'amount', 'time', 'description'], 'payment', 'normal', false, true, 0),
            $this->template('admin.cost.created', 'telegram', 'هزینه جدید', "🔸️ #هزینه_جدید\n⚖️ نوع: {{ type }}\n🌐 مبلغ: {{ amount }} تومان\n🕔 زمان: {{ time }}\n📄 توضیحات: {{ description }}", ['type', 'amount', 'time', 'description'], 'payment', 'normal', false, true, 0),
            $this->template('admin.settlement.failed', 'telegram', 'تسویه ناموفق', "🚨🚨 #تسویه_حساب_ناموفق\n💎 کاربر: {{ user_name }}\n💰 مبلغ: {{ amount }} تومان\n🔖 شناسه: {{ settlement_id }}\n⛓️‍💥 خطا: {{ error }}", ['user_name', 'amount', 'settlement_id', 'error'], 'payment', 'high', true, false, 0),
            $this->template('admin.ticket.created', 'telegram', 'تیکت جدید', "🚨 #تیکت_جدید\n💬 عنوان: {{ title }}\n🙋‍♂️ کاربر: {{ user_name }}\n💎 @dadlinenet", ['title', 'user_name'], 'system', 'normal', false, true, 0),
            $this->template('admin.fcm.invalid', 'telegram', 'توکن FCM نامعتبر', "🚫 توکن FCM نامعتبر است و حذف شد:\n{{ token }}", ['token'], 'system', 'normal', false, true, 0, 30),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function systemTemplates(): array
    {
        return [
            ...$this->multiChannel('sms.balance.exhausted', 'اتمام سهمیه پیامک', 'سهمیه پیامک شما به اتمام رسیده است. برای استفاده مجدد، بسته شارژ پیامک تهیه کنید.', "🔸️#سهمیه_پیامک\nسهمیه پیامک شما به اتمام رسیده است. برای استفاده مجدد، لطفاً بسته شارژ پیامک تهیه کنید.\n💎 @dadlinenet", ['required_units'], 'system', 'high', 1440, true, true),
            ...$this->multiChannel('sms.balance.recharged', 'شارژ سهمیه پیامک', 'بسته پیامکی شما با {{ units }} واحد شارژ شد و ارسال پیامک دوباره فعال شد.', "🔸️#شارژ_پیامک\nبسته پیامکی شما با {{ units }} واحد شارژ شد و ارسال پیامک دوباره فعال شد.\n💎 @dadlinenet", ['units'], 'system', 'normal', 60),
            ...$this->multiChannel('marketing.bulk', 'پیام دادلاین', '{{ message }}', '{{ message }}', ['message'], 'marketing', 'low', 1440, false, true, true, 30),
        ];
    }

    /**
     * @param  array<int, string>  $variables
     * @return array<int, array<string, mixed>>
     */
    private function multiChannel(
        string $key,
        string $title,
        string $shortBody,
        string $botBody,
        array $variables,
        string $category,
        string $priority,
        int $dedupeWindowMinutes,
        bool $critical = false,
        bool $quietHoursEnabled = true,
        bool $includeBale = false,
        ?int $retentionDays = null
    ): array {
        $channels = [
            ['database', $shortBody],
            ['push', $shortBody],
            ['email', $shortBody],
            ['telegram', $botBody],
            ['eitaa', $botBody],
        ];

        if ($includeBale) {
            $channels[] = ['bale', $botBody];
        }

        return array_map(
            fn (array $channel): array => $this->template(
                key: $key,
                channel: $channel[0],
                title: $title,
                body: $channel[1],
                variables: $variables,
                category: $category,
                priority: $priority,
                critical: $critical,
                quietHoursEnabled: $quietHoursEnabled,
                dedupeWindowMinutes: $dedupeWindowMinutes,
                retentionDays: $retentionDays,
            ),
            $channels
        );
    }

    /**
     * @param  array<int, string>  $variables
     * @param  array<string, mixed>|null  $providerPatterns
     * @return array<string, mixed>
     */
    private function template(
        string $key,
        string $channel,
        string $title,
        string $body,
        array $variables,
        string $category,
        string $priority,
        bool $critical,
        bool $quietHoursEnabled,
        int $dedupeWindowMinutes,
        ?int $retentionDays = null,
        ?array $providerPatterns = null
    ): array {
        return [
            'key' => $key,
            'channel' => $channel,
            'title' => $title,
            'body' => $body,
            'variables' => $variables,
            'provider_patterns' => $providerPatterns,
            'category' => $category,
            'priority' => $priority,
            'is_critical' => $critical,
            'quiet_hours_enabled' => $quietHoursEnabled,
            'dedupe_window_minutes' => $dedupeWindowMinutes,
            'retention_days' => $retentionDays,
        ];
    }

    private function categoryFor(string $key): string
    {
        return match (true) {
            str_contains($key, 'otp') => 'auth',
            str_contains($key, 'contract') => 'contract',
            str_contains($key, 'transaction'), str_contains($key, 'settlement') => 'payment',
            str_contains($key, 'reminder') => 'legal_deadline',
            default => 'system',
        };
    }

    private function priorityFor(string $key): string
    {
        return $this->isCritical($key) ? 'critical' : match (true) {
            str_contains($key, 'accept'), str_contains($key, 'final'), str_contains($key, 'confirm') => 'high',
            str_contains($key, 'notification_to_vendor') => 'normal',
            default => 'normal',
        };
    }

    private function isCritical(string $key): bool
    {
        return str_contains($key, 'otp')
            || str_contains($key, 'sign_code')
            || str_contains($key, 'invite_code')
            || str_contains($key, 'reminders');
    }

    private function dedupeWindowFor(string $key): int
    {
        return match (true) {
            $this->isCritical($key) => 2,
            str_contains($key, 'notification_to_vendor') => 60,
            str_contains($key, 'accept'), str_contains($key, 'final') => 1440,
            default => 60,
        };
    }

    private function retentionDaysFor(string $key): ?int
    {
        return match (true) {
            str_contains($key, 'otp') => 7,
            str_contains($key, 'notification_to_vendor') => 30,
            default => null,
        };
    }

    /**
     * @return array<string, mixed>|null
     */
    private function smsPattern(string $legacyKey): ?array
    {
        $patterns = DB::table('sms_templates')
            ->where('key', $legacyKey)
            ->value('patterns');

        if ($patterns === null) {
            return null;
        }

        return json_decode($patterns, true);
    }
}
