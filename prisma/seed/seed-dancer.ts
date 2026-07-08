import type { PrismaClient } from '../../generated/prisma/client';

const DANCERS = [
  {
    fullName: 'Rin',
    email: 'rin@example.com',
    city: 'Tokyo',
    country: 'Japan',
    danceStyles: ['contemporary', 'ballet'],
    preferredTypes: ['audition', 'performer casting'],
    skillLevel: 'advanced',
    yearsExperience: 6,
    travelRadiusKm: 50,
    minCompensation: 300,
    currency: 'USD',
    portfolioUrls: ['https://example.com/rin-portfolio'],
    languages: ['Japanese', 'English'],
    profileDescription:
      'Contemporary and ballet dancer based in Tokyo, open to auditions and performance castings.',
    isActive: true,
  },
  {
    fullName: 'Justin',
    email: 'justin@example.com',
    city: 'Los Angeles',
    country: 'USA',
    danceStyles: ['hip-hop', 'street'],
    preferredTypes: ['dance instructor job', 'choreographer role'],
    skillLevel: 'professional',
    yearsExperience: 10,
    travelRadiusKm: 100,
    minCompensation: 500,
    currency: 'USD',
    portfolioUrls: ['https://example.com/justin-portfolio'],
    languages: ['English'],
    profileDescription:
      'Professional hip-hop and street dance instructor and choreographer based in Los Angeles.',
    isActive: true,
  },
  {
    fullName: 'Chloe Wong',
    email: 'chloe.wong@example.com',
    city: 'Singapore',
    country: 'Singapore',
    danceStyles: ['contemporary', 'lyrical'],
    preferredTypes: ['performance dancer role', 'choreographer role'],
    skillLevel: 'advanced',
    yearsExperience: 5,
    travelRadiusKm: 40,
    minCompensation: 320,
    currency: 'USD',
    portfolioUrls: ['https://example.com/chloe-portfolio'],
    languages: ['English'],
    profileDescription:
      'Advanced contemporary and lyrical dancer based in Singapore, focused on stage productions, creative choreography, and studio training.',
    isActive: true,
  },
  {
    fullName: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    city: 'Singapore',
    country: 'Singapore',
    danceStyles: ['locking', 'house'],
    preferredTypes: ['dance instructor job', 'battle dancer role'],
    skillLevel: 'professional',
    yearsExperience: 10,
    travelRadiusKm: 60,
    minCompensation: 500,
    currency: 'USD',
    portfolioUrls: ['https://example.com/marcus-portfolio'],
    languages: ['English', 'Mandarin'],
    profileDescription:
      'Professional locking and house dancer based in Singapore with strong experience in street dance battles, workshops, and choreography.',
    isActive: true,
  },
  {
    fullName: 'Ren Kobayashi',
    email: 'ren.kobayashi@example.com',
    city: 'Yokohama',
    country: 'Japan',
    danceStyles: ['breaking', 'popping'],
    preferredTypes: ['battle dancer role', 'dance instructor job'],
    skillLevel: 'professional',
    yearsExperience: 9,
    travelRadiusKm: 90,
    minCompensation: 500,
    currency: 'USD',
    portfolioUrls: ['https://example.com/ren-portfolio'],
    languages: ['Japanese', 'English'],
    profileDescription:
      'Professional breaking and popping dancer based in Yokohama with experience in battles, workshops, and youth training.',
    isActive: true,
  },
  {
    fullName: 'Aiko Nakamura',
    email: 'aiko.nakamura@example.com',
    city: 'Kyoto',
    country: 'Japan',
    danceStyles: ['traditional japanese dance', 'contemporary'],
    preferredTypes: ['cultural performance role', 'choreographer role'],
    skillLevel: 'professional',
    yearsExperience: 12,
    travelRadiusKm: 100,
    minCompensation: 600,
    currency: 'USD',
    portfolioUrls: ['https://example.com/aiko-portfolio'],
    languages: ['Japanese', 'English'],
    profileDescription:
      'Professional traditional Japanese and contemporary dancer based in Kyoto, specializing in cultural performances and choreography.',
    isActive: true,
  },
  {
    fullName: 'Hiroshi Sato',
    email: 'hiroshi.sato@example.com',
    city: 'Osaka',
    country: 'Japan',
    danceStyles: ['jazz', 'tap'],
    preferredTypes: ['dance instructor job', 'backup dancer role'],
    skillLevel: 'advanced',
    yearsExperience: 6,
    travelRadiusKm: 70,
    minCompensation: 350,
    currency: 'USD',
    portfolioUrls: ['https://example.com/hiroshi-portfolio'],
    languages: ['Japanese'],
    profileDescription:
      'Advanced jazz and tap dancer from Osaka, experienced in studio teaching and live stage productions.',
    isActive: true,
  },
  {
    fullName: 'Yuki Tanaka',
    email: 'yuki.tanaka@example.com',
    city: 'Tokyo',
    country: 'Japan',
    danceStyles: ['ballet', 'contemporary'],
    preferredTypes: ['dance instructor job', 'performance dancer role'],
    skillLevel: 'professional',
    yearsExperience: 8,
    travelRadiusKm: 80,
    minCompensation: 450,
    currency: 'USD',
    portfolioUrls: ['https://example.com/yuki-portfolio'],
    languages: ['Japanese', 'English'],
    profileDescription:
      'Professional ballet and contemporary dancer based in Tokyo with strong teaching and stage performance experience.',
    isActive: true,
  },
];

export async function seedDancers(prisma: PrismaClient) {
  for (const dancer of DANCERS) {
    const data = {
      ...dancer,
      danceStyles: [...dancer.danceStyles],
      preferredTypes: [...dancer.preferredTypes],
      portfolioUrls: [...dancer.portfolioUrls],
      languages: [...dancer.languages],
    };

    const existing = await prisma.dancer.findFirst({
      where: { fullName: dancer.fullName },
    });

    if (existing) {
      await prisma.dancer.update({
        where: { id: existing.id },
        data,
      });
      console.log(`Updated dancer: ${dancer.fullName}`);
      continue;
    }

    await prisma.dancer.create({ data });
    console.log(`Created dancer: ${dancer.fullName}`);
  }
}
