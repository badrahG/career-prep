import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'

// API mock
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { id: 1, email: 'test@example.com' } }),
    post: vi.fn(),
  },
  refreshCsrfToken: vi.fn(),
  clearCsrfToken: vi.fn(),
}))

// localStorage mock
beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// AuthContext-ийн утгыг харуулах туслах component
function AuthDisplay() {
  const { user, token } = useAuth()
  return (
    <div>
      <span data-testid="token">{token || 'none'}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
    </div>
  )
}

describe('AuthContext — inactivity timer', () => {
  it('token байхгүй бол timer эхлэхгүй', () => {
    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )
    expect(screen.getByTestId('token').textContent).toBe('none')
  })

  it('token байхад 15 минут дуусвал logout хийж redirect болно', async () => {
    // window.location.href mock
    const hrefSetter = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
      configurable: true,
    })

    localStorage.setItem('token', 'fake-token')

    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )

    // 15 минут өнгөрнө (ms)
    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000)
    })

    expect(localStorage.getItem('token')).toBeNull()
    expect(hrefSetter).toHaveBeenCalledWith('/login?reason=timeout')
  })

  it('үйлдэл хийхэд timer reset болно — 14 мин + үйлдэл + 14 мин = logout байхгүй', async () => {
    const hrefSetter = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
      configurable: true,
    })

    localStorage.setItem('token', 'fake-token')

    render(
      <AuthProvider>
        <AuthDisplay />
      </AuthProvider>
    )

    // 14 минут хүлээнэ
    await act(async () => {
      vi.advanceTimersByTime(14 * 60 * 1000)
    })

    // Үйлдэл хийнэ → timer reset болно
    await act(async () => {
      window.dispatchEvent(new MouseEvent('mousemove'))
    })

    // Дахин 14 минут хүлээнэ (нийт 28 мин, харин сүүлийн үйлдлээс 14 мин)
    await act(async () => {
      vi.advanceTimersByTime(14 * 60 * 1000)
    })

    // Logout байхгүй — timer reset болсон учир
    expect(hrefSetter).not.toHaveBeenCalled()
    expect(localStorage.getItem('token')).toBe('fake-token')
  })
})
