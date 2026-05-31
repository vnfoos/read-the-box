import gleam/dict.{type Dict}
import gleam/list
import gleam/string

pub type ClassName {
  FromString(String)
  FromList(List(String))
  FromDict(Dict(String, Bool))
}

pub fn build(
  get_class: fn(String) -> String,
  class_names: List(ClassName),
) -> String {
  class_names
  |> list.flat_map(fn(class_name) {
    case class_name {
      FromString(value) -> string.split(value, " ")

      FromList(values) -> values

      FromDict(conditions) ->
        dict.to_list(conditions)
        |> list.filter_map(fn(pair) {
          let #(name, is_active) = pair
          case is_active {
            True -> Ok(name)
            False -> Error(Nil)
          }
        })
    }
  })
  |> list.map(get_class)
  |> string.join(" ")
}
