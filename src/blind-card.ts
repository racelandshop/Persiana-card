/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RippleHandlers } from "@material/mwc-ripple/ripple-handlers";
import { Ripple } from '@material/mwc-ripple';
import { html, TemplateResult, css, PropertyValues, CSSResultGroup, LitElement } from 'lit';
import { HassEntity } from 'home-assistant-js-websocket'
import { queryAsync } from 'lit-element'
import { customElement, property, query, state } from "lit/decorators";
import { findEntities } from "./././find-entities";
import { ifDefined } from "lit/directives/if-defined";
import { classMap } from "lit/directives/class-map";
import { HomeAssistant, hasConfigOrEntityChanged, LovelaceCardEditor, getLovelace} from 'custom-card-helpers';
import './editor';
import type { BoilerplateCardConfig} from './types';
import { arrowDown, CARD_VERSION, blind_closed, blind_open, mdiDotsVertical } from './const';
import { localize } from './localize/localize';
import { UNAVAILABLE } from "./data/entity";
import { fireEvent } from "custom-card-helpers";
import { debounce } from "./common/debounce";
import ResizeObserver from "./common/resizeObserver";

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
  supportsOpen: any;
  supportsStop: any;
  supportsClose: any;
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

  @state() private config!: BoilerplateCardConfig;

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
    return {
      type: "custom:blind-card",
      entity: foundEntities[0] || "",
      "show_name": true,
      "show_state": true,
      "show_buttons": true,
      "show_preview": true,
      "icon": blind_closed + ":" + blind_open,
      "name": localize("common.name")
    };
  }

  // stateObj: { state: string; attributes: { assumed_state: any; }; };
  open_cover: any;
  stop_cover: any;
  close_cover: any;
  _entityObj: { open_cover: any; stop_cover: any; close_cover: any; supportsOpen: any; supportsStop: any; supportsClose: any; isFullyOpen: any; isOpening: any; isFullyClose: any; isClosing: any };


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
    // console.log(this.picker, this.slide, this.picture);
    this._attachResizeObserver();
    this.slide.style.height =  (this.maxPosition - this.minPosition) + 'px';
    // console.log("first updated", this.picker);
    ['mousedown', 'touchstart', 'pointerdown'].forEach((type) => {
      this.picker?.addEventListener(type, this._mouseDown);
    });

  }
  private _resizeObserver?: ResizeObserver;

  private async _attachResizeObserver(): Promise<void> {
    if (!this._resizeObserver) {
      this._resizeObserver = new ResizeObserver(
        debounce(
          (entries: any) => {
            const entry = entries[0];
            const rootGrid = this.closest("div");
            if (
              rootGrid &&
              entry.contentRect.width <= rootGrid.clientWidth / 2 &&
              entry.contentRect.width > rootGrid.clientWidth / 3
              ) {
                const stateLabel =
                this.shadowRoot?.querySelector(".sc-blind-label");
                stateLabel?.classList.remove("sc-blind-label");
                stateLabel?.classList.add("sc-blind-label-medium");
              const stateSelector =
                this.shadowRoot?.querySelector(".sc-blind-selector");
                stateSelector?.classList.remove("sc-blind-selector");
              stateSelector?.classList.add("sc-blind-selector-medium");
              const stateMedium =
                this.shadowRoot?.querySelector(".sc-blind-middle");
                stateMedium?.classList.remove("sc-blind-middle");
              stateMedium?.classList.add("sc-blind-middle-medium");
              const stateSlide =
                this.shadowRoot?.querySelector(".sc-blind-selector-slide");
                stateSlide?.classList.remove("sc-blind-selector-slide");
              stateSlide?.classList.add("sc-blind-selector-slide-medium");
              const stateContainer =
                this.shadowRoot?.querySelector(".container");
                stateContainer?.classList.remove("container");
              stateContainer?.classList.add("container-medium");
              const statePosition =
              this.shadowRoot?.querySelector(".sc-blind-position");
              statePosition?.classList.remove("sc-blind-position");
              statePosition?.classList.add("sc-blind-position-small");
              const stateCard =
                this.shadowRoot?.querySelector(".hassbut");
                stateCard?.classList.remove("hassbut");
                stateCard?.classList.add("hassbut-small");
              this.showButtons = false;
              this.isMedium = true;
            }
            if (
              rootGrid &&
              entry.contentRect.width <= rootGrid.clientWidth / 3 &&
              entry.contentRect.width !== 0
              ) {
                const stateLabel =
                this.shadowRoot?.querySelector(".sc-blind-label");
                stateLabel?.classList.remove("sc-blind-label");
              stateLabel?.classList.add("sc-blind-label-small");
              const stateContainer =
                this.shadowRoot?.querySelector(".container");
                stateContainer?.classList.remove("container");
              stateContainer?.classList.add("container-small");
              const stateMedium =
              this.shadowRoot?.querySelector(".sc-blind-middle");
              stateMedium?.classList.remove("sc-blind-middle");
              stateMedium?.classList.add("sc-blind-middle-small");
              const stateSelector =
              this.shadowRoot?.querySelector(".sc-blind-selector");
              stateSelector?.classList.remove("sc-blind-selector");
              stateSelector?.classList.add("sc-blind-selector-small");
              const statePosition =
              this.shadowRoot?.querySelector(".sc-blind-position");
              statePosition?.classList.remove("sc-blind-position");
              statePosition?.classList.add("sc-blind-position-small");
              const stateSlide =
                this.shadowRoot?.querySelector(".sc-blind-selector-slide");
                stateSlide?.classList.remove("sc-blind-selector-slide");
              stateSlide?.classList.add("sc-blind-selector-slide-small");
              const stateCard =
                this.shadowRoot?.querySelector(".hassbut");
                stateCard?.classList.remove("hassbut");
                stateCard?.classList.add("hassbut-small");
              this.showButtons = false;
              this.isSmall = true;
            }
          },
          250,
          true
          )
      );
    }

    this._resizeObserver.observe(this);
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
      console.log('small')
    }
    else if (this.isMedium) {
      this.maxPosition = 88;
      this.minPosition = 0;
      console.log('medium')
    }
    else {
      this.maxPosition = 111;
      this.minPosition = 0;
      console.log('large')
    }
    this.stateObj = this.config.entity
    ? this.hass.states[this.config.entity]
      : undefined;

  return html`
    <ha-card
      class="hassbut ${classMap({
        "state-on":
          ifDefined(this.stateObj ? this.computeActiveState(this.stateObj) : undefined) === "on",
        "state-off":
          ifDefined(this.stateObj ? this.computeActiveState(this.stateObj) : undefined) === "off",
        "state-stop":
          ifDefined(this.stateObj ? this.computeActiveState(this.stateObj) : undefined) === "stop",
      })}"



        .label=${`blind: ${this.config.entity || 'No Entity Defined'}`}
    >
    <ha-icon-button
          class="more-info"
          .label=${this.hass!.localize(
            "ui.panel.lovelace.cards.show_more_info"
          )}
          .path=${mdiDotsVertical}
          @click=${this._handleMoreInfo}
          tabindex="0"
        ></ha-icon-button>
    ${this.config.show_state
      ? html`
        <div  class="sc-blind-position"
        @change=${this.setPickerPosition(100 - (this.stateObj.attributes.current_position))}>
          ${this.stateObj.attributes.current_position} %
        </div>
      `: ""
    }
    <div class="container">
        <div class="sc-blind-middle">
            ${this.config.show_icon && this.config.icon
            ? html`
                  <div class="sc-blind-selector">
                    <div class="blindOpen ${classMap({
                      "state-on": this.stateObj.state === "open" || this.stateObj.state === "opening" || this.stateObj.state === "closing",
                    "state-unavailable": this.stateObj.state === UNAVAILABLE,
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
                    <div class="sc-blind-selector-slide" style= "background-color:#ffffff"></div>
                      <svg class=
                      "sc-blind-selector-picker"
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
                      class="openButton ${classMap({
                    "state-on": this.stateObj.state === "opening",
                    "state-unavailable": this.stateObj.state === UNAVAILABLE,
                      })}"
                    .label=${this.hass.localize("ui.dialogs.more_info_control.opencover")}
                      @click=${this.onOpenTap}
                    ><svg id="arrow-icon" viewBox="0 0 24 24">
                          <path d="M3.4375 16.1041L13 6.56246L22.5625 16.1041L25.5 13.1666L13 0.666626L0.5 13.1666L3.4375 16.1041Z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="buttons" >
                      <button
                      class="pause"
                      .label=${this.hass.localize("ui.dialogs.more_info_control.stopcover")}
                      @click=${this.onStopTap}
                    ><svg  id="arrow-icon-middle" viewBox="0 0 24 24">
                          <path d="M17.1667 29.5833H25.5V0.416626H17.1667V29.5833ZM0.5 29.5833H8.83333V0.416626H0.5V29.5833Z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="buttons" >
                      <button
                      class="closeButton ${classMap({
                        "state-on": this.stateObj.state === "closing",
                        "state-unavailable": this.stateObj.state === UNAVAILABLE,
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
          ${this.config.name}</div>
      `: ""
    }
    </ha-card>
    `;
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
    console.log('POSITION', position)
    let realPos = this.maxPosition / 100 * position;
    if (realPos < this.minPosition)
    realPos = this.minPosition;

    if (realPos > this.maxPosition)
    realPos = this.maxPosition;


    const posTop = realPos - (this.maxPosition - this.minPosition);
    const slideHeight = realPos- (this.minPosition);
    // console.log(this.maxPosition, this.minPosition)
    console.log('slideHeight', slideHeight, 'postop', posTop);  // Faltou isto para resolver o first updated. existe um mommento no inicio que não está rendered
    if (!this.hasUpdated) {
        this.updateComplete.then(() => {
          if (this.picker && this.slide) {
            this.slide.style.height =  slideHeight + 'px';
            this.picker.style.top = posTop + 'px';
            console.log('passei 3')
          }
          if (this.picker && this.slideMedium) {
            this.slideMedium.style.height =  slideHeight + 'px';
            this.picker.style.top = posTop + 'px';
          }
          if (this.picker && this.slideSmall) {
            this.slideSmall.style.height =  slideHeight + 'px';
            this.picker.style.top = posTop + 'px';
            console.log('passei 1')
          }
      });
    } else {
      if (this.picker && this.slide) {
        this.slide.style.height =  slideHeight + 'px';
        this.picker.style.top = posTop + 'px';
        console.log('passei 4')
      }
      if (this.picker && this.slideMedium) {
        this.slideMedium.style.height =  slideHeight + 'px';
        this.picker.style.top = posTop + 'px';
      }
      if (this.picker && this.slideSmall) {
        this.slideSmall.style.height =  slideHeight + 'px';
        this.picker.style.top = posTop + 'px';
        console.log('passei 2')
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

  private _mouseMove = (event) => {

    const newPosition = (event.pageY - this?.getPictureTop(this.picture))* 100 / this.maxPosition; // FALTOU-TE DAR SCALE DOWN DEPOIS. o agarrar estava wonky
      this?.setPickerPosition(newPosition);
  };

  private _mouseUp = (event) => {
    this.isUpdating = false;
    this.updateComplete.then(() => {
      let newPosition = (event.pageY - this?.getPictureTop(this.picture));

      if (newPosition < this?.minPosition)
        newPosition = this?.minPosition;

      if (newPosition > this?.maxPosition)
        newPosition = this?.maxPosition;

      const percentagePosition = (newPosition - this?.minPosition) * 100 / (this?.maxPosition - this?.minPosition);
      console.log('newpos', newPosition)
      if (this.isMedium || this.isSmall) {
        this?.setPickerPosition(newPosition * this.maxPosition / 100);
      }
      else {
        this?.setPickerPosition(newPosition * 100 / this.maxPosition); // FALTOU-TE DAR SCALE DOWN tambem. dava flickers
      }

      if (this.invertPercentage) {
        this.updateBlindPosition(this?.hass, this.stateObj.entity_id, percentagePosition);
      } else {
        this.updateBlindPosition(this?.hass, this.stateObj.entity_id, 100 - percentagePosition);
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
    // console.log('open', this.stateObj.attributes.current_position)
    this.hass.callService('cover', 'open_cover', {
      entity_id: this.config.entity,
    });
  }

  private onStopTap(): void {
    // console.log('stop', this.stateObj.attributes.current_position)
    this.hass.callService('cover', 'stop_cover', {
      entity_id: this.config.entity,
    });
  }

  private onCloseTap(): void {
    // console.log('close', this.stateObj.attributes.current_position)
    this.hass.callService('cover', 'close_cover', {
      entity_id: this.config.entity,
    });
  }

  private computeActiveState = (stateObj: HassEntity): string => {
    const state = stateObj?.state;
    // console.log('asdasd', state)
    return state;
  };

  // private _handleAction(ev: ActionHandlerEvent): void {
  //   if (this.hass && this.config && ev.detail.action) {
  //     handleAction(this, this.hass, this.config, ev.detail.action)
  //   }
  // }

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

  // private computeObjectId = (entityId: string): string => entityId.substr(entityId.indexOf(".") + 1);

  // private computeStateName = (stateObj: HassEntity): string =>
  //   stateObj?.attributes.friendly_name === undefined
  //     ? this.computeObjectId(stateObj?.entity_id).replace(/_/g, " ")
  //     : stateObj?.attributes.friendly_name || "";

  // private _rippleHandlers: RippleHandlers = new RippleHandlers(() => {
  //   return this._ripple
  // });

  // private _computeColor(stateObj: CoverEntity): string {
  //   if (stateObj.state === "closed") {
  //     return "";
  //   }
  //   return stateObj.attributes.rgb_color
  //     ? `rgb(${stateObj.attributes.rgb_color.join(",")})`
  //     : "";
  // }

  // private handleRippleFocus() {
  //   this._rippleHandlers.startFocus()
  // }

  private _handleMoreInfo() {
    fireEvent(this, "hass-more-info", {
      entityId: this.config?.entity
    })
  }

  static get styles(): CSSResultGroup {
    return css`
      ha-card {
        cursor: pointer;
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
        color: var(--card-color-text, white);
        border-radius: 1.5rem;
        background: var( --ha-card-background, var(--card-background-color, white) );
      }
      svg {
        /* cursor: row-resize; */
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
      .hassbut-small {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
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
        /* top: 34px; */
        left: 1px;
        /* transform: translate(-50%, -50%); */
        width: 150px;
        height: 150px;
      }
      .sc-blind-selector-medium {
        position: absolute;
        top: 0;
        left: 1px;
        width: 120px;
        height: 120px;
      }
      .sc-blind-selector-small {
        position: absolute;
        left: 7px;
        width: 75px;
        height: 75px;
      }
      .sc-blind-position {
        position: absolute;
        top: 20px;
      }
      .sc-blind-position-medium {
        position: absolute;
        left: 54px;
        top: 28px;
      }
      .sc-blind-position-small {
        display: none;
      }
      .sc-blind-label {
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
      .sc-blind-label-medium {
        font-size: 1.7rem;
        margin-left: 12%;
        font-weight: 450;
        height: 24px;
        white-space: nowrap;
        display: inline-block;
        overflow-x: hidden;
        max-width: 80%;
        text-overflow: ellipsis;
        justify-content: space-between;
      }
      .sc-blind-label-small {
        font-size: 1.2rem;
        margin-top: 10%;
        margin-left: 13%;
        font-weight: 450;
        height: 24px;
        white-space: nowrap;
        display: inline-block;
        overflow-x: hidden;
        max-width: 80%;
        text-overflow: ellipsis;
        justify-content: space-between;
      }
      .sc-blind-selector-picture {
        position: relative;
        fill: #E6E6E6;
      }
      .top-bar {
        position: absolute;
        fill: #666666;
        width: 100%;
        top: 0px;
        right: 0px;
      }
      .sc-blind-selector-slide {
        position: absolute;
        cursor: row-resize;
        height: 100%;
        max-width: 230px;
        min-width: 123px;
        max-height: 100%;
        /* top: 44px; */
        top: 24px;
        left: 14px;
      }
      .sc-blind-selector-slide-medium {
        position: absolute;
        cursor: row-resize;
        height: 100%;
        max-width: 230px;
        min-width: 99px;
        max-height: 75%;
        /* top: 44px; */
        top: 18px;
        left: 11px;
      }
      .sc-blind-selector-slide-small {
        position: absolute;
        cursor: row-resize;
        height: 100%;
        max-width: 230px;
        min-width: 62.6px;
        max-height: 74%;
        /* top: 44px; */
        top: 11px;
        left: 6.5px;
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
      .sc-blind-middle-medium {
        display: flex;
        align-items: center;
        position: relative;
        justify-content: center;
        width: 200px;
        height: 144px;
      }
      .sc-blind-middle-small {
        display: flex;
        align-items: center;
        position: relative;
        justify-content: center;
        width: 134px;
        height: 77px;
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
      .container-medium {
        height: 65%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-left: 13px;
        margin-top: 12px;
      }
      .container-small {
        height: 55%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 7px;
      }
      #buttons {
        height: 204px;
        top: -16px;
        position: absolute;
        left: 121px;
        width: 89px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .buttons {
        width: 30px;
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
        padding: 4px;
        width: 25px;
        height: 25px;
        fill: white;
      }

      #arrow-icon-middle {
        padding: 4px;
        width: 25px;
        height: 25px;
        fill: white;
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
          padding: 0;
          padding-top: 6px;
          width: 25px;
          height: 25px;
          fill: white;
          }
          #arrow-icon-middle {
            padding: 0;
            padding-top: 5px;
            width: 25px;
            height: 25px;
            fill: white;
          }
      }

      button {
        background-color: grey;
        cursor: pointer;
        fill: #ffffff;
        display: flex;
        visibility: visible;
        width: 33px;
        height: 33px;
        border-radius: 8px;
        border-width: 0;
      }
      .openButton.state-on {
        background-color: #bdbdbd!important;
      }
      .openButton.state-on > #arrow-icon {
        fill: #fdd835;
      }
      .blindOpen.state-on > svg {
        fill: #fdd835;
      }
      .closeButton.state-on {
        background-color: #bdbdbd!important;
      }
      .closeButton.state-on > #arrow-icon {
        fill: #fdd835;
      }
      .pause:active, .blindOpen:active, .closeButton:active {
        background-color: #bdbdbd !important;
      }
      .pause:active > #arrow-icon {
        fill: #fdd835;
      }
      mwc-list-item {
        cursor: pointer;
        white-space: nowrap;
      }

      /* .svgicon-blind {
        padding-bottom: 20px;
        max-width: 170px;
        transform: translate(62%, 55%) scale(2.5);
      }

      .svicon-shutter {
        padding-bottom: 20px;
        max-width: 170px;
        transform: translate(62%, 55%) scale(2.5);
      } */

      .state {
        animation: state 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
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