use std::process::Command;

#[derive(Debug)]
pub enum ShellType {
    Zsh,
    Bash,
    Sh,
}

impl ShellType {
    pub fn to_str(&self) -> &str {
        match self {
            ShellType::Zsh => "zsh",
            ShellType::Bash => "bash",
            ShellType::Sh => "sh",
        }
    }

    fn to_cmd(&self) -> Command {
        let mut cmd = Command::new(self.to_str());
        cmd.arg("-l");
        cmd
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
            _ => ShellType::Bash,
        }
    }
}
