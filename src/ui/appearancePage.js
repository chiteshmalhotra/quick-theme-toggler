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

    // Group: Display
    const displayGroup = new Adw.PreferencesGroup({
        title: _('Display'),
    });
    appearancePage.add(displayGroup);

    // Show Indicator
    const showIndicatorRow = new Adw.SwitchRow({
        title: _('Show Indicator'),
        subtitle: _('Display the extension icon in the panel'),
    });
    displayGroup.add(showIndicatorRow);
    settings.bind('show-indicator', showIndicatorRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    // Icon Set
    const iconSetModel = Gtk.StringList.new([_('Moon and Sun'), _('Half Circle')]);

    const iconSetRow = new Adw.ComboRow({
        title: _('Icon Set'),
        subtitle: _('Choose the visual design for the panel icon'),
        model: iconSetModel,
    });
    displayGroup.add(iconSetRow);
    settings.bind('icon-set', iconSetRow, 'selected', Gio.SettingsBindFlags.DEFAULT);

    // Group: Animation
    const animationGroup = new Adw.PreferencesGroup({
        title: _('Animation')
    });
    appearancePage.add(animationGroup);

    // Icon Animation
    const iconAnimationRow = new Adw.SwitchRow({
        title: _('Icon Animation'),
        subtitle: _('Enable smooth animation for icon state changes'),
    });
    animationGroup.add(iconAnimationRow);
    settings.bind('icon-mov', iconAnimationRow, 'active', Gio.SettingsBindFlags.DEFAULT);

    // Animation Duration
    const iconDurAdj = new Gtk.Adjustment({ lower: 50, upper: 2000, step_increment: 50 });
    const iconDurationRow = new Adw.SpinRow({
        title: _('Transition Duration'),
        subtitle: _('Duration of the animation in milliseconds'),
        adjustment: iconDurAdj,
        numeric: true,
    });
    animationGroup.add(iconDurationRow);
    settings.bind('icon-dur', iconDurationRow, 'value', Gio.SettingsBindFlags.DEFAULT);

    // Group: Position
    const positionGroup = new Adw.PreferencesGroup({
        title: _('Position')
    });
    appearancePage.add(positionGroup);

    // Position Box
    const positionModel = Gtk.StringList.new([_('Left'), _('Center'), _('Right')]);

    const iconPositionRow = new Adw.ComboRow({
        title: _('Panel Region'),
        subtitle: _('Select which section of the panel houses the icon'),
        model: positionModel,
    });
    positionGroup.add(iconPositionRow);
    settings.bind('icon-box-enum', iconPositionRow, 'selected', Gio.SettingsBindFlags.DEFAULT);

    // Position Offset
    const offsetAdjustment = new Gtk.Adjustment({ lower: -100, upper: 100, step_increment: 1 });

    const iconOffsetRow = new Adw.SpinRow({
        title: _('Position Offset'),
        subtitle: _('Select the exact placement within the panel section'),
        adjustment: offsetAdjustment,
        numeric: true,
    });
    positionGroup.add(iconOffsetRow);
    settings.bind('icon-offset', iconOffsetRow, 'value', Gio.SettingsBindFlags.DEFAULT);

    return appearancePage;
}