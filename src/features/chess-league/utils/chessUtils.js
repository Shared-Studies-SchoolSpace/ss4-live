export function playerLabel(p) { 
  return `${p.name} (${p.username})`; 
}

export function gameKey(divisionId, round, white, black) { 
  return `${divisionId}_R${round}_${white}_${black}`; 
}

export const extractUsername = (label) => {
  if (typeof label !== 'string') return '';
  const m = label.match(/\(([^)]+)\)\s*$/);
  return m ? m[1] : '';
};

export const getPlayerDisplay = (label) => {
  if (typeof label === 'object' && label !== null) {
    return { name: label.name || '', username: label.username || '' };
  }
  if (typeof label !== 'string') return { name: '', username: '' };
  const username = extractUsername(label);
  const name = label.split(' (')[0];
  return { name, username };
};
