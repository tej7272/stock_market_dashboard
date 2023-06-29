// script.js

// Get input elements
const symbolInput = document.getElementById("symbol-input");
const timeframeButtons = document.querySelectorAll(".timeframe-button");
const modal = document.getElementById("modal-container");
const modalBody = document.getElementById("modal-body");

// Watchlist container
const watchlistSection = document.getElementById("watchlist-section");

// Function to handle adding a stock to the watchlist
async function addToWatchlist(symbol, timeframe) {
    // Create a new stock card
    const card = document.createElement("div");
    card.classList.add("stock-card");
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeframe}&symbol=${symbol}&interval=5min&apikey=RFL18APZYPVP69GE`;

    await fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Process the API response
            const stockDataPoints = processData(data);
            card.innerHTML = `  
        
        <div class="symbol">${symbol}</div>
        <div class="card-body">
          <button class="price">${stockDataPoints[0].close}</button>
        </div>
        <div class="timeframe">${timeframe}</div>
        <button class="delete-btn">&#10799;</button>
      `;
        });

    // event listener to the delete button
    card.querySelector('.delete-btn').addEventListener("click", function () {
        modal.style.display = "none";
        card.remove(); // Remove the card from the watchlist
    });

    //event listener to the stock card to show modal
    card.querySelector('.card-body').addEventListener("click", function () {   
            showModal(symbol, timeframe);
    });

    // Add the stock card to the watchlist container
    watchlistSection.appendChild(card);
}

// Event listener for Add button click
const addButton = document.getElementById("add-button");
addButton.addEventListener("click", function () {
    const symbol = symbolInput.value;
    let selectedTimeframe = "";

    // Find the selected timeframe
    timeframeButtons.forEach(function (button) {
        if (button.classList.contains("active")) {
            selectedTimeframe = button.textContent;
            button.style.backgroundColor = 'rgb(172, 166, 166)';
        }
    });

    // Check if symbol and timeframe are entered
    if (symbol !== "" && selectedTimeframe !== "") {
        addToWatchlist(symbol, selectedTimeframe);
        symbolInput.value = ""; // Clear the symbol input
    }
});

// Event listener for timeframe button clicks
var timeframeButton = document.querySelectorAll(".timeframe-button");

timeframeButton.forEach(function (button) {
  button.addEventListener("click", function () {
    // Remove 'active' class from all buttons
    timeframeButton.forEach(function (btn) {
      btn.classList.remove("active");
      btn.style.backgroundColor = ''; // Reset background color of all buttons
    });

    // Add 'active' class to the clicked button
    button.classList.add("active");
    button.style.backgroundColor = 'red';
  });
});


// Function to show modal with stock data
async function showModal(symbol, timeframe) {
   
    // Check if modal is already open
    if (modal.style.display === "block") {
      // Hide the modal and clear the inner HTML
      modal.style.display = "none";
      
      modalBody.innerHTML = "";
      return;
    }
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_${timeframe}&symbol=${symbol}&interval=5min&apikey=RFL18APZYPVP69GE`;

    await fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const stockDataPoints = processData(data);
            // Display modal with stock data
            const modal = document.getElementById("modal-container");
            const modalBody = document.getElementById("modal-body");
            
        
            modalBody.innerHTML = `
            <h2> ${symbol} (${timeframe})</h2> 
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Open</th>
        <th>High</th>
        <th>Low</th>
        <th>Close</th>
        <th>Volume</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  </table>
`; // Clear existing content

// Add each stock data point to the table body
const tableBody = modalBody.querySelector('tbody');
stockDataPoints.forEach(stockData => {
  const tableRow = document.createElement('tr');
  tableRow.innerHTML = `
    
    <td>${stockData.date}</td>
    <td>${stockData.open}</td>
    <td>${stockData.high}</td>
    <td>${stockData.low}</td>
    <td>${stockData.close}</td>
    <td>${stockData.volume}</td>
  `;
  tableBody.appendChild(tableRow);
});


            modal.style.display = "block";
        })
        .catch(function (error) {
            console.log("Error fetching stock data:", error);
        });
      
}
function processData(data) {
  const timeSeriesKey = Object.keys(data)[1]; // Assuming the time series data is stored at the second key
  const timeSeriesData = data[timeSeriesKey];
  const lastRefreshedDates = Object.keys(timeSeriesData);

  const lastFiveDates = lastRefreshedDates.slice(0, 5).reverse(); // Retrieve the most recent five dates and reverse the array

  const stockDataPoints = lastFiveDates.map(date => {
      const stockOpen = Math.floor(timeSeriesData[date]['1. open'] * 100) / 100;
      const stockHigh = Math.floor(timeSeriesData[date]['2. high'] * 100) / 100;
      const stockLow = Math.floor(timeSeriesData[date]['3. low'] * 100) / 100;
      const stockClose = Math.floor(timeSeriesData[date]['4. close'] * 100) / 100;
      const stockVolume = timeSeriesData[date]['5. volume'];

      return {
          date: date,
          open: stockOpen,
          high: stockHigh,
          low: stockLow,
          close: stockClose,
          volume: stockVolume,
      };
  });

  return stockDataPoints;
}

