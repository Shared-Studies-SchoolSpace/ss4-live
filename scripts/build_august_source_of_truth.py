import openpyxl, json, re, uuid, os

wb = openpyxl.load_workbook('/tmp/august_tournament.xlsx', data_only=True)
ws_boardmen = wb['Boardmen']
ws_standings = wb['Standings']
ws_fixtures = wb['Fixtures']
ws_r32 = wb['Round of 32']
ws_r16 = wb['Round of 16']

with open('/tmp/supabase_profiles.json') as f:
    profiles = json.load(f)

def clean(s):
    return re.sub(r'[^a-z0-9]', '', str(s or '').lower())

prof_by_user = {}
prof_by_name = {}
for p in profiles:
    if p.get('chess_username'): prof_by_user[clean(p['chess_username'])] = p
    if p.get('name'): prof_by_name[clean(p['name'])] = p

# Boardmen details
boardmen_dict = {}
for r in range(3, 58):
    name = ws_boardmen.cell(r, 1).value
    if not name: continue
    school = ws_boardmen.cell(r, 2).value or ''
    username = ws_boardmen.cell(r, 3).value or ''
    contact = ws_boardmen.cell(r, 5).value or ''
    u_c = clean(username)
    n_c = clean(name)
    boardmen_dict[u_c] = {'name': name, 'school': school, 'username': username, 'contact': contact}
    boardmen_dict[n_c] = {'name': name, 'school': school, 'username': username, 'contact': contact}

# Qualifiers ratings
qual_ratings = {}
for r in range(78, 113):
    c2 = ws_standings.cell(r, 2).value
    c4 = ws_standings.cell(r, 4).value
    if c2 and c4 and isinstance(c4, (int, float)):
        parts = str(c2).split(',')
        u = clean(parts[1]) if len(parts) > 1 else clean(parts[0])
        qual_ratings[u] = int(c4)

# 1. Build all 56 players
players = []
players_by_clean = {}

curr_group = None
for r in range(5, 75):
    c1 = ws_standings.cell(r, 1).value
    c2 = ws_standings.cell(r, 2).value
    if c1 and 'Group ' in str(c1):
        curr_group = str(c1).replace('Group ', '').strip()
    elif isinstance(c1, (int, float)) and c2:
        parts = str(c2).split(',')
        name = parts[0].strip()
        username_raw = parts[1].replace('@', '').strip() if len(parts) > 1 else name
        u_c = clean(username_raw)
        n_c = clean(name)

        b_info = boardmen_dict.get(u_c) or boardmen_dict.get(n_c) or {}
        prof = prof_by_user.get(u_c) or prof_by_name.get(n_c) or {}

        school = b_info.get('school') or prof.get('university') or ''
        department = prof.get('department') or ''
        contact = b_info.get('contact') or prof.get('phone') or prof.get('whatsapp') or ''

        rating = qual_ratings.get(u_c) or qual_ratings.get(n_c)
        if not rating and prof:
            rating = prof.get('chess_rating')
        if not rating:
            rating = 1200

        p_id = prof.get('id') or str(uuid.uuid5(uuid.NAMESPACE_DNS, f'scl_{u_c}'))

        player_obj = {
            'id': p_id,
            'name': name,
            'username': username_raw,
            'rating': int(rating),
            'school': school,
            'department': department,
            'contact': contact,
            'isProvisional': rating == 1200,
            'group': curr_group,
            'groupRank': int(c1)
        }
        players.append(player_obj)
        players_by_clean[u_c] = player_obj
        players_by_clean[n_c] = player_obj

