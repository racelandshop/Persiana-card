/* eslint-disable @typescript-eslint/no-explicit-any */
import { RippleHandlers } from "@material/mwc-ripple/ripple-handlers";
import { Ripple } from '@material/mwc-ripple';
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup} from 'lit';
import { HassEntity } from 'home-assistant-js-websocket'
import { queryAsync } from 'lit-element'
import { customElement, property, state } from "lit/decorators";
import { findEntities } from "./././find-entities";
import { ifDefined } from "lit/directives/if-defined";
import { classMap } from "lit/directives/class-map";
import { HomeAssistant, hasConfigOrEntityChanged, hasAction, ActionHandlerEvent, handleAction, LovelaceCardEditor, getLovelace, computeDomain} from 'custom-card-helpers';
import './editor';
import type { BoilerplateCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

const open = "M.113 2.52v2.402H1.13v44.871h47.719V4.922h1.015V.113H.113Zm47.043 3.949v.742H2.707V5.723h44.45Zm0 21.117v20.148H2.707V7.441h44.45Zm0 0";
const closed = "M.113 2.52v2.402H1.13v44.871h47.719V4.922h1.015V.113H.113Zm46.93 3.89v.688H2.82V5.723h44.223Zm0 1.547v.742H2.82V7.211h44.223Zm0 1.543v.688H2.82V8.812h44.223Zm0 1.547v.742H2.82v-1.488h44.223Zm0 1.601v.747H2.82v-1.489h44.223Zm0 1.602v.746H2.82v-1.488h44.223Zm0 1.605v.743H2.82v-1.489h44.223Zm0 1.602v.742H2.82v-1.488h44.223Zm0 1.543v.688H2.82v-1.372h44.223Zm0 1.547v.746H2.82v-1.488h44.223Zm0 1.547v.687H2.82v-1.375h44.223Zm0 1.488v.684H2.82v-1.371h44.223Zm0 1.543v.746H2.82v-1.488h44.223Zm0 1.602v.746H2.82v-1.489h44.223Zm0 1.546v.688H2.82v-1.375h44.223Zm0 1.489v.687H2.82v-1.375h44.223Zm0 1.547v.742H2.82v-1.489h44.223Zm0 1.66v.8H2.82v-1.605h44.223Zm0 1.601v.688H2.82v-1.375h44.223Zm0 1.543v.746H2.82v-1.488h44.223Zm0 1.606v.742H2.82v-1.488h44.223Zm0 1.543v.687H2.82v-1.375h44.223Zm0 1.547v.742H2.82v-1.489h44.223Zm0 1.543v.687H2.82v-1.371h44.223Zm0 1.546v.747H2.82v-1.489h44.223Zm0 1.547v.688H2.82v-1.375h44.223Zm0 1.543v.746H2.82v-1.488h44.223Zm0 0";

const blind = this.card.querySelector('div[data-blind="' + entityId +'"]');
const slide = blind.querySelector('.sc-blind-selector-slide');
const picker = blind.querySelector('.sc-blind-selector-picker');

const state = this.homeassistant.states[entityId];
const friendlyName = (entity && entity.name) ? entity.name : state ? state.attributes.friendly_name : 'unknown';
const currentPosition = state ? state.attributes.current_position : 'unknown';

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

export class BoilerplateCard extends HTMLElement {
  isUpdating: boolean | undefined;
  setPickerPosition: any;
  getPictureTop: any;
  minPosition: number;
  maxPosition: number;
  updateBlindPosition: any;
  card: any;
  private _showError: any;
  private _showWarning: any;

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
    return { type: "custom:persiana-card", entity: "cover.left_living_blind", name: "Persiana", title_position: "bottom", buttons_position: "left", invert_percentage: "false", blind_color: "#FFD580" };
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

      let titlePosition = 'bottom';
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
      // blind.innerHTML = `

      //   <div class="sc-blind-top" ` + (titlePosition == 'bottom' ? 'style="display:none;"' : '') + `>
      //     <div class="sc-blind-label">
      //     </div>
      //     <div class="sc-blind-position">
      //     </div
      //   </div>
      //   <div class="sc-blind-middle" style="flex-direction: ` + (buttonsPosition == 'right' ? 'row-reverse' : 'row') + `;">
      //     <div class="sc-blind-buttons">
      //     <ha-icon-button class="sc-blind-button" data-command="up"><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button><br>
      //     <ha-icon-button class="sc-blind-button" data-command="stop"><ha-icon icon="mdi:stop"></ha-icon></ha-icon-button><br>
      //     <ha-icon-button class="sc-blind-button" data-command="down"><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button>
      //   </div>
      //   <div class="sc-blind-selector">
      //     <div class="sc-blind-selector-picture">
      //       <div class="sc-blind-selector-slide"></div>
      //       <div class="sc-blind-selector-picker"></div>
      //     </div>
      //   </div>
      //   </div>
      //   <div class0"sc-blind-bottom" ` + (titlePosition != 'bottom' ? 'style="display:none;"' : '') + `>
      //     <div class="sc-blind-label">
      //     </div>
      //     <div class="sc-blind-position">
      //     </div>
      //   </div>
      // `;

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
        _this.isUpdating = false;

        let newPosition = event.pageY - _this.getPictureTop(picture);

        if (newPosition < _this.minPosition)
          newPosition = _this.minPosition;

        if (newPosition < _this.maxPosition)
          newPosition = _this.maxPosition;

        let percentagePosition = (newPosition - _this.minPosition) * 100 / (_this.maxPosition - _this.minPosition);

        if (invertPercentage) {
          _this.updateBlindPosition(_homeassistant, entityId, percentagePosition);
        } else {
          _this.updateBlindPosition(_homeassistant, entityId, 100 - percentagePosition);
        }

        document.removeEventListener('mousemove', mouseMove);
        document.removeEventListener('touchmove', mouseMove);
        document.removeEventListener('pointermove', mouseMove);

        document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('touchend', mouseUp);
        document.removeEventListener('pointerup', mouseUp);
      };

      picker.addEventListener('mousedown', mouseDown);
      picker.addEventListener('touchstart', mouseDown);
      picker.addEventListener('pointerdown', mouseDown);

      blind.querySelectorAll('.sc-blind-button').forEach(function() {
        onclick = function () {
          const command = this.dataset.command;

          let service = '';

          switch (command) {
            case 'up':
              service = 'open_cover';
              break;

            case 'down':
              service = 'close_cover';
              break;

            case 'stop':
              service = 'stop_cover';
              break;
          }

          _homeassistant.callService('cover', service, {
            entity_id: entityId
          });

        };
      });
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
  <div
  class="sc-blind-top ${classMap({
    "titlePosition": ifDefined(
      stateObj ? this.computeActiveState(stateObj) : undefined) == 'bottom' ? 'style="display: none; "' : '') + `>
    "
 <div class="sc-blind-label">
 </div>
 <div class="sc-blind-position">
 </div>
 </div>







   <div class="sc-blind-middle" style="flex-direction: ` + (buttonsPosition == 'right' ? 'row-reverse' : 'row') + `;">
     <div class="sc-blind-buttons">
       <ha-icon-button class="sc-blind-button" data-command="up"><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button><br>
       <ha-icon-button class="sc-blind-button" data-command="stop"><ha-icon icon="mdi:stop"></ha-icon></ha-icon-button><br>
       <ha-icon-button class="sc-blind-button" data-command="down"><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button>
     </div>
     <div class="sc-blind-selector">
       <div class="sc-blind-selector-picture">
         <div class="sc-blind-selector-slide"></div>
         <div class="sc-blind-selector-picker"></div>
       </div>
     </div>
   </div>
   <div class="sc-blind-bottom" ` + (titlePosition != 'bottom' ? 'style="display:none;"' : '') + `>
     <div class="sc-blind-label">

     </div>
     <div class="sc-blind-position">

     </div>
   </div>
       `

