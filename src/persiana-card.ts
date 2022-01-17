/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ripple } from '@material/mwc-ripple';
import { queryAsync } from 'lit-element'
import { customElement, property, state } from "lit/decorators";
import { findEntities } from "./././find-entities";
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import './editor';
import type { BoilerplateCardConfig } from './types';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';
import { mdiArrowUp, mdiArrowDown, mdiStop } from "@mdi/js";

// const open_blind = "M.32 2.398c0 1.72.13 2.559.48 2.918.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.352-.359.481-1.199.481-2.918V0H.32ZM46.18 26.41v20.258H2.887V6.156H46.18Zm0 0";
// const close_blind = "M3.848 26.09v18.957h41.367V7.129H3.848Zm0 0";

console.info(
  `%c  RACELAND-persiana-card \n%c  ${localize('common.version')} ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'blind-card',
  name: 'Persiana',
  preview: true //IMPORTANTE
});
@customElement('persiana-card')

export class BlindCard extends HTMLElement {
  [x: string]: any;
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
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFallback,
      includeDomains
    );
    return { type: "custom:blind-card", entity: "foundEntities[0]" || "", "name": "Persiana" ,"buttonsPosition": "left", "titlePosition": "top", "invertPercentage": "false", blindColor: "#ffffff" };
  }

  @property({ attribute: false }) public homeassistant!: HomeAssistant;
  @state() private config!: BoilerplateCardConfig;

  set hass(hass) {
    const _this = this;
    const entities = this.config.entities;

    if (!this.card) {
      const card = document.createElement('ha-card');

      if (this.config.title) {
        card.header = this.config.title;
      }

      this.card = card;
      this.appendChild(card);

      let allBlinds = document.createElement('div');
      allBlinds.className = 'sc-blinds';
      entities.forEach(function (entitiy) {
        let entityId = entitiy;
        if (entitiy && entitiy.entity) {
          entityId = entitiy.entity;
        }

        let buttonsPosition = 'left';
        if (entitiy && entitiy.buttons_position) {
          buttonsPosition = entitiy.buttons_position.toLowerCase();
        }

        let titlePosition = 'top';
        if (entitiy && entitiy.title_position) {
          titlePosition = entitiy.title_position.toLowerCase();
        }

        let invertPercentage = false;
        if (entitiy && entitiy.invert_percentage) {
          invertPercentage = entitiy.invert_percentage;
        }

        let blindColor = '#ffffff'
        if (entitiy && entitiy.blind_color) {
          blindColor = entitiy.blind_color;
        }

        let blind = document.createElement('div');

        blind.className = 'sc-blind';
        blind.dataset.blind = entityId;
        blind.innerHTML = `
        <div class="sc-blind-top" ` + (titlePosition == 'bottom' ? 'style="display:none;"' : '') + `>
        <div class="sc-blind-label">
        </div>
        <div class="sc-blind-position">
        </div>
        </div>
        <div class="sc-blind-middle" style="flex-direction: ` + (buttonsPosition == 'right' ? 'row-reserve' : 'row') + `;">
        <div class="sc-blind-buttons">
        <ha-icon-button class="sc-blind-button" data-command="up"><ha-icon icon="mdiArrowUp"></ha-icon></ha-icon-button><br>
        <ha-icon-button class="sc-blind-button" data-command="stop"><ha-icon icon="mdiStop"></ha-icon></ha-icon-button><br>
        <ha-icon-button class="sc-blind-button" data-command="down"><ha-icon icon="mdiArrowDown"></ha-icon></ha-icon-button>
        </div>
        <div class0"sc-blind-selector">
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
        `;

        let picture = blind.querySelector('.sc-blind-selector-picture');
        let slide = blind.querySelector('.sc-blind-selector-slide');
        let picker = blind.querySelector('.sc-blind-selector-picker');

        slide.style.background = blindColor;

        let mouseDown = function(event) {
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

        let mouseMove = function(event) {
          let newPosition = event.pageY - _this.getPictureTop(picture);
          _this.setPickerPosition(newPosition, picker, slide);
        };

        let mouseUp = function(event) {
          _this.isUpdating = false;

          let newPosition = event.pageY - _this.getPictureTop(picture);

          if (newPosition < _this.minPosition)
            newPosition = _this.minPosition;

          if (newPosition > _this.maxPosition)
            newPosition = _this.maxPosition;

          let percentagePosition = (newPosition - _this.minPosition) * 100 / (_this.maxPosition - _this.minPosition);

          if (invertPercentage) {
            _this.updateBlindPosition(hass, entityId, percentagePosition);
          } else {
            _this.updateBlindPosition(hass, entityId, 100 - percentagePosition);
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

        // blind.querySelectorAll('.sc-blind-button').forEach(function (button) {
        //   button.onclick = function () {
        //     const command = this.dataset.command;

        blind.querySelectorAll('.sc-blind-button').forEach(function () {
          const onclick: any = function () {
            const command = _this.dataset.command;

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

            hass.callService('cover', service, {
              entityId: entityId
            });
          };
        });
        allBlinds.appendChild(blind);
      });

      const style = document.createElement('style');
      style.textContent = `
      .sc-blinds {padding: 16px; }
      .sc-blind { margin-top: 1rem; overflow: hidden; }
      .sc-blind:first-child { margin-top: 0; }
      .sc-blind-middle {display: flex; width: 210px; margin: auto; }
      .sc-blind-buttons { flex: 1; text-align: center; margin-top: 0.4rem; }
      .sc-blind-selector { flex: 1; }
      .sc-blind-selector-picture { position: relative; margin: auto; background-size: cover; min-height: 150px; max-height:100%; width: 153px; }
      .sc-blind-selector-picture { background-image: url('/workspaces/persiana/images/shutter_open.png') }
      .sc-blind-selector-slide { background-color: #ffffff; position: absolute; top: 19px; left: 6px; width: 92.5%; height: 0; }
      .sc-blind-selector-picker { position: absolute; top: 19px; left: 5px; width: 93.5%; cursor: pointer; height: 20px; background-repeat: no-repeat; }
      .sc-blind-selector-picker { background-image: url('/workspaces/persiana/images/shutter_close.png') }
      .sc-blind-top { text-align: center; margin-bottom: 1rem; }
      .sc-blind-bottom { text-align: center; margin-top: 1rem; }
      .sc-blind-label { display: inline-block; font-size: 20px; text-align: center; vertical-align: middle; horizontal-align: middle; }
      .sc-blind-position { display: inline-block; vertical-align: middle; horizontal-align: left; padding: 0 6 px; margin-left: 1rem; border-radius: 2px; background-color: var(--secondary-background-color); }
      `;
      this.card.appendChild(allBlinds);
      this.appendChild(style);
    }

    entities.forEach(function (entity) {
      let entityId = entity;
      if (entity && entity.entity) {
        entityId = entity.entity;
      }

      let invertPercentage = false;
      if (entity && entity.invert_percentage) {
        invertPercentage = entity.invert_percentage;
      }

      const blind = _this.card.querySelector('div[data-blind="' + entityId + '"]');
      const slide = blind.querySelector('.sc-blind-selector-slide');
      const picker = blind.querySelector('.sc-blind-selector-picker');
      const state = hass.states[entityId];
      const friendlyName = (entity && entity.name) ? entity.name : state ? state.attributes.friendly_name : 'unknown';
      const currentPosition = state ? state.attributes.current_position : 'unknown';

      blind.querySelectorAll('.sc-blind-label').forEach(function (blindLabel) {
        blindLabel.innerHTML = friendlyName;
      })

      if (!_this.isUpdating) {
        blind.querySelectorAll('.sc-blind-position').forEach(function (blindPosition) {
          blindPosition.innerHTML = currentPosition + '%';
        })

        if (invertPercentage) {
          _this.setPickerPositionPercentage(currentPosition, picker, slide);
        } else {
          _this.setPickerPositionPercentage(100 - currentPosition, picker, slide);
        }

      }
    });
  }
  getPictureTop(picture) {
    let pictureBox = picture.getBoundingClientRect();
    let body = document.body;
    let docEl = document.documentElement;
    let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    let clientTop = docEl.clientTop || body.clientTop || 0;
    let pictureTop = pictureBox.top + scrollTop - clientTop;
    return pictureTop;
  }

  setPickerPositionPercentage(position, picker, slide) {
    let realPosition = (this.maxPosition - this.minPosition) * position / 100 + this.minPosition;
    this.setPickerPosition(realPosition, picker, slide);
  }

  setPickerPosition(position, picker, slide) {
    if (position < this.minPosition)
      position = this.minPosition;
    if (position > this.maxPosition)
      position = this.maxPosition;
    picker.style.top = position + 'px';
    slide.style.height = position - this.minPosition + 'px';
  }

  updateBlindPosition(hass, entityId, position) {
    let blindPosition = Math.round(position);
    hass.callService('cover', 'set_cover_position', {
      entity_id: entityId,
      position: blindPosition
    });
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define entities');
    }
    this.config = config;
    this.maxPosition = 137;
    this.minPosition = 19;
    this.isUpdating = false;
  }

  getCardSize() {
    return this.config.entities.length + 1;
  }
}

customElements.define("blind-card", BlindCard);