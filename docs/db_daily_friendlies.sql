-- Daily Friendly Tournaments Schema Setup
-- Run this in your Supabase SQL Editor to track daily friendly tournament scores.

CREATE TABLE IF NOT EXISTS public.daily_friendlies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_date DATE NOT NULL,
  player_username TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  performance INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.daily_friendlies ENABLE ROW LEVEL SECURITY;

-- Select Policy (Accessible to everyone)
CREATE POLICY "Daily friendlies are viewable by everyone" ON public.daily_friendlies
  FOR SELECT USING (true);

-- Admin Modify Policy
CREATE POLICY "Only admins can modify daily friendlies" ON public.daily_friendlies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() and role = 'admin'
    )
  );

-- Populate initial results since launch (July 13 - July 16, 2026)
INSERT INTO public.daily_friendlies (tournament_date, player_username, points, performance, is_winner) VALUES
-- July 13, 2026
('2026-07-13', 'HAKAI026', 30, 1981, true),
('2026-07-13', 'Tyrannt', 14, 1693, false),
('2026-07-13', 'Act1ve_001', 13, 1668, false),
('2026-07-13', 'Robert_plays_chess', 8, 1420, false),
('2026-07-13', 'karyptus', 6, 1487, false),
('2026-07-13', 'Veek_Austin01', 4, 1708, false),
('2026-07-13', 'iyanamubongabasi', 2, 1455, false),
('2026-07-13', 'Yaribem05', 2, 1404, false),

-- July 14, 2026
('2026-07-14', 'oblivion14', 22, 2029, true),
('2026-07-14', 'Act1ve_001', 6, 1584, false), -- calculated diff: 19 - 13 = 6
('2026-07-14', 'Veek_Austin01', 14, 1832, false), -- calculated diff: 18 - 4 = 14
('2026-07-14', 'Glorrreeeyy', 16, 1868, false),
('2026-07-14', 'simon25', 14, 1570, false),
('2026-07-14', 'Robert_plays_chess', 4, 1446, false), -- calculated diff: 12 - 8 = 4
('2026-07-14', 'Laka2142', 10, 1663, false),
('2026-07-14', 'Power_101', 8, 1611, false),
('2026-07-14', 'iyanamubongabasi', 6, 1547, false), -- calculated diff: 8 - 2 = 6
('2026-07-14', 'Jhudex', 5, 1366, false),

-- July 15, 2026
('2026-07-15', 'simon25', 31, 1802, true), -- calculated diff: 45 - 14 = 31
('2026-07-15', 'Act1ve_001', 5, 1555, false), -- calculated diff: 24 - 19 = 5
('2026-07-15', 'Robert_plays_chess', 4, 1456, false), -- calculated diff: 16 - 12 = 4
('2026-07-15', 'Tyrannt', 1, 1580, false), -- calculated diff: 15 - 14 = 1
('2026-07-15', 'Weehfhi_Plays', 14, 1630, false),
('2026-07-15', 'Praisehans', 12, 1896, false),
('2026-07-15', 'Klaus-Michael', 12, 1815, false),

-- July 16, 2026
('2026-07-16', 'simon25', 1, 1674, true), -- calculated diff: 46 - 45 = 1
('2026-07-16', 'Veek_Austin01', 12, 1834, false), -- calculated diff: 30 - 18 = 12
('2026-07-16', 'Act1ve_001', 6, 1532, false), -- calculated diff: 30 - 24 = 6
('2026-07-16', 'oblivion14', 4, 1927, false), -- calculated diff: 26 - 22 = 4
('2026-07-16', 'Laka2142', 12, 1885, false), -- calculated diff: 22 - 10 = 12
('2026-07-16', 'Robert_plays_chess', 6, 1444, false), -- calculated diff: 22 - 16 = 6
('2026-07-16', 'Weehfhi_Plays', 6, 1620, false), -- calculated diff: 20 - 14 = 6
('2026-07-16', 'Jhudex', 14, 1365, false), -- calculated diff: 19 - 5 = 14
('2026-07-16', 'Power_101', 8, 1724, false), -- calculated diff: 16 - 8 = 8
('2026-07-16', 'Klaus-Michael', 4, 1647, false), -- calculated diff: 16 - 12 = 4
('2026-07-16', 'Gmpeerless', 14, 1905, false),
('2026-07-16', 'KeseneNicholas', 12, 1786, false),
('2026-07-16', 'Davidbarakaii', 8, 1615, false), -- calculated diff: 11 - 3 = 8
('2026-07-16', 'iyanamubongabasi', 2, 1568, false); -- calculated diff: 10 - 8 = 2
