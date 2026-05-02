import * as React from "react"
import { Input } from "../components/ui/Input"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { useNavigate } from "react-router-dom"
import { useAppState } from "../state/AppStateProvider"

interface FormErrors {
  email?: string
  password?: string
  username?: string
  firstName?: string
  lastName?: string
  confirmPassword?: string
}

export function AuthPage() {
  const [isLogin, setIsLogin] = React.useState(true)
  const [username, setUsername] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { signIn, signUp } = useAppState()
  const navigate = useNavigate()

  const resetErrors = () => {
    setErrors({})
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    resetErrors()

    const nextErrors: FormErrors = {}
    if (!username.trim()) nextErrors.username = "Choose a username."
    if (!isLogin && firstName.trim().length < 2) nextErrors.firstName = "Enter your first name."
    if (!isLogin && lastName.trim().length < 2) nextErrors.lastName = "Enter your last name."
    if (!email.includes("@")) nextErrors.email = "Provide a valid email address."
    if (password.length < 8) nextErrors.password = "Use at least 8 characters."
    if (!isLogin && password !== confirmPassword) nextErrors.confirmPassword = "Passwords must match."

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      if (isLogin) {
        await signIn({ username, password })
      } else {
        await signUp({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          password,
        })
      }
      navigate("/home")
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null) {
        const maybeError = error as Record<string, unknown>
        if (typeof maybeError.detail === "string") {
          setSubmitError(maybeError.detail)
        } else if (Array.isArray(maybeError.non_field_errors)) {
          setSubmitError(String(maybeError.non_field_errors[0]))
        } else {
          const fieldError = Object.values(maybeError).find((value) => Array.isArray(value) && value.length > 0)
          if (typeof fieldError === "object" && fieldError !== null && Array.isArray(fieldError)) {
            setSubmitError(String(fieldError[0]))
          } else {
            setSubmitError("An unexpected error occurred. Please try again.")
          }
        }
      } else {
        setSubmitError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle>{isLogin ? "Welcome Back" : "Join the Academy"}</CardTitle>
          <p className="text-text-secondary text-sm">
            {isLogin ? "Enter your username and password to continue." : "Create an account to start playing."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last name"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={errors.lastName}
                  required
                />
              </div>
            )}
            <Input
              label={isLogin ? "Username or Email" : "Username"}
              type="text"
              placeholder={isLogin ? "Username or email" : "Username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={errors.username}
              required
            />
            {!isLogin && (
              <Input
                label="Email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />
            )}
            <Input
              label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            {!isLogin && (
              <Input
                label="Confirm password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required
              />
            )}
            {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isLogin ? "Sign In" : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-text-secondary">{isLogin ? "Don’t have an account? " : "Already have an account? "}</span>
            <button
              type="button"
              onClick={() => {
                resetErrors()
                setIsLogin(!isLogin)
              }}
              className="text-primary font-medium hover:underline focus:outline-none"
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
