import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('Teacher'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Students table
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  admissionNo: text('admission_no').notNull().unique(),
  name: text('name').notNull(),
  class: text('class').notNull(),
  gender: text('gender'),
  parentName: text('parent_name'),
  parentPhone: text('parent_phone'),
  parentEmail: text('parent_email'),
  address: text('address'),
  status: text('status').default('Active'),
  dateOfBirth: text('date_of_birth'),
  enrollmentDate: text('enrollment_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teachers table
export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  teacherId: text('teacher_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject'),
  classes: text('classes'),
  qualification: text('qualification'),
  status: text('status').default('Active'),
  joinDate: text('join_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Attendance records
export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  studentAdmissionNo: text('student_admission_no').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(), // 'Present' | 'Absent' | 'Late' | 'Excused'
  markedBy: text('marked_by'),
  classLevel: text('class_level'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Lesson notes
export const lessonNotes = pgTable('lesson_notes', {
  id: serial('id').primaryKey(),
  topic: text('topic').notNull(),
  subject: text('subject').notNull(),
  classLevel: text('class_level').notNull(),
  week: integer('week'),
  term: text('term'),
  content: text('content').notNull(),
  createdByUser: text('created_by_user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Exam questions
export const examQuestions = pgTable('exam_questions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  classLevel: text('class_level').notNull(),
  term: text('term'),
  questionsJson: text('questions_json').notNull(),
  createdByUser: text('created_by_user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Report cards
export const reportCards = pgTable('report_cards', {
  id: serial('id').primaryKey(),
  studentAdmissionNo: text('student_admission_no').notNull(),
  term: text('term').notNull(),
  session: text('session').notNull(),
  dataJson: text('data_json').notNull(),
  published: integer('published').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  method: text('method'),
  path: text('path'),
  status: integer('status'),
  durationMs: integer('duration_ms'),
  ip: text('ip'),
  user: text('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Schools table
export const schools = pgTable('schools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code'),
  adminEmail: text('admin_email'),
  owner: text('owner'),
  phone: text('phone'),
  plan: text('plan').default('Enterprise Pro'),
  status: text('status').default('Active'),
  domain: text('domain'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  schoolId: text('school_id'),
  payerName: text('payer_name'),
  payerEmail: text('payer_email'),
  amount: integer('amount').default(0),
  gateway: text('gateway'),
  transactionRef: text('transaction_ref'),
  status: text('status').default('Success'),
  paymentDate: text('payment_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// App Data Stores for full-application Cloud SQL persistence
export const appDataStores = pgTable('app_data_stores', {
  storeName: text('store_name').primaryKey(),
  dataJson: text('data_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  lessonNotes: many(lessonNotes),
  examQuestions: many(examQuestions),
}));
