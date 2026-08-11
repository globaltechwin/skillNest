"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

const PAGE_SIZE = 20;

async function requireAdmin() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") redirect("/login");

  return clerkUserId;
}

// ─── Dashboard Counts ──────────────────────────────────────────────

export type DashboardCounts = {
  totalStudents: number;
  totalTeachers: number;
  approvedTeachers: number;
  pendingTeachers: number;
  rejectedTeachers: number;
};

export async function getDashboardCounts(): Promise<DashboardCounts> {
  await requireAdmin();

  const [totalStudents, totalTeachers, approvedTeachers, pendingTeachers, rejectedTeachers] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.teacherProfile.count({ where: { status: "APPROVED" } }),
      prisma.teacherProfile.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.teacherProfile.count({ where: { status: "REJECTED" } }),
    ]);

  return { totalStudents, totalTeachers, approvedTeachers, pendingTeachers, rejectedTeachers };
}

// ─── Teachers ──────────────────────────────────────────────────────

export type TeacherRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: Date;
  status: string;
  clerkUserId: string;
};

export type PaginatedTeachers = {
  data: TeacherRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getTeachers(
  search?: string,
  status?: string,
  page: number = 1
): Promise<PaginatedTeachers> {
  await requireAdmin();

  const where: Record<string, unknown> = {
    role: "TEACHER",
  };

  if (status && status !== "ALL") {
    where.teacherProfile = { status };
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { teacherProfile: { select: { status: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      createdAt: u.createdAt,
      status: u.teacherProfile?.status || "PENDING_VERIFICATION",
      clerkUserId: u.clerkUserId,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Students ──────────────────────────────────────────────────────

export type StudentRow = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: Date;
};

export type PaginatedStudents = {
  data: StudentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getStudents(
  search?: string,
  page: number = 1
): Promise<PaginatedStudents> {
  await requireAdmin();

  const where: Record<string, unknown> = { role: "STUDENT" };

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      createdAt: u.createdAt,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Update Teacher Status ─────────────────────────────────────────

export type UpdateTeacherStatusResult =
  | { success: true }
  | { success: false; error: string };

export async function updateTeacherStatus(
  userId: string,
  newStatus: "APPROVED" | "PENDING_VERIFICATION" | "REJECTED",
  reviewNote?: string
): Promise<UpdateTeacherStatusResult> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, clerkUserId: true },
  });

  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Teacher not found." };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!profile) {
    return { success: false, error: "Teacher profile not found." };
  }

  await prisma.teacherProfile.update({
    where: { id: profile.id },
    data: { status: newStatus, reviewNote: reviewNote || null },
  });

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      role: "teacher",
      teacherVerified: newStatus === "APPROVED",
      teacherStatus: newStatus,
    },
  });

  return { success: true };
}

// ─── Get Full Teacher Application ──────────────────────────────────

export type TeacherApplicationData = {
  user: { firstName: string | null; lastName: string | null; email: string; createdAt?: Date };
  profile: {
    bio: string | null;
    phone: string | null;
    gender: string | null;
    location: string | null;
    profilePhotoUrl: string | null;
    teachingMode: string;
    yearsOfExperience: number;
    languages: string | null;
    teachingLevels: string | null;
    status: string;
    reviewNote: string | null;
    createdAt: Date;
  };
  subjects: { name: string }[];
  qualifications: { title: string; field: string | null; institution: string | null; year: number | null }[];
  availability: { day: string; startTime: string; endTime: string }[];
};

