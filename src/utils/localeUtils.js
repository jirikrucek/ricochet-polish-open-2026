const LOCALE_MAP = {
    pl: 'pl-PL',
    en: 'en-US',
    nl: 'nl-NL',
    de: 'de-DE',
    cs: 'cs-CZ'
};

export const getLocaleFromLanguage = (lang) => {
    return LOCALE_MAP[lang] || 'en-US';
};
