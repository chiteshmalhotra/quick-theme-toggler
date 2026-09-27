import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

import { createSegmentedRow } from "./utils.js";

export function appearancePage(settings) {
    const appearancePage = new Adw.PreferencesPage({ title: _("Appearance"), icon_name: "appearance-symbolic" });

    // Group: Panel icon
    const iconGroup = new Adw.PreferencesGroup({ title: _("Indicator") });
    appearancePage.add(iconGroup);

    // Icon Display
    const iconDisplayRow = new Adw.SwitchRow({
        title: _("Show Indicator"),
        subtitle: _("Toggle panel indicator display")
    });
    settings.bind("icon-display", iconDisplayRow, "active", Gio.SettingsBindFlags.DEFAULT);
    iconGroup.add(iconDisplayRow);

    // Light Icon
    const iconModel = Gtk.StringList.new([_("Sun"), _("Moon"), _("Circle")]);
    const lightIconRow = new Adw.ComboRow({ title: _("Light Theme Icon"), model: iconModel });
    settings.bind("light-icon", lightIconRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    iconDisplayRow.bind_property("active", lightIconRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    iconGroup.add(lightIconRow);

    // Dark Icon
    const darkIconRow = new Adw.ComboRow({ title: _("Dark Theme Icon"), model: iconModel });
    settings.bind("dark-icon", darkIconRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    iconDisplayRow.bind_property("active", darkIconRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    iconGroup.add(darkIconRow);

    // Sub Group : Position
    const posGroup = new Adw.PreferencesGroup();
    appearancePage.add(posGroup);

    // Position Box
    const iconPositionRow = createSegmentedRow(settings, "icon-box-enum", _("Panel Region"), ["Left", "Center", "Right"]);
    iconPositionRow.subtitle = _("Indicator placement within panel");
    iconDisplayRow.bind_property("active", iconPositionRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    posGroup.add(iconPositionRow);

    // Position Offset
    const offsetAdjustment = new Gtk.Adjustment({ lower: 0, upper: 16, step_increment: 1 });
    const iconOffsetRow = new Adw.SpinRow({
        title: _("Position Offset"),
        subtitle: _("Fine tune position within panel region"),
        adjustment: offsetAdjustment, numeric: true
    });
    iconDisplayRow.bind_property("active", iconOffsetRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    settings.bind("icon-offset", iconOffsetRow, "value", Gio.SettingsBindFlags.DEFAULT);
    posGroup.add(iconOffsetRow);

    // Group: Accent Color
    const accentGroup = new Adw.PreferencesGroup({ title: _("Accent Color") });
    appearancePage.add(accentGroup);

    // Use custom accent
    const useCustomAccentRow = new Adw.SwitchRow({
        title: _("Use Custom Accent"),
        subtitle: _("Set different accent color based on theme")
    });
    settings.bind("use-custom-accent", useCustomAccentRow, "active", Gio.SettingsBindFlags.DEFAULT);
    accentGroup.add(useCustomAccentRow);

    // Light Accent
    const accentModal = ["Blue", "Teal", "Green", "Yellow", "Orange", "Red", "Pink", "Purple", "Slate"];
    const lightAccentRow = createSegmentedRow(settings, "light-accent", _("Light Theme Color"), accentModal, 1);
    useCustomAccentRow.bind_property("active", lightAccentRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    accentGroup.add(lightAccentRow);

    // Dark Accent
    const darkAccentRow = createSegmentedRow(settings, "dark-accent", _("Dark Theme Color"), accentModal, 1);
    useCustomAccentRow.bind_property("active", darkAccentRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    accentGroup.add(darkAccentRow);

    // Group: Advance
    const advanceGroup = new Adw.PreferencesGroup({ title: _("Advance") });
    appearancePage.add(advanceGroup);

    // Smooth transition
    const smoothRow = new Adw.SwitchRow({
        title: _("Screen Transition"),
        subtitle: _("Animate crossfades when switching theme")
    });
    settings.bind("transition", smoothRow, "active", Gio.SettingsBindFlags.DEFAULT);
    advanceGroup.add(smoothRow);

    return appearancePage;
}