aliases = {
    'basky09': 'abasiakanmbat',
    'abasiakanmbat': 'basky09',
    'knashi': 'kesenenicholas',
    'kesenenicholas': 'knashi',
    'ninuoluwa1': 'ninuoluwa',
    'ninuoluwa': 'ninuoluwa1',
    'robobobobobobobemma': 'robobobobobobob',
    'chijinduanuchi': 'robobobobobobob',
    'anuchiemmanuel': 'robobobobobobob',
    'mathemachesserthegoat': 'mathemachesserthegoat',
    'princeofpiecex': 'princeofpiecex',
    'ikbeast1': 'ikbeast1',
    'jesse70256': 'jesse70256',
    'edemjessegregory': 'jesse70256',
    'oblivion1416': 'oblivion1416',
    'jameshenshaw': 'oblivion1416',
    'deanbassey001': 'deanbassey001',
    'akogo': 'akogo',
    'akogosimon': 'akogo',
    'davidbarakaii': 'davidbarakaii',
    'david': 'davidbarakaii',
    'martin_th': 'martin_the',
    'victormartinumoren': 'martin_the',
    'georgiejn': 'goeorgiejn',
    'goeorgiejn': 'georgiejn',
    'dannylaw23': 'laworedaniel',
    'laworedaniel': 'dannylaw23',
    'timtimafola': 'timtimafola',
    'dresigngambit': 'dresigngambit',
    'teniola': 'dresigngambit',
    'power101': 'power101',
    'etengeabasiekpe': 'power101',
    'archerlima': 'archerlima',
    'dairojames': 'archerlima',
    'kidd9h': 'kidd9h',
    'robertvictor': 'kidd9h',
    'chilax333': 'chilax333',
    'destinychilaka': 'chilax333',
    'danielrich69': 'danielrich69',
    'danielrichard': 'danielrich69',
    'dminor277': 'dminor277',
    'tomdominion': 'dminor277',
    'yoyo1513': 'yoyo1513',
    'raphaelwisdom': 'yoyo1513',
    'gallfather': 'gallfather',
    'godwinakaiso': 'gallfather',
    'nobbieff': 'nobbieff',
    'jarvis': 'nobbieff',
    'jonzing200': 'jonzing200',
    'jonathanvictor': 'jonzing200',
    'maoutanner': 'isuekevbojoel',
    'isuekevbojoel': 'maoutanner',
    'isuekevbuduehi': 'isuekevbojoel',
    'kenemichael': 'kenemichael',
    'kenechukwumicheal': 'kenemichael',
    'benzene247': 'benzene247',
    'bensonamblessedchinecherem': 'benzene247',
    'shin12': 'shin12',
    'johnstonehenshaw': 'shin12',
    'godhasbachir': 'godhasbachir',
    'adedipetemini': 'godhasbachir',
    'theweehfhi': 'theweehfhi',
    'oyebodesamuel': 'theweehfhi',
    'elijaheao': 'elijaheao',
    'elijahokunoye': 'elijaheao',
    'meeot': 'meeeot',
    'meeeot': 'meeot',
    'ezekielmalasowe': 'meeot',
    'malasoweezekiel': 'meeot'
}

def get_player(key):
    if not key: return None
    k = clean(key)
    if k in players_by_clean: return players_by_clean[k]
    if k in aliases and aliases[k] in players_by_clean: return players_by_clean[aliases[k]]
    for pk, p in players_by_clean.items():
        if k in pk or pk in k: return p
    print('WARNING: could not find player for:', key)
    return None

DRAW_OBJ = {'id': 'draw', 'name': 'Draw', 'username': 'draw', 'school': ''}

def make_game(id, group_label, p1_key, p2_key, winner_key, game_link='', best_of=1, score=None, sub_games=None):
    p1 = get_player(p1_key)
    p2 = get_player(p2_key)
    winner = None
    if winner_key == 'draw':
        winner = DRAW_OBJ
    elif winner_key:
        winner = get_player(winner_key)

    g = {
        'id': id,
        'groupLabel': group_label,
        'p1': p1,
        'p2': p2,
        'white': p1,
        'black': p2,
        'winner': winner,
        'gameLink': game_link or ''
    }
    if best_of > 1:
        g['bestOf'] = best_of
    if score:
        g['score'] = score
    if sub_games:
        g['subGames'] = sub_games
    return g

