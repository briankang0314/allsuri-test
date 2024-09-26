export function ShowErrorMessage(message, duration = 5000) {
    showMessage(message, duration, '#ff6b6b');
}

export function ShowSuccessMessage(message, duration = 5000) {
    showMessage(message, duration, '#28a745');
}

function showMessage(message, duration, backgroundColor) {
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: ${backgroundColor};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transition: opacity 0.5s ease-in-out;
        text-align: center;
        max-width: 80%;
    `;

    // Create message text
    const messageText = document.createElement('p');
    messageText.style.margin = '0';
    messageText.style.fontSize = '16px';
    messageText.style.lineHeight = '1.4';
    messageText.textContent = message;

    // Append message to container
    messageContainer.appendChild(messageText);

    // Append container to body
    document.body.appendChild(messageContainer);

    // Set a timeout to remove the message
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(messageContainer)) {
                document.body.removeChild(messageContainer);
            }
        }, 500);
    }, duration);
}





export function GetTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Calculate the difference in days

    if (diffDays < 1) {
        return "오늘"; // Return "오늘" if the difference is less than 1 day
    } else if (diffDays >= 1 && diffDays < 2) {
        return "어제"; // Return "어제" if the difference is between 1 and 2 days
    } else {
        return `${Math.ceil(diffDays)}일 전`; // Return the difference in days if 2 or more days
    }
}

export function PopulateRegions() {
    const regionSelect = document.getElementById('region');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.id;
        option.textContent = region.name;
        regionSelect.appendChild(option);
    });
}

export function PopulateCities(regionId) {
    const citySelect = document.getElementById('city');
    citySelect.innerHTML = '<option value="">도시 선택</option>';
    
    if (regionId == 9) {  // Sejong
        const option = document.createElement('option');
        option.value = '세종시';
        option.textContent = '세종시';
        citySelect.appendChild(option);
        citySelect.disabled = true;  // Disable selection as there's only one option
    } else {
        cities[regionId].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;  // Enable selection for other regions
    }
}

export function GetStatusText(status) {
    switch (status) {
        case 'pending': return '대기중';
        case 'accepted': return '수락됨';
        case 'rejected': return '거절됨';
        default: return '알 수 없음';
    }
}

export function GetStatusClass(status) {
    switch (status) {
        case 'pending': return 'bg-secondary';
        case 'accepted': return 'bg-success';
        case 'rejected': return 'bg-danger';
        default: return 'bg-secondary';
    }
}