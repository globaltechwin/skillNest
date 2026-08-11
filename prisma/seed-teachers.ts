import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

const teachers = [
  {
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@skillnest.demo",
    subject: "English",
    yearsOfExperience: 8,
    rating: 4.8,
    reviewCount: 120,
    bio: "Experienced English teacher with expertise in communication skills, grammar, and creative writing. Passionate about helping students achieve fluency.",
    location: "Chennai",
    teachingMode: "BOTH" as const,
    languages: "English, Hindi, Tamil",
    teachingLevels: "High School (9-10), Higher Secondary (11-12)",
  },
  {
    firstName: "Karthik",
    lastName: "B",
    email: "karthik.b@skillnest.demo",
    subject: "Tamil",
    yearsOfExperience: 10,
    rating: 4.9,
    reviewCount: 98,
    bio: "Dedicated Tamil language teacher with a decade of experience. Specializes in Tamil literature, poetry, and spoken Tamil for all levels.",
    location: "Madurai",
    teachingMode: "BOTH" as const,
    languages: "Tamil, English",
    teachingLevels: "Elementary (1-5), Middle School (6-8), High School (9-10)",
  },
  {
    firstName: "Aravind",
    lastName: "R",
    email: "aravind.r@skillnest.demo",
    subject: "Math",
    yearsOfExperience: 9,
    rating: 4.8,
    reviewCount: 110,
    bio: "Mathematics expert making complex concepts simple and fun. Specializes in algebra, calculus, and competitive exam preparation.",
    location: "Bangalore",
    teachingMode: "ONLINE" as const,
    languages: "English, Tamil, Kannada",
    teachingLevels: "High School (9-10), Higher Secondary (11-12)",
  },
  {
    firstName: "Revathi",
    lastName: "S",
    email: "revathi.s@skillnest.demo",
    subject: "Science",
    yearsOfExperience: 7,
    rating: 4.7,
    reviewCount: 95,
    bio: "Passionate science teacher bringing chemistry, physics, and biology to life through experiments and real-world applications.",
    location: "Coimbatore",
    teachingMode: "BOTH" as const,
    languages: "English, Tamil",
    teachingLevels: "Middle School (6-8), High School (9-10)",
  },
  {
    firstName: "Ananya",
    lastName: "",
    email: "ananya@skillnest.demo",
    subject: "Yoga",
    yearsOfExperience: 6,
    rating: 4.9,
    reviewCount: 80,
    bio: "Certified yoga instructor specializing in Hatha and Vinyasa yoga. Helps students achieve physical and mental wellness through practice.",
    location: "Chennai",
    teachingMode: "BOTH" as const,
    languages: "English, Hindi, Tamil",
    teachingLevels: "All Levels",
  },
  {
    firstName: "Suresh",
    lastName: "K",
    email: "suresh.k@skillnest.demo",
    subject: "Music",
    yearsOfExperience: 12,
    rating: 4.8,
    reviewCount: 150,
    bio: "Classical and contemporary music teacher with 12 years of experience. Teaches vocals, music theory, and compositions across genres.",
    location: "Chennai",
    teachingMode: "BOTH" as const,
    languages: "English, Tamil, Telugu",
    teachingLevels: "All Levels",
  },
];

async function main() {
  console.log("Seeding featured teachers...");

  // First ensure subjects exist
  const subjectNames = ["English", "Tamil", "Math", "Science", "Yoga", "Music"];
  for (const name of subjectNames) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const teacher of teachers) {
    // Create user
    const user = await prisma.user.upsert({
      where: { email: teacher.email },
      update: {},
      create: {
        clerkUserId: `demo_teacher_${teacher.firstName.toLowerCase()}_${Date.now()}`,
        email: teacher.email,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        role: "TEACHER",
      },
    });

    // Get subject
    const subject = await prisma.subject.findUnique({
      where: { name: teacher.subject },
    });

    if (!subject) {
      console.log(`Subject ${teacher.subject} not found, skipping...`);
      continue;
    }

    // Create teacher profile
    const profile = await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: "APPROVED",
        bio: teacher.bio,
        location: teacher.location,
        teachingMode: teacher.teachingMode,
        yearsOfExperience: teacher.yearsOfExperience,
        languages: teacher.languages,
        teachingLevels: teacher.teachingLevels,
        hourlyRate: 500 + teacher.yearsOfExperience * 50,
      },
    });

    // Link subject to teacher
    await prisma.teacherSubject.upsert({
      where: {
        teacherProfileId_subjectId: {
          teacherProfileId: profile.id,
          subjectId: subject.id,
        },
      },
      update: {},
      create: {
        teacherProfileId: profile.id,
        subjectId: subject.id,
      },
    });

    // Create reviews for this teacher
    const studentEmails = [
      `student1_${teacher.firstName.toLowerCase()}@demo.com`,
      `student2_${teacher.firstName.toLowerCase()}@demo.com`,
      `student3_${teacher.firstName.toLowerCase()}@demo.com`,
    ];

    for (let i = 0; i < teacher.reviewCount && i < 3; i++) {
      const student = await prisma.user.upsert({
        where: { email: studentEmails[i] },
        update: {},
        create: {
          clerkUserId: `demo_student_${teacher.firstName.toLowerCase()}_${i}_${Date.now()}`,
          email: studentEmails[i],
          firstName: `Student${i + 1}`,
          lastName: teacher.firstName,
          role: "STUDENT",
        },
      });

      const rating = Math.round(teacher.rating);
      await prisma.review.create({
        data: {
          teacherProfileId: profile.id,
          studentUserId: student.id,
          rating: rating - (i === 0 ? 0 : 1),
          comment: `Great teacher! Very knowledgeable and patient. Highly recommended for ${teacher.subject} learning.`,
        },
      });
    }

    console.log(`Created teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.subject})`);
  }

  console.log("Featured teachers seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
