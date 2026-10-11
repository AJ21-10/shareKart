/**
 * @license
 * Copyright 2020 Google LLC
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
import { DatabaseId } from '../core/database_info';
import { ArrayValue, MapValue, Timestamp, Value as ProtoValue, Value } from '../protos/firestore_proto_api';
import { DocumentKey } from './document_key';
import { TypeOrder } from './type_order';
export declare const TYPE_KEY = "__type__";
export declare const RESERVED_VECTOR_KEY = "__vector__";
export declare const VECTOR_MAP_VECTORS_KEY = "value";
export declare const RESERVED_MIN_KEY = "__min__";
export declare const RESERVED_MAX_KEY = "__max__";
export declare const RESERVED_REGEX_KEY = "__regex__";
export declare const RESERVED_REGEX_PATTERN_KEY = "pattern";
export declare const RESERVED_REGEX_OPTIONS_KEY = "options";
export declare const RESERVED_BSON_OBJECT_ID_KEY = "__oid__";
export declare const RESERVED_INT32_KEY = "__int__";
export declare const RESERVED_DECIMAL128_KEY = "__decimal128__";
export declare const RESERVED_BSON_TIMESTAMP_KEY = "__request_timestamp__";
export declare const RESERVED_BSON_TIMESTAMP_SECONDS_KEY = "seconds";
export declare const RESERVED_BSON_TIMESTAMP_INCREMENT_KEY = "increment";
export declare const RESERVED_BSON_BINARY_KEY = "__binary__";
export declare const INTERNAL_MIN_VALUE: Value;
export declare const INTERNAL_MAX_VALUE: Value;
export declare const MIN_VECTOR_VALUE: Value;
export declare const MIN_KEY_VALUE: Value;
export declare const MAX_KEY_VALUE: Value;
export declare const MIN_BSON_OBJECT_ID_VALUE: Value;
export declare const MIN_BSON_TIMESTAMP_VALUE: Value;
export declare const MIN_REGEX_VALUE: Value;
export declare const MIN_BSON_BINARY_VALUE: Value;
export declare enum MapRepresentation {
    REGEX = "regexValue",
    BSON_OBJECT_ID = "bsonObjectIdValue",
    INT32 = "int32Value",
    DECIMAL128 = "decimal128Value",
    BSON_TIMESTAMP = "bsonTimestampValue",
    BSON_BINARY = "bsonBinaryValue",
    MIN_KEY = "minKeyValue",
    MAX_KEY = "maxKeyValue",
    INTERNAL_MAX = "maxValue",
    VECTOR = "vectorValue",
    SERVER_TIMESTAMP = "serverTimestampValue",
    REGULAR_MAP = "regularMapValue"
}
export declare const TRUE_VALUE: Value;
export declare const FALSE_VALUE: Value;
/** Extracts the backend's type order for the provided value. */
export declare function typeOrder(value: Value): TypeOrder;
export interface EqualOptions {
    nanEqual: boolean;
    mixIntegerDouble: boolean;
    semanticsEqual: boolean;
}
/** Tests `left` and `right` for equality based on the backend semantics. */
export declare function valueEquals(left: Value, right: Value, options?: EqualOptions): boolean;
export declare function numberEquals(left: Value, right: Value, options?: EqualOptions): boolean;
/** Returns true if the ArrayValue contains the specified element. */
export declare function arrayValueContains(haystack: ArrayValue, needle: Value): boolean;
export declare function valueCompare(left: Value, right: Value): number;
export declare function extractNumber(value: Value): number;
export declare function compareNumbers(left: Value, right: Value): number;
/**
 * Generates the canonical ID for the provided field value (as used in Target
 * serialization).
 */
export declare function canonicalId(value: Value): string;
/**
 * Returns an approximate (and wildly inaccurate) in-memory size for the field
 * value.
 *
 * The memory size takes into account only the actual user data as it resides
 * in memory and ignores object overhead.
 */
export declare function estimateByteSize(value: Value): number;
/** Returns a reference value for the provided database and key. */
export declare function refValue(databaseId: DatabaseId, key: DocumentKey): Value;
/** Returns true if `value` is an BooleanValue . */
export declare function isBoolean(value?: Value | null): value is {
    booleanValue: boolean;
};
/** Returns true if `value` is an IntegerValue . */
export declare function isIntegerValue(value?: Value | null): value is {
    integerValue: string | number;
};
/** Returns true if `value` is a DoubleValue. */
export declare function isDoubleValue(value?: Value | null): value is {
    doubleValue: string | number;
};
export declare function isDecimal128Value(value: Value): boolean;
export declare function isInt32Value(value: Value): boolean;
/** Returns true if `value` is either an IntegerValue or a DoubleValue. */
export declare function isNumber(value?: Value | null): value is {
    doubleValue: string | number;
} | {
    integerValue: string | number;
} | {
    mapValue: MapValue;
};
/** Returns true if `value` is an ArrayValue. */
export declare function isArray(value?: Value | null): value is {
    arrayValue: ArrayValue;
};
/** Returns true if `value` is an ArrayValue. */
export declare function isString(value?: Value | null): value is {
    stringValue: string;
};
/** Returns true if `value` is an BytesValue. */
export declare function isBytes(value?: Value | null): value is {
    bytesValue: string;
};
/** Returns true if `value` is a ReferenceValue. */
export declare function isReferenceValue(value?: Value | null): value is {
    referenceValue: string;
};
/** Returns true if `value` is a NullValue. */
export declare function isNullValue(value?: Value | null): value is {
    nullValue: 'NULL_VALUE';
};
/** Returns true if `value` is NaN. */
export declare function isNanValue(value: Value): boolean;
/** Returns true if `value` is Timestamp. */
export declare function isTimestampValue(value?: Value | null): value is {
    timestampValue: Timestamp;
};
/** Returns true if `value` is a MapValue. */
export declare function isMapValue(value?: Value | null): value is {
    mapValue: MapValue;
};
export declare function isBsonType(value: Value): boolean;
export declare function detectMapRepresentation(value: Value): MapRepresentation;
/** Returns true if `value` is a VetorValue. */
export declare function isVectorValue(value: ProtoValue | null): boolean;
/** Returns true if `value` is a VetorValue. */
export declare function getVectorValue(value: ProtoValue | null): ArrayValue | undefined;
/** Creates a deep copy of `source`. */
export declare function deepClone(source: Value): Value;
/** Returns the lowest value for the given value type (inclusive). */
export declare function valuesGetLowerBound(value: Value): Value;
/** Returns the largest value for the given value type (exclusive). */
export declare function valuesGetUpperBound(value: Value): Value;
export declare function lowerBoundCompare(left: {
    value: Value;
    inclusive: boolean;
}, right: {
    value: Value;
    inclusive: boolean;
}): number;
export declare function upperBoundCompare(left: {
    value: Value;
    inclusive: boolean;
}, right: {
    value: Value;
    inclusive: boolean;
}): number;
