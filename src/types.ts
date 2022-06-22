import { ActionConfig, LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import { HassEntityAttributeBase, HassEntityBase } from 'home-assistant-js-websocket/dist/types';

declare global {
  interface HTMLElementTagNameMap {
    'persiana-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

export interface BoilerplateCardConfig extends LovelaceCardConfig {
  entity?: string;
  show_state: true;
  show_name: true;
  show_buttons: true;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  name?: string;
}

export interface EditorTarget extends EventTarget {
  value?: string;
  index?: number;
  checked?: boolean;
  configValue?: string;
  type?: HTMLInputElement['type'];
  config: ActionConfig;
}

interface CoverEntityAttributes extends HassEntityAttributeBase {
  current_position: number;
  current_tilt_position: number;
}

export interface CoverEntity extends HassEntityBase {
  attributes: CoverEntityAttributes;
}