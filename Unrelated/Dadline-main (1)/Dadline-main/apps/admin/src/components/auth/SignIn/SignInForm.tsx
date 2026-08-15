'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'

export type OnSignInPayload = {
    values: SignInFormSchema
    setSubmitting: (isSubmitting: boolean) => void
    setMessage: (message: string) => void
}

export type OnSignIn = (payload: OnSignInPayload) => void

interface SignInFormProps extends CommonProps {
    setMessage: (message: string) => void
    onSignIn?: OnSignIn
}

type SignInFormSchema = {
    identifier: string
    password: string
}

const validationSchema = z.object({
    identifier: z.string().min(1, { message: 'ایمیل یا شماره موبایل مدیر را وارد کنید.' }),
    password: z.string().min(1, { message: 'رمز عبور را وارد کنید.' }),
})

const SignInForm = ({ className, setMessage, onSignIn }: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState(false)
    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: { identifier: '', password: '' },
        resolver: zodResolver(validationSchema),
    })

    const handleSignIn = (values: SignInFormSchema) => {
        onSignIn?.({ values, setSubmitting, setMessage })
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(handleSignIn)}>
                <FormItem label="ایمیل یا شماره موبایل" invalid={Boolean(errors.identifier)} errorMessage={errors.identifier?.message}>
                    <Controller
                        name="identifier"
                        control={control}
                        render={({ field }) => (
                            <Input
                                placeholder="admin@dadline.net یا 09..."
                                autoComplete="username"
                                inputMode="text"
                                dir="ltr"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <FormItem label="رمز عبور" invalid={Boolean(errors.password)} errorMessage={errors.password?.message}>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <PasswordInput
                                type="password"
                                placeholder="رمز عبور مدیر"
                                autoComplete="current-password"
                                dir="ltr"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <Button block loading={isSubmitting} variant="solid" type="submit" className="mt-3">
                    {isSubmitting ? 'در حال بررسی دسترسی...' : 'ورود امن به پنل'}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
