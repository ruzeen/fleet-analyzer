import fs from "fs/promises";
import { checkAvailabilityAndOverbooking } from "../main.js";

async function getData() {
  const file = await fs.readFile("./test/sampleData.json", "utf-8");
  const data = JSON.parse(file);

  return data;
}

const data = await getData();

const result1 = checkAvailabilityAndOverbooking(
  "9/27/2025",
  "10/2/2025",
  ["STAR", "MVAR", "UFAR"],
  data
);

console.log("Availability: ", result1.availability);
console.log("SIPP Data: ", result1.overbooking);
