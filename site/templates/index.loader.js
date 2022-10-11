const axios = require("axios");
const log = require("mk-log");

const Templates = [
  {
    title: 'Tagesgeldvergleich', 
    permaName: "tagesgeld",
  },
  {
    title: 'Festgeldvergleich', 
    permaName: "festgeld",
  },
  {
    title: 'Hypothekenvergleich', 
    permaName: "hypotheken",
  },
  {
    title: 'Bausparvergleich', 
    permaName: 'bausparen',
  },
];

async function load() {
  try {
    return {
      data: Templates,
      // iteration loader must always implement eachVariant,
      eachVariant: function eachVariant(clos) {
        Templates.forEach((templateItem) => {
          clos({
            fullData: Templates,
            loaderData: { title: templateItem.permaName },
            pathSection: templateItem.permaName, //commendation.volume.year,
            length: Templates.length,
          });
        });
      },
    };
  } catch (err) {
    log.error(err);
    return null;
  }
}

module.exports = {
  load,
};
