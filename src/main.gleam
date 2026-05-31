import gleam/io
import lustre
import lustre/attribute.{attribute}
import lustre/effect.{type Effect}
import lustre/element

import components/actions/actions
import components/text_container/text_container
import components/wrapper/wrapper
import utils/speech

pub type Model {
  Model(status: Status, voice_rate: Int, text: String)
}

pub type Status {
  Idle
  Playing
  Paused
}

pub type Msg {
  Play
  Pause
  Stop
  UserTextChanged(String)
  LoadContent
  ContentLoaded(String)
}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
}

fn init(_) -> #(Model, Effect(Msg)) {
  #(Model(status: Idle, voice_rate: 10, text: ""), effect.none())
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    Play -> {
      speech.play(model.text, 1.0)
      #(Model(..model, status: Playing), effect.none())
    }
    Pause -> {
      case model.status {
        Playing -> {
          speech.pause_speech()
          #(Model(..model, status: Paused), effect.none())
        }
        Paused -> {
          speech.resume_speech()
          #(Model(..model, status: Playing), effect.none())
        }
        Idle -> #(model, effect.none())
      }
    }
    Stop -> {
      speech.stop()
      #(Model(..model, status: Idle), effect.none())
    }
    UserTextChanged(t) -> #(Model(..model, text: t), effect.none())
    LoadContent -> {
      io.println("LoadContent dispatched")
      let fx =
        effect.from(fn(dispatch) {
          io.println("effect.from running")
          speech.load_content_vntq(fn(text) { dispatch(ContentLoaded(text)) })
        })
      #(model, fx)
    }
    ContentLoaded(t) -> #(
      Model(..model, text: model.text <> "\n" <> t),
      effect.none(),
    )
  }
}

fn view(model: Model) -> element.Element(Msg) {
  wrapper.view([
    text_container.view(model.text, UserTextChanged),
    actions.view(LoadContent, Play, Pause, Stop),
  ])
}
