/**
 * Free-text GitHub location → country, plus a simple drawable flag.
 * Flags are drawn on a 30x20 grid. Simplified on purpose: they render at 34x22.
 */

export type FlagShape =
  | { kind: "h"; colors: readonly string[]; weights?: readonly number[] }
  | { kind: "v"; colors: readonly string[]; weights?: readonly number[] }
  | { kind: "nordic"; field: string; cross: string; inner?: string }
  | { kind: "disc"; field: string; disc: string; offset?: number }
  | { kind: "custom"; id: CustomFlag };

export type CustomFlag = "US" | "GB" | "IN" | "BR" | "CN" | "VN" | "TR" | "CH" | "KR" | "CA" | "AU" | "NZ" | "PK" | "IL" | "PT" | "CL" | "ZA" | "AE";

export interface Country {
  code: string;
  name: string;
  flag: FlagShape;
}

interface CountryDef extends Country {
  aliases: readonly string[];
  cities: readonly string[];
}

const C = (
  code: string,
  name: string,
  flag: FlagShape,
  aliases: readonly string[] = [],
  cities: readonly string[] = [],
): CountryDef => ({ code, name, flag, aliases, cities });

const custom = (id: CustomFlag): FlagShape => ({ kind: "custom", id });

const COUNTRIES: readonly CountryDef[] = [
  C("US", "United States", custom("US"), ["usa", "us", "united states of america", "america", "u.s.", "u.s.a."], [
    "san francisco", "sf", "new york", "nyc", "new york city", "seattle", "austin", "boston", "los angeles", "chicago",
    "bay area", "silicon valley", "brooklyn", "portland", "denver", "atlanta", "miami", "san diego", "san jose", "washington dc",
    "palo alto", "mountain view", "california", "texas", "oakland",
  ]),
  C("GB", "United Kingdom", custom("GB"), ["uk", "england", "scotland", "wales", "great britain", "britain", "u.k."], [
    "london", "manchester", "edinburgh", "cambridge", "oxford", "bristol", "glasgow", "birmingham", "leeds",
  ]),
  C("DE", "Germany", { kind: "h", colors: ["#000000", "#DD0000", "#FFCE00"] }, ["deutschland"], ["berlin", "munich", "münchen", "hamburg", "frankfurt", "cologne", "köln", "stuttgart"]),
  C("FR", "France", { kind: "v", colors: ["#002395", "#FFFFFF", "#ED2939"] }, [], ["paris", "lyon", "marseille", "toulouse"]),
  C("IN", "India", custom("IN"), ["bharat"], [
    "bangalore", "bengaluru", "mumbai", "delhi", "new delhi", "hyderabad", "pune", "chennai", "kolkata", "noida", "gurgaon",
    "gurugram", "ahmedabad", "jaipur", "kochi", "indore",
  ]),
  C("JP", "Japan", { kind: "disc", field: "#FFFFFF", disc: "#BC002D" }, [], ["tokyo", "osaka", "kyoto", "yokohama"]),
  C("CN", "China", custom("CN"), ["prc"], ["beijing", "shanghai", "shenzhen", "hangzhou", "guangzhou", "chengdu"]),
  C("BR", "Brazil", custom("BR"), ["brasil"], ["são paulo", "sao paulo", "rio de janeiro", "belo horizonte", "curitiba"]),
  C("CA", "Canada", custom("CA"), [], ["toronto", "vancouver", "montreal", "montréal", "ottawa", "calgary", "waterloo"]),
  C("NL", "Netherlands", { kind: "h", colors: ["#AE1C28", "#FFFFFF", "#21468B"] }, ["holland", "the netherlands"], ["amsterdam", "rotterdam", "utrecht", "the hague", "eindhoven"]),
  C("ES", "Spain", { kind: "h", colors: ["#AA151B", "#F1BF00", "#AA151B"], weights: [1, 2, 1] }, ["españa", "espana"], ["madrid", "barcelona", "valencia", "seville"]),
  C("IT", "Italy", { kind: "v", colors: ["#009246", "#FFFFFF", "#CE2B37"] }, ["italia"], ["rome", "roma", "milan", "milano", "turin", "naples"]),
  C("PT", "Portugal", custom("PT"), [], ["lisbon", "lisboa", "porto"]),
  C("SE", "Sweden", { kind: "nordic", field: "#006AA7", cross: "#FECC00" }, ["sverige"], ["stockholm", "gothenburg", "malmö"]),
  C("NO", "Norway", { kind: "nordic", field: "#BA0C2F", cross: "#FFFFFF", inner: "#00205B" }, ["norge"], ["oslo", "bergen"]),
  C("DK", "Denmark", { kind: "nordic", field: "#C8102E", cross: "#FFFFFF" }, ["danmark"], ["copenhagen", "aarhus"]),
  C("FI", "Finland", { kind: "nordic", field: "#FFFFFF", cross: "#002F6C" }, ["suomi"], ["helsinki", "espoo", "tampere"]),
  C("PL", "Poland", { kind: "h", colors: ["#FFFFFF", "#DC143C"] }, ["polska"], ["warsaw", "kraków", "krakow", "wrocław", "wroclaw", "gdańsk"]),
  C("UA", "Ukraine", { kind: "h", colors: ["#0057B7", "#FFD700"] }, [], ["kyiv", "kiev", "lviv", "kharkiv", "odesa"]),
  C("RU", "Russia", { kind: "h", colors: ["#FFFFFF", "#0039A6", "#D52B1E"] }, ["russian federation"], ["moscow", "saint petersburg", "st. petersburg"]),
  C("NG", "Nigeria", { kind: "v", colors: ["#008751", "#FFFFFF", "#008751"] }, [], ["lagos", "abuja", "ibadan"]),
  C("KE", "Kenya", { kind: "h", colors: ["#000000", "#FFFFFF", "#BB0000", "#FFFFFF", "#006600"], weights: [6, 1, 6, 1, 6] }, [], ["nairobi", "mombasa"]),
  C("GH", "Ghana", { kind: "h", colors: ["#CE1126", "#FCD116", "#006B3F"] }, [], ["accra", "kumasi"]),
  C("ZA", "South Africa", custom("ZA"), [], ["cape town", "johannesburg", "durban", "pretoria"]),
  C("EG", "Egypt", { kind: "h", colors: ["#CE1126", "#FFFFFF", "#000000"] }, [], ["cairo", "alexandria"]),
  C("AU", "Australia", custom("AU"), [], ["sydney", "melbourne", "brisbane", "perth", "adelaide"]),
  C("NZ", "New Zealand", custom("NZ"), [], ["auckland", "wellington", "christchurch"]),
  C("KR", "South Korea", custom("KR"), ["korea", "republic of korea"], ["seoul", "busan"]),
  C("SG", "Singapore", { kind: "h", colors: ["#EF3340", "#FFFFFF"] }, [], []),
  C("ID", "Indonesia", { kind: "h", colors: ["#CE1126", "#FFFFFF"] }, [], ["jakarta", "bandung", "surabaya", "bali"]),
  C("PK", "Pakistan", custom("PK"), [], ["karachi", "lahore", "islamabad"]),
  C("BD", "Bangladesh", { kind: "disc", field: "#006A4E", disc: "#F42A41", offset: -1.5 }, [], ["dhaka", "chittagong"]),
  C("VN", "Vietnam", custom("VN"), ["viet nam"], ["hanoi", "ho chi minh city", "saigon", "da nang"]),
  C("MX", "Mexico", { kind: "v", colors: ["#006847", "#FFFFFF", "#CE1126"] }, ["méxico"], ["mexico city", "cdmx", "guadalajara", "monterrey"]),
  C("AR", "Argentina", { kind: "h", colors: ["#74ACDF", "#FFFFFF", "#74ACDF"] }, [], ["buenos aires", "córdoba", "rosario"]),
  C("CO", "Colombia", { kind: "h", colors: ["#FCD116", "#003893", "#CE1126"], weights: [2, 1, 1] }, [], ["bogotá", "bogota", "medellín", "medellin"]),
  C("CL", "Chile", custom("CL"), [], ["santiago"]),
  C("CH", "Switzerland", custom("CH"), ["schweiz", "suisse"], ["zurich", "zürich", "geneva", "basel", "lausanne", "bern"]),
  C("AT", "Austria", { kind: "h", colors: ["#ED2939", "#FFFFFF", "#ED2939"] }, ["österreich"], ["vienna", "wien", "graz"]),
  C("BE", "Belgium", { kind: "v", colors: ["#000000", "#FDDA24", "#EF3340"] }, [], ["brussels", "antwerp", "ghent"]),
  C("IE", "Ireland", { kind: "v", colors: ["#169B62", "#FFFFFF", "#FF883E"] }, [], ["dublin", "cork"]),
  C("TR", "Türkiye", custom("TR"), ["turkey", "turkiye"], ["istanbul", "ankara", "izmir"]),
  C("IL", "Israel", custom("IL"), [], ["tel aviv", "jerusalem", "haifa"]),
  C("AE", "United Arab Emirates", custom("AE"), ["uae", "u.a.e."], ["dubai", "abu dhabi"]),
  C("RO", "Romania", { kind: "v", colors: ["#002B7F", "#FCD116", "#CE1126"] }, [], ["bucharest", "cluj-napoca", "cluj"]),
  C("HU", "Hungary", { kind: "h", colors: ["#CE2939", "#FFFFFF", "#477050"] }, [], ["budapest"]),
  C("EE", "Estonia", { kind: "h", colors: ["#0072CE", "#000000", "#FFFFFF"] }, [], ["tallinn", "tartu"]),
  C("LT", "Lithuania", { kind: "h", colors: ["#FDB913", "#006A44", "#C1272D"] }, [], ["vilnius", "kaunas"]),
  C("TH", "Thailand", { kind: "h", colors: ["#A51931", "#F4F5F8", "#2D2A4A", "#F4F5F8", "#A51931"], weights: [1, 1, 2, 1, 1] }, [], ["bangkok", "chiang mai"]),
];

