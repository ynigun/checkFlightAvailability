document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(['airportCodes', 'startDate', 'endDate', 'lastResults'], function(data) {
    if (data.airportCodes) {
      document.getElementById('airportCodes').value = data.airportCodes;
    }
    if (data.startDate) {
      document.getElementById('startDate').value = data.startDate;
    } else {
      document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
    }
    if (data.endDate) {
      document.getElementById('endDate').value = data.endDate;
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      document.getElementById('endDate').value = tomorrow.toISOString().split('T')[0];
    }
    if (data.lastResults) {
      document.getElementById('results').innerHTML = data.lastResults;
    }
  });

  document.getElementById('checkFlights').addEventListener('click', checkFlights);
});

function checkFlights() {
  const airportCodes = document.getElementById('airportCodes').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  chrome.storage.sync.set({
    'airportCodes': airportCodes,
    'startDate': startDate,
    'endDate': endDate
  });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const isReturnFlight = tabs[0].url.includes('direction=2');
    const flightType = isReturnFlight ? 'טיסת חזור' : 'טיסת הלוך';
    
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "checkFlights",
      airportCodes: airportCodes.split('\n'),
      startDate: startDate,
      endDate: endDate
    }, function(response) {
      document.getElementById('results').innerHTML = `<h2>${flightType}</h2>` + response.result;
      chrome.storage.sync.set({ 'lastResults': document.getElementById('results').innerHTML });
    });
  });
}