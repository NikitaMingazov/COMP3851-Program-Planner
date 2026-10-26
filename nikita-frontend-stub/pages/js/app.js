
const e = React.createElement;

function Login() {
	return e('div', { className: 'login' },
		e("p", null, 'Username'),
		e("p", null, 'Password'),
	);
}

function App() {
	return Login();
}
