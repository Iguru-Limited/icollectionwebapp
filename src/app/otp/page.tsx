import { OTPForm } from "@/components/otp-form"

export default function OTPPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">
        <OTPForm />
      </div>
    </div>
  )
}