# 2. Build Groups with Standings
groups_meta = []
for label in 'ABCDEFGHIJKLMN':
    grp_players = [p for p in players if p['group'] == label]
    grp_players.sort(key=lambda x: x['groupRank'])
    avg_rating = round(sum(p['rating'] for p in grp_players) / len(grp_players)) if grp_players else None

    # Standings table for this group from Excel
    standings = []
    # find row in ws_standings
    for r in range(5, 75):
        c1 = ws_standings.cell(r, 1).value
        c2 = ws_standings.cell(r, 2).value
        if c1 and f'Group {label}' == str(c1).strip():
            for offset in range(1, 5):
                row_idx = r + offset
                rank_val = ws_standings.cell(row_idx, 1).value
                p_text = ws_standings.cell(row_idx, 2).value
                mp_val = ws_standings.cell(row_idx, 3).value or 0
                w_val = ws_standings.cell(row_idx, 4).value or 0
                d_val = ws_standings.cell(row_idx, 5).value or 0
                l_val = ws_standings.cell(row_idx, 6).value or 0
                pts_val = ws_standings.cell(row_idx, 7).value or 0
                if p_text:
                    p_obj = get_player(p_text.split(',')[0])
                    standings.append({
                        'rank': int(rank_val or offset),
                        'name': p_obj['name'] if p_obj else p_text.split(',')[0].strip(),
                        'username': p_obj['username'] if p_obj else (p_text.split(',')[1].strip() if ',' in p_text else ''),
                        'mp': int(mp_val),
                        'w': int(w_val),
                        'd': int(d_val),
                        'l': int(l_val),
                        'pts': float(pts_val),
                        'rating': p_obj['rating'] if p_obj else 1200,
                        'school': p_obj['school'] if p_obj else ''
                    })
            break

    groups_meta.append({
        'label': label,
        'players': grp_players,
        'avgRating': avg_rating,
        'standings': standings
    })

# 3. Round 1 Fixtures
r1_games = [
    make_game('GA_R1_G1', 'A', 'Ikbeast1', 'Jude_Ben', 'Ikbeast1'),
    make_game('GA_R1_G2', 'A', 'KN_Ashi', 'Ezege1002', 'KN_Ashi'),
    make_game('GB_R1_G1', 'B', 'danielrich69', 'Yari-bem', 'danielrich69'),
    make_game('GB_R1_G2', 'B', 'deanbassey001', 'kenemichael', 'deanbassey001'),
    make_game('GC_R1_G1', 'C', 'Mathemachesser-THE-GOAT', 'Duke-001', 'Mathemachesser-THE-GOAT'),
    make_game('GC_R1_G2', 'C', 'Danny-1400', 'Unclesam34e', 'Danny-1400'),
    make_game('GD_R1_G1', 'D', 'Ninuoluwa-1', 'Gloria0726', 'Ninuoluwa-1'),
    make_game('GD_R1_G2', 'D', 'Princedoziee', 'victoraugustine', 'victoraugustine'),
    make_game('GE_R1_G1', 'E', 'Davidbarakaii', 'Anonix_01', 'Davidbarakaii'),
    make_game('GE_R1_G2', 'E', 'akogo', 'Lawore_Daniel', 'akogo'),
    make_game('GF_R1_G1', 'F', 'jesse70256', 'kinokita', 'jesse70256'),
    make_game('GF_R1_G2', 'F', 'Kontor001', 'gallfather', 'gallfather'),
    make_game('GG_R1_G1', 'G', 'oblivion1416', 'kingiyanam', 'oblivion1416'),
    make_game('GG_R1_G2', 'G', 'Shazanny-112', 'OtobongBassey', 'OtobongBassey'),
    make_game('GH_R1_G1', 'H', 'basky09', 'robobobobobobob', 'robobobobobobob'),
    make_game('GH_R1_G2', 'H', 'Prince_of_pieceX', 'DMinor277', 'Prince_of_pieceX'),
    make_game('GI_R1_G1', 'I', 'HAKAI_026', 'TimTimAfola', 'HAKAI_026'),
    make_game('GI_R1_G2', 'I', 'joeblaq104', 'Yoyo1513', 'Yoyo1513'),
    make_game('GJ_R1_G1', 'J', 'Isuekevbo Joel', 'Destiny chilaka', 'Isuekevbo Joel'),
    make_game('GJ_R1_G2', 'J', 'Georgie_jn', 'Martin_Th', 'Georgie_jn'),
    make_game('GK_R1_G1', 'K', 'Kidd9h', 'Bayron-sage7', 'Bayron-sage7'),
    make_game('GK_R1_G2', 'K', 'Fulgent47', 'D_Resign_Gambit', 'draw'),
    make_game('GL_R1_G1', 'L', 'Benzene247', 'Archerlima', 'Archerlima'),
    make_game('GL_R1_G2', 'L', 'Power_101', 'Lilshadys', 'Lilshadys'),
    make_game('GM_R1_G1', 'M', 'Elijah_eao', 'TheWeehfhi', 'TheWeehfhi'),
    make_game('GM_R1_G2', 'M', 'Shin_12', 'Godhasbachir', 'Shin_12'),
    make_game('GN_R1_G1', 'N', 'Chikwado Chukwudalu', 'NobbieFF', None),
    make_game('GN_R1_G2', 'N', 'jonzing200', 'Meeot', None),
]

