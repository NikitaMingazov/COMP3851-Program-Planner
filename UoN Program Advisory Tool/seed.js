/**
 * Author: Ethan Chua
 * Date: 20/11/2026
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Course Schema
const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: String,
  units: { type: Number, default: 10 },       
  prerequisites: [String],                    
  semestersOffered: [String],                 
  replacedBy: String,                         
  verified: { type: Boolean, default: false } 
});

// Program Schema
const programSchema = new mongoose.Schema({
  code: String,                               
  name: String,
  totalUnits: Number,
  maxUnitsAtLevel1000: Number,
  minUnitsPerLevelFrom2000: Number,
  coreCourses: [String],
  electiveUnits: Number,
  majors: [{
    name: String,
    compulsory: [String],
    courseList: { pickUnits: Number, options: [String] }
  }]
});

const Course = mongoose.model('Course', courseSchema);
const Program = mongoose.model('Program', programSchema);

// Course data
// Codes, titles and units from the UoN handbook.
// prerequisites and semestersOffered are PLACEHOLDERS (verified:false).
const both = ['S1', 'S2'];
const c = (code, title, prerequisites = [], semestersOffered = both) =>
  ({ code, title, units: 10, prerequisites, semestersOffered, verified: false });

const courses = [
  // Core, level 1000
  c('COMP1010', 'Computing Fundamentals'),
  c('COMP1140', 'Database and Information Management'),
  c('MATH1110', 'Mathematics for Engineering, Science and Technology 1'),
  c('MATH1510', 'Discrete Mathematics'),
  c('SENG1050', 'Web Technologies'),
  c('SENG1110', 'Object Oriented Programming'),
  c('SENG1120', 'Data Structures', ['SENG1110']),
  // Core, level 2000
  c('COMP2230', 'Algorithms', ['SENG1120', 'MATH1510']),
  c('COMP2240', 'Operating Systems', ['SENG1120']),
  c('COMP2270', 'Theory of Computation', ['MATH1510']),
  c('SENG2130', 'Systems Analysis and Design'),
  c('SENG2250', 'System and Network Security'),
  c('SENG2260', 'Human-Computer Interaction'),
  // Core, level 3000+
  c('COMP3851A', 'Computing and Information Sciences Work Integrated Learning Part A'),
  c('COMP3851B', 'Computing and Information Sciences Work Integrated Learning Part B', ['COMP3851A']),
  c('INFT3800', 'Professional Practice in IT'),
  c('SENG4500', 'Network and Distributed Computing'),
  // Software Development major
  c('SENG2200', 'Programming Languages and Paradigms', ['SENG1120']),
  c('INFT3100', 'Project Management'),
  c('SENG3320', 'Software Verification and Validation'),
  c('INFT2150', 'Business Analysis'),
  c('SENG2050', 'Web Engineering', ['SENG1050']),
  c('COMP3260', 'Data Security'),
  c('COMP3320', 'Computer Graphics'),
  c('COMP3350', 'Advanced Database', ['COMP1140']),
  c('INFT3950', 'Games Design'),
  c('INFT3960', 'Games Production', ['INFT3950']),
  // Computer Systems and Robotics major
  c('ELEC1710', 'Digital and Computer Electronics 1'),
  c('MATH1120', 'Mathematics for Engineering, Science and Technology 2', ['MATH1110']),
  c('ELEC2720', 'Introduction to Embedded Computing', ['ELEC1710']),
  c('COMP3290', 'Compiler Design'),
  c('COMP3330', 'Machine Intelligence'),
  // Cyber Security major
  c('INFT2031', 'Systems and Network Administration'),
  c('COMP3500', 'Security Attacks: Analysis and Mitigation Strategies'),
  c('COMP3600', 'Cyber Security Governance, Risk, and Compliance'),
  c('INFT2051', 'Mobile Application Programming'),
  c('COMP3340', 'Data Mining'),
  c('INFT3050', 'Web Programming'),
  c('SENG4430', 'Software Quality'),
];

// Program Data from the UoN Course Handbook
const program = {
  code: '40103',
  name: 'Bachelor of Computer Science',
  totalUnits: 240,
  maxUnitsAtLevel1000: 100,
  minUnitsPerLevelFrom2000: 40,
  coreCourses: [
    'COMP1010', 'COMP1140', 'MATH1110', 'MATH1510', 'SENG1050', 'SENG1110', 'SENG1120',
    'COMP2230', 'COMP2240', 'COMP2270', 'SENG2130', 'SENG2250', 'SENG2260',
    'COMP3851A', 'COMP3851B', 'INFT3800', 'SENG4500',
  ],
  electiveUnits: 10,
  majors: [
    {
      name: 'Software Development',
      compulsory: ['SENG2200', 'INFT3100', 'SENG3320'],
      courseList: {
        pickUnits: 30,
        options: ['INFT2150', 'SENG2050', 'COMP3260', 'COMP3320', 'COMP3350', 'INFT3950', 'INFT3960'],
      },
    },
    {
      name: 'Computer Systems and Robotics',
      compulsory: ['ELEC1710', 'MATH1120', 'ELEC2720', 'COMP3290', 'COMP3330'],
      courseList: { pickUnits: 10, options: ['SENG2200', 'COMP3320', 'COMP3350'] },
    },
    {
      name: 'Cyber Security',
      compulsory: ['INFT2031', 'COMP3260', 'COMP3500', 'COMP3600'],
      courseList: {
        pickUnits: 20,
        options: ['INFT2051', 'COMP3330', 'COMP3340', 'COMP3350', 'INFT3050', 'INFT3100', 'SENG3320', 'SENG4430'],
      },
    },
  ],
};

// Run
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Course.deleteMany({});
  await Program.deleteMany({});
  await Course.insertMany(courses);
  await Program.create(program);
  console.log(`Seeded ${courses.length} courses and 1 program`);
  await mongoose.disconnect();
})().catch(err => { console.error(err); process.exit(1); });
