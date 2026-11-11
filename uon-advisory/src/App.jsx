
import { useState, useEffect } from 'react'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth'

import { auth } from './firebase/config'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return unsubscribe
  }, [])

  // Handle login and registration
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        )
      }
    } catch (error) {
      setError(
        !isRegistering &&
          ['auth/invalid-credential', 'auth/wrong-password'].includes(error.code)
          ? 'Incorrect email or password. Please try again.'
          : error.message
      )
    } finally {
      setLoading(false)
    }
  }

  // Authenticated view
  if (user) {
    return (
      <main>
        <h1>UoN Program Advisory Tool</h1>
        <h2>Welcome!</h2>

        <p>Logged in as: {user.email}</p>

        <button onClick={() => signOut(auth)}>
          Logout
        </button>
      </main>
    )
  }

  // Login / Registration view
  return (
    <main>
      <h1>UoN Program Advisory Tool</h1>

      <h2>
        {isRegistering ? 'Create Account' : 'Student Login'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? 'Please wait...'
            : isRegistering
              ? 'Register'
              : 'Login'}
        </button>
      </form>

      <p>
        {isRegistering
          ? 'Already have an account?'
          : "Don't have an account?"}
      </p>

      <button
        onClick={() => {
          setIsRegistering(!isRegistering)
          setError('')
        }}
      >
        {isRegistering ? 'Login instead' : 'Create account'}
      </button>
    </main>
  )
}

export default App
