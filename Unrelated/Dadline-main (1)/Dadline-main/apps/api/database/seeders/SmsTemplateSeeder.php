<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SmsTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $legacyPatterns = [
            'send_otp' => ['melipayamak' => ['id' => '315973'], 'adly' => ['id' => '1209']],
            'submit_new_message' => ['melipayamak' => ['id' => '375458'], 'adly' => ['id' => '1210']],
            'contract_invite_code' => ['melipayamak' => ['id' => '394944'], 'adly' => ['id' => '1211']],
            'contract_sign_code' => ['melipayamak' => ['id' => '394946'], 'adly' => ['id' => '1212']],
            'contract_final_view' => ['melipayamak' => ['id' => '394945'], 'adly' => ['id' => '1213']],
            'case_offer_code' => ['melipayamak' => ['id' => '274359'], 'adly' => ['id' => '1214']],
            'case_accept_offer' => ['melipayamak' => ['id' => '275219'], 'adly' => ['id' => '1215']],
            'accept_lawlink_offer' => ['melipayamak' => ['id' => '315178'], 'adly' => ['id' => '1216']],
            'send_confirm_lawlink' => ['melipayamak' => ['id' => '315468'], 'adly' => ['id' => '1217']],
            'case_final_code' => ['melipayamak' => ['id' => '274365'], 'adly' => ['id' => '1218']],
            'buy_vip_case' => ['melipayamak' => ['id' => '299136'], 'adly' => ['id' => '1219']],
            'doc_offer_code' => ['melipayamak' => ['id' => '299122'], 'adly' => ['id' => '1220']],
            'buy_vip_doc' => ['melipayamak' => ['id' => '299138'], 'adly' => ['id' => '1221']],
            'doc_accept_offer' => ['melipayamak' => ['id' => '374951'], 'adly' => ['id' => '1222']],
            'doc_final_code' => ['melipayamak' => ['id' => '299117'], 'adly' => ['id' => '1223']],
            'confirm_vendor' => ['melipayamak' => ['id' => '299125'], 'adly' => ['id' => '1224']],
            'buy_vip_call' => ['melipayamak' => ['id' => '299130'], 'adly' => ['id' => '1225']],
            'add_dadcoin_in_sub' => ['melipayamak' => ['id' => '299132'], 'adly' => ['id' => '1226']],
            'submit_answer_on_question' => ['melipayamak' => ['id' => '434395'], 'adly' => ['id' => '1428']],
            'accept_call_counseling' => ['melipayamak' => ['id' => '299134'], 'adly' => ['id' => '1228']],
            'call_done_counseling' => ['melipayamak' => ['id' => '299135'], 'adly' => ['id' => '1229']],
            'send_call_on_sub' => ['melipayamak' => ['id' => '299137'], 'adly' => ['id' => '1230']],
            'send_text_by_user' => ['melipayamak' => ['id' => '373072'], 'adly' => ['id' => '1231']],
            'send_text_by_vendor' => ['melipayamak' => ['id' => '373073'], 'adly' => ['id' => '1232']],
            'new_answer_on_ticket' => ['melipayamak' => ['id' => '413777'], 'adly' => ['id' => '1342']],
            'create_new_user' => ['melipayamak' => ['id' => '344133'], 'adly' => ['id' => '1234']],
            'case_send_reminders' => ['melipayamak' => ['id' => '344822'], 'adly' => ['id' => '1235']],
            'send_call_notification_to_vendor' => ['melipayamak' => ['id' => '375633'], 'adly' => ['id' => '1236']],
            'send_case_notification_to_vendor' => ['melipayamak' => ['id' => '375634'], 'adly' => ['id' => '1237']],
            'send_doc_notification_to_vendor' => ['melipayamak' => ['id' => '375635'], 'adly' => ['id' => '1238']],
            'send_lawlink_notification_to_vendor' => ['melipayamak' => ['id' => '375636'], 'adly' => ['id' => '1239']],
        ];

        $templates = [
            [
                'key' => 'send_otp',
                'title' => 'ارسال کد تایید',
                'content' => 'code : {code} کد تایید دادلاین @dadline.net #{code}',
                'variables' => ['code'],
                'patterns' => [
                    'melipayamak' => [
                        'id' => null,
                    ],
                    'adly' => [
                        'id' => null,
                    ],
                ],
            ],

            [
                'key' => 'submit_new_message',
                'title' => 'ثبت پیام جدید',
                'content' => 'سلام، پیام جدیدی در {context} ثبت شد. dadline.net',
                'variables' => [
                    'context',
                ],
                'patterns' => [
                    'melipayamak' => [
                        'id' => null,
                    ],
                    'adly' => [
                        'id' => null,
                    ],
                ],
            ],

            [
                'key' => 'contract_invite_code',
                'title' => 'دعوت نامه پذیرش قرارداد',
                'content' => '{name} گرامی، با سلام، کد دعوت: {code} احتراما قرارداد/سند جدیدی به طرفیت شما در سامانه دادلاین ثبت شد؛ لطفا برای مشاهده و امضاء از طریق لینک زیر اقدام کنید: dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'code',
                ],
                'patterns' => [
                    'melipayamak' => [
                        'id' => null,
                    ],
                    'adly' => [
                        'id' => null,
                    ],
                ],
            ],

            [
                'key' => 'contract_sign_code',
                'title' => 'کد تایید امضا قرارداد دادلاین',
                'content' => '{name} گرامی، کد تایید: {code} جهت امضاء قرارداد/سند، در سامانه دادلاین کد فوق را وارد کنید dadline.net',
                'variables' => [
                    'name',
                    'code',
                ],
                'patterns' => [
                    'melipayamak' => [
                        'id' => null,
                    ],
                    'adly' => [
                        'id' => null,
                    ],
                ],
            ],

            [
                'key' => 'contract_final_view',
                'title' => 'ارسال قرارداد نهایی',
                'content' => '{name} گرامی، قرارداد شناسه {contract_id} با موفقیت در سامانه دادلاین تایید و منعقد شد. لینک مشاهده: dadline.net/contract/?code={code}',
                'variables' => [
                    'name',
                    'contract_id',
                    'code',
                ],
                'patterns' => [
                    'melipayamak' => [
                        'id' => null,
                    ],
                    'adly' => [
                        'id' => null,
                    ],
                ],
            ],

            [
                'key' => 'case_offer_code',
                'title' => 'دریافت پیشنهاد در پرونده',
                'content' => '{name} عزیز، پیشنهاد جدیدی از طرف {vendor} در پرونده دادلاین شما ارسال شد. dadline.net',
                'variables' => [
                    'name',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => [
                        'id' => null,
                    ],
                    'adly' => [
                        'id' => null,
                    ],
                ],
            ],
            // ادامه $templates

            [
                'key' => 'case_accept_offer',
                'title' => 'پذیرش پیشنهاد و ارجاع پرونده',
                'content' => '{name} گرامی سلام؛ پیشنهاد شما در پرونده {case} به شناسه {case_id} پذیرفته شد. لطفا در اسرع وقت ضمن بررسی پرونده، نتیجه را ثبت بفرمایید. dadline.net',
                'variables' => [
                    'name',
                    'case',
                    'case_id',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'accept_lawlink_offer',
                'title' => 'پذیرش پیشنهاد همکاری و ارجاع پرونده',
                'content' => '{name} گرامی سلام؛ پیشنهاد شما در درخواست همکاری {request} به شناسه {request_id} پذیرفته شد. لطفا در اسرع وقت ضمن گفتگو با همکار واگذارنده، درخواست را انجام دهید. dadline.net',
                'variables' => [
                    'name',
                    'request',
                    'request_id',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_confirm_lawlink',
                'title' => 'درخواست تایید پایان کار همکاری',
                'content' => '{name} گرامی سلام؛ درخواست همکاری {request} به شناسه {request_id} انجام شد. لطفا در اسرع وقت پایان کار را تایید بفرمایید. dadline.net',
                'variables' => [
                    'name',
                    'request',
                    'request_id',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'case_final_code',
                'title' => 'اعلام نتیجه نهایی پرونده',
                'content' => '{name} گرامی، نتیجه نهایی پرونده {case} توسط {vendor} صادر شد. برای مشاهده به پیشخوان دادلاین مراجعه کنید. dadline.net',
                'variables' => [
                    'name',
                    'case',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'buy_vip_case',
                'title' => 'درخواست vip رسیدگی پرونده',
                'content' => '{name} گرامی، پرونده ویژه جدیدی با عنوان {title} در دادلاین به شما ارجاع شد. لطفا در اسرع وقت بررسی و رسیدگی بفرمایید. dadline.net',
                'variables' => [
                    'name',
                    'title',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'doc_offer_code',
                'title' => 'دریافت پیشنهاد در اوراق قضایی',
                'content' => '{name} عزیز، پیشنهاد جدیدی از طرف {vendor} در درخواست دادلاین شما ارسال شد. dadline.net',
                'variables' => [
                    'name',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'buy_vip_doc',
                'title' => 'درخواست vip تنظیم اوراق',
                'content' => '{name} گرامی، درخواست تنظیم اوراق قضایی جدیدی با عنوان {title} در دادلاین به شما ارجاع شد. لطفا در اسرع وقت بررسی بفرمایید. dadline.net',
                'variables' => [
                    'name',
                    'title',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'doc_accept_offer',
                'title' => 'پذیرش پیشنهاد اوراق قضایی و ارجاع درخواست',
                'content' => '{name} گرامی سلام؛ پیشنهاد شما در درخواست تنظیم {document} به شناسه {document_id} پذیرفته شد. لطفا نتیجه را ثبت بفرمایید. dadline.net',
                'variables' => [
                    'name',
                    'document',
                    'document_id',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'doc_final_code',
                'title' => 'اعلام متن نهایی تنظیم اوراق',
                'content' => '{name} گرامی، درخواست تنظیم اوراق شما با عنوان {title} توسط {vendor} انجام شد. برای مشاهده به پیشخوان دادلاین مراجعه کنید. dadline.net',
                'variables' => [
                    'name',
                    'title',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'confirm_vendor',
                'title' => 'پذیرش درخواست وندور',
                'content' => '{name} گرامی، درخواست شما به عنوان {role} با افتخار پذیرفته شد. به خانواده حقوقی دادلاین خوش آمدید. برای شروع همکاری به پیشخوان دادلاین مراجعه کنید. dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'role',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],
            [
                'key' => 'buy_vip_call',
                'title' => 'خرید مشاوره تلفنی vip',
                'content' => '{name} گرامی، درخواست مشاوره تلفنی در حوزه {category} به مدت {duration} دقیقه توسط {vendor} ثبت شده است. در اسرع وقت تماس بگیرید. dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'category',
                    'duration',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'add_dadcoin_in_sub',
                'title' => 'افزودن دادکوین در اشتراک',
                'content' => 'همکار گرامی، اشتراک موکل {client} با {amount} دادکوین شارژ شد dadline.net/pishkhan',
                'variables' => [
                    'client',
                    'amount',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'submit_answer_on_question',
                'title' => 'ثبت پاسخ جدید روی سوال',
                'content' => '{name} عزیز، پاسخ جدیدی توسط {vendor} روی سوال شما در دادلاین ثبت شد. با مراجعه به پیشخوان مشاهده کنید dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'accept_call_counseling',
                'title' => 'پذیرش درخواست تماس مشاوره تلفنی',
                'content' => '{name} عزیز، درخواست تماس شما توسط {vendor} پذیرفته شد و حداکثر تا یک ساعت آینده با شما تماس خواهند گرفت. dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'call_done_counseling',
                'title' => 'ثبت دیدگاه پس از انجام مشاوره تلفنی',
                'content' => '{name} عزیز، ضمن سپاس از همراهی شما، امیدواریم از مشاوره {vendor} رضایت داشته باشید. لطفا دیدگاه خود را در پیشخوان دادلاین ثبت کنید. dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'vendor',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_call_on_sub',
                'title' => 'درخواست تماس تلفنی توسط موکل',
                'content' => '{name} عزیز، درخواست مشاوره تلفنی جدیدی توسط {client} به مدت {duration} دقیقه ثبت شده است. لطفا در اسرع وقت تماس بگیرید. dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'client',
                    'duration',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_text_by_user',
                'title' => 'پیام جدید توسط کاربر',
                'content' => '{name} عزیز، پیام جدیدی توسط {sender} در دادلاین ثبت شد. dadline.net',
                'variables' => [
                    'name',
                    'sender',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_text_by_vendor',
                'title' => 'پیام جدید توسط وکیل',
                'content' => '{name} عزیز، پیام جدیدی توسط وکیل مشاور شما در دادلاین ثبت شد. dadline.net',
                'variables' => [
                    'name',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'new_answer_on_ticket',
                'title' => 'ثبت پاسخ جدید توسط ادمین در تیکت',
                'content' => '{name} عزیز، پاسخ جدیدی توسط {admin} در تیکت {ticket} ارسال شد. dadline.net/pishkhan',
                'variables' => [
                    'name',
                    'admin',
                    'ticket',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'create_new_user',
                'title' => 'ایجاد کاربر جدید',
                'content' => '{name} عزیز، حساب کاربری شما توسط {creator} در سامانه دادلاین ایجاد شد. نام کاربری: {username} رمز عبور: {password}. dadline.net',
                'variables' => [
                    'name',
                    'creator',
                    'username',
                    'password',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'case_send_reminders',
                'title' => 'یادآوری رویدادهای دفتر',
                'content' => 'سلام خدا قوت، یادآوری: "{title}" پرونده: شماره {case_id} زمان: {time} dadline.net',
                'variables' => [
                    'title',
                    'case_id',
                    'time',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_call_notification_to_vendor',
                'title' => 'ارسال اعلان درخواست تماس جدید',
                'content' => 'سلام درخواست تماس جدید در حوزه {category} به مدت {duration} دقیقه ثبت شد dadline.net',
                'variables' => [
                    'category',
                    'duration',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_case_notification_to_vendor',
                'title' => 'ارسال اعلان درخواست پرونده جدید',
                'content' => 'سلام بررسی پرونده جدید در حوزه {category} ثبت شد dadline.net',
                'variables' => [
                    'category',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_doc_notification_to_vendor',
                'title' => 'ارسال اعلان تنظیم مستند جدید',
                'content' => 'سلام درخواست تنظیم {document} جدید در حوزه {category} ثبت شد dadline.net',
                'variables' => [
                    'document',
                    'category',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

            [
                'key' => 'send_lawlink_notification_to_vendor',
                'title' => 'ارسال اعلان درخواست همکاری جدید',
                'content' => 'سلام درخواست همکاری جدید در حوزه {category} ثبت شد dadline.net',
                'variables' => [
                    'category',
                ],
                'patterns' => [
                    'melipayamak' => ['id' => null],
                    'adly' => ['id' => null],
                ],
            ],

        ];

        foreach ($templates as &$template) {
            $template['patterns'] = $legacyPatterns[$template['key']] ?? $template['patterns'];
        }
        unset($template);

        foreach ($templates as $template) {
            DB::table('sms_templates')->updateOrInsert(
                [
                    'key' => $template['key'],
                ],
                [
                    'title' => $template['title'],
                    'content' => $template['content'],
                    'variables' => json_encode($template['variables']),
                    'patterns' => json_encode($template['patterns']),
                    'active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
