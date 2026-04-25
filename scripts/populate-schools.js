import fs from 'fs';
import path from 'path';

const csvPath = 'nigerian_secondary_schools.csv';
const outputDir = 'src/data/schools';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const data = fs.readFileSync(csvPath, 'utf8');
const lines = data.split('\n');

const schoolsByState = {};

// Skip header
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Simple CSV parser for this specific format
  // Format: State,School Name,Location (sometimes quoted)
  let state, schoolName, location;
  
  const parts = [];
  let currentPart = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(currentPart.trim());
      currentPart = '';
    } else {
      currentPart += char;
    }
  }
  parts.push(currentPart.trim());

  if (parts.length < 3) continue;

  state = parts[0];
  schoolName = parts[1];
  location = parts[2];

  if (!state || !schoolName || !location || 
      state.toLowerCase() === 'unknown' || 
      schoolName.toLowerCase() === 'unknown' || 
      location.toLowerCase() === 'unknown') {
    console.log(`Skipping: ${line}`);
    continue;
  }

  if (!schoolsByState[state]) {
    schoolsByState[state] = [];
  }

  schoolsByState[state].push({
    name: schoolName,
    location: location,
    type: "secondary school", // Default as per existing data
    verified: false // Default
  });
}

for (const state in schoolsByState) {
  const fileName = `${state.toLowerCase().replace(/\s+/g, '_')}.json`;
  fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(schoolsByState[state], null, 2));
}

console.log(`Populated ${Object.keys(schoolsByState).length} state files in ${outputDir}`);
