/**
 * @license
 * Copyright 2026 Google LLC
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
 * Create a `ReadableStream` from a string.
 *
 * @param content - Bundle in string.
 * @param bytesPerRead - How many bytes to read from the underlying buffer from
 * each read through the stream.
 */
export declare function byteStreamReaderFromString(content: string, bytesPerRead: number): ReadableStreamDefaultReader<Uint8Array>;
