/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-this-alias */
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
import { mdiArrowDown, mdiArrowUp, mdiStop } from "@mdi/js";
// import "@material/mwc-list/mwc-list-item";

const open_shutter = "M.32 2.398c0 1.72.13 2.559.48 2.918.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.352-.359.481-1.199.481-2.918V0H.32ZM46.18 26.41v20.258H2.887V6.156H46.18Zm0 0";
const close_shutter = "M3.527 7.941v1.457h42.008V6.48H3.527Zm0 3.239v1.46h42.008V9.724H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.238v1.461h42.008v-2.918H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.243v1.457h42.008v-2.918H3.527Zm0 3.238v1.46h42.008v-2.917H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.242v1.457h42.008v-2.918H3.527Zm0 3.238v1.461h42.008v-2.918H3.527Zm0 3.243v1.457h42.008V38.89H3.527Zm0 3.242v1.457h42.008v-2.918H3.527Zm0 0";
const open_blind = "M.32 2.398c0 1.72.13 2.559.48 2.918.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.352-.359.481-1.199.481-2.918V0H.32ZM46.18 26.41v20.258H2.887V6.156H46.18Zm0 0";
const close_blind = "M3.848 26.09v18.957h41.367V7.129H3.848Zm0 0";

console.info(
  `%c  RACELAND-persiana-card \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'blind-card',
  name: 'Persiana',
  preview: true //IMPORTANTE
});
@customElement('blind-card')

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
    // const includeDomains = ["cover"];
    const includeDomains = ["cover"];
    const maxEntities = 1;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      includeDomains
    );
    return { type: "custom:blind-card", entity: "foundEntities[0]" || "", "name": "Persiana" ,"buttonsPosition": "left", "titlePosition": "top", "invertPercentage": "false", blindColor: "#ffffff" };
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
    let dragItem = document.querySelector("svgicon-blind");
    let container = document.querySelector("ha-card");

    let active = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    container.addEventListener("touchstart", dragStart, false);
    container.addEventListener("touchend", dragEnd, false);
    container.addEventListener("touchmove", drag, false);

    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragItem) {
        active = true;
      }
    }

    function dragEnd(_e) {
      initialX = currentX;
      initialY = currentY;

      active = false;
    }

    function drag(e) {
      if (active) {

        e.preventDefault();

        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem);
      }
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }
  }

  // set homeassistant(_homeassistant: any) {
  //   const _this = this;
  //   const entities = this.config.entities;

  //   if (!this.card) {
  //     const card = document.createElement('ha-card');
  //   }
  //   if (this.config.title) {
  //     this.card.header = this.config.title;
  //   }
  //   this.card = this.card;
  //   this.appendChild(this.card);

  //   let allBlinds = document.createElement('div');
  //   allBlinds.className = 'sc-blinds';

  //   entities.forEach(function (entity) {
  //     let entityId = entity;
  //     if (entity && entity.entity) {
  //       entityId = entity.entity;
  //     }

  //     let buttonsPosition = 'left';
  //     if (entity && entity.buttons_position) {
  //       buttonsPosition = entity.buttons_position.toLowerCase();
  //     }

  //     let titlePosition = 'top';
  //     if (entity && entity.title_position) {
  //       titlePosition = entity.title_position.toLowerCase();
  //     }

  //     let invertPercentage = false;
  //     if (entity && entity.invert_percentage) {
  //       invertPercentage = entity.invert_percentage;
  //     }

  //     let blindColor = '#FFD580';
  //     if (entity && entity.blind_color) {
  //       blindColor = entity.blind_color;
  //     }

  //     let blind = document.createElement('div');

  //     blind.className = 'sc-blind';
  //     blind.dataset.blind = entityId;

  //     let picture = blind.querySelector('.sc-blind-selector-picture');
  //     let slide = blind.querySelector('.sc-blind-selector-slide');
  //     let picker = blind.querySelector('.sc-blind-selector-picker');

  //     let mouseDown = function (event) {
  //       if (event.cancelable) {
  //         event.preventDefault();
  //       }
  //       _this.isUpdating = true;

  //       document.addEventListener('mousemove', mouseMove);
  //       document.addEventListener('touchmove', mouseMove);
  //       document.addEventListener('pointermove', mouseMove);

  //       document.addEventListener('mouseup', mouseUp);
  //       document.addEventListener('touchend', mouseUp);
  //       document.addEventListener('pointerup', mouseUp);
  //     };

  //     let mouseMove = function (event) {
  //       let newPosition = event.pageY - _this.getPictureTop(picture);
  //       _this.setPickerPosition(newPosition, picker, slide);
  //     };

  //     let mouseUp = function (event) {
  //       let newPosition = event.pageY - _this.getPictureTop(picture);
  //       _this.setPickerPosition(newPosition, picker, slide);
  //     };

  //     picker.addEventListener('mousedown', mouseDown);
  //     picker.addEventListener('touchstart', mouseDown);
  //     picker.addEventListener('pointerdown', mouseDown);

  //     // blind.querySelectorAll('.sc-blind-button').forEach(function () {
  //     //   onclick = function () {
  //     //     const command = this.dataset.command;

  //     //     let service = '';

  //     //     switch (command) {
  //     //       case 'up':
  //     //         service = 'open_cover';
  //     //         break;

  //     //       case 'down':
  //     //         service = 'close_cover';
  //     //         break;

  //     //       case 'stop':
  //     //         service = 'stop_cover';
  //     //         break;
  //     //     }

  //     //     _homeassistant.callService('cover', service, {
  //     //       entity_id: entityId
  //     //     });

  //     //   };
  //     // });
  //     allBlinds.appendChild(blind);
  //   });
  // }

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
              viewBox="0 0 50 50" height="75%" width="65%" >
              <path fill="#000000" d=${this.config.icon[0]} />
              <path class=${classMap({
                "state-on-blind-icon":
                  ifDefined(stateObj? this.computeActiveState(stateObj) : undefined) === "on" && (JSON.stringify(this.config.icon) ==JSON.stringify([open, close])),
                "state-off-blind-icon":
                  ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "off" && (JSON.stringify(this.config.icon) == JSON.stringify([open, close])),
                "state-unavailable":
                  ifDefined(stateObj? this.computeActiveState(stateObj) : undefined) === "unavailable",
              }
                  )
              }
              d=${this.config.icon[1]} />
            </svg>
            `
      : ""}

    ${this.config.show_buttons
    ? html`
        <slot class="card-actions">
        <button.mdc-icon-button
          .label=${localize("common.arrowup")}
          .path=${mdiArrowUp}
          title="Abrir"
          class="move-arrow-up"
          @click=${this._cardUp}
        >&#9650;
        </button.mdc-icon-button>


        <button.mdc-icon-button
          .label=${localize("common.stop")}
          .path=${mdiStop}
          title="Stop"
          class="stop"
          @click=${this._cardStop}
        >&#9724;
        </button.mdc-icon-button>


        <button.mdc-icon-button
          .label=${localize("common.arrowdown")}
          .path=${mdiArrowDown}
          title="Fechar"
          class="move-arrow-down"
          @click=${this._cardDown}
        >&#9660;
        </button.mdc-icon-button>

    </slot>`: ""}

    ${this.config.show_name
    ? html`
      <div tabindex = "-1" class="name-div">
      ${this.config.name}
      </div>
     `: ""}

    ${this.config.show_state
    ? html`
      <div tabindex="-1" class="state-div">
      ${this.translate_state(stateObj)}
      <!-- <div class="position"></div>% -->
      <div class="position"></div>
      </div>
     `: ""}
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
        grid-template-columns: 50% 50%;
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

      ha-icon,
      span {
        outline: none;
      }

      .svgicon-blind:hover {
        cursor: pointer;
      }

      .state {
        margin: 0% 50% 5% 0%;
        padding: 0% 100% 5% 0%;
        text-align: left;
        align-items: right;
      }

      .hassbut.state-off {
        text-align: center;
      }

      .hassbut.state-on {
        text-align: center
      }

      .hassbut {
        display: grid;
        grid-template-columns: 50% 50%;
      }
      .button.mdc-icon-button {
        fill: #ffffff;
      }

      .state-div {
        padding-top: 25px;
        padding-bottom: 40px;
        align-items: right;
        text-align: center;
      }

      .name-div {
        padding-top: 25px;
        align-items: left;
        text-align: left;
      }

      .ha-icon-button{
        fill: #ffffff;
        display: flex;
        visibility: visible;
      }

      ha-icon-button.move-arrow-up {
        transform: translateY(-25px);
      }

      ha-icon-button.move-arrow-down {
        transform: translateY(0px);
      }

       ha-icon-button.stop{
        animation-play-state: paused;
      }

      mwc-list-item {
        cursor: pointer;
        white-space: nowrap;
      }

      .card-actions {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: var(--card-color-bottom);
      }

      /* .grabbable {
        cursor: move;
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
      }

      .grabbable:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
      } */

      .svgicon-blind {
        cursor: grab;
        padding-bottom: 20px;
        max-width: 170px;
        transform: translate(62%, 55%) scale(2.5);
      }

      .state {
        animation: state 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      .state-on-blind-icon {
        transform: scale(0);
        fill: #ffffff;
      }

      .state-off-blind-icon {
        fill: #a2743f;
      }

      .state-unavailable {
        color: var(--state-icon-unavailable-color, #bdbdbd);
      }

      .move {cursor: move;}

      .opacity {
        animation: opacity 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      .reverse {
        animation-direction: reverse;
      }

      @keyframes state {
        0% {
          transform: translate(0px, 10px);
        }
        25% {
          transform: translate(0px, 20px);
        }
        50% {
          transform: translate(0px, 30px);
        }
        75% {
          transform: translate(0px, 40px);
        }
        100% {
          transform: translate(0px, 50px);
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
