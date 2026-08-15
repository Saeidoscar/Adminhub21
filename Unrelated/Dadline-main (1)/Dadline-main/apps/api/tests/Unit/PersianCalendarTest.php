<?php

namespace Tests\Unit;

use App\Services\Settlements\PersianCalendar;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

class PersianCalendarTest extends TestCase
{
    public function test_it_detects_the_last_day_of_a_persian_month(): void
    {
        $calendar = new PersianCalendar;

        $this->assertSame([1405, 5, 31], $calendar->toJalali(2026, 8, 22));
        $this->assertTrue($calendar->isLastDayOfMonth(CarbonImmutable::parse('2026-08-22', 'Asia/Tehran')));
        $this->assertFalse($calendar->isLastDayOfMonth(CarbonImmutable::parse('2026-08-21', 'Asia/Tehran')));
    }

    public function test_it_calculates_the_monthly_payout_deadline(): void
    {
        $calendar = new PersianCalendar;
        $deadline = $calendar->payoutAt(CarbonImmutable::parse('2026-08-02 17:00:00', 'Asia/Tehran'));

        $this->assertSame('2026-08-22 23:00:00', $deadline->format('Y-m-d H:i:s'));
        $this->assertSame('Asia/Tehran', $deadline->timezoneName);
    }

    public function test_it_detects_the_final_day_of_the_persian_year(): void
    {
        $calendar = new PersianCalendar;

        $this->assertSame([1405, 12, 29], $calendar->toJalali(2027, 3, 20));
        $this->assertTrue($calendar->isLastDayOfMonth(CarbonImmutable::parse('2027-03-20', 'Asia/Tehran')));
    }
}
