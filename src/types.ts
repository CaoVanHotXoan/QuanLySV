export interface Student {
  StudentID: number;
  Name: string;
  DateOfBirth: string;
  Class: string;
}

export interface Subject {
  SubjectID: number;
  SubjectName: string;
}

export interface Score {
  ScoreID: number;
  StudentID: number;
  StudentName: string;
  SubjectID: number;
  SubjectName: string;
  Score: number;
}
