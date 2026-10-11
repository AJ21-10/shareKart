/**
 * Copyright 2021 M.Vokhmentsev
 *
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
export declare class QuadrupleBuilder {
    static parseDecimal(digits: number[], exp10: number): QuadrupleBuilder;
    exponent: number;
    mantHi: bigint;
    mantLo: bigint;
    static MAX_MANTISSA_LENGTH: number;
    static MAX_EXP10: number;
    static MIN_EXP10: number;
    static TWO_POW_63_DIV_10: number;
    static HIGH_BIT: bigint;
    static POW_2_31: number;
    static LOWER_32_BITS: bigint;
    static HIGHER_32_BITS: bigint;
    static LOG2_10: number;
    static LOG2_E: number;
    static EXPONENT_BIAS: number;
    static EXPONENT_OF_INFINITY: bigint;
    static POS_POWERS_OF_2: bigint[][];
    static NEG_POWERS_OF_2: bigint[][];
    buffer4x64B: bigint[];
    buffer6x32A: bigint[];
    buffer6x32B: bigint[];
    buffer6x32C: bigint[];
    buffer12x32: bigint[];
    parse(digits: number[], exp10: number): void;
    parseMantissa(digits: number[], mantissa: bigint[]): number;
    divBuffBy10(buffer: bigint[]): void;
    isEmpty(buffer: bigint[]): boolean;
    addCarry(digits: number[]): number;
    findBinaryExponent(exp10: number, mantissa: bigint[]): number;
    log2(x: number): number;
    findBinaryMantissa(exp10: number, exp2: number, mantissa: bigint[]): void;
    powerOfTwo(exp: number, power: bigint[]): void;
    array_copy(source: bigint[], dest: bigint[]): void;
    multPacked3x64_AndAdjustExponent(factor1: bigint[], factor2: bigint[], result: bigint[]): void;
    multPacked3x64_simply(factor1: bigint[], factor2: bigint[], result: bigint[]): void;
    correctPossibleUnderflow(mantissa: bigint[]): number;
    isLessThanOne(buffer: bigint[]): boolean;
    multUnpacked6x32byPacked(factor1: bigint[], factor2: bigint[], product: bigint[]): void;
    multBuffBy10(buffer: bigint[]): void;
    normalizeMant(mantissa: bigint[]): number;
    roundUp(mantissa: bigint[]): number;
    pack_6x32_to_3x64(unpackedMant: bigint[], result: bigint[]): void;
    unpack_3x64_to_6x32(qd192: bigint[], buff_6x32: bigint[]): void;
    divBuffByPower2(buffer: bigint[], exp2: number): void;
    addToBuff(buff: bigint[], idx: number, summand: bigint): void;
    static clz64(x: bigint): number;
}
