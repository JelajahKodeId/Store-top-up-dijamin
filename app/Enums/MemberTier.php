<?php

namespace App\Enums;

enum MemberTier: string
{
    case Standard = 'standard';
    case Reseller = 'reseller';
    case Vip = 'vip';

    public function label(): string
    {
        return match ($this) {
            self::Standard => 'Member',
            self::Reseller => 'Reseller',
            self::Vip => 'VIP',
        };
    }

    public function rank(): int
    {
        return match ($this) {
            self::Standard => 0,
            self::Reseller => 1,
            self::Vip => 2,
        };
    }

    public function upgradePrice(): ?float
    {
        return match ($this) {
            self::Reseller => 500_000.0,
            self::Vip => 1_000_000.0,
            self::Standard => null,
        };
    }

    public static function fromDatabase(?string $value): self
    {
        return self::tryFrom((string) $value) ?? self::Standard;
    }

    /**
     * @return list<self>
     */
    public static function purchasableTiers(): array
    {
        return [self::Reseller, self::Vip];
    }
}
