import { CredentialsSignin } from "next-auth"

export class OtpError extends CredentialsSignin {
  code = "otp_error"

  constructor(message = "کد تایید صحیح نیست.") {
    super()
    this.message = message
  }
}
