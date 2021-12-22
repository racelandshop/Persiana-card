/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RippleHandlers } from "@material/mwc-ripple/ripple-handlers";
import { Ripple } from '@material/mwc-ripple';
import { html, TemplateResult, css, PropertyValues, CSSResultGroup, LitElement} from 'lit';
import { HassEntity } from 'home-assistant-js-websocket'
import { queryAsync } from 'lit-element'
import { customElement, property, state } from "lit/decorators";
import { findEntities } from "./././find-entities";
import { ifDefined } from "lit/directives/if-defined";
import { classMap } from "lit/directives/class-map";
import { HomeAssistant, hasConfigOrEntityChanged, hasAction, ActionHandlerEvent, handleAction, LovelaceCardEditor, getLovelace } from 'custom-card-helpers';
import './editor';
import type { BoilerplateCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

// const op = "M.32 2.559c0 1.59.16 2.398.48 2.757.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.321-.359.481-1.168.481-2.757V.324H.32Zm45.86 23.53v20.579H2.887V5.508H46.18Zm0 0";
// const closed = "M3.527 7.941v1.457h42.008V6.48H3.527Zm0 3.239v1.46h42.008V9.724H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.238v1.461h42.008v-2.918H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.243v1.457h42.008v-2.918H3.527Zm0 3.238v1.46h42.008v-2.917H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.242v1.457h42.008v-2.918H3.527Zm0 3.238v1.461h42.008v-2.918H3.527Zm0 3.243v1.457h42.008V38.89H3.527Zm0 3.242v1.457h42.008v-2.918H3.527Zm0 0";

const open = "M.32 2.559c0 1.59.16 2.398.48 2.757.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.321-.359.481-1.168.481-2.757V.324H.32Zm45.86 23.53v20.579H25.977V5.508H46.18Zm-21.809 0v18.958H4.488V7.129h19.883Zm0 0";
const close = "M2.887 26.09v20.578H46.18V5.508H2.887Zm0 0";

// const up = "M24.613.86C21.253 7.444.023 49.823.023 49.944c0 .02.016.032.036.032.062 0 4.863-2.075 20.406-8.813 2.48-1.078 4.527-1.953 4.55-1.953.02 0 3.055 1.305 6.743 2.902 12.816 5.547 18.183 7.856 18.207 7.832C50 49.906 25.165.18 25.055.07c-.016-.015-.18.285-.442.79Zm0 0";
// const down = "M49.395.254c-.918.39-7.461 3.223-15.946 6.894-4.62 2.004-8.43 3.645-8.46 3.645-.04 0-2.321-.977-5.079-2.172C8.203 3.555.887.398.305.171.184.126.082.102.082.118c0 .098 24.816 49.801 24.867 49.801.04 0 2.801-5.469 9.2-18.211C39.761 20.527 49.956.129 49.956.078c0-.058-.027-.05-.562.176Zm0 0";
// const stop = "M2.043 24.625v22.168h45.914V2.457H2.043Zm0 0";

console.info(
  `%c  RACELAND-persiana-card \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'persiana-card',
  name: 'Persiana',
  preview: true //IMPORTANTE
});
@customElement('persiana-card')

export class BoilerplateCard extends LitElement {
  [x: string]: any;

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('persiana-card-editor');
  }

  @queryAsync('mwc-ripple') private _ripple!: Promise<Ripple | null>;

  setPickerPositionPercentage: any;

  public static getStubConfig(
    hass: HomeAssistant,
    entities: string[],
    entitiesFallback: string[]
  ): BoilerplateCardConfig {
    const includeDomains = ["cover"];
    const maxEntities = 1;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      includeDomains
    );
    return { type: "custom:persiana-card", entity: foundEntities[0] || "", "name": "Persiana", "title_position": "top", "buttons_position": "right", "invert_percentage": "false", blind_color: "#FFD580", entities: "any", title: "any", show_name: "any", show_state: "any", icon: [open, close], show_icon: "any" }; //pressed_icon: [up, stop, down]
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private config!: BoilerplateCardConfig;

  public setConfig(config: BoilerplateCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalidconfiguration'));
    }
    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      show_icon: true,
      icon: 'mdi:blinds',
      ...config,
      tap_action: {
        action: "toggle",
      },
    };
  }

  set homeassistant(_homeassistant: any) {
    const _this = this;
    const entities = this.config.entities;

    if (!this.card) {
      const card = document.createElement('ha-card');
    }
    if (this.config.title) {
      this.card.header = this.config.title;
    }
    this.card = this.card;
    this.appendChild(this.card);

    let allBlinds = document.createElement('div');
    allBlinds.className = 'sc-blinds';

    entities.forEach(function (entity) {
      let entityId = entity;
      if (entity && entity.entity) {
        entityId = entity.entity;
      }

      let buttonsPosition = 'left';
      if (entity && entity.buttons_position) {
        buttonsPosition = entity.buttons_position.toLowerCase();
      }

      let titlePosition = 'top';
      if (entity && entity.title_position) {
        titlePosition = entity.title_position.toLowerCase();
      }

      let invertPercentage = false;
      if (entity && entity.invert_percentage) {
        invertPercentage = entity.invert_percentage;
      }

      let blindColor = '#FFD580';
      if (entity && entity.blind_color) {
        blindColor = entity.blind_color;
      }

      let blind = document.createElement('div');

      blind.className = 'sc-blind';
      blind.dataset.blind = entityId;

      let picture = blind.querySelector('.sc-blind-selector-picture');
      let slide = blind.querySelector('.sc-blind-selector-slide');
      let picker = blind.querySelector('.sc-blind-selector-picker');

      let mouseDown = function (event) {
        if (event.cancelable) {
          event.preventDefault();
        }
        _this.isUpdating = true;

        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('touchmove', mouseMove);
        document.addEventListener('pointermove', mouseMove);

        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('touchend', mouseUp);
        document.addEventListener('pointerup', mouseUp);
      };

      let mouseMove = function (event) {
        let newPosition = event.pageY - _this.getPictureTop(picture);
        _this.setPickerPosition(newPosition, picker, slide);
      };

      let mouseUp = function (event) {
        let newPosition = event.pageY - _this.getPictureTop(picture);
        _this.setPickerPosition(newPosition, picker, slide);
      };

      picker.addEventListener('mousedown', mouseDown);
      picker.addEventListener('touchstart', mouseDown);
      picker.addEventListener('pointerdown', mouseDown);

      // blind.querySelectorAll('.sc-blind-button').forEach(function () {
      //   onclick = function () {
      //     const command = this.dataset.command;

      //     let service = '';

      //     switch (command) {
      //       case 'up':
      //         service = 'open_cover';
      //         break;

      //       case 'down':
      //         service = 'close_cover';
      //         break;

      //       case 'stop':
      //         service = 'stop_cover';
      //         break;
      //     }

      //     _homeassistant.callService('cover', service, {
      //       entity_id: entityId
      //     });

      //   };
      // });
      allBlinds.appendChild(blind);
    });
  }

  public translate_state(stateObj): string {
    if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "on") {
      return localize("states.on");
    }
    else if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off") {
      return localize("states.off");
    }
    else if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "unavailable") {
      return localize("states.unavailable");
    }
    else {
      return ""
    }
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }
    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected renderSwitch(param): string {
    switch (param) {
      case 'foo':
        return 'bar';
      default:
        return 'foo';
    }
  }

  protected render(): TemplateResult | void {
    if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

    const stateObj = this.config.entity
      ? this.hass.states[this.config.entity]
      : undefined;

    return html`

<ha-card
        class="hassbut ${classMap({
          "state-on": ifDefined(
          stateObj ? this.computeActiveState(stateObj) : undefined) === "on",
        "state-off": ifDefined(
          stateObj ? this.computeActiveState(stateObj) : undefined) === "off",
      })}"
        @action=${this._handleAction}
        @focus="${this.handleRippleFocus}"
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`persiana: ${this.config.entity || 'No Entity Defined'}`}
      >
      ${this.config.show_icon
          ? html`
            <svg class=${classMap({
                "svgicon-blind":
                  (JSON.stringify(this.config.icon) == JSON.stringify([close, open])),
                }
                )
            }
              viewBox="0 0 50 50" height="100%" width="75%" >
              <path fill="#a9b1bc" d=${this.config.icon[0]} />
              <path class=${classMap({
                "state-on-blind-icon":
                  ifDefined(stateObj? this.computeActiveState(stateObj) : undefined) === "on" && (JSON.stringify(this.config.icon) ==JSON.stringify([close, open])),
                "state-off-blind-icon":
                  ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off" && (JSON.stringify(this.config.icon) == JSON.stringify([close, open])),
                "state-unavailable":
                  ifDefined(stateObj? this.computeActiveState(stateObj) : undefined) === "unavailable",
              }
                  )
              }
              d=${this.config.icon[1]} />
            </svg>
            <div class="divibut"></div>
            `
    : ""}

    ${this.config.show_name
    ? html`
      <div tabindex = "-1" class="name-div">
      ${this.config.name}
        </div>
        <div></div>
      `
    : ""}

    ${this.config.show_state
    ? html`
      <div tabindex="-1" class="state-div">
      ${this.translate_state(stateObj)}
      <div class="position"></div>
     </div><div></div>`: ""}
      </ha-card>
    `;
  }

private computeActiveState = (stateObj: HassEntity): string => {
  const domain = stateObj.entity_id.split(".")[0];
  let state = stateObj.state;
  if (domain === "climate") {
    state = stateObj.attributes.hvac_action;
  }
  return state;
};

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });
    return html`
      ${errorCard}
    `;
  }

  private computeObjectId = (entityId: string): string =>
    entityId.substr(entityId.indexOf(".") + 1);

  private computeStateName = (stateObj: HassEntity): string =>
    stateObj.attributes.friendly_name === undefined
      ? this.computeObjectId(stateObj.entity_id).replace(/_/g, " ")
      : stateObj.attributes.friendly_name || "";

  private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    return this._ripple;
  });

  private handleRippleFocus() {
    this._rippleHandlers.startFocus();
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        cursor: pointer;
        display: grid;
        flex-direction: column;
        align-items: left;
        text-align: left;
        padding: 10% 10% 10% 10%;
        font-size: 18px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        justify-content: left;
        position: relative;
        background: var(--card-color-background, rgba(53,53,53,0.9));
        color: var(--card-color-text, white);
        border-radius: 25px;
        overflow: hidden;
      }

      ha-icon {
        width: 70%;
        height: 80%;
        padding-bottom: 15px;
        margin: 0% 0% 0% 0%;
        color: var(--paper-item-icon-color, #fdd835);
        --mdc-icon-size: 100%;
      }

      ha-icon + span {
        text-align: left;
      }

      span {
        margin: 5% 50% 1% 0%;
        padding: 0% 100% 1% 0%;
      }

      .divibut {
        padding-bottom: 0%;
        margin-bottom: 0%;
      }

      ha-icon,
      span {
        outline: none;
      }

      .state {
        margin: 0% 50% 5% 0%;
        padding: 0% 100% 5% 0%;
        text-align: left;
      }

      .hassbut.state-off {
        padding-top: 50px;
        text-align: left;
      }

      .hassbut.state-on {
        text-align: left;
      }

      .hassbut {
        display: grid;
        grid-template-columns: 50% 50%;
      }

      .state-div {
        padding: 0% 100% 10% 0%;
        align-items: left;
      }

      .name-div {
        padding: 0% 100% 1% 0%;
        align-items: left;
      }

      .invert_percentage {
        align-items: right;

      }

      .svgicon-blind {
        padding-bottom: 20px;
        max-width: 170px;
        transform: translate(62%, 55%) scale(2.5);
      }

      .svgicon-up {
        padding-left: 50px;
        padding-bottom: 40px;
      }

      .svgicon-down {
        padding-left: 50px;
        padding-bottom: 30px;
      }

      .svigicon-stop {
        padding-left: 50px;
        padding-bottom: 20px;
      }

      .state {
        animation: state 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      .state-on-up-icon {
        fill: #a9b1bc;
        transform: translate(15px);
        transition: 2s ease;
      }

      .state-on-down-icon {
        fill: #a9b1bc;
        transform: translate(0px);
        transition: 2s ease;
      }

      .state-on-stop-icon {
        fill: #a9b1bc;
        animation-play-state: paused;
      }

      .state-off-stop-icon {
        fill: #a9b1bc;
        animation-play-state: running;
      }

      .state-on-blind-icon {
        transform: scale(0);
        fill: #ffffff;
      }

      .state-off-blind-icon {
        fill: #a9b1bc;
      }

      .state-unavailable {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }

      .opacity {
        animation: opacity 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      .reverse {
        animation-direction: reverse;
      }

      @keyframes state {
        0% {
          transform: none;
          fill: #9da0a2;
        }
        100% {
          transform: skewY(10deg) translate(4.5%, -3.9%) scaleX(0.8);
          fill: #b68349;
        }
      }

      @keyframes opacity {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    `;
  }
}
