import { z } from "zod";

const specialCharactersReGex = RegExp(/([!#$%^&*()?"':;{}|<>\\/])|(\.{2,})/g)
const extraSpacesReGex = RegExp(/\s+/g)
const trimAndLowerCaseSchema = z.string().trim().toLowerCase()

export class TextModification {
	constructor(input) {
		this.input = input
	}

	async toLowerCaseAndTrimWhitespace() {
		return await trimAndLowerCaseSchema.safeParseAsync(this.input)
	}

	async fullySanitizeObjectKey() {
		return await z.transform((obj) =>
			Object.fromEntries(
				Object.entries(obj).map(([key, value]) => [
					key.trim()
						.toLowerCase()
						.replace(specialCharactersReGex, "")
						.replace(extraSpacesReGex, ' ')
						.replaceAll(' ', "_"),

					value
				])
			)
		).safeParseAsync(this.input)
	}

	async fullySanitizeObjectValue() {
		return await z.transform((obj) =>
			Object.fromEntries(
				Object.entries(obj).map(([key, value]) => [
					key,
					value.trim()
						.toLowerCase()
						.replace(specialCharactersReGex, "")
						.replace(extraSpacesReGex, ' ')
				])
			)
		).safeParseAsync(this.input)
	}

	async fullySanitizeObject() {
		return await z.transform((obj) =>
			Object.fromEntries(
				Object.entries(obj).map(([key, value]) => [
					key.trim()
						.toLowerCase()
						.replace(specialCharactersReGex, "")
						.replace(extraSpacesReGex, ' ')
						.replaceAll(' ', "_"),

					value.trim()
						.toLowerCase()
						.replace(specialCharactersReGex, "")
						.replace(extraSpacesReGex, ' ')
				])
			)
		).safeParseAsync(this.input)
	}
}