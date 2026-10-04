import St from "gi://St";
import Gio from "gi://Gio";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import GObject from "gi://GObject";
import Clutter from "gi://Clutter";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import { Extension, gettext as _ } from "resource:///org/gnome/shell/extensions/extension.js";

import { getIconTheme } from "./utils/helper.js";

const QuickThemeButton = GObject.registerClass(
    class QuickThemeButton extends PanelMenu.Button {

        _init(extension) {
            super._init(0.0, extension.metadata.name, false);
            this._extension = extension;

            // Data structures
            this.signals = [];
            this.clickActions = [() => { }, () => this.toggleTheme(), () => this.menu.toggle(),
            () => this._extension.openPreferences()];
            this.icons = ["dark-mode-symbolic", "weather-clear-symbolic", "weather-clear-night-symbolic"];
            this.accents = ["blue", "teal", "green", "yellow", "orange", "red", "pink", "purple", "slate"];
            this.prefs = {
                "light-bg": { get: "s", run: () => this.updateBg() },
                "dark-bg": { get: "s", run: () => this.updateBg() },

                "light-accent": { run: () => this.updateAccent() },
                "dark-accent": { run: () => this.updateAccent() },

                "dynamic-icon-theme": { get: "b", run: () => this.iconThemes = getIconTheme() },
                "light-icon-theme": { get: "i", run: () => this.updateIconTheme() },
                "dark-icon-theme": { get: "i", run: () => this.updateIconTheme() },

                "visible": { get: "b", run: () => this.visible = this.visible },
                "icon": { run: () => this._indicatorIcon.icon_name = this.icons[this.icon] },
                "region": { reload: true },
                "offset": { reload: true },

                "transition": { get: "b" }, "force-light": { get: "b" },

                "left": {}, "right": {},
            };

            // Settings
            this._settings = this._extension.getSettings();
            this._interfaceSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.interface" });
            this._bgSettings = new Gio.Settings({ schema_id: "org.gnome.desktop.background" });

            // Setups
            this.setupPrefs();
            this.setupIcon();
            this.setupMenu();
            this.setupEvents();

            // Theme connect
            this.isDark = this._interfaceSettings.get_string("color-scheme") === "prefer-dark";
            this.signals.push({
                source: this._interfaceSettings,
                id: this._interfaceSettings.connect("changed::color-scheme", () => {
                    this.isDark = this._interfaceSettings.get_string("color-scheme") === "prefer-dark";
                    this.updateAccent(); this.updateIconTheme(); this.updateBg()
                })
            });
        }

        setupPrefs() {
            const getMap = { "b": "get_boolean", "s": "get_string", "i": "get_int" };
            for (const [key, config] of Object.entries(this.prefs)) {
                const getMethod = getMap[config.get] || "get_int";
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

        setupIcon() {
            this._indicatorIcon = new St.Icon({ style_class: "system-status-icon" });
            this._indicatorIcon.icon_name = this.icons[this.icon];
            this.add_child(this._indicatorIcon);
        }

        setupMenu() {
            this.menu.addAction(_("Extension Settings"), () => this._extension.openPreferences());
            this.menu.addAction(_("Hide Indicator"), () => this._settings.set_boolean("visible", false))
        }

        setupEvents() {
            // Click
            this._clickGesture?.set_enabled(false);
            this.signals.push({
                source: this,
                id: this.connect("button-press-event", (_, event) => {
                    const btn = event.get_button();
                    if (btn === 1) this.clickActions[this.left]();
                    if (btn === 3) this.clickActions[this.right]();

                    return [1, 3].includes(btn) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
                })
            });

            // Shortcut
            this.addShortcut("theme-shortcut", () => this.toggleTheme());
            this.addShortcut("prefs-shortcut", () => this._extension.openPreferences());
        }

        addShortcut(id, run, mode = Shell.ActionMode.ALL) {
            Main.wm?.removeKeybinding(id);
            Main.wm?.addKeybinding(id, this._settings, Meta.KeyBindingFlags.NONE, mode, run);
        }

        updateAccent() {
            const activeAccent = this.isDark ? this.darkAccent : this.lightAccent;
            this._interfaceSettings.set_string("accent-color", this.accents[activeAccent]);
        }

        updateIconTheme() {
            if (!this.dynamicIconTheme) return;

            const activeIconThemeIdx = this.isDark ? this.darkIconTheme : this.lightIconTheme;
            const themeName = this.iconThemes[activeIconThemeIdx];
            this._interfaceSettings.set_string("icon-theme", themeName);
        }

        updateBg() {
            const path = this.isDark ? this.darkBg : this.lightBg;
            const key = this.isDark ? "picture-uri-dark" : "picture-uri";
            if (path) this._bgSettings.set_string(key, Gio.File.new_for_path(path).get_uri());
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

export default class QuickThemeExtension extends Extension {

    enable() {
        this._indicator = new QuickThemeButton(this);
        const region = ["left", "center", "right"].at(this._indicator.region);
        Main.panel.addToStatusArea(this.uuid, this._indicator, this._indicator.offset, region);
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