async function loadConcerts() {
  try {
    const response = await fetch('js/concerts.json');
    if (!response.ok) throw new Error("Failed to load concerts.json");
    const concerts = await response.json();

    /*const concerts = [
  ]*/

    const today = new Date();
    const future = concerts.filter(c => new Date(c.date) >= today);
    const past = concerts.filter(c => new Date(c.date) < today);

    renderConcerts(future, 'future-concerts', true, false);
    renderConcerts(past, 'past-concerts', false, true);
  } catch (err) {
    console.error("Error loading concerts:", err);
  }
}

function renderConcerts(concerts, containerId, chronological, showYear) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // clear old

  // Sort concerts
  concerts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return chronological ? dateA - dateB : dateB - dateA;
  });

  // Group by year
  const groups = concerts.reduce((acc, concert) => {
    const year = new Date(concert.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(concert);
    return acc;
  }, {});

  /*for (const year of Object.keys(groups).sort((a, b) => chronological ? a - b : b - a)) {
    const header = document.createElement('li');
    header.textContent = year;
    header.classList.add('year-header');
    container.appendChild(header);*/

  if (!chronological) {
    const header = document.createElement('li');
    header.textContent = 'Vergangenes';
    header.classList.add('year-header');
    container.appendChild(header);
  }

  const sortedYears = Object.keys(groups).sort((a, b) => chronological ? a - b : b - a);

  for (const year of sortedYears) {
    if (chronological) {
      const header = document.createElement('li');
      header.textContent = year;
      header.classList.add('year-header');
      container.appendChild(header);
    }

    for (const concert of groups[year]) {
      const li = document.createElement('li');
      const date = new Date(concert.date);
      const formattedDate = formatDate(date, showYear);

      const eventHTML = concert.eventLink
      ? `<a href="${concert.eventLink}" target="_blank">${concert.event}</a>`
      : concert.event;

      const venueHTML = concert.venueLink
        ? `<a href="${concert.venueLink}" target="_blank">${concert.venue}</a>`
        : concert.venue;

      const performerHTML = concert.performer ? `${concert.performer}, ` : '';

      li.innerHTML = `
        <time datetime="${concert.date}">${formattedDate}</time> – 
        ${performerHTML} <i>${eventHTML}</i>, ${venueHTML}, ${concert.place}
        ${concert.flyer ? `<button class="more-btn">mehr</button>` : ''}
      `;

      // If there's a flyer, add a hidden container for it
      if (concert.flyer) {
        const flyerContainer = document.createElement('div');
        flyerContainer.classList.add('flyer-container');
        flyerContainer.style.display = 'none';

        if (concert.flyer.endsWith('.pdf')) {
          flyerContainer.innerHTML = `
            <iframe src="${concert.flyer}" width="100%" height="400px" style="border:none;border-radius:8px;"></iframe>
          `;
        } else {
          flyerContainer.innerHTML = `
            <img src="${concert.flyer}" alt="Flyer for ${concert.event}" style="max-width:100%;border-radius:8px;margin-top:8px;">
          `;
        }

        li.appendChild(flyerContainer);

        // Button toggle
        li.querySelector('.more-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          const visible = flyerContainer.style.display === 'block';
          flyerContainer.style.display = visible ? 'none' : 'block';
          e.target.textContent = visible ? 'mehr' : 'weniger';
        });
      }

      container.appendChild(li);
    }
  }
}

function formatDate(date, includeYear) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return includeYear ? `${d}.${m}.${y}` : `${d}.${m}.`;
}

loadConcerts();
