import { auth } from '@/auth'
import PostLoginLayout from '@/components/layouts/PostLoginLayout'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {
    const session = await auth()

    if (!session?.user.authority?.includes('admin')) {
        redirect('/sign-in')
    }

    return <PostLoginLayout>{children}</PostLoginLayout>
}

export default Layout
