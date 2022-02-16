/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';
import { BoilerplateCardConfig, EditorTarget } from './types';
import { customElement, property, state } from 'lit/decorators';

const cardConfigStruct = {
  required: {
    name: 'Entidade (Opcional)',
    show: true,
  },
};

const open_blind = "M.32 2.398c0 1.72.13 2.559.48 2.918.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.352-.359.481-1.199.481-2.918V0H.32ZM46.18 26.41v20.258H2.887V6.156H46.18Zm0 0";
const close_blind = "M3.848 26.09v18.957h41.367V7.129H3.848Zm0 0";
const open_shutter = "M.32 2.398c0 1.72.13 2.559.48 2.918.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.352-.359.481-1.199.481-2.918V0H.32ZM46.18 26.41v20.258H2.887V6.156H46.18Zm0 0";
const close_shutter = "M2.887 26.41v20.258H46.18V6.156H2.887ZM45.535 9.883v.812H3.527v-1.62h42.008Zm0 4.539v.808H3.527v-1.62h42.008Zm0 4.535v.813H3.527v-1.622h42.008Zm0 4.54v.808H3.527v-1.621h42.008Zm0 4.534v.813H3.527v-1.621h42.008Zm0 4.54v.808H3.527v-1.621h42.008Zm0 4.534v.813H3.527v-1.621h42.008Zm0 4.54v.808H3.527v-1.621h42.008Zm0 0";

const includeDomains = ["cover"];

@customElement('persiana-card-editor')
export class BoilerplateCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: BoilerplateCardConfig;
  @state() private _toggle?: boolean;
  @state() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: BoilerplateCardConfig): void {
    this._config = config;
    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }
    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _show_name(): boolean {
    return this._config?.show_name ?? true;
  }

  get _show_state(): boolean {
    return this._config?.show_state ?? true;
  }

  get _show_buttons(): boolean {
    return this._config?.show_buttons ?? true;
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: 'none' };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: 'more-info' };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: 'none' };
  }

  get _invert_percentage(): boolean {
    return this._config?.invert_percentage || false;
  }

  get _title_position(): string {
    return this._config?.title_position || false;
  }

  get _buttons_position(): string {
    return this._config?.buttons_position || false;
  }

  get _test_gui(): boolean {
    return this._config.test_gui || false;
  }

  get _blind_color(): string {
    return this._config?.blind_color || false;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }
    this._helpers.importMoreInfoControl('climate');

    const actions = [
      "more-info",
      "toggle",
      "navigate",
      "url",
      "call-service",
      "none",
    ];

    return html`
      <div class="card-config">
        <div class="option" .option=${'required'}>
              <ha-entity-picker
              .label="${this.hass.localize('ui.panel.lovelace.editor.card.generic.entity')} (${this.hass.localize('ui.panel.lovelace.editor.card.config.optional')})"
          .hass=${this.hass}
          .value=${this._entity}
          .configValue=${'entity'}
          .includeDomains=${includeDomains}
          @value-changed=${this._valueChanged}
          allow-custom-entity>
        </ha-entity-picker>
        </div class="card-config">
        </div class="option">

    <div class="side-by-side">
        <paper-input
        .label="${this.hass.localize('ui.panel.lovelace.editor.card.generic.name')} (${this.hass.localize('ui.panel.lovelace.editor.card.config.optional')})"
        .value=${this._name}
        .configValue=${'name'}
        @value-changed=${this._valueChanged}
        ></paper-input>
    </div class="side-by-side">

    <div class="div-option">
      <p>
      </p>
        <ha-formfield
          .label=${this.hass.localize('ui.panel.lovelace.editor.card.generic.show_name')}
          .dir=${this.dir}>
          <ha-switch
            .checked=${this._show_name !== false}
            .configValue=${'show_name'}
            @change=${this._change}>
          </ha-switch>  Mostrar o nome?
        </ha-formfield>

        <ha-formfield
          .label=${this.hass.localize('ui.panel.lovelace.editor.card.generic.show_state')}
          .dir=${this.dir}>
          <ha-switch
          .checked=${this._show_state !== false}
          .configValue=${'show_state'}
          @change=${this._change}>
          </ha-switch>  Mostrar o estado?
        </ha-formfield>

        <div></div>

        <paper-input-label-8>Escolha o icon: </paper-input-label-8>
          <paper-dropdown-menu class="dropdown-icon">
            <paper-listbox slot="dropdown-content"
              attr-for-selected="value"
              .configValue=${"icon"}
              selected='1'
              @iron-select=${this._changed_icon}>
                <paper-item class= "paper-item-cortina" .value=${[open_blind, close_blind]}>
                  <svg class="svg-cortina" viewBox="0 0 50 50" height="24" width="24" >
                    <path class="opacity" fill="#a9b1bc" d=${open_blind}/>
                    <path class="state" fill="#a9b1bc" d=${close_blind}/>
                  </svg>Cortinas
                </paper-item>
                <paper-item class= "paper-item-estore" .value=${[open_shutter, close_shutter]}>
                  <svg class="svg-estore" viewBox="0 0 50 50" height="24" width="24" >
                    <path class="opacity" fill="#a9b1bc" d=${open_shutter}/>
                    <path class="state" fill="#a9b1bc" d=${close_shutter}/>
                  </svg>Estore
                </paper-item>
            </paper-listbox>
        </paper-dropdown-menu>
  </div>
`;
}

