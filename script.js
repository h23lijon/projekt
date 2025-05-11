// === Första diagrammet: Förpackningar ===

const urlSCB1 = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0307/MI0307T2N';

const querySCB1 = {
  "query": [
    {
      "code": "Forpackning",
      "selection": {
        "filter": "item",
        "values": ["10", "35", "65"]
      }
    },
    {
      "code": "ContentsCode",
      "selection": {
        "filter": "item",
        "values": ["0000047A"]
      }
    }
  ],
  "response": {
    "format": "JSON"
  }
};

const packageNames = {
  '10': 'Glas',
  '35': 'PET-flaskor med pant',
  '65': 'Pantburkar av aluminium'
};

fetch(urlSCB1, {
  method: 'POST',
  body: JSON.stringify(querySCB1)
})
  .then(response => response.json())
  .then(data => {
    const uniquePackages = [...new Set(data.data.map(item => item.key[0]))];
    const uniqueYears = [...new Set(data.data.map(item => item.key[1]))];

    const colorBase = [
      'rgba(255, 209, 220, 0.4)',
      'rgba(173, 216, 230, 0.4)',
      'rgba(216, 191, 216, 0.4)'
    ];
    const borderColorBase = [
      'rgba(255, 160, 190, 1)',
      'rgba(100, 149, 237, 1)',
      'rgba(186, 85, 211, 1)'
    ];

    const datasets = uniquePackages.map((pkg, index) => {
      return {
        label: packageNames[pkg] || pkg,
        data: uniqueYears.map(year => {
          const item = data.data.find(d => d.key[0] === pkg && d.key[1] === year);
          return item ? parseFloat(item.values[0]) : 0;
        }),
        fill: false,
        tension: 0.3,
        borderColor: borderColorBase[index % borderColorBase.length],
        backgroundColor: colorBase[index % colorBase.length],
        borderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: uniqueYears,
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Förändring av tillförd mängd förpackningar över tid'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Ton'
            }
          },
          x: {
            title: {
              display: true,
              text: 'År'
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error('Fel vid hämtning av data (myChart):', error);
  });

// === Andra diagrammet: Försäljning av alkohol  ===

const urlSCB2 = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/HA/HA0103/HA0103A/LivsN';

const querySCB2 = {
  "query": [
    {
      "code": "Varugrupp",
      "selection": {
        "filter": "vs:VaruTjänstegrCoicopD",
        "values": [
          "02.1.1", // Spritdrycker
          "02.1.2", // Vin
          "02.1.3"  // Öl
        ]
      }
    },
    {
      "code": "ContentsCode",
      "selection": {
        "filter": "item",
        "values": [
          "000006PQ"
        ]
      }
    },
    {
      "code": "Tid",
      "selection": {
        "filter": "item",
        "values": [
          "2023"
        ]
      }
    }
  ],
  "response": {
    "format": "JSON"
  }
};

const beverageNames = {
  '02.1.1': 'Spritdrycker',
  '02.1.2': 'Vin',
  '02.1.3': 'Öl'
};

fetch(urlSCB2, {
  method: 'POST',
  body: JSON.stringify(querySCB2)
})
  .then(response => response.json())
  .then(data => {
    console.log('API-svar:', data);

    const colorBase = [
      'rgba(255, 182, 193, 0.6)',  // rosa
      'rgba(173, 216, 230, 0.6)',  // blå
      'rgba(186, 85, 211, 0.6)'    // lila
    ];
    const borderColorBase = [
      'rgba(255, 105, 135, 1)',
      'rgba(100, 149, 237, 1)',
      'rgba(147, 112, 219, 1)'
    ];

    const datasets = data.data.map((item, index) => {
      const code = item.key[0];
      const label = beverageNames[code] || code;
      const value = parseFloat(item.values[0]);

      return {
        label: label,
        data: [value],
        backgroundColor: colorBase[index % colorBase.length],
        borderColor: borderColorBase[index % borderColorBase.length],
        borderWidth: 1
      };
    });

    const ctx = document.getElementById('myChart2').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [''], // tom x-etikett – alla staplar grupperas visuellt
        datasets: datasets
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Försäljning av spritdrycker, vin och öl i Sverige'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          x: {
            stacked: false,
            title: {
              display: false
            },
            ticks: {
              display: false // inga etiketter på x-axeln
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Försäljning (volym eller index)'
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error('Fel vid hämtning av data (myChart2):', error);
  });
