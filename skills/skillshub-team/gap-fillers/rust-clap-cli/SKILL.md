# Rust CLI with Clap

Use when building CLI tools in Rust with clap (v4+).

## Setup
```toml
# Cargo.toml
[dependencies]
clap = { version = "4", features = ["derive"] }
tokio = { version = "1", features = ["full"] }  # if async needed
anyhow = "1"
```

## Derive API (Preferred)
```rust
use clap::{Parser, Subcommand, Args, ValueEnum};

#[derive(Parser)]
#[command(name = "mytool", version, about = "My awesome CLI tool")]
struct Cli {
    /// Enable verbose output
    #[arg(short, long, action = clap::ArgAction::Count)]
    verbose: u8,

    /// Config file path
    #[arg(short, long, default_value = "config.toml")]
    config: String,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new project
    Init {
        /// Project name
        name: String,
        /// Template to use
        #[arg(short, long, value_enum, default_value_t = Template::Default)]
        template: Template,
    },
    /// Run the server
    Serve(ServeArgs),
    /// Build the project
    Build {
        /// Enable release mode
        #[arg(long)]
        release: bool,
    },
}

#[derive(Args)]
struct ServeArgs {
    /// Port to listen on
    #[arg(short, long, default_value_t = 8080)]
    port: u16,
    /// Host to bind
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
}

#[derive(Clone, ValueEnum)]
enum Template {
    Default,
    Minimal,
    Full,
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Init { name, template } => {
            println!("Creating project: {name}");
        }
        Commands::Serve(args) => {
            println!("Serving on {}:{}", args.host, args.port);
        }
        Commands::Build { release } => {
            println!("Building (release={})", release);
        }
    }
    Ok(())
}
```

## Key Patterns

### Async CLI with Tokio
```rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    // async operations here
    Ok(())
}
```

### Environment Variable Fallback
```rust
#[arg(long, env = "MY_API_KEY")]
api_key: Option<String>,
```

### Stdin/File Input
```rust
#[arg(default_value = "-")]
input: String, // "-" means stdin
```

### Progress Bars (indicatif)
```rust
use indicatif::{ProgressBar, ProgressStyle};
let pb = ProgressBar::new(100);
pb.set_style(ProgressStyle::with_template("{bar:40.cyan/blue} {pos}/{len}")?);
```

### Colored Output (colored)
```rust
use colored::Colorize;
eprintln!("{} Something went wrong", "error:".red().bold());
```

## Best Practices
- Use `#[command(version, about)]` — pulls from Cargo.toml automatically
- Use `anyhow::Result` for error handling in CLI apps
- Write integration tests with `assert_cmd` and `predicates`
- Use `#[arg(value_parser)]` for custom validation
- Add shell completions: `clap_complete` crate