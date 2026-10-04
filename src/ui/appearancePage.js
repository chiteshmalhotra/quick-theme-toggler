import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import GObject from "gi://GObject";

import { getIconTheme } from "../utils/helper.js";
import { createAccentRow, createBgRow } from "../utils/ui.js";

export function appearancePage(settings) {
    const appearancePage = new Adw.PreferencesPage({
        title: _("Appearance"),
        icon_name: "appearance-symbolic"
    });

    // Group: bg
    const bgGroup = new Adw.PreferencesGroup();
    appearancePage.add(bgGroup);

    const hbox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        valign: Gtk.Align.CENTER,
        halign: Gtk.Align.CENTER,
        homogeneous: true,
        spacing: 12,
        margin_top: 16,
        margin_bottom: 8,
        margin_start: 12,
        margin_end: 12
    });

    const lightBgRow = createBgRow(settings, "light-bg", "Light");
    hbox.append(lightBgRow);

    const darkBgRow = createBgRow(settings, "dark-bg", "Dark");
    hbox.append(darkBgRow);

    bgGroup.add(new Adw.PreferencesRow({ activatable: false, child: hbox }));

    // Group: Accent
    const accentGroup = new Adw.PreferencesGroup();
    appearancePage.add(accentGroup);

    const accentModel = [
        _("Blue"), _("Teal"), _("Green"), _("Yellow"), _("Orange"),
        _("Red"), _("Pink"), _("Purple"), _("Slate")
    ];

    for (const title of ["Light Accent", "Dark Accent"]) {
        const row = createAccentRow(
            settings,
            title.toLowerCase().replace(" ", "-"),
            _(title),
            accentModel
        );
        accentGroup.add(row);
    }

    // Group: Indicator
    const indicatorGroup = new Adw.PreferencesGroup({ title: _("Indicator") });
    appearancePage.add(indicatorGroup);

    // Show Indicator
    const indicatorVisibleRow = new Adw.SwitchRow({
        title: _("Indicator Visibility"),
        subtitle: _("Show or Hide panel indicator")
    });
    settings.bind("visible", indicatorVisibleRow, "active", Gio.SettingsBindFlags.DEFAULT);
    indicatorGroup.add(indicatorVisibleRow);

    // Icons
    const iconRow = new Adw.ComboRow({
        title: _("Indicator Icon"),
        subtitle: _("Select icon for panel indicator"),
        model: Gtk.StringList.new([_("Circle"), _("Sun"), _("Moon")])
    });
    settings.bind("icon", iconRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    indicatorVisibleRow.bind_property("active", iconRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    indicatorGroup.add(iconRow);

    // Position region
    const regionRow = new Adw.ComboRow({
        title: _("Panel Region"),
        subtitle: _("Indicator placement within panel"),
        model: Gtk.StringList.new([_("Left"), _("Center"), _("Right")])
    });
    settings.bind("region", regionRow, "selected", Gio.SettingsBindFlags.DEFAULT);
    indicatorVisibleRow.bind_property("active", regionRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    indicatorGroup.add(regionRow);

    // Position Offset
    const offsetAdjustment = new Gtk.Adjustment({ lower: 0, upper: 16, step_increment: 1 });
    const offsetRow = new Adw.SpinRow({
        title: _("Position Offset"),
        subtitle: _("Fine tune position within panel region"),
        adjustment: offsetAdjustment, numeric: true
    });
    indicatorVisibleRow.bind_property("active", offsetRow, "sensitive", GObject.BindingFlags.SYNC_CREATE);
    settings.bind("offset", offsetRow, "value", Gio.SettingsBindFlags.DEFAULT);
    indicatorGroup.add(offsetRow);

    // Group: Icon Theme
    const iconThemeGroup = new Adw.PreferencesGroup({ title: _("Icon Theme") });
    appearancePage.add(iconThemeGroup);

    // Dynamic Icon Theme
    const dynamicIconThemeRow = new Adw.SwitchRow({
        title: _("Dynamic Icon Theme"),
        subtitle: _("Auto switch icon theme with system theme")
    });
    settings.bind("dynamic-icon-theme", dynamicIconThemeRow, "active", Gio.SettingsBindFlags.DEFAULT);
    iconThemeGroup.add(dynamicIconThemeRow);

    // Light & Dark icon
    const iconThemeList = getIconTheme();
    const iconThemeModel = Gtk.StringList.new(iconThemeList);

    for (const title of ["Light Icon Theme", "Dark Icon Theme"]) {
        const key = title.toLowerCase().replaceAll(" ", "-");
        const row = new Adw.ComboRow({ title: title, model: iconThemeModel });
        settings.bind(key, row, "selected", Gio.SettingsBindFlags.DEFAULT);
        dynamicIconThemeRow.bind_property("active", row, "sensitive", GObject.BindingFlags.SYNC_CREATE);
        iconThemeGroup.add(row);
    }

    // Group: Advance
    const advanceGroup = new Adw.PreferencesGroup({ title: _("Advance") });
    appearancePage.add(advanceGroup);

    // Smooth transition
    const smoothRow = new Adw.SwitchRow({
        title: _("Smooth Transitions"),
        subtitle: _("Use smooth crossfades when switching themes")
    });
    settings.bind("transition", smoothRow, "active", Gio.SettingsBindFlags.DEFAULT);
    advanceGroup.add(smoothRow);

    // Force Light Theme
    const lightRow = new Adw.SwitchRow({
        title: _("Force Light Appearance"),
        subtitle: _("Default to light theme instead of system default")
    });
    settings.bind("force-light", lightRow, "active", Gio.SettingsBindFlags.DEFAULT);
    advanceGroup.add(lightRow);

    // Group: Reset
    const resetGroup = new Adw.PreferencesGroup();
    appearancePage.add(resetGroup);

    const resetButton = new Gtk.Button({
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
        margin_top: 16,
        margin_bottom: 4,
        css_classes: ["destructive-action", "pill"]
    });

    const buttonContent = new Adw.ButtonContent({
        icon_name: "view-refresh-symbolic",
        label: _(" Reset All Settings"),
        css_classes: ["heading"]
    });

    resetButton.set_child(buttonContent);

    resetGroup.add(resetButton);

    resetButton.connect("clicked", () => {
        settings.list_keys().forEach(key => settings.reset(key))
    });

    return appearancePage;
}