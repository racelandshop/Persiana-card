
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
import { UNAVAILABLE } from "./data/entity";
import { fireEvent } from "custom-card-helpers";

const open_blind = "M.32 2.398c0 1.72.13 2.559.48 2.918.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.352-.359.481-1.199.481-2.918V0H.32ZM46.18 26.41v20.258H2.887V6.156H46.18Zm0 0";
const close_blind = "M3.848 26.09v18.957h41.367V7.129H3.848Zm0 0";
const open_shutter = "M.32 2.398c0 1.72.13 2.559.48 2.918.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.352-.359.481-1.199.481-2.918V0H.32ZM46.18 26.41v20.258H2.887V6.156H46.18Zm0 0";
const close_shutter = "M2.887 26.41v20.258H46.18V6.156H2.887ZM45.535 9.883v.812H3.527v-1.62h42.008Zm0 4.539v.808H3.527v-1.62h42.008Zm0 4.535v.813H3.527v-1.622h42.008Zm0 4.54v.808H3.527v-1.621h42.008Zm0 4.534v.813H3.527v-1.621h42.008Zm0 4.54v.808H3.527v-1.621h42.008Zm0 4.534v.813H3.527v-1.621h42.008Zm0 4.54v.808H3.527v-1.621h42.008Zm0 0";