/** US state codes after a comma ("Austin, TX") mean the US. */
const US_STATES = new Set(["CA", "NY", "WA", "TX", "MA", "IL", "CO", "OR", "GA", "NC", "VA", "FL", "PA", "NJ", "MI", "MN", "AZ", "UT", "OH", "MD"]);

const INDEX: ReadonlyMap<string, CountryDef> = (() => {
  const map = new Map<string, CountryDef>();
  for (const c of COUNTRIES) {
    for (const key of [c.name.toLowerCase(), c.code.toLowerCase(), ...c.aliases, ...c.cities]) {
      if (!map.has(key)) map.set(key, c);
    }
  }
  return map;
})();

function strip({ code, name, flag }: CountryDef): Country {
  return { code, name, flag };
}

/** Best guess at a country from a free-text location. null when unknown. */
export function countryFromLocation(location: string | null | undefined): Country | null {
  if (!location) return null;
  const parts = location
    .split(/[,/|·•()]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const reversed = [...parts].reverse();

  // 1. Names and cities. Last part is usually the country ("Berlin, Germany"), so check from the end.
  for (const part of reversed) {
    const hit = part.length > 2 ? INDEX.get(part.toLowerCase()) : undefined;
    if (hit) return strip(hit);
  }

  // 2. Two-letter codes, only when written in capitals ("Austin, TX", "DE").
  for (const part of reversed) {
    if (part.length !== 2 || part !== part.toUpperCase()) continue;
    if (US_STATES.has(part)) return strip(INDEX.get("us")!);
    const hit = INDEX.get(part.toLowerCase());
    if (hit) return strip(hit);
  }

  // 3. Word search for names inside longer text ("Greater London Area").
  const lower = ` ${location.toLowerCase().replace(/[^\p{L}\s]+/gu, " ")} `;
  for (const [key, c] of INDEX) {
    if (key.length > 3 && lower.includes(` ${key} `)) return strip(c);
  }
  return null;
}

export function countryByCode(code: string): Country | null {
  const c = COUNTRIES.find((x) => x.code === code);
  return c ? strip(c) : null;
}
