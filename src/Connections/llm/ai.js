import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";

export const gpt = openai('gpt-4o');
export const claude = anthropic('claude-3-5-sonnet-latest');
export const gemini = google('gemini-2.5-flash');
export const grok = xai('grok-4.7');