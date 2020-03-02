import Constants from "../../utils/constants";

export default async function deleteDuplicates() {
    await fetch(`${Constants.baseUrl}/api/races/deleteduplicates`);
}
