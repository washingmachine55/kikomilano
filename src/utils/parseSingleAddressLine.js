import { BadRequestError } from "./errors.js";

const stateWhiteList = [
	"Alabama", "AL",
	"Alaska", "AK",
	"Arizona", "AZ",
	"Arkansas", "AR",
	"California", "CA",
	"Colorado", "CO",
	"Connecticut", "CT",
	"Delaware", "DE",
	"Florida", "FL",
	"Georgia", "GA",
	"Hawaii", "HI",
	"Idaho", "ID",
	"Illinois", "IL",
	"Indiana", "IN",
	"Iowa", "IA",
	"Kansas", "KS",
	"Kentucky", "KY",
	"Louisiana", "LA",
	"Maine", "ME",
	"Maryland", "MD",
	"Massachusetts", "MA",
	"Michigan", "MI",
	"Minnesota", "MN",
	"Mississippi", "MS",
	"Missouri", "MO",
	"Montana", "MT",
	"Nebraska", "NE",
	"Nevada", "NV",
	"New Hampshire", "NH",
	"New Jersey", "NJ",
	"New Mexico", "NM",
	"New York", "NY",
	"North Carolina", "NC",
	"North Dakota", "ND",
	"Ohio", "OH",
	"Oklahoma", "OK",
	"Oregon", "OR",
	"Pennsylvania", "PA",
	"Rhode Island", "RI",
	"South Carolina", "SC",
	"South Dakota", "SD",
	"Tennessee", "TN",
	"Texas", "TX",
	"Utah", "UT",
	"Vermont", "VT",
	"Virginia", "VA",
	"Washington", "WA",
	"West Virginia", "WV",
	"Wisconsin", "WI",
	"Wyoming", "WY"
]

export const parseSingleAddressLine = async (addressInfo) => {
	const modifiedAddressInfo = []

	addressInfo.split(",").forEach(element => {
		modifiedAddressInfo.push(element.trim())
	});

	if (!Number(modifiedAddressInfo[0])) {
		throw new BadRequestError("Address must start with a number (street number)")
	} else if (modifiedAddressInfo[0].length >= 8) {
		throw new BadRequestError("Street No.  must be less than 8 characters in total")
	} else if (!stateWhiteList.includes(modifiedAddressInfo[2])) {
		throw new BadRequestError("Address State after 2nd comma is not a valid state")
	} 
	else if (!Number(modifiedAddressInfo[3].split(" ")[1])) {
		throw new BadRequestError("Address Postal/Zip code must be a number")
	}
	else if (modifiedAddressInfo[3].split(" ")[1].length !== 5) {
		throw new BadRequestError("Address Postal/Zip code must exactly be 5 numeric characters")
	}
	
	else {
		return modifiedAddressInfo
	}

}