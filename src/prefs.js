import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import { appearancePage } from './ui/appearancePage.js';
import { behaviourPage } from './ui/behaviourPage.js';
import { aboutPage } from './ui/aboutPage.js';

export default class PanelIconPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        window.add(appearancePage(window));
        window.add(behaviourPage(window));
        window.add(aboutPage(window));
    }
}