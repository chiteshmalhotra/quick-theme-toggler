import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { createShortcutRow } from "./utils.js";

export function behaviourPage(settings) {
    const behaviourPage = new Adw.PreferencesPage({ title: _("Behaviour"), icon_name: "behaviour-symbolic" });

    // Group: Shortcut
    const shortcutGroup = new Adw.PreferencesGroup({ title: _("Shortcuts") });
    behaviourPage.add(shortcutGroup);

    // Theme Shortcut
    const themeShortcutRow = createShortcutRow(settings, "theme-shortcut", _("Toggle Theme"));
    shortcutGroup.add(themeShortcutRow);

    // Prefs Shortcut
    const prefsShortcutRow = createShortcutRow(settings, "prefs-shortcut", _("Open Preferences"));
    shortcutGroup.add(prefsShortcutRow);

    // Group: Mouse
    const mouseGroup = new Adw.PreferencesGroup({ title: _("Mouse") });
    behaviourPage.add(mouseGroup);
    const clickModel = Gtk.StringList.new([_("Do Nothing"), _("Toggle Theme"), _("Toggle Menu")]);

    // Left
    const leftSetRow = new Adw.ComboRow({ title: _("Left Mouse Click"), model: clickModel });
    settings.bind("left", leftSetRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    mouseGroup.add(leftSetRow);

    // Right
    const rightSetRow = new Adw.ComboRow({ title: _("Right Mouse Click"), model: clickModel });
    settings.bind("right", rightSetRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    mouseGroup.add(rightSetRow);

    // Group: Advanced
    const advanceGroup = new Adw.PreferencesGroup({ title: _("Advanced") });
    behaviourPage.add(advanceGroup);

    // Force Light Theme
    const lightRow = new Adw.SwitchRow({
        title: _("Force Light Appearance"),
        subtitle: _("Default to light theme instead of system default")
    });
    settings.bind("force-light", lightRow, "active", Gio.SettingsBindFlags.DEFAULT);
    advanceGroup.add(lightRow);

    return behaviourPage;
}