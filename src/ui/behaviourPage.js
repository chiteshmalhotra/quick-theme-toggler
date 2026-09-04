import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export function behaviourPage(window) {
    const settings = window._settings;

    const behaviourPage = new Adw.PreferencesPage({
        title: _('Behavior'),
        icon_name: 'preferences-other-symbolic',
    });

    // Group: Shortcut
    const shortcutGroup = new Adw.PreferencesGroup({ title: _('Shortcut') });
    behaviourPage.add(shortcutGroup);

    // Shortcut Key
    const shortcutRow = new Adw.ActionRow({
        title: _('Toggle Shortcut'),
        subtitle: _('Keyboard shortcut to trigger the extension action'),
    });
    shortcutGroup.add(shortcutRow);

    const shortcutArray = settings.get_strv('shortcut');
    const currentShortcut = shortcutArray.length > 0 ? shortcutArray[0] : '';
    const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: currentShortcut,
        valign: Gtk.Align.CENTER,
    });
    shortcutRow.add_suffix(shortcutLabel);

    // Group: Advanced
    const advanceGroup = new Adw.PreferencesGroup({ title: _('Advanced') });
    behaviourPage.add(advanceGroup);

    // Force Light Theme
    const lightRow = new Adw.SwitchRow({
        title: _('Force Light Appearance'),
        subtitle: _('Prefer light style variant during theme switching'),
    });
    advanceGroup.add(lightRow);
    settings.bind('force-light', lightRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    return behaviourPage;
}