import axios from "axios"
import APICONST from './APIConst'

const fetchDashboardList = (day) => {
    const { BASE_URL, PREFIX, DASHBOARD_REQUEST} = APICONST;
    const dashboardFetchBaseUrl = BASE_URL+ PREFIX + DASHBOARD_REQUEST;
    const currentTime = new Date();
    const dashboardFetchUrl = `${dashboardFetchBaseUrl}?day=${day}&timestamp=${currentTime.getTime()}`
    return axios.get(dashboardFetchUrl);
}
export default fetchDashboardList;

