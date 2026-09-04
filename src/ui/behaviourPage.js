import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export function behaviourPage(window) {
    const settings = window._settings;

    const behaviourPage = new Adw.PreferencesPage({
        title: _('Behaviour'),
        icon_name: 'preferences-other-symbolic',
    });

    // Group: Shortcut
    const shortcutGroup = new Adw.PreferencesGroup({ title: _('Shortcut') });
    behaviourPage.add(shortcutGroup);

    // Shortcut  Key
    const shortcutRow = new Adw.ActionRow({
        title: _('Shortcut Key'),
        subtitle: _('Press these to toggle theme.'),
    });
    shortcutGroup.add(shortcutRow);

    const shortcutArray = settings.get_strv('shortcut');
    const currentShortcut = shortcutArray.length > 0 ? shortcutArray[0] : '';
    const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: currentShortcut,
        valign: Gtk.Align.CENTER,
    });
    shortcutRow.add_suffix(shortcutLabel);

    return behaviourPage;
}