export async function getTeacherApplication(
  teacherUserId: string
): Promise<TeacherApplicationData | null> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: teacherUserId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (!user) return null;

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    include: {
      subjects: { include: { subject: true } },
      qualifications: true,
      availability: true,
    },
  });
  if (!profile) return null;

  return {
    user,
    profile: {
      bio: profile.bio,
      phone: profile.phone,
      gender: profile.gender,
      location: profile.location,
      profilePhotoUrl: profile.profilePhotoUrl,
      teachingMode: profile.teachingMode,
      yearsOfExperience: profile.yearsOfExperience,
      languages: profile.languages,
      teachingLevels: profile.teachingLevels,
      status: profile.status,
      reviewNote: profile.reviewNote,
      createdAt: profile.createdAt,
    },
    subjects: profile.subjects.map((ts) => ({ name: ts.subject.name })),
    qualifications: profile.qualifications.map((q) => ({
      title: q.title,
      field: q.field,
      institution: q.institution,
      year: q.year,
    })),
    availability: profile.availability.map((a) => ({
      day: a.day,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };
}

// ─── Platform Stats ────────────────────────────────────────────────

export type PlatformStats = {
  suspendedTeachers: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  acceptedEnrollments: number;
  pendingEnrollments: number;
  totalAssignments: number;
  publishedAssignments: number;
  totalSubmissions: number;
  totalClasses: number;
  upcomingClasses: number;
  totalConversations: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  await requireAdmin();

  const [
    suspendedTeachers,
    totalCourses,
    publishedCourses,
    draftCourses,
    totalEnrollments,
    acceptedEnrollments,
    pendingEnrollments,
    totalAssignments,
    publishedAssignments,
    totalSubmissions,
    totalClasses,
    upcomingClasses,
    totalConversations,
  ] = await Promise.all([
    prisma.teacherProfile.count({ where: { status: "SUSPENDED" } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.course.count({ where: { status: "DRAFT" } }),
    prisma.courseEnrollment.count(),
    prisma.courseEnrollment.count({ where: { status: "ACCEPTED" } }),
    prisma.courseEnrollment.count({ where: { status: "PENDING" } }),
    prisma.assignment.count(),
    prisma.assignment.count({ where: { status: "PUBLISHED" } }),
    prisma.assignmentSubmission.count(),
    prisma.classSession.count(),
    prisma.classSession.count({ where: { startTime: { gte: new Date() } } }),
    prisma.conversation.count(),
  ]);

  return {
    suspendedTeachers,
    totalCourses,
    publishedCourses,
    draftCourses,
    totalEnrollments,
    acceptedEnrollments,
    pendingEnrollments,
    totalAssignments,
    publishedAssignments,
    totalSubmissions,
    totalClasses,
    upcomingClasses,
    totalConversations,
  };
}

// ─── Recent Activity ───────────────────────────────────────────────

export type ActivityEvent = {
  type: string;
  title: string;
  description: string;
  date: Date;
};

export async function getRecentActivity(): Promise<ActivityEvent[]> {
  await requireAdmin();

  const [teachers, courses, enrollments] = await Promise.all([
    prisma.teacherProfile.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.course.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        teacherProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        subject: { select: { name: true } },
      },
    }),
    prisma.courseEnrollment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        studentUser: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
    }),
  ]);

  const events: ActivityEvent[] = [];

  for (const t of teachers) {
    const name = [t.user.firstName, t.user.lastName].filter(Boolean).join(" ") || "Unknown";
    events.push({
      type: "NEW_TEACHER",
      title: "New Teacher Registered",
      description: `${name} registered as a teacher`,
      date: t.createdAt,
    });
  }

  for (const c of courses) {
    const teacherName =
      [c.teacherProfile.user.firstName, c.teacherProfile.user.lastName]
        .filter(Boolean)
        .join(" ") || "Unknown";
    events.push({
      type: "NEW_COURSE",
      title: "Course Created",
      description: `"${c.title}" by ${teacherName} (${c.subject.name})`,
      date: c.createdAt,
    });
  }

  for (const e of enrollments) {
    const studentName =
      [e.studentUser.firstName, e.studentUser.lastName].filter(Boolean).join(" ") || "Unknown";
    events.push({
      type: "NEW_ENROLLMENT",
      title: "Enrollment Request",
      description: `${studentName} enrolled in "${e.course.title}"`,
      date: e.createdAt,
    });
  }

  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  return events.slice(0, 10);
}

// ─── Teacher Detail ────────────────────────────────────────────────

export type TeacherDetail = TeacherApplicationData & {
  courseCount: number;
  enrolledStudentCount: number;
};

