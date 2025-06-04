// Förpackningar, SCB
const urlSCB1 = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/START/MI/MI0307/MI0307T2N';

const querySCB1 = {
  query: [
    {
      code: "Forpackning",
      selection: {
        filter: "item",
        values: ["10", "35", "65"]
      }
    },
    {
      code: "ContentsCode",
      selection: {
        filter: "item",
        values: ["0000047A"]
      }
    }
  ],
  response: {
    format: "JSON"
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
    const uniqueYears = [...new Set(data.data.map(item => item.key[1]))].sort();

    const colorBase = ['#4459C6', '#1C2E7C', '#9FAAE1'];
    const borderColorBase = ['#4459C6', '#1C2E7C', '#9FAAE1'];

    const datasets = uniquePackages.map((pkg, index) => ({
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
    }));

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
                size: 14
              },
              padding: 20
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
                size: 14
              }
            },
            ticks: {
              font: {
                size: 14
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'År',
              font: {
                size: 14
              }
            },
            ticks: {
              font: {
                size: 14
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


//Vad köper vi mest, myChart2 ================================================================//

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
  '02.1.1': 'Sprit',
  '02.1.2': 'Vin',
  '02.1.3': 'Öl'
};

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
          'Sprit': spritImg,
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
                  size:14,
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
                    size: 14,
                  }
                },
                ticks: {
                  color: '#F0EBE5',
                  font: {
                    size: 14,
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
                    size: 14,
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
            size: 14,
          }
        },
        title: {
          display: true,
          text: 'g CO₂ per liter',
          color: '#F0EBE5',
          font: {
            size: 14,
          }
        },
        grid: {
          color: '#F0EBE5',
        }
      },
      x: {
        ticks: {
          color: '#F0EBE5',
          font: {
            size: function(context) {
              const width = context.chart.width;
              if (width < 400) return 8;
              else if (width < 600) return 10;
              else return 14;
            }
          },
          maxRotation: 90,
          minRotation: 45,
          autoSkip: false
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'CO₂-utsläpp per förpackningstyp',
        color: '#F0EBE5',
        font: {
          size: 14,
        }
      },
      legend: {
        display: false
      },
      tooltip: {
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
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
  .then(res => {
    if (!res.ok) throw new Error('GeoJSON kunde inte hämtas');
    return res.json();
  })
  .then(geojson => {
    const locations = Object.keys(consumptionData);
    const zValues = Object.values(consumptionData);

    const total = zValues.reduce((sum, val) => sum + val, 0);
    const average = (total / zValues.length).toFixed(2);

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
      colorscale: [
  [0, '#C3CAE9'], 
  [1, '#1C2E7C']  
],
      colorbar: { title: 'Liter per invånare' },
      text: hoverTexts,
      hoverinfo: 'text',
      marker: { line: { width: 0.5, color: 'gray' } },
      featureidkey: 'properties.name'
    }];

    const isMobile = window.innerWidth < 600;
    const layout = {
      mapbox: {
        style: 'carto-positron',
        center: { lon: 17, lat: 63 },
        zoom: isMobile ? 2.2 : 2.8
      },
      margin: { t: 0, b: 0, l: 0, r: 0 }
    };

    Plotly.newPlot('map', data, layout, {
      mapboxAccessToken: 'pk.eyJ1IjoibW9ja3Rva2VuIiwiYSI6ImNrd3UzY3gydzA4dGIyb3A0cWQzYmF0N2cifQ.eYxOUUv-QWHM5cHHzGdrMg',
      responsive: true
    });
  })

  .catch(error => {
    console.error('Kartan kunde inte laddas:', error);
    document.getElementById('map').innerText = 'Kartan kunde inte laddas.';
  });


   //==================================kalkylatorn ===========
