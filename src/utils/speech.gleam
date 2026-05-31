@external(javascript, "./speech_ffi.js", "play")
pub fn play(text: String, rate: Float) -> Nil

@external(javascript, "./speech_ffi.js", "pause_speech")
pub fn pause_speech() -> Nil

@external(javascript, "./speech_ffi.js", "resume_speech")
pub fn resume_speech() -> Nil

@external(javascript, "./speech_ffi.js", "stop")
pub fn stop() -> Nil

@external(javascript, "./load_content_vntq.js", "load_content_vntq")
pub fn load_content_vntq(callback: fn(String) -> Nil) -> Nil
