// Mobile Menu Toggle
const mobileMenu = document.getElementById('mobile-menu');
const nav = document.querySelector('nav');

if (mobileMenu && nav) {
  mobileMenu.addEventListener('click', () => {
    nav.classList.toggle('active');
    mobileMenu.classList.toggle('is-active');
  });
}


// Check if we are on the Apartments List Page
if (document.getElementById('filterForm')) {
  // Code for Apartments List Page

  // Initialize filterData
  let filterData = {};

  // Function to populate dropdown lists
  function populateDropdowns() {
    // City Dropdown
    const citySelect = document.getElementById('city');
    populateSelect(citySelect, filterData.cities, 'City');

    // Area Dropdown
    const areaSelect = document.getElementById('area');
    const areas = [...new Set(filterData.apartments.map(a => a.area))].sort((a, b) => a - b);
    populateSelect(areaSelect, areas, 'Area');

    // Number of Rooms Dropdown
    const roomsSelect = document.getElementById('numberOfRooms');
    const rooms = [...new Set(filterData.apartments.map(a => a.numberOfRooms))].sort((a, b) => a - b);
    populateSelect(roomsSelect, rooms, 'Number of Rooms');

    // Floor Dropdown
    const floorSelect = document.getElementById('floor');
    const floors = [...new Set(filterData.apartments.map(a => a.floor))].sort((a, b) => a - b);
    populateSelect(floorSelect, floors, 'Floor');

    // Total Floors Dropdown
    const totalFloorsSelect = document.getElementById('totalFloors');
    const totalFloors = [...new Set(filterData.apartments.map(a => a.totalFloors))].sort((a, b) => a - b);
    populateSelect(totalFloorsSelect, totalFloors, 'Total Floors');
  }

  // Helper function to populate a select element
  function populateSelect(selectElement, optionsArray, placeholder) {
    // Clear existing options
    selectElement.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Any ${placeholder}`;
    selectElement.appendChild(defaultOption);

    optionsArray.forEach(optionValue => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      selectElement.appendChild(option);
    });
  }

  // Fetch data from the API and initialize the page
  function initializePage() {
    fetch('https://q11.jvmhost.net/api/archicorp/filters')
      .then(response => response.json())
      .then(data => {
        filterData = data;
        // Ensure apartments data is available
        if (!filterData.apartments) {
          console.error('No apartments data found in the response.');
          return;
        }
        populateDropdowns();
        displayResults(filterData.apartments);
      })
      .catch(error => {
        console.error('Error fetching data from API:', error);
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '<p>Error loading apartments. Please try again later.</p>';
      });
  }

  // Call initializePage on load
  initializePage();

  // Event listener for form submission
  document.getElementById('filterForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get filter values
    const city = document.getElementById('city').value;
    const area = document.getElementById('area').value;
    const numberOfRooms = document.getElementById('numberOfRooms').value;
    const floor = document.getElementById('floor').value;
    const totalFloors = document.getElementById('totalFloors').value;
    const hasBalcony = document.getElementById('hasBalcony').checked;
    const hasParking = document.getElementById('hasParking').checked;

    // Filter the apartments based on selected values
    let filteredApartments = filterData.apartments;

    if (city) {
      filteredApartments = filteredApartments.filter(a => a.city === city);
    }
    if (area) {
      filteredApartments = filteredApartments.filter(a => a.area == area);
    }
    if (numberOfRooms) {
      filteredApartments = filteredApartments.filter(a => a.numberOfRooms == numberOfRooms);
    }
    if (floor) {
      filteredApartments = filteredApartments.filter(a => a.floor == floor);
    }
    if (totalFloors) {
      filteredApartments = filteredApartments.filter(a => a.totalFloors == totalFloors);
    }
    if (hasBalcony) {
      filteredApartments = filteredApartments.filter(a => a.hasBalcony);
    }
    if (hasParking) {
      filteredApartments = filteredApartments.filter(a => a.hasParking);
    }

    // Display the filtered apartments
    displayResults(filteredApartments);
  });

  // Function to display the apartments
  function displayResults(apartments) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    if (!apartments || apartments.length === 0) {
      resultsDiv.innerHTML = '<p>No apartments found matching your criteria.</p>';
      return;
    }

    apartments.forEach(apartment => {
      const card = document.createElement('div');
      card.classList.add('apartment-card');

      card.innerHTML = `
        <img src="${apartment.images && apartment.images[0] ? apartment.images[0] : 'placeholder.jpg'}" alt="${apartment.title}">
        <div class="card-content">
          <h3>${apartment.title}</h3>
          <p><strong>City:</strong> ${apartment.city}</p>
          <p><strong>Area:</strong> ${apartment.area} m²</p>
          <p><strong>Rooms:</strong> ${apartment.numberOfRooms}</p>
          <p><strong>Floor:</strong> ${apartment.floor} / ${apartment.totalFloors}</p>
          <p><strong>Year Built:</strong> ${apartment.yearBuilt}</p>
          <p class="price">${apartment.price ? apartment.price.toLocaleString() + ' PLN' : 'Price on request'}</p>
        </div>
        <div class="card-actions">
          <a href="apartment-details.html?id=${apartment.id}">View Details</a>
        </div>
      `;

      resultsDiv.appendChild(card);
    });
  }

  // Handle the reset button to display all apartments
  document.getElementById('filterForm').addEventListener('reset', function (e) {
    e.preventDefault(); // Prevent the form from resetting immediately

    // Reset all select elements to default
    document.querySelectorAll('#filterForm select').forEach(select => {
      select.selectedIndex = 0;
    });

    // Uncheck all checkboxes
    document.querySelectorAll('#filterForm input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    // Display all apartments after resetting filters
    displayResults(filterData.apartments);
  });
}

// Check if we are on the Apartment Details Page
if (document.querySelector('.apartment-details-container')) {
  // Code for Apartment Details Page

  // Function to change the main image when a thumbnail is clicked
  function changeImage(element) {
    const mainImage = document.getElementById('currentImage');
    mainImage.src = element.src;
  }

  // Get apartment ID from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get('id');

  if (apartmentId) {
    // Fetch apartment details from your API
    fetch(`https://q11.jvmhost.net/api/archicorp/apartment/${apartmentId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(apartment => {
        // Update the main image
        const mainImage = document.getElementById('currentImage');
        mainImage.src = apartment.images && apartment.images[0] ? apartment.images[0] : 'placeholder.jpg';

        // Update thumbnails
        const thumbnailsContainer = document.querySelector('.thumbnail-images');
        thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

        if (apartment.images && apartment.images.length > 0) {
          apartment.images.forEach(imageUrl => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = apartment.title;
            img.onclick = function () { changeImage(this); };
            thumbnailsContainer.appendChild(img);
          });
        } else {
          // If no images are available, you can hide the thumbnails container or show a message
          thumbnailsContainer.style.display = 'none';
        }

        // Update apartment information
        document.getElementById('apartmentTitle').textContent = apartment.title || 'No title available';
        document.getElementById('apartmentPrice').textContent = `Price: ${apartment.price ? apartment.price.toLocaleString() + ' PLN' : 'Price on request'}`;
        document.getElementById('apartmentAddress').textContent = `${apartment.address || ''}, ${apartment.city || ''}, ${apartment.country || ''}`;
        document.getElementById('apartmentDescription').textContent = apartment.description || 'No description available.';

        // Update details list
        const detailsList = document.getElementById('detailsList');
        detailsList.innerHTML = `
          <li><strong>Area:</strong> ${apartment.area || 'N/A'} m²</li>
          <li><strong>Number of Rooms:</strong> ${apartment.numberOfRooms || 'N/A'}</li>
          <li><strong>Floor:</strong> ${apartment.floor !== undefined ? apartment.floor : 'N/A'} / ${apartment.totalFloors || 'N/A'}</li>
          <li><strong>Year Built:</strong> ${apartment.yearBuilt || 'N/A'}</li>
          <li><strong>Heating Type:</strong> ${apartment.heatingType || 'N/A'}</li>
          <li><strong>Has Balcony:</strong> ${apartment.hasBalcony ? 'Yes' : 'No'}</li>
          <li><strong>Has Parking:</strong> ${apartment.hasParking ? 'Yes' : 'No'}</li>
          <li><strong>Furnished:</strong> ${apartment.isFurnished ? 'Yes' : 'No'}</li>
        `;
      })
      .catch(error => {
        console.error('Error fetching apartment details:', error);
        // Display an error message to the user
        const container = document.querySelector('.apartment-details-container');
        container.innerHTML = '<p>Error loading apartment details. Please try again later.</p>';
      });
  } else {
    // Handle the case where no apartment ID is provided
    console.error('No apartment ID provided in URL.');
    const container = document.querySelector('.apartment-details-container');
    container.innerHTML = '<p>No apartment ID provided. Please select an apartment from the listings page.</p>';
  }
}