document.getElementById('calculate-button').addEventListener('click', function(e) {
  e.preventDefault();

  const beer = parseInt(document.getElementById('beer').value) || 0;
  const wine = parseInt(document.getElementById('wine').value) || 0;
  const spirits = parseInt(document.getElementById('spirits').value) || 0;

  const totalCO2 = beer * 176 + wine * 664 + spirits * 894; 
  const avgSwedeCO2 = 10000;

  const resultBox = document.getElementById('result');
  const errorMessage = document.getElementById('error-message');

  resultBox.classList.add('hidden');
  errorMessage.classList.add('hidden');
  errorMessage.textContent = "";

  if (beer === 0 && wine === 0 && spirits === 0) {
    errorMessage.textContent = "Fyll i minst ett dryckesalternativ för att se uträkningen";
    errorMessage.classList.remove('hidden');
    return;
  }

  const beerAlcohol = beer * 0.0165 * 12;     
  const wineAlcohol = wine * 0.018 * 12;     
  const spiritsAlcohol = spirits * 0.016 * 12; 

  const totalAlcoholLiters = beerAlcohol + wineAlcohol + spiritsAlcohol;
  const avgSwedeAlcohol = 3.66;

let message = "";
if (totalCO2 < avgSwedeCO2) {
  message += "<strong class='result-heading'>🌱 Härligt! Du bidrar till mindre utsläpp än genomsnittet</strong>";
  resultBox.style.backgroundColor = "rgba(39, 60, 118, 0.7)";
} else {
  message += "<strong class='result-heading'>⚡ Ooops! Du bidrar till mer utsläpp än genomsnittet.</strong>";
  resultBox.style.backgroundColor = "rgba(39, 60, 118, 0.7)";
}

if (totalAlcoholLiters < avgSwedeAlcohol) {
  message += "<div class='result-subtext'>Du konsumerar mindre ren alkohol per år än genomsnittet i Sverige. Din klimatpåverkan vad gäller alkoholkonsumtion är låg – och det skålar vi för (med måtta)! 🥂</div>";
} else {
  message += "<div class='result-subtext'>Det kanske blivit ett par glas för mycket – för både dig och klimatet 😅 Men små förändringar gör stor skillnad. Nästa steg? Testa alkoholfritt nästa gång!</div>";
}

resultBox.innerHTML = message;
  resultBox.classList.remove('hidden');
});

// Bubble chart: alkoholkonsumtion vs befolkningstäthet (SCB + CAN)

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

// ======== Modal: öppna/stäng funktioner ======== //

function openBubbleModal() {
  document.getElementById("bubbleModalWrapper").style.display = "block";
  drawBubbleChart();
}

function closeBubbleModal() {
  document.getElementById("bubbleModalWrapper").style.display = "none";
}

window.addEventListener('click', function (e) {
  const modal = document.getElementById("bubbleModalWrapper");
  if (e.target === modal) closeBubbleModal();
});

// ======== Rita Bubble Chart i modalen ======== //

function drawBubbleChart() {
  fetch(urlPopulation, {
    method: "POST",
    body: JSON.stringify(querySCB4)
  })
  .then(res => res.json())
  .then(popData => {
    return fetch(urlArea, {
      method: "POST",
      body: JSON.stringify(queryArea)
    }).then(areaRes => areaRes.json()).then(areaData => {
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

      let baseRadius;
      if (window.innerWidth < 500) {
        baseRadius = 1;
      } else if (window.innerWidth < 768) {
        baseRadius = 1;
      } else {
        baseRadius = 2;
      }

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
            r: Math.sqrt(pop) / 100 * baseRadius,
            label: name,
            consumption: consumption
          });
          consumptions.push(consumption);
        }
      });

      const minC = Math.min(...consumptions);
      const maxC = Math.max(...consumptions);

      const ctx = document.getElementById("bubbleChartCanvas").getContext("2d");

      if (window.bubbleChartInstance) {
        window.bubbleChartInstance.destroy();
      }

      window.bubbleChartInstance = new Chart(ctx, {
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
          layout: { padding: { bottom: 30 } },
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
              title: {
                display: true,
                text: "Invånare per km²",
                color: '#000',
                font: { size:'14' }
              },
              ticks: { color: '#000' }
            },
            y: {
              title: {
                display: true,
                text: "Liter alkohol/person/år",
                color: '#000',
                font: { size: 14 }
              },
              ticks: { color: '#000' },
              grid: { color: '#ddd' },
              min: 3,
              max: 4.8
            }
          }
        }
      });
    });
  })
  .catch(err => {
    console.error("Fel vid hämtning:", err);
    document.getElementById("bubbleChartCanvas").parentElement.innerHTML = "Kunde inte hämta data.";
  });
}


  // Karusell ================================================================================//
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

function closeCarouselModal() {
  modal.style.display = 'none';
}

window.addEventListener('click', (e) => {
  if (e.target === modal) closeCarouselModal();
});

window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.closeCarouselModal = closeCarouselModal;

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


const hero = document.querySelector('.hero-section');
const header = document.querySelector('.site-header');
const logo = document.querySelector('.header-logo');

window.addEventListener('scroll', () => {
  const heroBottom = hero.getBoundingClientRect().bottom;

  if (heroBottom <= 0) {
    header.classList.add('scrolled');
    header.classList.remove('hover-scrolled'); 
    if (logo) logo.src = 'img/coctail_blå.svg';
  } else {
    header.classList.remove('scrolled');
    if (logo) logo.src = 'img/coctail_vit.svg';
  }
});

header.addEventListener('mouseenter', () => {
  if (!header.classList.contains('scrolled')) {
    header.classList.add('hover-scrolled');
    if (logo) logo.src = 'img/coctail_blå.svg';
  }
});


header.addEventListener('mouseleave', () => {
  header.classList.remove('hover-scrolled');
  const heroBottom = hero.getBoundingClientRect().bottom;
  if (heroBottom > 0 && logo) {
    logo.src = 'img/coctail_vit.svg';
  }
});


// Modal för karusell ===================================================== //
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