export async function getTeacherDetail(teacherUserId: string): Promise<TeacherDetail | null> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: teacherUserId },
    select: { firstName: true, lastName: true, email: true, createdAt: true },
  });
  if (!user) return null;

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    include: {
      subjects: { include: { subject: true } },
      qualifications: true,
      availability: true,
      courses: {
        select: {
          id: true,
          enrollments: { where: { status: "ACCEPTED" }, select: { id: true } },
        },
      },
    },
  });
  if (!profile) return null;

  const courseCount = profile.courses.length;
  const enrolledStudentCount = profile.courses.reduce(
    (sum, c) => sum + c.enrollments.length,
    0
  );

  return {
    user,
    profile: {
      bio: profile.bio,
      phone: profile.phone,
      gender: profile.gender,
      location: profile.location,
      profilePhotoUrl: profile.profilePhotoUrl,
      teachingMode: profile.teachingMode,
      yearsOfExperience: profile.yearsOfExperience,
      languages: profile.languages,
      teachingLevels: profile.teachingLevels,
      status: profile.status,
      reviewNote: profile.reviewNote,
      createdAt: profile.createdAt,
    },
    subjects: profile.subjects.map((ts) => ({ name: ts.subject.name })),
    qualifications: profile.qualifications.map((q) => ({
      title: q.title,
      field: q.field,
      institution: q.institution,
      year: q.year,
    })),
    availability: profile.availability.map((a) => ({
      day: a.day,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
    courseCount,
    enrolledStudentCount,
  };
}

// ─── Suspend / Unsuspend Teacher ───────────────────────────────────

export type TeacherActionResult =
  | { success: true }
  | { success: false; error: string };

export async function suspendTeacher(
  userId: string,
  reason: string
): Promise<TeacherActionResult> {
  const adminId = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, clerkUserId: true },
  });
  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Teacher not found." };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Teacher profile not found." };
  }

  await prisma.teacherProfile.update({
    where: { id: profile.id },
    data: { status: "SUSPENDED" },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminUserId: adminId,
      action: "TEACHER_SUSPENDED",
      targetType: "TeacherProfile",
      targetId: profile.id,
      reason,
    },
  });

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      role: "teacher",
      teacherVerified: false,
      teacherStatus: "SUSPENDED",
    },
  });

  return { success: true };
}

export async function unsuspendTeacher(userId: string): Promise<TeacherActionResult> {
  const adminId = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, clerkUserId: true },
  });
  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Teacher not found." };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Teacher profile not found." };
  }

  await prisma.teacherProfile.update({
    where: { id: profile.id },
    data: { status: "APPROVED" },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminUserId: adminId,
      action: "TEACHER_UNSUSPENDED",
      targetType: "TeacherProfile",
      targetId: profile.id,
      reason: null,
    },
  });

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      role: "teacher",
      teacherVerified: true,
      teacherStatus: "APPROVED",
    },
  });

  return { success: true };
}

// ─── Enhanced Students ─────────────────────────────────────────────

export type EnhancedStudentRow = StudentRow & {
  enrolledCount: number;
  submissionCount: number;
};

