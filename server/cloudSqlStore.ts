import { db, createPool } from "../src/db/index.ts";
import { appDataStores, users, students, teachers, lessonNotes, examQuestions, reportCards, auditLogs } from "../src/db/schema.ts";
import { eq, sql } from "drizzle-orm";

interface RegisteredStore {
  name: string;
  getData: () => unknown;
  setData: (items: unknown) => void;
}

const registeredStores: RegisteredStore[] = [];
let syncSuccessLogged = false;
let lastSyncError: string | null = null;
let consecutiveFailures = 0;
let isSyncing = false;
let queuedSync = false;

export function registerStore(
  name: string,
  getData: () => unknown,
  setData: (items: unknown) => void
): void {
  const existingIdx = registeredStores.findIndex(s => s.name === name);
  if (existingIdx >= 0) {
    registeredStores[existingIdx] = { name, getData, setData };
  } else {
    registeredStores.push({ name, getData, setData });
  }
}

export function registerArraySync(name: string, arr: any[]): void {
  registerStore(
    name,
    () => arr,
    (items) => {
      if (Array.isArray(items)) {
        arr.length = 0;
        arr.push(...items);
      }
    }
  );
}

export function registerRecordSync(name: string, record: Record<string, any>): void {
  registerStore(
    name,
    () => record,
    (data) => {
      if (data && typeof data === "object" && !Array.isArray(data)) {
        Object.keys(record).forEach((k) => delete record[k]);
        Object.assign(record, data);
      }
    }
  );
}

export function getRegisteredStoreCount(): number {
  return registeredStores.length;
}

export function getCloudSqlSyncStatus(): {
  storeCount: number;
  lastError: string | null;
  consecutiveFailures: number;
} {
  return {
    storeCount: registeredStores.length,
    lastError: lastSyncError,
    consecutiveFailures,
  };
}

let schemaEnsured = false;
let cloudSqlDisabled = !process.env.ENABLE_CLOUD_SQL || process.env.ENABLE_CLOUD_SQL !== "true";

