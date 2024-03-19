import { exec } from "child_process";

const ports = ["3000", "3001", "3002", "9527"];

ports.forEach((port) => {
  let command;

  if (process.platform === "win32") {
    // Windows version: use netstat and taskkill
    command = `FOR /F "tokens=5" %a IN ('netstat -aon ^| findstr :${port}') DO Taskkill /PID %a /F`;
  } else {
    // Unix version: use lsof and kill
    command = `lsof -ti:${port} | xargs kill -9`;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`Could not kill process on port ${port}: ${error.message}`);
    } else {
      console.log(`Killed process on port ${port}`);
    }
  });
});
