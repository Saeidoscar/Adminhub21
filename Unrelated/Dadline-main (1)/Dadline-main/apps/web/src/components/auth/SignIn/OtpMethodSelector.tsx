import Button from "@/components/ui/Button"
import { TbMessage2Cog, TbPhoneCalling } from "react-icons/tb"
import type { OtpSignInType } from "./OtpSignIn"

type OtpMethodSelectorProps = {
  isSending: boolean
  onSelect: (channel: OtpSignInType) => void
}

const OtpMethodSelector = ({ isSending, onSelect }: OtpMethodSelectorProps) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <Button
      type="button"
      loading={isSending}
      disabled={isSending}
      onClick={() => onSelect("sms")}
    >
      <span className="flex items-center justify-center gap-2">
        <TbMessage2Cog size={17} />
        رمز یکبار مصرف
      </span>
    </Button>
    <Button
      type="button"
      loading={isSending}
      disabled={isSending}
      onClick={() => onSelect("call")}
    >
      <span className="flex items-center justify-center gap-2">
        <TbPhoneCalling size={17} />
        ورود با تماس
      </span>
    </Button>
  </div>
)

export default OtpMethodSelector
