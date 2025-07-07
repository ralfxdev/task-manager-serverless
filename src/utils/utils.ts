import * as moment from "moment-timezone";
import { Constants } from './constants';

export class Utils {

  static extractTraceID(xAmznTraceId: string): string {
    if (Utils.isEmpty(xAmznTraceId)) {
      return '';
    }
    const match = String(xAmznTraceId).match(Constants.REGEX.AMZ_TRACE_ID);
    if (!match || !match[2]) {
      return '';
    }
    return match[2];
  }

  static isEmpty(value: any) {
    if (value === undefined || value === null || value === '') {
      return true;
    }
    if (Array.isArray(value) === true) {
      return value.length === 0;
    }
    if (typeof value === 'object' && Object.keys(value).length === 0) {
      return true;
    }
    return false;
  }

  static getTokenFromHeader(value: string) {
    if (value !== null && value !== undefined) {
      const token = value.split('Bearer ');
      if (token !== undefined && token !== null && token.length > 0) {
        return token[1];
      }
    }
    return value;
  }

  static parseStringToJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (error) { }
    return value;
  }

  static getTokenFromHeaders(headers: any): string {
    //@ts-ignore
    return headers['authorization'] || headers['Authorization'];
  }

  static formatDate(unixDate: number) {
    return moment
      .tz(unixDate, Constants.TIME_ZONE)
      .format(Constants.DATE_FORMAT_DAY_HOUR);
  }
}
