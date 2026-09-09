import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { appearancePage } from './ui/appearancePage.js';
import { behaviourPage } from './ui/behaviourPage.js';
import { aboutPage } from './ui/aboutPage.js';

export default class PanelIconPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Set window properties
        window.search_enabled = true;
        window._settings = this.getSettings();

        // Add all pages
        window.add(appearancePage(window));
        window.add(behaviourPage(window));
        window.add(aboutPage(window, this.metadata));
    }
}