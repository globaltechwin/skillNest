import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subjects = [
  "English",
  "Tamil",
  "Math",
  "Science",
  "Yoga",
  "Music",
  "Classical Dance",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "Economics",
  "Business Studies",
  "Accountancy",
  "Political Science",
  "Sociology",
  "Psychology",
  "Philosophy",
  "Sanskrit",
  "Hindi",
  "French",
  "German",
  "Art",
  "Drawing",
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
