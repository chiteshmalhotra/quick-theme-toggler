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
            this.signals = [];
            this.clickActions = [() => { }, () => this.toggleTheme(), () => this.menu.toggle()];
            this.iconNames = ["weather-clear-symbolic", "weather-clear-night-symbolic", "dark-mode-symbolic"];
            this.accentColors = ["blue", "teal", "green", "yellow", "orange", "red", "pink", "purple", "slate"];
            this.prefs = {
                "icon-display": { get: "b", run: () => this.visible = this.iconDisplay },
                "light-icon": { run: () => this.updateIcon() },
                "dark-icon": { run: () => this.updateIcon() },
                "icon-box-enum": { reload: true }, "icon-offset": { reload: true },
                "transition": { get: "b" },
                "left": {}, "right": {}, "force-light": { get: "b" },
                "use-custom-accent": { get: "b", run: () => this.updateAccent() },
                "light-accent": { run: () => this.updateAccent() },
                "dark-accent": { run: () => this.updateAccent() },
                "enable-experiment": { get: "b" }, "icon-dur": {}, "icon-rotate": {},
            };

            // Settings
            this._settings = this._extension.getSettings();
            this._interfaceSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.interface" });

            // Theme connect
            this.isDark = (this._interfaceSettings.get_string("color-scheme") === "prefer-dark");
            this.signals.push({
                source: this._interfaceSettings,
                id: this._interfaceSettings.connect("changed::color-scheme", () => {
                    this.isDark = (this._interfaceSettings.get_string("color-scheme") === "prefer-dark");
                    this.updateAccent();
                    this.updateIcon();
                })
            });

            // Setups
            this.setupPrefs();
            this.setupIcon();
            this.setupMenu();
            this.setupClick();
            this.setupShortcut();
        }

        setupIcon() {
            this._icon = new St.Icon({ icon_name: this.activeIconName(), style_class: "system-status-icon" });
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

        updateIcon() { this._icon.icon_name = this.activeIconName(); this.iconAnimation() }

        activeIconName() { return this.iconNames[this.isDark ? this.darkIcon : this.lightIcon] }

        setupMenu() {
            this.menu.addAction(_("Extension Settings"), () => this._extension.openPreferences());
            this.menu.addAction(_("Hide Indicator"), () => this._settings.set_boolean("icon-display", false))
        }

        setupClick() {
            this._clickGesture?.set_enabled(false);

            this.signals.push({
                source: this,
                id: this.connect("button-press-event", (_, event) => {
                    const btn = event.get_button();
                    if (btn === 1) this.clickActions[this.left]();
                    if (btn === 3) this.clickActions[this.right]();

                    return [1, 3].includes(button) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
                })
            })
        }

        addShortcut(id, run, mode = Shell.ActionMode.ALL) {
            Main.wm?.removeKeybinding(id);
            Main.wm?.addKeybinding(id, this._settings, Meta.KeyBindingFlags.NONE, mode, run)
        }

        setupShortcut() {
            this.addShortcut("theme-shortcut", () => this.toggleTheme());
            this.addShortcut("prefs-shortcut", () => this._extension.openPreferences());
        }

        setupPrefs() {
            for (const [key, config] of Object.entries(this.prefs)) {
                const getMethod = (config.get === "b" ? "get_boolean" : "get_int");
                const configName = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

                this[configName] = this._settings[getMethod](key);

                this.signals.push({
                    source: this._settings,
                    id: this._settings.connect(`changed::${key}`, () => {
                        this[configName] = this._settings[getMethod](key);
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
            this._interfaceSettings.set_string("accent-color", this.accentColors[accentIndex]);
        }

        toggleTheme() {
            const defaultScheme = this.forceLight ? "prefer-light" : "default";
            const targetScheme = this.isDark ? defaultScheme : "prefer-dark";

            if (this.transition) Main.layoutManager.screenTransition.run();
            this._interfaceSettings.set_string("color-scheme", targetScheme);
        }

        destroy() {
            this.signals.forEach(({ source, id }) => source.disconnect(id));
            this.signals = [];

            Main.wm.removeKeybinding('theme-shortcut');
            Main.wm.removeKeybinding('prefs-shortcut');

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