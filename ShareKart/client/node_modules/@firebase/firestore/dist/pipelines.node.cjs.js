'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var commonCmCBqkC_node = require('./common-CQTXmRmJ.node.cjs.js');
require('@firebase/app');
require('@firebase/util');
require('@firebase/webchannel-wrapper/bloom-blob');
require('@firebase/logger');
require('util');
require('crypto');
require('tslib');
require('@grpc/grpc-js');
require('@grpc/proto-loader');
require('re2js');

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
 * @deprecated use selectablesToObject instead
 * @param selectables
 */
function selectablesToMap(selectables) {
    return new Map(Object.entries(selectablesToObject(selectables)));
}
function selectablesToObject(selectables) {
    const result = {};
    for (const selectable of selectables) {
        let alias;
        let expression;
        if (typeof selectable === 'string') {
            alias = selectable;
            expression = commonCmCBqkC_node.field(selectable);
        }
        else if (selectable instanceof commonCmCBqkC_node.Field) {
            alias = selectable.alias;
            expression = selectable.expr;
        }
        else if (selectable instanceof commonCmCBqkC_node.AliasedExpression) {
            alias = selectable.alias;
            expression = selectable.expr;
        }
        else {
            commonCmCBqkC_node.fail(0x5319, { selectable });
        }
        if (result[alias] !== undefined) {
            throw new commonCmCBqkC_node.FirestoreError('invalid-argument', `Duplicate alias or field '${alias}'`);
        }
        result[alias] = expression;
    }
    return result;
}
function aliasedAggregateToMap(aliasedAggregatees) {
    return aliasedAggregatees.reduce((map, selectable) => {
        if (map.get(selectable.alias) !== undefined) {
            throw new commonCmCBqkC_node.FirestoreError('invalid-argument', `Duplicate alias or field '${selectable.alias}'`);
        }
        map.set(selectable.alias, selectable.aggregate);
        return map;
    }, new Map());
}
/**
 * Converts a value to an Expression, Returning either a Constant, MapFunction,
 * ArrayFunction, or the input itself (if it's already an expression).
 *
 * @private
 * @internal
 * @param value
 */
function vectorToExpr(value) {
    if (value instanceof commonCmCBqkC_node.Expression) {
        return value;
    }
    else if (value instanceof commonCmCBqkC_node.VectorValue) {
        const result = commonCmCBqkC_node.constant(value);
        return result;
    }
    else if (Array.isArray(value)) {
        const result = commonCmCBqkC_node.constant(commonCmCBqkC_node.vector(value));
        return result;
    }
    else {
        throw new Error('Unsupported value: ' + typeof value);
    }
}
/**
 * Converts a value to an Expression, Returning either a Constant, MapFunction,
 * ArrayFunction, or the input itself (if it's already an expression).
 * If the input is a string, it is assumed to be a field name, and a
 * field(value) is returned.
 *
 * @private
 * @internal
 * @param value
 */
function fieldOrExpression(value) {
    if (commonCmCBqkC_node.isString$1(value)) {
        const result = commonCmCBqkC_node.field(value);
        return result;
    }
    else {
        return valueToDefaultExpr(value);
    }
}
/**
 * Converts a value to an Expression, Returning either a Constant, MapFunction,
 * ArrayFunction, or the input itself (if it's already an expression).
 *
 * @private
 * @internal
 * @param value
 */
function valueToDefaultExpr(value) {
    let result;
    if (commonCmCBqkC_node.isFirestoreValue(value)) {
        return commonCmCBqkC_node.constant(value);
    }
    if (value instanceof commonCmCBqkC_node.Expression) {
        return value;
    }
    else if (commonCmCBqkC_node.isPlainObject(value)) {
        result = commonCmCBqkC_node.map(value);
    }
    else if (value instanceof Array) {
        result = commonCmCBqkC_node.array(value);
    }
    else if (isPipeline$1(value)) {
        result = commonCmCBqkC_node.pipelineValue(value);
    }
    else {
        result = commonCmCBqkC_node._constant(value, undefined);
    }
    return result;
}
/**
 * Checks if a value is a Pipeline object.
 *
 * We use duck typing here to avoid a circular dependency between pipeline.ts and pipeline_util.ts.
 */
function isPipeline$1(value) {
    return (typeof value === 'object' &&
        value !== null &&
        typeof value.toArrayExpression === 'function');
}

/**
 * @license
 * Copyright 2024 Google LLC
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
 *
 * The Pipeline class provides a flexible and expressive framework for building complex data
 * transformation and query pipelines for Firestore.
 *
 * A pipeline takes data sources, such as Firestore collections or collection groups, and applies
 * a series of stages that are chained together. Each stage takes the output from the previous stage
 * (or the data source) and produces an output for the next stage (or as the final output of the
 * pipeline).
 *
 * Expressions can be used within each stage to filter and transform data through the stage.
 *
 * NOTE: The chained stages do not prescribe exactly how Firestore will execute the pipeline.
 * Instead, Firestore only guarantees that the result is the same as if the chained stages were
 * executed in order.
 *
 * @example
 * ```typescript
 * const db: Firestore; // Assumes a valid firestore instance.
 *
 * // Example 1: Select specific fields and rename 'rating' to 'bookRating'
 * const results1 = await execute(db.pipeline()
 *     .collection("books")
 *     .select("title", "author", field("rating").as("bookRating")));
 *
 * // Example 2: Filter documents where 'genre' is "Science Fiction" and 'published' is after 1950
 * const results2 = await execute(db.pipeline()
 *     .collection("books")
 *     .where(and(field("genre").equal("Science Fiction"), field("published").greaterThan(1950))));
 *
 * // Example 3: Calculate the average rating of books published after 1980
 * const results3 = await execute(db.pipeline()
 *     .collection("books")
 *     .where(field("published").greaterThan(1980))
 *     .aggregate(average(field("rating")).as("averageRating")));
 * ```
 */
