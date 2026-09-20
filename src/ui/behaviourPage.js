import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { createShortcutRow } from "./utils.js";

export function behaviourPage(window) {
    const settings = window._settings;
    const behaviourPage = new Adw.PreferencesPage({ title: _("Behavior"), icon_name: "setting-symbolic" });

    // Group: Actions
    const actionGroup = new Adw.PreferencesGroup({ title: _("Actions") });
    behaviourPage.add(actionGroup);

    // Shortcut Key
    const shortcutRow = createShortcutRow(window, 'shortcut', _("Shortcut"));
    shortcutRow.subtitle = _("Global shortcut to trigger extension");
    actionGroup.add(shortcutRow);

    // Left click
    const clickModel = Gtk.StringList.new([_("Do Nothing"), _("Toggle Theme"), _("Toggle Menu")]);
    const leftSetRow = new Adw.ComboRow({ 
        title: _("Left Mouse Click"),
        subtitle: _("Action when left mouse click on panel indicator"),
        model: clickModel 
    });
    settings.bind("left-click", leftSetRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    actionGroup.add(leftSetRow);

    // Right click
    const rightSetRow = new Adw.ComboRow({ 
        title: _("Right Mouse Click"), 
        subtitle: _("Action when right mouse click on panel indicator"),
        model: clickModel 
    });
    settings.bind("right-click", rightSetRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    actionGroup.add(rightSetRow);

    // Group: Advanced
    const advanceGroup = new Adw.PreferencesGroup({ title: _("Advanced") });
    behaviourPage.add(advanceGroup);

    // Force Light Theme
    const lightRow = new Adw.SwitchRow({ 
        title: _("Force Light Appearance"),
        subtitle: _("Override system theme style")
    });
    settings.bind("force-light", lightRow, "active", Gio.SettingsBindFlags.DEFAULT);
    advanceGroup.add(lightRow);

    return behaviourPage;
}