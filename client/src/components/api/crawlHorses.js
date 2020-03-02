import Constants from "../../utils/constants";

export default async function crawlHorses(horsesYear) {
    await fetch(`${Constants.baseUrl}/api/horses/scrape?year=${horsesYear}`);
}
