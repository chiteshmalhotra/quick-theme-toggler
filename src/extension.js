import St from 'gi://St';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

const QuickThemeButton = GObject.registerClass(
    class QuickThemeButton extends PanelMenu.Button {

        _init(extension) {
            super._init(0.0, extension.metadata.name, false);
            this._extension = extension;

            // 1. Initialize data structures first
            this.changedIds = new Map();
            this.darkIcon = 'weather-clear-symbolic';
            this.lightIcon = 'weather-clear-night-symbolic';

            // 2. Settings setup
            this._settings = this._extension.getSettings();
            this._interfaceSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.interface" });

            // 3. Theme connection
            this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
            this._interfaceId = this._interfaceSettings.connect('changed::color-scheme', () => {
                this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
                this._icon.icon_name = (this.isDark ? this.darkIcon : this.lightIcon);
                this.animateIcon();
            });
            this.changedIds.set(this._interfaceSettings, this._interfaceId);

            // 4. Component setup
            this.setupIcon();
            this.setupMenu();
            this.setupEvents();
            this.setupShortcut();
            this.setupSettings();
        }

        toggleTheme() {
            this._interfaceSettings.set_string('color-scheme', this.isDark ? 'default' : 'prefer-dark');
        }

        setupIcon() {
            this._icon = new St.Icon({
                icon_name: (this.isDark ? this.darkIcon : this.lightIcon),
                style_class: 'system-status-icon theme-icon',
                reactive: true
            });
            this.add_child(this._icon);
        }

        animateIcon() {
            this._icon.set_pivot_point(0.5, 0.5);

            this._icon.rotation_angle_z = (this.isDark ? -40 : 40);
            this._icon.ease({
                rotation_angle_z: 0,
                duration: 300,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD
            });
        }

        setupEvents() {
            this._clickGesture?.set_enabled(false);

            this._buttonPressEventId = this.connect("button-press-event", (actor, event) => {
                let button = event.get_button();

                if (button === 1) this.toggleTheme();
                if (button === 3) this.menu.toggle();

                return [1, 3].includes(button) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
            });
        }

        setupMenu() {
            this.menu.addAction(_('Preferences'), () => {
                this._extension.openPreferences();
            });
        }

        setupSettings() {
            // Show Indicator
            this._settings.bind('show-indicator', this, 'visible', Gio.SettingsBindFlags.DEFAULT);

            // Shortcut 
            this._shortcutId = this._settings.connect('changed::shortcut', () => this.setupShortcut());
            this.changedIds.set(this._settings, this._shortcutId);
        }

        setupShortcut() {
            // Remove any previous shortcut if exists
            Main.wm.removeKeybinding('shortcut');

            // Add current shortcut
            Main.wm.addKeybinding(
                'shortcut',
                this._settings,
                0,
                Shell.ActionMode.ALL,
                () => { this.toggleTheme() }
            );
        }

        destroy() {
            // Disconnect signals from tracked settings objects
            this.changedIds.forEach((signalId, settingsObj) => {
                if (settingsObj && signalId) {
                    settingsObj.disconnect(signalId);
                }
            });
            this.changedIds.clear();

            // Remove keybind
            Main.wm.removeKeybinding("shortcut");

            // Destroy
            this._interfaceSettings = null;
            this._settings = null;
            super.destroy();
        }
    }
);

export default class QuickThemetogglerExtension extends Extension {

    enable() {
        this._indicator = new QuickThemeButton(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}