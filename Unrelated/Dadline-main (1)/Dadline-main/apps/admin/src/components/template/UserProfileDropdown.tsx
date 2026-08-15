'use client'

import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import signOut from '@/server/actions/auth/handleSignOut'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import { PiShieldCheckDuotone, PiSignOutDuotone, PiUserDuotone } from 'react-icons/pi'

const _UserDropdown = () => {
    const { session } = useCurrentSession()
    const handleSignOut = async () => {
        await signOut()
    }

    const avatarProps = session?.user?.image
        ? { src: session.user.image }
        : { icon: <PiUserDuotone /> }

    return (
        <Dropdown
            className="flex"
            toggleClassName="flex items-center"
            renderTitle={
                <div className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="hidden text-left sm:block">
                        <div className="text-xs font-black text-gray-900 dark:text-white">
                            {session?.user?.name || 'مدیر دادلاین'}
                        </div>
                        <div className="mt-0.5 text-[10px] text-gray-500">مدیر سیستم</div>
                    </div>
                    <Avatar size={34} {...avatarProps} />
                </div>
            }
            placement="bottom-end"
        >
            <Dropdown.Item variant="header">
                <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar {...avatarProps} />
                    <div className="min-w-0">
                        <div className="truncate font-bold text-gray-900 dark:text-gray-100">
                            {session?.user?.name || 'مدیر دادلاین'}
                        </div>
                        <div className="truncate text-xs" dir="ltr">
                            {session?.user?.email || session?.user?.mobile}
                        </div>
                    </div>
                </div>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            <Dropdown.Item className="pointer-events-none gap-2 text-emerald-700 dark:text-emerald-300">
                <span className="text-xl"><PiShieldCheckDuotone /></span>
                <span>نشست امن مدیریتی</span>
            </Dropdown.Item>
            <Dropdown.Item variant="divider" />
            <Dropdown.Item eventKey="Sign Out" className="gap-2" onClick={handleSignOut}>
                <span className="text-xl"><PiSignOutDuotone /></span>
                <span>خروج امن</span>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)
export default UserDropdown
