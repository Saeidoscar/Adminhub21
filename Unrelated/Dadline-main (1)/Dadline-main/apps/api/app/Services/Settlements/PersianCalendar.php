<?php

namespace App\Services\Settlements;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class PersianCalendar
{
    public function isLastDayOfMonth(CarbonInterface $date): bool
    {
        [, $month] = $this->toJalali(
            (int) $date->format('Y'),
            (int) $date->format('n'),
            (int) $date->format('j'),
        );

        $tomorrow = $date->copy()->addDay();
        [, $tomorrowMonth] = $this->toJalali(
            (int) $tomorrow->format('Y'),
            (int) $tomorrow->format('n'),
            (int) $tomorrow->format('j'),
        );

        return $month !== $tomorrowMonth;
    }


    public function payoutAt(CarbonInterface $date): CarbonImmutable
    {
        $cursor = $date->toImmutable()->startOfDay();
        [, $month] = $this->toJalali(
            (int) $cursor->format('Y'),
            (int) $cursor->format('n'),
            (int) $cursor->format('j'),
        );

        while (true) {
            $tomorrow = $cursor->addDay();
            [, $tomorrowMonth] = $this->toJalali(
                (int) $tomorrow->format('Y'),
                (int) $tomorrow->format('n'),
                (int) $tomorrow->format('j'),
            );

            if ($tomorrowMonth !== $month) {
                return $cursor->setTime(23, 0);
            }

            $cursor = $tomorrow;
        }
    }

    /**
     * @return array{0: int, 1: int, 2: int}
     */
    public function toJalali(int $year, int $month, int $day): array
    {
        $gregorianMonthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        $adjustedYear = $month > 2 ? $year + 1 : $year;
        $days = 355666
            + (365 * $year)
            + intdiv($adjustedYear + 3, 4)
            - intdiv($adjustedYear + 99, 100)
            + intdiv($adjustedYear + 399, 400)
            + $day
            + $gregorianMonthDays[$month - 1];

        $jalaliYear = -1595 + (33 * intdiv($days, 12053));
        $days %= 12053;
        $jalaliYear += 4 * intdiv($days, 1461);
        $days %= 1461;

        if ($days > 365) {
            $jalaliYear += intdiv($days - 1, 365);
            $days = ($days - 1) % 365;
        }

        if ($days < 186) {
            $jalaliMonth = 1 + intdiv($days, 31);
            $jalaliDay = 1 + ($days % 31);
        } else {
            $jalaliMonth = 7 + intdiv($days - 186, 30);
            $jalaliDay = 1 + (($days - 186) % 30);
        }

        return [$jalaliYear, $jalaliMonth, $jalaliDay];
    }
}
