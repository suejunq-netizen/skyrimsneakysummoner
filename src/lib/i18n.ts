import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'pt-BR': {
    translation: {
      appTitle: 'Grimório do Necromante',
      appSubtitle: 'Skyrim Anniversary Edition · Stealth Necromancer Summoner',
      nav: {
        route: 'Rota Guiada',
        quests: 'Quests',
        spells: 'Grimório',
        perks: 'Perks',
        levels: 'Nível a Nível',
        army: 'Exército & Magicka',
        map: 'Mapa',
        equipment: 'Arsenal & Loadout',
        budget: 'Orçamento & Loops',
        myths: 'Mitos vs. Fatos',
        glossary: 'Glossário',
        about: 'Sobre & Licenças',
      },
      actions: {
        search: 'Buscar',
        installApp: 'Instalar App',
        darkMode: 'Tema Escuro',
        lightMode: 'Tema Claro',
        exportProgress: 'Exportar JSON',
        importProgress: 'Importar JSON',
        resetProgress: 'Reiniciar',
        markDone: 'Concluir passo',
        markUndone: 'Desmarcar',
        saveWarningTitle: 'Lembrete de Save Separado',
      },
      offlineBanner: 'Modo Offline — Dados do grimório em cache local.',
    },
  },
  en: {
    translation: {
      appTitle: 'Stealth Necromancer Grimoire',
      appSubtitle: 'Skyrim Anniversary Edition · Stealth Necromancer Summoner',
      nav: {
        route: 'Guided Route',
        quests: 'Quests',
        spells: 'Spellbook',
        perks: 'Perk Tree',
        levels: 'Level by Level',
        army: 'Army & Magicka',
        map: 'Map',
        equipment: 'Arsenal & Loadout',
        budget: 'Level Budget',
        myths: 'Myths vs. Facts',
        glossary: 'Glossary',
        about: 'About & Licenses',
      },
      actions: {
        search: 'Search',
        installApp: 'Install App',
        darkMode: 'Dark Theme',
        lightMode: 'Light Theme',
        exportProgress: 'Export JSON',
        importProgress: 'Import JSON',
        resetProgress: 'Reset',
        markDone: 'Complete Step',
        markUndone: 'Undo',
        saveWarningTitle: 'Separate Save Reminder',
      },
      offlineBanner: 'Offline Mode — Cached grimoire data active.',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
