use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let path = match Path::new("protobuf").exists() {
    true => "protobuf",
    false => "../protobuf"
  };

  tonic_build::configure().compile(
    &["discord/v1/model.proto", "discord/v1/cache.proto"],
    &[path],
  )?;

  tonic_build::configure().compile(
    &["gateway/v1/cache_service.proto"],
    &[path],
  )?;
  Ok(())
}
