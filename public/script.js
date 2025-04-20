document.getElementById('flood-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const location = document.getElementById('flood-location').value.trim();
    const floodResultDiv = document.getElementById('flood-result');
    floodResultDiv.textContent = 'Checking flood data...';

    fetch(`http://localhost:3000/check-flood?location=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
            if (data.isFlooded) {
                floodResultDiv.textContent = 'Warning: Water logging detected in your area!';
            } else {
                floodResultDiv.textContent = 'No water logging detected.';
            }
        })
        .catch(error => {
            floodResultDiv.textContent = 'Error checking flood data.';
            // floodResultDiv.textContent = 'Warning: Water logging detected in your area! Email sent to the authorities.';
            console.error('Error:', error);
        });
});

document.getElementById('earthquake-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const location = document.getElementById('earthquake-location').value.trim();
    const earthquakeResultDiv = document.getElementById('earthquake-result');
    earthquakeResultDiv.textContent = 'Checking earthquake data...';

    fetch(`http://localhost:3000/check-earthquake?location=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
            if (data.isEarthquake) {
                earthquakeResultDiv.textContent = `Warning: Earthquake detected near ${data.location} with magnitude ${data.magnitude}.`;
            } else {
                earthquakeResultDiv.textContent = 'No significant earthquake activity detected.';
            }
        })
        .catch(error => {
            earthquakeResultDiv.textContent = 'Error checking earthquake data.';
            console.error('Error:', error);
        });
});



// Hurricane alert handler
document.getElementById('hurricane-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const location = document.getElementById('hurricane-location').value.trim();
    const hurricaneResultDiv = document.getElementById('hurricane-result');
    hurricaneResultDiv.textContent = 'Checking hurricane data...';

    fetch(`http://localhost:3000/check-hurricane?location=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
            if (data.isHurricane) {
                hurricaneResultDiv.textContent = `Warning: Hurricane detected near ${data.location}. Please take precautions!`;
            } else {
                hurricaneResultDiv.textContent = 'No hurricane activity detected in your area.';
            }
        })
        .catch(error => {
            hurricaneResultDiv.textContent = 'Error checking hurricane data.';
            console.error('Error:', error);
        });
});



// Drought event handler

document.getElementById('drought-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const location = document.getElementById('drought-location').value.trim();
    const droughtResultDiv = document.getElementById('drought-result');
    droughtResultDiv.textContent = 'Checking drought data...';

    fetch(`http://localhost:3000/check-drought?location=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
            if (data.isDrought) {
                droughtResultDiv.textContent = `Warning: Drought detected in ${location}. Low rainfall and high temperatures recorded.`;
            } else {
                droughtResultDiv.textContent = 'No drought conditions detected.';
            }
        })
        .catch(error => {
            droughtResultDiv.textContent = 'Error checking drought data.';
            console.error('Error:', error);
        });
});