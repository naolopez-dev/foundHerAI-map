const mapBox = document.getElementById("map");
const key = mapBox.dataset.key;

const bounds = [
  [-125.0, 32.0], 
  [-113.5, 42.5]  
];

const map = new maplibregl.Map({
  container: "map",
  style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${key}`,
  center: [-121.45, 36.35],
  zoom: 6,
  maxBounds: bounds,
  minZoom: 5
});

const form = document.getElementById("form");
const q = document.getElementById("q");
const msg = document.getElementById("msg");

let marker;
let popup;

form.addEventListener("submit", async event => {
  event.preventDefault();
  const text = q.value.trim();

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(text)}`);
    const data = await response.json();

    if (data.error || !data.length) {
      msg.className = "text-warning";
      msg.textContent = "We are still working on adding all city and ZIP code data.";
      return;
    }

    msg.className = "msg";

    const row = data[0];

    if (marker) {
      marker.remove();
    }

    if (popup) {
      popup.remove();
    }

    map.flyTo({
      center: [row.longitude, row.latitude],
      zoom: 10
    });

    marker = new maplibregl.Marker()
      .setLngLat([row.longitude, row.latitude])
      .addTo(map);

    const html = `
      <div>
       <h6>${row.city}, <span class="text-muted">${row.county} County</span></h6>
        <p>Languages spoken</p>
        <ul> ${row.langs.map(lang => `<li>${lang}</li>`).join("")}</ul>
      </div>
    `;

    popup = new maplibregl.Popup({maxWidth: "300px"})
      .setLngLat([row.longitude,row.latitude])
      .setHTML(html)
      .addTo(map);

  } catch (error) {
    console.error(error);
    msg.className = "text-warning";
    msg.textContent = "We are still working on adding all city and ZIP code data.";
  }
});