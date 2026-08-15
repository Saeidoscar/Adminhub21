'use client'

import { useState } from 'react'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import ActionLink from '@/components/shared/ActionLink'
import ResetPasswordForm from './ResetPasswordForm'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useRouter } from 'next/navigation'
import type { OnResetPasswordSubmit } from './ResetPasswordForm'

type ResetPasswordProps = {
    signInUrl?: string
    onResetPasswordSubmit?: OnResetPasswordSubmit
}

export const ResetPassword = ({
    signInUrl = '/sign-in',
    onResetPasswordSubmit,
}: ResetPasswordProps) => {
    const [resetComplete, setResetComplete] = useState(false)

    const [message, setMessage] = useTimeOutMessage()

    const router = useRouter()

    const handleContinue = () => {
        router.push(signInUrl)
    }

    return (
        <div>
            <div className="mb-6">
                {resetComplete ? (
                    <>
                        <h3 className="mb-1">بازنشانی انجام شد</h3>
                        <p className="font-semibold heading-text">
                            رمز عبور شما با موفقیت بازنشانی شد.
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-1">تنظیم رمز عبور جدید</h3>
                        <p className="font-semibold heading-text">
                            رمز عبور جدید شما باید با رمز قبلی متفاوت باشد.
                        </p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <ResetPasswordForm
                resetComplete={resetComplete}
                setMessage={setMessage}
                setResetComplete={setResetComplete}
                onResetPasswordSubmit={onResetPasswordSubmit}
            >
                <Button
                    block
                    variant="solid"
                    type="button"
                    onClick={handleContinue}
                >
                    ادامه
                </Button>
            </ResetPasswordForm>
            <div className="mt-4 text-center">
                <span>بازگشت به </span>
                <ActionLink
                    href={signInUrl}
                    className="heading-text font-bold"
                    themeColor={false}
                >
                    ورود
                </ActionLink>
            </div>
        </div>
    )
}

export default ResetPassword
