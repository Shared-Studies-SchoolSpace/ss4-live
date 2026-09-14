// Initial Feed Data for SS4 Platform Ecosystem
// Authentic posts only: dummy posts and dummy engagement statistics removed.

export const INITIAL_FEED_POSTS = [
  {
    id: 'post_admin_varsity_tournament_2026',
    postType: 'multimedia',
    mediaType: 'poster',
    imageUrl: '/varsity-tournament-poster.jpeg',
    categoryClass: 'tournament',
    readTime: '',
    isUnread: true,
    author: {
      name: 'SS4',
      avatarImg: '/ss4_logo_without_text.jpg',
      isAdmin: true
    },
    title: 'SS4 Chess League Varsity Tournament 2026: Nigeria’s Top Universities Clash — Rosters Due Tonight!',
    excerpt: 'Nigeria’s premier inter-university chess championship is officially underway. From September 16th to 30th, 2026, the sharpest collegiate minds from top universities across Nigeria will clash in high-stakes 5-player squad battles hosted online on Chess.com and Lichess. The champion university takes home the national varsity crown and 5x 1-Month Chess.com Premium memberships.\n\n• Format: Teams of 5 contenders per institution\n• Match Window: 16th – 30th September 2026\n• Critical Deadline: Team line-ups and verified rosters are due by midnight tonight, 14th September 2026!\n• Match Hosting: Chess.com & Lichess\n\nFor team registration, line-up submissions, and corporate university sponsorships, contact arbiters directly at 09060515456 or 08161673691.\n\nMany Institutions, One Space. The Board Remembers.',
    tags: ['#SS4VarsityTournament', '#UniversityChess', '#ChessNigeria', '#ChessDotCom', '#Lichess', '#TheBoardRemembers'],
    likesCount: 0,
    isLiked: false,
    isBookmarked: false,
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
    comments: []
  }
];
