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

    // Group: actions
    const actionGroup = new Adw.PreferencesGroup({ title: _('Actions') });
    behaviourPage.add(actionGroup);

    // Shortcut Key
    const shortcutRow = new Adw.ActionRow({
        title: _('Toggle Shortcut'),
        subtitle: _('Keyboard shortcut to trigger the extension action'),
    });
    actionGroup.add(shortcutRow);

    const shortcutArray = settings.get_strv('shortcut');
    const currentShortcut = shortcutArray.length > 0 ? shortcutArray[0] : '';
    const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: currentShortcut,
        valign: Gtk.Align.CENTER,
    });
    shortcutRow.add_suffix(shortcutLabel);

    // Left click
    const clickSetModel = Gtk.StringList.new([_('None'), _('Toggle Theme'), _('Toggle Menu')]);

    const leftSetRow = new Adw.ComboRow({
        title: _('Left-Click Action'),
        subtitle: _('Action for left clicking the panel indicator.'),
        model: clickSetModel,
    });
    actionGroup.add(leftSetRow);
    settings.bind('left-click', leftSetRow, 'selected', Gio.SettingsBindFlags.DEFAULT);

    // Right click
    const rightSetRow = new Adw.ComboRow({
        title: _('Right-Click Action'),
        subtitle: _('Action for right clicking the panel indicator.'),
        model: clickSetModel,
    });
    actionGroup.add(rightSetRow);
    settings.bind('right-click', rightSetRow, 'selected', Gio.SettingsBindFlags.DEFAULT);

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