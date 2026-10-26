use::std::thread;
use::std::sync::{mpsc, Arc, Mutex};

struct Slave {
	thread: Option<thread::JoinHandle<()>>,
	// id: u8,
}

impl Slave {
	fn new(receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Self {
		// panicking on startup is probably fine
		// let thread = thread::Builder::new();
		Self { thread: Some(thread::spawn(move || loop {
			let message = receiver.lock().unwrap().recv();
			match message {
				Ok(job) => job(),
				Err(_) => break,
			}
		}))}
	}
}

type Job = Box<dyn FnOnce() + Send + 'static>;

pub struct ThreadPool {
	slaves: Vec<Slave>,
	sender: Option<mpsc::Sender<Job>>,
}

impl ThreadPool {
	/// Create a new ThreadPool.
	///
	/// The size is the number of threads in the pool.
	///
	/// # Panics
	///
	/// The `new` function will panic if the size is zero.
    pub fn new(num_threads: usize) -> ThreadPool {
		assert!(num_threads > 0);
		let (sender, receiver) = mpsc::channel();
		let receiver = Arc::new(Mutex::new(receiver));
		let mut slaves = Vec::with_capacity(num_threads);
		for _ in 0..num_threads {
			slaves.push(Slave::new(Arc::clone(&receiver)));
		}
		let sender = Some(sender);
		ThreadPool { slaves, sender }
	}
	pub fn execute<F>(&self, f: F)
		where
			F: FnOnce() + Send + 'static,
	{
		let job = Box::new(f);
		self.sender.as_ref().unwrap().send(job).unwrap();
	}
}

impl Drop for ThreadPool {
	fn drop(&mut self) {
		drop(self.sender.take());

		for slave in &mut self.slaves {
			if let Some(thread) = slave.thread.take() {
				thread.join().unwrap();
			}
		}
	}
}
