import * as currencies from "dinero.js/currencies";
import {
    dinero,
    add,
    subtract,
    multiply,
    compare,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    isPositive,
    isZero,
    toDecimal,
    toSnapshot,
} from "dinero.js";

import type { Money } from "../openapi/client";

type DineroCurrency = {
    readonly code: string;
    readonly base: number | readonly number[];
    readonly exponent: number;
};

function getCurrency(code: string): DineroCurrency {
    if (!(code in currencies)) {
        throw new Error(`Unknown currency code: ${code}`);
    }
    return currencies[code as keyof typeof currencies] as DineroCurrency;
}

function toDinero(money: Money) {
    const amount = money.amount ?? 0;
    const currency = getCurrency(money.currency ?? "EUR");
    return dinero({ amount, currency });
}

function toMoney(d: ReturnType<typeof toDinero>): Money {
    const snapshot = toSnapshot(d);
    return { amount: snapshot.amount, currency: snapshot.currency.code };
}

export function addMoney(a: Money, b: Money): Money {
    return toMoney(add(toDinero(a), toDinero(b)));
}

export function subtractMoney(a: Money, b: Money): Money {
    return toMoney(subtract(toDinero(a), toDinero(b)));
}

export function multiplyMoney(m: Money, factor: number): Money {
    return toMoney(multiply(toDinero(m), factor));
}

export function sumMoney(items: Money[]): Money {
    if (items.length === 0) return { amount: 0, currency: "EUR" };
    return items.reduce((sum, item) => addMoney(sum, item));
}

export function compareMoney(a: Money, b: Money): number {
    return compare(toDinero(a), toDinero(b));
}

export function gte(a: Money, b: Money): boolean {
    return greaterThanOrEqual(toDinero(a), toDinero(b));
}

export function gt(a: Money, b: Money): boolean {
    return greaterThan(toDinero(a), toDinero(b));
}

export function lte(a: Money, b: Money): boolean {
    return lessThanOrEqual(toDinero(a), toDinero(b));
}

export function lt(a: Money, b: Money): boolean {
    return lessThan(toDinero(a), toDinero(b));
}

export function isPositiveMoney(m: Money): boolean {
    return isPositive(toDinero(m));
}

export function isZeroMoney(m: Money): boolean {
    return isZero(toDinero(m));
}

export function toUnitsNumber(m: Money): number {
    return Number(toDecimal(toDinero(m)));
}
