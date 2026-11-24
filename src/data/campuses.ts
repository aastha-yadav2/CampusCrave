import { CampusOption } from '../types';

export const CAMPUSES: CampusOption[] = [
  {
    id: 'srhu-dehradun',
    name: 'SRHU Campus, Dehradun',
    city: 'Dehradun',
    zones: [
      'Main Campus (Central Quad)',
      'Hostel Block A & B',
      'Hostel Block C & D',
      'Library & Academic Block',
      'Medical Wing / Hospital',
    ],
    activeCravingsCount: 14,
    studentsCount: 38,
  },
  {
    id: 'bits-pilani',
    name: 'BITS Pilani',
    city: 'Pilani',
    zones: [
      'ANC Quad',
      'Vyas / Gandhi Bhavan',
      'NAB Complex',
      'Student Activity Center (SAC)',
    ],
    activeCravingsCount: 9,
    studentsCount: 26,
  },
  {
    id: 'iit-delhi',
    name: 'IIT Delhi, Hauz Khas',
    city: 'New Delhi',
    zones: [
      'Nilgiri & Karakoram Hostels',
      'Kumaon & Aravali Hostels',
      'LHC Academic Block',
      'SAC Central Lawn',
    ],
    activeCravingsCount: 18,
    studentsCount: 52,
  },
  {
    id: 'mit-manipal',
    name: 'MIT Manipal',
    city: 'Manipal',
    zones: [
      'FC-1 Food Court Zone',
      'Block 10 & 11 Hostels',
      'NLH Academic Block',
      'Student Plaza',
    ],
    activeCravingsCount: 11,
    studentsCount: 31,
  },
];
