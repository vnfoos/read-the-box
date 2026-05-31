import gleam/list
import lustre/attribute
import lustre/element.{type Element, text}
import lustre/element/html
import utils/class_names.{type ClassName, FromString}

@external(javascript, "./style_bridge.js", "get_class_names")
fn get_class_names(name: String) -> String

fn add_class(names: List(ClassName)) -> attribute.Attribute(msg) {
  attribute.class(class_names.build(get_class_names, names))
}

pub fn view(children: List(Element(msg))) -> Element(msg) {
  html.div([add_class([FromString("block -dark")])], [
    html.div([add_class([FromString("wrapper")])], [
      html.div(
        [add_class([FromString("header")])],
        list.append(
          [
            html.h1([add_class([FromString("title")])], [
              text("Text To Speech Reader"),
            ]),
            html.h2([add_class([FromString("sub-title")])], [
              text("Auto spell check and read"),
            ]),
          ],
          children,
        ),
      ),
    ]),
  ])
}
