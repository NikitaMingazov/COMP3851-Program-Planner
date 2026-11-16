import { useState, useEffect } from 'react';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'

import { auth } from './firebase/config'

// In-memory instead of DB for now
const users = {}

// return null if valid, error string otherwise
function checkPassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 64) return 'Password must be at most 64 characters.'
  if (/\s/.test(password)) return 'Password must not contain spaces.'
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one symbol.'
  return null
}

async function hashPassword(password) {
  // TODO: salt (use some library)
  const encoder = new TextEncoder();
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function Header() {
  return (
    <header className="app-header">
      <h1>Program Planner</h1>
      <nav>
        <a href="#">Login</a>
        <a href="#">Other</a>
      </nav>
    </header>
  );
}

function AuthForm({
  isRegistering,
  email, setEmail,
  username, setUsername,
  password, setPassword,
  passwordConfirm, setPasswordConfirm,
  error, loading, onSubmit, onSwitch
}) {
  return (
    <form className="login-register" onSubmit={onSubmit}>
      {isRegistering && (
        <label htmlFor="username">
          Username
          <input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            autoComplete="username"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            required
          />
        </label>
      )}
      <label htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="text"
          placeholder="c1234567@uon.edu.au"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          required
        />
      </label>
      <label htmlFor="password">
        Password
        <input
          id="password"
          name="password"
          type="password"
          placeholder="***"
          autoComplete={isRegistering ? 'new-password' : 'current-password'}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
        />
      </label>
      {isRegistering && (
        <label htmlFor="confirm-password">
          Confirm Password
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="***"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(ev) => setPasswordConfirm(ev.target.value)}
            required
          />
        </label>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Sign in'}
      </button>
      <p className="login-register-switch">
        {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
        <a
          href="#"
          onClick={(ev) => {
            ev.preventDefault();
            onSwitch();
          }}
        >
          {isRegistering ? 'Login' : 'Register'}
        </a>
      </p>
    </form>
  );
}

function Auth() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(ev) {
    ev.preventDefault()
    setError('')

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()

    if (isRegistering) {
      const passwordError = checkPassword(password)
      if (passwordError) {
        setError(passwordError)
        return
      }
      if (password !== passwordConfirm) {
        setError('Passwords do not match.')
        return
      }
      if (!trimmedUsername) {
        setError('Username is required.')
        return
      }
      if (users[trimmedUsername.toLowerCase()]) {
        setError('Username is already taken.')
        return
      }
    }

    setLoading(true)
    // Firebase authentication
    try {
      const hashedPassword = await hashPassword(password)
      if (isRegistering) {
        const key = trimmedUsername.toLowerCase()
        users[key] = {
           username: trimmedUsername,
           email: trimmedEmail,
        }
        try {
          await createUserWithEmailAndPassword(auth, trimmedEmail, hashedPassword)
        } catch (err) {
          // roll back if firebase returned an error
          delete users[key]
          throw err
        }
        await createUserWithEmailAndPassword(auth, trimmedEmail, hashedPassword)
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, hashedPassword)
      }
    } catch (err) {
      if (isRegistering) {
        if ('auth/invalid-email' === err.code) {
          setError('Invalid email address.')
        } else if ('auth/email-already-in-use' === err.code) {
          setError('Email address is already in use.')
        } else {
          // fall back to raw error message
          setError(err.message)
        }
      } else {
        if (['auth/invalid-login-credentials', 'auth/wrong-password'].includes(err.code)) {
          setError('Incorrect email or password. Please try again.')
        } else {
          setError(err.message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setIsRegistering((r) => !r)
    setError('')
  }

  return (
    <AuthForm
      isRegistering={isRegistering}     onSwitch={switchMode}
      username={username}               setUsername={setUsername}
      email={email}                     setEmail={setEmail}
      password={password}               setPassword={setPassword}
      passwordConfirm={passwordConfirm} setPasswordConfirm={setPasswordConfirm}
      error={error}
      loading={loading}
      onSubmit={handleSubmit}
    />
  )
}

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      // log out
      if (!authUser) {
        setUser(null)
        return
      }
      // log in, map email to username
      const found = Object.values(users).find((u) => u.email === authUser.email)
      setUser(found.username)
    })

    return unsubscribe
  }, [])

  return (
    <div className="app">
      <Header />
      {user ? (
        <>
          <h2>Hi {user}</h2>
          <button onClick={() => signOut(auth)}>
            Logout
          </button>
        </>
      ) : (
        <main className="main">
          <Auth />
        </main>
      )}
    </div>
  )
}

export default App
