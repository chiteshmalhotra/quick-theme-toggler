import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export function aboutPage(window) {
    const aboutPage = new Adw.PreferencesPage({
        title: _('About'),
        icon_name: 'help-about-symbolic',
    });

    const headerGroup = new Adw.PreferencesGroup();
    const headerBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 4,
        margin_top: 12,
        margin_bottom: 12,
        halign: Gtk.Align.CENTER,
    });

    const titleLabel = new Gtk.Label({
        label: '<span size="x-large" weight="bold">Quick Theme Toggler</span>',
        use_markup: true,
    });

    const authorLabel = new Gtk.Label({
        label: _('Created by Chitesh Malhotra'),
        css_classes: ['dim-label'],
    });

    const versionLabel = new Gtk.Label({
        label: '<span weight="bold">Version 1</span>',
        use_markup: true,
        margin_top: 4,
    });

    headerBox.append(titleLabel);
    headerBox.append(authorLabel);
    headerBox.append(versionLabel);
    headerGroup.add(headerBox);
    aboutPage.add(headerGroup);

    const linksGroup = new Adw.PreferencesGroup();

    const createLinkRow = (title, iconName, buttonLabel, url) => {
        const row = new Adw.ActionRow({
            title: title,
            icon_name: iconName,
        });

        const button = new Gtk.Button({
            label: buttonLabel,
            valign: Gtk.Align.CENTER,
        });
        button.connect('clicked', () => {
            Gtk.show_uri(window, url, Gdk.CURRENT_TIME);
        });

        row.add_suffix(button);
        row.set_activatable_widget(button);
        return row;
    };

    linksGroup.add(createLinkRow(_('Project Repository'), 'applications-engineering-symbolic', 'Github', 'https://github.com/chiteshmalhotra/quick-theme-toggler'));
    linksGroup.add(createLinkRow(_('License'), 'dialog-information-symbolic', 'Github', 'https://github.com/chiteshmalhotra/quick-theme-toggler/blob/main/LICENSE.txt'));

    aboutPage.add(linksGroup);

    return aboutPage;
}