: ""
};          

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

      .divibut{
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

      .svgicon-door {
        padding-bottom: 20px;
        max-width: 170px;
      }

      .svgicon-garagem {
        padding-bottom: 20px;
        max-width: 170px;
        transform: translate(62%, 55%) scale(2.5);
      }

      .svgicon-sidegate {
        padding-left: 10px;
        padding-bottom: 20px;
        transform: scale(1.3);
      }

      .state {
        animation: state 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      .state-on-persiana-icon {
        transform: skewY(10deg) translate(4.5%, -3.9%) scaleX(0.8);
        /* transition-property: all 0.5s ease-out; */
        transition: all 0.5s ease;
        fill: #b68349;

      }

      .state-off-persiana-icon {
        animation-direction: reverse;
        transition: all 0.5s ease;
        fill: #a2743f;
      }

      .state-on-garagem-icon {
        transform: scale(0);
        fill: #ffffff;
      }

      .state-off-garagem-icon {
        fill: #a9b1bc;
      }

      .state-on-sidegate-icon {
        fill: #a9b1bc;
        transform: translate(15px);
        transition: 2s ease;
      }

      .state-off-sidegate-icon {
        fill: #a9b1bc;
        transition: all 2s ease;
        direction: 0px;
      }

      .persiana-icon.state-unavailable {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }

      .garagem-icon.state-unavailable {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }

      .sidegate-icon.state-unavailable {
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
