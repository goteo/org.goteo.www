// src/types/flickity.d.ts
declare module "flickity" {
    export interface Options {
        cellAlign?: string;
        contain?: boolean;
        [key: string]: unknown;
    }

    export interface EventBindings {
        ready?: () => void;
        select?: (index: number) => void;
        change?: (index: number) => void;
        destroy?: () => void;
    }

    export default class Flickity {
        constructor(selector: Element | string, options?: Options);

        select(index: number, isWrapped?: boolean, isInstant?: boolean): void;
        next(): void;
        previous(): void;
        resize(): void;
        destroy(): void;

        on<E extends keyof EventBindings>(event: E, callback: EventBindings[E]): void;
        off<E extends keyof EventBindings>(event: E, callback: EventBindings[E]): void;
    }
}
