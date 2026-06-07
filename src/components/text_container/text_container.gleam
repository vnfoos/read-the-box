import gleam/option.{Some}
import lustre/element.{type Element}
import saola/textarea.{TextareaExtraAttrs, textarea_full}
import utils/class_names.{FromString}

@external(javascript, "./style_bridge.js", "get_class_names")
fn get_class_names(name: String) -> String

pub fn view(value: String, on_change: fn(String) -> msg) -> Element(msg) {
  let hashed_class = class_names.build(get_class_names, [FromString("block")])

  element.fragment([
    textarea_full(
      Some(textarea.SyncValue(value)),
      on_input: Some(on_change),
      extra_attrs: TextareaExtraAttrs(
        "",
        "bio",
        "Load content from Source tab",
        Some(4),
        False,
        False,
        hashed_class,
      ),
    ),
  ])
}
