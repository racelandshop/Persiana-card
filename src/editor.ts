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

const open = "M.113 2.52v2.402H1.13v44.871h47.719V4.922h1.015V.113H.113Zm47.043 3.949v.742H2.707V5.723h44.45Zm0 21.117v20.148H2.707V7.441h44.45Zm0 0";
const closed = "M.113 2.52v2.402H1.13v44.871h47.719V4.922h1.015V.113H.113Zm46.93 3.89v.688H2.82V5.723h44.223Zm0 1.547v.742H2.82V7.211h44.223Zm0 1.543v.688H2.82V8.812h44.223Zm0 1.547v.742H2.82v-1.488h44.223Zm0 1.601v.747H2.82v-1.489h44.223Zm0 1.602v.746H2.82v-1.488h44.223Zm0 1.605v.743H2.82v-1.489h44.223Zm0 1.602v.742H2.82v-1.488h44.223Zm0 1.543v.688H2.82v-1.372h44.223Zm0 1.547v.746H2.82v-1.488h44.223Zm0 1.547v.687H2.82v-1.375h44.223Zm0 1.488v.684H2.82v-1.371h44.223Zm0 1.543v.746H2.82v-1.488h44.223Zm0 1.602v.746H2.82v-1.489h44.223Zm0 1.546v.688H2.82v-1.375h44.223Zm0 1.489v.687H2.82v-1.375h44.223Zm0 1.547v.742H2.82v-1.489h44.223Zm0 1.66v.8H2.82v-1.605h44.223Zm0 1.601v.688H2.82v-1.375h44.223Zm0 1.543v.746H2.82v-1.488h44.223Zm0 1.606v.742H2.82v-1.488h44.223Zm0 1.543v.687H2.82v-1.375h44.223Zm0 1.547v.742H2.82v-1.489h44.223Zm0 1.543v.687H2.82v-1.371h44.223Zm0 1.546v.747H2.82v-1.489h44.223Zm0 1.547v.688H2.82v-1.375h44.223Zm0 1.543v.746H2.82v-1.488h44.223Zm0 0";

const includeDomains = ['cover'];

@customElement('persiana-card-editor')

export class BoilerplateCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: BoilerplateCardConfig;
  @state() private _toggle?: boolean;
  @state() private _helpers?: any;
  private _initialized = false;
  _show_name: boolean | undefined;
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

  get _entity(): string {
    return this._config?.entity || "";
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _buttons_position(): string {
    return this._config?.buttons_position || "";
  }

  get _title_position(): string {
    return this._config?.title_position || "";
  }

  get _invert_percentage(): boolean {
    return this._config?.invert_position || false;
  }

  get _blind_color(): string {
    return this._config?.blind_color || "";
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
        @value-changed=${this._valueChanged}
        ></paper-input>
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
    `;
  }
}