# 4. Round 2 Fixtures
r2_games = [
    make_game('GA_R2_G1', 'A', 'Ikbeast1', 'KN_Ashi', 'Ikbeast1'),
    make_game('GA_R2_G2', 'A', 'Jude_Ben', 'Ezege1002', 'Jude_Ben'),
    make_game('GB_R2_G1', 'B', 'danielrich69', 'deanbassey001', 'deanbassey001'),
    make_game('GB_R2_G2', 'B', 'Yari-bem', 'kenemichael', 'Yari-bem'),
    make_game('GC_R2_G1', 'C', 'Mathemachesser-THE-GOAT', 'Danny-1400', 'Mathemachesser-THE-GOAT'),
    make_game('GC_R2_G2', 'C', 'Duke-001', 'Unclesam34e', 'Unclesam34e'),
    make_game('GD_R2_G1', 'D', 'Ninuoluwa-1', 'Princedoziee', 'Ninuoluwa-1'),
    make_game('GD_R2_G2', 'D', 'Gloria0726', 'victoraugustine', 'victoraugustine'),
    make_game('GE_R2_G1', 'E', 'Davidbarakaii', 'akogo', 'draw'),
    make_game('GE_R2_G2', 'E', 'Anonix_01', 'Lawore_Daniel', 'Anonix_01'),
    make_game('GF_R2_G1', 'F', 'jesse70256', 'Kontor001', 'jesse70256'),
    make_game('GF_R2_G2', 'F', 'kinokita', 'gallfather', 'kinokita'),
    make_game('GG_R2_G1', 'G', 'oblivion1416', 'Shazanny-112', None),
    make_game('GG_R2_G2', 'G', 'kingiyanam', 'OtobongBassey', 'kingiyanam'),
    make_game('GH_R2_G1', 'H', 'basky09', 'Prince_of_pieceX', 'Prince_of_pieceX'),
    make_game('GH_R2_G2', 'H', 'robobobobobobob', 'DMinor277', 'robobobobobobob'),
    make_game('GI_R2_G1', 'I', 'HAKAI_026', 'joeblaq104', 'HAKAI_026'),
    make_game('GI_R2_G2', 'I', 'TimTimAfola', 'Yoyo1513', 'Yoyo1513'),
    make_game('GJ_R2_G1', 'J', 'Isuekevbo Joel', 'Georgie_jn', 'Isuekevbo Joel'),
    make_game('GJ_R2_G2', 'J', 'Destiny chilaka', 'Martin_Th', 'Destiny chilaka'),
    make_game('GK_R2_G1', 'K', 'Kidd9h', 'Fulgent47', 'Fulgent47'),
    make_game('GK_R2_G2', 'K', 'Bayron-sage7', 'D_Resign_Gambit', 'draw'),
    make_game('GL_R2_G1', 'L', 'Benzene247', 'Power_101', None),
    make_game('GL_R2_G2', 'L', 'Archerlima', 'Lilshadys', 'Lilshadys'),
    make_game('GM_R2_G1', 'M', 'Elijah_eao', 'Shin_12', 'Shin_12'),
    make_game('GM_R2_G2', 'M', 'TheWeehfhi', 'Godhasbachir', 'TheWeehfhi'),
    make_game('GN_R2_G1', 'N', 'Chikwado Chukwudalu', 'jonzing200', None),
    make_game('GN_R2_G2', 'N', 'NobbieFF', 'Meeot', None),
]

