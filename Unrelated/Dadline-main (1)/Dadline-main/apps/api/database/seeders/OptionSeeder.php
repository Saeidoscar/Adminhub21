<?php

namespace Database\Seeders;

use App\Models\Option;
use Illuminate\Database\Seeder;

class OptionSeeder extends Seeder
{
    public function run(): void
    {
        $options = [
            'submit_case' => [
                'group' => 'pricing',
                'value' => '16500',
            ],
            'vendor_share' => [
                'group' => 'pricing',
                'value' => '0.7',
            ],
            'pro_vendor_share' => [
                'group' => 'pricing',
                'value' => '0.8',
            ],
            'lawlink_share' => [
                'group' => 'pricing',
                'value' => '0.9',
            ],
            'doc_sale_share' => [
                'group' => 'pricing',
                'value' => '0.4',
            ],
            'marketing_share' => [
                'group' => 'pricing',
                'value' => '0.3',
            ],
            'promote_aff_rate' => [
                'group' => 'pricing',
                'value' => '1.0',
            ],
            'verify_cost' => [
                'group' => 'pricing',
                'value' => '22000',
            ],
            'verify_level_one_cost' => [
                'group' => 'pricing',
                'value' => '0',
            ],
            'verify_iban_cost' => [
                'group' => 'pricing',
                'value' => '0',
            ],
            'verify_level_three_deposit_amount' => [
                'group' => 'pricing',
                'value' => '10000',
            ],
            'ai_analysis_price' => [
                'group' => 'pricing',
                'value' => '0',
            ],
            'publish_lawlink_cost' => [
                'group' => 'pricing',
                'value' => '22000',
            ],
            'vat_percent' => [
                'group' => 'pricing',
                'value' => '0.1',
            ],
            'monthly_subscription_price' => [
                'group' => 'pricing',
                'value' => '300000',
            ],
            'def_subscription_period' => [
                'group' => 'pricing',
                'value' => '14',
            ],
            'monthly_subscription_price_off' => [
                'group' => 'pricing',
                'value' => '0.0',
            ],
            'submit_contract' => [
                'group' => 'pricing',
                'value' => '66000',
            ],
            'submit_legal_doc' => [
                'group' => 'pricing',
                'value' => '16500',
            ],
            'submit_question' => [
                'group' => 'pricing',
                'value' => '19800',
            ],
            'become_vendor_price' => [
                'group' => 'pricing',
                'value' => '66000',
            ],
            'phone_counseling_price' => [
                'group' => 'pricing',
                'value' => '110000',
            ],
            'settlement_fee' => [
                'group' => 'pricing',
                'value' => '5500',
            ],
            'first_answer_on_question_cost' => [
                'group' => 'pricing',
                'value' => '8000',
            ],
            'dadcoin_price' => [
                'group' => 'pricing',
                'value' => '15000',
            ],
            'case_price' => [
                'group' => 'pricing',
                'value' => '500000',
            ],
            'phone_counseling_10' => [
                'group' => 'pricing',
                'value' => '120000',
            ],
            'phone_counseling_20' => [
                'group' => 'pricing',
                'value' => '210000',
            ],
            'phone_counseling_30' => [
                'group' => 'pricing',
                'value' => '320000',
            ],
            'phone_counseling_40' => [
                'group' => 'pricing',
                'value' => '420000',
            ],
            'doc_bill' => [
                'group' => 'pricing',
                'value' => '500000',
            ],
            'doc_petition' => [
                'group' => 'pricing',
                'value' => '600000',
            ],
            'doc_statement' => [
                'group' => 'pricing',
                'value' => '500000',
            ],
            'doc_complaint' => [
                'group' => 'pricing',
                'value' => '500000',
            ],
            'doc_contract' => [
                'group' => 'pricing',
                'value' => '700000',
            ],
            'sms_provider' => [
                'group' => 'sms',
                'value' => 'melliPayamak',
            ],
            'adli-sender-number' => [
                'group' => 'sms',
                'value' => 'auto',
            ],
            'fee-per-sms' => [
                'group' => 'sms',
                'value' => '330',
            ],
            'item_limit_vendor_dashboard' => [
                'group' => 'platform',
                'value' => '5',
            ],
            'payment_gateway' => [
                'group' => 'platform',
                'value' => 'smart',
            ],
            'payment_sep_enabled' => [
                'group' => 'payment',
                'value' => '1',
            ],
            'payment_sep_request_url' => [
                'group' => 'payment',
                'value' => 'https://sep.shaparak.ir/OnlinePG/OnlinePG',
            ],
            'payment_sep_verify_url' => [
                'group' => 'payment',
                'value' => 'https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTranscation',
            ],
            'payment_sep_terminal_id' => [
                'group' => 'payment',
                'value' => '15272525',
            ],
            'payment_sep_merchant_id' => [
                'group' => 'payment',
                'value' => '15272525',
            ],
            'payment_sep_secret_key' => [
                'group' => 'payment',
                'value' => '1344751',
            ],
            'payment_zibal_enabled' => [
                'group' => 'payment',
                'value' => '1',
            ],
            'payment_zibal_request_url' => [
                'group' => 'payment',
                'value' => 'https://gateway.zibal.ir/v1/request',
            ],
            'payment_zibal_verify_url' => [
                'group' => 'payment',
                'value' => 'https://gateway.zibal.ir/v1/verify',
            ],
            'payment_zibal_start_url' => [
                'group' => 'payment',
                'value' => 'https://gateway.zibal.ir/start',
            ],
            'payment_zibal_merchant' => [
                'group' => 'payment',
                'value' => '674247c16f38030017dec3da',
            ],
            'payment_snapp_pay_enabled' => [
                'group' => 'payment',
                'value' => '1',
            ],
            'payment_snapp_pay_base_url' => [
                'group' => 'payment',
                'value' => 'https://fms-gateway-staging.apps.public.okd4.teh-1.snappcloud.io',
            ],
            'payment_snapp_pay_oauth_url' => [
                'group' => 'payment',
                'value' => 'https://fms-gateway-staging.apps.public.okd4.teh-1.snappcloud.io/api/online/v1/oauth/token',
            ],
            'payment_snapp_pay_request_url' => [
                'group' => 'payment',
                'value' => 'https://fms-gateway-staging.apps.public.okd4.teh-1.snappcloud.io/api/online/payment/v1/token',
            ],
            'payment_snapp_pay_verify_url' => [
                'group' => 'payment',
                'value' => 'https://fms-gateway-staging.apps.public.okd4.teh-1.snappcloud.io/api/online/payment/v1/verify',
            ],
            'payment_snapp_pay_settle_url' => [
                'group' => 'payment',
                'value' => 'https://fms-gateway-staging.apps.public.okd4.teh-1.snappcloud.io/api/online/payment/v1/settle',
            ],
            'payment_snapp_pay_status_url' => [
                'group' => 'payment',
                'value' => 'https://fms-gateway-staging.apps.public.okd4.teh-1.snappcloud.io/api/online/payment/v1/status',
            ],
            'payment_snapp_pay_client_id' => [
                'group' => 'payment',
                'value' => 'dad-line',
            ],
            'payment_snapp_pay_client_secret' => [
                'group' => 'payment',
                'value' => env('SNAPP_PAY_CLIENT_SECRET', ''),
            ],
            'payment_snapp_pay_username' => [
                'group' => 'payment',
                'value' => 'dad-line-purchase',
            ],
            'payment_snapp_pay_user_name' => [
                'group' => 'payment',
                'value' => 'dad-line-purchase',
            ],
            'payment_snapp_pay_password' => [
                'group' => 'payment',
                'value' => env('SNAPP_PAY_PASSWORD', ''),
            ],
            'payment_snapp_pay_merchant_id' => [
                'group' => 'payment',
                'value' => '',
            ],
            'payment_snapp_pay_commission_type' => [
                'group' => 'payment',
                'value' => '100',
            ],
            'payment_snapp_pay_default_category' => [
                'group' => 'payment',
                'value' => 'legal-services',
            ],
            'payment_snapp_pay_forced_payment_method_types' => [
                'group' => 'payment',
                'value' => [],
            ],
            'attorney_contract_text' => [
                'group' => 'legal',
                'value' => '{این متن صرفا یک نمونه قرارداد وکالت است و هنگام ذخیره سازی این سطر را پاک کنید و اطلاعات تکراری هر قرارداد مانند مشخصات وکیل و ... را در متن ذیل وارد کنید}

قرارداد حق الوکـالـه
پیرو وکالتنامه شماره ....................... مورخ .................... و به تجویز ماده یک آئین نامه تعرفه حق الوکاله و هزینه سفر وکلای دادگستری مصوب 27/4/85 ناظر بر ماده 19 لایحه استقلال کانون وکلای دادگستری مصوب 1333 که مقررداشتــه؛ «قرارداد حق الوکاله طبق ماده 19 لایحه قانونی استقلال کانون وکلای دادگستری مصوب 1333 بین وکیل و موکل معتبراست» وکیل و موکل در مورد ضوابط کار و میزان حق الوکاله وترتیب پرداخت آن به شرح زیرتوافق نمودند:
ماده 1) نام و مشخصات و اقامتگاه وکیل: .................................................................................................................................................
ماده 2) نام و مشخصات و اقامتگاه موکل یا متعهد پرداخت : ...............................................................................................................
ماده 3) حق الوکاله مندرج در این قرارداد انحصاراً مربوط است به: ....................................................................................................
ماده 4) چنانچه درجریان کار، ضرورت ایجاب نماید که شکایت ودعوی دیگری طرح یا شخص ثالثی جلب ویا ثالثی وارد دعوی شود ویا دعوی تقابل یا مرتبط توسط طرف دعوی علیه موکل مطرح شود و یا وکیل علاوه برموضوع ماده فوق در مراحل فرجام واعاده دادرسی واعتراض ثالث واجرای حکم و رسیدگی پس از نقض دخالت کند، میزان حق الوکاله ارتباطی به این قرارداد ندارد و مستلزم حق الوکاله جداگانه براساس توافق جداگانه خواهد بود .
ماده 5) میزان حق الوکاله موضوع قرارداد ................................... ریال (برابر .............................. تومان است ) که به ترتیب زیرقابــل پرداخت است:
............................................................................................................................................................................
............................................................................................................................................................................
تبصره 1: در صورت صدور حکم قطعی و همچنین درصورتی که درجریان رسیدگی بدوی، دعوی به هرنحو (ازجمله با تنظیم گزارش اصلاحی) بین طرفین به سازش خاتمه یابد، وکیل مستحق دریافت تمام حق الوکاله آن مرحله است.
تبصره 2: چنانچه پس از اعلام وکالت توسط وکیل در پرونده موضوع قرارداد و تقدیم دادخواست و شکواییه، موکل در هریک از مراحل رسیدگی بدون دلیل اقدام به عزل وی نماید، وکیل استحقاق دریافت حق الوکاله آن مرحله را خواهد داشت.
تبصره 3: وکیل بر اساس مبالغ دریافتی تمبر مالیاتی و حقوق صندوق حمایت و کانون را پرداخت خواهد نمود.
تبصره 4: در صورت اعلام استعفاء از طرف وکیل در هر یک از مراحل رسیدگی ، چنانچه این اقدام وی مستند به فعل یا تخلف موکل از جمله عدم پرداخت هزینه های قانونی و یا حق الوکاله آن مرحله توسط موکل باشد، وکیل حق مطالبه و اخذ حق الوکاله آن مرحله را خواهد داشت و چنانچه استعفاء وکیل منحصراً معلول تصمیم وکیل باشد به تناسب کاری که درآن مرحله انجام داده است مستحق دریافت حق الوکاله خواهد بود.
ماده 6) پرداخت هزینه های دادرسی و مخارج لازمه دعوی از قبیل هزینه سفر و اجرای قرار و دستمزد کارشناس و حق الزحمه داوری و هزینه آگهی و غیره به عهده موکل است که موظف است ظرف 3 روز از تاریخ اعلام وکیل از هر طریق اعم از پیامک یا تلفن و امثال آن به شماره تماس که موکل ارائه داده نسبت به پرداخت مبلغ مقرراقدام کند ، در غیر اینصورت مسئولیتی متوجه وکیل نیست.
ماده 7) معرفی شهود و مطلعین ، آوردن آنها به دادگاه یا محل اجرای قرار و تهیه وسیله اجرای قرارکارشناسی و معاینه محل و همچنین سایر اقدامات اجرائی مثل جلب متهم ابلاغ اوراق دعوی بعهده وکیل نیست و با اعلام وکیل و عدم اقدام یا تأخیر موکل مسئولیتی متوجه وکیل نخواهد بود.
ماده 8) وکیل به هیچ وجه نتیجه دعوی و شکایت مطروحه و طول جریان دادرسی را تضمین نمی نماید و تعهد وکیل در قبال موکل از نوع تعهد به وسیله دفاع از حقوق موکل در حد توانایی علمی و فنی خویش و مدارک و دلایل مورد ارائه موکل با رعایت موازین قانونی و عرف وکالت می باشد و موکل با توجه به احتمال عدم پیشرفت کار، حاضر به امضای این قرارداد شده است. به موکل توضیح داده شد درصورت عدم پذیرش شکایت کیفری احتمال دارد طرف مقابل شکایت افترا علیه وی طرح نمایند و همچنین درصورت رد دعوی حقوقی ممکن است موکل به پرداخت خسارات دادرسی در حق طرف مقابل و یا دولت ( در دعوی اعسار) محکوم گردد.
ماده 9) درصورت بروز هر گونه اختلاف بین وکیل و موکل یا متعهد پرداخت که ناشی از اصل قرارداد وکالت و یا حق الوکاله و یا به طورکلی مرتبط با این قرارداد باشد از جمله اختلافات راجع به تفسیر و اجرای قرارداد، موضوع از طریق داوری حل وفصل خواهد شد. طرفین با امضاء این قرارداد، به مرکز داوری کانون وکلای دادگستری منطقه فارس تفویض اختیار نمودند تا نسبت به انتخاب داور با حق صلح وسازش جهت رسیدگی به اختلافات فیمابین اقدام نماید. رأی صادره توسط داور منتخب مذکور قطعی و مفاد آن برای طرفین لازم الاجرا خواهد بود. حق الزحمه داور بر اساس تعرفه مرکز داوری بالمناصفه با طرفین است و مهلت اظهارنظر داور از تاریخ قبولی داور 45 روزاست .
ماده 10) مواردی که دراین قرارداد پیش بینی نشده تابع مقررات تعرفه حق الوکاله و عرف وکالت می باشد. این قرارداد مشتمل بر10 ماده و 4 تبصره در دو نسخه، درتاریخ  /  /  14 بین طرفین تنظیم و به امضاء آنان رسید و مبادله گردید، اعتبــارنسخ یکسان می باشد ونسخه ای ازآن تحویل موکل گردید .',
            ],
            'case_statuses' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'پذیرش و ثبت اولیه',
                        'id' => 'intake',
                    ],
                    '1' => [
                        'name' => 'بررسی حقوقی و تعیین استراتژی',
                        'id' => 'strategy',
                    ],
                    '2' => [
                        'name' => 'تکمیل مستندات',
                        'id' => 'documentation',
                    ],
                    '3' => [
                        'name' => 'تنظیم و ثبت دادخواست',
                        'id' => 'filing',
                    ],
                    '4' => [
                        'name' => 'جلسات دادگاه و دفاعیات',
                        'id' => 'hearing',
                    ],
                    '5' => [
                        'name' => 'ارجاع به کارشناسی',
                        'id' => 'expertise',
                    ],
                    '6' => [
                        'name' => 'در انتظار صدور رأی',
                        'id' => 'waiting_verdict',
                    ],
                    '7' => [
                        'name' => 'دریافت و بررسی رأی',
                        'id' => 'verdict',
                    ],
                    '8' => [
                        'name' => 'اعتراض و تجدیدنظر',
                        'id' => 'appeal',
                    ],
                    '9' => [
                        'name' => 'اجرای حکم',
                        'id' => 'execution',
                    ],
                    '10' => [
                        'name' => 'تعلیق یا توقف پرونده',
                        'id' => 'suspension',
                    ],
                    '11' => [
                        'name' => 'خاتمه موفقیت‌آمیز',
                        'id' => 'success',
                    ],
                    '12' => [
                        'name' => 'خاتمه با مصالحه',
                        'id' => 'settlement',
                    ],
                    '13' => [
                        'name' => 'خاتمه ناموفق',
                        'id' => 'failure',
                    ],
                ],
            ],
            'claim_types' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'دادخواست بدوی/شکوائیه',
                        'id' => '1',
                    ],
                    '1' => [
                        'name' => 'حقوقی',
                        'id' => '2',
                    ],
                    '2' => [
                        'name' => 'کیفری',
                        'id' => '3',
                    ],
                    '3' => [
                        'name' => 'اعاده دادرسی کیفری',
                        'id' => '4',
                    ],
                    '4' => [
                        'name' => 'اعاده دادرسی مدنی',
                        'id' => '5',
                    ],
                    '5' => [
                        'name' => 'تجدیدنظر خواهی',
                        'id' => '6',
                    ],
                    '6' => [
                        'name' => 'اعتراض به قرار',
                        'id' => '7',
                    ],
                    '7' => [
                        'name' => 'اعتراض ثالث',
                        'id' => '8',
                    ],
                    '8' => [
                        'name' => 'تقابل',
                        'id' => '11',
                    ],
                    '9' => [
                        'name' => 'جلب ثالث',
                        'id' => '12',
                    ],
                    '10' => [
                        'name' => 'ورود ثالث',
                        'id' => '13',
                    ],
                    '11' => [
                        'name' => 'واخواهی',
                        'id' => '14',
                    ],
                    '12' => [
                        'name' => 'سایر',
                        'id' => '20',
                    ],
                ],
            ],
            'referral_authorities' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'شورای حل اختلاف',
                        'id' => '1',
                    ],
                    '1' => [
                        'name' => 'محاکم حقوقی',
                        'id' => '2',
                    ],
                    '2' => [
                        'name' => ' محاکم کیفری یک',
                        'id' => '3',
                    ],
                    '3' => [
                        'name' => ' محاکم کیفری دو',
                        'id' => '4',
                    ],
                    '4' => [
                        'name' => 'محاکم خانواده',
                        'id' => '5',
                    ],
                    '5' => [
                        'name' => 'اجرای احکام مدنی/کیفری',
                        'id' => '6',
                    ],
                    '6' => [
                        'name' => 'دادگاه های صلح',
                        'id' => '7',
                    ],
                    '7' => [
                        'name' => 'دادسرا',
                        'id' => '8',
                    ],
                    '8' => [
                        'name' => 'محاکم تجدیدنظر',
                        'id' => '9',
                    ],
                    '9' => [
                        'name' => 'دیوان عالی کشور',
                        'id' => '10',
                    ],
                    '10' => [
                        'name' => 'دیوان عدالت اداری',
                        'id' => '11',
                    ],
                    '11' => [
                        'name' => 'دادسرا و دادگاه نظامی',
                        'id' => '12',
                    ],
                    '12' => [
                        'name' => 'دادگاه انقلاب',
                        'id' => '13',
                    ],
                    '13' => [
                        'name' => 'دادگاه روحانیت',
                        'id' => '14',
                    ],
                    '14' => [
                        'name' => 'سایر مراجع',
                        'id' => '20',
                    ],
                ],
            ],
            'office_client_roles' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'خواهان/شاکی',
                        'id' => 'plaintiff',
                    ],
                    '1' => [
                        'name' => 'خوانده/متهم',
                        'id' => 'defendant',
                    ],
                    '2' => [
                        'name' => 'وکیل طرف مقابل',
                        'id' => 'opposing_lawyer',
                    ],
                    '3' => [
                        'name' => 'نماینده حقوقی',
                        'id' => 'legal_representative',
                    ],
                    '4' => [
                        'name' => 'شاهد/وثیقه گذار/کفیل',
                        'id' => 'witness_guarantor',
                    ],
                    '5' => [
                        'name' => 'کارشناس',
                        'id' => 'expert',
                    ],
                    '6' => [
                        'name' => 'وکیل همکار',
                        'id' => 'collaborating_lawyer',
                    ],
                    '7' => [
                        'name' => 'سایر',
                        'id' => 'other',
                    ],
                ],
            ],
            'case_note_types' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'یادداشت عادی',
                    ],
                    '1' => [
                        'name' => 'متن لایحه',
                    ],
                    '2' => [
                        'name' => 'دادخواست/شکوائیه',
                    ],
                    '3' => [
                        'name' => 'متن اظهارنامه',
                    ],
                    '4' => [
                        'name' => 'مکاتبه اداری',
                    ],
                    '5' => [
                        'name' => 'ماده قانونی',
                    ],
                    '6' => [
                        'name' => 'رای وحدت رویه',
                    ],
                    '7' => [
                        'name' => 'نظریه مشورتی',
                    ],
                    '8' => [
                        'name' => 'وقایع اتفاق افتاده',
                    ],
                    '9' => [
                        'name' => 'قرارداد حقوقی',
                    ],
                    '10' => [
                        'name' => 'متن پیامک',
                    ],
                ],
            ],
            'document_file_type' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'اظهارنامه',
                    ],
                    '1' => [
                        'name' => 'دادنامه',
                    ],
                    '2' => [
                        'name' => 'سایر',
                    ],
                ],
            ],
            'income_trs_category_type' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'مشاوره حقوقی',
                    ],
                    '1' => [
                        'name' => 'حق‌الزحمه تنظیم مستندات',
                    ],
                    '2' => [
                        'name' => 'حق‌الزحمه خدمات قراردادی',
                    ],
                    '3' => [
                        'name' => 'بابت خدمات داوری',
                    ],
                    '4' => [
                        'name' => 'بابت خدمات میانجی‌گری',
                    ],
                    '5' => [
                        'name' => 'درآمد حاصل از آموزش',
                    ],
                    '6' => [
                        'name' => 'درآمدهای متفرقه',
                    ],
                ],
            ],
            'expense_trs_category_type' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'اجاره یا شارژ دفتر',
                    ],
                    '1' => [
                        'name' => 'سایرهزینه ها',
                    ],
                    '2' => [
                        'name' => 'قبوض خدماتی',
                    ],
                    '3' => [
                        'name' => 'حقوق پرسنل',
                    ],
                    '4' => [
                        'name' => 'هزینه های دادگاهی',
                    ],
                ],
            ],
            'dad_secretly_permissions' => [
                'group' => 'legal',
                'value' => [
                    '0' => [
                        'name' => 'مشاهده گزارش های مالی',
                        'id' => 'viewFinance',
                    ],
                    '1' => [
                        'name' => 'مشاهده تراکنش های پرونده',
                        'id' => 'viewCaseFinance',
                    ],
                    '2' => [
                        'name' => 'افزودن تراکنش مالی',
                        'id' => 'addFinance',
                    ],
                    '3' => [
                        'name' => 'مدیریت ثبت ساعت',
                        'id' => 'addHours',
                    ],
                    '4' => [
                        'name' => 'ثبت پرونده',
                        'id' => 'addCase',
                    ],
                    '5' => [
                        'name' => 'ویرایش پرونده',
                        'id' => 'manageCase',
                    ],
                    '6' => [
                        'name' => 'حذف پرونده',
                        'id' => 'deleteCase',
                    ],
                    '7' => [
                        'name' => 'مدیریت دفتر',
                        'id' => 'manageOffice',
                    ],
                    '8' => [
                        'name' => 'مدیریت مخاطبان',
                        'id' => 'manageContacts',
                    ],
                    '9' => [
                        'name' => 'مشاهده مخاطبان',
                        'id' => 'viewContacts',
                    ],
                    '10' => [
                        'name' => 'مدیریت وظیفه ها',
                        'id' => 'manageTasks',
                    ],
                    '11' => [
                        'name' => 'افزودن وظیفه ها',
                        'id' => 'addTask',
                    ],
                    '12' => [
                        'name' => 'مدیریت رویدادها',
                        'id' => 'manageEvents',
                    ],
                    '13' => [
                        'name' => 'مدیریت مستندات',
                        'id' => 'manageFiles',
                    ],
                    '14' => [
                        'name' => 'دانلود مستندات',
                        'id' => 'viewFiles',
                    ],
                    '15' => [
                        'name' => 'مدیریت گفتگو با موکل',
                        'id' => 'manageChat',
                    ],
                    '16' => [
                        'name' => 'مدیریت یادداشت ها',
                        'id' => 'manageNotes',
                    ],
                    '17' => [
                        'name' => 'مشاهده یادداشت ها',
                        'id' => 'viewNotes',
                    ],
                    '18' => [
                        'name' => 'دسترسی هوش مصنوعی',
                        'id' => 'manageAi',
                    ],
                    '19' => [
                        'name' => 'دریافت یادآوری ها',
                        'id' => 'eReminder',
                    ],
                ],
            ],
            'contract_help_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'contract_sign_help_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'case_help_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'legal_doc_help_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'counseling_help_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'call_help_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'case_page_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'legal_doc_shop_help_video' => [
                'group' => 'content',
                'value' => '',
            ],
            'advertisements' => [
                'group' => 'content',
                'value' => [
                    '0' => [
                        'advertisement_title' => 'معرفی دادلاین',
                        'advertisement_text' => '⚖️ دادلاین – عدالت برای همه

💬 آیا مسائل حقوقی شما را می‌ترساند؟ ما این دیوار را می‌شکنیم.

🚀 با دادلاین، دسترسی ۲۴ ساعته به وکلای احراز هویت‌شده، قضات بازنشسته و کارشناسان حقوقی دارید.

✍️ مشاوره فوری (متنی و تلفنی)، تنظیم دقیق مستندات و قراردادها با امضای الکترونیک.

📚 دسترسی سریع به قوانین و آرای حقوقی، بدون سردرگمی.

✅ به خانواده‌ی عدالت‌محور ما بپیوندید و حس قدرت و آرامش در مسیر حقوقی خود را تجربه کنید.

همین حالا شروع کنید – ثبت‌نام رایگان
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/04/dadline-intro.jpg',
                            'id' => '3242',
                            'width' => '1920',
                            'height' => '1080',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/04/dadline-intro-150x150.jpg',
                            'alt' => '',
                            'title' => 'dadline-intro',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net',
                        'flex_size' => '4',
                    ],
                    '1' => [
                        'advertisement_title' => 'روز وکیل مدافع گرامی باد',
                        'advertisement_text' => '',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2026/02/lawyer-day.png',
                            'id' => '4941',
                            'width' => '1080',
                            'height' => '1980',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2026/02/lawyer-day-150x150.png',
                            'alt' => '',
                            'title' => 'روز وکیل - 7 اسفند',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net/lawyer-day',
                        'flex_size' => '3',
                    ],
                    '2' => [
                        'advertisement_title' => 'دادبات، هوش مصنوعی',
                        'advertisement_text' => '💎 دادلاین | عدالت برای همه
🚀 هوش مصنوعی دادبات | دستیار حقوقی هوشمند شما

🖲 دیگر لازم نیست برای هر سوال حقوقی ساعت‌ها وقت بگذارید یا دنبال مشاور بگردید.

✅ با دادبات، سرویس هوشمند دادلاین، همه نیازهای حقوقی خود را سریع و دقیق حل کنید.

✨ ویژگی‌های دادبات:
✔️ پاسخ فوری به سوالات حقوقی
✔️ جستجوی هوشمند تمام قوانین ایران
✔️ تنظیم آنلاین و آسان انواع مستندات حقوقی
✔️ تحلیل دقیق آرا و دادنامه‌ها
✔️ پیش‌بینی نتیجه احتمالی پرونده‌های شما

🎁 هدیه ثبت‌نام: ۲۵ هزار توکن رایگان! (فرصت محدود)

📌 با دادبات، هوش مصنوعی پیشرفته دادلاین، خدمات حقوقی را ساده، سریع و دقیق تجربه کنید.
🔗 همین حالا ثبت‌نام کنید و از این امکانات ویژه بهره‌مند شوید.
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/05/IMG_20250518_113607_995.jpg',
                            'id' => '3348',
                            'width' => '1080',
                            'height' => '1072',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/05/IMG_20250518_113607_995-150x150.jpg',
                            'alt' => '',
                            'title' => 'IMG_20250518_113607_995',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net',
                        'flex_size' => '4',
                    ],
                    '3' => [
                        'advertisement_title' => 'سامانه هوشمند خدمات حقوقی دادلاین',
                        'advertisement_text' => '💎 دادلاین | عدالت برای همه
🚀 دستیار هوشمند حقوقی شما

🌟 با دادلاین، همیشه و همه‌جا به خدمات حقوقی تخصصی دسترسی داشته باشید.

✅ مشاوره آنلاین ۲۴ ساعته (متنی و تلفنی)
✅ وکلای پایه یک، کارشناسان رسمی و قضات بازنشسته
✅ عقد و امضای امن و قانونی قراردادها به صورت آنلاین
✅ دسترسی سریع و ساده به خدمات و اطلاعات حقوقی

💼 همین حالا به دادلاین بپیوندید و مشکلات حقوقی خود را هوشمندانه حل کنید!
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/01/dadline-lawyer-expert.jpg',
                            'id' => '2057',
                            'width' => '1200',
                            'height' => '628',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/01/dadline-lawyer-expert-150x150.jpg',
                            'alt' => '',
                            'title' => 'dadline-lawyer-expert',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net',
                        'flex_size' => '4',
                    ],
                    '4' => [
                        'advertisement_title' => 'عقد قرارداد الکترونیکی + امضا',
                        'advertisement_text' => '💎 عقد قرارداد آنلاین با دادلاین
🖋 سریع، امن، قانونی

🌟 دیگر نیازی به مراجعه حضوری نیست! با دادلاین، قراردادهای خود را در هر زمان و مکان آنلاین تنظیم و امضا کنید.

✅ قراردادهای آماده و معتبر، تهیه‌شده توسط وکلای حرفه‌ای
✅ امکان وارد کردن متن دلخواه و شخصی‌سازی قرارداد
✅ احراز هویت و امضای الکترونیک قانونی
✅ ذخیره نسخه نهایی به‌صورت امن و قابل استعلام

📌 فقط در ۳ مرحله:
1️⃣ متن قرارداد را بنویسید یا انتخاب کنید
2️⃣ طرفین قرارداد را وارد کنید
3️⃣ آنلاین امضا و نهایی کنید

💼 همین حالا اولین قرارداد آنلاین خود را ثبت کنید:
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/02/dadline-sign.jpg',
                            'id' => '2388',
                            'width' => '800',
                            'height' => '600',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/02/dadline-sign-150x150.jpg',
                            'alt' => 'امضای آنلاین قرارداد',
                            'title' => 'امضای آنلاین قرارداد',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net/contracts',
                        'flex_size' => '4',
                    ],
                    '5' => [
                        'advertisement_title' => 'سوال حقوقی بپرسید',
                        'advertisement_text' => '❓ سوال حقوقی دارید؟
💬 پاسخ دقیق و تخصصی از وکلای دادلاین

🌟 هر سوالی دارید، از وکلای مجرب، قضات بازنشسته و کارشناسان رسمی ما بپرسید و پاسخ مطمئن بگیرید.

✅ پاسخ‌دهی توسط ده‌ها وکیل حرفه‌ای
✅ امکان ثبت سوال به صورت محرمانه و ناشناس
✅ دسترسی به آرشیو سوالات و پاسخ‌های مشابه

📌 همین حالا سوال حقوقی خود را ثبت کنید و پاسخ تخصصی بگیرید 👇
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/03/dadline-questions.jpg',
                            'id' => '3115',
                            'width' => '1200',
                            'height' => '770',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/03/dadline-questions-150x150.jpg',
                            'alt' => 'پرسش و پاسخ حقوقی آنلاین',
                            'title' => 'پرسش و پاسخ حقوقی آنلاین',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net/questions',
                        'flex_size' => '4',
                    ],
                    '6' => [
                        'advertisement_title' => 'سرویس وکیل مشاور',
                        'advertisement_text' => '🚨 برای اولین بار در ایران
💎 وکیل آنلاین اختصاصی خود را داشته باشید

🌟 با سرویس «وکیل مشاور» دادلاین، در هر ساعت از شبانه‌روز می‌توانید به صورت متنی یا تلفنی با وکیل اختصاصی‌تان در ارتباط باشید و پاسخ همه سوالات حقوقی خود را بگیرید.

✅ انتخاب از بین بهترین وکلا و کارشناسان حقوقی ایران
✅ امکان جستجو بر اساس تخصص، سابقه، امتیاز مشتریان و تجربه کاری
✅ مشاوره ۲۴ ساعته، سریع، مطمئن و محرمانه

📌 همین حالا وکیل اختصاصی خود را انتخاب کنید 👇
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/03/vakil-moshaver-2.jpg',
                            'id' => '3118',
                            'width' => '1683',
                            'height' => '1080',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/03/vakil-moshaver-2-150x150.jpg',
                            'alt' => 'وکیل آنلاین',
                            'title' => 'وکیل آنلاین',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net/my-lawyer',
                        'flex_size' => '4',
                    ],
                    '7' => [
                        'advertisement_title' => 'نرم افزار مدیریت دفتر وکالت',
                        'advertisement_text' => '🚨 نرم افزار مدیریت دفتر وکالت دادلاین راه اندازی شد

🌺 وکلای محترم ایران زمین
🔉 با دادلاین، مدیریت پرونده‌ها، موکلین، جلسات، مستندات و حسابداری دفتر وکالت خود را به ساده‌ترین و امن‌ترین شکل ممکن تجربه کنید.

✨ ویژگی‌های کلیدی:

🔸مدیریت کامل پرونده‌ها و تقویم حقوقی + سیستم یادآوری
🔸دستیار هوش مصنوعی برای تولید لایحه، دادخواست و ...
🔸دسترسی به آرشیو جامع قوانین و سایر مستندات حقوقی
🔸سیستم حسابداری، صدور و پرداخت فاکتور
🔸امضای قرارداد آنلاین با احراز هویت
🔸ثبت و پیگیری دقیق عملکرد بر حسب ساعت
🔸ارتباط مستقیم و امن با موکلین
🔸امنیت داده‌ها با سرورهای امن و رمزگذاری چندلایه

📱 نسخه ویندوز، موبایل و وب برای دسترسی آسان در هر زمان

🚀 فقط در ۳ گام ساده:
1️⃣ ثبت نام با شماره موبایل
2️⃣ ثبت درخواست همکاری
3️⃣ فعال‌سازی نرم‌افزار و شروع کار

🚨 اشتراک رایگان با دسترسی به تمامی امکانات
➕ اشتراک ویژه برای دسترسی نامحدود به نرم افزار
🎁  14 روز اشتراک ویژه رایگان
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/08/نرم-افزار-مدیریت-دفتر-وکالت-دادلاین.jpg',
                            'id' => '3872',
                            'width' => '1200',
                            'height' => '630',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/08/نرم-افزار-مدیریت-دفتر-وکالت-دادلاین-150x150.jpg',
                            'alt' => 'نرم افزار مدیریت دفتر وکالت دادلاین',
                            'title' => 'نرم افزار مدیریت دفتر وکالت دادلاین',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net/law-office-management-ai-cloud',
                        'flex_size' => '4',
                    ],
                    '8' => [
                        'advertisement_title' => 'همکاری بین وکلا',
                        'advertisement_text' => '✅ 🤝 همکاری بین وکلا در سراسر کشور
🌐 وکالت را بدون مرز تجربه کنید!

📌 برای اولین بار در ایران، دادلاین امکانی فراهم کرده است که وکلا بتوانند بخشی از کارها و امور پرونده‌های خود را به همکارانشان در دیگر شهرها و استان‌ها بسپارند.

🌟 ویژگی‌های این سرویس:
✅ ارتباط مستقیم، شفاف و سریع بین وکلا
✅ توافق و قرارداد آنلاین در بستر امن دادلاین
✅ دسترسی به شبکه‌ای گسترده از وکلای معتبر در سراسر ایران
✅ مدیریت، پیگیری و ثبت مراحل همکاری در پنل اختصاصی

💼 از همین امروز همکاری حقوقی خود را گسترش دهید 👇
🔗 لینک به سرویس همکاری بین وکلا
',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/07/VOKALA.jpg',
                            'id' => '3621',
                            'width' => '1536',
                            'height' => '1024',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/07/VOKALA-150x150.jpg',
                            'alt' => '',
                            'title' => 'VOKALA',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net/start',
                        'flex_size' => '4',
                    ],
                    '9' => [
                        'advertisement_title' => 'استوری سرویس وکیل مشاور',
                        'advertisement_text' => '',
                        'advertisement_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/03/vakil-moshaver.jpg',
                            'id' => '3117',
                            'width' => '1080',
                            'height' => '1920',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/03/vakil-moshaver-150x150.jpg',
                            'alt' => '',
                            'title' => 'vakil-moshaver',
                            'description' => '',
                        ],
                        'advertisement_link' => 'https://dadline.net/my-lawyer',
                        'flex_size' => '3',
                    ],
                ],
            ],
            'dadline_slides' => [
                'group' => 'content',
                'value' => [
                    '0' => [
                        'slide_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/04/get-lawyer.webp',
                            'id' => '3308',
                            'width' => '1110',
                            'height' => '350',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/04/get-lawyer-150x150.webp',
                            'alt' => 'وکیل دادلاین',
                            'title' => 'وکیل دادلاین',
                            'description' => '',
                        ],
                        'slide_link' => 'https://dadline.net/pishkhan/?tab=my-lawyer&amp;mode=new',
                        'slide_user_type' => 'user',
                    ],
                    '1' => [
                        'slide_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/11/dadline-story.webp',
                            'id' => '4274',
                            'width' => '1110',
                            'height' => '350',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/11/dadline-story-150x150.webp',
                            'alt' => 'تجربه قضایی',
                            'title' => 'تجربه قضایی',
                            'description' => '',
                        ],
                        'slide_link' => 'https://dadline.net/pishkhan/?tab=story',
                        'slide_user_type' => 'both',
                    ],
                    '2' => [
                        'slide_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/05/dadbot.webp',
                            'id' => '3349',
                            'width' => '1110',
                            'height' => '350',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/05/dadbot-150x150.webp',
                            'alt' => '',
                            'title' => 'dadbot',
                            'description' => '',
                        ],
                        'slide_link' => 'https://dadline.net/pishkhan/?tab=dadbot',
                        'slide_user_type' => 'both',
                    ],
                    '3' => [
                        'slide_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/09/contracts.jpg',
                            'id' => '4041',
                            'width' => '1110',
                            'height' => '350',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/09/contracts-150x150.jpg',
                            'alt' => 'قراداد آنلاین',
                            'title' => 'contracts',
                            'description' => '',
                        ],
                        'slide_link' => 'https://dadline.net/pishkhan/?tab=new-contract',
                        'slide_user_type' => 'both',
                    ],
                    '4' => [
                        'slide_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/05/adodb.webp',
                            'id' => '3350',
                            'width' => '1110',
                            'height' => '350',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/05/adodb-150x150.webp',
                            'alt' => '',
                            'title' => 'adodb',
                            'description' => '',
                        ],
                        'slide_link' => 'https://dadline.net/pishkhan/?tab=adodb',
                        'slide_user_type' => 'both',
                    ],
                    '5' => [
                        'slide_image' => [
                            'url' => 'https://dadline.net/wp-content/uploads/2025/04/safir-dadline.webp',
                            'id' => '3309',
                            'width' => '1110',
                            'height' => '350',
                            'thumbnail' => 'https://dadline.net/wp-content/uploads/2025/04/safir-dadline-150x150.webp',
                            'alt' => 'همکاری در فروش دادلاین',
                            'title' => 'بازاریابی دادلاین',
                            'description' => '',
                        ],
                        'slide_link' => 'https://dadline.net/pishkhan/?tab=affiliate',
                        'slide_user_type' => 'both',
                    ],
                ],
            ],
            'dad_ai_title_genarator_model' => [
                'group' => 'ai',
                'value' => 'gapgpt-qwen-3.6',
            ],
            'dad_ai_melliNet_model' => [
                'group' => 'ai',
                'value' => 'gpt-5-mini',
            ],
            'register_gift_token' => [
                'group' => 'ai',
                'value' => '3000',
            ],
            'subscription_monthly_token' => [
                'group' => 'ai',
                'value' => '20000',
            ],
            'answer_gift_token' => [
                'group' => 'ai',
                'value' => '1000',
            ],
            'ai_analysis_price' => [
                'group' => 'ai',
                'value' => '16500',
            ],
            'ai_rewrite_price' => [
                'group' => 'ai',
                'value' => '55000',
            ],
            'dad_contract_analysis_model' => [
                'group' => 'ai',
                'value' => 'gpt-5.1',
            ],
            'dad_system_contract_analysis_messages' => [
                'group' => 'ai',
                'value' => 'You are an Iranian legal lawyer with practical experience in Iranian contract law.
Analyze the following contract as if you were advising a real client.
Provide the analysis you want to receive as a client — honest, fair, practical, and useful.

Rules:
- Be completely honest
- If the contract is good and balanced, clearly say so
- Only report REAL and IMPORTANT legal issues
- Do NOT invent or exaggerate risks
- Do NOT give generic legal theory
- Focus on enforceability, risk, ambiguity, missing clauses, and unfair obligations
- Empty arrays are acceptable if there are no issues

Limits:
- List a maximum of 10 items in "weaknesses"
- List a maximum of 10 items in "suggestions"
- If fewer than 10 real issues exist, list only the necessary ones
- Do NOT force filling all 10 items

Special rule:
- If the contract title or main text is so incomplete, vague, or fragmentary that meaningful legal analysis or AI-based rewriting is NOT possible, set:
  is_rewritable = false
  (even if there are problems)

Rewriting rule:
- Set is_rewritable = false if the contract is already good and does not need rewriting
- Set is_rewritable = true only if the contract is analyzable AND can realistically be improved by rewriting

Output ONLY JSON in the exact format below and ONLY in Persian language.
Do NOT add any explanation outside JSON.

Exact output format:
{
  "summary": "تحلیل صادقانه و خلاصه قرارداد به زبان ساده",
  "weaknesses": [
    "فقط ایرادات حقوقی واقعی و مهم (حداکثر ۱۰ مورد)"
  ],
  "suggestions": [
    "پیشنهادهای عملی و قابل اجرا در صورت نیاز (حداکثر ۱۰ مورد)"
  ],
  "is_rewritable": true/false
}',
            ],
            'dad_system_contract_rewrite_messages' => [
                'group' => 'ai',
                'value' => 'You are an Iranian legal lawyer and professional contract drafter with expertise in Iranian law.
Task: Rewrite and improve a contract based on the provided analysis of weaknesses and suggestions.

Input: A JSON object containing:
contract_title (the contract title)
contract_text (the original contract text)
weaknesses (an array of identified weaknesses)
suggestions (an array of proposed improvements)

Your responsibilities:
Rewrite and improve the contract so that all listed weaknesses and suggestions are addressed.
Make changes by adding, removing, or modifying specific clauses, clarifying obligations, and filling or removing any placeholders.
Preserve the original intent and economic balance between the parties. Do not introduce unrelated obligations or risks.
Ensure the contract complies with Iranian law and standard contract drafting conventions.
The output must be a complete, ready-to-sign contract in Persian and HTML format.

Formatting and structural requirements:
Use sequential numbering for articles: <h4>ماده ۱</h4>, <h4>ماده ۲</h4>, etc.
Use <h5> for sub-articles or تبصره where necessary.
Use <strong> for important legal terms or definitions.
Do not repeat the contract title in the body of the contract.
Do not include signature blocks.

Special requirement – Electronic signature validity:
If the contract does not already contain a clause about the legal validity of electronic signatures, add it as the last article of the contract as follows:
<h4>ماده X: اعتبار قرارداد</h4>
قرارداد حاضر به‌صورت الکترونیکی از طریق سامانه دادلاین میان طرفین ایجاد، مشاهده و پس از احراز هویت با استفاده از امضای الکترونیکی تایید گردیده است و مطابق با ماده ۱۰ قانون مدنی، و همچنین ماده‌های ۶، ۷ و ۱۰ قانون تجارت الکترونیکی مصوب سال ۱۳۸۲، دارای اعتبار قانونی و رسمی است.

Additional rules:
The rewritten contract must be complete, consistent, and legally enforceable.
Explicitly address all weaknesses and suggestions in the text.
Do not include any explanations, analysis, or comments outside of the contract.
Output only the final contract text in Persian.

Output:
A fully rewritten contract , ready for execution, in Persian, incorporating all improvements and the electronic signature validity clause as the last article if not already present.',
            ],
            'token_packages' => [
                'group' => 'ai',
                'value' => [
                    '0' => [
                        'package_name' => 'پایه',
                        'amount' => '5000',
                        'price' => '28600',
                        'icon' => 'sparkles',
                        'color' => 'primary',
                    ],
                    '1' => [
                        'package_name' => 'پرطرفدار',
                        'amount' => '50000',
                        'price' => '198000',
                        'icon' => 'star',
                        'color' => 'success',
                    ],
                    '2' => [
                        'package_name' => 'اقتصادی',
                        'amount' => '500000',
                        'price' => '1690000',
                        'icon' => 'comet',
                        'color' => 'danger',
                    ],
                ],
            ],
            'ai_service_types' => [
                'group' => 'ai',
                'value' => [
                    '0' => [
                        'service_name' => 'سوال حقوقی',
                        'service_type' => 'legal_question',
                        'user_type' => 'all',
                        'ai_model' => 'gpt-5.1',
                        'system_role' => 'You are an empathetic and compassionate Iranian legal assistant. Respond like a lawyer who understands the user\'s situation. Responses must be formal, precise, and fluent, based on Iranian laws.

- If the user asks a purely legal question or issue: answer in maximum 5 sentences.
- If the user describes a dispute: first suggest non-judicial solutions (negotiation, mediation, counseling, official warning letter, etc.) in a helpful tone, then judicial steps with legal article references. Answer in maximum 10 sentences.
- If the user mentions a court decision or an ongoing case: guide the next steps with reassurance.

No personal judgments. No dry or robotic language. Be respectful and kind.
**Never ask the user for more information. Always provide a complete, final answer based on what the user has already provided.**',
                        'max_tokens' => '2000',
                        'temperature' => '0.1',
                        'top_p' => '1.0',
                        'presence_penalty' => '0.0',
                        'frequency_penalty' => '0.0',
                        'ti_icon' => 'sparkles',
                        'description' => 'پاسخ به پرسش های حقوقی و قضایی شما بر اساس قوانین و مقررات ایران',
                        'button_text' => 'شروع گفتگو',
                    ],
                    '1' => [
                        'service_name' => 'جستجوی قوانین',
                        'service_type' => 'law_search',
                        'user_type' => 'all',
                        'ai_model' => 'gpt-5.2',
                        'system_role' => 'You are a specialized attorney in Iranian law. Provide only the relevant legal provisions, including articles, notes, unified judicial precedents, and advisory opinions related to the asked topic, without any interpretation, explanation, or additional analysis. If there is no relevant content, respond only with the following sentence in Persian:  
"متاسفانه موردی یافت نشد، جهت کسب اطلاعات بیشتر سوال خود را از کارشناسان دادلاین بپرسید."  
Provide the entire response in Persian (Farsi).
',
                        'max_tokens' => '7000',
                        'temperature' => '0.2',
                        'top_p' => '1.0',
                        'presence_penalty' => '0.0',
                        'frequency_penalty' => '0.0',
                        'ti_icon' => 'search',
                        'description' => 'یافتن قوانین، نظریه های مشورتی، رای های صادره و مقررات مرتبط با موضوع حقوقی شما',
                        'button_text' => 'شروع جستجو',
                    ],
                    '2' => [
                        'service_name' => 'تنظیم قرارداد',
                        'service_type' => 'contract_draft',
                        'user_type' => 'all',
                        'ai_model' => 'gpt-5-mini',
                        'system_role' => 'You are a professional attorney specialized in Iranian law at dadline.net, with full mastery of Civil Law, Commercial Law, Labor Law, Civil Procedure Code, and specific laws such as the Electronic Commerce Act, Tax Law, Consumer Protection Law, Insurance Law, etc. Based on the information provided by the user—including parties, obligations, duration, amount, guarantees, and other requirements—draft a valid, complete, precise, and enforceable contract under Iranian law.

The contract must:

1. Include numbered articles and, if necessary, notes (sub-articles);
2. Be written in standard legal and formal language;
3. Avoid non-legal, colloquial, or ambiguous terms;
4. Determine the type of contract (employment, partnership, sale, lease, investment, NDA, etc.) based on the user\'s input;
5. Contain obligations, termination clauses, enforcement mechanisms, dispute resolution, contract duration, and all other legal requirements;
6. Include the following optional article at the end of the contract (inform the user that this clause is optional):

"قرارداد حاضر به‌صورت الکترونیکی از طریق سامانه دادلاین میان طرفین ایجاد، مشاهده و پس از احراز هویت با استفاده از امضای الکترونیکی تایید گردیده است و مطابق با ماده ۱۰ قانون مدنی، و همچنین مواد ۶، ۷ و ۱۰ قانون تجارت الکترونیکی مصوب سال ۱۳۸۲، دارای اعتبار قانونی و رسمی است."

Provide the contract text only in Persian (Farsi), strictly in the format of numbered articles, without any additional explanation or commentary.',
                        'max_tokens' => '10000',
                        'temperature' => '0.3',
                        'top_p' => '0.9',
                        'presence_penalty' => '0.2',
                        'frequency_penalty' => '0.2',
                        'ti_icon' => 'signature',
                        'description' => 'تنظیم قراردادهای حقوقی با در نظر گرفتن تمام جوانب قانونی و منافع طرفین',
                        'button_text' => 'تنظیم قرارداد',
                    ],
                    '3' => [
                        'service_name' => 'تنظیم مستند حقوقی',
                        'service_type' => 'document_draft',
                        'user_type' => 'all',
                        'ai_model' => 'gpt-5-mini',
                        'system_role' => 'You are a professional and specialized attorney in Iranian law at dadline.net. Your duty is to draft legal documents such as petitions, complaints, motions, or other judicial documents based strictly on the information provided by the user.

The documents must include:

1. Numbered paragraphs or articles where necessary;
2. Precise legal reasoning supported by Civil Law, Civil Procedure Code, specific laws, and relevant advisory opinions;
3. Complete statement of the subject, demands, reasons, and evidence;
4. Compliance with the formal and administrative structure of the judiciary (such as introduction, statement of claim, reasons, evidence, conclusion);
5. Absence of informal language or colloquial expressions;
6. Written in a standard format suitable for submission to judicial authorities.

User inputs include: type of document (petition, complaint, objection, appeal, etc.), subject, parties, demands, reasons, evidence, judicial authority, and special case notes.

Based on this information, provide a complete and precise legal document text only in Persian (Farsi), strictly in the form of numbered paragraphs or articles, without any additional explanation.',
                        'max_tokens' => '10000',
                        'temperature' => '0.2',
                        'top_p' => '1.0',
                        'presence_penalty' => '0.1',
                        'frequency_penalty' => '0.1',
                        'ti_icon' => 'files',
                        'description' => 'تنظیم انواع مستندات حقوقی با در نظر گرفتن تمام جوانب قانونی',
                        'button_text' => 'شروع تنظیم مستند',
                    ],
                    '4' => [
                        'service_name' => 'تحلیل رای / دادنامه',
                        'service_type' => 'analysis_verdict',
                        'user_type' => 'all',
                        'ai_model' => 'gpt-5.2',
                        'system_role' => 'You are a specialized attorney in Iranian law at dadline.net. Based on the full text of a court judgment or decree provided, prepare a comprehensive and simple legal analysis in Persian (Farsi) that is understandable for a general audience.

The analysis must include:

1. A very brief summary of the case subject and the court’s decision;
2. Explanation of the court’s legal reasoning and arguments in simple language;
3. Reference to relevant legal articles and principles related to the judgment;
4. Examination of the strengths and weaknesses of the issued judgment;
5. Presentation of possible legal options and recommendations for next steps (such as appeal, cassation, enforcement, request for correction) according to the law;
6. Written in a way that non-legal readers can understand the case and their available options.

User inputs include the full text of the judgment (or image in Persian), the user’s request about the type of legal options (e.g., appeal, cassation, enforcement), and any specific case details.

Provide the analysis text only in Persian (Farsi) without any additional explanation.',
                        'max_tokens' => '7000',
                        'temperature' => '0.1',
                        'top_p' => '1.0',
                        'presence_penalty' => '0.0',
                        'frequency_penalty' => '0.0',
                        'ti_icon' => 'vector-bezier-arc',
                        'description' => 'تحلیل رای دادگاه بر اساس قوانین ایران به کمک برترین مدل استدلالی حقوقی',
                        'button_text' => 'تحلیل رای',
                    ],
                    '5' => [
                        'service_name' => 'پیش بینی نتیجه پرونده',
                        'service_type' => 'predicting_case',
                        'user_type' => 'all',
                        'ai_model' => 'gpt-5.2',
                        'system_role' => 'You are a judge specialized in Iranian law at dadline.net, fully versed in Civil, Criminal, Procedural laws, and judicial precedents. Based on the user\'s explanation regarding the case subject, evidence, type of lawsuit, and parties’ conditions, provide a precise and logical prediction of the likely judgment or outcome.

The prediction must include:

1. A brief summary of the case subject and conditions;
2. Legal analysis with reference to relevant laws;
3. Prediction of the probable judgment or outcome with estimated chances of success for each option (e.g., 70% chance of success on objection);
4. Strengths and weaknesses of the case from the court’s perspective;
5. Legal recommendations to strengthen the case or subsequent actions;
6. Written in simple language understandable by non-legal audiences.

User inputs include: type of case (civil, criminal, administrative, etc.), case description, parties, evidence, stage of litigation, and user’s request for prediction.

Provide the prediction text only in Persian (Farsi) without any additional explanation, in a standard and legally referable format.',
                        'max_tokens' => '8000',
                        'temperature' => '0.4',
                        'top_p' => '0.9',
                        'presence_penalty' => '0.0',
                        'frequency_penalty' => '0.0',
                        'ti_icon' => 'gavel',
                        'description' => 'پیش بینی نتیجه انواع پرونده های حقوقی و کیفری با تکیه بر منابع حقوقی موجود',
                        'button_text' => 'شروع بررسی',
                    ],
                    '6' => [
                        'service_name' => 'سوال چند گزینه‌ای',
                        'service_type' => 'mcq',
                        'user_type' => 'expert',
                        'ai_model' => 'gpt-5.2',
                        'system_role' => 'You are an expert Iranian legal assistant specializing in Iranian law. You are given a legal question with 4 options.

Your task:
1. First, write a short, precise, and professional legal explanation of why you chose that option.
2. At the end of your response, you MUST include this exact format: پاسخ نهایی: [option number]

Important rules:
- If you are NOT confident (less than 80%) about the correct answer, do NOT output any number. Instead, only output: "نمی‌دانم"
- Option number must be between 1 and 4.
- The exact phrase "پاسخ نهایی: " must be written with a space and colon exactly as shown.
- After the colon, put a space, then the number.
- Your response must be professional and based on Iranian laws.
- Do NOT write anything after the final number.

Correct answer example:
طبق ماده 15 قانون مدنی، بیع نسبت به مستأجر بی‌اثر است و مستأجر حق دارد تا پایان مدت اجاره در ملک باقی بماند.
پاسخ نهایی: 2

Your response must be in Persian (Farsi).',
                        'max_tokens' => '2000',
                        'temperature' => '0.0',
                        'top_p' => '1.0',
                        'presence_penalty' => '0.0',
                        'frequency_penalty' => '0.0',
                        'ti_icon' => 'progress-help',
                        'description' => 'انتخاب و ارسال گزینه صحیح به سوالات چندگزینه ای حقوقی شما',
                        'button_text' => 'سوال بپرس',
                    ],
                ],
            ],
            'case_ai_services' => [
                'group' => 'ai',
                'value' => [
                    '0' => [
                        'case_service_name' => 'تنظیم مستند',
                        'case_service_type' => 'legal_documents',
                        'case_ai_model' => 'gpt-4o-mini',
                        'case_system_role' => 'شما یک دستیار هوشمند هستید که تحلیل دقیق پرونده‌های حقوقی را با توجه به قوانین جاری انجام می‌دهید.',
                        'case_max_tokens' => '3000',
                        'case_temperature' => '0.3',
                        'case_top_p' => '1',
                        'case_presence_penalty' => '0',
                        'case_frequency_penalty' => '0',
                    ],
                    '1' => [
                        'case_service_name' => 'خلاصه سازی',
                        'case_service_type' => 'summary',
                        'case_ai_model' => 'gpt-5',
                        'case_system_role' => 'You are a professional lawyer who must prepare an accurate and concise summary of a legal case. The case information includes general details, case status, parties involved, key points, and evidence.
Your task is to write a clear, professional, very concise, precise, and easy-to-understand summary based on the provided information. The summary should clearly explain the case briefly and highlight the key points. It should be understandable to non-legal readers.
The summary must include:
- A brief description of the case
- Important legal points
- Current status of the case
- Short recommendations for next steps
The case information is provided in JSON format.
Please provide the summary in Persian (Farsi) in well-structured paragraphs.',
                        'case_max_tokens' => '5000',
                        'case_temperature' => '0.7',
                        'case_top_p' => '1',
                        'case_presence_penalty' => '0',
                        'case_frequency_penalty' => '0',
                    ],
                    '2' => [
                        'case_service_name' => 'پیشنهاد وظایف',
                        'case_service_type' => 'task_management',
                        'case_ai_model' => 'gpt-5-mini',
                        'case_system_role' => 'You are an expert lawyer with a first-class license. You will receive structured case information in Persian.
Your task is to generate a maximum of 5 tasks in JSON format as follows:
[
  {
    "عنوان": "task title",
    "توضیحات": "short description of the task",
    "مهلت": "YYYY-MM-DD HH:mm"
  },
  ...
]

The output must be only this JSON array, no extra text or explanation.
If no actionable tasks are found, return an empty array [].',
                        'case_max_tokens' => '3000',
                        'case_temperature' => '0.5',
                        'case_top_p' => '0.9',
                        'case_presence_penalty' => '0.3',
                        'case_frequency_penalty' => '0.3',
                    ],
                    '3' => [
                        'case_service_name' => 'جستجوی قوانین',
                        'case_service_type' => 'law_research',
                        'case_ai_model' => 'gpt-5',
                        'case_system_role' => 'You are an expert Iranian law attorney. Provide only the relevant legal articles, clauses, precedent rulings, and consultative opinions related to the given topic without any additional interpretation, explanation, or analysis. Respond once with a single message containing the most pertinent legal references. Do not ask any follow-up questions. Provide the response in Persian (Farsi).

The case information is provided in JSON format.',
                        'case_max_tokens' => '5000',
                        'case_temperature' => '0.3',
                        'case_top_p' => '1',
                        'case_presence_penalty' => '0',
                        'case_frequency_penalty' => '0.3',
                    ],
                    '4' => [
                        'case_service_name' => 'استراتژی حقوقی',
                        'case_service_type' => 'legal_strategy',
                        'case_ai_model' => 'gpt-5',
                        'case_system_role' => 'You are a licensed attorney with expertise in Iranian law. You have received structured legal case information in JSON format.

Based on this information, your task is to provide an appropriate legal strategy for pursuing or defending the case. The strategy should include:

- Key points useful for defense or claim
- Suggested legal pathway (based on law, precedents, or practical experience)
- Recommended type of petition or legal document
- Warnings or potential risks

Provide the strategy in a professional and precise tone, in a few concise paragraphs. Keep the strategy as brief and focused as possible.

Please provide the response in Persian (Farsi).',
                        'case_max_tokens' => '5000',
                        'case_temperature' => '0.5',
                        'case_top_p' => '1',
                        'case_presence_penalty' => '0',
                        'case_frequency_penalty' => '0.2',
                    ],
                    '5' => [
                        'case_service_name' => 'پیش بینی نتیجه',
                        'case_service_type' => 'result_prediction',
                        'case_ai_model' => 'gpt-5',
                        'case_system_role' => 'You are a judge in Iran. Based on the provided case information in JSON format, issue a verdict similar to rulings previously issued in the Iranian judicial system.

Provide a concise summary in Persian (Farsi), including key points grounded in Iranian legal principles, precedent rulings, and consultative opinions.

The response should reflect the perspective and tone of an Iranian judge.',
                        'case_max_tokens' => '5000',
                        'case_temperature' => '0.3',
                        'case_top_p' => '1',
                        'case_presence_penalty' => '0',
                        'case_frequency_penalty' => '0',
                    ],
                ],
            ],
            'dadbot_ai_models' => [
                'group' => 'ai',
                'value' => [
                    '0' => [
                        'model_name' => 'وکیل خبره',
                        'model_type' => 'lawyer_expert',
                        'model_ai' => 'gpt-5',
                    ],
                    '1' => [
                        'model_name' => 'وکیل متخصص',
                        'model_type' => 'lawyer_specialist',
                        'model_ai' => 'gpt-5-mini',
                    ],
                    '2' => [
                        'model_name' => 'وکیل کارشناس',
                        'model_type' => 'lawyer_expert',
                        'model_ai' => 'gpt-4.1',
                    ],
                    '3' => [
                        'model_name' => 'دانشجوی وکالت',
                        'model_type' => 'law_student',
                        'model_ai' => 'gpt-4.1-mini',
                    ],
                ],
            ],
        ];

        foreach ($options as $key => $option) {
            Option::set($key, $option['value'], $option['group']);
        }
    }
}
