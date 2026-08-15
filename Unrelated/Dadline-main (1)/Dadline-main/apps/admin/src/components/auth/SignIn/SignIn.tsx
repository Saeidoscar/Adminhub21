'use client'

import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignInForm from './SignInForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTheme from '@/utils/hooks/useTheme'
import type { OnSignIn } from './SignInForm'

const SignIn = ({ onSignIn }: { onSignIn?: OnSignIn }) => {
    const [message, setMessage] = useTimeOutMessage()
    const mode = useTheme((state) => state.mode)

    return (
        <div>
            <div className="mb-8">
                <Logo type="streamline" mode={mode} logoWidth={64} logoHeight={64} />
            </div>
            <div className="mb-8">
                <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                    دسترسی داخلی مدیران دادلاین
                </span>
                <h1 className="mb-3 text-3xl font-black text-gray-950 dark:text-white">ورود به پنل مدیریت</h1>
                <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">
                    این بخش فقط برای حساب دارای نقش مدیر سیستم فعال است و تمام درخواست‌ها با کانال امن اختصاصی پنل بررسی می‌شوند.
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-words">{message}</span>
                </Alert>
            )}
            <SignInForm setMessage={setMessage} onSignIn={onSignIn} />
            <p className="mt-6 text-center text-xs leading-6 text-gray-400">
                در صورت نداشتن دسترسی، با مدیر اصلی سامانه تماس بگیرید. ثبت‌نام عمومی در این پنل غیرفعال است.
            </p>
        </div>
    )
}

export default SignIn
