// vimargs:
use server::ThreadPool;

use std::{
	fs,
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
	// thread,
	// time::Duration,
};

fn handle_connection(mut stream: TcpStream) {
	let buf_reader = BufReader::new(&mut stream);
	let request_line = buf_reader.lines().next().unwrap().unwrap();
		// let http_request: Vec<_> = buf_reader
		//     .lines()
		//     .map(|result| result.unwrap())
		//     .take_while(|line| !line.is_empty())
		//     .collect();
		// println!("Request: {:#?}", http_request);
		// let request_line = &http_request[0];
	println!("{}", &request_line);
	let (status_line, filename) = match &request_line[..] {
		"GET / HTTP/1.1" => ("HTTP/1.1 200 OK", "index.html"),
		"GET /demo HTTP/1.1" => ("HTTP/1.1 200 OK", "demo.html"),
		"GET /js/thirdparty/react.development.js HTTP/1.1" => ("HTTP/1.1 200 OK", "js/thirdparty/react.development.js"),
		"GET /js/thirdparty/react-dom.development.js HTTP/1.1" => ("HTTP/1.1 200 OK", "js/thirdparty/react-dom.development.js"),
		"GET /js/app.js HTTP/1.1" => ("HTTP/1.1 200 OK", "js/app.js"),
		"GET /css/thirdparty/pico.css HTTP/1.1" => ("HTTP/1.1 200 OK", "css/thirdparty/pico.css"),
		"GET /css/app.css HTTP/1.1" => ("HTTP/1.1 200 OK", "css/app.css"),
		_ => ("HTTP/1.1 404 NOT FOUND", "404.html"),
	};
	// TODO: resource dirs aren't on a whitelist basis
	// TODO: generate contents, not just file lookup
	let contents = fs::read_to_string(filename).unwrap();
	let length = contents.len();
	let response = format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}");
	stream.write_all(response.as_bytes()).unwrap();
}

fn main() {
	let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
	let pool = ThreadPool::new(4);
	for stream in listener.incoming() {
		let stream = stream.unwrap();
		pool.execute(|| handle_connection(stream));
	}
}
