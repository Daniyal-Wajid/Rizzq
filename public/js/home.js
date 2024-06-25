let carouselIndex = 0;
const carouselCards = document.querySelectorAll('.Carousel-card');
const maxIndex = carouselCards.length - 1;

function moveSlide(direction) {
  carouselIndex += direction;

  // Loop back to the start/end if index goes out of bounds
  if (carouselIndex > maxIndex) {
    carouselIndex = 0;
  } else if (carouselIndex < 0) {
    carouselIndex = maxIndex;
  }

  const cardWidth = carouselCards[0].offsetWidth;
  const carousel = document.querySelector('.carousel');
  carousel.style.transform = `translateX(-${carouselIndex * cardWidth}px)`;
}

// Initialize the transform property
const cardWidth = carouselCards[0].offsetWidth;
const carousel = document.querySelector('.carousel');
carousel.style.width = `${cardWidth * carouselCards.length}px`;

// Optional: Initialize the slide position
moveSlide(0);

// Existing code
const textField = document.getElementById('search-field');

textField.addEventListener('click', function() {
  this.style.width = '500px';
});

const jobSets = [
  ['Teacher', 'Lawyer', 'Nurse', 'Programmer', 'Scientist', 'Writer', 'Surgeon', 'Physician','Pilot', 'Plumber', 'Mechanic', 'Hairdresser', 'florist', 'Chef', 'Dentist', 'Accountant'],
  ['Professor', 'Psychiatrist', 'Developer', 'Pharmacist', 'Neurologist', 'Lecturer', 'Musician', 'Singer','Director', 'Journalist', 'Anchor', 'Actor', 'Architect', 'Electrician', 'Manager', 'Security']
];

let currentSetIndex = 0;

function updateJobs() {
  const jobNames = jobSets[currentSetIndex];
  document.querySelectorAll('.job').forEach((job, index) => {
    job.textContent = jobNames[index];
  });
}

document.getElementById('left-arrow').addEventListener('click', function() {
  currentSetIndex = (currentSetIndex - 1 + jobSets.length) % jobSets.length;
  updateJobs();
});

document.getElementById('right-arrow').addEventListener('click', function() {
  currentSetIndex = (currentSetIndex + 1) % jobSets.length;
  updateJobs();
});

updateJobs();

document.addEventListener('DOMContentLoaded', function() {
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');
  const jobData = {
    'by-industry': [
        'Information Technology (785)',
        'Recruitment/Employment Firms (213)',
        'Call Center (203)',
        'Banking/Financial Services (140)',
        'N.G.O./Social Services (111)',
        'Real Estate/Property (108)',
        'E-Commerce / E-Business (83)',
        'Healthcare/Hospital/Medical (75)',
        'Construction / Cement / Metals (70)',
        'Engineering (54)',
        'More Industries'
    ],
    'by-city': [
        'Karachi (1000)',
        'Lahore (800)',
        'Islamabad (600)',
        'Rawalpindi (500)',
        'Faisalabad (400)',
        'Peshawar (300)',
        'Multan (250)',
        'Quetta (200)',
        'Sialkot (150)',
        'Hyderabad (100)',
        'More Cities'
    ],
    'by-company': [
        'Company A (300)',
        'Company B (250)',
        'Company C (200)',
        'Company D (150)',
        'Company E (100)',
        'Company F (90)',
        'Company G (80)',
        'Company H (70)',
        'Company I (60)',
        'Company J (50)',
        'More Companies'
    ],
    'by-function': [
        'Software Development (400)',
        'Sales (350)',
        'Marketing (300)',
        'Customer Support (250)',
        'Finance (200)',
        'Human Resources (150)',
        'Operations (100)',
        'Administration (90)',
        'Logistics (80)',
        'Production (70)',
        'More Functions'
    ]
  };

  function updateJobList(category) {
    const jobListElement = document.querySelector(`#${category} .job-list`);
    jobListElement.innerHTML = '';
    jobData[category].forEach(job => {
      const li = document.createElement('li');
      li.textContent = job;
      jobListElement.appendChild(li);
    });
  }

  tabLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();

      tabLinks.forEach(link => link.classList.remove('active'));

      this.classList.add('active');

      tabContents.forEach(content => content.classList.remove('active'));

      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');

      updateJobList(tabId);
    });
  });

  updateJobList('by-industry');
});

document.getElementById('loginLink').addEventListener('click', function(event) {
  event.preventDefault();
  window.location.href = '/login';
});
