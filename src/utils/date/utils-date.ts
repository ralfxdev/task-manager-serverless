import moment from "moment-timezone";
import { Constants } from '../constants';

export class UtilDate {

    static getResponseDate() {
        return moment((new Date().getTime())).tz(Constants.TIME_ZONE).format(Constants.DATE_FORMAT_DAY_HOUR);
    }

    static getUnixDate() {
        return (new Date().getTime() / 1000) | 0;
    }
}

