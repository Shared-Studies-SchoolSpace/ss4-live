export function playerLabel(p) { 
  return `${p.name} (${p.username})`; 
}

export function gameKey(divisionId, round, white, black) { 
  return `${divisionId}_R${round}_${white}_${black}`; 
}

export const extractUsername = (label) => {
  const m = label.match(/\(([^)]+)\)\s*$/);
  return m ? m[1] : '';
};

export const getPlayerDisplay = (label) => {
  const username = extractUsername(label);
  const name = label.split(' (')[0];
  return { name, username };
};
