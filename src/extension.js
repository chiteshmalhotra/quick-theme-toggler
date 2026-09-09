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
                'icon-style': { action: () => this.updateIcon() },
                'icon-box-enum': { action: () => this.updatePos() },
                'icon-offset': { action: () => this.updatePos() },
                'animate-icon': { type: 'bool' }, 'force-light': { type: 'bool' },
                'animation-speed': {}, 'left-click': {}, 'right-click': {},
            };

            // Settings setup
            this._settings = this._extension.getSettings();
            this._interfaceSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.interface" });

            // Theme connection
            this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
            const interfaceId = this._interfaceSettings.connect('changed::color-scheme', () => {
                this.isDark = (this._interfaceSettings.get_string('color-scheme') === 'prefer-dark');
                this.updateIcon()
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
            this._icon = new St.Icon({ icon_name: this.currentIcon(), style_class: "system-status-icon" });
            this._icon.set_pivot_point(0.5, 0.5);
            this.add_child(this._icon);
        }

        iconAnimation() {
            if (!this.animateIcon) return;
            
            const rotate = this.iconStyles[this.iconStyle].rotate;
            this._icon.rotation_angle_z = rotate * (this.isDark ? -1 : 1);
            this._icon.ease({
                rotation_angle_z: 0,
                duration: this.animationSpeed || 300,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD
            });
        }

        updateIcon() { this._icon.icon_name = this.currentIcon(); this.iconAnimation() }

        currentIcon() { return (this.iconStyles[this.iconStyle])[this.isDark ? 'dark' : 'light'] }

        setupMenu() {
            this.menu.addAction(_(" Extension Settings"), () =>
                this._extension.openPreferences(), "preferences-system-symbolic")
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
            Main.wm?.removeKeybinding('shortcut');

            Main.wm?.addKeybinding(
                'shortcut', 
                this._settings, 
                Meta.KeyBindingFlags.NONE, 
                Shell.ActionMode.ALL,
                () => { this.toggleTheme() }
            );
        }

        setupSettings() {
            // Show Indicator
            this._settings.bind('show-indicator', this, 'visible', Gio.SettingsBindFlags.DEFAULT);

            // Setting map
            for (const [key, config] of Object.entries(this.settingsMap)) {
                const get = config.type === 'bool' ? 'get_boolean' : 'get_int';

                const propName = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                this[propName] = this._settings[get](key);

                this._signals.push({
                    source: this._settings,
                    id: this._settings.connect(`changed::${key}`, () =>
                        (this[propName] = this._settings[get](key), config.action?.()))
                });
            }
        }

        get iconBox() { return ['left', 'center', 'right'].at(this.iconBoxEnum) }

        updatePos() {
            const container = this.get_parent();
            const targetBox = Main.panel['_' + this.iconBox + 'Box'];
            if (!container || !targetBox) return

            container.remove_child(this);
            targetBox.insert_child_at_index(this, Math.max(0, this.iconOffset));
        }

        toggleTheme() {
            const defaultScheme = this.forceLight ? "prefer-light" : "default";
            const targetScheme = this.isDark ? defaultScheme : "prefer-dark";
            
            Main.layoutManager.screenTransition.run();
            this._interfaceSettings.set_string("color-scheme", targetScheme);
        }

        destroy() {
            // Disconnect all tracked signals safely
            for (const { source, id } of this._signals) if (source && id) source.disconnect(id);
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
}