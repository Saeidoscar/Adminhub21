'use client'

import Logo from '@/components/template/Logo'
import Alert from '@/components/ui/Alert'
import SignUpForm from './SignUpForm'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import useTheme from '@/utils/hooks/useTheme'
import type { OnSignUp } from './SignUpForm'

type SignUpProps = {
    signInUrl?: string
    onSignUp?: OnSignUp
}

export const SignUp = ({ onSignUp, signInUrl = '/sign-in' }: SignUpProps) => {
    const [message, setMessage] = useTimeOutMessage()

    const mode = useTheme((state) => state.mode)

    return (
        <>
            <div className="mb-8">
                <Logo
                    type="streamline"
                    mode={mode}
                    logoWidth={60}
                    logoHeight={60}
                />
            </div>
            <div className="mb-8">
                <h3 className="mb-1">ثبت نام</h3>
                <p className="font-semibold heading-text">
                    بیایید ثبت‌نام را شروع کنیم و از نسخه آزمایشی رایگان استفاده کنید
                </p>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <SignUpForm onSignUp={onSignUp} setMessage={setMessage} />
            <div>
                <div className="mt-6 text-center">
                    <span>قبلاً حساب کاربری دارید؟ </span>
                    <ActionLink
                        href={signInUrl}
                        className="heading-text font-bold"
                        themeColor={false}
                    >
                        ورود
                    </ActionLink>
                </div>
            </div>
        </>
    )
}

export default SignUp