export async function ensureCloudSqlSchema(): Promise<void> {
  if (schemaEnsured || cloudSqlDisabled) return;
  if (!process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_DB_NAME || process.env.ENABLE_CLOUD_SQL !== "true") {
    cloudSqlDisabled = true;
    return;
  }

  try {
    const pool = createPool();
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS app_data_stores (
          store_name TEXT PRIMARY KEY,
          data_json TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          name TEXT,
          role TEXT DEFAULT 'Teacher',
          photo_url TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          admission_no TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          class TEXT NOT NULL,
          gender TEXT,
          parent_name TEXT,
          parent_phone TEXT,
          parent_email TEXT,
          address TEXT,
          status TEXT DEFAULT 'Active',
          date_of_birth TEXT,
          enrollment_date TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS teachers (
          id SERIAL PRIMARY KEY,
          teacher_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          subject TEXT,
          classes TEXT,
          qualification TEXT,
          status TEXT DEFAULT 'Active',
          join_date TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS attendance (
          id SERIAL PRIMARY KEY,
          student_admission_no TEXT NOT NULL,
          date TEXT NOT NULL,
          status TEXT NOT NULL,
          marked_by TEXT,
          class_level TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS lesson_notes (
          id SERIAL PRIMARY KEY,
          topic TEXT NOT NULL,
          subject TEXT NOT NULL,
          class_level TEXT NOT NULL,
          week INTEGER,
          term TEXT,
          content TEXT NOT NULL,
          created_by_user TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS exam_questions (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          class_level TEXT NOT NULL,
          term TEXT,
          questions_json TEXT NOT NULL,
          created_by_user TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS report_cards (
          id SERIAL PRIMARY KEY,
          student_admission_no TEXT NOT NULL,
          term TEXT NOT NULL,
          session TEXT NOT NULL,
          data_json TEXT NOT NULL,
          published INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          method TEXT,
          path TEXT,
          status INTEGER,
          duration_ms INTEGER,
          ip TEXT,
          "user" TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS schools (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT,
          admin_email TEXT,
          owner TEXT,
          phone TEXT,
          plan TEXT DEFAULT 'Enterprise Pro',
          status TEXT DEFAULT 'Active',
          domain TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          school_id TEXT,
          payer_name TEXT,
          payer_email TEXT,
          amount INTEGER DEFAULT 0,
          gateway TEXT,
          transaction_ref TEXT,
          status TEXT DEFAULT 'Success',
          payment_date TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      schemaEnsured = true;
      console.log("[Cloud SQL] Schema auto-created / verified successfully.");
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn("[Cloud SQL] Notice auto-creating schema:", err?.message || err);
  }
}

/**
 * Hydrate in-memory stores from PostgreSQL Cloud SQL database on server startup.
 */
export async function hydrateStoresFromCloudSql(): Promise<void> {
  if (cloudSqlDisabled) return;
  if (!process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_DB_NAME) {
    cloudSqlDisabled = true;
    return;
  }

  await ensureCloudSqlSchema();
  if (cloudSqlDisabled) return;

  try {
    const rows = await db.select().from(appDataStores);
    if (!rows || rows.length === 0) {
      console.log("[Cloud SQL] No existing stores in database yet. Seeding Cloud SQL with initial memory state...");
      await syncStoresToCloudSql();
      return;
    }

    const rowMap = new Map<string, string>();
    for (const r of rows) {
      rowMap.set(r.storeName, r.dataJson);
    }

    let hydratedCount = 0;
    for (const store of registeredStores) {
      const raw = rowMap.get(store.name);
      if (!raw) continue;

      try {
        let parsed = JSON.parse(raw);
        if (parsed !== undefined && parsed !== null) {
          if (Array.isArray(parsed)) {
            const DEMO_EMAILS = new Set([
              "admin@livingstone.edu",
              "admin@livingstone.edu.ng",
              "admin@school.com",
              "admin",
              "principal@livingstone.edu",
              "david.alabi@livingstone.edu",
              "beatrice.okonkwo@livingstone.edu",
              "bursar@livingstone.edu",
              "exam.officer@livingstone.edu",
              "abubakar.musa@gmail.com",
              "peter.obioma@destiny.edu.ng",
              "folake.balogun@destiny.edu.ng",
              "ibrahim.danjuma@destiny.edu.ng",
            ]);
            const DEMO_IDS = new Set([
              "usr-1",
              "usr-1-ng",
              "usr-001",
              "usr-002",
              "usr-003",
              "usr-004",
              "usr-005",
              "usr-006",
              "usr-destiny-admin",
              "usr-destiny-admin-2",
              "usr-admin-alias",
              "usr-admin-school",
              "STD-2026-001",
              "STD-2026-002",
              "STD-2026-003",
              "STD-2026-004",
              "STD-2026-005",
              "STD-2026-006",
              "inv-901",
              "inv-902",
              "inv-903",
              "b-1",
              "b-2",
              "b-3",
              "b-4",
            ]);
            parsed = (parsed as any[]).filter((item) => {
              if (!item || typeof item !== "object") return false;
              if (item.isDemo) return false;
              const id = String(item.id || item.uid || item.studentId || "").trim();
              const email = String(item.email || "").toLowerCase().trim();
              if (DEMO_IDS.has(id)) return false;
              if (email && DEMO_EMAILS.has(email)) return false;
              if (email.endsWith("@destiny.edu.ng") || (email.endsWith("@livingstone.edu") && !email.includes("livingstoneedu64@gmail.com"))) return false;
              return true;
            });
          }
          store.setData(parsed);
          hydratedCount++;
        }
      } catch (parseErr) {
        console.warn(`[Cloud SQL] Failed to parse JSON for store ${store.name}:`, parseErr);
      }
    }

    console.log(`[Cloud SQL] Successfully hydrated ${hydratedCount} stores from Cloud SQL database.`);
  } catch (err: any) {
    cloudSqlDisabled = true;
    console.warn("[Cloud SQL] Connection unavailable. Disabling Cloud SQL sync/hydration, using Firebase RTDB authoritative storage:", err?.message || err);
  }
}

/**
 * Persist all registered application stores into Cloud SQL database.
 */
export async function syncStoresToCloudSql(): Promise<void> {
  if (cloudSqlDisabled) return;
  if (!process.env.SQL_HOST || !process.env.SQL_USER || !process.env.SQL_DB_NAME) {
    cloudSqlDisabled = true;
    return;
  }
  if (isSyncing) {
    queuedSync = true;
    return;
  }
  isSyncing = true;

  await ensureCloudSqlSchema();
  if (cloudSqlDisabled) {
    isSyncing = false;
    return;
  }

  try {
    const pool = createPool();
    const storesToSave = registeredStores.map((s) => ({
      name: s.name,
      json: JSON.stringify(s.getData()),
    }));

    if (storesToSave.length === 0) {
      isSyncing = false;
      return;
    }

    // Execute bulk upsert in transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const s of storesToSave) {
        await client.query(
          `INSERT INTO app_data_stores (store_name, data_json, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (store_name)
           DO UPDATE SET data_json = EXCLUDED.data_json, updated_at = NOW()`,
          [s.name, s.json]
        );
      }

      // Synchronize key stores to structured relational tables in Cloud SQL
      const usersStoreData = (registeredStores.find((s) => s.name === "users")?.getData() as any[]) || [];
      const staffAccountsData = (registeredStores.find((s) => s.name === "staffAccounts")?.getData() as any[]) || [];
      const verifiedSchoolsData = (registeredStores.find((s) => s.name === "verifiedSchools")?.getData() as any[]) || [];

      const allUsersToSync: Array<{ uid: string; email: string; name: string; role: string }> = [];
      const seenUids = new Set<string>();

      for (const u of usersStoreData) {
        const uid = u.uid || u.id || (u.email ? `usr-${u.email}` : "");
        if (uid && !seenUids.has(uid)) {
          seenUids.add(uid);
          allUsersToSync.push({
            uid,
            email: u.email || "",
            name: u.name || u.fullName || "",
            role: u.role || u.assignedRole || "User"
          });
        }
      }

      for (const st of staffAccountsData) {
        const uid = st.uid || st.id || (st.email ? `usr-${st.email}` : "");
        if (uid && !seenUids.has(uid)) {
          seenUids.add(uid);
          allUsersToSync.push({
            uid,
            email: st.email || "",
            name: st.name || st.fullName || "",
            role: st.role || st.assignedRole || "Staff"
          });
        }
      }

      for (const sch of verifiedSchoolsData) {
        if (sch.admin?.email) {
          const uid = `usr-${sch.admin.email}`;
          if (!seenUids.has(uid)) {
            seenUids.add(uid);
            allUsersToSync.push({
              uid,
              email: sch.admin.email,
              name: sch.admin.name || "Administrator",
              role: sch.admin.role || "Principal"
            });
          }
        }
      }

       if (allUsersToSync.length > 0) {
        await client.query("DELETE FROM users").catch(() => {});
        for (const u of allUsersToSync) {
          await client.query(
            `INSERT INTO users (uid, email, name, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (uid) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role`,
            [u.uid, u.email, u.name, u.role]
          ).catch(() => {});
        }
      }

      const studentsStoreData = registeredStores.find((s) => s.name === "students")?.getData();
      if (Array.isArray(studentsStoreData)) {
        await client.query("DELETE FROM students").catch(() => {});
        for (const st of studentsStoreData) {
          if (st.admissionNo || st.id) {
            await client.query(
              `INSERT INTO students (admission_no, name, class, gender, parent_name, parent_phone, parent_email, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (admission_no) DO UPDATE SET name = EXCLUDED.name, class = EXCLUDED.class, gender = EXCLUDED.gender, parent_name = EXCLUDED.parent_name, parent_phone = EXCLUDED.parent_phone, parent_email = EXCLUDED.parent_email, status = EXCLUDED.status`,
              [
                st.admissionNo || st.id || `ADM-${Date.now()}`,
                st.name || "",
                st.class || st.className || "",
                st.gender || "Not Specified",
                st.parentName || "",
                st.parentPhone || "",
                st.parentEmail || "",
                st.status || "Active",
              ]
            ).catch(() => {});
          }
        }
      }

      const teachersStoreData = registeredStores.find((s) => s.name === "teachers")?.getData();
      if (Array.isArray(teachersStoreData)) {
        await client.query("DELETE FROM teachers").catch(() => {});
        for (const t of teachersStoreData) {
          if (t.teacherId || t.staffId || t.id || t.email) {
            await client.query(
              `INSERT INTO teachers (teacher_id, name, email, phone, subject, classes, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (teacher_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, subject = EXCLUDED.subject, classes = EXCLUDED.classes, status = EXCLUDED.status`,
              [
                t.teacherId || t.staffId || t.id || `TCH-${Date.now()}`,
                t.name || "",
                t.email || "",
                t.phone || "",
                t.subject || t.subjectSpecialization || "",
                t.classes || t.assignedClass || "",
                t.status || "Active",
              ]
            ).catch(() => {});
          }
        }
      }

      // Synchronize lesson notes to relational table
      const lessonNotesData = registeredStores.find((s) => s.name === "lessonNotes")?.getData() || [];
      const teacherLessonsData = registeredStores.find((s) => s.name === "teacherLessons")?.getData() || [];
      const allLessons = [...(Array.isArray(lessonNotesData) ? lessonNotesData : []), ...(Array.isArray(teacherLessonsData) ? teacherLessonsData : [])];
      await client.query("DELETE FROM lesson_notes").catch(() => {});
      for (const l of allLessons) {
        if (l.topic || l.subject) {
          await client.query(
            `INSERT INTO lesson_notes (topic, subject, class_level, week, term, content, created_by_user)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              l.topic || "General Topic",
              l.subject || "General",
              l.classLevel || l.class || "General",
              parseInt(l.week) || 1,
              l.term || "First Term",
              l.content || "",
              l.teacherName || l.createdByUser || "Teacher"
            ]
          ).catch(() => {});
        }
      }

      // Synchronize exam questions to relational table
      const cbtExamsData = registeredStores.find((s) => s.name === "cbtExams")?.getData() || [];
      const teacherExamsData = registeredStores.find((s) => s.name === "teacherExams")?.getData() || [];
      const questionBankData = registeredStores.find((s) => s.name === "questionBank")?.getData() || [];
      const allExams = [
        ...(Array.isArray(cbtExamsData) ? cbtExamsData : []),
        ...(Array.isArray(teacherExamsData) ? teacherExamsData : []),
        ...(Array.isArray(questionBankData) ? questionBankData : [])
      ];
      await client.query("DELETE FROM exam_questions").catch(() => {});
      for (const ex of allExams) {
        if (ex.title || ex.subject || ex.question) {
          await client.query(
            `INSERT INTO exam_questions (title, subject, class_level, term, questions_json, created_by_user)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              ex.title || ex.question || "Exam Question",
              ex.subject || "General",
              ex.classLevel || ex.class || "General",
              ex.term || "First Term",
              JSON.stringify(ex.questions || ex.options || ex),
              ex.createdByUser || ex.teacherName || "Teacher"
            ]
          ).catch(() => {});
        }
      }

      // Synchronize attendance to relational table
      const attendanceData = registeredStores.find((s) => s.name === "attendanceRegister")?.getData() || [];
      const teacherAttendanceData = registeredStores.find((s) => s.name === "teacherAttendance")?.getData() || [];
      const allAttendance = [...(Array.isArray(attendanceData) ? attendanceData : []), ...(Array.isArray(teacherAttendanceData) ? teacherAttendanceData : [])];
      await client.query("DELETE FROM attendance").catch(() => {});
      for (const att of allAttendance) {
        if (Array.isArray(att.records)) {
          for (const rec of att.records) {
            await client.query(
              `INSERT INTO attendance (student_admission_no, date, status, marked_by, class_level)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                rec.admissionNo || rec.studentId || "STD-001",
                att.date || new Date().toISOString().split("T")[0],
                rec.status || "Present",
                att.takenBy || att.markedBy || "Teacher",
                att.class || att.classLevel || "General"
              ]
            ).catch(() => {});
          }
        } else if (att.studentAdmissionNo || att.admissionNo) {
          await client.query(
            `INSERT INTO attendance (student_admission_no, date, status, marked_by, class_level)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              att.studentAdmissionNo || att.admissionNo,
              att.date || new Date().toISOString().split("T")[0],
              att.status || "Present",
              att.markedBy || "Teacher",
              att.classLevel || "General"
            ]
          ).catch(() => {});
        }
      }

      // Synchronize schools to relational table
      if (Array.isArray(verifiedSchoolsData)) {
        await client.query("DELETE FROM schools").catch(() => {});
        for (const sch of verifiedSchoolsData) {
          if (sch.id || sch.name) {
            await client.query(
              `INSERT INTO schools (id, name, code, admin_email, owner, phone, plan, status, domain)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, admin_email = EXCLUDED.admin_email, owner = EXCLUDED.owner, phone = EXCLUDED.phone, plan = EXCLUDED.plan, status = EXCLUDED.status, domain = EXCLUDED.domain`,
              [
                sch.id || `SCH-${Date.now()}`,
                sch.name || "School",
                sch.code || sch.id || "",
                sch.admin?.email || sch.adminEmail || "",
                sch.admin?.name || sch.owner || "",
                sch.admin?.phone || sch.phone || "",
                sch.plan || "Enterprise Pro",
                sch.status || "Active",
                sch.domain || ""
              ]
            ).catch(() => {});
          }
        }
      }

      // Synchronize payments to relational table
      const superAdminPaymentsData = registeredStores.find((s) => s.name === "superAdminPayments")?.getData();
      if (Array.isArray(superAdminPaymentsData)) {
        await client.query("DELETE FROM payments");
        for (const pay of superAdminPaymentsData) {
          if (pay.id || pay.transactionRef) {
            await client.query(
              `INSERT INTO payments (id, school_id, payer_name, payer_email, amount, gateway, transaction_ref, status, payment_date)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, status = EXCLUDED.status`,
              [
                pay.id || pay.transactionRef || `PAY-${Date.now()}`,
                pay.schoolId || "SCH-101",
                pay.payerName || "Payer",
                pay.payerEmail || "",
                parseInt(pay.amount) || 0,
                pay.gateway || pay.paymentMethod || "Paystack",
                pay.transactionRef || pay.id || "",
                pay.status || "Success",
                pay.paymentDate || new Date().toISOString()
              ]
            ).catch(() => {});
          }
        }
      }

      // Synchronize audit logs to relational table
      const auditLogsData = registeredStores.find((s) => s.name === "auditLogs")?.getData() || [];
      if (Array.isArray(auditLogsData) && auditLogsData.length > 0) {
        await client.query("DELETE FROM audit_logs");
        for (const log of auditLogsData.slice(0, 100)) {
          await client.query(
            `INSERT INTO audit_logs (method, path, status, duration_ms, ip, "user")
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              log.method || "GET",
              log.path || "/api",
              log.status || 200,
              log.durationMs || 0,
              log.ip || "127.0.0.1",
              log.user || "User"
            ]
          ).catch(() => {});
        }
      }

      await client.query("COMMIT");

      lastSyncError = null;
      consecutiveFailures = 0;
      if (!syncSuccessLogged) {
        console.log(`[Cloud SQL] First successful sync — ${storesToSave.length} stores written to Cloud SQL database.`);
        syncSuccessLogged = true;
      }
    } catch (txErr: any) {
      await client.query("ROLLBACK").catch(() => {});
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    cloudSqlDisabled = true;
    consecutiveFailures++;
    lastSyncError = err?.message || String(err);
    console.warn("[Cloud SQL] Connection/query failed. Disabling Cloud SQL sync, using Firebase RTDB authoritative storage:", err?.message || err);
  } finally {
    isSyncing = false;
    if (queuedSync) {
      queuedSync = false;
      setTimeout(() => syncStoresToCloudSql().catch(() => {}), 150);
    }
  }
}

/**
 * Health check for Cloud SQL connection and store persistence.
 */
export async function getCloudSqlHealth(): Promise<{
  success: boolean;
  cloudSql: string;
  database: string;
  registeredStores: number;
  syncStatus: string;
  lastSyncError: string | null;
  consecutiveFailures: number;
  error?: string;
}> {
  if (!process.env.SQL_HOST || !process.env.SQL_USER) {
    return {
      success: false,
      cloudSql: "not_configured",
      database: "none",
      registeredStores: registeredStores.length,
      syncStatus: "unconfigured",
      lastSyncError: "Missing SQL environment variables",
      consecutiveFailures,
    };
  }

  try {
    const pool = createPool();
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return {
        success: true,
        cloudSql: "connected",
        database: process.env.SQL_DB_NAME || "cloudsql",
        registeredStores: registeredStores.length,
        syncStatus: consecutiveFailures > 0 ? `failing (${consecutiveFailures} consecutive)` : "healthy",
        lastSyncError,
        consecutiveFailures,
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return {
      success: false,
      cloudSql: "error",
      database: process.env.SQL_DB_NAME || "cloudsql",
      registeredStores: registeredStores.length,
      syncStatus: "error",
      lastSyncError: err?.message || String(err),
      consecutiveFailures,
      error: err?.message || String(err),
    };
  }
}

/**
 * Execute a transaction block against Cloud SQL PostgreSQL instance.
 */
export async function executeInCloudSqlTx<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
