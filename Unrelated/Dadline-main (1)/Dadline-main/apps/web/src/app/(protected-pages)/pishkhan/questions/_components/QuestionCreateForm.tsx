"use client"

import type { DashboardQuestionMeta } from "@/@types/dashboardQuestions"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Switcher from "@/components/ui/Switcher"
import { Form, FormItem } from "@/components/ui/Form"
import { createDashboardQuestion } from "@/server/actions/dashboard-questions/mutateDashboardQuestions"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { TbCoin, TbLock, TbSend, TbWorld } from "react-icons/tb"
import { z } from "zod"
import { formatQuestionPrice } from "./question-ui"

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(8, "عنوان سؤال باید حداقل ۸ کاراکتر باشد.")
    .max(180),
  categoryId: z.number().int().positive("دسته‌بندی سؤال را انتخاب کنید."),
  body: z
    .string()
    .trim()
    .min(30, "متن سؤال باید حداقل ۳۰ کاراکتر باشد.")
    .max(10000),
  isPrivate: z.boolean(),
})

type FormValues = z.infer<typeof schema>
type CategoryOption = { value: number label: string }

type Props = {
  meta: DashboardQuestionMeta
  onCreated?: () => void
}

const QuestionCreateForm = ({ meta, onCreated }: Props) => {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      categoryId: 0,
      body: "",
      isPrivate: false,
    },
  })

  const isPrivate = form.watch("isPrivate")
  const price = isPrivate ? meta.pricing.privatePrice : meta.pricing.publicPrice
  const insufficientBalance = meta.walletBalance < price
  const categoryOptions: CategoryOption[] = meta.categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  const submit = form.handleSubmit(async (values) => {
    form.clearErrors("root")
    const result = await createDashboardQuestion(values)

    if (!result.ok || !result.data) {
      form.setError("root", {
        message: result.error ?? "ثبت سؤال انجام نشد.",
      })
      return
    }

    form.reset()
    onCreated?.()
    router.push(`/pishkhan/questions/${result.data.uuid}`)
    router.refresh()
  })

  return (
    <Form className="space-y-5" onSubmit={submit}>
      <FormItem
        label="عنوان سؤال"
        asterisk
        invalid={Boolean(form.formState.errors.title)}
        errorMessage={form.formState.errors.title?.message}
      >
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Input
              {...field}
              maxLength={180}
              placeholder="موضوع مسئله حقوقی را کوتاه و دقیق بنویسید"
            />
          )}
        />
      </FormItem>

      <FormItem
        label="دسته‌بندی حقوقی"
        asterisk
        invalid={Boolean(form.formState.errors.categoryId)}
        errorMessage={form.formState.errors.categoryId?.message}
      >
        <Controller
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <Select<CategoryOption>
              instanceId="question-category"
              isSearchable
              placeholder="دسته‌بندی مرتبط را انتخاب کنید"
              options={categoryOptions}
              value={
                categoryOptions.find(
                  (option) => option.value === field.value,
                ) ?? null
              }
              onChange={(option) => field.onChange(option?.value ?? 0)}
              onBlur={field.onBlur}
            />
          )}
        />
        <p className="mt-2 text-xs leading-6 text-gray-500">
          سؤال فقط برای وکلا و کارشناسانی نمایش داده می‌شود که این دسته‌بندی را در
          تخصص‌های خود دارند.
        </p>
      </FormItem>

      <FormItem
        label="متن سؤال"
        asterisk
        invalid={Boolean(form.formState.errors.body)}
        errorMessage={form.formState.errors.body?.message}
      >
        <Controller
          name="body"
          control={form.control}
          render={({ field }) => (
            <Input
              {...field}
              textArea
              rows={8}
              maxLength={10000}
              placeholder="شرح ماجرا، تاریخ‌ها و جزئیات لازم برای پاسخ دقیق را وارد کنید..."
            />
          )}
        />
      </FormItem>

      <Controller
        name="isPrivate"
        control={form.control}
        render={({ field }) => (
          <div
            className={`rounded-2xl border p-4 transition ${
              field.value
                ? "border-violet-200 bg-violet-50/70 dark:border-violet-800 dark:bg-violet-950/20"
                : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span
                  className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                    field.value
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200"
                  }`}
                >
                  {field.value ? <TbLock /> : <TbWorld />}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {field.value ? "سؤال خصوصی" : "سؤال عمومی"}
                  </h3>
                  <p className="mt-1 text-xs leading-6 text-gray-600 dark:text-gray-300">
                    {field.value
                      ? "این سؤال در سایت منتشر و در گوگل ایندکس نمی‌شود؛ فقط شما و ارائه‌دهندگان مرتبط آن را می‌بینید."
                      : "این سؤال پس از ثبت در بخش عمومی سایت قابل مشاهده و ایندکس در موتورهای جست‌وجو خواهد بود."}
                  </p>
                </div>
              </div>
              <Switcher
                checked={field.value}
                onChange={(checked) => field.onChange(checked)}
                aria-label="خصوصی بودن سؤال"
              />
            </div>
          </div>
        )}
      />

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary">
              <TbCoin />
            </span>
            <div>
              <p className="text-xs text-gray-500">هزینه ثبت این سؤال</p>
              <p className="mt-1 text-lg font-black text-gray-900 dark:text-white">
                {formatQuestionPrice(price)}
              </p>
            </div>
          </div>
          <div className="text-left text-xs text-gray-500">
            <p>موجودی کیف پول</p>
            <p
              className={`mt-1 font-bold ${
                insufficientBalance ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {formatQuestionPrice(meta.walletBalance)}
            </p>
          </div>
        </div>
        {isPrivate && (
          <p className="mt-3 border-t border-gray-200 pt-3 text-xs leading-6 text-gray-500 dark:border-gray-700">
            هزینه سؤال خصوصی شامل{" "}
            {meta.pricing.privateSurchargePercent.toLocaleString("fa-IR")}٪ مبلغ
            اضافه نسبت به سؤال عمومی است.
          </p>
        )}
      </div>

      {insufficientBalance && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-7 text-red-700 dark:bg-red-950/40 dark:text-red-200">
          موجودی کیف پول برای ثبت این سؤال کافی نیست. ابتدا از بخش{" "}
          <Link
            href="/pishkhan/wallet"
            className="font-bold underline underline-offset-4"
          >
            کیف پول
          </Link>{" "}
          حساب خود را شارژ کنید.
        </div>
      )}

      {form.formState.errors.root?.message && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {form.formState.errors.root.message}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="solid"
          loading={form.formState.isSubmitting}
          disabled={insufficientBalance}
          icon={<TbSend />}
        >
          ثبت سؤال و پرداخت
        </Button>
      </div>
    </Form>
  )
}

export default QuestionCreateForm
