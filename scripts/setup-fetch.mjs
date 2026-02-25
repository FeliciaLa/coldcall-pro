/**
 * Polyfill fetch/Headers for Node < 18 so the OpenAI client works.
 * Must be imported first in any script that uses the OpenAI package.
 */
import { fetch, Headers, Request, Response } from "undici";
globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