# 5. Round 3 Fixtures
r3_games = [
    make_game('GA_R3_G1', 'A', 'Ikbeast1', 'Ezege1002', 'Ikbeast1'),
    make_game('GA_R3_G2', 'A', 'Jude_Ben', 'KN_Ashi', 'KN_Ashi'),
    make_game('GB_R3_G1', 'B', 'danielrich69', 'kenemichael', None),
    make_game('GB_R3_G2', 'B', 'Yari-bem', 'deanbassey001', None),
    make_game('GC_R3_G1', 'C', 'Mathemachesser-THE-GOAT', 'Unclesam34e', 'Mathemachesser-THE-GOAT'),
    make_game('GC_R3_G2', 'C', 'Duke-001', 'Danny-1400', 'Danny-1400'),
    make_game('GD_R3_G1', 'D', 'Ninuoluwa-1', 'victoraugustine', 'victoraugustine'),
    make_game('GD_R3_G2', 'D', 'Gloria0726', 'Princedoziee', None),
    make_game('GE_R3_G1', 'E', 'Davidbarakaii', 'Lawore_Daniel', 'Davidbarakaii'),
    make_game('GE_R3_G2', 'E', 'Anonix_01', 'akogo', 'draw'),
    make_game('GF_R3_G1', 'F', 'jesse70256', 'gallfather', None),
    make_game('GF_R3_G2', 'F', 'kinokita', 'Kontor001', 'kinokita'),
    make_game('GG_R3_G1', 'G', 'oblivion1416', 'OtobongBassey', 'oblivion1416'),
    make_game('GG_R3_G2', 'G', 'kingiyanam', 'Shazanny-112', 'kingiyanam'),
    make_game('GH_R3_G1', 'H', 'basky09', 'DMinor277', None),
    make_game('GH_R3_G2', 'H', 'robobobobobobob', 'Prince_of_pieceX', 'robobobobobobob'),
    make_game('GI_R3_G1', 'I', 'HAKAI_026', 'Yoyo1513', None),
    make_game('GI_R3_G2', 'I', 'TimTimAfola', 'joeblaq104', None),
    make_game('GJ_R3_G1', 'J', 'Isuekevbo Joel', 'Martin_Th', None),
    make_game('GJ_R3_G2', 'J', 'Destiny chilaka', 'Georgie_jn', 'Georgie_jn'),
    make_game('GK_R3_G1', 'K', 'Kidd9h', 'D_Resign_Gambit', 'Kidd9h'),
    make_game('GK_R3_G2', 'K', 'Bayron-sage7', 'Fulgent47', None),
    make_game('GL_R3_G1', 'L', 'Benzene247', 'Lilshadys', 'Benzene247'),
    make_game('GL_R3_G2', 'L', 'Archerlima', 'Power_101', 'Archerlima'),
    make_game('GM_R3_G1', 'M', 'Elijah_eao', 'Godhasbachir', None),
    make_game('GM_R3_G2', 'M', 'TheWeehfhi', 'Shin_12', None),
    make_game('GN_R3_G1', 'N', 'Chikwado Chukwudalu', 'Meeot', None),
    make_game('GN_R3_G2', 'N', 'NobbieFF', 'jonzing200', None),
]

