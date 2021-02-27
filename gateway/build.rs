fn main() -> Result<(), Box<dyn std::error::Error>> {
  tonic_build::configure().compile(
    &["discord/v1/model.proto", "discord/v1/cache.proto"],
    &["pylon-gateway-protobuf"],
  )?;

  tonic_build::configure().compile(
    &["gateway/v1/cache_service.proto"],
    &["pylon-gateway-protobuf"],
  )?;
  Ok(())
}
