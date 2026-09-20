import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { createSegmentedRow } from "./utils.js";

export function appearancePage(window) {
    const settings = window._settings;

    const appearancePage = new Adw.PreferencesPage({ title: _("Appearance"), icon_name: "brush-symbolic" });

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

    // Icon Style
    const iconStyleRow = createSegmentedRow(window, "icon-style", _("Icon Style"), ["Solar", "Circle"]);
    iconStyleRow.subtitle = _("Visual design of panel indicator");
    settings.bind("icon-style", iconStyleRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    iconDisplayRow.bind_property("active", iconStyleRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    iconGroup.add(iconStyleRow);

    // Animation Duration
    const iconDurAdj = new Gtk.Adjustment({ lower: 0, upper: 1000, step_increment: 100 });
    const iconDurRow = new Adw.SpinRow({
        title: _("Icon Animation"),
        adjustment: iconDurAdj,
        numeric: true,
        subtitle: _("Icon animation duration in milliseconds")
    });
    settings.bind("icon-dur", iconDurRow, "value", Gio.SettingsBindFlags.DEFAULT);
    iconDisplayRow.bind_property("active", iconDurRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    iconGroup.add(iconDurRow);

    // Sub Group : Position
    const posGroup = new Adw.PreferencesGroup();
    appearancePage.add(posGroup);

    // Position Box
    const iconPositionRow = createSegmentedRow(window, "icon-box-enum", _("Panel Region"), ["Left", "Center", "Right"]);
    iconPositionRow.subtitle = _("Indicator placement within panel");
    iconDisplayRow.bind_property("active", iconPositionRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    posGroup.add(iconPositionRow);

    // Position Offset
    const offsetAdjustment = new Gtk.Adjustment({ lower: 0, upper: 16, step_increment: 1 });
    const iconOffsetRow = new Adw.SpinRow({
        title: _("Position Offset"),
        adjustment: offsetAdjustment,
        numeric: true,
        subtitle: _("Fine tune position within panel region")
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
        subtitle: _("Auto switch accent color based on theme")
    });
    settings.bind("use-custom-accent", useCustomAccentRow, "active", Gio.SettingsBindFlags.DEFAULT);
    accentGroup.add(useCustomAccentRow);

    // Light Accent
    const accentModal = ["Blue", "Teal", "Green", "Yellow", "Orange", "Red", "Pink", "Purple", "Slate"];
    const lightAccentRow = createSegmentedRow(window, "light-accent", _("Light Accent Color"), accentModal, true);
    lightAccentRow.subtitle = _("Accent color for light mode");
    useCustomAccentRow.bind_property("active", lightAccentRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    accentGroup.add(lightAccentRow);

    // Dark Accent
    const darkAccentRow = createSegmentedRow(window, "dark-accent", _("Dark Accent Color"), accentModal, true);
    darkAccentRow.subtitle = _("Accent color for dark mode");
    useCustomAccentRow.bind_property("active", darkAccentRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    accentGroup.add(darkAccentRow);

    // Group: Experimental
    const experimentalGroup = new Adw.PreferencesGroup({ title: _("Experimental") });
    appearancePage.add(experimentalGroup);

    // Smooth transition
    const smoothRow = new Adw.SwitchRow({
        title: _("Smooth Theme Transition"),
        subtitle: _("May cause minor icon stuttering during theme change")
    });
    settings.bind("smooth-transition", smoothRow, "active", Gio.SettingsBindFlags.DEFAULT);
    experimentalGroup.add(smoothRow);

    return appearancePage;
}