# 6. Round 4: Round of 32
r32_games = [
    make_game('R32_G1', None, 'kinokita', 'oblivion1416', 'oblivion1416', 'https://www.chess.com/game/live/173807711734'),
    make_game('R32_G2', None, 'MaouTanner', 'Ninuoluwa-1', 'Ninuoluwa-1', 'https://www.chess.com/game/173794736284'),
    make_game('R32_G3', None, 'Ikbeast1', 'Yari-bem', 'Ikbeast1', 'https://www.chess.com/live/game/173781387180'),
    make_game('R32_G4', None, 'Shin_12', 'Davidbarakaii', 'Davidbarakaii', 'https://www.chess.com/live/game/173792350194'),
    make_game('R32_G5', None, 'jesse70256', 'Yoyo1513', 'jesse70256', 'https://www.chess.com/live/game/173767607974'),
    make_game('R32_G6', None, 'HAKAI_026', 'Unclesam34e', 'Unclesam34e', 'https://www.chess.com/live/game/173781616184'),
    make_game('R32_G7', None, 'Prince_of_pieceX', 'D_Resign_Gambit', 'Prince_of_pieceX', ''),
    make_game('R32_G8', None, 'Mathemachesser-THE-GOAT', 'Anonix_01', 'Mathemachesser-THE-GOAT', ''),
    make_game('R32_G9', None, 'TheWeehfhi', 'Bayron-sage7', 'Bayron-sage7', 'https://www.chess.com/live/game/173807063954'),
    make_game('R32_G10', None, 'akogo', 'gallfather', 'akogo', 'https://www.chess.com/game/live/173764193190'),
    make_game('R32_G11', None, 'robobobobobobob', 'OtobongBassey', 'robobobobobobob', 'https://www.chess.com/live/game/173767607974'),
    make_game('R32_G12', None, 'deanbassey001', 'Lilshadys', 'deanbassey001', 'https://www.chess.com/game/live/173762978618'),
    make_game('R32_G13', None, 'Fulgent47', 'Danny-1400', 'Danny-1400', 'https://www.chess.com/game/173808726784'),
    make_game('R32_G14', None, 'Archerlima', 'kingiyanam', 'kingiyanam', 'https://www.chess.com/live/game/173780612360'),
    make_game('R32_G15', None, 'KN_Ashi', 'danielrich69', 'danielrich69', 'https://www.chess.com/live/game/173808926460'),
    make_game('R32_G16', None, 'victoraugustine', 'Georgie_jn', 'Georgie_jn', 'https://www.chess.com/game/173800770714'),
]

# 7. Round 5: Round of 16
r16_games = [
    make_game('R16_G1', None, 'Ikbeast1', 'danielrich69', 'Ikbeast1', 'https://www.chess.com/live/game/173856110944'),
    make_game('R16_G2', None, 'jesse70256', 'Danny-1400', 'jesse70256', 'https://www.chess.com/live/game/173840802596'),
    make_game('R16_G3', None, 'Ninuoluwa-1', 'Prince_of_pieceX', 'Prince_of_pieceX', 'https://www.chess.com/live/game/173838125894'),
    make_game('R16_G4', None, 'Mathemachesser-THE-GOAT', 'Bayron-sage7', 'Mathemachesser-THE-GOAT', 'https://www.chess.com/live/game/173853108860'),
    make_game('R16_G5', None, 'akogo', 'Unclesam34e', 'akogo', 'https://www.chess.com/game/173876653228'),
    make_game('R16_G6', None, 'robobobobobobob', 'kingiyanam', 'robobobobobobob', 'https://www.chess.com/live/game/173836995098'),
    make_game('R16_G7', None, 'Davidbarakaii', 'deanbassey001', 'deanbassey001', 'https://www.chess.com/game/173853805240'),
    make_game('R16_G8', None, 'Georgie_jn', 'oblivion1416', 'oblivion1416', 'https://www.chess.com/game/live/173849011098'),
]

