import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";
import { gettext as _ } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";
import { createSegmentedRow } from "./utils.js";

export function appearancePage(window) {
    const settings = window._settings;

    const appearancePage = new Adw.PreferencesPage({
        title: _("Appearance"),
        icon_name: "preferences-desktop-appearance-symbolic",
    });

    // Group: Panel icon
    const iconGroup = new Adw.PreferencesGroup({ title: _("Panel Icon") });
    appearancePage.add(iconGroup);

    // Icon Display
    const iconDisplayRow = new Adw.SwitchRow({
        title: _("Icon Display"),
        subtitle: _('Display icon in the panel')
    });
    settings.bind("icon-display", iconDisplayRow, "active", Gio.SettingsBindFlags.DEFAULT);
    iconGroup.add(iconDisplayRow);

    // Icon Style
    const iconStyleRow = createSegmentedRow(
        settings,
        "icon-style",
        _("Icon Style"),
        _("Select the icon style"),
        ["Solar", "Circle"],
    );
    settings.bind("icon-style", iconStyleRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    iconDisplayRow.bind_property("active", iconStyleRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    iconGroup.add(iconStyleRow);

    // Animation Duration
    const iconDurAdj = new Gtk.Adjustment({ lower: 0, upper: 1000, step_increment: 100 });
    const iconDurRow = new Adw.SpinRow({
        title: _("Icon Animation"),
        subtitle: _("Set icon animation duration"),
        adjustment: iconDurAdj,
        numeric: true
    });
    settings.bind("icon-dur", iconDurRow, "value", Gio.SettingsBindFlags.DEFAULT);
    iconDisplayRow.bind_property("active", iconDurRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    iconGroup.add(iconDurRow);

    // Position Box
    const iconPositionRow = createSegmentedRow(
        settings, 
        "icon-box-enum", 
        _("Panel Region"),
        _("Select the panel section for the icon"),
        ["Left", "Center", "Right"]
    );
    iconDisplayRow.bind_property("active", iconPositionRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    iconGroup.add(iconPositionRow);

    // Position Offset
    const offsetAdjustment = new Gtk.Adjustment({ lower: 0, upper: 16, step_increment: 1 });
    const iconOffsetRow = new Adw.SpinRow({
        title: _("Position Offset"),
        subtitle: _("Select the offset within the panel section"),
        adjustment: offsetAdjustment,
        numeric: true,
    });
    iconDisplayRow.bind_property("active", iconOffsetRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    settings.bind("icon-offset", iconOffsetRow, "value", Gio.SettingsBindFlags.DEFAULT);
    iconGroup.add(iconOffsetRow);

    // Group: Accent Color
    const accentGroup = new Adw.PreferencesGroup({ title: _("Accent Color") });
    appearancePage.add(accentGroup);

    // Use custom accent
    const useCustomAccentRow = new Adw.SwitchRow({
        title: _("Use Custom Accent"),
        subtitle: _("Override system accent colors"),
    });
    settings.bind("use-custom-accent", useCustomAccentRow, "active", Gio.SettingsBindFlags.DEFAULT);
    accentGroup.add(useCustomAccentRow);

    // Accent Table Model
    const accentMap = ["blue", "teal", "green", "yellow", "orange", "red", "pink", "purple", "slate"];
    const accentModel = Gtk.StringList.new(accentMap);

    // Light Accent
    const lightAccentRow = new Adw.ComboRow({
        title: _("Light Accent"),
        subtitle: _("Select accent color for light theme"),
        model: accentModel,
    });
    settings.bind("light-accent", lightAccentRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    useCustomAccentRow.bind_property("active", lightAccentRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    accentGroup.add(lightAccentRow);

    // Dark Accent
    const darkAccentRow = new Adw.ComboRow({
        title: _("Dark Accent"),
        subtitle: _("Select accent color for dark theme"),
        model: accentModel,
    });
    settings.bind("dark-accent", darkAccentRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    useCustomAccentRow.bind_property("active", darkAccentRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    accentGroup.add(darkAccentRow);

    return appearancePage;
}