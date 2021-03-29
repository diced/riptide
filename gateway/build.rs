use std::path::Path;

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let path = match Path::new("protobuf").exists() {
    true => "protobuf",
    false => "../protobuf"
  };

  tonic_build::configure().compile(
    &[
      "discord/v1/model.proto",
      "discord/v1/cache.proto",
      "discord/v1/event.proto",
      "discord/v1/gateway.proto"
    ],
    &[path]
  )?;

  tonic_build::configure().compile(
    &[
      "gateway/v1/cache_service.proto",
      "gateway/v1/dispatch_service.proto",
      "gateway/v1/gateway_service.proto"
    ],
    &[path]
  )?;
  Ok(())
}