# 8. Round 6: Quarterfinals (Bo3)
qf_games = [
    make_game(
        'QF_G1', None, 'Ikbeast1', 'jesse70256', 'Ikbeast1',
        game_link='https://www.chess.com/game/live/173904963874',
        best_of=3, score='2 - 1',
        sub_games=[
            {'gameNum': 1, 'white': 'Ikbeast1', 'black': 'jesse70256', 'winner': 'draw', 'gameLink': 'https://www.chess.com/game/live/173904154000'},
            {'gameNum': 2, 'white': 'jesse70256', 'black': 'Ikbeast1', 'winner': 'draw', 'gameLink': 'https://www.chess.com/game/live/173904563648'},
            {'gameNum': 3, 'white': 'Ikbeast1', 'black': 'jesse70256', 'winner': 'Ikbeast1', 'gameLink': 'https://www.chess.com/game/live/173904963874'}
        ]
    ),
    make_game(
        'QF_G2', None, 'Prince_of_pieceX', 'Mathemachesser-THE-GOAT', 'Prince_of_pieceX',
        game_link='https://www.chess.com/game/live/173908988826',
        best_of=3, score='2 - 0',
        sub_games=[
            {'gameNum': 1, 'white': 'Prince_of_pieceX', 'black': 'Mathemachesser-THE-GOAT', 'winner': 'Prince_of_pieceX', 'gameLink': 'https://www.chess.com/game/live/173908988826'},
            {'gameNum': 2, 'white': 'Mathemachesser-THE-GOAT', 'black': 'Prince_of_pieceX', 'winner': 'Prince_of_pieceX', 'gameLink': 'https://www.chess.com/game/live/173909288524'}
        ]
    ),
    make_game(
        'QF_G3', None, 'akogo', 'robobobobobobob', 'robobobobobobob',
        game_link='https://www.chess.com/game/live/173907829832',
        best_of=3, score='0 - 2',
        sub_games=[
            {'gameNum': 1, 'white': 'robobobobobobob', 'black': 'akogo', 'winner': 'robobobobobobob', 'gameLink': 'https://www.chess.com/game/live/173907829832'},
            {'gameNum': 2, 'white': 'akogo', 'black': 'robobobobobobob', 'winner': 'robobobobobobob', 'gameLink': 'https://www.chess.com/game/live/173908066302'}
        ]
    ),
    make_game(
        'QF_G4', None, 'deanbassey001', 'oblivion1416', 'oblivion1416',
        game_link='https://www.chess.com/game/live/173929937248',
        best_of=3, score='0 - 2',
        sub_games=[
            {'gameNum': 1, 'white': 'deanbassey001', 'black': 'oblivion1416', 'winner': 'oblivion1416', 'gameLink': 'https://www.chess.com/game/live/173929937248'},
            {'gameNum': 2, 'white': 'oblivion1416', 'black': 'deanbassey001', 'winner': 'oblivion1416', 'gameLink': 'https://www.chess.com/game/live/173930302830'}
        ]
    )
]

# 9. Round 7: Semifinals (Bo3)
sf_games = [
    make_game(
        'SF_G1', None, 'Ikbeast1', 'Prince_of_pieceX', 'Prince_of_pieceX',
        game_link='https://www.chess.com/game/live/173952982782',
        best_of=3, score='1 - 2',
        sub_games=[
            {'gameNum': 1, 'white': 'Ikbeast1', 'black': 'Prince_of_pieceX', 'winner': 'Ikbeast1', 'gameLink': 'https://www.chess.com/game/live/173952296638'},
            {'gameNum': 2, 'white': 'Prince_of_pieceX', 'black': 'Ikbeast1', 'winner': 'Prince_of_pieceX', 'gameLink': 'https://www.chess.com/game/live/173952733676'},
            {'gameNum': 3, 'white': 'Ikbeast1', 'black': 'Prince_of_pieceX', 'winner': 'Prince_of_pieceX', 'gameLink': 'https://www.chess.com/game/live/173952982782'}
        ]
    ),
    make_game(
        'SF_G2', None, 'oblivion1416', 'robobobobobobob', 'robobobobobobob',
        game_link='https://www.chess.com/game/live/173955220684',
        best_of=3, score='1 - 2',
        sub_games=[
            {'gameNum': 1, 'white': 'oblivion1416', 'black': 'robobobobobobob', 'winner': 'oblivion1416', 'gameLink': 'https://www.chess.com/game/live/173954378320'},
            {'gameNum': 2, 'white': 'robobobobobobob', 'black': 'oblivion1416', 'winner': 'robobobobobobob', 'gameLink': 'https://www.chess.com/game/live/173954827272'},
            {'gameNum': 3, 'white': 'oblivion1416', 'black': 'robobobobobobob', 'winner': 'robobobobobobob', 'gameLink': 'https://www.chess.com/game/live/173955220684'}
        ]
    )
]

