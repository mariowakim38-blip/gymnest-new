export interface Coach {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  bio: string;
  imageUrl: string;
  rating: number;
}

export interface Class {
  id: string;
  name: string;
  ageGroup: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  day: string;
  time: string;
  duration: string;
  coachId: string;
  capacity: number;
  enrolled: number;
  description: string;
  dayOfWeek: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Competition' | 'Workshop' | 'Showcase' | 'Camp';
  description: string;
  location: string;
  imageUrl: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  level: string;
  enrolledClasses: string[];
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'promotion' | 'event' | 'info';
  date: string;
}

export const coaches: Coach[] = [
  {
    id: '1',
    name: 'Celine El Cheikh',
    specialization: 'Artistic Gymnastics Coach',
    experience: '3 years coaching, 5 years as gymnast',
    bio: 'Dedicated artistic gymnastics coach with 3 years of coaching experience and 5 years as a competitive gymnast.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Ramy Safi',
    specialization: 'Artistic Gymnastics Coach',
    experience: '6 years coaching, 8 years as gymnast',
    bio: 'Experienced artistic gymnastics coach with 6 years of coaching and 8 years as a competitive gymnast. Expert in tumbling techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Lynn Joy Laffe',
    specialization: 'Artistic Gymnastics Coach',
    experience: '3 years coaching, 10 years as gymnast, FIG Level 1',
    bio: 'FIG Coaching Level 1 certified artistic gymnastics coach with 3 years of coaching experience and 10 years as a gymnast.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Pamela El Beyrouthy',
    specialization: 'Artistic Gymnastics Coach',
    experience: '5 years',
    bio: 'Experienced artistic gymnastics coach with 5 years of coaching expertise in strength and conditioning.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    rating: 4.7,
  },
  {
    id: '5',
    name: 'Lynn Abou El Khoudoud',
    specialization: 'Artistic Gymnastics Coach',
    experience: '3 years',
    bio: 'Passionate artistic gymnastics coach with 3 years of experience working with young athletes.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    rating: 4.8,
  },
  {
    id: '6',
    name: 'Diva Haydar',
    specialization: 'Artistic Gymnastics & Aerial Silk Coach',
    experience: '4 years',
    bio: 'Dedicated coach with 4 years of experience in artistic gymnastics and aerial silk training.',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    rating: 4.8,
  },
];

