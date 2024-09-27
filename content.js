chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "checkFlights") {
    const result = checkFlightAvailability(request.airportCodes, request.startDate, request.endDate);
    sendResponse({result: result});
    return true;
  }
});

function checkFlightAvailability(airportCodes, startDate, endDate) {
  let result = '';
  let availableFlightsCount = 0;
  const rows = document.querySelectorAll('table.availabilities tbody tr');
  const headers = document.querySelectorAll('table.availabilities th');
  
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Determine if we're on the return flight page
  const isReturnFlight = window.location.href.includes('direction=2');
  const flightType = isReturnFlight ? 'טיסת חזור' : 'טיסת הלוך';

  result += `<h3>${flightType}</h3>`;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const formattedDate = d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }).replace('.', '/');
    let targetColumnIndex = -1;
    headers.forEach((header, index) => {
      if (header.textContent.trim() === formattedDate) {
        targetColumnIndex = index;
      }
    });

    if (targetColumnIndex === -1) continue;

    airportCodes.forEach(code => {
      code = code.trim().toUpperCase();
      rows.forEach(row => {
        const destinationCell = row.cells[3];
        const originCell = row.cells[2];
        if (destinationCell && originCell) {
          const matchesCode = isReturnFlight 
            ? originCell.textContent.includes(code)
            : destinationCell.textContent.includes(code);
          
          if (matchesCode) {
            const cell = row.cells[targetColumnIndex];
            const amount = cell ? cell.textContent.trim() : '-';
            
            if (amount !== '-' && amount !== '0') {
              availableFlightsCount++;
              const flightNumber = row.cells[1].textContent.trim();
              const origin = originCell.textContent.trim();
              const destination = destinationCell.textContent.trim();
              result += `<p><strong>${flightNumber}: ${origin} ל-${destination}</strong><br>`;
              result += `זמין בתאריך ${formattedDate} (${amount} מושבים)</p>`;
            }
          }
        }
      });
    });
  }
  
  chrome.runtime.sendMessage({action: "updateBadge", count: availableFlightsCount});
  
  return result || `לא נמצאו ${flightType} זמינות בטווח התאריכים שצוין.`;
}

// בדיקת טיסות אוטומטית כאשר הדף נטען
chrome.storage.sync.get(['airportCodes', 'startDate', 'endDate'], function(data) {
  if (data.airportCodes && data.startDate && data.endDate) {
    const result = checkFlightAvailability(data.airportCodes.split('\n'), data.startDate, data.endDate);
    chrome.storage.sync.set({ 'lastResults': result });
  }
});