export type PaginatedEnhancedStudents = {
  data: EnhancedStudentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getStudentsEnhanced(
  search?: string,
  page: number = 1
): Promise<PaginatedEnhancedStudents> {
  await requireAdmin();

  const where: Record<string, unknown> = { role: "STUDENT" };

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { email: { contains: q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            enrollments: { where: { status: "ACCEPTED" } },
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      createdAt: u.createdAt,
      enrolledCount: u._count.enrollments,
      submissionCount: u._count.submissions,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Student Detail ────────────────────────────────────────────────

export type StudentDetail = {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    createdAt: Date;
  };
  enrollments: {
    id: string;
    status: string;
    requestedAt: Date;
    course: {
      title: string;
      teacherName: string;
    };
  }[];
  submissions: {
    id: string;
    status: string;
    marks: number | null;
    submittedAt: Date | null;
    assignmentTitle: string;
  }[];
};

export async function getStudentDetail(studentUserId: string): Promise<StudentDetail | null> {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: studentUserId },
    select: { firstName: true, lastName: true, email: true, createdAt: true },
  });
  if (!user) return null;

  const [enrollments, submissions] = await Promise.all([
    prisma.courseEnrollment.findMany({
      where: { studentUserId },
      select: {
        id: true,
        status: true,
        requestedAt: true,
        course: {
          select: {
            title: true,
            teacherProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.assignmentSubmission.findMany({
      where: { studentUserId },
      select: {
        id: true,
        status: true,
        marks: true,
        submittedAt: true,
        assignment: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    user,
    enrollments: enrollments.map((e) => ({
      id: e.id,
      status: e.status,
      requestedAt: e.requestedAt,
      course: {
        title: e.course.title,
        teacherName:
          [e.course.teacherProfile.user.firstName, e.course.teacherProfile.user.lastName]
            .filter(Boolean)
            .join(" ") || "Unknown",
      },
    })),
    submissions: submissions.map((s) => ({
      id: s.id,
      status: s.status,
      marks: s.marks,
      submittedAt: s.submittedAt,
      assignmentTitle: s.assignment.title,
    })),
  };
}

// ─── Courses ───────────────────────────────────────────────────────

export type CourseRow = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  teacherName: string;
  subjectName: string;
  studentCount: number;
  assignmentCount: number;
};

export type PaginatedCourses = {
  data: CourseRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getCourses(
  search?: string,
  status?: string,
  page: number = 1
): Promise<PaginatedCourses> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { title: { contains: q } },
      { teacherProfile: { user: { firstName: { contains: q } } } },
      { teacherProfile: { user: { lastName: { contains: q } } } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        teacherProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        subject: { select: { name: true } },
        _count: { select: { enrollments: true, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.course.count({ where }),
  ]);

  return {
    data: courses.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      createdAt: c.createdAt,
      teacherName:
        [c.teacherProfile.user.firstName, c.teacherProfile.user.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown",
      subjectName: c.subject.name,
      studentCount: c._count.enrollments,
      assignmentCount: c._count.assignments,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Course Detail ─────────────────────────────────────────────────

export type CourseDetail = {
  id: string;
  title: string;
  description: string | null;
  teachingLevel: string | null;
  teachingMode: string | null;
  location: string | null;
  maxStudents: number | null;
  status: string;
  createdAt: Date;
  teacherName: string;
  teacherVerified: string;
  subjectName: string;
  enrollments: {
    id: string;
    status: string;
    requestedAt: Date;
    studentName: string;
  }[];
  assignments: {
    id: string;
    title: string;
    status: string;
    dueDate: Date | null;
    submissionCount: number;
  }[];
  classes: {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    mode: string;
    status: string;
  }[];
};

export async function getCourseDetail(courseId: string): Promise<CourseDetail | null> {
  await requireAdmin();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacherProfile: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
      subject: { select: { name: true } },
      enrollments: {
        include: { studentUser: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      assignments: {
        include: { _count: { select: { submissions: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      classes: { orderBy: { startTime: "desc" }, take: 50 },
    },
  });
  if (!course) return null;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    teachingLevel: course.teachingLevel,
    teachingMode: course.teachingMode,
    location: course.location,
    maxStudents: course.maxStudents,
    status: course.status,
    createdAt: course.createdAt,
    teacherName:
      [course.teacherProfile.user.firstName, course.teacherProfile.user.lastName]
        .filter(Boolean)
        .join(" ") || "Unknown",
    teacherVerified: course.teacherProfile.status,
    subjectName: course.subject.name,
    enrollments: course.enrollments.map((e) => ({
      id: e.id,
      status: e.status,
      requestedAt: e.requestedAt,
      studentName:
        [e.studentUser.firstName, e.studentUser.lastName].filter(Boolean).join(" ") || "Unknown",
    })),
    assignments: course.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      dueDate: a.dueDate,
      submissionCount: a._count.submissions,
    })),
    classes: course.classes.map((c) => ({
      id: c.id,
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
      mode: c.mode,
      status: c.status,
    })),
  };
}

// ─── Archive Course ────────────────────────────────────────────────

export async function archiveCourse(courseId: string): Promise<TeacherActionResult> {
  const adminId = await requireAdmin();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, status: true },
  });
  if (!course) {
    return { success: false, error: "Course not found." };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "ARCHIVED" },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminUserId: adminId,
      action: "COURSE_ARCHIVED",
      targetType: "Course",
      targetId: courseId,
      reason: null,
    },
  });

  return { success: true };
}

// ─── Enrollments ───────────────────────────────────────────────────

export type EnrollmentRow = {
  id: string;
  courseId: string;
  status: string;
  requestedAt: Date;
  respondedAt: Date | null;
  studentName: string;
  courseTitle: string;
  teacherName: string;
};

export type PaginatedEnrollments = {
  data: EnrollmentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getEnrollments(
  search?: string,
  status?: string,
  page: number = 1
): Promise<PaginatedEnrollments> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { studentUser: { firstName: { contains: q } } },
      { studentUser: { lastName: { contains: q } } },
      { course: { title: { contains: q } } },
      {
        course: {
          teacherProfile: { user: { firstName: { contains: q } } },
        },
      },
      {
        course: {
          teacherProfile: { user: { lastName: { contains: q } } },
        },
      },
    ];
  }

  const [enrollments, total] = await Promise.all([
    prisma.courseEnrollment.findMany({
      where,
      include: {
        studentUser: { select: { firstName: true, lastName: true } },
        course: {
          select: {
            id: true,
            title: true,
            teacherProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.courseEnrollment.count({ where }),
  ]);

  return {
    data: enrollments.map((e) => ({
      id: e.id,
      courseId: e.course.id,
      status: e.status,
      requestedAt: e.requestedAt,
      respondedAt: e.respondedAt,
      studentName:
        [e.studentUser.firstName, e.studentUser.lastName].filter(Boolean).join(" ") || "Unknown",
      courseTitle: e.course.title,
      teacherName:
        [e.course.teacherProfile.user.firstName, e.course.teacherProfile.user.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown",
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Assignments ───────────────────────────────────────────────────

export type AssignmentRow = {
  id: string;
  title: string;
  status: string;
  dueDate: Date | null;
  maxMarks: number | null;
  courseTitle: string;
  teacherName: string;
  submissionCount: number;
};

export type PaginatedAssignments = {
  data: AssignmentRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getAssignments(
  search?: string,
  status?: string,
  page: number = 1
): Promise<PaginatedAssignments> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { title: { contains: q } },
      { course: { title: { contains: q } } },
      {
        course: {
          teacherProfile: { user: { firstName: { contains: q } } },
        },
      },
      {
        course: {
          teacherProfile: { user: { lastName: { contains: q } } },
        },
      },
    ];
  }

  const [assignments, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: {
            title: true,
            teacherProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.assignment.count({ where }),
  ]);

  return {
    data: assignments.map((a) => ({
      id: a.id,
      title: a.title,
      status: a.status,
      dueDate: a.dueDate,
      maxMarks: a.maxMarks,
      courseTitle: a.course.title,
      teacherName:
        [a.course.teacherProfile.user.firstName, a.course.teacherProfile.user.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown",
      submissionCount: a._count.submissions,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Assignment Detail ─────────────────────────────────────────────

export type AssignmentDetail = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxMarks: number | null;
  status: string;
  createdAt: Date;
  courseTitle: string;
  teacherName: string;
  submissionStats: {
    total: number;
    graded: number;
    notSubmitted: number;
  };
  submissions: {
    id: string;
    studentName: string;
    status: string;
    marks: number | null;
    submittedAt: Date | null;
  }[];
};

export async function getAssignmentDetail(
  assignmentId: string
): Promise<AssignmentDetail | null> {
  await requireAdmin();

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
        course: {
          select: {
            id: true,
            title: true,
            teacherProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      submissions: {
        include: { studentUser: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 200,
      },
    },
  });
  if (!assignment) return null;

  const total = assignment.submissions.length;
  const graded = assignment.submissions.filter((s) => s.status === "GRADED").length;
  const notSubmitted = assignment.submissions.filter(
    (s) => s.status === "NOT_SUBMITTED"
  ).length;

  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    maxMarks: assignment.maxMarks,
    status: assignment.status,
    createdAt: assignment.createdAt,
    courseTitle: assignment.course.title,
    teacherName:
      [assignment.course.teacherProfile.user.firstName, assignment.course.teacherProfile.user.lastName]
        .filter(Boolean)
        .join(" ") || "Unknown",
    submissionStats: { total, graded, notSubmitted },
    submissions: assignment.submissions.map((s) => ({
      id: s.id,
      studentName:
        [s.studentUser.firstName, s.studentUser.lastName].filter(Boolean).join(" ") || "Unknown",
      status: s.status,
      marks: s.marks,
      submittedAt: s.submittedAt,
    })),
  };
}

// ─── Classes ───────────────────────────────────────────────────────

export type ClassRow = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  mode: string;
  status: string;
  courseTitle: string;
  teacherName: string;
};

export type PaginatedClasses = {
  data: ClassRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getClasses(
  search?: string,
  filter?: string,
  page: number = 1
): Promise<PaginatedClasses> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (filter === "upcoming") {
    where.startTime = { gte: new Date() };
  } else if (filter === "past") {
    where.startTime = { lt: new Date() };
  } else if (filter === "online") {
    where.mode = "ONLINE";
  } else if (filter === "offline") {
    where.mode = "OFFLINE";
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { title: { contains: q } },
      { course: { title: { contains: q } } },
      {
        course: {
          teacherProfile: { user: { firstName: { contains: q } } },
        },
      },
      {
        course: {
          teacherProfile: { user: { lastName: { contains: q } } },
        },
      },
    ];
  }

  const [classes, total] = await Promise.all([
    prisma.classSession.findMany({
      where,
      include: {
        course: {
          select: {
            title: true,
            teacherProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
      orderBy: { startTime: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.classSession.count({ where }),
  ]);

  return {
    data: classes.map((c) => ({
      id: c.id,
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
      mode: c.mode,
      status: c.status,
      courseTitle: c.course.title,
      teacherName:
        [c.course.teacherProfile.user.firstName, c.course.teacherProfile.user.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown",
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Class Detail ──────────────────────────────────────────────────

export type ClassDetail = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  mode: string;
  location: string | null;
  meetingUrl: string | null;
  status: string;
  courseTitle: string;
  teacherName: string;
  enrolledStudentCount: number;
};

export async function getClassDetail(classId: string): Promise<ClassDetail | null> {
  await requireAdmin();

  const classSession = await prisma.classSession.findUnique({
    where: { id: classId },
    include: {
      course: {
        select: {
          title: true,
          teacherProfile: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          _count: { select: { enrollments: { where: { status: "ACCEPTED" } } } },
        },
      },
    },
  });
  if (!classSession) return null;

  return {
    id: classSession.id,
    title: classSession.title,
    description: classSession.description,
    startTime: classSession.startTime,
    endTime: classSession.endTime,
    mode: classSession.mode,
    location: classSession.location,
    meetingUrl: classSession.meetingUrl,
    status: classSession.status,
    courseTitle: classSession.course.title,
    teacherName:
      [classSession.course.teacherProfile.user.firstName, classSession.course.teacherProfile.user.lastName]
        .filter(Boolean)
        .join(" ") || "Unknown",
    enrolledStudentCount: classSession.course._count.enrollments,
  };
}

// ─── Upload Teacher Profile Photo (Admin) ──────────────────────────

export type UploadTeacherPhotoResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadTeacherPhoto(
  teacherUserId: string,
  formData: FormData
): Promise<UploadTeacherPhotoResult> {
  const clerkUserId = await requireAdmin();

  const adminUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!adminUser) {
    return { success: false, error: "Admin user not found." };
  }

  const user = await prisma.user.findUnique({
    where: { id: teacherUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Teacher not found." };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, profilePhotoUrl: true },
  });
  if (!profile) {
    return { success: false, error: "Teacher profile not found." };
  }

  const file = formData.get("photo") as File | null;
  if (!file) {
    return { success: false, error: "No file provided." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File size must be less than 5MB." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: "File must be an image (JPEG, PNG, WebP, or GIF)." };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `teacher-${profile.id}-${Date.now()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);

  const photoUrl = `/uploads/${filename}`;

  await prisma.teacherProfile.update({
    where: { id: profile.id },
    data: { profilePhotoUrl: photoUrl },
  });

  if (profile.profilePhotoUrl && profile.profilePhotoUrl.startsWith("/uploads/")) {
    const oldPath = path.join(process.cwd(), "public", profile.profilePhotoUrl);
    await unlink(oldPath).catch(() => {});
  }

  await prisma.adminAuditLog.create({
    data: {
      adminUserId: adminUser.id,
      action: "TEACHER_PHOTO_UPDATED",
      targetType: "TeacherProfile",
      targetId: profile.id,
      reason: `Admin updated profile photo for teacher`,
    },
  });

  return { success: true, url: photoUrl };
}

// ─── Audit Log ─────────────────────────────────────────────────────

export type AuditLogRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: Date;
  adminName: string;
};

export type PaginatedAuditLog = {
  data: AuditLogRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getAuditLog(
  action?: string,
  page: number = 1
): Promise<PaginatedAuditLog> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (action && action !== "ALL") {
    where.action = action;
  }

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: { adminUser: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return {
    data: logs.map((l) => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      reason: l.reason,
      createdAt: l.createdAt,
      adminName:
        [l.adminUser.firstName, l.adminUser.lastName].filter(Boolean).join(" ") || "Unknown",
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}
