import { Schema } from "effect";

export const SHORT_CODE_LENGTH = 7;
export const SHORT_CODE_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

export const ShortCode = Schema.String.check(Schema.isPattern(new RegExp(`^[${SHORT_CODE_ALPHABET}]{${SHORT_CODE_LENGTH}}$`)));

export const ShortRequest = Schema.Struct({ prompt: Schema.String, account: Schema.NullOr(Schema.String) });

export type ShortRequest = typeof ShortRequest.Type;

export const ShortResponse = Schema.Struct({ code: Schema.String, url: Schema.String });

export type ShortResponse = typeof ShortResponse.Type;

export const randomShortCode = (bytes: Uint8Array): string => Array.from(bytes, (byte) => SHORT_CODE_ALPHABET[byte % SHORT_CODE_ALPHABET.length]).join("");
