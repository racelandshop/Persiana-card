/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HassEntity } from "home-assistant-js-websocket";

export const supportsFeature = (
  stateObj: HassEntity,
  feature: number
): boolean =>
  (stateObj.attributes.supported_features! & feature) !== 0;
