
const e = React.createElement;

function Header() {
	return e('header', { className: 'app-header' },
		e('h1', null, 'Program Planner'),
		e('nav', null,
			e('a', { href: '#' }, 'Login'),
			e('a', { href: '#' }, 'Other'),
		)
	);
}

function Register({ loginSwitch }) {
	return e('form', { className: 'login-register', onSubmit: (ev) => {
				ev.preventDefault();
				alert(ev.target.elements.email.value)
			} },
		e('label', { htmlFor: 'email' }, 'Email',
			e('input', { id: 'email', name: 'email', type: 'text', placeholder: 'c1234567@uon.edu.au', autoComplete: 'email' })
		),
		e('label', { htmlFor: 'password' }, 'Password',
			e('input', { id: 'password', name: 'password', type: 'password', placeholder: '***', autoComplete: 'current-password' })
		),
		e('label', { htmlFor: 'confirm-password' }, 'Confirm Password',
			e('input', { id: 'confirm-password', name: 'confirm-password', type: 'password', placeholder: '***', autoComplete: 'current-password' })
		),
		e('button', { type: 'submit' }, 'Sign in'),
		e('p', { className: 'login-register-switch' },
			"Already have an account? ",
			e('a', { href: '#', onClick: (ev) => {
				ev.preventDefault();
				loginSwitch()
			} }, 'Login')
		)
	);
}

function Login({ registerSwitch }) {
	return e('form', { className: 'login-register', onSubmit: (ev) => {
				ev.preventDefault();
				alert(ev.target.elements.email.value)
			} },
		e('label', { htmlFor: 'email' }, 'Email',
			e('input', { id: 'email', name: 'email', type: 'text', placeholder: 'c1234567@uon.edu.au', autoComplete: 'email' })
		),
		e('label', { htmlFor: 'password' }, 'Password',
			e('input', { id: 'password', name: 'password', type: 'password', placeholder: '***', autoComplete: 'current-password' })
		),
		e('button', { type: 'submit' }, 'Sign in'),
		e('p', { className: 'login-register-switch' },
			"Don't have an account? ",
			e('a', { href: '#', onClick: (ev) => {
				ev.preventDefault();
				registerSwitch()
			} }, 'Register')
		)
	);
}

function App() {
	const [view, setView] = React.useState('login');
	return e('div', { className: 'app' },
		e(Header),
		e('main', { className: 'main' },
			view === 'login'
			? e(Login, { registerSwitch: () => setView('register') })
			: e(Register, { loginSwitch: () => setView('login') })
		)
	);
}
