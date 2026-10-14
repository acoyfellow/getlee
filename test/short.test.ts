import { Schema } from "effect";
import { describe, expect, test } from "vitest";
import { randomShortCode, SHORT_CODE_LENGTH, ShortCode } from "../shared/short";

describe("short codes", () => {
	test("random bytes always make a valid code with no look-alike characters", () => {
		for (let round = 0; round < 500; round += 1) {
			const code = randomShortCode(crypto.getRandomValues(new Uint8Array(SHORT_CODE_LENGTH)));
			expect(Schema.is(ShortCode)(code)).toBe(true);
			expect(/[01lIoO]/.test(code)).toBe(false);
		}
	});

	test("paths and junk are not codes", () => {
		for (const bad of ["", "abc", "../etc", "abcdefgh", "abc 234", "abcd0fg"]) expect(Schema.is(ShortCode)(bad)).toBe(false);
	});
});