let Pipeline$1 = class Pipeline {
    /**
     * @internal
     * @private
     * @param _db
     * @param userDataReader
     * @param _userDataWriter
     * @param stages
     */
    constructor(
    /**
     * @internal
     * @private
     */
    _db, 
    /**
     * @internal
     * @private
     */
    userDataReader, 
    /**
     * @internal
     * @private
     */
    _userDataWriter, 
    /**
     * @internal
     * @private
     */
    stages) {
        this._db = _db;
        this.userDataReader = userDataReader;
        this._userDataWriter = _userDataWriter;
        this.stages = stages;
    }
    _readUserData(context) {
        this.stages.forEach(stage => {
            const subContext = context.contextWith({
                methodName: stage._name
            });
            stage._readUserData(subContext);
        });
    }
    addFields(fieldOrOptions, ...additionalFields) {
        // Process argument union(s) from method overloads
        let fields;
        let options;
        if (commonCmCBqkC_node.isSelectable(fieldOrOptions)) {
            fields = [fieldOrOptions, ...additionalFields];
            options = {};
        }
        else {
            ({ fields, ...options } = fieldOrOptions);
        }
        // Convert user land convenience types to internal types
        const normalizedFields = selectablesToMap(fields);
        // Create stage object
        const stage = new commonCmCBqkC_node.AddFields(normalizedFields, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    removeFields(fieldValueOrOptions, ...additionalFields) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isField(fieldValueOrOptions) || commonCmCBqkC_node.isString$1(fieldValueOrOptions)
            ? {}
            : fieldValueOrOptions;
        const fields = commonCmCBqkC_node.isField(fieldValueOrOptions) || commonCmCBqkC_node.isString$1(fieldValueOrOptions)
            ? [fieldValueOrOptions, ...additionalFields]
            : fieldValueOrOptions.fields;
        // Convert user land convenience types to internal types
        const convertedFields = fields.map(f => commonCmCBqkC_node.isString$1(f) ? commonCmCBqkC_node.field(f) : f);
        // Create stage object
        const stage = new commonCmCBqkC_node.RemoveFields(convertedFields, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    define(aliasedExpressionOrOptions, ...additionalExpressions) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isAliasedExpr(aliasedExpressionOrOptions)
            ? {}
            : aliasedExpressionOrOptions;
        const aliasedExpressions = commonCmCBqkC_node.isAliasedExpr(aliasedExpressionOrOptions)
            ? [aliasedExpressionOrOptions, ...additionalExpressions]
            : aliasedExpressionOrOptions.variables;
        const convertedExpressions = selectablesToMap(aliasedExpressions);
        // Create stage object
        const stage = new commonCmCBqkC_node.Define(convertedExpressions, options);
        return this._addStage(stage);
    }
    /**
     * Converts this Pipeline into an expression that evaluates to an array of results.
     *
     * <p>Result Unwrapping:</p>
     * <ul>
     *  <li>If the items have a single field, their values are unwrapped and returned directly in the array.</li>
     *  <li>If the items have multiple fields, they are returned as objects in the array</li>
     * </ul>
     *
     * @example
     * ```typescript
     * // Get a list of reviewers for each book
     * db.pipeline().collection("books")
     *     .define(field("id").as("book_id"))
     *     .addFields(
     *         db.pipeline().collection("reviews")
     *             .where(field("book_id").equal(variable("book_id")))
     *             .select(field("reviewer"))
     *             .toArrayExpression()
     *             .as("reviewers")
     *     )
     * ```
     *
     * Output:
     * ```json
     * [
     *   {
     *     "id": "1",
     *     "title": "1984",
     *     "reviewers": ["Alice", "Bob"]
     *   }
     * ]
     * ```
     *
     * Multiple Fields:
     * ```typescript
     * // Get a list of reviews (reviewer and rating) for each book
     * db.pipeline().collection("books")
     *     .define(field("id").as("book_id"))
     *     .addFields(
     *         db.pipeline().collection("reviews")
     *             .where(field("book_id").equal(variable("book_id")))
     *             .select(field("reviewer"), field("rating"))
     *             .toArrayExpression()
     *             .as("reviews"))
     * ```
     *
     * Output:
     * ```json
     * [
     *   {
     *     "id": "1",
     *     "title": "1984",
     *     "reviews": [
     *       { "reviewer": "Alice", "rating": 5 },
     *       { "reviewer": "Bob", "rating": 4 }
     *     ]
     *   }
     * ]
     * ```
     *
     * @returns An `Expression` representing the execution of this pipeline.
     */
    toArrayExpression() {
        return new commonCmCBqkC_node.FunctionExpression('array', [fieldOrExpression(this)]);
    }
    /**
     * Converts this Pipeline into an expression that evaluates to a single scalar result.
     *
     * <p><b>Runtime Validation:</b> The runtime validates that the result set contains zero or one item. If
     * zero items, it evaluates to `null`.</p>
     *
     * <p>Result Unwrapping:</p>
     * <ul>
     *  <li>If the item has a single field, its value is unwrapped and returned directly.</li>
     *  <li>If the item has multiple fields, they are returned as an object.</li>
     * </ul>
     *
     * @example
     * ```typescript
     * // Calculate average rating for a restaurant
     * db.pipeline().collection("restaurants").addFields(
     *   db.pipeline().collection("reviews")
     *     .where(field("restaurant_id").equal(variable("rid")))
     *     .aggregate(average("rating").as("avg"))
     *     // Unwraps the single "avg" field to a scalar double
     *     .toScalarExpression().as("average_rating")
     * )
     * ```
     *
     * Output:
     * ```json
     * {
     *   "name": "The Burger Joint",
     *   "average_rating": 4.5
     * }
     * ```
     *
     * Multiple Fields:
     * ```typescript
     * // Calculate average rating AND count for a restaurant
     * db.pipeline().collection("restaurants").addFields(
     *   db.pipeline().collection("reviews")
     *     .where(field("restaurant_id").equal(variable("rid")))
     *     .aggregate(
     *       average("rating").as("avg"),
     *       count().as("count")
     *     )
     *     // Returns an object with "avg" and "count" fields
     *     .toScalarExpression().as("stats")
     * )
     * ```
     *
     * Output:
     * ```json
     * {
     *   "name": "The Burger Joint",
     *   "stats": {
     *     "avg": 4.5,
     *     "count": 100
     *   }
     * }
     * ```
     *
     * @returns An `Expression` representing the execution of this pipeline.
     */
    toScalarExpression() {
        return new commonCmCBqkC_node.FunctionExpression('scalar', [fieldOrExpression(this)]);
    }
    select(selectionOrOptions, ...additionalSelections) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isSelectable(selectionOrOptions) || commonCmCBqkC_node.isString$1(selectionOrOptions)
            ? {}
            : selectionOrOptions;
        const selections = commonCmCBqkC_node.isSelectable(selectionOrOptions) || commonCmCBqkC_node.isString$1(selectionOrOptions)
            ? [selectionOrOptions, ...additionalSelections]
            : selectionOrOptions.selections;
        // Convert user land convenience types to internal types
        const normalizedSelections = selectablesToMap(selections);
        // Create stage object
        const stage = new commonCmCBqkC_node.Select(normalizedSelections, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    where(conditionOrOptions) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isBooleanExpr(conditionOrOptions) ? {} : conditionOrOptions;
        const condition = commonCmCBqkC_node.isBooleanExpr(conditionOrOptions)
            ? conditionOrOptions
            : conditionOrOptions.condition;
        // Create stage object
        const stage = new commonCmCBqkC_node.Where(condition, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    offset(offsetOrOptions) {
        // Process argument union(s) from method overloads
        let options;
        let offset;
        if (commonCmCBqkC_node.isNumber$1(offsetOrOptions)) {
            options = {};
            offset = offsetOrOptions;
        }
        else {
            options = offsetOrOptions;
            offset = offsetOrOptions.offset;
        }
        // Create stage object
        const stage = new commonCmCBqkC_node.Offset(offset, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    limit(limitOrOptions) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isNumber$1(limitOrOptions) ? {} : limitOrOptions;
        const limit = commonCmCBqkC_node.isNumber$1(limitOrOptions)
            ? limitOrOptions
            : limitOrOptions.limit;
        // Create stage object
        const stage = new commonCmCBqkC_node.Limit(limit, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    distinct(groupOrOptions, ...additionalGroups) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isString$1(groupOrOptions) || commonCmCBqkC_node.isSelectable(groupOrOptions)
            ? {}
            : groupOrOptions;
        const groups = commonCmCBqkC_node.isString$1(groupOrOptions) || commonCmCBqkC_node.isSelectable(groupOrOptions)
            ? [groupOrOptions, ...additionalGroups]
            : groupOrOptions.groups;
        // Convert user land convenience types to internal types
        const convertedGroups = selectablesToMap(groups);
        // Create stage object
        const stage = new commonCmCBqkC_node.Distinct(convertedGroups, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    aggregate(targetOrOptions, ...rest) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isAliasedAggregate(targetOrOptions) ? {} : targetOrOptions;
        const accumulators = commonCmCBqkC_node.isAliasedAggregate(targetOrOptions)
            ? [targetOrOptions, ...rest]
            : targetOrOptions.accumulators;
        const groups = commonCmCBqkC_node.isAliasedAggregate(targetOrOptions)
            ? []
            : (targetOrOptions.groups ?? []);
        // Convert user land convenience types to internal types
        const convertedAccumulators = aliasedAggregateToMap(accumulators);
        const convertedGroups = selectablesToMap(groups);
        // Create stage object
        const stage = new commonCmCBqkC_node.Aggregate(convertedGroups, convertedAccumulators, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    /**
     * Performs a vector proximity search on the documents from the previous stage, returning the
     * K-nearest documents based on the specified query `vectorValue` and `distanceMeasure`. The
     * returned documents will be sorted in order from nearest to furthest from the query `vectorValue`.
     *
     * @example
     * ```typescript
     * // Find the 10 most similar books based on the book description.
     * const bookDescription = "Lorem ipsum...";
     * const queryVector: number[] = ...; // compute embedding of `bookDescription`
     *
     * firestore.pipeline().collection("books")
     *     .findNearest({
     *       field: 'embedding',
     *       vectorValue: queryVector,
     *       distanceMeasure: 'euclidean',
     *       limit: 10,                        // optional
     *       distanceField: 'computedDistance' // optional
     *     });
     * ```
     *
     * @param options - An object that specifies required and optional parameters for the stage.
     * @returns A new {@link @firebase/firestore/pipelines#Pipeline} object with this stage appended to the stage list.
     */
    findNearest(options) {
        // Convert user land convenience types to internal types
        const field = commonCmCBqkC_node.toField(options.field);
        const vectorValue = vectorToExpr(options.vectorValue);
        const distanceField = options.distanceField
            ? commonCmCBqkC_node.toField(options.distanceField)
            : undefined;
        const internalOptions = {
            distanceField,
            limit: options.limit,
            rawOptions: options.rawOptions
        };
        // Create stage object
        const stage = new commonCmCBqkC_node.FindNearest(vectorValue, field, options.distanceMeasure, internalOptions);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    // TODO(search) link to external documentation citing list of supported
    // expressions, when that documentation is created. List is not maintained
    // in the SDK because the list will change as the backend enables support.
    /**
     * Add a search stage to the Pipeline. The search stage supports
     * full-text search and geo search expressions.
     *
     * @remarks
     * This must be the first stage of the pipeline. A limited set of expressions are supported in the search stage.
     *
     * @example
     * ```typescript
     * // Full-text search example
     * firestore.pipeline().collection("restaurants")
     * .search({
     *   query: documentMatches("waffles OR pancakes"),
     *   sort: [
     *     score().descending(),
     *   ],
     *   addFields: [
     *     score().as("searchScore"),
     *   ]
     * })
     * ```
     *
     * @example
     * ```typescript
     * // Geo distance search example
     * const queryLocation = new GeoPoint(0, 0);
     * db.pipeline().collection('restaurants').search({
     *   query: field('location').geoDistance(queryLocation).lessThanOrEqual(1000),
     *   sort: [
     *     score().descending(),
     *   ],
     * })
     * ```
     *
     * @param options - An object that specifies parameters for the stage.
     * @return A new `Pipeline` object with this stage appended to the stage list.
     * @beta
     */
    search(options) {
        // Convert user land convenience types to internal types
        const addFields = options.addFields
            ? selectablesToObject(options.addFields)
            : undefined;
        const query = commonCmCBqkC_node.isExpr(options.query)
            ? options.query
            : commonCmCBqkC_node.documentMatches(options.query);
        const sort = commonCmCBqkC_node.isOrdering(options.sort)
            ? [options.sort]
            : options.sort;
        const select = undefined;
        // TODO(search) enable with backend support
        // select = options.select
        //   ? selectablesToObject(options.select)
        //   : undefined;
        const internalOptions = {
            ...options,
            addFields,
            select,
            query,
            sort
        };
        // Create stage object
        const stage = new commonCmCBqkC_node.Search(internalOptions);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    sort(orderingOrOptions, ...additionalOrderings) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isOrdering(orderingOrOptions) ? {} : orderingOrOptions;
        const orderings = commonCmCBqkC_node.isOrdering(orderingOrOptions)
            ? [orderingOrOptions, ...additionalOrderings]
            : orderingOrOptions.orderings;
        // Create stage object
        const stage = new commonCmCBqkC_node.Sort(orderings, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    replaceWith(valueOrOptions) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isString$1(valueOrOptions) || commonCmCBqkC_node.isExpr(valueOrOptions) ? {} : valueOrOptions;
        const fieldNameOrExpr = commonCmCBqkC_node.isString$1(valueOrOptions) || commonCmCBqkC_node.isExpr(valueOrOptions)
            ? valueOrOptions
            : valueOrOptions.map;
        // Convert user land convenience types to internal types
        const mapExpr = fieldOrExpression(fieldNameOrExpr);
        // Create stage object
        const stage = new commonCmCBqkC_node.Replace(mapExpr, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    sample(documentsOrOptions) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isNumber$1(documentsOrOptions) ? {} : documentsOrOptions;
        let rate;
        let mode;
        if (commonCmCBqkC_node.isNumber$1(documentsOrOptions)) {
            rate = documentsOrOptions;
            mode = 'documents';
        }
        else if (commonCmCBqkC_node.isNumber$1(documentsOrOptions.documents)) {
            rate = documentsOrOptions.documents;
            mode = 'documents';
        }
        else {
            rate = documentsOrOptions.percentage;
            mode = 'percent';
        }
        // Create stage object
        const stage = new commonCmCBqkC_node.Sample(rate, mode, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    union(otherOrOptions) {
        // Process argument union(s) from method overloads
        let options;
        let otherPipeline;
        if (isPipeline(otherOrOptions)) {
            options = {};
            otherPipeline = otherOrOptions;
        }
        else {
            ({ other: otherPipeline, ...options } = otherOrOptions);
        }
        // Create stage object
        const stage = new commonCmCBqkC_node.Union(otherPipeline, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    unnest(selectableOrOptions, indexField) {
        // Process argument union(s) from method overloads
        let options;
        let selectable;
        let indexFieldName;
        if (commonCmCBqkC_node.isSelectable(selectableOrOptions)) {
            options = {};
            selectable = selectableOrOptions;
            indexFieldName = indexField;
        }
        else {
            ({
                selectable,
                indexField: indexFieldName,
                ...options
            } = selectableOrOptions);
        }
        // Convert user land convenience types to internal types
        const alias = selectable.alias;
        const expr = selectable.expr;
        if (commonCmCBqkC_node.isString$1(indexFieldName)) {
            options.indexField = commonCmCBqkC_node._field(indexFieldName, 'unnest');
        }
        // Create stage object
        const stage = new commonCmCBqkC_node.Unnest(alias, expr, options);
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    /**
     * Adds a raw stage to the pipeline.
     *
     * <p>This method provides a flexible way to extend the pipeline's functionality by adding custom
     * stages. Each raw stage is defined by a unique `name` and a set of `params` that control its
     * behavior.
     *
     * <p>Example (Assuming there is no 'where' stage available in SDK):
     *
     * @example
     * ```typescript
     * // Assume we don't have a built-in 'where' stage
     * firestore.pipeline().collection('books')
     *     .rawStage('where', [field('published').lessThan(1900)]) // Custom 'where' stage
     *     .select('title', 'author');
     * ```
     *
     * @param name - The unique name of the raw stage to add.
     * @param params - A list of parameters to configure the raw stage's behavior.
     * @param options - An object of key value pairs that specifies optional parameters for the stage.
     * @returns A new {@link @firebase/firestore/pipelines#Pipeline} object with this stage appended to the stage list.
     */
    rawStage(name, params, options) {
        // Convert user land convenience types to internal types
        const expressionParams = params.map((value) => {
            if (value instanceof commonCmCBqkC_node.Expression) {
                return value;
            }
            else if (value instanceof commonCmCBqkC_node.AggregateFunction) {
                return value;
            }
            else if (commonCmCBqkC_node.isPlainObject(value)) {
                return commonCmCBqkC_node._mapValue(value);
            }
            else {
                return commonCmCBqkC_node._constant(value, 'rawStage');
            }
        });
        // Create stage object
        const stage = new commonCmCBqkC_node.RawStage(name, expressionParams, options ?? {});
        // Add stage to the pipeline
        return this._addStage(stage);
    }
    /**
     * @internal
     * @private
     */
    _toProto(jsonProtoSerializer) {
        const stages = this.stages.map(stage => stage._toProto(jsonProtoSerializer));
        return { stages };
    }
    _addStage(stage) {
        const copy = this.stages.map(s => s);
        copy.push(stage);
        return this.newPipeline(this._db, copy);
    }
    /**
     * @internal
     * @private
     * @param db
     * @param userDataReader
     * @param userDataWriter
     * @param stages
     * @protected
     */
    newPipeline(db, stages) {
        return new Pipeline(db, this.userDataReader, this._userDataWriter, stages);
    }
};
function isPipeline(val) {
    return val instanceof Pipeline$1;
}

/**
 * @license
 * Copyright 2024 Google LLC
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
 * Provides the entry point for defining the data source of a Firestore {@link @firebase/firestore/pipelines#Pipeline}.
 *
 * Use the methods of this class (e.g., {@link @firebase/firestore/pipelines#PipelineSource.(collection:1)}, {@link @firebase/firestore/pipelines#PipelineSource.(collectionGroup:1)},
 * {@link @firebase/firestore/pipelines#PipelineSource.(database:1)}, or {@link @firebase/firestore/pipelines#PipelineSource.(documents:1)}) to specify the initial data
 * for your pipeline, such as a collection, a collection group, the entire database, or a set of specific documents.
 */
class PipelineSource {
    /**
     * @internal
     * @private
     * @param databaseId
     * @param userDataReader
     * @param _createPipeline
     */
    constructor(databaseId, userDataReader, 
    /**
     * @internal
     * @private
     */
    _createPipeline) {
        this.databaseId = databaseId;
        this.userDataReader = userDataReader;
        this._createPipeline = _createPipeline;
    }
    collection(collectionOrOptions) {
        // Process argument union(s) from method overloads
        const options = commonCmCBqkC_node.isString$1(collectionOrOptions) ||
            commonCmCBqkC_node.isCollectionReference(collectionOrOptions)
            ? {}
            : collectionOrOptions;
        const collectionRefOrString = commonCmCBqkC_node.isString$1(collectionOrOptions) ||
            commonCmCBqkC_node.isCollectionReference(collectionOrOptions)
            ? collectionOrOptions
            : collectionOrOptions.collection;
        // Validate that a user provided reference is for the same Firestore DB
        if (commonCmCBqkC_node.isCollectionReference(collectionRefOrString)) {
            this._validateReference(collectionRefOrString);
        }
        // Convert user land convenience types to internal types
        const normalizedCollection = commonCmCBqkC_node.isString$1(collectionRefOrString)
            ? collectionRefOrString
            : collectionRefOrString.path;
        // Create stage object
        const stage = new commonCmCBqkC_node.CollectionSource(normalizedCollection, options);
        // User data must be read in the context of the API method to
        // provide contextual errors
        const parseContext = this.userDataReader.createContext(3 /* UserDataSource.Argument */, 'collection');
        stage._readUserData(parseContext);
        // Add stage to the pipeline
        return this._createPipeline([stage]);
    }
    collectionGroup(collectionIdOrOptions) {
        // Process argument union(s) from method overloads
        let collectionId;
        let options;
        if (commonCmCBqkC_node.isString$1(collectionIdOrOptions)) {
            collectionId = collectionIdOrOptions;
            options = {};
        }
        else {
            ({ collectionId, ...options } = collectionIdOrOptions);
        }
        // Create stage object
        const stage = new commonCmCBqkC_node.CollectionGroupSource(collectionId, options);
        // User data must be read in the context of the API method to
        // provide contextual errors
        const parseContext = this.userDataReader.createContext(3 /* UserDataSource.Argument */, 'collectionGroup');
        stage._readUserData(parseContext);
        // Add stage to the pipeline
        return this._createPipeline([stage]);
    }
    database(options) {
        // Process argument union(s) from method overloads
        options = options ?? {};
        // Create stage object
        const stage = new commonCmCBqkC_node.DatabaseSource(options);
        // User data must be read in the context of the API method to
        // provide contextual errors
        const parseContext = this.userDataReader.createContext(3 /* UserDataSource.Argument */, 'database');
        stage._readUserData(parseContext);
        // Add stage to the pipeline
        return this._createPipeline([stage]);
    }
    documents(docsOrOptions) {
        // Process argument union(s) from method overloads
        let options;
        let docs;
        if (Array.isArray(docsOrOptions)) {
            docs = docsOrOptions;
            options = {};
        }
        else {
            ({ docs, ...options } = docsOrOptions);
        }
        // Validate that all user provided references are for the same Firestore DB
        docs
            .filter(v => v instanceof commonCmCBqkC_node.DocumentReference)
            .forEach(dr => this._validateReference(dr));
        // Convert user land convenience types to internal types
        const normalizedDocs = docs.map(doc => commonCmCBqkC_node.isString$1(doc) ? doc : doc.path);
        // Create stage object
        const stage = new commonCmCBqkC_node.DocumentsSource(normalizedDocs, options);
        // User data must be read in the context of the API method to
        // provide contextual errors
        const parseContext = this.userDataReader.createContext(3 /* UserDataSource.Argument */, 'documents');
        stage._readUserData(parseContext);
        // Add stage to the pipeline
        return this._createPipeline([stage]);
    }
    /**
     * Convert the given Query into an equivalent Pipeline.
     *
     * @param query - A Query to be converted into a Pipeline.
     *
     * @throws `FirestoreError` Thrown if any of the provided DocumentReferences target a different project or database than the pipeline.
     */
    createFrom(query) {
        return this._createPipeline(commonCmCBqkC_node.toPipelineStages(query._query, query.firestore));
    }
    _validateReference(reference) {
        const refDbId = reference.firestore._databaseId;
        if (!refDbId.isEqual(this.databaseId)) {
            throw new commonCmCBqkC_node.FirestoreError(commonCmCBqkC_node.Code.INVALID_ARGUMENT, `Invalid ${reference instanceof commonCmCBqkC_node.CollectionReference
                ? 'CollectionReference'
                : 'DocumentReference'}. ` +
                `The project ID ("${refDbId.projectId}") or the database ("${refDbId.database}") does not match ` +
                `the project ID ("${this.databaseId.projectId}") and database ("${this.databaseId.database}") of the target database of this Pipeline.`);
        }
    }
}
function subcollection(pathOrOptions) {
    // Process argument union(s) from method overloads
    let path;
    let options;
    if (commonCmCBqkC_node.isString$1(pathOrOptions)) {
        path = pathOrOptions;
        options = {};
    }
    else {
        ({ path, ...options } = pathOrOptions);
    }
    // Create stage object
    const stage = new commonCmCBqkC_node.SubcollectionSource(path, options);
    return new Pipeline$1(undefined, undefined, undefined, [stage]);
}

/**
 * @license
 * Copyright 2024 Google LLC
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
 * Represents the results of a Firestore pipeline execution.
 *
 * A `PipelineSnapshot` contains zero or more {@link @firebase/firestore/pipelines#PipelineResult} objects
 * representing the documents returned by a pipeline query. It provides methods
 * to iterate over the documents and access metadata about the query results.
 *
 * @example
 * ```typescript
 * const snapshot: PipelineSnapshot = await firestore
 *   .pipeline()
 *   .collection('myCollection')
 *   .where(field('value').greaterThan(10))
 *   .execute();
 *
 * snapshot.results.forEach(doc => {
 *   console.log(doc.id, '=>', doc.data());
 * });
 * ```
 */
class PipelineSnapshot {
    constructor(pipeline, results, executionTime) {
        this._pipeline = pipeline;
        this._executionTime = executionTime;
        this._results = results;
    }
    /**
     * An array of all the results in the `PipelineSnapshot`.
     */
    get results() {
        return this._results;
    }
    /**
     * The time at which the pipeline producing this result is executed.
     *
     * @readonly
     *
     */
    get executionTime() {
        if (this._executionTime === undefined) {
            throw new Error("'executionTime' is expected to exist, but it is undefined");
        }
        return this._executionTime;
    }
}
/**
 *
 * A PipelineResult contains data read from a Firestore Pipeline. The data can be extracted with the
 * {@link @firebase/firestore/pipelines#PipelineResult.data} or {@link @firebase/firestore/pipelines#PipelineResult.(get:1)} methods.
 *
 * <p>If the PipelineResult represents a non-document result, `ref` will return a undefined
 * value.
 */
class PipelineResult {
    /**
     * @private
     * @internal
     *
     * @param userDataWriter - The serializer used to encode/decode protobuf.
     * @param fields - The fields of the Firestore `Document` Protobuf backing
     * this document.
     * @param ref - The reference to the document.
     * @param createTime - The time when the document was created if the result is a document, undefined otherwise.
     * @param updateTime - The time when the document was last updated if the result is a document, undefined otherwise.
     * @param metadata
     * @param listenOptions
     */
    constructor(userDataWriter, fields, ref, createTime, updateTime, metadata, listenOptions) {
        this._ref = ref;
        this._userDataWriter = userDataWriter;
        this._createTime = createTime;
        this._updateTime = updateTime;
        this._fields = fields;
        this._metadata = metadata;
        this._listenOptions = listenOptions;
    }
    /**
     * @private
     * @internal
     * @param userDataWriter
     * @param doc
     * @param ref
     * @param metadata
     * @param listenOptions
     */
    static fromDocument(userDataWriter, doc, ref, metadata, listenOptions) {
        return new PipelineResult(userDataWriter, doc.data, ref, doc.createTime.toTimestamp(), doc.version.toTimestamp(), metadata, listenOptions);
    }
    /**
     * The reference of the document, if it is a document; otherwise `undefined`.
     */
    get ref() {
        return this._ref;
    }
    /**
     * The ID of the document for which this PipelineResult contains data, if it is a document; otherwise `undefined`.
     *
     * @readonly
     *
     */
    get id() {
        return this._ref?.id;
    }
    /**
     * The time the document was created. Undefined if this result is not a document.
     *
     * @readonly
     */
    get createTime() {
        return this._createTime;
    }
    /**
     * The time the document was last updated (at the time the snapshot was
     * generated). Undefined if this result is not a document.
     *
     * @readonly
     */
    get updateTime() {
        return this._updateTime;
    }
    /**
     * Retrieves all fields in the result as an object.
     *
     * @returns An object containing all fields in the document or
     * 'undefined' if the document doesn't exist.
     *
     * @example
     * ```
     * let p = firestore.pipeline().collection('col');
     *
     * p.execute().then(results => {
     *   let data = results[0].data();
     *   console.log(`Retrieved data: ${JSON.stringify(data)}`);
     * });
     * ```
     */
    data() {
        return this._userDataWriter.convertValue(this._fields.value, this._listenOptions?.serverTimestampBehavior);
    }
    /**
     * @internal
     * @private
     *
     * Retrieves all fields in the result as a proto value.
     *
     * @returns An `Object` containing all fields in the result.
     */
    _fieldsProto() {
        // Return a cloned value to prevent manipulation of the Snapshot's data
        return this._fields.clone().value.mapValue.fields;
    }
    /**
     * Retrieves the field specified by `field`.
     *
     * @param field - The field path
     * (e.g. 'foo' or 'foo.bar') to a specific field.
     * @returns The data at the specified field location or `undefined` if no
     * such field exists.
     *
     * @example
     * ```
     * let p = firestore.pipeline().collection('col');
     *
     * p.execute().then(results => {
     *   let field = results[0].get('a.b');
     *   console.log(`Retrieved field value: ${field}`);
     * });
     * ```
     */
    // We deliberately use `any` in the external API to not impose type-checking
    // on end users.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(fieldPath) {
        if (this._fields === undefined) {
            return undefined;
        }
        if (commonCmCBqkC_node.isField(fieldPath)) {
            fieldPath = fieldPath.fieldName;
        }
        const value = this._fields.field(commonCmCBqkC_node.fieldPathFromArgument('DocumentSnapshot.get', fieldPath));
        if (value !== null) {
            return this._userDataWriter.convertValue(value, this._listenOptions?.serverTimestampBehavior);
        }
    }
}
/**
 * Test equality of two PipelineResults.
 * @param left - First PipelineResult to compare.
 * @param right - Second PipelineResult to compare.
 */
function pipelineResultEqual(left, right) {
    if (left === right) {
        return true;
    }
    return (commonCmCBqkC_node.isOptionalEqual(left._ref, right._ref, commonCmCBqkC_node.refEqual) &&
        commonCmCBqkC_node.isOptionalEqual(left._fields, right._fields, (l, r) => l.isEqual(r)));
}

/**
 * @license
 * Copyright 2024 Google LLC
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
class Pipeline extends Pipeline$1 {
    /**
     * @internal
     * @private
     * @param db
     * @param userDataReader
     * @param userDataWriter
     * @param stages
     * @param converter
     * @protected
     */
    newPipeline(db, stages) {
        return new Pipeline(db, this.userDataReader, this._userDataWriter, stages);
    }
}

/**
 * @license
 * Copyright 2024 Google LLC
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
function execute(pipelineOrOptions) {
    const options = !(pipelineOrOptions instanceof Pipeline$1)
        ? pipelineOrOptions
        : {
            pipeline: pipelineOrOptions
        };
    const { pipeline, rawOptions, ...rest } = options;
    if (!pipeline._db) {
        return Promise.reject(new commonCmCBqkC_node.FirestoreError(commonCmCBqkC_node.Code.FAILED_PRECONDITION, 'This pipeline was created without a database (e.g., as a subcollection pipeline) and cannot be executed directly. It can only be used as part of another pipeline.'));
    }
    const firestore = commonCmCBqkC_node.cast(pipeline._db, commonCmCBqkC_node.Firestore);
    const client = commonCmCBqkC_node.ensureFirestoreConfigured(firestore);
    const userDataReader = commonCmCBqkC_node.newUserDataReader(firestore);
    const context = userDataReader.createContext(3 /* UserDataSource.Argument */, 'execute');
    pipeline._readUserData(context);
    const userDataWriter = new commonCmCBqkC_node.ExpUserDataWriter(firestore);
    const structuredPipelineOptions = new commonCmCBqkC_node.StructuredPipelineOptions(rest, rawOptions);
    structuredPipelineOptions._readUserData(context);
    const structuredPipeline = new commonCmCBqkC_node.StructuredPipeline(pipeline, structuredPipelineOptions);
    return commonCmCBqkC_node.firestoreClientExecutePipeline(client, structuredPipeline).then(result => {
        // Get the execution time from the first result.
        // firestoreClientExecutePipeline returns at least one PipelineStreamElement
        // even if the returned document set is empty.
        const executionTime = result.length > 0 ? result[0].executionTime?.toTimestamp() : undefined;
        const docs = result
            // Currently ignore any response from ExecutePipeline that does
            // not contain any document data in the `fields` property.
            .filter(element => !!element.fields)
            .map(element => new PipelineResult(userDataWriter, element.fields, element.key?.path
            ? new commonCmCBqkC_node.DocumentReference(firestore, null, element.key)
            : undefined, element.createTime?.toTimestamp(), element.updateTime?.toTimestamp()));
        return new PipelineSnapshot(pipeline, docs, executionTime);
    });
}
/**
 * @beta
 * Creates and returns a new PipelineSource, which allows specifying the source stage of a {@link @firebase/firestore/pipelines#Pipeline}.
 *
 * @example
 * ```typescript
 * let myPipeline: Pipeline = firestore.pipeline().collection('books');
 * ```
 */
// Augment the Firestore class with the pipeline() factory method
commonCmCBqkC_node.Firestore.prototype.pipeline = function () {
    const userDataReader = commonCmCBqkC_node.newUserDataReader(this);
    return new PipelineSource(this._databaseId, userDataReader, (stages) => {
        return new Pipeline(this, userDataReader, new commonCmCBqkC_node.ExpUserDataWriter(this), stages);
    });
};

exports.AggregateFunction = commonCmCBqkC_node.AggregateFunction;
exports.AliasedAggregate = commonCmCBqkC_node.AliasedAggregate;
exports.AliasedExpression = commonCmCBqkC_node.AliasedExpression;
exports.BooleanExpression = commonCmCBqkC_node.BooleanExpression;
exports.Expression = commonCmCBqkC_node.Expression;
exports.Field = commonCmCBqkC_node.Field;
exports.FunctionExpression = commonCmCBqkC_node.FunctionExpression;
exports.Ordering = commonCmCBqkC_node.Ordering;
exports._internalPipelineToExecutePipelineRequestProto = commonCmCBqkC_node._internalPipelineToExecutePipelineRequestProto;
exports.abs = commonCmCBqkC_node.abs;
exports.add = commonCmCBqkC_node.add;
exports.and = commonCmCBqkC_node.and;
exports.array = commonCmCBqkC_node.array;
exports.arrayAgg = commonCmCBqkC_node.arrayAgg;
exports.arrayAggDistinct = commonCmCBqkC_node.arrayAggDistinct;
exports.arrayConcat = commonCmCBqkC_node.arrayConcat;
exports.arrayContains = commonCmCBqkC_node.arrayContains;
exports.arrayContainsAll = commonCmCBqkC_node.arrayContainsAll;
exports.arrayContainsAny = commonCmCBqkC_node.arrayContainsAny;
exports.arrayFilter = commonCmCBqkC_node.arrayFilter;
exports.arrayFirst = commonCmCBqkC_node.arrayFirst;
exports.arrayFirstN = commonCmCBqkC_node.arrayFirstN;
exports.arrayGet = commonCmCBqkC_node.arrayGet;
exports.arrayIndexOf = commonCmCBqkC_node.arrayIndexOf;
exports.arrayIndexOfAll = commonCmCBqkC_node.arrayIndexOfAll;
exports.arrayLast = commonCmCBqkC_node.arrayLast;
exports.arrayLastIndexOf = commonCmCBqkC_node.arrayLastIndexOf;
exports.arrayLastN = commonCmCBqkC_node.arrayLastN;
exports.arrayLength = commonCmCBqkC_node.arrayLength;
exports.arrayMaximum = commonCmCBqkC_node.arrayMaximum;
exports.arrayMaximumN = commonCmCBqkC_node.arrayMaximumN;
exports.arrayMinimum = commonCmCBqkC_node.arrayMinimum;
exports.arrayMinimumN = commonCmCBqkC_node.arrayMinimumN;
exports.arraySlice = commonCmCBqkC_node.arraySlice;
exports.arraySum = commonCmCBqkC_node.arraySum;
exports.arrayTransform = commonCmCBqkC_node.arrayTransform;
exports.arrayTransformWithIndex = commonCmCBqkC_node.arrayTransformWithIndex;
exports.ascending = commonCmCBqkC_node.ascending;
exports.average = commonCmCBqkC_node.average;
exports.byteLength = commonCmCBqkC_node.byteLength;
exports.ceil = commonCmCBqkC_node.ceil;
exports.charLength = commonCmCBqkC_node.charLength;
exports.coalesce = commonCmCBqkC_node.coalesce;
exports.collectionId = commonCmCBqkC_node.collectionId;
exports.concat = commonCmCBqkC_node.concat;
exports.conditional = commonCmCBqkC_node.conditional;
exports.constant = commonCmCBqkC_node.constant;
exports.cosineDistance = commonCmCBqkC_node.cosineDistance;
exports.count = commonCmCBqkC_node.count;
exports.countAll = commonCmCBqkC_node.countAll;
exports.countDistinct = commonCmCBqkC_node.countDistinct;
exports.countIf = commonCmCBqkC_node.countIf;
exports.currentDocument = commonCmCBqkC_node.currentDocument;
exports.currentTimestamp = commonCmCBqkC_node.currentTimestamp;
exports.descending = commonCmCBqkC_node.descending;
exports.divide = commonCmCBqkC_node.divide;
exports.documentId = commonCmCBqkC_node.documentId;
exports.documentMatches = commonCmCBqkC_node.documentMatches;
exports.dotProduct = commonCmCBqkC_node.dotProduct;
exports.endsWith = commonCmCBqkC_node.endsWith;
exports.equal = commonCmCBqkC_node.equal;
exports.equalAny = commonCmCBqkC_node.equalAny;
exports.euclideanDistance = commonCmCBqkC_node.euclideanDistance;
exports.exists = commonCmCBqkC_node.exists;
exports.exp = commonCmCBqkC_node.exp;
exports.field = commonCmCBqkC_node.field;
exports.first = commonCmCBqkC_node.first;
exports.floor = commonCmCBqkC_node.floor;
exports.geoDistance = commonCmCBqkC_node.geoDistance;
exports.greaterThan = commonCmCBqkC_node.greaterThan;
exports.greaterThanOrEqual = commonCmCBqkC_node.greaterThanOrEqual;
exports.ifAbsent = commonCmCBqkC_node.ifAbsent;
exports.ifError = commonCmCBqkC_node.ifError;
exports.ifNull = commonCmCBqkC_node.ifNull;
exports.isAbsent = commonCmCBqkC_node.isAbsent;
exports.isError = commonCmCBqkC_node.isError;
exports.isType = commonCmCBqkC_node.isType;
exports.join = commonCmCBqkC_node.join;
exports.last = commonCmCBqkC_node.last;
exports.length = commonCmCBqkC_node.length;
exports.lessThan = commonCmCBqkC_node.lessThan;
exports.lessThanOrEqual = commonCmCBqkC_node.lessThanOrEqual;
exports.like = commonCmCBqkC_node.like;
exports.ln = commonCmCBqkC_node.ln;
exports.log = commonCmCBqkC_node.log;
exports.log10 = commonCmCBqkC_node.log10;
exports.logicalMaximum = commonCmCBqkC_node.logicalMaximum;
exports.logicalMinimum = commonCmCBqkC_node.logicalMinimum;
exports.ltrim = commonCmCBqkC_node.ltrim;
exports.map = commonCmCBqkC_node.map;
exports.mapEntries = commonCmCBqkC_node.mapEntries;
exports.mapGet = commonCmCBqkC_node.mapGet;
exports.mapKeys = commonCmCBqkC_node.mapKeys;
exports.mapMerge = commonCmCBqkC_node.mapMerge;
exports.mapRemove = commonCmCBqkC_node.mapRemove;
exports.mapSet = commonCmCBqkC_node.mapSet;
exports.mapValues = commonCmCBqkC_node.mapValues;
exports.maximum = commonCmCBqkC_node.maximum;
exports.minimum = commonCmCBqkC_node.minimum;
exports.mod = commonCmCBqkC_node.mod;
exports.multiply = commonCmCBqkC_node.multiply;
exports.nor = commonCmCBqkC_node.nor;
exports.not = commonCmCBqkC_node.not;
exports.notEqual = commonCmCBqkC_node.notEqual;
exports.notEqualAny = commonCmCBqkC_node.notEqualAny;
exports.or = commonCmCBqkC_node.or;
exports.parent = commonCmCBqkC_node.parent;
exports.pow = commonCmCBqkC_node.pow;
exports.rand = commonCmCBqkC_node.rand;
exports.regexContains = commonCmCBqkC_node.regexContains;
exports.regexFind = commonCmCBqkC_node.regexFind;
exports.regexFindAll = commonCmCBqkC_node.regexFindAll;
exports.regexMatch = commonCmCBqkC_node.regexMatch;
exports.reverse = commonCmCBqkC_node.reverse;
exports.round = commonCmCBqkC_node.round;
exports.rtrim = commonCmCBqkC_node.rtrim;
exports.score = commonCmCBqkC_node.score;
exports.split = commonCmCBqkC_node.split;
exports.sqrt = commonCmCBqkC_node.sqrt;
exports.startsWith = commonCmCBqkC_node.startsWith;
exports.stringConcat = commonCmCBqkC_node.stringConcat;
exports.stringContains = commonCmCBqkC_node.stringContains;
exports.stringIndexOf = commonCmCBqkC_node.stringIndexOf;
exports.stringRepeat = commonCmCBqkC_node.stringRepeat;
exports.stringReplaceAll = commonCmCBqkC_node.stringReplaceAll;
exports.stringReplaceOne = commonCmCBqkC_node.stringReplaceOne;
exports.stringReverse = commonCmCBqkC_node.stringReverse;
exports.substring = commonCmCBqkC_node.substring;
exports.subtract = commonCmCBqkC_node.subtract;
exports.sum = commonCmCBqkC_node.sum;
exports.switchOn = commonCmCBqkC_node.switchOn;
exports.timestampAdd = commonCmCBqkC_node.timestampAdd;
exports.timestampDiff = commonCmCBqkC_node.timestampDiff;
exports.timestampExtract = commonCmCBqkC_node.timestampExtract;
exports.timestampSubtract = commonCmCBqkC_node.timestampSubtract;
exports.timestampToUnixMicros = commonCmCBqkC_node.timestampToUnixMicros;
exports.timestampToUnixMillis = commonCmCBqkC_node.timestampToUnixMillis;
exports.timestampToUnixSeconds = commonCmCBqkC_node.timestampToUnixSeconds;
exports.timestampTruncate = commonCmCBqkC_node.timestampTruncate;
exports.toLower = commonCmCBqkC_node.toLower;
exports.toUpper = commonCmCBqkC_node.toUpper;
exports.trim = commonCmCBqkC_node.trim;
exports.trunc = commonCmCBqkC_node.trunc;
exports.type = commonCmCBqkC_node.type;
exports.unixMicrosToTimestamp = commonCmCBqkC_node.unixMicrosToTimestamp;
exports.unixMillisToTimestamp = commonCmCBqkC_node.unixMillisToTimestamp;
exports.unixSecondsToTimestamp = commonCmCBqkC_node.unixSecondsToTimestamp;
exports.variable = commonCmCBqkC_node.variable;
exports.vectorLength = commonCmCBqkC_node.vectorLength;
exports.xor = commonCmCBqkC_node.xor;
exports.Pipeline = Pipeline;
exports.PipelineResult = PipelineResult;
exports.PipelineSnapshot = PipelineSnapshot;
exports.PipelineSource = PipelineSource;
exports.execute = execute;
exports.pipelineResultEqual = pipelineResultEqual;
exports.subcollection = subcollection;
//# sourceMappingURL=pipelines.node.cjs.js.map
