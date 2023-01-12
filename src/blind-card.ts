/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ripple } from '@material/mwc-ripple';
import { html, TemplateResult, css, PropertyValues, CSSResultGroup, LitElement } from 'lit';
import { HassEntity } from 'home-assistant-js-websocket'
import { queryAsync } from 'lit-element'
import { customElement, eventOptions, property, query, state } from "lit/decorators";
import { findEntities } from "./././find-entities";
import { ifDefined } from "lit/directives/if-defined";
import { classMap } from "lit/directives/class-map";
import { HomeAssistant, hasConfigOrEntityChanged, LovelaceCardEditor, getLovelace} from 'custom-card-helpers';
import './editor';
import type { BoilerplateCardConfig} from './types';
import { arrowDown, CARD_VERSION, mdiDotsVertical } from './const';
import { localize } from './localize/localize';
import { UNAVAILABLE, UNAVAILABLE_STATES } from "./data/entity";
import { fireEvent } from "custom-card-helpers";
import { computeStateName } from "./common/entity/compute_state_name";
import { RippleHandlers } from '@material/mwc-ripple/ripple-handlers';
import { supportsStop } from './cover';

console.info(
  `%c  RACELAND-blind-card \n%c  ${localize("common.version")} ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);

(window as any).customCards = (window as any).customCards || "", [];
(window as any).customCards.push({
  type: 'blind-card',
  name: localize("common.name"),
  preview: true,
  description: `${localize("common.description")}`
});
@customElement('blind-card')
export class BoilerplateCard extends LitElement {
  // supportsOpen: any;
  // supportsStop: any;
  // supportsClose: any;
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('blind-card-editor')
  }
  @queryAsync('mwc-ripple') private _ripple!: Promise<Ripple | null>;

  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ attribute: false }) public isUpdating!: boolean;

  @property({ attribute: false }) public invertPercentage!: boolean;

  @property({ type: Boolean }) public showButtons = true;

  @property({ type: Boolean }) public isMedium = false;

  @property({ type: Boolean }) public isSmall = false;

  @state() private _shouldRenderRipple = false;

  @state() private config!: BoilerplateCardConfig;

  @property({ type: String }) public layout = "big";

  private maxPosition!: number;
  private minPosition!: number;


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
    return { type: "custom:blind-card", entity: foundEntities[0] || "", "show_name": true, "show_state": true
    };
  }

  open_cover: any;
  stop_cover: any;
  close_cover: any;
  // _entityObj: { open_cover: any; stop_cover: any; close_cover: any; supportsOpen: any; supportsStop: any; supportsClose: any; isFullyOpen: any; isOpening: any; isFullyClose: any; isClosing: any };


  @query('.sc-blind-selector-picker') private picker: any
  @query('.sc-blind-selector-slide') private slide: any
  @query('.sc-blind-selector-slide-medium') private slideMedium: any
  @query('.sc-blind-selector-slide-small') private slideSmall: any
  @query('.sc-blind-selector-picture') private picture: any




  public translate_state(stateObj: HassEntity): string{
    if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "open") {
      return localize("states.on");
    }
    else if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "close") {
      return localize("states.off");
    }
    else if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "stop") {
      return localize("states.stop");
    }
    else if (ifDefined(stateObj ? this.computeActiveState(stateObj) : undefined) === "unavailable") {
      return localize("states.unavailable");
    }
    else {return ""}
  }

  protected firstUpdated() {
    if (this.layout === "big") this.slide.style.height =  (this.maxPosition - this.minPosition) + 'px';
    ['mousedown', 'touchstart', 'pointerdown'].forEach((type) => {
      this.picker?.addEventListener(type, this._mouseDown);
    });
  }
  public setConfig(config: BoilerplateCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalidconfiguration'));
    }
    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }
    this.config = config;
    this.isUpdating = false;

    this.config = {
      show_icon: true,
      icon: 'mdi:blinds',
      ...config,
      tap_action: {
        action: "toggle",
      },
      hold_action: {
        action: "more-info",
      },
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {return false}
      return hasConfigOrEntityChanged(this, changedProps, false);
    }


  protected render(): TemplateResult | void {

    if (this.config.show_warning) {return this._showWarning(localize('common.show_warning'))}
    if (this.config.show_error) { return this._showError(localize('common.show_error')) }
    if (this.isSmall) {
      this.maxPosition = 55;
      this.minPosition = 0;
    }
    else if (this.isMedium) {
      this.maxPosition = 88;
      this.minPosition = 0;
    }
    else {
      this.maxPosition = 111;
      this.minPosition = 0;
    }
    this.stateObj = this.config.entity
    ? this.hass.states[this.config.entity]
    : undefined;

    if (this.layout === "small" || this.layout === "medium") {
      this.showButtons = false
    }

    const name = this.config.show_name
      ? this.config.name || (this.stateObj ? computeStateName(this.stateObj) : "")
      : "";
    return html`
    ${this.layout === "big" ? html`
    <ha-card
      class=
      ${classMap({
        "hassbut": this.layout === "big",
        "state-on":
          ifDefined(this.stateObj ? this.computeActiveState(this.stateObj) : undefined) === "on",
        "state-off":
          ifDefined(this.stateObj ? this.computeActiveState(this.stateObj) : undefined) === "off",
        "state-stop":
          ifDefined(this.stateObj ? this.computeActiveState(this.stateObj) : undefined) === "stop",
              })}
        .label=${`blind: ${this.config.entity || 'No Entity Defined'}`}>
        ${!this.isSmall ? html`
        <ha-icon-button
          class="more-info"
          .label=${this.hass!.localize(
            "ui.panel.lovelace.cards.show_more_info"
          )}
          .path=${mdiDotsVertical}
          @click=${this._handleMoreInfo}
          tabindex="0"
        ></ha-icon-button>
        ` : html``
        }

        ${this.config.show_state
          ? html`
            <div  class=${classMap({
            "sc-blind-position": this.layout === "big",
            "position-null": this.stateObj?.state === UNAVAILABLE
                  })}
            @change=${this.setPickerPosition(100 - (this.stateObj?.attributes.current_position))}>
              ${this.stateObj?.attributes.current_position} %
            </div>
          `: ""
        }
        <div class="container">
            <div class="sc-blind-middle"
            .disabled=${UNAVAILABLE_STATES.includes(this.stateObj?.state)}>
                ${this.config.show_icon && this.config.icon
                ? html`
                      <div class="sc-blind-selector">
                        <div class="blindOpen ${classMap({
                          "state-on": this.stateObj?.state === "open" || this.stateObj?.state === "opening" || this.stateObj?.state === "closing",
                        "state-unavailable": this.stateObj?.state === UNAVAILABLE,
                          })}">
                          <svg class=
                            "sc-blind-selector-picture"
                            viewBox="0 0 50 50" height="100%" width="100%">
                            <path d="M45.4199 5H5.08989C4.69989 5 4.38989 5.31 4.38989 5.7V44.88C4.38989 45.27 4.69989 45.58 5.08989 45.58H45.4199C45.8099 45.58 46.1199 45.27 46.1199 44.88V5.7C46.1199 5.31 45.7999 5 45.4199 5ZM24.7199 42.36C24.7199 42.63 24.4999 42.85 24.2299 42.85H6.52989C6.25989 42.85 6.03989 42.63 6.03989 42.36V7.71C6.03989 7.44 6.25989 7.22 6.52989 7.22H24.2299C24.4999 7.22 24.7199 7.44 24.7199 7.71V42.36ZM44.7999 43.35C44.7999 43.62 44.5799 43.84 44.3099 43.84H26.5299C26.2599 43.84 26.0399 43.62 26.0399 43.35V7.67C26.0399 7.4 26.2599 7.18 26.5299 7.18H44.2999C44.5699 7.18 44.7899 7.4 44.7899 7.67V43.35H44.7999Z"/>
                            </svg>
                            <svg class=
                            "top-bar"
                            viewBox="0 0 50 50" height="100%" width="100%">
                            <path d="M45.83 8.21H4.66997C4.27997 8.21 3.96997 7.9 3.96997 7.51V5.45C3.96997 5.06 4.27997 4.75 4.66997 4.75H45.82C46.21 4.75 46.52 5.06 46.52 5.45V7.51C46.53 7.89 46.21 8.21 45.83 8.21Z" />
                          </svg>
                        </div>
                      ${UNAVAILABLE_STATES.includes(this.stateObj?.state)
                        ? html`
                      <unavailable-icon class="icon-unavailable"></unavailable-icon>` : html``}
                        <div class="sc-blind-selector-slide"></div>
                          <svg class=
                          "sc-blind-selector-picker ${classMap({"state-unavailable": this.stateObj?.state === UNAVAILABLE,})}"
                          viewBox="0 0 50 50" height="100%" width="100%">
                          <path d="M5.54004 44.58C5.54004 44.75 5.67004 44.88 5.84004 44.88H44.66C44.79 44.88 44.87 44.79 44.92 44.68C44.93 44.65 44.96 44.62 44.96 44.58V43.98H5.54004V44.58Z" fill="#B3B3B3"/>
                          </svg>
                      </div>
                        `
                      : ""}

                  ${this.showButtons
                  ? html`
                  <div id="buttons">
                      <div class="buttons" >
                          <button
                          .disabled=${UNAVAILABLE_STATES.includes(this.stateObj?.state)}
                          class="openButton ${classMap({
                        "state-on": this.stateObj?.state === "opening",
                        "state-unavailable": this.stateObj?.state === UNAVAILABLE,
                          })}"
                        .label=${this.hass.localize("ui.dialogs.more_info_control.opencover")}
                          @click=${this.onOpenTap}
                        ><svg id="arrow-icon" viewBox="0 0 24 24">
                              <path d="M3.4375 16.1041L13 6.56246L22.5625 16.1041L25.5 13.1666L13 0.666626L0.5 13.1666L3.4375 16.1041Z"/>
                          </svg>
                        </button>
                      </div>
                      ${supportsStop(this.stateObj) ? html`
                      <div class="buttons" >
                        <button
                        .disabled=${UNAVAILABLE_STATES.includes(this.stateObj?.state)}
                        class="pause ${classMap({
                      "state-unavailable": this.stateObj?.state === UNAVAILABLE,
                        })}"
                        .label=${this.hass.localize("ui.dialogs.more_info_control.stopcover")}
                        @click=${this.onStopTap}
                      ><svg  id="arrow-icon-middle" viewBox="0 0 24 24">
                            <path d="M17.1667 29.5833H25.5V0.416626H17.1667V29.5833ZM0.5 29.5833H8.83333V0.416626H0.5V29.5833Z"/>
                        </svg>
                      </button>
                      </div>
                      `: html`
                      <div class="buttons-none" ></div>`}
                      <div class="buttons" >
                          <button
                          .disabled=${UNAVAILABLE_STATES.includes(this.stateObj?.state)}
                          class="closeButton ${classMap({
                            "state-on": this.stateObj?.state === "closing",
                            "state-unavailable": this.stateObj?.state === UNAVAILABLE,
                          })}"
                          .label=${this.hass.localize("ui.dialogs.more_info_control.closecover")}
                          .path=${arrowDown}
                          @click=${this.onCloseTap}
                        ><svg  id="arrow-icon" viewBox="0 0 24 24">
                              <path d="M3.4375 0.391357L13 9.95386L22.5625 0.391357L25.5 3.34969L13 15.8497L0.5 3.34969L3.4375 0.391357Z"/>
                          </svg>
                        </button>
                      </div>
                  </div>
              `: ""
            }
        </div>
        </div>
    ${this.config.show_name
      ? html`
        <div class="sc-blind-label">
          ${name}</div>
      `: ""
    }
    </ha-card>
    ` : html`
        <ha-card
          class=${classMap({
            "small-card": this.layout === "small",
            "medium-card": this.layout === "medium",
            "unavailable": UNAVAILABLE_STATES.includes(this.stateObj?.state)
                  })}
            @focus=${this.handleRippleFocus}
            @blur=${this.handleRippleBlur}
            @mousedown=${this.handleRippleActivate}
            @mouseup=${this.handleRippleDeactivate}
            @touchstart=${this.handleRippleActivate}
            @touchend=${this.handleRippleDeactivate}
            @touchcancel=${this.handleRippleDeactivate}
            @click=${this._handleMoreInfo}
            role="button"

          >
            <div class=${classMap({
                "small-icons": this.layout === "medium" ||  this.layout === "small",
                })}>
              <svg
              class=${classMap({
                "ha-status-icon-small": this.layout === "small",
                "ha-status-icon-medium": this.layout === "medium",
                })}
              viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45.4197 5H5.08965C4.69965 5 4.38965 5.31 4.38965 5.7V44.88C4.38965 45.27 4.69965 45.58 5.08965 45.58H45.4197C45.8097 45.58 46.1197 45.27 46.1197 44.88V5.7C46.1197 5.31 45.7997 5 45.4197 5ZM24.7197 42.36C24.7197 42.63 24.4997 42.85 24.2297 42.85H6.52965C6.25965 42.85 6.03965 42.63 6.03965 42.36V7.71C6.03965 7.44 6.25965 7.22 6.52965 7.22H24.2297C24.4997 7.22 24.7197 7.44 24.7197 7.71V42.36ZM44.7997 43.35C44.7997 43.62 44.5797 43.84 44.3097 43.84H26.5297C26.2597 43.84 26.0397 43.62 26.0397 43.35V7.67C26.0397 7.4 26.2597 7.18 26.5297 7.18H44.2997C44.5697 7.18 44.7897 7.4 44.7897 7.67V43.35H44.7997Z" class=${classMap({
                "blue": this.stateObj?.state !== "closed" && this.stateObj?.state !== UNAVAILABLE,
                "grey": this.stateObj?.state === "closed" || this.stateObj?.state === UNAVAILABLE,
                })}/>
              <path d="M44.9599 44.5801C44.9599 44.6201 44.9299 44.6501 44.9199 44.6801C44.9399 44.6601 44.9599 44.6201 44.9599 44.5801Z" fill="#E6E6E6"/>
              <path d="M44.1689 5H6.84094C6.37595 5 6 5.16573 6 5.37506V21C6 21.5523 6.44772 22 7 22H44C44.5523 22 45 21.5523 45 21V5.3707C45 5.16573 44.624 5 44.1689 5Z" fill="#E6E6E6"/>
              <path d="M6 21.6667C6 21.8556 6.12862 22 6.2968 22H44.7032C44.8318 22 44.911 21.9 44.9604 21.7778C44.9703 21.7444 45 21.7111 45 21.6667V21H6V21.6667Z" fill="#B3B3B3"/>
              <path d="M45.8297 8.21H4.66973C4.27973 8.21 3.96973 7.9 3.96973 7.51V5.45C3.96973 5.06 4.27973 4.75 4.66973 4.75H45.8197C46.2097 4.75 46.5197 5.06 46.5197 5.45V7.51C46.5297 7.89 46.2097 8.21 45.8297 8.21Z" class=${classMap({
                "blue": this.stateObj?.state !== "closed" && this.stateObj?.state !== UNAVAILABLE,
                "grey": this.stateObj?.state === "closed" || this.stateObj?.state === UNAVAILABLE,
                })}/>
              </svg>
            </div>
            ${name !== "undefined"
              ? html`<span class=${classMap({
                "rect-card-small": this.layout === "small",
                "rect-card-medium": this.layout === "medium"
                      })} tabindex="-1" .title=${name ? name : ""}
                  >${name}</span
                >`
              : ""}
            ${this._shouldRenderRipple ? html`<mwc-ripple></mwc-ripple>` : ""}
            ${UNAVAILABLE_STATES.includes(this.stateObj?.state)
              ? html` <unavailable-icon></unavailable-icon>`
              : html``}
          </ha-card>
        `

    }`
  }

  private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
    this._shouldRenderRipple = true;
    return this._ripple;
  });

  // private supportsStop(stateObj) {
  //   supportsFeature(stateObj, 8);
  // }

  @eventOptions({ passive: true })
  private handleRippleActivate(evt?: Event) {
    this._rippleHandlers.startPress(evt);
  }

  private handleRippleDeactivate() {
    this._rippleHandlers.endPress();
  }

  private handleRippleFocus() {
    this._rippleHandlers.startFocus();
  }

  private handleRippleBlur() {
    this._rippleHandlers.endFocus();
  }
  getPictureTop(picture: Element) {
    if (!picture) {
      return null;
    }

    const pictureBox = picture.getBoundingClientRect();
    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const clientTop = docEl.clientTop || body.clientTop || 0;
    const pictureTop  = pictureBox.top + scrollTop - clientTop;
      return pictureTop;
    }


  private setPickerPosition(position: number) {
    let realPos = this.maxPosition / 100 * position;
    if (realPos < this.minPosition)
    realPos = this.minPosition;

    if (realPos > this.maxPosition)
    realPos = this.maxPosition;


    const posTop = realPos - (this.maxPosition - this.minPosition);
    const slideHeight = realPos- (this.minPosition);
    if (!this.hasUpdated && this.layout === "big") {
        this.updateComplete.then(() => {
          if (this.picker && this.slide) {
            this.slide.style.height =  slideHeight + 'px';
            this.picker.style.top = posTop + 'px';
          }
          if (this.picker && this.slideMedium) {
            this.slideMedium.style.height =  slideHeight + 'px';
            this.picker.style.top = posTop + 'px';
          }
          if (this.picker && this.slideSmall) {
            this.slideSmall.style.height =  slideHeight + 'px';
            this.picker.style.top = posTop + 'px';
          }
      });
    } else {
      if (this.picker && this.slide && this.layout === "big") {
        this.slide.style.height =  slideHeight + 'px';
        this.picker.style.top = posTop + 'px';
      }
      if (this.picker && this.slideMedium) {
        this.slideMedium.style.height =  slideHeight + 'px';
        this.picker.style.top = posTop + 'px';
      }
      if (this.picker && this.slideSmall) {
        this.slideSmall.style.height =  slideHeight + 'px';
        this.picker.style.top = posTop + 'px';
      }
    }

    }

    private _mouseDown = (event) => {
    if (event.cancelable) {
      //Disable default drag event
      event.preventDefault();
    }

    this.isUpdating = true;

    this.shadowRoot?.addEventListener('mousemove', this._mouseMove);
    this.shadowRoot?.addEventListener('touchmove', this._mouseMove);
    this.shadowRoot?.addEventListener('pointermove', this._mouseMove);

    this.shadowRoot?.addEventListener('mouseup', this._mouseUp);
    this.shadowRoot?.addEventListener('touchend', this._mouseUp);
    this.shadowRoot?.addEventListener('pointerup', this._mouseUp);
  };

  private _mouseMove = (event: any) => {

    const newPosition = ((event.pageY - 21) - this?.getPictureTop(this.picture)) * 100 / this.maxPosition;
    this?.setPickerPosition(newPosition);
  };

  private _mouseUp = (event: any) => {
    this.isUpdating = false;
    this.updateComplete.then(() => {
      let newPosition = ((event.pageY - 21) - this?.getPictureTop(this.picture));

      if (newPosition < this?.minPosition)
        newPosition = this?.minPosition;

      if (newPosition > this?.maxPosition)
        newPosition = this?.maxPosition;

      const percentagePosition = (newPosition - this?.minPosition) * 100 / (this?.maxPosition - this?.minPosition);
      if (this.isMedium || this.isSmall) {
        this?.setPickerPosition(newPosition * this.maxPosition / 100);
      }
      else {
        this?.setPickerPosition(newPosition * 100 / this.maxPosition);
      }

      if (this.invertPercentage) {
        this.updateBlindPosition(this?.hass, this.stateObj?.entity_id, percentagePosition);
      } else {
        this.updateBlindPosition(this?.hass, this.stateObj?.entity_id, 100 - percentagePosition);
      }

      this.shadowRoot?.removeEventListener('mousemove', this._mouseMove);
      this.shadowRoot?.removeEventListener('touchmove', this._mouseMove);
      this.shadowRoot?.removeEventListener('pointermove', this._mouseMove);

      this.shadowRoot?.removeEventListener('mouseup', this._mouseUp);
      this.shadowRoot?.removeEventListener('touchend', this._mouseUp);
      this.shadowRoot?.removeEventListener('pointerup', this._mouseUp);

    })
  };

  private updateBlindPosition(hass: HomeAssistant, entity: string, position: number) {
    const blindPosition = Math.round(position);

    hass.callService('cover', 'set_cover_position', {
      entity_id: entity,
      position: blindPosition
    });
  }

  private onOpenTap(): void {
    this.hass.callService('cover', 'open_cover', {
      entity_id: this.config.entity,
    });
  }

  private onStopTap(): void {
    this.hass.callService('cover', 'stop_cover', {
      entity_id: this.config.entity,
    });
  }

  private onCloseTap(): void {
    this.hass.callService('cover', 'close_cover', {
      entity_id: this.config.entity,
    });
  }

  private computeActiveState = (stateObj: HassEntity): string => {
    const state = stateObj?.state;
    return state;
  };

  private _showWarning(warning: string): TemplateResult {
    return html`<hui-warning>${warning}</hui-warning>`;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });
    return html`${errorCard}`;
  }

  private _handleMoreInfo() {
    fireEvent(this, "hass-more-info", {
      entityId: this.config?.entity
    })
  }

  static get styles(): CSSResultGroup {
    return css`
      .icon {
        height: 95%;
        width: 75%;
      }
      .blue {
        fill: var(--accent-color);
      }
      .white {
        fill:#F2F1F6
      }
      .grey {
        fill: #B3B3B3
      }
      .black {
        fill: #333333
      }
      #container {
        height: 70%;
        width: 100%;
      }
      ha-card {
        flex-direction: column;
        align-items: left;
        text-align: left;
        font-size: 18px;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        position: relative;
        justify-content: center;
        overflow: hidden;
        text-align: center;
        color: var(--primary-text-color);
        border-radius: 1.5rem;
        background: var(--card-background-color);
      }
      svg {
        display: block;
        .state-on {
          transform: scale(0);
        }
      }

      .more-info {
        position: absolute;
        cursor: pointer;
        top: 0;
        right: 0;
        color: var(--secondary-text-color);
        z-index: 1;
      }

      ha-icon + span {
        text-align: left;
      }
      .buttons:hover{
        cursor: pointer;
      }

      .hassbut.state-off {
        text-align: left;
      }

      .hassbut.state-on {
        text-align: left;
      }

      .hassbut {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .blind-closed {
        position: absolute;
        top: 0;
      }
      .ha-status-icon {
        display: flex;
        justify-content: center;
      }
      .sc-blind-selector {
        position: absolute;
        left: 1px;
        width: 150px;
        height: 150px;
      }
      .position-null {
        display: none;
      }
      .sc-blind-position {
        color: var(--secondary-text-color);
        position: absolute;
        top: 20px;
      }
      .sc-blind-label {
        color: var(--primary-text-color);
        padding-top: 5px;
        height: 100%;
        padding-bottom: 23px;
        font-size: 2.3rem;
        font-weight: 450;
        white-space: nowrap;
        display: inline-block;
        overflow-x: hidden;
        max-width: 80%;
        text-overflow: ellipsis;
        justify-content: space-between;
      }
      .icon-unavailable-small {
        z-index: 1;
        position: absolute;
        top: 11px;
        right: 10%;
      }
      .icon-unavailable-medium {
        z-index: 1;
        position: absolute;
        top: 42%;
        left: 40%;
      }
      .icon-unavailable {
        z-index: 1;
        position: absolute;
        top: 44%;
        left: 15%;
      }
      .sc-blind-selector-picture {
        position: relative;
        fill: #666666;
      }
      .top-bar {
        position: absolute;
        fill: #666666;
        width: 100%;
        top: 0px;
        right: 0px;
      }
      .sc-blind-selector-slide {
        background-color: var(--slider-track-color);
        position: absolute;
        cursor: row-resize;
        height: 100%;
        max-width: 230px;
        min-width: 123px;
        max-height: 100%;
        top: 24px;
        left: 14px;
      }
      .sc-blind-selector-picker {
        cursor: row-resize;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
      }
      .sc-blind-middle {
        display: flex;
        align-items: center;
        position: relative;
        justify-content: center;
        width: 200px;
        height: 171px;
      }

      .window {
        overflow-y: hidden;
        width: 230px;
        height: 172px;
        position: absolute;
        left: 98px;
      }
      .container {
        height: 75%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 22px;
      }
      #buttons {
        top: 21px;
        position: absolute;
        right: 22px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .buttons {
        height: 33px;
        width: 33px;
        margin: 5px 0;
      }
      .buttons-none {
        height: 33px;
        width: 33px;
        margin: 5px 0;
      }
      .state-div {
        align-items: left;
        padding-top: 19px;
        padding-bottom: 6px;
      }

      .name-div {
        align-items: left;
        padding: 12% 100% 1% 0%;
      }

      .mwc-ripple {
        display: none;
      }

      #arrow-icon{
        margin-top: 5px;
        height: 20px;
        width: 15px;
        fill: var(--card-background-color);
      }

      #arrow-icon-middle {
        padding: 0;
        margin: 0;
        height: 20px;
        width: 15px;
        fill: var(--card-background-color);
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

      @media only screen and (max-width: 600px) {
        #arrow-icon{
          margin-top: 4px;
          height: 20px;
          width: 15px;
          fill: var(--card-background-color);
        }
        #arrow-icon-middle {
          padding: 0;
          margin: 0;
          height: 20px;
          width: 15px;
          fill: var(--card-background-color);
        }
      }

      button {
        background-color: var(--secondary-text-color);
        cursor: pointer;
        fill: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: visible;
        width: 33px;
        height: 33px;
        border-radius: 8px;
        border-width: 0;
      }
      .openButton.state-on {
        background-color: var(--header-card-picker-background) !important;
      }
      .openButton.state-on > #arrow-icon {
        fill: var(--accent-color);
      }
      .blindOpen.state-on > svg {
        fill: var(--accent-color);
      }
      .closeButton.state-on {
        background-color: var(--header-card-picker-background) !important;
      }
      .closeButton.state-on > #arrow-icon {
        fill: var(--accent-color);
      }
      .pause:active, .blindOpen:active, .closeButton:active {
        background-color: var(--header-card-picker-background) !important;
      }
      .pause:active > #arrow-icon {
        fill: var(--accent-color);
      }
      mwc-list-item {
        cursor: pointer;
        white-space: nowrap;
      }

      .state-unavailable {
        color: var(--state-unavailable-color, #bdbdbd);
        fill: var(--state-unavailable-color, #bdbdbd);
        pointer-events: none;
      }

      .small-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: left;
        text-align: left;
        padding: 4% 0;
        font-size: 1.2rem;
        height: 100%;
        box-sizing: border-box;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        border-radius: 1.5rem;
        font-weight: 450;
        padding-top: 16%;
      }
      .medium-card {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: left;
        text-align: left;
        padding: 4% 0;
        font-size: 1.8rem;
        height: 100%;
        box-sizing: border-box;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        border-radius: 1.5rem;
        padding-top: 16%;
        font-weight: 450;
      }
      .big-card {
        cursor: pointer;
        aspect-ratio: 1.5;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 4% 0;
        font-size: 2.3rem;
        height: 100%;
        box-sizing: border-box;
        justify-content: center;
        position: relative;
        overflow: hidden;
        border-radius: 1.5rem;
        font-weight: 450;
      }

      .small-icons {
        display: flex;
        align-items: center;
        margin-left: 10%;
      }

      .unavailable {
        pointer-events: none;
      }
      unavailable-icon {
        position: absolute;
        top: 11px;
        right: 10%;
      }
      .rect-card-small {
        padding: 5%;
        padding-bottom: 4%;
        margin-bottom: 4%;
        margin-left: 7%;
        white-space: nowrap;
        display: inline-block;
        overflow: hidden;
        max-width: 110px;
        text-overflow: ellipsis;
      }

      .rect-card-medium {
        padding: 5%;
        padding-bottom: 4%;
        margin-bottom: 4%;
        margin-left: 7%;
        white-space: nowrap;
        display: inline-block;
        overflow: hidden;
        max-width: 200px;
        text-overflow: ellipsis;
      }

      .rect-card {
        padding: 5%;
        white-space: nowrap;
        overflow: hidden;
        max-width: 350px;
        text-overflow: ellipsis;
      }

      ha-card:focus {
        outline: none;
      }

    #accent-color {
        fill: var(--accent-color);
      }

      .ha-status-icon-big {
        width: 140px;
        height: 140px;
      }

      .ha-status-icon-medium {
        width: 90px;
        height: 90px;
      }

      .ha-status-icon-small {
        width: 60px;
        height: 60px;
      }

      .svg-icon {
        fill: var(--paper-item-icon-color, #44739e);
      }

      ha-state-icon,
      span {
        outline: none;
      }
      unavailable-icon {
        position: absolute;
        top: 11px;
        right: 10%;
      }
      .state {
        font-size: 0.9rem;
        color: var(--secondary-text-color);
      }

    `;
    }
}
