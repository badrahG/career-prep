import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// AuthContext mock
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}))

// API mock
vi.mock('../services/api', () => ({
  default: { post: vi.fn() },
}))

function renderLogin(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/login${search}`]}>
      <Login />
    </MemoryRouter>
  )
}

describe('Login хуудас', () => {
  it('нэвтрэх форм харагдана', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument()
    expect(screen.getByText('Нэвтрэх →')).toBeInTheDocument()
  })

  it('?reason=timeout байхад amber banner харагдана', () => {
    renderLogin('?reason=timeout')
    expect(
      screen.getByText(/15 минут идэвхгүй байсан тул автоматаар гарлаа/i)
    ).toBeInTheDocument()
  })

  it('reason байхгүй бол banner харагдахгүй', () => {
    renderLogin()
    expect(
      screen.queryByText(/идэвхгүй байсан тул/i)
    ).not.toBeInTheDocument()
  })

  it('reason=other байхад banner харагдахгүй', () => {
    renderLogin('?reason=other')
    expect(
      screen.queryByText(/идэвхгүй байсан тул/i)
    ).not.toBeInTheDocument()
  })
})
