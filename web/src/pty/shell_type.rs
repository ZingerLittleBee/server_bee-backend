use std::env;

#[derive(Debug)]
pub enum ShellType {
    Zsh,
    Bash,
    Sh,
    Powershell,
    Cmd,
}

impl Default for ShellType {
    fn default() -> Self {
        #[cfg(not(target_os = "windows"))]
        match env::var("SHELL") {
            Ok(shell) => {
                if shell.ends_with("zsh") {
                    ShellType::Zsh
                } else if shell.ends_with("bash") {
                    ShellType::Bash
                } else {
                    #[cfg(target_os = "macos")]
                    return ShellType::Zsh;

                    #[cfg(target_os = "linux")]
                    return ShellType::Sh;
                }
            }
            Err(_) => ShellType::Sh,
        }

        #[cfg(target_os = "windows")]
        ShellType::Powershell
    }
}

impl ShellType {
    pub fn to_str(&self) -> &str {
        match self {
            ShellType::Zsh => "zsh",
            ShellType::Bash => "bash",
            ShellType::Sh => "sh",
            ShellType::Powershell => "powershell.exe",
            ShellType::Cmd => "cmd.exe",
        }
    }
}

pub trait ShellTypeExt {
    fn to_shell_type(&self) -> ShellType;
}

impl ShellTypeExt for str {
    fn to_shell_type(&self) -> ShellType {
        match self {
            "zsh" => ShellType::Zsh,
            "bash" => ShellType::Bash,
            "sh" => ShellType::Sh,
            "powershell.exe" => ShellType::Powershell,
            "cmd.exe" => ShellType::Cmd,
            _ => ShellType::default(),
        }
    }
}
