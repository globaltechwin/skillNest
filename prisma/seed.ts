import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subjects = [
  "English",
  "Tamil",
  "Maths",
  "Math",
  "Science",
  "Hindi",
  "Social Science",
  "Sanskrit",
  "Computer Science",
  "Business Maths",
  "Accountancy",
  "Yoga",
  "Abacus",
  "Drawing",
  "Classical Dance",
  "Music",
  "Workout",
  "Spanish",
  "French",
  "German",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Economics",
  "Business Studies",
  "Political Science",
  "Sociology",
  "Psychology",
  "Philosophy",
  "Art",
  "Physical Education",
];

async function main() {
  console.log("Seeding subjects...");

  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seeded ${subjects.length} subjects`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
