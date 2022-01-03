/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';
import { BoilerplateCardConfig, EditorTarget } from './types';
import { customElement, property, state } from 'lit/decorators';
// import { assert } from 'superstruct';

const cardConfigStruct = {
  required: {
    name: 'Entidade (Opcional)',
    show: true,
  },
};

const op = "M.32 2.559c0 1.59.16 2.398.48 2.757.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.321-.359.481-1.168.481-2.757V.324H.32Zm45.86 23.53v20.579H2.887V5.508H46.18Zm0 0";
const closed = "M3.527 7.941v1.457h42.008V6.48H3.527Zm0 3.239v1.46h42.008V9.724H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.238v1.461h42.008v-2.918H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.243v1.457h42.008v-2.918H3.527Zm0 3.238v1.46h42.008v-2.917H3.527Zm0 3.242v1.457h42.008v-2.914H3.527Zm0 3.242v1.457h42.008v-2.918H3.527Zm0 3.238v1.461h42.008v-2.918H3.527Zm0 3.243v1.457h42.008V38.89H3.527Zm0 3.242v1.457h42.008v-2.918H3.527Zm0 0";

const open = "M.32 2.559c0 1.59.16 2.398.48 2.757.419.418.481 3.274.481 21.875V48.61h46.5V27.191c0-18.601.063-21.457.48-21.875.321-.359.481-1.168.481-2.757V.324H.32Zm45.86 23.53v20.579H25.977V5.508H46.18Zm-21.809 0v18.958H4.488V7.129h19.883Zm0 0";
const close = "M2.887 26.09v20.578H46.18V5.508H2.887Zm0 0";

const up = "M12.305.43C10.625 3.723.012 24.914.012 24.973c0 .011.008.015.02.015.03 0 2.429-1.035 10.202-4.406 1.239-.539 2.262-.977 2.274-.977.008 0 1.527.653 3.37 1.45 6.411 2.773 9.09 3.93 9.106 3.918C25 24.953 12.582.09 12.527.035c-.007-.008-.09.145-.222.395Zm0 0";
const down = "M24.695.125c-.457.195-3.726 1.613-7.968 3.45a447.206 447.206 0 0 1-4.235 1.823c-.015 0-1.156-.492-2.539-1.085C4.102 1.776.445.199.153.085.092.063.038.05.038.059c0 .05 12.41 24.902 12.438 24.902.015 0 1.398-2.734 4.597-9.11C19.883 10.267 24.977.063 24.977.04c0-.031-.012-.023-.282.086Zm0 0";
const stop = "M1.023 12.313v11.085h22.954V1.227H1.023Zm0 0";

// const includeDomains = ['cover'];
const includeDomains = ["switch"];
@customElement('persiana-card-editor')

export class BoilerplateCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: BoilerplateCardConfig;
  @state() private _toggle?: boolean;
  @state() private _helpers?: any;
  private _initialized = false;
  _changed_icon: unknown;
  dir: any;

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

  get _entity(): string {
    return this._config?.entity || "";
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: 'more-info' };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: 'none' };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: 'none' };
  }

  get _buttons_position(): string {
    return this._config?.buttons_position || "";
  }

  get _title_position(): string {
    return this._config?.title_position || "";
  }

  get _invert_percentage(): string {
    return this._config?.invert_percentage || "";
  }

  get _blind_color(): string {
    return this._config?.blind_color || "";
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }
    this._helpers.importMoreInfoControl('climate');

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
          @value-changed=${this._valueChanged}>
        </paper-input>
    </div class="side-by-side">
    <div class="div-options">
      <p>
      </p>
        <ha-formfield
          .label=${this.hass.localize('ui.panel.lovelace.editor.card.generic.show_name')}
          .dir=${this.dir}>
          <ha-switch
            .checked=${this._show_name !== false}
            .configValue=${'show_name'}
            @change=${this._change}>
          </ha-switch>
      </ha-formfield>
    </div>
    <ha-formfield
      .label=${this.hass.localize('ui.panel.lovelace.editor.card.generic.show_state')}
      .dir=${this.dir}>
        <ha-switch
          .checked=${this._show_state !== false}
          .configValue=${'show_state'}
          @change=${this._change}>
        </ha-switch>
    </ha-formfield>
    <div>
</div>
<paper-input-label-8>Escolha o icon: </paper-input-label-8>
<paper-dropdown-menu class="dropdown-icon">
<paper-listbox slot="dropdown-content"
  attr-for-selected="value"
  .configValue=${"icon"}
  selected='1'
  @iron-select=${this._changed_icon}>
    <paper-item class= "paper-item-tecido" .value=${[open, close]}>
        <svg class="svg-tecido" viewBox="0 0 24 24" height="24" width="24" >
        <path class="opacity" fill="#a9b1bc" d=${open}/>
        <path class="state" fill="#a9b1bc" d=${close}/>
        </svg>Persiana de Tecido
    </paper-item>
    <paper-item class= "paper-item-plastico" .value=${[op, closed]}>
        <svg class="svg-platico" viewBox="0 0 50 50" height="24" width="24" >
        <path class="opacity"  fill="#a9b1bc" d=${op}/>
        <path class="state" fill="#a9b1bc" d=${closed}/>
        </svg>Persiana de Plástico
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

      .svg-tecido {
        transform: translate(-10%, -5%) scale(1.5);
        margin-right: 2.5%;
      }

      .svg-platico {
        margin-right: 2.5%;
        transform: translate(-10%, -5%) scale(1.5);
      }

    `;
  }
}
