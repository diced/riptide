pub mod discord {
  pub mod v1 {
    pub mod model {
      tonic::include_proto!("pylon.discord.v1.model");
    }
    pub mod cache {
      tonic::include_proto!("pylon.discord.v1.cache");
    }
    pub mod event {
      tonic::include_proto!("pylon.discord.v1.event");
    }
  }
}

pub mod gateway {
  pub mod v1 {
    pub mod service {
      tonic::include_proto!("pylon.gateway.v1.service");
    }
  }
}
