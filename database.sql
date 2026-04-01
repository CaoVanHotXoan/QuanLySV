# SQL Script to create the database and tables

/*
CREATE DATABASE StudentGrades;
GO

USE StudentGrades;
GO
*/

-- Create Students table
CREATE TABLE Students (
    StudentID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    DateOfBirth DATE,
    Class NVARCHAR(50)
);

-- Create Subjects table
CREATE TABLE Subjects (
    SubjectID INT PRIMARY KEY IDENTITY(1,1),
    SubjectName NVARCHAR(100) NOT NULL
);

-- Create Scores table
CREATE TABLE Scores (
    ScoreID INT PRIMARY KEY IDENTITY(1,1),
    StudentID INT FOREIGN KEY REFERENCES Students(StudentID) ON DELETE CASCADE,
    SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID) ON DELETE CASCADE,
    Score FLOAT CHECK (Score >= 0 AND Score <= 10)
);

-- Insert sample data
INSERT INTO Students (Name, DateOfBirth, Class) VALUES 
('Nguyen Van A', '2000-01-01', 'CNTT1'),
('Tran Thi B', '2000-05-15', 'CNTT1'),
('Le Van C', '2000-10-20', 'CNTT2');

INSERT INTO Subjects (SubjectName) VALUES 
('Toan Cao Cap'),
('Lap Trinh C++'),
('Co So Du Lieu');

INSERT INTO Scores (StudentID, SubjectID, Score) VALUES 
(1, 1, 8.5),
(1, 2, 9.0),
(2, 1, 7.0),
(2, 3, 8.0);
