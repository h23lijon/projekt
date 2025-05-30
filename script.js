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
    '#9FAAE1',
    '#4459C6', 
    '#1C2E7C' 
    ];
    const borderColorBase = [
    '#9FAAE1',
    '#4459C6', 
    '#1C2E7C' 
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
            position: 'top',
            labels: {
              font: {
                size: 16,
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Ton',
              font: {
                size:16,
                weight: 'Bold'
              }
            },
            ticks: {
              font:{
                size:16,
                weight:'bold'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'År',
              font: {
                size:16,
                weight:'Bold'
              }
            },
            ticks: {
              font:{
                size:16,
                weight:'bold'
              }
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
            backgroundColor: 'transparent',
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
              labels:{
                color: '#F0EBE5'
              },
              title: {
                display: true,
                text: 'Konsumtion av vin, öl och sprit (miljoner kr, 2023)',
                color: '#F0EBE5',
                font: {
                  size:16,
                  weight:'Bold'
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Miljoner kronor',
                  color: '#F0EBE5',
                  font: {
                    size: 16,
                    weight:'Bold'
                  }
                },
                ticks: {
                  color: '#F0EBE5',
                  font: {
                    size: 16,
                    weight:'Bold',
                  }
                },
                grid: {
                  color: '#F0EBE5',
                },
              },
              x: {
                ticks: {
                  color: '#F0EBE5',
                  font: {
                    size: 16,
                    weight: 'Bold',
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

window.addEventListener("load", () => {
  const ctx3 = document.getElementById("myChart3").getContext("2d");
  new Chart(ctx3, config);
});

// CO₂-utsläpp per förpackning, Systembolaget

const co2Labels = [
  "Box (3 l)", "Påse (2 l)", "Papp (1 l)", "Returglas (0.5 l)",
  "Burk (0.375 l)", "PET (0.75 l)", "Lättare glasflaska (0.75 l)",
  "Glasflaska (0.75 l)", "Tung glasflaska (0.75 l, mousserande)"
];

const co2Values = [68, 71, 76, 110, 176, 243, 532, 664, 894];

const backgroundColors = [
  '#C3CAE9', '#9FAAE1', '#7C8ADA', '#586AD2',
  '#4459C6', '#3A4EB6', '#3043A6', '#263A99', '#1C2E7C'
];

const ctx4 = document.getElementById('myChart4').getContext('2d');
new Chart(ctx4, {
  type: 'bar',
  data: {
    labels: co2Labels,
    datasets: [{
      label: 'CO₂-utsläpp (g/l)',
      data: co2Values,
      backgroundColor: backgroundColors,
      borderColor: 'transparent',
      borderWidth: 1
    }]
  },
options: {
  responsive: true,
  layout: {
    padding: 0
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#F0EBE5',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      title: {
        display: true,
        text: 'g CO₂ per liter',
        color: '#F0EBE5',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      grid: {
        color:  '#F0EBE5',
      }
    },
    x: {
      ticks: {
        color: '#F0EBE5',
        font: {
          size: 16,
          weight: 'bold'
        },
        maxRotation: 45,
        minRotation: 0
      }
    }
  },
  plugins: {
    title: {
      display: true,
      text: 'CO₂-utsläpp per förpackningstyp',
      color: '#F0EBE5',
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    legend: {
      display: false
    },
    tooltip: {
      titleFont: {
        size: 16,
        weight: 'bold'
      },
      bodyFont: {
        size: 16,
        weight: 'bold'
      },
      callbacks: {
        label: function (context) {
          const value = context.parsed.y;
          return `${value} g CO₂/l`;
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
      zoom: 2.8,
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

// Bubble chart över alkoholkonsumtion och befolkningstäthet i Sverige (2019) ===============================================

const urlPopulation = "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/BE/BE0101/BE0101A/FolkmangdNov";
const urlArea = "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0802/Areal2012NN";

const regionCodeToName = {
  "01": "Stockholm", "03": "Uppsala", "04": "Södermanland", "05": "Östergötland",
  "06": "Jönköping", "07": "Kronoberg", "08": "Kalmar", "09": "Gotland",
  "10": "Blekinge", "12": "Skåne", "13": "Halland", "14": "Västra Götaland",
  "17": "Värmland", "18": "Örebro", "19": "Västmanland", "20": "Dalarna",
  "21": "Gävleborg", "22": "Västernorrland", "23": "Jämtland",
  "24": "Västerbotten", "25": "Norrbotten"
};

const consumptionData2 = {
  "Stockholm": 4.4, "Uppsala": 3.9, "Södermanland": 3.6, "Östergötland": 3.9,
  "Jönköping": 3.3, "Kronoberg": 3.6, "Kalmar": 3.5, "Gotland": 4.0,
  "Blekinge": 3.6, "Skåne": 3.9, "Halland": 3.7, "Västra Götaland": 3.9,
  "Värmland": 3.6, "Örebro": 3.5, "Västmanland": 3.4, "Dalarna": 3.4,
  "Gävleborg": 3.5, "Västernorrland": 3.5, "Jämtland": 3.5,
  "Västerbotten": 3.6, "Norrbotten": 3.5
};

const regionCodes = Object.keys(regionCodeToName);

const querySCB4 = {
  query: [
    { code: "Region", selection: { filter: "vs:RegionLän07", values: regionCodes }},
    { code: "Alder", selection: { filter: "vs:ÅlderTotA", values: ["tot"] }},
    { code: "Kon", selection: { filter: "item", values: ["1", "2"] }},
    { code: "Tid", selection: { filter: "item", values: ["2019"] }}
  ],
  response: { format: "JSON" }
};

const queryArea = {
  query: [
    { code: "Region", selection: { filter: "vs:BRegionLän07N", values: regionCodes }},
    { code: "ArealTyp", selection: { filter: "item", values: ["01"] }},
    { code: "ContentsCode", selection: { filter: "item", values: ["000001O3"] }},
    { code: "Tid", selection: { filter: "item", values: ["2019"] }}
  ],
  response: { format: "JSON" }
};

const gradientColors = [
  '#C3CAE9', '#9FAAE1', '#7C8ADA', '#586AD2',
  '#4459C6', '#3A4EB6', '#3043A6', '#263A99', '#1C2E7C'
];

function getColor(value, min, max) {
  const index = Math.floor((value - min) / (max - min) * (gradientColors.length - 1));
  return gradientColors[Math.max(0, Math.min(index, gradientColors.length - 1))];
}

function fetchAndDrawChart() {
  const popReq = new Request(urlPopulation, {
    method: 'POST',
    body: JSON.stringify(querySCB4)
  });

  const areaReq = new Request(urlArea, {
    method: 'POST',
    body: JSON.stringify(queryArea)
  });

  Promise.all([
    fetch(popReq).then(res => res.json()),
    fetch(areaReq).then(res => res.json())
  ])
  .then(([popData, areaData]) => {
    const populationMap = {};
    const areaMap = {};

    popData.data.forEach(entry => {
      const code = entry.key[0];
      const value = parseInt(entry.values[0].replace(/\s/g, ""), 10);
      if (!populationMap[code]) populationMap[code] = 0;
      populationMap[code] += value;
    });

    areaData.data.forEach(entry => {
      const code = entry.key[0];
      const area = parseFloat(entry.values[0].replace(/\s/g, "").replace(",", "."));
      areaMap[code] = area;
    });

    const dataPoints = [];
    const consumptions = [];

    regionCodes.forEach(code => {
      const name = regionCodeToName[code];
      const pop = populationMap[code];
      const area = areaMap[code];
      const density = pop && area ? pop / area : null;
      const consumption = consumptionData2[name];

      if (pop && area && density && consumption) {
        dataPoints.push({
          x: parseFloat(density.toFixed(1)),
          y: parseFloat(consumption.toFixed(2)),
          r: Math.sqrt(pop) / 100 * 2,
          label: name,
          consumption: consumption
        });
        consumptions.push(consumption);
      }
    });

    const minC = Math.min(...consumptions);
    const maxC = Math.max(...consumptions);

    // Skapa canvas och layout
    const container = document.getElementById("chartContainer");
    container.innerHTML = ""; // Rensa
    container.style.display = "block"; // enbart chart – inget bredvid

    const chartCanvas = document.createElement("canvas");
    chartCanvas.style.width = "100%";
    chartCanvas.style.maxWidth = "100%";
    chartCanvas.style.height = "400px";

    container.appendChild(chartCanvas);

    new Chart(chartCanvas, {
      type: "bubble",
      data: {
      datasets: [{
        label: "Alkoholkonsumtion vs Befolkningstäthet (2019)",
        data: dataPoints,
        backgroundColor: ctx => getColor(ctx.raw.consumption, minC, maxC),
        borderColor: "#fff",
        borderWidth: 1
      }]
      },
      options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
        bottom: 30 // eller mer 
        }
      },
      plugins: {
        tooltip: {
        callbacks: {
          label: context => {
          const dp = context.raw;
          return `${dp.label}: ${dp.y} l/person, ${dp.x} inv/km²`;
          }
        }
        },
        legend: { display: false }
      },
      scales: {
        x: {
        title: { display: true, text: "Invånare per km²", 
          color: '#fff', font: {weight: 'bold'}}, 
          ticks: {color: '#fff', font: {weight: 'bold'}},
        },
        y: {
        title: { 
          display: true, 
          text: "Liter alkohol/person/år",
          color: '#fff',
          font: { weight: 'bold', size: 16 }
        },
        ticks: { color: '#fff' },
        grid: { color: '#fff' },
        min: 3,
        max: 4.6
        }
      }
      }
    });
  })
  .catch(err => {
    console.error("Fel vid hämtning:", err);
    document.getElementById("chartContainer").innerText = "Kunde inte hämta data.";
  });
}

fetchAndDrawChart();


  // Karusell ================================================================================//
let currentIndex = 1;

// Justera karusellens position för desktop
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

// Navigering i karusellen
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

// Initiera karusell
window.addEventListener('load', updateCarousel);
window.addEventListener('resize', updateCarousel);

// Modal för karusell
const modal = document.getElementById('carousel-modal');
const modalText = document.getElementById('carousel-modal-text');

// Läs in innehåll från <template>
document.querySelectorAll('.carousel-card .read-more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.carousel-card');
    const modalId = card.getAttribute('data-modal-id');
    const template = document.getElementById(modalId);
    if (template) {
      modalText.innerHTML = template.innerHTML;
      modal.style.display = 'block';
    }
  });
});

// Stäng modal om användaren klickar utanför
function closeCarouselModal() {
  modal.style.display = 'none';
}

window.addEventListener('click', (e) => {
  if (e.target === modal) closeCarouselModal();
});

// Export till global scope 
window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.closeCarouselModal = closeCarouselModal;

// Modal för diagram 
const chartModal = document.getElementById('chartModal');
const openChartModal = document.getElementById('openModal');
const closeChartModalBtn = chartModal?.querySelector('.close');

if (chartModal && openChartModal && closeChartModalBtn) {
  openChartModal.addEventListener('click', (e) => {
    e.preventDefault();
    chartModal.style.display = 'block';
  });

  closeChartModalBtn.addEventListener('click', () => {
    chartModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === chartModal) {
      chartModal.style.display = 'none';
    }
  });
}

//navbaren vid scroll//

const hero = document.querySelector('.hero-section');
const header = document.querySelector('.site-header');
const logo = document.querySelector('.header-logo');

// Scroll: lägger till 'scrolled' klass och byter logga
window.addEventListener('scroll', () => {
  const heroBottom = hero.getBoundingClientRect().bottom;

  if (heroBottom <= 0) {
    header.classList.add('scrolled');
    header.classList.remove('hover-scrolled'); // ta bort ev. hoverklass
    if (logo) logo.src = 'img/coctail_blå.svg';
  } else {
    header.classList.remove('scrolled');
    if (logo) logo.src = 'img/coctail_vit.svg';
  }
});

// Hover: lägg till 'hover-scrolled' och byt logga till blå
header.addEventListener('mouseenter', () => {
  if (!header.classList.contains('scrolled')) {
    header.classList.add('hover-scrolled');
    if (logo) logo.src = 'img/coctail_blå.svg';
  }
});

// Tar bort hoverklass och byt tillbaka till vit logga om i hero
header.addEventListener('mouseleave', () => {
  header.classList.remove('hover-scrolled');
  const heroBottom = hero.getBoundingClientRect().bottom;
  if (heroBottom > 0 && logo) {
    logo.src = 'img/coctail_vit.svg';
  }
});


// Modal för karusell =====================================================
// Flytta in openModal om man vill ha lokal åtkomst till modalText
window.openModal = function(index) {
  if (!modal || !modalText) return;
  modalText.innerHTML = texts[index];
  modal.style.display = 'block';
};

function showCard2() {
    document.getElementById('card1').classList.add('hidden');
    document.getElementById('card2').classList.remove('hidden');
}

function showCard1() {
    document.getElementById('card2').classList.add('hidden');
    document.getElementById('card1').classList.remove('hidden');
}