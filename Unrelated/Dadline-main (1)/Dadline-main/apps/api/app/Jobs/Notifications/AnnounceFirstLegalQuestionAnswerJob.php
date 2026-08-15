<?php

namespace App\Jobs\Notifications;

use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Enums\UserRole;
use App\Models\Question;
use App\Models\QuestionAnswer;
use App\Models\User;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Notifications\BaleGateway;
use App\Services\Notifications\Data\ProviderSendResult;
use App\Services\Notifications\EitaaGateway;
use App\Services\Notifications\TelegramGateway;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use RuntimeException;

class AnnounceFirstLegalQuestionAnswerJob implements ShouldBeEncrypted, ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 4;

    public int $uniqueFor = 86400;

    public function __construct(public int $answerId) {}

    /** @return array<int, int> */
    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function uniqueId(): string
    {
        return 'legal-question-first-answer:'.$this->answerId;
    }

    public function handle(
        TelegramGateway $telegram,
        BaleGateway $bale,
        EitaaGateway $eitaa,
        OptionServiceSettings $settings,
    ): void {
        $answer = QuestionAnswer::query()
            ->with(['question', 'vendor'])
            ->find($this->answerId);

        if (! $this->isEligible($answer) || ! $this->isFirstLawyerAnswer($answer)) {
            return;
        }

        $question = $answer->question;
        $lawyer = $answer->vendor;
        $retryableFailures = [];

        if ($settings->enabled('legal_questions_telegram_enabled')) {
            $result = $this->sendOnce(
                channel: 'telegram',
                questionId: $question->id,
                sender: fn (): ProviderSendResult => $telegram->sendToLegalQuestionsChannel(
                    text: $this->telegramMessage($question, $answer, $lawyer, $settings),
                    parameters: [
                        'parse_mode' => 'HTML',
                        'link_preview_options' => ['is_disabled' => false],
                    ],
                ),
            );

            if ($result !== null && ! $result->successful && $result->retryable) {
                $retryableFailures[] = 'telegram';
            }
        }

        if ($settings->enabled('legal_questions_bale_enabled')) {
            $result = $this->sendOnce(
                channel: 'bale',
                questionId: $question->id,
                sender: fn (): ProviderSendResult => $bale->sendToLegalQuestionsChannel(
                    $this->baleMessage($question, $answer, $lawyer, $settings),
                ),
            );

            if ($result !== null && ! $result->successful && $result->retryable) {
                $retryableFailures[] = 'bale';
            }
        }

        if ($settings->enabled('legal_questions_eitaa_enabled')) {
            $result = $this->sendOnce(
                channel: 'eitaa',
                questionId: $question->id,
                sender: fn (): ProviderSendResult => $eitaa->sendToLegalQuestionsChannel(
                    $this->eitaaMessage($question, $answer, $lawyer, $settings),
                ),
            );

            if ($result !== null && ! $result->successful && $result->retryable) {
                $retryableFailures[] = 'eitaa';
            }
        }

        if ($retryableFailures !== []) {
            throw new RuntimeException(
                'Legal question announcement failed temporarily for: '.implode(', ', $retryableFailures)
            );
        }
    }

    private function isEligible(?QuestionAnswer $answer): bool
    {
        return $answer !== null
            && $answer->status === QuestionAnswerStatus::Approved
            && filled($answer->body)
            && $answer->question instanceof Question
            && $answer->question->status === QuestionStatus::Publish
            && ! $answer->question->is_private
            && filled($answer->question->slug)
            && $answer->vendor instanceof User
            && $answer->vendor->isLawyer();
    }

    private function isFirstLawyerAnswer(QuestionAnswer $answer): bool
    {
        $firstAnswerId = QuestionAnswer::query()
            ->where('question_id', $answer->question_id)
            ->where('status', QuestionAnswerStatus::Approved->value)
            ->whereHas('vendor', fn ($query) => $query->whereIn('role', $this->lawyerRoles()))
            ->orderBy('created_at')
            ->orderBy('id')
            ->value('id');

        return (int) $firstAnswerId === (int) $answer->id;
    }

    /** @param callable(): ProviderSendResult $sender */
    private function sendOnce(string $channel, int $questionId, callable $sender): ?ProviderSendResult
    {
        $cacheKey = "legal-question-announcement:{$questionId}:{$channel}:sent";

        if (Cache::has($cacheKey)) {
            return null;
        }

        $result = $sender();

        if ($result->successful) {
            Cache::forever($cacheKey, [
                'provider' => $result->provider,
                'message_id' => $result->messageId,
                'sent_at' => now()->toIso8601String(),
            ]);

            return $result;
        }

        logger()->warning('Legal question channel announcement failed.', [
            'channel' => $channel,
            'question_id' => $questionId,
            'answer_id' => $this->answerId,
            'error_code' => $result->errorCode,
            'retryable' => $result->retryable,
        ]);

        return $result;
    }

    private function telegramMessage(
        Question $question,
        QuestionAnswer $answer,
        User $lawyer,
        OptionServiceSettings $settings,
    ): string {
        $title = $this->escape($this->excerpt($question->title, 180));
        $questionBody = $this->escape($this->excerpt($question->body, 1200));
        $answerBody = $this->escape($this->excerpt($answer->body, 1200));
        $lawyerName = $this->escape($lawyer->full_name ?: 'یکی از وکلای دادلاین');
        $url = $this->escape($this->questionUrl($question, $settings));

        return implode("\n\n", [
            '⚖️ <b>پرسش حقوقی جدید در دادلاین</b>',
            "<b>{$title}</b>",
            "❓ <b>متن پرسش:</b>\n{$questionBody}",
            "💬 <b>اولین پاسخ توسط {$lawyerName}:</b>\n{$answerBody}",
            '<a href="'.$url.'">مشاهده پاسخ کامل و سایر پاسخ‌های وکلا</a>',
        ]);
    }

    private function baleMessage(
        Question $question,
        QuestionAnswer $answer,
        User $lawyer,
        OptionServiceSettings $settings,
    ): string {
        $lawyerName = $lawyer->full_name ?: 'یکی از وکلای دادلاین';

        return implode("\n\n", [
            '⚖️ پرسش حقوقی جدید در دادلاین',
            $this->excerpt($question->title, 180),
            "❓ متن پرسش:\n{$this->excerpt($question->body, 1200)}",
            "💬 اولین پاسخ توسط {$lawyerName}:\n{$this->excerpt($answer->body, 1200)}",
            "🔗 مشاهده پاسخ کامل و سایر پاسخ‌های وکلا:\n{$this->questionUrl($question, $settings)}",
        ]);
    }

    private function eitaaMessage(
        Question $question,
        QuestionAnswer $answer,
        User $lawyer,
        OptionServiceSettings $settings,
    ): string {
        $lawyerName = $lawyer->full_name ?: 'یکی از وکلای دادلاین';

        return implode("\n\n", [
            '⚖️ پرسش حقوقی جدید در دادلاین',
            $this->excerpt($question->title, 180),
            "❓ متن پرسش:\n{$this->excerpt($question->body, 1200)}",
            "💬 اولین پاسخ توسط {$lawyerName}:\n{$this->excerpt($answer->body, 1200)}",
            "🔗 مشاهده پاسخ کامل و سایر پاسخ‌های وکلا:\n{$this->questionUrl($question, $settings)}",
        ]);
    }

    private function questionUrl(Question $question, OptionServiceSettings $settings): string
    {
        $baseUrl = $settings->string(
            'legal_questions_public_base_url',
            'https://dadline.net/questions',
        ) ?? 'https://dadline.net/questions';

        return rtrim($baseUrl, '/').'/'.rawurlencode((string) $question->slug);
    }

    private function excerpt(?string $value, int $limit): string
    {
        return Str::limit(Str::squish(strip_tags((string) $value)), $limit, '…');
    }

    /** @return array<int, string> */
    private function lawyerRoles(): array
    {
        return [
            UserRole::LAWYER_BONYAD->value,
            UserRole::LAWYER_JUDICIAL->value,
            UserRole::LAWYER_TRAINEE->value,
        ];
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
