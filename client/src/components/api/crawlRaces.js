import Constants from "../../utils/constants";

export default async function crawlRaces(horsesFromYear, horsesToYear) {
    await fetch(`${Constants.baseUrl}/api/races/scrape?horsesFromYear=${horsesFromYear}&horsesToYear=${horsesToYear}`);
}
