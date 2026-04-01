import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// MS SQL Config
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'StudentGrades',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    instanceName: process.env.DB_INSTANCE || undefined,
  },
  // Support for Windows Authentication (NTLM)
  authentication: process.env.DB_AUTH_TYPE === 'ntlm' ? {
    type: 'ntlm',
    options: {
      userName: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      domain: process.env.DB_DOMAIN
    }
  } : undefined
};

// --- MOCK DATA FOR DEMO MODE ---
let mockStudents = [
  { StudentID: 1, Name: "Nguyễn Văn A (Demo)", DateOfBirth: "2000-01-01", Class: "CNTT1" },
  { StudentID: 2, Name: "Trần Thị B (Demo)", DateOfBirth: "2000-05-15", Class: "CNTT1" }
];
let mockSubjects = [
  { SubjectID: 1, SubjectName: "Toán Cao Cấp (Demo)" },
  { SubjectID: 2, SubjectName: "Lập Trình C++ (Demo)" }
];
let mockScores = [
  { ScoreID: 1, StudentID: 1, StudentName: "Nguyễn Văn A (Demo)", SubjectID: 1, SubjectName: "Toán Cao Cấp (Demo)", Score: 8.5 }
];

let useMockData = true; // Default to true until connection succeeds
let dbPool: sql.ConnectionPool | null = null;
let connectionAttempted = false;

// Helper to get DB connection
async function getPool() {
  if (dbPool) return dbPool;
  if (connectionAttempted && useMockData) return null;

  try {
    console.log('🔌 Đang thử kết nối SQL Server...');
    connectionAttempted = true;
    dbPool = await sql.connect({
      ...sqlConfig,
      connectionTimeout: 5000, // Thử trong 5 giây thôi
      requestTimeout: 5000
    });
    useMockData = false;
    console.log('✅ Kết nối SQL Server thành công!');
    return dbPool;
  } catch (err) {
    useMockData = true;
    console.warn('⚠️ Không thể kết nối SQL Server. Đã chuyển sang CHẾ ĐỘ DEMO.');
    return null;
  }
}

// Thử kết nối ngay khi khởi động server
getPool();

// --- API ROUTES ---

app.get("/api/db-status", (req, res) => {
  res.json({ isDemo: useMockData });
});

