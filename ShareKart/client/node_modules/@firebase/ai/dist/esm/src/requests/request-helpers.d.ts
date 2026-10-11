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
import { Content, CountTokensRequest, FunctionResponse, GenerateContentRequest, Part, UnknownPart } from '../types';
import { TemplateRequestInternal } from '../public-types';
export declare function formatSystemInstruction(input?: string | Part | Content): Content | undefined;
export declare function formatNewContent(request: string | Array<string | Part>): Content;
export declare function formatGenerateContentInput(params: GenerateContentRequest | string | Array<string | Part>): GenerateContentRequest;
/**
 * Cleans a `FunctionResponse` object for wire transmission by stripping `type` from all nested parts if present.
 *
 * @internal
 */
export declare function cleanFunctionResponseForWire(fnResponse: FunctionResponse): FunctionResponse;
/**
 * Strips client-side `type` discriminator from a Part, returning an untagged wire part.
 * Creates a new part object so in-memory instances (e.g. in chat history) are not mutated.
 *
 * @internal
 */
export declare function stripPartType(part: Part | UnknownPart): UnknownPart;
/**
 * Cleans a `Content` object for wire transmission by stripping `type` from all its parts.
 *
 * @internal
 */
export declare function cleanContentForWire(content: Content): Content;
/**
 * Cleans a systemInstruction parameter for wire transmission by stripping `type` from its parts if present.
 *
 * @internal
 */
export declare function cleanSystemInstructionForWire(systemInstruction?: string | Part | Content): string | Part | Content | undefined;
/**
 * Traverses 2-3 layers down (contents -> parts -> nested parts) to strip `type` discriminators
 * from all parts in a GenerateContentRequest before sending over the wire.
 *
 * @internal
 */
export declare function cleanGenerateContentRequestForWire(request: GenerateContentRequest): GenerateContentRequest;
/**
 * Cleans a CountTokensRequest for wire transmission by stripping `type` from all its parts.
 *
 * @internal
 */
export declare function cleanCountTokensRequestForWire(request: CountTokensRequest): CountTokensRequest;
/**
 * Cleans a TemplateRequestInternal for wire transmission by stripping `type` from all history parts.
 *
 * @internal
 */
export declare function cleanTemplateRequestForWire(request: TemplateRequestInternal): TemplateRequestInternal;
