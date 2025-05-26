// Förpackningar, SCB

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
    'rgb(220, 134, 153)',
    'rgb(136, 176, 75)',
    'rgb(60, 125, 144)'   
    ];
    const borderColorBase = [
    'rgb(220, 134, 153)',
    'rgb(136, 176, 75)',
    'rgb(60, 125, 144)'   
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
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 4,
      };
    });

    const ctx1 = document.getElementById('myChart1').getContext('2d');
    new Chart(ctx1, {
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
    console.error('Fel vid hämtning av data (myChart1):', error);
  });

//Vad köper vi mest, myChart2 ================================================================

const urlSCB2 = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/HA/HA0103/HA0103A/LivsN';

const querySCB2 = {
  "query": [
    {
      "code": "Varugrupp",
      "selection": {
        "filter": "vs:VaruTjänstegrCoicopD",
        "values": [
          "02.1.1",
          "02.1.2",
          "02.1.3"
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

// Ladda bilder korrekt
const vinImg = new Image();
const ölImg = new Image();
const spritImg = new Image();

const vinPromise = new Promise(resolve => {
  vinImg.onload = resolve;
  vinImg.src = 'img/vin.png';
});
const ölPromise = new Promise(resolve => {
  ölImg.onload = resolve;
  ölImg.src = 'img/öl.png';
});
const spritPromise = new Promise(resolve => {
  spritImg.onload = resolve;
  spritImg.src = 'img/sprit.png';
});

// När alla bilder är laddade
Promise.all([vinPromise, ölPromise, spritPromise])
  .then(() => {
    fetch(urlSCB2, {
      method: 'POST',
      body: JSON.stringify(querySCB2)
    })
      .then(response => response.json())
      .then(data => {
        const rawData = data.data.map(item => {
          return {
            code: item.key[0],
            label: beverageNames[item.key[0]],
            value: parseFloat(item.values[0])
          };
        });

        const chartData = {
          labels: rawData.map(d => d.label),
          datasets: [{
            label: 'Konsumtion',
            data: rawData.map(d => d.value),
            backgroundColor: 'transparent'
          }]
        };

        const ctx2 = document.getElementById('myChart2').getContext('2d');

        const imageMap = {
          'Spritdrycker': spritImg,
          'Vin': vinImg,
          'Öl': ölImg
        };

        const chartConfig = {
          type: 'bar',
          data: chartData,
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: {
                display: true,
                text: 'Konsumtion av vin, öl och sprit (miljoner kr, 2023)'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Miljoner kronor'
                }
              },
              x: {
                ticks: {
                  font: {
                    size: 14
                  }
                }
              }
            }
          },
          plugins: [{
            id: 'imageBars',
            beforeDatasetDraw(chart) {
              const { ctx, data, chartArea: { top, bottom }, scales: { x, y } } = chart;
              const dataset = data.datasets[0];
          
              dataset.data.forEach((value, index) => {
                const xPos = x.getPixelForValue(index);
                const yVal = y.getPixelForValue(value);
                const yBase = y.getPixelForValue(0);
                const image = imageMap[data.labels[index]];
          
                const barHeight = yBase - yVal; // höjden på stapeln i pixlar
                const aspectRatio = image.naturalWidth / image.naturalHeight; 
                const barWidth = barHeight * aspectRatio;
          
                const xOffset = xPos - barWidth / 2;
          
                ctx.drawImage(image, xOffset, yVal, barWidth, barHeight);
              });
            }
          }]
          
        };          

        new Chart(ctx2, chartConfig);
      })
      .catch(error => {
        console.error('Fel vid hämtning av data (myChart2):', error);
      });
  });


// Konsumtion från CAN ==================================================================== CAN

const labels = ["2003", "2008", "2013", "2018", "2020", "2021", "2022", "2023"];
const rawDatasets = [
  { label: "Sprit", data: [27.6, 26.1, 26.0, 27.8, 27.9, 26.9, 25.1, 25.1, 23.5, 23.7, 22.1, 22.2, 23.5, 21.7, 22.2, 20.7, 20.4, 18.8, 18.5, 18.6, 16.9, 17.7, 18.1, 18.4] },
  { label: "Vin", data: [34.1, 35.6, 35.2, 34.0, 34.0, 34.3, 36.6, 37.3, 39.4, 40.4, 41.6, 41.7, 41.0, 41.9, 41.0, 41.8, 42.0, 42.7, 42.8, 42.3, 45.1, 44.5, 43.7, 43.7] },
  { label: "Cider", data: [1.0, 1.2, 1.3, 1.1, 1.2, 1.4, 1.4, 1.6, 1.5, 1.4, 1.7, 1.6, 1.7, 1.4, 1.6, 1.4, 1.7, 1.7, 1.9, 1.9, 2.1, 2.1, 2.1, 2.2] },
  { label: "Folköl", data: [9.4, 8.7, 8.1, 6.9, 6.9, 7.3, 6.9, 6.4, 6.5, 6.7, 6.0, 5.8, 5.2, 5.3, 5.2, 5.2, 4.9, 4.9, 4.8, 4.7, 4.8, 4.6, 4.3, 4.0] },
  { label: "Starköl", data: [27.8, 28.4, 29.4, 30.2, 30.1, 30.1, 30.0, 29.7, 29.1, 27.8, 28.5, 28.7, 28.6, 29.7, 30.1, 30.8, 31.1, 31.9, 31.9, 32.5, 31.1, 31.1, 31.8, 31.6] },
  { label: "Öl - totalt", data: [37.2, 37.1, 37.5, 37.1, 37.0, 37.4, 36.9, 36.1, 35.5, 34.5, 34.5, 34.5, 33.8, 35.0, 35.3, 36.0, 36.0, 36.8, 36.7, 37.1, 35.9, 35.7, 36.0, 35.7] }
];

const colorBase = ['rgb(220, 134, 153)',
  'rgb(136, 176, 75)',
  'rgb(60, 125, 144)',
  'rgb(39, 60, 118)',
  'rgb(153, 174, 174)',
  'rgb(254, 231, 21)']
const borderColorBase = ['rgb(220, 134, 153)',
  'rgb(136, 176, 75)',
  'rgb(60, 125, 144)',
  'rgb(39, 60, 118)',
  'rgb(153, 174, 174)',
  'rgb(254, 231, 21)']

const styledDatasets = rawDatasets.map((dataset, index) => ({
  ...dataset,
  backgroundColor: colorBase[index % colorBase.length],
  borderColor: borderColorBase[index % borderColorBase.length],
  borderWidth: 2,
  fill: false,
  tension: 0.3,
  pointRadius: 3,
  pointHoverRadius: 4
}));

const config = {
  type: "line",
  data: {
    labels: labels,
    datasets: styledDatasets
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Liter"
        }
      },
      x: {
        title: {
          display: true,
          text: "År"
        }
      }
    }
  }
};

