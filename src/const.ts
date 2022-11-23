/* eslint-disable @typescript-eslint/no-non-null-assertion */
export const CARD_VERSION = '1.4.0';

export const blind_closed = "M44.12 5H6.39004C5.92004 5 5.54004 5.38 5.54004 5.86V43.98H44.96V5.85C44.96 5.38 44.58 5 44.12 5Z M5.54004 44.58C5.54004 44.75 5.67004 44.88 5.84004 44.88H44.66C44.79 44.88 44.87 44.79 44.92 44.68C44.93 44.65 44.96 44.62 44.96 44.58V43.98H5.54004V44.58Z M45.83 8.21H4.66997C4.27997 8.21 3.96997 7.9 3.96997 7.51V5.45C3.96997 5.06 4.27997 4.75 4.66997 4.75H45.82C46.21 4.75 46.52 5.06 46.52 5.45V7.51C46.53 7.89 46.21 8.21 45.83 8.21Z"
export const blind_open = "M45.4199 5H5.08989C4.69989 5 4.38989 5.31 4.38989 5.7V44.88C4.38989 45.27 4.69989 45.58 5.08989 45.58H45.4199C45.8099 45.58 46.1199 45.27 46.1199 44.88V5.7C46.1199 5.31 45.7999 5 45.4199 5ZM24.7199 42.36C24.7199 42.63 24.4999 42.85 24.2299 42.85H6.52989C6.25989 42.85 6.03989 42.63 6.03989 42.36V7.71C6.03989 7.44 6.25989 7.22 6.52989 7.22H24.2299C24.4999 7.22 24.7199 7.44 24.7199 7.71V42.36ZM44.7999 43.35C44.7999 43.62 44.5799 43.84 44.3099 43.84H26.5299C26.2599 43.84 26.0399 43.62 26.0399 43.35V7.67C26.0399 7.4 26.2599 7.18 26.5299 7.18H44.2999C44.5699 7.18 44.7899 7.4 44.7899 7.67V43.35H44.7999Z"
export const arrowUp = "M3.4375 16.1041L13 6.56246L22.5625 16.1041L25.5 13.1666L13 0.666626L0.5 13.1666L3.4375 16.1041Z"
export const pause = "M17.1667 29.5833H25.5V0.416626H17.1667V29.5833ZM0.5 29.5833H8.83333V0.416626H0.5V29.5833Z"
export const arrowDown = "M3.4375 0.391357L13 9.95386L22.5625 0.391357L25.5 3.34969L13 15.8497L0.5 3.34969L3.4375 0.391357Z"
export const mdiDotsVertical = "M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"

import { HassEntity } from "home-assistant-js-websocket";
import { CoverEntity } from "./types";

export const supportsFeature = (
  stateObj: HassEntity,
  feature: number
): boolean =>
  (stateObj.attributes.supported_features! & feature) !== 0;

  export const SUPPORT_OPEN = 1;
  export const SUPPORT_CLOSE = 2;
  export const SUPPORT_SET_POSITION = 4;
  export const SUPPORT_STOP = 8;

  export const FEATURE_CLASS_NAMES = {
    4: "has-set_position",
  };

  export const supportsOpen = (stateObj): boolean =>
    supportsFeature(stateObj, SUPPORT_OPEN);

  export const supportsClose = (stateObj): boolean =>
    supportsFeature(stateObj, SUPPORT_CLOSE);

  export const supportsSetPosition = (stateObj): boolean =>
    supportsFeature(stateObj, SUPPORT_SET_POSITION);

  export const supportsStop = (stateObj): boolean =>
    supportsFeature(stateObj, SUPPORT_STOP);

  export function isFullyOpen(stateObj: CoverEntity): boolean {
    if (stateObj.attributes.current_position !== undefined) {
      return stateObj.attributes.current_position === 100;
    }
    return stateObj.state === "open";
  }

export function isFullyClosed(stateObj: CoverEntity): boolean {
    if (stateObj.attributes.current_position !== undefined) {
      return stateObj.attributes.current_position === 0;
    }
    return stateObj.state === "closed";
  }

  export function isOpening(stateObj: CoverEntity): boolean {
    return stateObj.state === "opening";
  }

  export function isClosing(stateObj: CoverEntity): boolean {
    return stateObj.state === "closing";
  }