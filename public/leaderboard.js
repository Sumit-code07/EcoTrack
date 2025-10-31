// Top 10 people with their annual carbon footprint (kg CO₂)
const people = [
  { name: "Aarav Sharma", footprint: 580 },
  { name: "Diya Patel", footprint: 640 },
  { name: "Rohan Mehta", footprint: 720 },
  { name: "Meera Iyer", footprint: 750 },
  { name: "Kabir Singh", footprint: 830 },
  { name: "Zoya Khan", footprint: 890 },
  { name: "Vikram Das", footprint: 940 },
  { name: "Tara Nair", footprint: 980 },
  { name: "Ishaan Gupta", footprint: 1020 },
  { name: "Nisha Rao", footprint: 1100 },
];

const tbody = document.getElementById("tbody");

// Sort ascending (lower = better)
people.sort((a, b) => a.footprint - b.footprint);

// Render table
people.forEach((p, index) => {
  const tr = document.createElement("tr");

  // Green for low, yellow for mid, red for high footprint
  if (p.footprint <= 700) tr.classList.add("low");
  else if (p.footprint <= 900) tr.classList.add("mid");
  else tr.classList.add("high");

  tr.innerHTML = `
    <td>${index + 1}</td>
    <td>${p.name}</td>
    <td>${p.footprint}</td>
  `;
  tbody.appendChild(tr);
});
