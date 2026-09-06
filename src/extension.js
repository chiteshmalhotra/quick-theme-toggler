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
            this._signals = [];
            this.clickActions = [() => { }, () => this.toggleTheme(), () => this.menu.toggle()];
            this.iconStyles = [
                { light: "weather-clear-symbolic", dark: "weather-clear-night-symbolic", rotate: 40 },
                { light: "dark-mode-symbolic", dark: "dark-mode-symbolic", rotate: 180 }
            ];
            this.settingsMap = {
                'icon-style': { reload: true }, 'animate-icon': { type: 'boolean' }, 'animation-speed': {},
                'icon-box-enum': { reload: true }, 'icon-offset': { reload: true },
                'force-light': { type: 'boolean' }, 'left-click': {}, 'right-click': {},
            };

            // Settings setup
            this._settings = this._extension.getSettings();
            this._interfaceSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.interface" });

            // Theme connection
            this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
            const interfaceId = this._interfaceSettings.connect('changed::color-scheme', () => {
                this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
                this._icon.icon_name = this.getActiveIcon();
                this.iconAnimaticon();
            });
            this._signals.push({ source: this._interfaceSettings, id: interfaceId });

            // Setups
            this.setupSettings();
            this.setupIcon();
            this.setupMenu();
            this.setupEvents();
            this.setupShortcut();
        }

        setupIcon() {
            this._icon = new St.Icon({
                icon_name: this.getActiveIcon(),
                style_class: "system-status-icon"
            });
            this._icon.set_pivot_point(0.5, 0.5);
            this.add_child(this._icon);
        }

        iconAnimaticon() {
            if (!this.animateIcon) return;

            const iconStyles = this.iconStyles[this.iconStyle] ?? this.iconStyles[0];
            const iconRotate = (this.isDark ? -1 : 1) * iconStyles.rotate;

            this._icon.rotation_angle_z = iconRotate;
            this._icon.ease({
                rotation_angle_z: 0,
                duration: this.animationSpeed,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD
            });
        }

        getActiveIcon() { return this.iconStyles.at(this.iconStyle)[this.isDark ? 'dark' : 'light'] }

        setupMenu() {
            this.menu.addAction(_(" Extension Settings"), () =>
                this._extension.openPreferences(), "preferences-system-symbolic");
        }

        setupEvents() {
            this._clickGesture?.set_enabled(false);

            const eventId = this.connect("button-press-event", (actor, event) => {
                let button = event.get_button();

                if (button === 1) this.clickActions[this.leftClick]();
                if (button === 3) this.clickActions[this.rightClick]();

                return [1, 3].includes(button) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
            });
            this._signals.push({ source: this, id: eventId });
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

            // Setting map
            for (const [key, config] of Object.entries(this.settingsMap)) {
                const getter = config.type === 'boolean' ? 'get_boolean' : 'get_int';
                
                const propName = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase()); // Ex 'icon-style' -> 'iconStyle'

                this[propName] = this._settings[getter](key);

                const id = this._settings.connect(`changed::${key}`, () => {
                    this[propName] = this._settings[getter](key);
                    if (config.reload) this._extension.reload();
                });
                this._signals.push({ source: this._settings, id });
            }
        }

        get iconBox() { return ['left', 'center', 'right'].at(this.iconBoxEnum) ?? 'right' }

        toggleTheme() {
            const defaultScheme = this.forceLight ? "prefer-light" : "default";
            const targetScheme = this.isDark ? defaultScheme : "prefer-dark";
            this._interfaceSettings.set_string("color-scheme", targetScheme);
        }

        destroy() {
            // Disconnect all tracked signals safely
            for (const { source, id } of this._signals) {
                if (source && id) source.disconnect(id)
            }
            this._signals = [];

            // Remove desktop shortcut binding
            Main.wm?.removeKeybinding("shortcut");

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