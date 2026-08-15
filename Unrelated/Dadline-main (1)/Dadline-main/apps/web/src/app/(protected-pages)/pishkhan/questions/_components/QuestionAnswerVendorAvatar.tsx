"use client"

import Avatar from "@/components/ui/Avatar"

type Props = {
  name: string
  avatarUrl?: string | null
}

const QuestionAnswerVendorAvatar = ({ name, avatarUrl }: Props) => (
  <Avatar
    size={48}
    src={avatarUrl ?? undefined}
    alt={name}
    className="shrink-0 bg-primary/10 font-black text-primary"
  >
    {name.trim().charAt(0) || "د"}
  </Avatar>
)

export default QuestionAnswerVendorAvatar
