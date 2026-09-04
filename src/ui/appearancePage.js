import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export function appearancePage(window) {
    const settings = window._settings;

    const appearancePage = new Adw.PreferencesPage({
        title: _('Appearance'),
        icon_name: 'preferences-desktop-appearance-symbolic',
    });

    // Group: Panel Indicator
    const indicatorGroup = new Adw.PreferencesGroup({
        title: _('Indicator'),
    });
    appearancePage.add(indicatorGroup);

    // Show Indicator
    const showIndicatorRow = new Adw.SwitchRow({
        title: _('Show Indicator'),
        subtitle: _('Display the extension icon in the top panel'),
    });
    indicatorGroup.add(showIndicatorRow);
    settings.bind('show-indicator', showIndicatorRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    return appearancePage;
}