console.info(
  `%c  RACELAND-persiana-card \n%c  ${localize('common.version')} ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'persiana-card',
  name: 'Persiana',
  preview: true,
  description: 'Uma carta que permite controlar persianas'
});
@customElement('persiana-card')
export class BoilerplateCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('persiana-card-editor');
  }

  @queryAsync('mwc-ripple') private _ripple!: Promise<Ripple | null>;

  public static getStubConfig(
    hass: HomeAssistant,
    entities: string[],
    entitiesFallback: string[]
  ): BoilerplateCardConfig {
    const includeDomains = ["cover"];
    const maxEntities = 1;
    const foundEntities = findEntities(hass, maxEntities, entities, entitiesFallback, includeDomains);
    return { type: "custom:persiana-card", entity: foundEntities[0] || "", "show_name": true, "show_state": true, "show_buttons": true, "show_preview": true, "icon": [open_blind, close_blind], "name": "Persiana" ,"buttonsPosition": "left", "titlePosition": "top", "invertPercentage": "false", blindColor: "#ffffff" };
  }

  stateObj: any;
  hass: any;
  private _entityObj: any;
  service: void;

  @property({ attribute: false }) public homeassistant!: HomeAssistant;
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
      tap_action: {
        action: "toggle",
      },
      hold_action: {
        action: "more-info",
      },
      ...config,
    };
  }

  //drag slider:





  //end of drag slider

  public translate_state(stateObj): string{
    if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "open") {
      return localize("states.on");
    }
    else if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "closed") {
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

    <mwc-icon-button
      class="more-info"
      label="Open more info"
      @click=${this._handleMoreInfo}
      tabindex="0"
    ></mwc-icon-button>

    ${this.config.show_icon
      ? html`
        <svg class=${classMap({
          "svgicon-blind":
            (JSON.stringify(this.config.icon) == JSON.stringify([close_blind, open_blind])),
          "svgicon-shutter":
            (JSON.stringify(this.config.icon) == JSON.stringify([open_shutter, close_shutter])),
          }
          )
        }
        viewBox="0 0 50 50" height="75%" width="65%" >
        <path fill="#a9b1bc" d=${this.config.icon[0]} />
        <path class=${classMap({
          "state-on-blind-icon":
            ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "on" && (JSON.stringify(this.config.icon) == JSON.stringify([open_blind, close_blind])),
          "state-off-blind-icon":
            ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off" && (JSON.stringify(this.config.icon) == JSON.stringify([open_blind, close_blind])),
          "state-on-shutter-icon":
            ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "on" && (JSON.stringify(this.config.icon) == JSON.stringify([open_shutter, close_shutter])),
          "state-off-shutter-icon":
            ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off" && (JSON.stringify(this.config.icon) == JSON.stringify([open_shutter, close_shutter])),
          "state-unavailable":
            ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "unavailable",
        }
          )
        }
        d=${this.config.icon[1]} />
      </svg>
    `: ""}

    ${this.config.show_buttons
      ? html`
      <div class="buttons">
      <mwc-icon-button
        class=${classMap({hidden: !this._entityObj?.supportsOpen})}
        .label=${this.hass.localize("ui.dialogs.more_info_control.opencover")}
        icon="&#9650"
        @click=${this._onOpenTap}
        .disabled=${this._computeOpenDisabled()}
        title="Abrir"
      ></mwc-icon-button>
      <mwc-icon-button
        class=${classMap({hidden: !this._entityObj?.supportsStop})}
        .label=${this.hass.localize("ui.dialogs.more_info_control.stopcover")}
        icon="&#9724"
        @click=${this._onStopTap}
        .disabled=${this.stateObj?.state === UNAVAILABLE}
        title="Stop"
      ></mwc-icon-button>
      <mwc-icon-button
        class=${classMap({hidden: !this._entityObj?.supportsClose})}
        .label=${this.hass.localize("ui.dialogs.more_info_control.closecover")}
        icon="&#9660"
        @click=${this._onCloseTap}
        .disabled=${this._computeClosedDisabled()}
        title="Fechar"
      ></mwc-icon-button>
      </div>
      `: ""}

      ${this.config.show_name
      ? html`
        <div tabindex = "-1" class="name-div">
          ${this.config.name}
        </div>
        <div></div>
    `: ""}

    ${this.config.show_state
      ? html`
        <div tabindex="-1" class="state-div">
          ${this.translate_state(stateObj)}
        <div class="position"></div>
        </div><div></div>
    `: ""}

    </ha-card>
    `;
  }

  private _computeOpenDisabled(): boolean {
    if (this.stateObj?.state === UNAVAILABLE) {
      return true;
    }
    const assumedState = this.stateObj?.attributes.assumed_state === true;
    return (
      (this._entityObj?.isFullyOpen || this._entityObj?.isOpening) && !assumedState);
  }

  private _computeClosedDisabled(): boolean {
    if (this.stateObj?.state === UNAVAILABLE) {
      return true;
    }
    const assumedState = this.stateObj?.attributes.assumed_state === true;
    return (
      (this._entityObj?.isFullyClosed || this._entityObj?.isClosing) && !assumedState);
  }

  private _onOpenTap(ev) {
    ev.callService();
    this?.hass.callService({ entity_id: this?._entityObj?.opencover() });
  }

  private _onCloseTap(ev) {
    ev.callService();
    this?.hass.callService({ entity_id: this?._entityObj?.closecover() });
  }

  private _onStopTap(ev) {
    ev.callService();
    this?.hass.callService({ entity_id: this?._entityObj?.stopcover() });
  }

  // callService() {
  //   this?.hass.callService({ entity_id: this?.service });
  // }

  callService() {
    this?.hass.callService('opencover', this?.service, {entity_id: this?._entityObj.openCover()});
    this?.hass.callService('closecover', this?.service, {entity_id: this?._entityObj.closeCover()});
    this?.hass.callService('stopcover', this?.service, {entity_id: this?._entityObj.stopCover()});
  }

  private computeActiveState = (stateObj: HassEntity): string => {
    const domain = stateObj?.entity_id.split(".")[0];
    let state = stateObj?.state;
    if (domain === "climate") {
      state = stateObj?.attributes.hvac_action;
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
    stateObj?.attributes.friendly_name === undefined
      ? this.computeObjectId(stateObj?.entity_id).replace(/_/g, " ")
      : stateObj?.attributes.friendly_name || "";

  private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    return this._ripple;
  });

  private handleRippleFocus() {
    this._rippleHandlers.startFocus();
  }

  private _handleMoreInfo() {
    fireEvent(this, "hass-more-info", {
      entityId: this.config?.entity,
    });
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

      .more-info {
        position: absolute;
        cursor: pointer;
        top: 0;
        right: 0;
        border-radius: 100%;
        color: var(--secondary-text-color);
        z-index: 1;
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

      .buttons:hover {
        opacity: 0.7;
      }

      span {
        margin: 5% 50% 1% 0%;
        padding: 0% 100% 1% 0%;
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
        align-items: left;
        padding: 0% 100% 12% 0%;
      }

      .name-div {
        align-items: left;
        padding: 12% 100% 1% 0%;
      }

      .mdc-icon-button {
        padding: 6px 6px 6px 6px;
      }

      .mwc-icon-button {
        padding: 6px 6px 6px 6px;
      }

      .ha-icon-button{
        cursor: pointer;
        fill: #ffffff;
        display: flex;
        visibility: visible;
      }

      mwc-list-item {
        cursor: pointer;
        white-space: nowrap;
      }

      .svgicon-blind {
        padding-bottom: 20px;
        max-width: 170px;
        transform: translate(62%, 55%) scale(2.5);
      }

      .svicon-shutter {
        padding-bottom: 20px;
        max-width: 170px;
        transform: translate(62%, 55%) scale(2.5);
      }

      .state {
        animation: state 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      /* alteração ao aspeto persiana */
      .state-on-blind-icon {
        transform: scale(0);
        fill: #ffffff;
      }

      /* alteração ao aspeto persiana */
      .state-off-blind-icon {
        fill: #a9b1bc;
      }

      /* alteração ao aspeto persiana */
      .state-on-shutter-icon {
        transform: scale(0);
        fill: #ffffff;
      }

      /* alteração ao aspeto persiana */
      .state-off-shutter-icon {
        fill: #a9b1bc;
      }

      .state-unavailable {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }

      :root {
        --main-color: bisque;
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
