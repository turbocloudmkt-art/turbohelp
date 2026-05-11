'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { UserRole } from '@prisma/client'

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: 'Admin',
  EDITOR: 'Editor',
  WRITER: 'Editor',
  VIEWER: 'Usuário',
}

export function UserMenu({ user }: { user: { name: string; role: UserRole } }) {
  const canAccessAdmin = user.role !== 'VIEWER'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {user.name}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {roleLabel[user.role]}
        </span>
      </div>

      {canAccessAdmin && (
        <Link
          href="/admin"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            padding: '7px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
          }}
        >
          Painel
        </Link>
      )}

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          fontSize: '13px',
          fontWeight: 600,
          padding: '7px 12px',
          borderRadius: '6px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
      >
        Sair
      </button>
    </div>
  )
}
