import St from "gi://St";
import Gio from "gi://Gio";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import GObject from "gi://GObject";
import Clutter from "gi://Clutter";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import { Extension, gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";

const QuickThemeButton = GObject.registerClass(
    class QuickThemeButton extends PanelMenu.Button {

        _init(extension) {
            super._init(0.0, extension.metadata.name, false);
            this._extension = extension;

            // Data structures
            this.signalMap = [];
            this.getMap = { "i": "get_int", "s": "get_string", "b": "get_boolean" };
            this.actionMap = [() => { }, () => this.toggleTheme(), () => this.menu.toggle()];
            this.accentMap = ["blue", "teal", "green", "yellow", "orange", "red", "pink", "purple", "slate"];
            this.iconMap = ["weather-clear-symbolic", "weather-clear-night-symbolic", "dark-mode-symbolic"];
            this.settingsMap = {
                "icon-display": { get: "b", run: () => (this.visible = this.iconDisplay) },
                "light-icon": { get: "i", run: () => this.updateIcon() },
                "dark-icon": { get: "i", run: () => this.updateIcon() },
                "icon-box-enum": { get: "i", reload: true },
                "icon-offset": { get: "i", reload: true },
                "smooth-transition": { get: "b" },
                "left": { get: "i" }, "right": { get: "i" }, "force-light": { get: "b" },
                "use-custom-accent": { get: "b", run: () => this.updateAccent() },
                "light-accent": { get: "i", run: () => this.updateAccent() },
                "dark-accent": { get: "i", run: () => this.updateAccent() },
                "enable-experiment": { get: "b" },
                "icon-dur": { get: "i" }, "icon-rotate": { get: "i" },
            };

            // Settings setup
            this._settings = this._extension.getSettings();
            this._interfaceSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.interface" });

            // Theme connection
            this.isDark = (this._interfaceSettings.get_string("color-scheme") === "prefer-dark");
            this.updateAccent();
            const interfaceId = this._interfaceSettings.connect("changed::color-scheme", () => {
                this.isDark = (this._interfaceSettings.get_string("color-scheme") === "prefer-dark");
                this.updateAccent();
                this.updateIcon();
            });
            this.signalMap.push({ source: this._interfaceSettings, id: interfaceId });

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
            if (!this.enableExperiment) return;
            if (!this.iconDur && !this.iconRotate) return;

            this._icon.rotation_angle_z = this.iconRotate * (this.isDark ? -1 : 1);
            this._icon.ease({
                rotation_angle_z: 0,
                duration: this.iconDur,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD
            });
        }

        updateIcon() { this._icon.icon_name = this.currentIcon(); this.iconAnimation() }

        currentIcon() { return this.iconMap[this.isDark ? this.darkIcon : this.lightIcon] }

        setupMenu() {
            this.menu.addAction(_("Extension Settings"), () => this._extension.openPreferences())
        }

        setupEvents() {
            this._clickGesture?.set_enabled(false);

            const eventId = this.connect("button-press-event", (actor, event) => {
                let button = event.get_button();

                if (button === 1) this.actionMap[this.left]();
                if (button === 3) this.actionMap[this.right]();

                return [1, 3].includes(button) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
            });
            this.signalMap.push({ source: this, id: eventId });
        }

        setupShortcut() {
            Main.wm?.removeKeybinding("theme-shortcut");

            Main.wm?.addKeybinding(
                "theme-shortcut",
                this._settings,
                Meta.KeyBindingFlags.NONE,
                Shell.ActionMode.ALL,
                () => { this.toggleTheme() }
            );
        }

        setupSettings() {
            for (const [key, config] of Object.entries(this.settingsMap)) {
                const getMethod = this.getMap[config.get];
                const propName = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                this[propName] = this._settings[getMethod](key);

                this.signalMap.push({
                    source: this._settings,
                    id: this._settings.connect(`changed::${key}`, () => {
                        this[propName] = this._settings[getMethod](key);
                        config.reload ? this._extension.reload() : config.run?.();
                    })
                });
            }
        }

        get iconBox() { return ["left", "center", "right"].at(this.iconBoxEnum) }

        updateAccent() {
            if (!this.useCustomAccent) return;
            if (!this._interfaceSettings?.settings_schema?.has_key("accent-color")) return;
            const accentIndex = this.isDark ? this.darkAccent : this.lightAccent;
            this._interfaceSettings.set_string("accent-color", this.accentMap[accentIndex]);
        }

        toggleTheme() {
            const defaultScheme = this.forceLight ? "prefer-light" : "default";
            const targetScheme = this.isDark ? defaultScheme : "prefer-dark";

            if (this.smoothTransition) Main.layoutManager.screenTransition.run();
            this._interfaceSettings.set_string("color-scheme", targetScheme);
        }

        destroy() {
            // Disconnect all tracked signals safely
            for (const { source, id } of this.signalMap) if (source && id) source.disconnect(id);
            this.signalMap = [];

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