# 10. Round 8: Final (Bo3)
final_games = [
    make_game(
        'FINAL_G1', None, 'Prince_of_pieceX', 'robobobobobobob', 'robobobobobobob',
        game_link='https://www.chess.com/game/live/174004974300',
        best_of=3, score='0 - 2',
        sub_games=[
            {'gameNum': 1, 'white': 'Prince_of_pieceX', 'black': 'robobobobobobob', 'winner': 'robobobobobobob', 'gameLink': 'https://www.chess.com/game/live/174004321148'},
            {'gameNum': 2, 'white': 'robobobobobobob', 'black': 'Prince_of_pieceX', 'winner': 'robobobobobobob', 'gameLink': 'https://www.chess.com/game/live/174004974300'}
        ]
    )
]

rounds = [
    {
        'roundNum': 1,
        'name': 'Group Stage — Round 1',
        'date': '2026-08-25',
        'isGroupStage': True,
        'isKnockout': False,
        'games': r1_games
    },
    {
        'roundNum': 2,
        'name': 'Group Stage — Round 2',
        'date': '2026-08-26',
        'isGroupStage': True,
        'isKnockout': False,
        'games': r2_games
    },
    {
        'roundNum': 3,
        'name': 'Group Stage — Round 3',
        'date': '2026-08-27',
        'isGroupStage': True,
        'isKnockout': False,
        'games': r3_games
    },
    {
        'roundNum': 4,
        'name': 'Round of 32',
        'date': '2026-08-29',
        'isGroupStage': False,
        'isKnockout': True,
        'games': r32_games
    },
    {
        'roundNum': 5,
        'name': 'Round of 16',
        'date': '2026-08-31',
        'isGroupStage': False,
        'isKnockout': True,
        'games': r16_games
    },
    {
        'roundNum': 6,
        'name': 'Quarterfinals',
        'date': '2026-09-02',
        'isGroupStage': False,
        'isKnockout': True,
        'games': qf_games
    },
    {
        'roundNum': 7,
        'name': 'Semifinals',
        'date': '2026-09-03',
        'isGroupStage': False,
        'isKnockout': True,
        'games': sf_games
    },
    {
        'roundNum': 8,
        'name': 'Final',
        'date': '2026-09-04',
        'isGroupStage': False,
        'isKnockout': True,
        'games': final_games
    }
]

champ_player = get_player('robobobobobobob')

tournament_data = {
    'id': '2026-08',
    'name': 'August 2026 SCL Tournament',
    'month_year': '2026-08',
    'status': 'completed',
    'winner': 'Anuchi Emmanuel',
    'champion': champ_player,
    'players': players,
    'groups': groups_meta,
    'rounds': rounds,
    'finals_completed_at': '2026-09-04T22:00:00Z',
    'registration_status': 'closed',
    'show_banner': False,
    'auto_close_registration': True
}

output_path = '/home/kami/Desktop/codebase/ss4/src/features/chess-league/data/augustTournamentData.json'
with open(output_path, 'w') as f:
    json.dump(tournament_data, f, indent=2)

print(f"Successfully generated Single Source of Truth at {output_path}!")
print(f"Players: {len(players)}, Groups: {len(groups_meta)}, Rounds: {len(rounds)}")
for r in rounds:
    print(f"  {r['name']}: {len(r['games'])} games")
