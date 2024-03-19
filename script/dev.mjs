import { spawn } from "child_process";

// 执行 turbo run dev --filter hub -- -p 3000
spawn("turbo", ["run", "dev", "--filter", "hub", "--", "-p", "3000"], {
  stdio: "inherit",
});

// 切换到 web 目录并执行 cargo run
spawn("cargo", ["run"], { cwd: "./web", stdio: "inherit" });

// 切换到 interactor 目录并执行 cargo run
spawn("cargo", ["run"], { cwd: "./interactor", stdio: "inherit" });

// 切换到 recorder 目录并执行 cargo run
spawn("cargo", ["run"], { cwd: "./recorder", stdio: "inherit" });
