const axios = require('axios');
const log = require('mk-log');
const ids = [
  230, // Hypothekenvergleich
  35, //Studenentkredit
  /* 
  2526, //Forward-Darlehen Rechner
  4, //Forward-Darlehen Vergleich
  2530, //Forward-Darlehen Anbieter-Liste
  250, //Wohn-Riester-Vergleich
  6, // Ratenkredit-Vergleich
  7, // Autokredit-Vergleich
  58, // Rahmenkredite
  59, // Studienkredit
  2694, // Ratenkreditangebote
  267, // Geldanlage-Berater
  8, // Girokonto-Vergleich
  60, // Prepaid-Kreditkarten
  79, // Einlagensicherung
  11, // Tagesgeld-Vergleich
  10, // Festgeld-Vergleich
  2739, // Bauspar-Vergleich
  251, // Sparbuch-Vergleich
  14, // Zuwachssparen-Vergleich
  254, // Ansparpläne-Vergleich
  12, // Depotbank-Vergleich
  3341, // ETF- /Fondssparplan Vergleich
  2511, // Kreditkarten-Vergleich
  25, // Hauskauf-Rechner
  322, // Mieten oder kaufen
  711, // Notar- und Grundbuchrechner
  30, // Tilgungsrechner
  26, // Zinsbindungs-Rechner
  323, // Vorfälligkeitsentschädigung berechnen
  1935, // Vorfälligkeitsentschädigung Schnellversion
  27, // Angebotsvergleich
  29, // Effektivzinsrechner
  24, // Haushaltsrechner
  324, // Gesamt-Effektivzinsrechner
  19, // Renditerechner gleibleibender Zins
  20, // Renditerechner steigender Zins
  21, // Renditerechner Sparen mit Bonus
  22, // Renditerechner Fonds
  23, // Renditerechner neue Lebensversicherung
  1034, // Renditerechner bestehende Lebensversicherung
  39, // Rentenrechner
  195, // Anlage-Entscheidung
  174, // Auszahlplan-Rechner
  163, // Sparziel-Rechner
  36, // Ratenkredit-Rechner
  2199, // Zahlungsstrom-Rechner
  // Studentenkredit sh. Anfang
  34, // Autofinanzierung-Rechner
  */
];

async function load() {
  try {
    const apiResult = await axios({
      url: `https://www.fmh.de/api/topics/list-by-ids/${ids.join('-')}/100`,
    });

    log.info('apiResult.data', apiResult.data.pagination);
    return {
      data: apiResult,
      // iteration loader must always implement eachItem,
      eachVariant: function eachVariant(clos) {
        const topics = apiResult.data.topics;
        for (let i = 0, l = topics.length; i < l; i++) {
          const topic = topics[i];
          clos({
            fullData: apiResult,
            loaderData: { topic },
            pathSection: topic.id,
            length: l,
          });
        }
      },
    };
  } catch (err) {
    log.error(err);
    return null;
  }
}

// load

module.exports = {
  load,
};
