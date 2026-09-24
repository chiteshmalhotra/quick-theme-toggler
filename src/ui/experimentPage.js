import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export function experimentPage(settings) {
    const experimentPage = new Adw.PreferencesPage({
        title: _("Experiment"),
        icon_name: "experiment-symbolic"
    });

    // Group: experiment
    const experimentGroup = new Adw.PreferencesGroup();
    experimentPage.add(experimentGroup);

    const experimentRow = new Adw.SwitchRow({
        title: _("Enable Experimental Features"),
        subtitle: _("Try new features before they are officially released")
    });
    settings.bind("enable-experiment", experimentRow, "active", Gio.SettingsBindFlags.DEFAULT);
    experimentGroup.add(experimentRow);

    // Icon Rotation
    const iconrotateAdj = new Gtk.Adjustment({ lower: 0, upper: 360, step_increment: 20 });
    const iconrotateRow = new Adw.SpinRow({
        title: _("Icon Rotation"),
        subtitle: _("Smooth transition needs to be disabled"),
        adjustment: iconrotateAdj, numeric: true,
    });
    settings.bind("icon-rotate", iconrotateRow, "value", Gio.SettingsBindFlags.DEFAULT);
    experimentRow.bind_property("active", iconrotateRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    experimentGroup.add(iconrotateRow);

    // Icon Animation
    const iconDurAdj = new Gtk.Adjustment({ lower: 0, upper: 1000, step_increment: 100 });
    const iconDurRow = new Adw.SpinRow({
        title: _("Icon Animation"),
        subtitle: _("Smooth transition needs to be disabled"),
        adjustment: iconDurAdj, numeric: true
    });
    settings.bind("icon-dur", iconDurRow, "value", Gio.SettingsBindFlags.DEFAULT);
    experimentRow.bind_property("active", iconDurRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    experimentGroup.add(iconDurRow);

    return experimentPage;
}