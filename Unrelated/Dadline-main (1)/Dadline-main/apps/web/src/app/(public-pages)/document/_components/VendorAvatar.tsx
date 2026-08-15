"use client"

import Avatar from "@/components/ui/Avatar"

type Props = {
  name: string
  avatarUrl?: string | null
  size: number
  shape?: "circle" | "round" | "square"
  className?: string
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("") || "د"

const VendorAvatar = ({
  name,
  avatarUrl,
  size,
  shape = "round",
  className,
}: Props) => (
  <Avatar
    src={avatarUrl ?? undefined}
    alt={name}
    size={size}
    shape={shape}
    className={className}
  >
    {getInitials(name)}
  </Avatar>
)

export default VendorAvatar