private _change(ev: Event): void{
  if (!this._config || !this.hass) {
    return;
  }
  if (ev.target) {
    const target = ev.target as EditorTarget;
  const value = target.checked;
  if (this[`_${target.configValue}`] === value) {
    return;
  }

  fireEvent(this, 'config-changed', {
    config: {
      ...this._config,
      [target.configValue!]: value,
    },
  });
  }
}

private _initialize(): void {
  if (this.hass === undefined) return;
  if (this._config === undefined) return;
  if (this._helpers === undefined) return;
  this._initialized = true;
}

private async loadCardHelpers(): Promise<void> {
  this._helpers = await (window as any).loadCardHelpers();
}

private _valueChanged(ev): void {
  if (!this._config || !this.hass) {
    return;
  }
  const target = ev.target;
  if (this[`_${target.configValue}`] === target.value) {
    return;
  }
  if (target.configValue) {
    if (target.value === '') {
      const tmpConfig = { ...this._config };
      delete tmpConfig[target.configValue];
      this._config = tmpConfig;
    } else {
      this._config = {
        ...this._config,
        [target.configValue]: target.checked !== undefined ? target.checked : target.value,
      };
    }
  }
  fireEvent(this, 'config-changed', { config: this._config });
}

private _changed_icon(ev): void {
  if (!this.hass || ev.target.selected === "") {
    return;
  }
  this._config = {
    ...this._config, [ev.target.configValue]: ev.target.selected, "type": 'custom:persiana-card'
  }
  console.log("this._config", this._config);
  fireEvent(this, "config-changed", { config: this._config });
}

static get styles(): CSSResultGroup {
  return css`
    .option {
      padding: 3% 0%;
      cursor: pointer;
    }

    .row {
      display: flex;
      margin-bottom: -14px;
      pointer-events: none;
    }

    .title {
      padding-left: 16px;
      margin-top: -6px;
      pointer-events: none;
    }

    .secondary {
      padding-left: 40px;
      color: var(--secondary-text-color);
      pointer-events: none;
    }

    .values {
      padding-left: 16px;
      background: var(--secondary-background-color);
      display: grid;
    }

    ha-formfield {
      padding: 0px 10px 0px 20px;
      max-width: 211px;
    }

    .dropdown-icon {
      padding-left: 5%;
    }

    .svg-cortina {
      transform: translate(-10%, -5%) scale(1);
      margin-right: 2.5%;
    }

    .svg-estore {
      transform: translate(-10%, -5%) scale(0.90);
      margin-right: 2.5%;
    }
  `;
}
}