export const classes: Class[] = [
  {
    id: '1',
    name: 'Gymnastics Class',
    ageGroup: '3-5 years',
    level: 'Beginner',
    day: 'Monday',
    time: '4:30 PM',
    duration: '60 min',
    coachId: '3',
    capacity: 30,
    enrolled: 10,
    description: 'Introduction to basic gymnastics movements through fun games and activities.',
    dayOfWeek: 1,
  },
  {
    id: '2',
    name: 'Gymnastics Class',
    ageGroup: '6-8 years',
    level: 'Beginner',
    day: 'Monday',
    time: '5:30 PM',
    duration: '60 min',
    coachId: '1',
    capacity: 30,
    enrolled: 12,
    description: 'Foundational skills on all apparatus with focus on proper technique.',
    dayOfWeek: 1,
  },
  {
    id: '3',
    name: 'Gymnastics Class',
    ageGroup: '9-12 years',
    level: 'Intermediate',
    day: 'Monday',
    time: '6:30 PM',
    duration: '60 min',
    coachId: '2',
    capacity: 50,
    enrolled: 9,
    description: 'Intermediate level gymnastics training for developing athletes.',
    dayOfWeek: 1,
  },
  {
    id: '4',
    name: 'Gymnastics Class',
    ageGroup: '3-5 years',
    level: 'Beginner',
    day: 'Tuesday',
    time: '4:30 PM',
    duration: '60 min',
    coachId: '3',
    capacity: 30,
    enrolled: 8,
    description: 'Introduction to basic gymnastics movements through fun games and activities.',
    dayOfWeek: 2,
  },
  {
    id: '5',
    name: 'Gymnastics Class',
    ageGroup: '6-8 years',
    level: 'Beginner',
    day: 'Tuesday',
    time: '5:30 PM',
    duration: '60 min',
    coachId: '1',
    capacity: 30,
    enrolled: 13,
    description: 'Foundational skills on all apparatus with focus on proper technique.',
    dayOfWeek: 2,
  },
  {
    id: '6',
    name: 'Gymnastics Class',
    ageGroup: '9-12 years',
    level: 'Intermediate',
    day: 'Tuesday',
    time: '6:30 PM',
    duration: '60 min',
    coachId: '2',
    capacity: 50,
    enrolled: 10,
    description: 'Intermediate level gymnastics training for developing athletes.',
    dayOfWeek: 2,
  },
  {
    id: '7',
    name: 'Gymnastics Class',
    ageGroup: '3-5 years',
    level: 'Beginner',
    day: 'Wednesday',
    time: '4:30 PM',
    duration: '60 min',
    coachId: '3',
    capacity: 30,
    enrolled: 11,
    description: 'Introduction to basic gymnastics movements through fun games and activities.',
    dayOfWeek: 3,
  },
  {
    id: '8',
    name: 'Gymnastics Class',
    ageGroup: '6-8 years',
    level: 'Beginner',
    day: 'Wednesday',
    time: '5:30 PM',
    duration: '60 min',
    coachId: '1',
    capacity: 30,
    enrolled: 14,
    description: 'Foundational skills on all apparatus with focus on proper technique.',
    dayOfWeek: 3,
  },
  {
    id: '9',
    name: 'Gymnastics Class',
    ageGroup: '9-12 years',
    level: 'Intermediate',
    day: 'Wednesday',
    time: '6:30 PM',
    duration: '60 min',
    coachId: '2',
    capacity: 50,
    enrolled: 8,
    description: 'Intermediate level gymnastics training for developing athletes.',
    dayOfWeek: 3,
  },
  {
    id: '10',
    name: 'Gymnastics Class',
    ageGroup: '3-5 years',
    level: 'Beginner',
    day: 'Thursday',
    time: '4:30 PM',
    duration: '60 min',
    coachId: '3',
    capacity: 30,
    enrolled: 9,
    description: 'Introduction to basic gymnastics movements through fun games and activities.',
    dayOfWeek: 4,
  },
  {
    id: '11',
    name: 'Gymnastics Class',
    ageGroup: '6-8 years',
    level: 'Beginner',
    day: 'Thursday',
    time: '5:30 PM',
    duration: '60 min',
    coachId: '1',
    capacity: 30,
    enrolled: 15,
    description: 'Foundational skills on all apparatus with focus on proper technique.',
    dayOfWeek: 4,
  },
  {
    id: '12',
    name: 'Gymnastics Class',
    ageGroup: '9-12 years',
    level: 'Intermediate',
    day: 'Thursday',
    time: '6:30 PM',
    duration: '60 min',
    coachId: '2',
    capacity: 50,
    enrolled: 11,
    description: 'Intermediate level gymnastics training for developing athletes.',
    dayOfWeek: 4,
  },
  {
    id: '13',
    name: 'Gymnastics Class',
    ageGroup: '3-5 years',
    level: 'Beginner',
    day: 'Friday',
    time: '4:30 PM',
    duration: '60 min',
    coachId: '3',
    capacity: 30,
    enrolled: 7,
    description: 'Introduction to basic gymnastics movements through fun games and activities.',
    dayOfWeek: 5,
  },
  {
    id: '14',
    name: 'Gymnastics Class',
    ageGroup: '6-8 years',
    level: 'Beginner',
    day: 'Friday',
    time: '5:30 PM',
    duration: '60 min',
    coachId: '1',
    capacity: 30,
    enrolled: 12,
    description: 'Foundational skills on all apparatus with focus on proper technique.',
    dayOfWeek: 5,
  },
  {
    id: '15',
    name: 'Gymnastics Class',
    ageGroup: '9-12 years',
    level: 'Intermediate',
    day: 'Friday',
    time: '6:30 PM',
    duration: '60 min',
    coachId: '2',
    capacity: 50,
    enrolled: 9,
    description: 'Intermediate level gymnastics training for developing athletes.',
    dayOfWeek: 5,
  },
  {
    id: '16',
    name: 'Gymnastics Class',
    ageGroup: '13-16 years',
    level: 'Advanced',
    day: 'Monday',
    time: '7:30 PM',
    duration: '60 min',
    coachId: '4',
    capacity: 50,
    enrolled: 7,
    description: 'Advanced gymnastics training for competitive athletes.',
    dayOfWeek: 1,
  },
  {
    id: '17',
    name: 'Gymnastics Class',
    ageGroup: '13-16 years',
    level: 'Advanced',
    day: 'Tuesday',
    time: '7:30 PM',
    duration: '60 min',
    coachId: '4',
    capacity: 50,
    enrolled: 8,
    description: 'Advanced gymnastics training for competitive athletes.',
    dayOfWeek: 2,
  },
  {
    id: '18',
    name: 'Gymnastics Class',
    ageGroup: '13-16 years',
    level: 'Advanced',
    day: 'Wednesday',
    time: '7:30 PM',
    duration: '60 min',
    coachId: '4',
    capacity: 50,
    enrolled: 9,
    description: 'Advanced gymnastics training for competitive athletes.',
    dayOfWeek: 3,
  },
  {
    id: '19',
    name: 'Gymnastics Class',
    ageGroup: '13-16 years',
    level: 'Advanced',
    day: 'Thursday',
    time: '7:30 PM',
    duration: '60 min',
    coachId: '4',
    capacity: 50,
    enrolled: 10,
    description: 'Advanced gymnastics training for competitive athletes.',
    dayOfWeek: 4,
  },
  {
    id: '20',
    name: 'Gymnastics Class',
    ageGroup: '13-16 years',
    level: 'Advanced',
    day: 'Friday',
    time: '7:30 PM',
    duration: '60 min',
    coachId: '4',
    capacity: 50,
    enrolled: 6,
    description: 'Advanced gymnastics training for competitive athletes.',
    dayOfWeek: 5,
  },
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Fall Showcase',
    date: '2025-11-15',
    time: '6:30 PM',
    type: 'Showcase',
    description: 'Annual fall performance where students demonstrate their skills to family and friends.',
    location: 'Gymnest Main Arena',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
  },
  {
    id: '2',
    title: 'Regional Competition',
    date: '2025-11-22',
    time: '9:00 AM',
    type: 'Competition',
    description: 'Regional gymnastics competition for intermediate and advanced students.',
    location: 'City Sports Complex',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
  },
  {
    id: '3',
    title: 'Holiday Camp',
    date: '2025-12-20',
    time: '9:00 AM',
    type: 'Camp',
    description: 'Week-long holiday camp with special activities and guest coaches.',
    location: 'Gymnest Main Arena',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  },
  {
    id: '4',
    title: 'Flexibility Workshop',
    date: '2025-11-08',
    time: '2:00 PM',
    type: 'Workshop',
    description: 'Special workshop focusing on flexibility and injury prevention techniques.',
    location: 'Gymnest Studio B',
    imageUrl: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=800',
  },
];

export const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Lebanese Competition',
    message: 'Lebanese Competition December 12-13-14. Join us for this exciting competition event!',
    type: 'event',
    date: '2025-10-01',
  },
  {
    id: '2',
    title: 'November Free Trial Week and Body Composition',
    message: 'Try any class for free during November! Plus get a free body composition assessment from November 1-8.',
    type: 'promotion',
    date: '2025-11-01',
  },
  {
    id: '3',
    title: 'Family Discount',
    message: 'Special family promotion! Get 25% discount on the second kid and 50% discount on the 3rd kid.',
    type: 'promotion',
    date: '2025-10-20',
  },
];

export const galleryItems = [
  {
    id: '1',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800',
    caption: 'Advanced beam routine',
  },
  {
    id: '2',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    caption: 'Team training session',
  },
  {
    id: '3',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    caption: 'Competition day',
  },
  {
    id: '4',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    caption: 'Floor exercise practice',
  },
  {
    id: '5',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=800',
    caption: 'Flexibility training',
  },
  {
    id: '6',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    caption: 'Tiny Tumblers class',
  },
];
