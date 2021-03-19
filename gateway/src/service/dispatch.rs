use std::{pin::Pin, sync::Arc};

use crate::{
  model::create_event,
  protobuf::{
    discord::v1::event::{EventEnvelope, EventEnvelopeAck},
    gateway::v1::service::gateway_dispatch_streaming_server::GatewayDispatchStreaming,
  },
};
use futures::Stream;
use log::info;
use tokio::sync::{broadcast::Receiver, mpsc::channel, Mutex};
use tokio_stream::wrappers::ReceiverStream;
use tonic::{Response, Status};
use twilight_gateway::Event;

#[derive(Debug)]
pub struct GatewayDispatchService {
  event_rx: Arc<Mutex<Receiver<Event>>>,
}

impl GatewayDispatchService {
  pub fn new(rx: Receiver<Event>) -> Self {
    Self {
      event_rx: Arc::new(Mutex::new(rx)),
    }
  }
}

#[tonic::async_trait]
impl GatewayDispatchStreaming for GatewayDispatchService {
  type EventStream =
    Pin<Box<dyn Stream<Item = Result<EventEnvelope, tonic::Status>> + Send + Sync + 'static>>;
  // type EventStream = tokio_stream::wrappers::ReceiverStream<Result<EventEnvelope, tonic::Status>>;

  async fn event(
    &self,
    _request: tonic::Request<tonic::Streaming<EventEnvelopeAck>>,
  ) -> Result<Response<Self::EventStream>, Status> {
    info!("client listening");

    let (tx, rx) = channel::<Result<EventEnvelope, Status>>(1000000);

    let lock = self.event_rx.clone();
    tokio::spawn(async move {
      let mut event_rx = lock.lock().await;
      loop {
        #[allow(irrefutable_let_patterns)]
        if let (event) = event_rx.recv().await.unwrap() {
          match event {
            Event::MessageCreate(_)
            | Event::InteractionCreate(_)
            | Event::VoiceServerUpdate(_)
            | Event::VoiceStateUpdate(_) => {
              tx.send(Ok(create_event(event.clone()).unwrap())).await.unwrap();
              info!("sending {:?}", event.kind());
            }
            _ => {}
          }
        }
      }
    });

    Ok(Response::new(Box::pin(ReceiverStream::new(rx))))
    // Ok(Response::new(RecieverStream::new(rx)))
  }
}
