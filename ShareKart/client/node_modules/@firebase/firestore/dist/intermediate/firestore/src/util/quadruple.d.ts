/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @private
 * @internal
 */
export declare class Quadruple {
    #private;
    constructor(negative: boolean, biasedExponent: number, mantHi: bigint, mantLo: bigint);
    negative: boolean;
    biasedExponent: number;
    mantHi: bigint;
    mantLo: bigint;
    static positiveZero: Quadruple;
    static negativeZero: Quadruple;
    static NaN: Quadruple;
    static negativeInfinity: Quadruple;
    static positiveInfinity: Quadruple;
    /** Return the (unbiased) exponent of this {@link Quadruple}. */
    exponent(): number;
    /** Return true if this {@link Quadruple} is -0 or +0 */
    isZero(): boolean;
    /** Return true if this {@link Quadruple} is -infinity or +infinity */
    isInfinite(): boolean;
    /** Return true if this {@link Quadruple} is a NaN. */
    isNaN(): boolean;
    /** Compare two quadruples, with -0 < 0, and all NaNs equal and larger than all numbers. */
    compareTo(other: Quadruple): number;
    debug(): string;
    static fromNumber(value: number): Quadruple;
    /**
     * Converts a decimal number to a {@link Quadruple}. The supported format (no whitespace allowed)
     * is:
     *
     * <ul>
     *   <li><code>NaN</code> for Quadruple.NaN
     *   <li><code>Infinity</code> or <code>+Infinity</code> for Quadruple.POSITIVE_INFINITY
     *   <li><code>-Infinity</code> for Quadruple.NEGATIVE_INFINITY
     *   <li>String matching the regular expression: <code>[+-]?[0-9]*(\.[0-9]*)?([eE][+-]?[0-9]+)?</code> - the exponent cannot be more
     *       than 9 digits, and the whole string cannot be empty
     * </ul>
     */
    static fromString(s: string): Quadruple;
}
