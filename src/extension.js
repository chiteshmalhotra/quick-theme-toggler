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

            // Data structures
            this.iconSets = [
                { light: "weather-clear-symbolic", dark: "weather-clear-night-symbolic", rotate: 40 },
                { light: "dark-mode-symbolic", dark: "dark-mode-symbolic", rotate: 180 }
            ];

            // Settings setup
            this._settings = this._extension.getSettings();
            this._interfaceSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.interface" });

            // Theme connection
            this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
            this._interfaceId = this._interfaceSettings.connect('changed::color-scheme', () => {
                this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
                this._icon.icon_name = this.getActiveIcon();
                this.animateIcon();
            });

            // Init settings
            this.iconSet = this._settings.get_int("icon-set");
            this.iconMov = this._settings.get_boolean("icon-mov");
            this.iconDur = this._settings.get_int("icon-dur");
            this.iconBox = ["left", "center", "right"][this._settings.get_int("icon-box-enum")] ?? "right";
            this.iconOffset = this._settings.get_int("icon-offset");
            this.forceLight = this._settings.get_boolean("force-light");

            // Component setup
            this.setupIcon();
            this.setupMenu();
            this.setupEvents();
            this.setupShortcut();
            this.setupSettings();
        }

        setupIcon() {
            this._icon = new St.Icon({
                icon_name: this.getActiveIcon(),
                style_class: "system-status-icon"
            });
            this._icon.set_pivot_point(0.5, 0.5);
            this.add_child(this._icon);
        }

        animateIcon() {
            if (!this.iconMov) return;

            const iconSets = this.iconSets[this.iconSet] ?? this.iconSets[0];
            const iconRotate = (this.isDark ? -1 : 1) * iconSets.rotate;

            this._icon.rotation_angle_z = iconRotate;
            this._icon.ease({
                rotation_angle_z: 0,
                duration: this.iconDur,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD
            });
        }

        getActiveIcon() {
            const iconSets = (this.iconSets[this.iconSet] ?? this.iconSets[0]);
            return this.isDark ? iconSets.dark : iconSets.light;
        }

        setupMenu() {
            this.menu.addAction(_(" Extension Settings"), () => 
            this._extension.openPreferences(), "preferences-system-symbolic");
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

        setupShortcut() {
            Main.wm.addKeybinding(
                'shortcut',
                this._settings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.ALL,
                () => { this.toggleTheme(); }
            );
        }

        setupSettings() {
            // Show Indicator
            this._settings.bind('show-indicator', this, 'visible', Gio.SettingsBindFlags.DEFAULT);

            // Icon Set
            this._iconSetId = this._settings.connect("changed::icon-set", () => {
                this.iconSet = this._settings.get_int("icon-set");
                this._icon.icon_name = this.getActiveIcon();
            });

            // Icon Animation
            this._iconMovId = this._settings.connect("changed::icon-mov", () => {
                this.iconMov = this._settings.get_boolean("icon-mov");
            });

            // Icon Dur
            this._iconDurId = this._settings.connect("changed::icon-dur", () => {
                this.iconDur = this._settings.get_int("icon-dur");
            });

            // Icon Box
            this._iconBoxEnumId = this._settings.connect("changed::icon-box-enum", () => {
                const boxEnum = this._settings.get_int("icon-box-enum");
                this.iconBox = ["left", "center", "right"][boxEnum] ?? "right";
                this._extension.reload();
            });

            // Icon Offset
            this._iconOffsetId = this._settings.connect("changed::icon-offset", () => {
                this.iconOffset = this._settings.get_int("icon-offset");
                this._extension.reload();
            });

            // Force Light
            this._forceLightId = this._settings.connect("changed::force-light", () => {
                this.forceLight = this._settings.get_boolean("force-light");
            });
        }

        toggleTheme() {
            const defaultScheme = this.forceLight ? "prefer-light" : "default";
            const targetScheme = this.isDark ? defaultScheme : "prefer-dark";
            this._interfaceSettings.set_string("color-scheme", targetScheme);
        }

        destroy() {
            Object.entries({
                _iconSetId: this._settings, _iconMovId: this._settings, _iconDurId: this._settings,
                _iconBoxEnumId: this._settings, _iconOffsetId: this._settings, _forceLightId: this._settings,
                _buttonPressEventId: this, _interfaceId: this._interfaceSettings
            }).forEach(([k, src]) => this[k] && src.disconnect(this[k]));

            Main.wm.removeKeybinding("shortcut");

            this._interfaceSettings = null;
            this._settings = null;
            super.destroy();
        }
    }
);

export default class QuickThemetogglerExtension extends Extension {

    enable() {
        this._indicator = new QuickThemeButton(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator, this._indicator.iconOffset, this._indicator.iconBox);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }

    reload() {
        this.disable();
        this.enable();
    }
}