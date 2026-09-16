import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { createShortcutRow } from "./utils.js";

export function behaviourPage(window) {
    const settings = window._settings;

    const behaviourPage = new Adw.PreferencesPage({
        title: _("Behavior"),
        icon_name: "preferences-other-symbolic",
    });

    // Group: actions
    const actionGroup = new Adw.PreferencesGroup({ title: _("Actions") });
    behaviourPage.add(actionGroup);

    // Shortcut Key
    const shortcutRow = createShortcutRow(
        settings,
        'shortcut',
        _("Shortcut"),
        _('Keyboard shortcut for extension action')
    );
    actionGroup.add(shortcutRow);

    // Left click
    const clickModel = Gtk.StringList.new([_("Do Nothing"), _("Toggle Theme"), _("Toggle Menu")]);
    const leftSetRow = new Adw.ComboRow({
        title: _("Left Click Action"),
        subtitle: _("Action for left clicking the panel indicator."),
        model: clickModel
    });
    settings.bind("left-click", leftSetRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    actionGroup.add(leftSetRow);

    // Right click
    const rightSetRow = new Adw.ComboRow({
        title: _("Right Click Action"),
        subtitle: _("Action for right clicking the panel indicator."),
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
        subtitle: _("Prefer light style variant during theme switching"),
    });
    settings.bind("force-light", lightRow, "active", Gio.SettingsBindFlags.DEFAULT);
    advanceGroup.add(lightRow);

    // Group: Experimental
    const experimentalGroup = new Adw.PreferencesGroup({ title: _("Experimental") });
    behaviourPage.add(experimentalGroup);

    // Smooth transition
    const smoothRow = new Adw.SwitchRow({
        title: _("Smooth transition"),
        subtitle: _("Smooth theme switch, though icon animation may vary."),
    });
    settings.bind("smooth-transition", smoothRow, "active", Gio.SettingsBindFlags.DEFAULT);
    experimentalGroup.add(smoothRow);

    return behaviourPage;
}