window.addEventListener("load", () => {
  const ctx3 = document.getElementById("myChart3").getContext("2d");
  new Chart(ctx3, config);
});

// CO₂-utsläpp per förpackning, Systembolaget

const co2Labels = ["Box (3 l)", "Påse (2 l)", "Papp (1 l)", "Returglas (0.5 l)", "Burk (0.375 l)", "PET (0.75 l)", "Lättare glasflaska (0.75 l)", "Glasflaska (0.75 l)", "Tung glasflaska (0.75 l, mousserande)"];
const co2Values = [68, 71, 76, 110, 176, 243, 532, 664, 894];
const backgroundColors = [
  'rgb(220, 134, 153)',
  'rgb(136, 176, 75)',
  'rgb(60, 125, 144)',
  'rgb(39, 60, 118)',
  'rgb(153, 174, 174)',
  'rgb(254, 231, 21)',
  'rgb(255, 111, 97)',
  'rgb(150, 45, 73)',
  'rgb(198, 35, 104)'
];

const ctx4 = document.getElementById('myChart4').getContext('2d');
new Chart(ctx4, {
  type: 'doughnut',
  data: {
    labels: co2Labels,
    datasets: [{
      data: co2Values,
      backgroundColor: backgroundColors,
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true, 
    plugins: {
      title: {
        display: true,
      },
      legend: {
        position: 'right'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} g CO₂/l`;
          }
        }
      }
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('mobile-menu');
  const nav = document.querySelector('.navbar ul');

  toggle.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
});

// === Karta geojson ===

const consumptionData = {
  "Stockholm": 4.4,
  "Uppsala": 3.9,
  "Södermanland": 3.6,
  "Östergötland": 3.9,
  "Jönköping": 3.3,
  "Kronoberg": 3.6,
  "Kalmar": 3.5,
  "Gotland": 4.0,
  "Blekinge": 3.6,
  "Skåne": 3.9,
  "Halland": 3.7,
  "Västra Götaland": 3.9,
  "Värmland": 3.6,
  "Örebro": 3.5,
  "Västmanland": 3.4,
  "Dalarna": 3.4,
  "Gävleborg": 3.5,
  "Västernorrland": 3.5,
  "Jämtland": 3.5,
  "Västerbotten": 3.6,
  "Norrbotten": 3.5
};

fetch('swedish_regions.geojson')
  .then(res => res.json())
  .then(geojson => {
    const locations = Object.keys(consumptionData);
    const zValues = Object.values(consumptionData);

    // Beräknar snittet
    const total = zValues.reduce((sum, val) => sum + val, 0);
    const average = (total / zValues.length).toFixed(2);

    // Hovertext med skillnad från snitt
    const hoverTexts = locations.map(region => {
      const value = consumptionData[region];
      const diff = (value - average).toFixed(2);
      const direction = diff > 0 ? '+' : '';
      return `${region}<br>Konsumtion: ${value} liter<br>Rikssnitt: ${average} liter<br>Skillnad: ${direction}${diff} liter`;
    });

    const data = [{
      type: 'choroplethmapbox',
      geojson: geojson,
      locations: locations,
      z: zValues,
      colorscale: 'YlGnBu',
      colorbar: {
        title: 'Liter per invånare'
      },
      text: hoverTexts,
      hoverinfo: 'text',
      marker: {
        line: {
          width: 0.5,
          color: 'gray'
        }
      },
      featureidkey: 'properties.name'
    }];

    const layout = {
      mapbox: {
        style: 'carto-positron',
        center: { lon: 17, lat: 63 },
        zoom: 3.3
      },
      margin: { t: 0, b: 0, l: 0, r: 0 }
    };

    Plotly.newPlot('map', data, layout, {
      mapboxAccessToken: 'pk.eyJ1IjoibW9ja3Rva2VuIiwiYSI6ImNrd3UzY3gydzA4dGIyb3A0cWQzYmF0N2cifQ.eYxOUUv-QWHM5cHHzGdrMg',
      responsive: true
    });


  })
  .catch(error => {
    console.error('Kunde inte ladda kartan:', error);
    document.getElementById('map').innerText = 'Kartan kunde inte laddas.';
  });



   //Kalkylatorn ==========================================================
   document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("calculate-button");
    if (button) {
      button.addEventListener("click", function (e) {
        e.preventDefault(); // Förhindrar formuläruppdatering
        calculateImpact();
      });
    }
  });
  
  function calculateImpact() {
    const drinks = {
      beer:    { co2: 0.73, label: "öl",     volume: 0.33 }, // 33 cl
      wine:    { co2: 1.52, label: "vin",    volume: 0.15 }, // 15 cl
      spirits: { co2: 2.38, label: "sprit",  volume: 0.04 }  // 4 cl
    };
  
    let totalEmission = 0;
    let summary = [];
  
    for (const type in drinks) {
      const value = parseInt(document.getElementById(type).value);
      if (!isNaN(value) && value > 0) {
        const litres = value * drinks[type].volume * 12; // per år
        const emission = litres * drinks[type].co2;
        totalEmission += emission;
        summary.push(`${value} glas ${drinks[type].label}`);
      }
    }
  
    const result = document.getElementById("result");
  
    if (totalEmission === 0) {
      result.innerHTML = "Vänligen fyll i minst ett dryckesalternativ med ett giltigt antal glas.";
    } else {
      result.innerHTML = `
        Din uppskattade klimatpåverkan från ${summary.join(" och ")} per månad är 
        <strong>${totalEmission.toFixed(1)} kg CO₂e/år</strong>.<br><br>
      `;
    }
  }

  // Karusell ===============================//
const texts = [
  `<h3>Klimatpåverkan per dryck</h3><p>Hallström et al. (2018)...</p>`,
  `<h3>Vem dricker vad – och hur mycket?</h3><p>Guttormsson (2024)...</p>`,
  `<h3>Systembolaget och hållbarhet</h3><p>Systembolaget är inte vinstdrivet...</p>`
];

let currentIndex = 1;

function updateCarousel() {
  const track = document.querySelector('.carousel-track');
  const cards = document.querySelectorAll('.carousel-card');
  const container = document.querySelector('.carousel');
  if (!track || cards.length === 0 || !container) return;

  if (window.innerWidth <= 768) {
    track.style.transform = 'none';
    return;
  }

  const targetCard = cards[currentIndex];
  const containerRect = container.getBoundingClientRect();
  const cardRect = targetCard.getBoundingClientRect();
  const offset = (cardRect.left - containerRect.left) - (containerRect.width / 2 - cardRect.width / 2);

  const currentTransform = track.style.transform || "translateX(0px)";
  const match = currentTransform.match(/translateX\((-?\d+(\.\d+)?)px\)/);
  const currentOffset = match ? parseFloat(match[1]) : 0;

  track.style.transform = `translateX(${currentOffset - offset}px)`;
}

function nextSlide() {
  const cards = document.querySelectorAll('.carousel-card');
  if (currentIndex < cards.length - 1) {
    currentIndex++;
    updateCarousel();
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
}

window.addEventListener('load', updateCarousel);
window.addEventListener('resize', updateCarousel);

const modal = document.getElementById('carousel-modal');
const modalText = document.getElementById('carousel-modal-text');

function openModal(index) {
  modalText.innerHTML = texts[index];
  modal.style.display = 'block';
}

function closeCarouselModal() {
  modal.style.display = 'none';
}

window.addEventListener('click', (e) => {
  if (e.target === modal) closeCarouselModal();
});

window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.openModal = openModal;
window.closeCarouselModal = closeCarouselModal;
