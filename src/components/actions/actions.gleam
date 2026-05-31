import lustre/attribute
import lustre/element.{type Element, text}
import lustre/element/html
import lustre/event
import saola/button_group
import utils/class_names.{type ClassName, FromString}

@external(javascript, "./style_bridge.js", "get_class_names")
fn get_class_names(name: String) -> String

fn add_class(names: List(ClassName)) -> attribute.Attribute(msg) {
  attribute.class(class_names.build(get_class_names, names))
}

pub type ActionsMsg {
  OnPlay
  OnPause
  OnStop
}

pub fn view(
  on_load: msg,
  on_play: msg,
  on_pause: msg,
  on_stop: msg,
) -> Element(msg) {
  html.div([add_class([FromString("block -dark")])], [
    button_group.button_group_full(
      [
        html.button(
          [
            attribute.type_("button"),
            event.on_click(on_load),
            add_class([FromString("button btn btn-outline")]),
          ],
          [text("📥 Load")],
        ),
        html.button(
          [
            attribute.type_("button"),
            event.on_click(on_play),
            add_class([FromString("button btn btn-outline")]),
          ],
          [
            text("▶ PLAY"),
          ],
        ),
        html.button(
          [
            attribute.type_("button"),
            event.on_click(on_pause),
            add_class([FromString("button btn btn-outline")]),
          ],
          [
            text("⏸ Pause"),
          ],
        ),
        html.button(
          [
            attribute.type_("button"),
            event.on_click(on_stop),
            add_class([FromString("button btn btn-outline")]),
          ],
          [
            text("⏹ Stop"),
          ],
        ),
      ],
      button_group.ButtonGroupAttrs(
        orientation: button_group.Vertical,
        class: class_names.build(get_class_names, [
          FromString("actions-group"),
        ]),
      ),
    ),
  ])
}
