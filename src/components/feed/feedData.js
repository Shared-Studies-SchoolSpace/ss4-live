// Initial Feed Data matching SAS & SS4 Platform Ecosystem

export const INITIAL_FEED_POSTS = [
  {
    id: 'post_admin_varsity_tournament_2026',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/varsity-tournament-poster.jpeg',
    categoryClass: 'tournament',
    readTime: '2 min read',
    isUnread: true,
    author: {
      name: 'SS4 Arbiter Board',
      avatar: 'SS4',
      avatarBg: '#0F172A',
      avatarColor: '#FFFFFF',
      badge: 'OFFICIAL ADMIN',
      badgeStyle: { background: '#FFEEDB', color: '#B84D00', fontWeight: 900 },
      time: 'Official Broadcast · Urgent Update'
    },
    title: 'SS4 Chess League Varsity Tournament 2026: Nigeria’s Top Universities Clash — Rosters Due Tonight!',
    excerpt: 'Nigeria’s premier inter-university chess championship is officially underway. From September 16th to 30th, 2026, the sharpest collegiate minds from top universities across Nigeria will clash in high-stakes 5-player squad battles hosted online on Chess.com and Lichess. The champion university takes home the national varsity crown and 5x 1-Month Chess.com Premium memberships.\n\n• Format: Teams of 5 contenders per institution\n• Match Window: 16th – 30th September 2026\n• Critical Deadline: Team line-ups and verified rosters are due by midnight tonight, 14th September 2026!\n• Match Hosting: Chess.com & Lichess\n\nFor team registration, line-up submissions, and corporate university sponsorships, contact arbiters directly at 09060515456 or 08161673691.\n\nMany Institutions, One Space. The Board Remembers.',
    tags: ['#SS4VarsityTournament', '#UniversityChess', '#ChessNigeria', '#ChessDotCom', '#Lichess', '#TheBoardRemembers'],
    likesCount: 245,
    isLiked: true,
    isBookmarked: true,
    embed: {
      type: 'lobby',
      badge: 'SEPT 16–30',
      metric: '5-MAN',
      title: 'SS4 Varsity Tournament · University Championship',
      subtitle: 'Prize: 5x Chess.com Premium · Line-ups Due: Sept 14',
      actionLabel: 'Register University Squad →',
      onAction: () => {
        window.location.href = '/chess-league/tournament';
      }
    },
    comments: [
      {
        id: 'c_varsity_1',
        avatar: 'UL',
        avatarBg: '#1E3A8A',
        avatarColor: '#FFFFFF',
        authorName: 'UNILAG Chess Captain',
        time: '1h ago',
        text: 'University of Lagos line-up officially locked in! Boards 1 through 5 ready for battle. Let’s see who can contest Akoka on the virtual boards. 🏆♟️'
      },
      {
        id: 'c_varsity_2',
        avatar: 'UI',
        avatarBg: '#065F46',
        avatarColor: '#FFFFFF',
        authorName: 'University of Ibadan Chess Club',
        time: '35m ago',
        text: 'UI roster confirmed and usernames synced on Lichess and Chess.com. Prepared for the 16th!'
      },
      {
        id: 'c_varsity_3',
        avatar: 'AB',
        avatarBg: '#7C2D12',
        avatarColor: '#FFFFFF',
        authorName: 'ABU Zaria Chess Society',
        time: '15m ago',
        text: 'Squad of 5 registered with the arbiter desk. Looking forward to representing the North. The Board Remembers.'
      }
    ]
  },
  {
    id: 'post_video_1',
    postType: 'multimedia',
    mediaType: 'video',
    categoryLabel: '🎥 Video Highlight',
    categoryClass: 'video',
    readTime: '3 min watch',
    isUnread: true,
    author: {
      name: 'SAS Media Stream',
      avatar: 'SAS',
      avatarBg: '#7C3AED',
      avatarColor: '#FFFFFF',
      badge: 'OFFICIAL',
      badgeStyle: { background: '#F3E8FF', color: '#6B21A8' },
      time: '1 hour ago · HD Duel Replay'
    },
    title: 'Board 12 Highlights: Govt Sec. School vs. Unity Secondary (Physics Finals)',
    excerpt: "Watch Daniel Okoro's clutch 15-second lightning round calculation that sealed Government Secondary School's victory in the Board 12 Physics Championship.",
    tags: ['#VideoHighlight', '#PhysicsDuel', '#Board12', '#SAS2026'],
    likesCount: 328,
    isLiked: true,
    isBookmarked: false,
    videoMeta: {
      duration: '03:45',
      views: '4.8k',
      progress: '45%',
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=1200'
    },
    embed: {
      type: 'match',
      metric: '95%',
      title: 'Physics Quad-FFA Match Result',
      subtitle: 'Rating Delta: +42 SAS · Avg Time/Q: 18.4s',
      actionLabel: 'Replay Match →'
    },
    comments: [
      {
        id: 'c1',
        avatar: 'AB',
        avatarBg: '#EFF6FF',
        avatarColor: '#1A56C4',
        authorName: 'Amara Bello',
        time: '45m ago',
        text: 'That second calculation at 01:42 was insane speed! ⚡ GG to Daniel.'
      },
      {
        id: 'c2',
        avatar: 'TI',
        avatarBg: '#FEF3C7',
        avatarColor: '#B45309',
        authorName: 'Tunde Ibrahim',
        time: '20m ago',
        text: 'The question bank on wave optics was tricky. Unity gave a solid fight.'
      }
    ]
  },
  {
    id: 'post_photo_1',
    postType: 'multimedia',
    mediaType: 'photo_gallery',
    categoryLabel: '📸 Photo Gallery · 6 Photos',
    categoryClass: 'photo',
    isUnread: false,
    author: {
      name: 'Regional Press Office',
      avatar: 'SS4',
      avatarBg: '#0EA5E9',
      avatarColor: '#FFFFFF',
      badge: 'MEDIA',
      badgeStyle: { background: '#E0F2FE', color: '#0369A1' },
      time: '3 hours ago · Lagos Regional Arena'
    },
    title: 'Season 4 Award Ceremony & Merit Grant Presentation',
    excerpt: "High-resolution photos from today's award presentation honoring top-ranked contender students and winning institutional representatives from Government Secondary School and Bright Future College.",
    tags: ['#Gallery', '#AwardCeremony', '#MeritGrants', '#SS4Championship'],
    likesCount: 194,
    isLiked: false,
    isBookmarked: true,
    photoMeta: {
      remainingCount: '+4',
      images: [
        'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600'
      ]
    },
    comments: [
      {
        id: 'c3',
        avatar: 'DO',
        avatarBg: '#DBEAFE',
        avatarColor: '#1E40AF',
        authorName: 'Daniel Okoro',
        time: '2h ago',
        text: 'Proud to represent our school on the national stage! 🎓✨'
      }
    ]
  },
  {
    id: 'post_banner_1',
    postType: 'multimedia',
    mediaType: 'banner',
    categoryLabel: '🏆 Tournament',
    categoryClass: 'tournament',
    readTime: '3 min read',
    isUnread: false,
    author: {
      name: 'SAS Board Official',
      avatar: 'SS4',
      avatarBg: '#1A56C4',
      avatarColor: '#FFFFFF',
      badge: 'VERIFIED',
      badgeStyle: { background: '#DBEAFE', color: '#1E40AF' },
      time: '5 hours ago · Public'
    },
    title: 'National Physics SAS Championship 2026 Registration Now Open!',
    excerpt: 'The SS4 Board officially announces the commencement of registration for the Season 4 Physics Assessment Series. Represent your institution, climb the live contender leaderboard, and compete for total merit grants of over ₦5.5M.',
    tags: ['#PhysicsLeague', '#SAS2026', '#SS4Board', '#MeritGrants'],
    likesCount: 142,
    isLiked: true,
    isBookmarked: true,
    bannerMeta: {
      graphic: '🏆⚔️',
      bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200'
    },
    embed: {
      type: 'lobby',
      badge: 'SAS-MEGA99',
      title: '200-Player Battle Royale · STEM Multi-Subject',
      subtitle: 'Seated: 142/200 Contenders · Starts in 15 mins',
      actionLabel: 'Join Mega Arena →'
    },
    comments: [
      {
        id: 'c4',
        avatar: 'UN',
        avatarBg: '#FCE7F3',
        avatarColor: '#BE185D',
        authorName: 'UNN Contender Team',
        time: '3h ago',
        text: 'Our squad is fully registered. Ready for Board 1!'
      }
    ]
  },
  {
    id: 'post_chess_1',
    postType: 'multimedia',
    mediaType: 'banner',
    categoryLabel: '♟️ Chess League',
    categoryClass: 'tournament',
    readTime: '2 min read',
    isUnread: false,
    author: {
      name: 'SS4 Arbiter Desk',
      avatar: 'AR',
      avatarBg: '#0F172A',
      avatarColor: '#FFFFFF',
      badge: 'ARBITER',
      badgeStyle: { background: '#FEF3C7', color: '#B45309' },
      time: '6 hours ago · Daily League Report'
    },
    title: 'SS4 Daily Friendlies: HAKAI026 Claims July 13 Arena Crown',
    excerpt: 'Over 30 matches concluded across Nigerian secondary and tertiary institutions. HAKAI026 topped the standings with 30 pts and a 1981 performance rating, edging out Tyrannt and Act1ve_001.',
    tags: ['#ChessLeague', '#DailyFriendlies', '#ArenaLeaderboard'],
    likesCount: 98,
    isLiked: false,
    isBookmarked: false,
    bannerMeta: {
      graphic: '♟️⚡',
      bgImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=1200'
    },
    embed: {
      type: 'match',
      metric: '30 pts',
      title: 'July 13 Daily Friendly Arena Result',
      subtitle: 'Winner: HAKAI026 · Performance: 1981',
      actionLabel: 'View Standings →'
    },
    comments: []
  },
  {
    id: 'post_text_1',
    postType: 'text',
    categoryLabel: '⚡ Release v4.2',
    categoryClass: 'text-only',
    isUnread: false,
    author: {
      name: 'Engineering Team',
      avatar: 'DEV',
      avatarBg: '#0F172A',
      avatarColor: '#FFFFFF',
      badge: 'SYSTEM',
      badgeStyle: { background: '#FEF3C7', color: '#B45309' },
      time: 'Yesterday at 4:30 PM · Release Notes'
    },
    title: '3D Card Flip Mechanics & Instant Top-3 Student Inspection Live!',
    excerpt: "We've deployed an overhaul to the Institution & Contender Card components. Tapping any institution card now instantly flips the card 180° in 3D to reveal its top 3 student contenders with real-time SAS ratings and win rates.",
    tags: ['#FeatureUpdate', '#3DCardFlip', '#UXDesign', '#ReleaseNotes'],
    likesCount: 89,
    isLiked: false,
    isBookmarked: false,
    comments: [
      {
        id: 'c5',
        avatar: 'TI',
        avatarBg: '#EFF6FF',
        avatarColor: '#1A56C4',
        authorName: 'Tunde Ibrahim',
        time: '18h ago',
        text: 'The card flip animation feels super smooth on mobile! 🔥'
      }
    ]
  },
  {
    id: 'post_challenge_1',
    postType: 'text',
    categoryLabel: '🎯 Duel Challenge',
    categoryClass: 'announcement',
    isUnread: false,
    author: {
      name: 'Amara Bello',
      avatar: 'AB',
      avatarBg: '#EFF6FF',
      avatarColor: '#1A56C4',
      badge: '#2 CONTENDER',
      badgeStyle: { background: '#DBEAFE', color: '#1E40AF' },
      time: 'Yesterday · Open Challenge'
    },
    title: "Open 1v1 Chemistry Speed Challenge Issued!",
    excerpt: "Issuing an open 1v1 Chemistry Speed Challenge to @Tunde Ibrahim and all Division 1 Contenders! 7 questions, 20-second timer per question. Let's settle who holds the top Chemistry rating before next week's rankings lock. 🧪",
    tags: ['#Chemistry1v1', '#SpeedChallenge', '#SS4Contenders'],
    likesCount: 76,
    isLiked: false,
    isBookmarked: false,
    embed: {
      type: 'challenge',
      badge: '1v1 DUEL',
      title: 'Chemistry 1v1 Duel Challenge',
      subtitle: 'Rules: Rated · 20s/Question · 7 Questions Total',
      actionLabel: 'Accept Challenge ⚔️'
    },
    comments: []
  }
];