// Students CRUD
app.get("/api/students", async (req, res) => {
  try {
    const pool = await getPool();
    if (useMockData) return res.json(mockStudents);
    const result = await pool!.request().query("SELECT * FROM Students");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/students", async (req, res) => {
  const { Name, DateOfBirth, Class } = req.body;
  try {
    const pool = await getPool();
    if (useMockData) {
      const newStudent = { StudentID: mockStudents.length + 1, Name, DateOfBirth, Class };
      mockStudents.push(newStudent);
      return res.status(201).json({ message: "Student added (Demo)" });
    }
    await pool!.request()
      .input('Name', sql.NVarChar, Name)
      .input('DateOfBirth', sql.Date, DateOfBirth)
      .input('Class', sql.NVarChar, Class)
      .query("INSERT INTO Students (Name, DateOfBirth, Class) VALUES (@Name, @DateOfBirth, @Class)");
    res.status(201).json({ message: "Student added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  const { Name, DateOfBirth, Class } = req.body;
  try {
    const pool = await getPool();
    if (useMockData) {
      const index = mockStudents.findIndex(s => s.StudentID === parseInt(id));
      if (index !== -1) {
        mockStudents[index] = { ...mockStudents[index], Name, DateOfBirth, Class };
        return res.json({ message: "Student updated (Demo)" });
      }
      return res.status(404).json({ error: "Student not found" });
    }
    await pool!.request()
      .input('id', sql.Int, id)
      .input('Name', sql.NVarChar, Name)
      .input('DateOfBirth', sql.Date, DateOfBirth)
      .input('Class', sql.NVarChar, Class)
      .query("UPDATE Students SET Name = @Name, DateOfBirth = @DateOfBirth, Class = @Class WHERE StudentID = @id");
    res.json({ message: "Student updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    if (useMockData) {
      mockStudents = mockStudents.filter(s => s.StudentID !== parseInt(id));
      return res.json({ message: "Student deleted (Demo)" });
    }
    await pool!.request()
      .input('id', sql.Int, id)
      .query("DELETE FROM Students WHERE StudentID = @id");
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subjects CRUD
app.get("/api/subjects", async (req, res) => {
  try {
    const pool = await getPool();
    if (useMockData) return res.json(mockSubjects);
    const result = await pool!.request().query("SELECT * FROM Subjects");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/subjects", async (req, res) => {
  const { SubjectName } = req.body;
  try {
    const pool = await getPool();
    if (useMockData) {
      const newSubject = { SubjectID: mockSubjects.length + 1, SubjectName };
      mockSubjects.push(newSubject);
      return res.status(201).json({ message: "Subject added (Demo)" });
    }
    await pool!.request()
      .input('SubjectName', sql.NVarChar, SubjectName)
      .query("INSERT INTO Subjects (SubjectName) VALUES (@SubjectName)");
    res.status(201).json({ message: "Subject added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/subjects/:id", async (req, res) => {
  const { id } = req.params;
  const { SubjectName } = req.body;
  try {
    const pool = await getPool();
    if (useMockData) {
      const index = mockSubjects.findIndex(s => s.SubjectID === parseInt(id));
      if (index !== -1) {
        mockSubjects[index] = { ...mockSubjects[index], SubjectName };
        return res.json({ message: "Subject updated (Demo)" });
      }
      return res.status(404).json({ error: "Subject not found" });
    }
    await pool!.request()
      .input('id', sql.Int, id)
      .input('SubjectName', sql.NVarChar, SubjectName)
      .query("UPDATE Subjects SET SubjectName = @SubjectName WHERE SubjectID = @id");
    res.json({ message: "Subject updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/subjects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    if (useMockData) {
      mockSubjects = mockSubjects.filter(s => s.SubjectID !== parseInt(id));
      return res.json({ message: "Subject deleted (Demo)" });
    }
    await pool!.request()
      .input('id', sql.Int, id)
      .query("DELETE FROM Subjects WHERE SubjectID = @id");
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scores CRUD
app.get("/api/scores", async (req, res) => {
  try {
    const pool = await getPool();
    if (useMockData) return res.json(mockScores);
    const result = await pool!.request().query(`
      SELECT s.ScoreID, s.Score, st.Name as StudentName, st.StudentID, sub.SubjectName, sub.SubjectID
      FROM Scores s
      JOIN Students st ON s.StudentID = st.StudentID
      JOIN Subjects sub ON s.SubjectID = sub.SubjectID
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/scores", async (req, res) => {
  const { StudentID, SubjectID, Score } = req.body;
  try {
    const pool = await getPool();
    if (useMockData) {
      const student = mockStudents.find(s => s.StudentID === parseInt(StudentID));
      const subject = mockSubjects.find(s => s.SubjectID === parseInt(SubjectID));
      const newScore = {
        ScoreID: mockScores.length + 1,
        StudentID: parseInt(StudentID),
        StudentName: student ? student.Name : "Unknown",
        SubjectID: parseInt(SubjectID),
        SubjectName: subject ? subject.SubjectName : "Unknown",
        Score: parseFloat(Score)
      };
      mockScores.push(newScore);
      return res.status(201).json({ message: "Score added (Demo)" });
    }
    await pool!.request()
      .input('StudentID', sql.Int, StudentID)
      .input('SubjectID', sql.Int, SubjectID)
      .input('Score', sql.Float, Score)
      .query("INSERT INTO Scores (StudentID, SubjectID, Score) VALUES (@StudentID, @SubjectID, @Score)");
    res.status(201).json({ message: "Score added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/scores/:id", async (req, res) => {
  const { id } = req.params;
  const { Score } = req.body;
  try {
    const pool = await getPool();
    if (useMockData) {
      const index = mockScores.findIndex(s => s.ScoreID === parseInt(id));
      if (index !== -1) {
        mockScores[index] = { ...mockScores[index], Score: parseFloat(Score) };
        return res.json({ message: "Score updated (Demo)" });
      }
      return res.status(404).json({ error: "Score not found" });
    }
    await pool!.request()
      .input('id', sql.Int, id)
      .input('Score', sql.Float, Score)
      .query("UPDATE Scores SET Score = @Score WHERE ScoreID = @id");
    res.json({ message: "Score updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/scores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    if (useMockData) {
      mockScores = mockScores.filter(s => s.ScoreID !== parseInt(id));
      return res.json({ message: "Score deleted (Demo)" });
    }
    await pool!.request()
      .input('id', sql.Int, id)
      .query("DELETE FROM Scores WHERE ScoreID = @id");
    res.json({ message: "Score deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
