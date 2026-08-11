import { z } from "zod";

const teachingModeEnum = z.enum(["ONLINE", "OFFLINE", "BOTH"]);
const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const basicInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .max(50, "Last name must be 50 characters or less")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be 15 digits or less")
    .regex(/^[+\d\s-]+$/, "Phone number must contain only digits, spaces, dashes, or plus sign"),
  gender: z.string().optional().or(z.literal("")),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must be 200 characters or less"),
});

export const teachingInfoSchema = z.object({
  bio: z
    .string()
    .min(50, "Bio must be at least 50 characters")
    .max(2000, "Bio must be 2000 characters or less"),
  teachingApproach: z
    .string()
    .max(1000, "Teaching approach must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
  teachingMode: teachingModeEnum,
  offlineLocation: z
    .string()
    .max(200, "Location must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience must be at least 0")
    .max(50, "Years of experience must be 50 or less"),
  languages: z
    .string()
    .max(500, "Languages must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  teachingLevels: z
    .string()
    .max(500, "Teaching levels must be 500 characters or less")
    .optional()
    .or(z.literal("")),
});

export const subjectsSchema = z.object({
  subjectIds: z
    .array(z.string())
    .min(1, "Select at least one subject")
    .max(10, "You can select up to 10 subjects"),
});

export const qualificationsSchema = z.object({
  qualifications: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Qualification title is required")
          .max(200, "Title must be 200 characters or less"),
        institution: z
          .string()
          .max(200, "Institution must be 200 characters or less")
          .optional()
          .or(z.literal("")),
        year: z
          .number()
          .min(1900, "Year must be after 1900")
          .max(new Date().getFullYear() + 1, "Year cannot be in the future")
          .optional()
          .or(z.null()),
      })
    )
    .min(1, "Add at least one qualification")
    .max(10, "You can add up to 10 qualifications"),
});

export const availabilitySchema = z.object({
  availability: z
    .array(
      z.object({
        day: dayOfWeekEnum,
        enabled: z.boolean(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
      })
    )
    .refine(
      (days) => {
        const enabledDays = days.filter((d) => d.enabled);
        return enabledDays.length > 0;
      },
      { message: "Select at least one available day" }
    )
    .refine(
      (days) => {
        const enabledDays = days.filter((d) => d.enabled);
        return enabledDays.every(
          (d) => d.startTime && d.endTime && d.startTime < d.endTime
        );
      },
      { message: "End time must be after start time for all selected days" }
    ),
});

export const teacherProfileSchema = basicInfoSchema
  .merge(teachingInfoSchema)
  .merge(subjectsSchema)
  .merge(qualificationsSchema)
  .merge(availabilitySchema);

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type TeachingInfoInput = z.infer<typeof teachingInfoSchema>;
export type SubjectsInput = z.infer<typeof subjectsSchema>;
export type QualificationsInput = z.infer<typeof qualificationsSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type TeacherProfileInput = z.infer<typeof teacherProfileSchema>;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or less"),
  subjectId: z.string().min(1, "Subject is required"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
  teachingLevel: z
    .string()
    .max(200, "Teaching level must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  teachingMode: teachingModeEnum.optional().or(z.literal("")),
  location: z
    .string()
    .max(200, "Location must be 200 characters or less")
    .optional()
    .or(z.literal("")),
  maxStudents: z
    .number()
    .min(1, "Maximum students must be at least 1")
    .max(1000, "Maximum students must be 1000 or less")
    .optional()
    .or(z.null()),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const assignmentSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(5000, "Description must be 5000 characters or less")
    .optional()
    .or(z.literal("")),
  dueDate: z
    .string()
    .optional()
    .or(z.literal("")),
  maxMarks: z
    .number()
    .min(1, "Maximum marks must be at least 1")
    .max(10000, "Maximum marks must be 10000 or less")
    .optional()
    .or(z.null()),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const gradeSchema = z.object({
  marks: z
    .number()
    .min(0, "Marks cannot be negative"),
  feedback: z
    .string()
    .max(5000, "Feedback must be 5000 characters or less")
    .optional()
    .or(z.literal("")),
});

export type GradeInput = z.infer<typeof gradeSchema>;

export const classSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  mode: z.enum(["ONLINE", "OFFLINE", "BOTH"]),
  location: z
    .string()
    .max(500, "Location must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  meetingUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "URL must be 500 characters or less")
    .optional()
    .or(z.literal("")),
});

export type ClassInput = z.infer<typeof classSchema>;

export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or less"),
});

export type MessageInput = z.infer<typeof messageSchema>;

export const reviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string()
    .max(1000, "Comment must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
});

export const teacherApplicationSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .trim()
    .max(50, "First name must be 50 characters or less"),
  lastName: z
    .string()
    .max(50, "Last name must be 50 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be 15 digits or less")
    .regex(/^[+\d\s-]+$/, "Phone number must contain only digits, spaces, dashes, or plus sign"),
  gender: z.string().max(20, "Gender must be 20 characters or less").optional().or(z.literal("")),
  location: z
    .string()
    .min(1, "Location is required")
    .trim()
    .max(200, "Location must be 200 characters or less"),
  languages: z
    .array(z.string().trim().max(50, "Each language must be 50 characters or less"))
    .max(10, "You can add up to 10 languages")
    .optional(),
  bio: z
    .string()
    .max(2000, "Bio must be 2000 characters or less")
    .trim()
    .optional()
    .or(z.literal("")),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience must be at least 0")
    .max(50, "Years of experience must be 50 or less")
    .optional(),
  teachingMode: z.enum(["ONLINE", "OFFLINE", "BOTH"]).optional(),
  teachingLevels: z
    .array(z.string().trim().max(50, "Each level must be 50 characters or less"))
    .max(10, "You can add up to 10 teaching levels")
    .optional(),
  subjectIds: z
    .array(z.string())
    .min(1, "Select at least one subject")
    .max(10, "You can select up to 10 subjects"),
  qualifications: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Qualification title is required")
          .trim()
          .max(200, "Title must be 200 characters or less"),
        field: z
          .string()
          .max(200, "Field must be 200 characters or less")
          .trim()
          .optional()
          .or(z.literal("")),
        institution: z
          .string()
          .max(200, "Institution must be 200 characters or less")
          .trim()
          .optional()
          .or(z.literal("")),
        year: z
          .number()
          .min(1900, "Year must be after 1900")
          .max(new Date().getFullYear() + 1, "Year cannot be in the future")
          .optional()
          .or(z.null()),
      })
    )
    .max(10, "You can add up to 10 qualifications")
    .optional(),
  availability: z
    .array(
      z.object({
        day: dayOfWeekEnum,
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
      })
    )
    .min(1, "Add at least one availability slot")
    .max(7, "You can add up to 7 availability slots"),
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;
